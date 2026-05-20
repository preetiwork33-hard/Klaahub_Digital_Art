const { GoogleGenAI } = require('@google/genai');
const axios = require('axios');

exports.analyzeArtworkImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'imageUrl is required',
      });
    }

    // ==============================
    // GEMINI API KEY VALIDATION
    // ==============================

    const apiKey = process.env.GEMINI_API_KEY;

    const hasApiKey =
      apiKey &&
      apiKey.trim().length > 10 &&
      !apiKey.includes('your_gemini_api_key_here');

    // ==============================
    // FALLBACK IF API KEY MISSING
    // ==============================

    if (!hasApiKey) {
      console.warn(
        '[Gemini] GEMINI_API_KEY missing — returning simulated metadata.'
      );

      return res.json({
        success: true,
        mode: 'simulated',
        metadata: {
          title: 'Neon Dreamscape',
          description:
            'A futuristic digital masterpiece filled with luminous cyberpunk aesthetics and immersive neon reflections.',
          tags: [
            'digitalart',
            'cyberpunk',
            'neon',
            'futuristic',
            'conceptart',
          ],
        },
      });
    }

    // ==============================
    // INITIALIZE GEMINI
    // ==============================

    const ai = new GoogleGenAI({
      apiKey: apiKey.trim(),
    });

    // ==============================
    // IMAGE PROCESSING
    // ==============================

    let base64Image;
    let mimeType;

    // Base64 Image
    if (imageUrl.startsWith('data:')) {
      const matches = imageUrl.match(
        /^data:([^;]+);base64,(.+)$/
      );

      if (!matches) {
        throw new Error('Invalid base64 image format');
      }

      mimeType = matches[1];
      base64Image = matches[2];

      console.log(
        '[Gemini] Using inline base64 image:',
        mimeType
      );
    }

    // Remote Image URL
    else {
      console.log(
        '[Gemini] Downloading image:',
        imageUrl
      );

      const imageResponse = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 15000,
      });

      base64Image = Buffer.from(
        imageResponse.data,
        'binary'
      ).toString('base64');

      mimeType =
        imageResponse.headers['content-type']
          ?.split(';')[0] || 'image/jpeg';
    }

    // ==============================
    // STABLE MODELS
    // ==============================

    const MODELS = [
      'gemini-2.0-flash',
      'gemini-2.0-flash-lite',
    ];

    let result = null;
    let usedModel = null;
    let lastError = null;

    // ==============================
    // MODEL FALLBACK SYSTEM
    // ==============================

    for (const modelName of MODELS) {
      try {
        console.log(
          `[Gemini] Trying model: ${modelName}`
        );

        result = await ai.models.generateContent({
          model: modelName,

          contents: [
            {
              role: 'user',

              parts: [
                {
                  text: `
Analyze this digital artwork carefully.

Generate:
1. Premium artwork title (max 50 chars)
2. Rich luxury gallery description (max 300 chars)
3. 5-8 lowercase tags

IMPORTANT:
Return ONLY raw JSON.

Format:
{
  "title": "",
  "description": "",
  "tags": []
}
                  `,
                },

                {
                  inlineData: {
                    data: base64Image,
                    mimeType: mimeType,
                  },
                },
              ],
            },
          ],
        });

        usedModel = modelName;

        console.log(
          `[Gemini] Success using model: ${modelName}`
        );

        break;
      } catch (err) {
        lastError = err;

        console.error(
          `[Gemini] ${modelName} failed:`,
          err.message
        );
      }
    }

    // ==============================
    // ALL MODELS FAILED
    // ==============================

    if (!result) {
      throw lastError || new Error('All Gemini models failed');
    }

    // ==============================
    // RESPONSE EXTRACTION
    // ==============================

    let text = '';

    if (typeof result.text === 'string') {
      text = result.text.trim();
    } else if (
      result?.candidates?.[0]?.content?.parts?.[0]?.text
    ) {
      text =
        result.candidates[0].content.parts[0].text.trim();
    } else {
      console.log(
        '[Gemini] Full response:',
        JSON.stringify(result, null, 2)
      );

      throw new Error(
        'Unexpected Gemini response structure'
      );
    }

    console.log(
      '[Gemini] Raw output:',
      text.substring(0, 200)
    );

    // ==============================
    // CLEAN JSON RESPONSE
    // ==============================

    const cleanJsonText = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    // ==============================
    // SAFE JSON PARSING
    // ==============================

    let metadata;

    try {
      metadata = JSON.parse(cleanJsonText);
    } catch (parseError) {
      console.error(
        '[Gemini] JSON parse failed:',
        parseError.message
      );

      metadata = {
        title: 'Untitled Artwork',
        description: text.substring(0, 250),
        tags: ['digitalart'],
      };
    }

    // ==============================
    // VALIDATE RESPONSE
    // ==============================

    if (!metadata.title) {
      metadata.title = 'Untitled Artwork';
    }

    if (!metadata.description) {
      metadata.description =
        'A premium digital artwork collection piece.';
    }

    if (!Array.isArray(metadata.tags)) {
      metadata.tags = ['digitalart'];
    }

    console.log(
      `[Gemini] Analysis complete using ${usedModel}`
    );

    // ==============================
    // SUCCESS RESPONSE
    // ==============================

    return res.json({
      success: true,
      mode: 'gemini',
      model: usedModel,
      metadata,
    });
  } catch (err) {
    // ==============================
    // FINAL ERROR FALLBACK
    // ==============================

    console.error('[Gemini] Analysis FAILED');
    console.error('Message:', err.message);
    console.error(
      'Details:',
      err.response?.data || err
    );

    return res.json({
      success: true,
      mode: 'fallback_error',

      metadata: {
        title: 'Neon Genesis',
        description:
          'A futuristic cyberpunk-inspired artwork infused with glowing neon aesthetics and immersive visual storytelling.',
        tags: [
          'digitalart',
          'cyberpunk',
          'neon',
          'abstract',
          'futuristic',
        ],
      },

      error: err.message,
    });
  }
};