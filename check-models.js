const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("❌ Error: GEMINI_API_KEY not found in .env.local");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    console.log("Checking available models for your key...");
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();

    if (data.error) {
      console.error("❌ API Error:", data.error.message);
    } else {
      console.log("\n✅ SUCCESS! Here are the models you can use:\n");
      data.models.forEach(m => {
        if (m.supportedGenerationMethods.includes("generateContent")) {
            console.log(`- Name: ${m.name.replace("models/", "")}`);
        }
      });
    }
  } catch (error) {
    console.error("❌ Network Error:", error.message);
  }
}

listModels();
