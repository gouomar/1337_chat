<h1 align="center">🤖 Ba3bou3 - 1337 AI Assistant</h1>

<p align="center">
  <strong>An intelligent RAG-powered chatbot built for 1337 Coding School students</strong>
</p>

<p align="center">
  <a href="https://www.ba3bou3.me/">🌐 Visit Ba3bou3</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js"/>
  <img src="https://img.shields.io/badge/Gemini-2.5_Flash-blue?style=for-the-badge&logo=google" alt="Gemini"/>
  <img src="https://img.shields.io/badge/Pinecone-Vector_DB-green?style=for-the-badge" alt="Pinecone"/>
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript"/>
</p>

---

## 🎯 What is Ba3bou3?

**Ba3bou3** (بعبوع) is a RAG (Retrieval-Augmented Generation) chatbot specifically designed for **1337 Coding School** students. It combines the power of Google's Gemini AI with a custom knowledge base to provide accurate, context-aware answers about school rules, policies, and programming concepts.

### ✨ Features

- 🧠 **RAG Architecture** - Retrieves relevant context from a vector database before generating responses
- 💬 **Conversation Memory** - Remembers previous messages in the chat session
- 🎭 **Adaptive Personality** - Matches the user's energy (serious for technical questions, playful for casual ones)
- 📚 **Custom Knowledge Base** - Trained on 1337/42 Network specific rules and documentation
- ⚡ **Real-time Streaming UI** - Beautiful, responsive chat interface
- 🌙 **Dark Theme** - Easy on the eyes for those late-night coding sessions

---

## 🏗️ How Ba3bou3 Works

Ba3bou3 operates in **two independent phases**:

| Phase | Script | When it runs | Purpose |
|-------|--------|--------------|---------|
| **1. Data Ingestion** | `ingest.py` | Once (or when adding new data) | Prepares documents for AI search |
| **2. Chat Runtime** | `route.ts` | Every user message | Answers questions using the prepared data |

---

## 📥 PHASE 1: Data Ingestion (`ingest.py`)

> **Purpose:** Convert PDF/TXT documents into searchable vectors in Pinecone.  
> **When to run:** Once initially, or when adding new documents.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        DATA INGESTION PIPELINE (ingest.py)                             │
│                   Runs ONCE to "teach" the AI about your documents                     │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐      ┌─────────────┐       │
│  │  1. READ    │      │  2. CLEAN   │      │  3. CHUNK   │      │  4. EMBED   │       │
│  │   FILES     │ ───► │   TEXT      │ ───► │   TEXT      │ ───► │   CHUNKS    │       │
│  └─────────────┘      └─────────────┘      └─────────────┘      └──────┬──────┘       │
│        │                    │                    │                     │              │
│        ▼                    ▼                    ▼                     ▼              │
│  ┌───────────┐        ┌──────────┐         ┌─────────┐          ┌──────────┐         │
│  │ data/     │        │ Remove   │         │ Split   │          │ Google   │         │
│  │ ├─rule.pdf│        │ weird    │         │ into    │          │ AI turns │         │
│  │ ├─faq.txt │        │ chars,   │         │ 500-char│          │ text ──► │         │
│  │ └─guide.md│        │ spaces   │         │ pieces  │          │ 768 nums │         │
│  └───────────┘        └──────────┘         │ with 50 │          └──────────┘         │
│                                            │ overlap │                               │
│                                            └─────────┘                               │
│                                                                                        │
│                                         ┌──────────────────────────────────────────┐  │
│                                         │            5. UPLOAD TO PINECONE         │  │
│                                         ├──────────────────────────────────────────┤  │
│                                         │  For each chunk, store:                  │  │
│                                         │  • id: "rules.pdf_0"                     │  │
│                                         │  • values: [0.02, -0.15, ...] (768 nums) │  │
│                                         │  • metadata.text: "Original text..."    │  │
│                                         │  • metadata.source: "rules.pdf"         │  │
│                                         └──────────────────────────────────────────┘  │
│                                                                                        │
│  KEY CONCEPT: Embedding = Text converted to numbers that capture MEANING              │
│  Similar text = Similar numbers → Enables semantic search!                            │
│                                                                                        │
│  ✅ Result: All documents stored as searchable vectors in Pinecone                    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

| File | Purpose |
|------|---------|
| `ingest.py` | Orchestrates the pipeline |
| `data/` | Your source documents |
| `.env` | API keys |

---

## 💬 PHASE 2: Chat Runtime (`route.ts`)

