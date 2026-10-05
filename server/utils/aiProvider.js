const Groq = require('groq-sdk');

let groqClient = null;

const getGroq = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.includes('PASTE')) {
    throw new Error('GROQ_API_KEY is not configured in server/.env');
  }
  if (!groqClient) {
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
};

// Supported models in order of fallback
const GROQ_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-70b-versatile',
  'llama3-70b-8192',
  'mixtral-8x7b-32768',
];

const generateAI = async (prompt, maxTokens = 2048) => {
  let groq;
  try {
    groq = getGroq();
  } catch (err) {
    throw new Error(err.message);
  }

  let lastError = null;

  for (const model of GROQ_MODELS) {
    try {
      const response = await groq.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature: 0.7,
      });

      const text = response.choices?.[0]?.message?.content;
      if (text) return text;
    } catch (err) {
      lastError = err;
      const status = err.status || err.statusCode;
      const msg = err.message || '';

      // Handle specific error codes
      if (status === 401 || msg.includes('401') || msg.includes('api_key')) {
        throw new Error('Invalid Groq API key configured on server.');
      }
      if (status === 400) {
        throw new Error('Invalid request parameters sent to AI provider.');
      }
      if (status === 429 || msg.includes('429') || msg.includes('rate_limit')) {
        console.warn(`Groq rate limited on model ${model}, trying fallback...`);
        continue;
      }
      if (msg.includes('decommissioned') || msg.includes('model_not_active')) {
        console.warn(`Model ${model} unavailable, trying fallback...`);
        continue;
      }
    }
  }

  const cleanMessage = lastError?.message || 'AI service temporarily unavailable. Please try again.';
  throw new Error(cleanMessage);
};

module.exports = { generateAI };
