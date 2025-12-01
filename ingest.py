import os
import time
import pypdf
import google.generativeai as genai
from pinecone import Pinecone
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# ==========================================
# ⚙️ CONFIGURATION (EDIT THIS SECTION)
# ==========================================

# 1. Your Keys (loaded from .env file)
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")

# Validate that keys are set
if not GOOGLE_API_KEY or not PINECONE_API_KEY:
    raise ValueError("❌ Missing API keys! Create a .env file with GOOGLE_API_KEY and PINECONE_API_KEY")

# 2. Pinecone Settings
INDEX_NAME = "1337-chat"  # Must match the name you created on the website
NAMESPACE = "ns1"         # Optional: Keeps things organized (default is fine)

# 3. Chunking Settings
CHUNK_SIZE = 500          # How many characters per flashcard
CHUNK_OVERLAP = 50        # How much previous text to keep (context)

# 4. Folder to scan
DATA_FOLDER = "data"

# ==========================================
# 🛠️ SETUP
# ==========================================

# Initialize Google AI
genai.configure(api_key=GOOGLE_API_KEY)

# Initialize Pinecone
pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(INDEX_NAME)

# ==========================================
# 🧠 HELPER FUNCTIONS
# ==========================================

def get_embedding(text):
    """
    Sends text to Google's 'Mathematician' (text-embedding-004).
    Returns a list of 768 numbers.
    """
    try:
        result = genai.embed_content(
            model="models/text-embedding-004",
            content=text,
            task_type="retrieval_document"
        )
        return result['embedding']
    except Exception as e:
        print(f"   ❌ Error getting embedding: {e}")
        return None

def parse_pdf(file_path):
    """Extracts raw text from a PDF."""
    text = ""
    try:
        reader = pypdf.PdfReader(file_path)
        for page in reader.pages:
            text += page.extract_text() + "\n"
    except Exception as e:
        print(f"   ❌ Error reading PDF: {e}")
    return text

def parse_text(file_path):
    """Extracts raw text from .txt or .md files."""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        print(f"   ❌ Error reading text file: {e}")
        return ""

def chunk_text(text, size, overlap):
    """Cuts the long text into overlapping strips."""
    chunks = []
    start = 0
    while start < len(text):
        end = start + size
        chunks.append(text[start:end])
        start += (size - overlap)
    return chunks

def sanitize_text(text):
    """
    Replace problematic Unicode characters with ASCII equivalents.
    This fixes Pinecone's Latin-1 encoding issues.
    """
    replacements = {
        '\u2019': "'",   # Right single quote
        '\u2018': "'",   # Left single quote
        '\u201c': '"',   # Left double quote
        '\u201d': '"',   # Right double quote
        '\u2013': '-',   # En dash
        '\u2014': '--',  # Em dash
        '\u2026': '...', # Ellipsis
        '\u00a0': ' ',   # Non-breaking space
        '\u200b': '',    # Zero-width space
        '\u00e2': 'a',   # â
        '\u20ac': 'EUR', # Euro sign
        '\u00e9': 'e',   # é
        '\u00e8': 'e',   # è
        '\u00e0': 'a',   # à
        '\u00f1': 'n',   # ñ
    }
    
    for old, new in replacements.items():
        text = text.replace(old, new)
    
    # Remove any remaining non-ASCII characters
    text = text.encode('ascii', 'ignore').decode('ascii')
    return text

# ==========================================
# 🚀 MAIN EXECUTION
# ==========================================

def main():
    print(f"--- 🚀 STARTING INGESTION TO INDEX: {INDEX_NAME} ---")

    # 1. Check if data folder exists
    if not os.path.exists(DATA_FOLDER):
        print(f"❌ Error: Folder '{DATA_FOLDER}' not found.")
        print("   -> Create a folder named 'data' and put your PDFs inside.")
        return

    # 2. Find files
    files = [f for f in os.listdir(DATA_FOLDER) if f.endswith(('.pdf', '.txt', '.md'))]
    if not files:
        print("❌ No PDF, TXT, or MD files found in 'data/' folder.")
        return
    
    print(f"📂 Found {len(files)} files. Preparing to process...")
    total_vectors = 0

    # 3. Process each file
    for filename in files:
        file_path = os.path.join(DATA_FOLDER, filename)
        print(f"\nProcessing: {filename}...")

        # A. EXTRACT TEXT
        if filename.endswith(".pdf"):
            raw_text = parse_pdf(file_path)
        else:
            raw_text = parse_text(file_path)
        
        # Clean up whitespace (tabs, double spaces)
        clean_text = " ".join(raw_text.split())
        
        # Sanitize text to remove problematic Unicode characters
        clean_text = sanitize_text(clean_text)
        
        if not clean_text:
            print("   ⚠️ Skipped: File is empty or couldn't be read.")
            continue

        # B. CHUNK TEXT
        chunks = chunk_text(clean_text, CHUNK_SIZE, CHUNK_OVERLAP)
        print(f"   -> Created {len(chunks)} chunks (Flashcards).")

        # C. EMBED & PREPARE UPLOAD
        vectors_to_upload = []
        
        print("   -> Generating Embeddings (Talking to Google)...")
        for i, chunk in enumerate(chunks):
            
            # 1. Get the Math (The Vector)
            vector_values = get_embedding(chunk)
            
            if vector_values:
                # 2. Pack the Math + The English (Metadata)
                vector_data = {
                    "id": f"{filename}_{i}",          # Unique ID
                    "values": vector_values,          # The Numbers (for Search)
                    "metadata": {
                        "text": chunk,                # The English (for Reading)
                        "source": filename            # Source file name
                    }
                }
                vectors_to_upload.append(vector_data)
                
                # Slow down slightly to be nice to Google API free tier
                time.sleep(0.3)
        
        # D. UPLOAD TO PINECONE
        if vectors_to_upload:
            try:
                print(f"   -> Uploading {len(vectors_to_upload)} vectors to Pinecone Cloud...")
                index.upsert(vectors=vectors_to_upload, namespace=NAMESPACE)
                total_vectors += len(vectors_to_upload)
                print("   ✅ Success!")
            except Exception as e:
                print(f"   ❌ Upload failed: {e}")

    print("\n" + "="*50)
    print(f"🎉 MISSION COMPLETE!")
    print(f"📊 Total Vectors Stored: {total_vectors}")
    print("="*50)

if __name__ == "__main__":
    main()