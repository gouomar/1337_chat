import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    // 1. Securely retrieve the API Key
    // The '|| ""' acts as a fallback so TypeScript knows it's always a string
    const apiKey = process.env.GEMINI_API_KEY || "";
    
    // 2. Guard Clause: Check if key exists before proceeding
    if (!apiKey) {
        console.error("SERVER ERROR: GEMINI_API_KEY is not set in .env.local");
        return NextResponse.json(
            { error: "Server configuration error: API Key missing" }, 
            { status: 500 }
        );
    }

    // 3. Initialize Google AI Client
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 4. Select the Model
    // We use 'gemini-1.5-flash' for speed and efficiency
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        systemInstruction: "You are a helpful AI assistant for 1337, a coding school in Morocco. You help students with C programming, algorithms, and school rules. Be concise, technical, and encouraging."
    });

    // 5. Parse the incoming JSON body
    const body = await req.json();
    
    // explicit casting helps TypeScript understand the shape of 'body'
    const { message } = body as { message: string };

    // 6. Validate User Input
    if (!message) {
      return NextResponse.json(
          { error: "Message field is required" }, 
          { status: 400 }
      );
    }

    // 7. Generate Content
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    // 8. Return the clean text to the frontend
    return NextResponse.json({ message: text });

  } catch (error) {
    console.error("Error processing chat request:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}