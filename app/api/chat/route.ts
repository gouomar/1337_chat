import { GoogleGenerativeAI } from "@google/generative-ai";
import { Pinecone } from "@pinecone-database/pinecone";
import { NextResponse } from "next/server";

// 1. CONFIGURATION
const SYSTEM_PROMPT = `
ROLE:
You are a Senior Technical Mentor at 1337 Coding School (part of the 42 Network).
Your goal is to guide students through the curriculum (C, C++, Algorithms) by explaining concepts, NOT by providing direct solutions.

STRICT DATA RULE (THE "TRUTH" PROTOCOL):
- You have access to a database of school rules (Context).
- You must answer questions based **ONLY** on that Context.
- If the user asks about a specific school rule (e.g., "Can I use printf?"), and the Context is empty or doesn't mention it, you MUST say:
  "I cannot find a specific rule about this in my database. Please check the subject PDF manually to be safe."
- Do NOT guess 1337 rules based on general internet knowledge. 42/1337 rules are unique and strict.

RESPONSE STRUCTURE & STYLE:
1. **Professional & Direct:** Start with the answer immediately. No fluff like "Hello user, that is a great question."
2. **Formatted:** Use Markdown headers (###), bullet points, and **bold text** for emphasis.
3. **The "Peer-Learning" Approach:**
   - Never write the full code for a student's project.
   - Instead, write a *small, isolated example* that demonstrates the *concept*.
   - Ask guiding questions: "Have you checked how malloc handles errors here?"
4. **Context Citation:** If you find the answer in the provided text, mention it: "According to the Norminette documentation..."

TONE:
- Serious but encouraging.
- Precise.
- Technical.
`;

export async function POST(req: Request) {
  try {
    // 2. PARSE USER INPUT
    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "No message provided" }, { status: 400 });
    }

    // 3. SETUP AI & DB CLIENTS
    // Note: Ensure GEMINI_API_KEY and PINECONE_API_KEY are in .env.local
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const index = pc.index("1337-chat");

    // 4. STEP A: EMBED THE USER'S QUESTION
    // We use the "Mathematician" model (same as ingestion) to understand the question
    const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const embeddingResult = await embeddingModel.embedContent(message);
    const queryVector = embeddingResult.embedding.values;

    // 5. STEP B: SEARCH PINECONE (The "Retrieval")
    // We ask for the Top 3 most relevant "Flashcards"
    // 5. STEP B: SEARCH PINECONE (The "Retrieval")
    // CORRECT (Chain the namespace function)
    const queryResponse = await index.namespace("ns1").query({
      vector: queryVector,
      topK: 3,
      includeMetadata: true,
    });

    // 6. STEP C: BUILD THE CONTEXT
    // We combine the text from the top 3 matches into one string
    const contextText = queryResponse.matches
      .map((match) => match.metadata?.text || "")
      .join("\n\n---\n\n");

    console.log("🔍 Found Context:", contextText.substring(0, 100) + "..."); // Debugging log

    // 7. STEP D: GENERATE THE ANSWER
    // We feed the Context + Question to the "Genius" (Gemini 2.5)
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT
    });

    const prompt = `
    CONTEXT FROM SCHOOL RULES:
    ${contextText}

    USER QUESTION:
    ${message}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 8. RETURN RESPONSE
    return NextResponse.json({ message: text });

  } catch (error) {
    console.error("❌ Error in Chat API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}