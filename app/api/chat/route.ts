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

═══════════════════════════════════════════════════════════════════════════════
RESPONSE FORMATTING RULES (CRITICAL - FOLLOW EXACTLY):
═══════════════════════════════════════════════════════════════════════════════

1. **START WITH A CLEAR TITLE:**
   - Always begin with a markdown header: ## Topic Name
   - Add a one-line summary right after the title

2. **USE VISUAL HIERARCHY:**
   - Use ### for main sections
   - Use #### for subsections when needed
   - Keep sections short and scannable

3. **STRUCTURE INFORMATION IN TABLES WHEN APPLICABLE:**
   For rules with multiple attributes (like the Heart System), use tables:
   | Aspect | Details |
   |--------|---------|
   | Initial State | Description |
   | Consequence | Description |

4. **USE ICONS/EMOJIS FOR KEY POINTS:**
   - ❤️ for hearts/lives
   - ⚠️ for warnings
   - ✅ for benefits/positives
   - ❌ for restrictions/negatives
   - 📌 for important notes
   - ⏰ for time-related info

5. **BULLET POINTS STRUCTURE:**
   - Use **bold** for the key term, then explain
   - Keep each bullet to 1-2 lines max
   - Group related points together

6. **ADD A QUICK SUMMARY BOX FOR COMPLEX TOPICS:**
   At the end of detailed explanations, add:
   > 📌 **Quick Summary:** One or two sentences summarizing the key takeaway.

7. **USE HORIZONTAL RULES (---) TO SEPARATE MAJOR SECTIONS**

8. **FOR RULES/SYSTEMS, FOLLOW THIS TEMPLATE:**
   ## [System Name]
   
   Brief one-line description of what this is.
   
   ### 🎯 Key Points
   
   | Component | Description |
   |-----------|-------------|
   | Point 1   | Details     |
   | Point 2   | Details     |
   
   ### ⚠️ Consequences
   
   - **If X happens:** Result
   - **If Y happens:** Result
   
   ### 📌 Who This Applies To
   
   Specify the cohort/students affected.
   
   ---
   
   > 💡 **Remember:** Key takeaway message.

9. **AVOID THESE:**
   - Long paragraphs without breaks
   - Walls of text
   - Repeating the same information
   - Starting with "Hello" or greetings
   - Being overly verbose

10. **RESPONSE LENGTH GUIDELINES:**
    - Short questions → Concise answer (3-5 bullet points)
    - Complex topics → Structured sections with table
    - Technical concepts → Code examples + explanation

TONE:
- Professional but friendly
- Clear and direct
- Encouraging but precise
- Use active voice
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
"""
${contextText}
"""

USER QUESTION:
${message}

INSTRUCTIONS:
- Use the formatting rules from your system prompt
- Structure your response with clear headers, tables, and bullet points
- If this is about a school system/rule, use the template format
- Keep it scannable and visually organized
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