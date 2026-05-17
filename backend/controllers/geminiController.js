const { GoogleGenAI } = require('@google/genai');
const axios = require('axios');

exports.analyzeArtworkImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ message: 'imageUrl is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const hasApiKey = apiKey && !apiKey.includes('your_gemini_api_key_here');

    if (!hasApiKey) {
      console.warn('GEMINI_API_KEY is not configured. Returning premium simulated metadata.');
      // Beautiful simulated fallback metadata
      const simulatedMetadata = {
        title: 'Neon Oasis V1',
        description: 'An immersive digital masterpiece exploring futuristic cyberpunk aesthetics, featuring radiant glassmorphism elements, neon light reflection, and vibrant cyan energy flows.',
        tags: ['cyberpunk', 'glassmorphism', 'neon', 'digitalart', 'conceptart', 'futuristic'],
      };
      return res.json({ success: true, metadata: simulatedMetadata, mode: 'simulated' });
    }

    // Initialize Google Gen AI client
    const ai = new GoogleGenAI({ apiKey });

    // Download image from URL and convert to base64
    console.log('Downloading image for Gemini analysis:', imageUrl);
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const base64Image = Buffer.from(imageResponse.data, 'binary').toString('base64');
    const mimeType = imageResponse.headers['content-type'] || 'image/jpeg';

    const inlineData = {
      inlineData: {
        data: base64Image,
        mimeType
      }
    };

    console.log('Calling Gemini 2.5 Flash for multimodal analysis...');
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        'Analyze this digital artwork. Generate a premium luxury digital art gallery title (max 50 chars), a premium immersive luxury gallery-style description (max 300 chars), and 5-8 highly relevant hashtags/tags (lowercase, no spaces). Format your response as a strict JSON object with fields: "title", "description", "tags". Do not return any other text or markdown formatting. Output pure raw JSON only.',
        inlineData
      ]
    });

    const text = result.text.trim();
    console.log('Gemini raw output:', text);

    // Clean markdown code blocks from response if present
    const cleanJsonText = text.replace(/```json/gi, '').replace(/```/g, '').trim();

    const metadata = JSON.parse(cleanJsonText);
    res.json({ success: true, metadata, mode: 'gemini' });
  } catch (err) {
    console.error('Gemini Analysis failed:', err.message);
    // Graceful fallback to avoid breaking UI
    const simulatedMetadata = {
      title: 'Neon Genesis',
      description: 'A captivating exploration of cybernetic themes, neon hues, and virtual spaces, designed to bring modern gallery elegance to digital collections.',
      tags: ['digitalart', 'cyberpunk', 'neon', 'abstract', 'futuristic'],
    };
    res.json({ success: true, metadata: simulatedMetadata, mode: 'fallback_error', error: err.message });
  }
};
