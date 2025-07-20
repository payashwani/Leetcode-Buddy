const axios = require('axios');
require('dotenv').config();

const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;

if (!TOGETHER_API_KEY) {
  throw new Error('TOGETHER_API_KEY is not set');
}

const fetchAIResponse = async (prompt, retries = 1) => {
  try {
    const response = await axios.post(
      'https://api.together.ai/v1/chat/completions',
      {
        model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000, // Increased for code snippets
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${TOGETHER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    if (retries > 0) {
      console.warn('Retrying AI request...', { retries });
      return await fetchAIResponse(prompt, retries - 1);
    }
    throw error;
  }
};

const safeParseJSON = (str) => {
  try {
    return JSON.parse(str);
  } catch (error) {
    console.error('JSON parse error:', error.message, { raw: str });
    return null;
  }
};

exports.getAIHelp = async (req, res) => {
  const { slug, language } = req.query;
  console.log(`getAIHelp called with slug: ${slug}, language: ${language}`);

  if (!slug || !language) {
    return res.status(400).json({ message: 'Slug and language are required' });
  }

  try {
    const prompt = `
Provide a detailed solution for the LeetCode problem with slug "${slug}" in ${language}. Structure the response as a JSON object with the following fields:
- code: The complete solution code (string, properly escaped).
- explanation: A clear explanation of the solution (string).
- pattern: The algorithmic pattern used (e.g., "Two Pointers", string).
- commonMistake: A common mistake users make (string).
- motivation: A motivational message (string).

Ensure the code is properly escaped for JSON (e.g., use \\n for newlines, \\t for tabs, \\ for backslashes). Example:
{
  "code": "def two_sum(nums, target):\\n    seen = {}\\n    for i, num in enumerate(nums):\\n        if target - num in seen:\\n            return [seen[target - num], i]\\n        seen[num] = i\\n    return []",
  "explanation": "Uses a hash map to store numbers and their indices...",
  "pattern": "Hash Table",
  "commonMistake": "Not checking for empty input",
  "motivation": "Great job tackling this problem!"
}
`;

    const apiResponse = await fetchAIResponse(prompt);
    console.log('Raw AI response:', JSON.stringify(apiResponse, null, 2)); // Debug log

    const content = apiResponse.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content in AI response');
    }

// Clean the AI response
const cleaned = content
  .replace(/```json|```/g, '') // remove backticks and markdown
  .trim();

// Now try parsing it
const parsedResponse = safeParseJSON(cleaned);

    if (!parsedResponse) {
      throw new Error('Invalid JSON response from AI');
    }

    // Validate required fields
    const { code, explanation, pattern, commonMistake, motivation } = parsedResponse;
    if (!code || !explanation) {
      throw new Error('Missing required fields in AI response');
    }

    res.status(200).json({
      code,
      explanation,
      pattern: pattern || 'Not specified',
      commonMistake: commonMistake || 'Not specified',
      motivation: motivation || 'Keep practicing!',
    });
  } catch (error) {
    console.error('getAIHelp error:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
    });
    res.status(500).json({
      message: 'Unable to retrieve AI help due to server issues',
      code: null,
      explanation: 'Unable to retrieve AI help due to server issues',
      pattern: null,
      commonMistake: null,
      motivation: 'Don’t give up! Try this problem again soon!',
    });
  }
};