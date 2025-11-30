<h1 align="center">🤖 Ba3bou3 - 1337 AI Assistant</h1>

<p align="center">
  <strong>An intelligent RAG-powered chatbot built for 1337 Coding School students</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#how-it-works">How It Works</a>
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

## 🏗️ Architecture

### High-Level System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BA3BOU3 ARCHITECTURE                           │
└─────────────────────────────────────────────────────────────────────────────┘

                    ┌──────────────────────────────────┐
                    │         USER INTERFACE           │
                    │      (Next.js + React UI)        │
                    └──────────────┬───────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│    ┌─────────────┐         ┌─────────────────────────────────────────────┐  │
│    │   User      │         │              API ROUTE                      │  │
│    │   Message   │────────▶│           /api/chat                         │  │
│    │  + History  │         │                                             │  │
│    └─────────────┘         │  ┌─────────────────────────────────────┐   │  │
│                            │  │  1. Parse message & history          │   │  │
│                            │  │  2. Generate embedding (768 dims)    │   │  │
│                            │  │  3. Query Pinecone for context       │   │  │
│                            │  │  4. Build prompt with context        │   │  │
│                            │  │  5. Send to Gemini with chat history │   │  │
│                            │  │  6. Return AI response               │   │  │
│                            │  └─────────────────────────────────────┘   │  │
│                            └─────────────────────────────────────────────┘  │
│                                                                              │
│                     NEXT.JS BACKEND                                          │
└──────────────────────────────────────────────────────────────────────────────┘
                                   │
                    ┌──────────────┴───────────────┐
                    │                              │
                    ▼                              ▼
     ┌──────────────────────┐       ┌──────────────────────────┐
     │      PINECONE        │       │     GOOGLE GEMINI        │
     │   (Vector Database)  │       │      (AI Model)          │
     │                      │       │                          │
     │  • Stores embeddings │       │  • text-embedding-004    │
     │  • Semantic search   │       │  • gemini-2.5-flash      │
     │  • Returns top 3     │       │  • Chat with history     │
     │    relevant chunks   │       │  • System instructions   │
     └──────────────────────┘       └──────────────────────────┘
```

---

### 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           REQUEST FLOW                                       │
└─────────────────────────────────────────────────────────────────────────────┘

  USER                    FRONTEND                   BACKEND                    
   │                         │                          │                       
   │  "What is Black Hole?"  │                          │                       
   │────────────────────────▶│                          │                       
   │                         │                          │                       
   │                         │  POST /api/chat          │                       
   │                         │  {                       │                       
   │                         │    message: "...",       │                       
   │                         │    history: [...]        │                       
   │                         │  }                       │                       
   │                         │─────────────────────────▶│                       
   │                         │                          │                       
   │                         │                          │──┐ 1. Embed question  
   │                         │                          │  │    (768-dim vector)
   │                         │                          │◀─┘                    
   │                         │                          │                       
   │                         │                          │──┐ 2. Query Pinecone  
   │                         │                          │  │    (semantic search)
   │                         │                          │◀─┘ Returns top 3 chunks
   │                         │                          │                       
   │                         │                          │──┐ 3. Build prompt    
   │                         │                          │  │    Context + Question
   │                         │                          │◀─┘    + History       
   │                         │                          │                       
   │                         │                          │──┐ 4. Gemini generates
   │                         │                          │  │    response        
   │                         │                          │◀─┘                    
   │                         │                          │                       
   │                         │  { message: "..." }      │                       
   │                         │◀─────────────────────────│                       
   │                         │                          │                       
   │  Display AI response    │                          │                       
   │◀────────────────────────│                          │                       
   │                         │                          │                       
```

---

### 🔄 RAG Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        RAG (Retrieval-Augmented Generation)                  │
└─────────────────────────────────────────────────────────────────────────────┘

  ╔═══════════════════════════════════════════════════════════════════════════╗
  ║                         INGESTION PHASE (One-time)                        ║
  ╚═══════════════════════════════════════════════════════════════════════════╝
  
     ┌────────────┐      ┌────────────┐      ┌────────────┐      ┌────────────┐
     │   PDF/TXT  │      │   CHUNK    │      │   EMBED    │      │   STORE    │
     │   Files    │─────▶│   Text     │─────▶│   Each     │─────▶│   Vectors  │
     │            │      │ (500 char) │      │   Chunk    │      │  Pinecone  │
     └────────────┘      └────────────┘      └────────────┘      └────────────┘
                                                   │
                                                   ▼
                                          ┌───────────────┐
                                          │ Google AI     │
                                          │ Embedding     │
                                          │ (768 dims)    │
                                          └───────────────┘

  ╔═══════════════════════════════════════════════════════════════════════════╗
  ║                         RETRIEVAL PHASE (Every query)                     ║
  ╚═══════════════════════════════════════════════════════════════════════════╝
  
     ┌────────────┐      ┌────────────┐      ┌────────────┐      ┌────────────┐
     │   User     │      │   Embed    │      │   Search   │      │  Top 3     │
     │   Query    │─────▶│   Query    │─────▶│  Pinecone  │─────▶│  Relevant  │
     │            │      │            │      │            │      │  Chunks    │
     └────────────┘      └────────────┘      └────────────┘      └────────────┘
                                                                       │
                                                                       ▼
  ╔═══════════════════════════════════════════════════════════════════════════╗
  ║                         GENERATION PHASE                                  ║
  ╚═══════════════════════════════════════════════════════════════════════════╝
  
     ┌─────────────────────────────────────────────────────────────────────────┐
     │                                                                         │
     │   PROMPT = System Instructions + Retrieved Context + Chat History       │
     │            + User Question                                              │
     │                                                                         │
     │   ┌─────────────────┐                                                   │
     │   │  Gemini 2.5     │                                                   │
     │   │  Flash          │───────▶  AI Response                              │
     │   │  (with history) │                                                   │
     │   └─────────────────┘                                                   │
     │                                                                         │
     └─────────────────────────────────────────────────────────────────────────┘
