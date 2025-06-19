

require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
  try {
    console.log('🔍 Testing Gemini API...');
    console.log('API Key exists:', !!process.env.GOOGLE_API_KEY);
    
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    console.log('📡 Calling Gemini API...');
    const result = await model.generateContent("What are three tips for staying healthy?");
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Gemini API working!');
    console.log('Response:', text);
  } catch (error) {
    console.error('❌ Gemini API Error:', error.message);
  }
}

testGemini();