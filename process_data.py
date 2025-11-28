import os
import pypdf

# CONFIGURATION
DATA_FOLDER = "data"
CHUNK_SIZE = 500      # How many characters per chunk
CHUNK_OVERLAP = 50    # How many characters to repeat (context window)

def read_pdf(file_path):
    """Extracts text from a PDF file."""
    text = ""
    try:
        reader = pypdf.PdfReader(file_path)
        for page in reader.pages:
            text += page.extract_text() + "\n"
    except Exception as e:
        print(f"Error reading PDF {file_path}: {e}")
    return text

def read_text(file_path):
    """Extracts text from a .txt or .md file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"Error reading text file {file_path}: {e}")
        return ""

def chunk_text(text, size, overlap):
    """Splits text into overlapping chunks."""
    chunks = []
    start = 0
    while start < len(text):
        # Define the end of the chunk
        end = start + size
        
        # Extract the slice
        chunk = text[start:end]
        chunks.append(chunk)
        
        # Move the start pointer forward, but strictly less than size to create overlap
        # If we reach the end, break
        start += (size - overlap)
        
    return chunks

def main():
    print(f"📂 Scanning '{DATA_FOLDER}'...")
    
    # Loop through all files in the data folder
    for filename in os.listdir(DATA_FOLDER):
        file_path = os.path.join(DATA_FOLDER, filename)
        
        # 1. LOAD based on extension
        raw_text = ""
        if filename.endswith(".pdf"):
            print(f"   📖 Reading PDF: {filename}")
            raw_text = read_pdf(file_path)
        elif filename.endswith(".txt") or filename.endswith(".md"):
            print(f"   📄 Reading Text: {filename}")
            raw_text = read_text(file_path)
        else:
            print(f"   ⚠️ Skipping unknown file type: {filename}")
            continue

        # 2. CLEAN (Basic normalization)
        # Remove excessive whitespace/newlines which confuse the AI
        clean_text = " ".join(raw_text.split())
        
        # 3. CHUNK
        chunks = chunk_text(clean_text, CHUNK_SIZE, CHUNK_OVERLAP)
        
        print(f"   ✅ Generated {len(chunks)} chunks from {filename}")
        
        # Preview the first chunk to see if it worked
        if chunks:
            print(f"      [Preview Chunk 1]: {chunks[0]}...")
            print("      --------------------------------------------------")

if __name__ == "__main__":
    main()