```

---

### 💬 Conversation Memory Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CONVERSATION MEMORY                                   │
└─────────────────────────────────────────────────────────────────────────────┘

  Message 1: "What is the Black Hole system?"
  
     Frontend State: messages = []
     Sends: { message: "What is...", history: [] }
     
     ──────────────────────────────────────────────────────────────────────────
     
     AI Responds: "The Black Hole system is..."
     
     Frontend State: messages = [
       { role: "user", content: "What is the Black Hole..." },
       { role: "assistant", content: "The Black Hole system is..." }
     ]

  ════════════════════════════════════════════════════════════════════════════

  Message 2: "How can I avoid it?"
  
     Frontend State: messages = [Q1, A1]
     Sends: { message: "How can I avoid it?", history: [Q1, A1] }
     
     ──────────────────────────────────────────────────────────────────────────
     
     Backend converts to Gemini format:
     
     chat.startChat({
       history: [
         { role: "user", parts: [{ text: "What is the Black Hole..." }] },
         { role: "model", parts: [{ text: "The Black Hole system is..." }] }
       ]
     })
     
     AI now KNOWS "it" refers to "Black Hole" from context!
```

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
pip install pypdf google-generativeai pinecone
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
GEMINI_API_KEY=your_google_ai_api_key
PINECONE_API_KEY=your_pinecone_api_key
```

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

This will:
1. Read all files from `data/` folder
2. Chunk text into 500-character pieces
3. Generate embeddings using Google AI
4. Upload vectors to Pinecone

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
│   └── *.txt, *.pdf          # Knowledge base files
├── lib/
│   └── utils.ts              # Utility functions
├── public/
│   └── 1337_logo.png         # Static assets
├── ingest.py                 # Data ingestion script
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🔧 Configuration

### Chunking Settings (ingest.py)

```python
CHUNK_SIZE = 500      # Characters per chunk
CHUNK_OVERLAP = 50    # Overlap between chunks for context
```

### RAG Settings (route.ts)

```typescript
topK: 3  // Number of relevant chunks to retrieve
```

### System Prompt

The AI's personality and behavior is defined in `SYSTEM_PROMPT` in `route.ts`. Key features:
- Adaptive tone (serious/playful based on user energy)
- Structured markdown responses
- Smart knowledge protocol (when to answer vs. admit uncertainty)

---

## 📈 How It All Connects

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          FULL SYSTEM DIAGRAM                                 │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────┐
                              │   DATA FILES    │
                              │  (PDF/TXT)      │
                              └────────┬────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │   ingest.py     │
                              │                 │
                              │ • Read files    │
                              │ • Chunk text    │
                              │ • Sanitize      │
                              │ • Embed         │
                              │ • Upload        │
                              └────────┬────────┘
                                       │
                                       ▼
     ┌─────────────────────────────────────────────────────────────────┐
     │                         PINECONE                                │
     │                      (Vector Database)                          │
     │                                                                 │
     │   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐          │
     │   │ Chunk 1 │  │ Chunk 2 │  │ Chunk 3 │  │ Chunk N │   ...    │
     │   │ [0.1,   │  │ [0.3,   │  │ [0.2,   │  │ [0.4,   │          │
     │   │  0.4,   │  │  0.1,   │  │  0.5,   │  │  0.2,   │          │
     │   │  ...]   │  │  ...]   │  │  ...]   │  │  ...]   │          │
     │   └─────────┘  └─────────┘  └─────────┘  └─────────┘          │
     └─────────────────────────────────────────────────────────────────┘
                                       ▲
                                       │ Query
                                       │
┌──────────────────────────────────────┴───────────────────────────────────────┐
│                              NEXT.JS APP                                      │
│                                                                               │
│   ┌───────────────────────┐         ┌─────────────────────────────────────┐  │
│   │    FRONTEND           │         │           BACKEND API               │  │
│   │                       │         │          /api/chat                  │  │
│   │  chat-interface.tsx   │ ◀──────▶│                                     │  │
│   │                       │         │  1. Receive message + history       │  │
│   │  • Chat UI            │         │  2. Embed user question             │  │
│   │  • Message history    │         │  3. Search Pinecone (top 3)         │  │
│   │  • Send/receive       │         │  4. Build context prompt            │  │
│   │  • Markdown render    │         │  5. Call Gemini with history        │  │
│   │                       │         │  6. Return response                 │  │
│   └───────────────────────┘         └─────────────────────────────────────┘  │
│                                                      │                        │
└──────────────────────────────────────────────────────┼────────────────────────┘
                                                       │
                                                       ▼
                                        ┌──────────────────────────┐
                                        │     GOOGLE GEMINI        │
                                        │                          │
                                        │  • gemini-2.5-flash      │
                                        │  • System instructions   │
                                        │  • Multi-turn chat       │
                                        │  • Context-aware         │
                                        └──────────────────────────┘
```

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
