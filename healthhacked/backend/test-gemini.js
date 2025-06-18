require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
  try {
    console.log('🔍 Testing Gemini API...');
    console.log('🔍 API Key exists:', !!process.env.GEMINI_API_KEY);
    
    if (!process.env.GEMINI_API_KEY) {
      console.log('❌ No GEMINI_API_KEY found in environment');
      return;
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const result = await model.generateContent("Say hello in one sentence");
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Gemini API working! Response:', text);
  } catch (error) {
    console.error('❌ Gemini API Error:', error.message);
  }
}

testGemini();