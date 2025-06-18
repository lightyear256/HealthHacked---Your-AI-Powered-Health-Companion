require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
  try {
    console.log('🔍 Testing Gemini API...');
    console.log('🔍 GOOGLE_API_KEY exists:', !!process.env.GOOGLE_API_KEY);
    console.log('🔍 GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
    
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.log('❌ No API key found in environment');
      return;
    }

    console.log('🔍 Using API key (first 10 chars):', apiKey.substring(0, 10) + '...');

    const genAI = new GoogleGenerativeAI(apiKey);
    // FIXED: Use valid model name
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Changed from "gemini-2.0-flash-exp"

    console.log('🔍 Calling Gemini API...');
    const result = await model.generateContent("Say hello in one sentence");
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Gemini API working! Response:', text);
  } catch (error) {
    console.error('❌ Gemini API Error:', error.message);
    console.error('❌ Full error:', error);
  }
}

testGemini();