> **Purpose:** Answer questions by finding relevant context from Pinecone + generating responses with Gemini.  
> **When it runs:** Every time a user sends a message.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                         CHAT RUNTIME FLOW (route.ts)                                   │
│                   Runs EVERY TIME a user sends a message                               │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ 👤 USER INTERFACE (chat-interface.tsx)                                           │  │
│  │                                                                                  │  │
│  │  User: "What is Black Hole?"  →  AI: "The Black Hole system is..."              │  │
│  │  User: "How can I avoid it?"  →  [PROCESSING...]                                │  │
│  │                                                                                  │  │
│  │  Sends: { message: "How can I avoid it?", history: [prev Q&A] }                 │  │
│  └────────────────────────────────────────┬─────────────────────────────────────────┘  │
│                                           │ POST /api/chat                             │
│                                           ▼                                            │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ 🔧 API ROUTE (app/api/chat/route.ts)                                             │  │
│  │                                                                                  │  │
│  │  STEP 1: Embed Question                                                         │  │
│  │  ─────────────────────                                                          │  │
│  │  "How can I avoid it?" ──► Google AI ──► [0.089, -0.234, ..., 0.078] (768 nums) │  │
│  │                                                                                  │  │
│  │  STEP 2: Search Pinecone                                                        │  │
│  │  ───────────────────────                                                        │  │
│  │  Query vector against database ──► Returns TOP 3 most similar chunks:           │  │
│  │    • (91%) "To avoid Black Hole, students should log hours daily..."           │  │
│  │    • (85%) "The Black Hole recovery process involves..."                       │  │
│  │    • (78%) "Logging hours regularly prevents Black Hole..."                    │  │
│  │                                                                                  │  │
│  │  STEP 3: Build Prompt                                                           │  │
│  │  ────────────────────                                                           │  │
│  │  ┌────────────────────────────────────────────────────────────────────────────┐ │  │
│  │  │ SYSTEM_PROMPT    : "You are Ba3bou3, AI assistant for 1337..."            │ │  │
│  │  │ CONTEXT          : [3 relevant chunks from Pinecone]                       │ │  │
│  │  │ CHAT HISTORY     : [Previous questions & answers]                          │ │  │
│  │  │ CURRENT QUESTION : "How can I avoid it?"                                   │ │  │
│  │  └────────────────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                                  │  │
│  │  STEP 4: Send to Gemini                                                         │  │
│  │  ──────────────────────                                                         │  │
│  │  Gemini receives full context + history → Understands "it" = "Black Hole"      │  │
│  │  Generates response using retrieved knowledge                                   │  │
│  │                                                                                  │  │
│  └────────────────────────────────────────┬─────────────────────────────────────────┘  │
│                                           │ Response                                   │
│                                           ▼                                            │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ 👤 USER INTERFACE                                                                │  │
│  │                                                                                  │  │
│  │  AI: "To avoid falling into the Black Hole:                                     │  │
│  │       1. Log your hours daily on the intranet                                   │  │
│  │       2. Complete at least one project per month                                │  │
│  │       3. Attend evaluations regularly..."                                       │  │
│  │                                                                                  │  │
│  │  Chat history updated → Ready for next question!                                │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                        │
│  KEY CONCEPTS:                                                                         │
│  • Semantic Search: Find relevant info by MEANING, not exact keywords                 │
│  • Chat History: AI remembers conversation context ("it" → "Black Hole")             │
│  • RAG: Retrieval (Pinecone) + Augmented Generation (Gemini)                         │
│                                                                                        │
│  ✅ Result: Accurate, context-aware answers from your custom knowledge base           │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

| File | Purpose |
|------|---------|
| `app/api/chat/route.ts` | Main API (RAG logic) |
| `components/chat-interface.tsx` | Chat UI |
| `app/page.tsx` | Home page |

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 16, React, TypeScript | UI Framework |
| **Styling** | Tailwind CSS, Framer Motion | Styling & Animations |
| **UI Components** | Radix UI, shadcn/ui | Accessible Components |
| **Backend** | Next.js API Routes | Server-side Logic |
| **AI Model** | Google Gemini 2.5 Flash | Text Generation |
| **Embeddings** | Google text-embedding-004 | Vector Embeddings (768 dims) |
| **Vector DB** | Pinecone | Semantic Search |
| **Data Ingestion** | Python (pypdf, google-generativeai) | PDF/Text Processing |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- Python 3.10+
- pnpm (recommended) or npm
- Google AI API Key
- Pinecone API Key & Index

### 1. Clone the Repository

```bash
git clone https://github.com/gouomar/1337_chat.git
cd 1337_chat
```

### 2. Install Dependencies

```bash
# Install Node.js dependencies
pnpm install

# Install Python dependencies (for data ingestion)
pip install pypdf google-generativeai pinecone python-dotenv
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# API Keys (used by both ingest.py and Next.js app)
GOOGLE_API_KEY=your_google_ai_api_key
PINECONE_API_KEY=your_pinecone_api_key
GEMINI_API_KEY=your_google_ai_api_key
```

> **Note:** `ingest.py` automatically loads these keys from `.env` using `python-dotenv`. No need to edit any code!

### 4. Setup Pinecone

1. Create a free account at [pinecone.io](https://www.pinecone.io/)
2. Create an index named `1337-chat` with:
   - **Dimensions**: 768
   - **Metric**: cosine

### 5. Ingest Your Data

Place your PDF or TXT files in the `data/` folder, then run:

```bash
python ingest.py
```

### 6. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
1337_chat/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts      # Main API endpoint (RAG logic)
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
├── components/
│   ├── chat-interface.tsx    # Main chat UI component
│   └── ui/                   # shadcn/ui components
├── data/
│   └── *.txt, *.pdf          # Knowledge base files (gitignored)
├── lib/
│   └── utils.ts              # Utility functions
├── ingest.py                 # Data ingestion script
├── .env                      # API keys (gitignored)
├── package.json
└── tsconfig.json
```

---

## 📝 Important Notes

1. **Never commit API keys** - Keep them in `.env` file which is gitignored
2. **Run ingestion once** - Only re-run `ingest.py` when you add new documents
3. **Chunk size matters** - 500 chars works well for most documents, adjust if needed
4. **Pinecone free tier** - Has limits, but sufficient for most use cases

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 👨‍💻 Authors

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/gouomar">
        <img src="https://github.com/gouomar.png" width="100px;" alt="Omar Gourragui"/>
        <br />
        <sub><b>Omar Gourragui</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/mowardan">
        <img src="https://github.com/mowardan.png" width="100px;" alt="Mowardan"/>
        <br />
        <sub><b>Mowardan</b></sub>
      </a>
    </td>
  </tr>
</table>

---

## 📄 License

This project is open source

---

<p align="center">
  <strong>Built with ❤️ by 1337 students, for 1337 students</strong>
</p>

<p align="center">
  <em>Keep coding. Greatness awaits.</em>
</p>
