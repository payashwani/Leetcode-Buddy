const Problem = require('../models/Problem');
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
        max_tokens: 500,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${TOGETHER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.choices?.[0]?.message?.content;
  } catch (error) {
    if (retries > 0) {
      console.warn('Retrying AI request...', { retries });
      return await fetchAIResponse(prompt, retries - 1);
    }
    throw error;
  }
};

exports.saveProblem = async (req, res) => {
  const { problem, slug, difficulty, mood, status, patterns, notes } = req.body;
  const userId = req.user.userId;
  console.log(`saveProblem called with slug: ${slug}, problem: ${problem}`);
  try {
    const newProblem = new Problem({
      userId,
      problem,
      slug,
      difficulty,
      mood,
      status,
      patterns,
      notes,
    });
    await newProblem.save();
    res.status(201).json(newProblem);
  } catch (error) {
    console.error('saveProblem error:', error);
    res.status(500).json({ message: 'Failed to save problem' });
  }
};

exports.getProblems = async (req, res) => {
  const userId = req.user.userId;
  console.log(`getProblems called for userId: ${userId}`);
  try {
    const problems = await Problem.find({ userId });
    res.status(200).json(problems);
  } catch (error) {
    console.error('getProblems error:', error);
    res.status(500).json({ message: 'Failed to fetch problems' });
  }
};

exports.deleteProblem = async (req, res) => {
  const { id } = req.params;
  console.log(`deleteProblem called with id: ${id}`);
  try {
    await Problem.findByIdAndDelete(id);
    res.status(200).json({ message: 'Problem deleted' });
  } catch (error) {
    console.error('deleteProblem error:', error);
    res.status(500).json({ message: 'Failed to delete problem' });
  }
};

exports.getAIRecap = async (req, res) => {
  const userId = req.user.userId;
  console.log(`getAIRecap called for userId: ${userId}`);
  try {
    // Fetch problems from the past week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const problems = await Problem.find({
      userId,
      createdAt: { $gte: oneWeekAgo },
    });

    if (!problems.length) {
      return res.status(200).json({
        recap: '• No problems logged this week.\n• Start solving problems and add notes to get personalized insights!\n• Try an Easy problem to build momentum.',
      });
    }

    // Stats
    const solvedCount = problems.filter((p) => p.status.includes('Solved')).length;
    const revisionCount = problems.filter((p) => p.status.includes('Needs Revision')).length;
    const couldntSolveCount = problems.filter((p) => p.status.includes("Couldn't Solve")).length;
    const difficultyBreakdown = {
      Easy: problems.filter((p) => p.difficulty === 'Easy').length,
      Medium: problems.filter((p) => p.difficulty === 'Medium').length,
      Hard: problems.filter((p) => p.difficulty === 'Hard').length,
    };

    // Mood analysis
    const moodCounts = {
      Easy: problems.filter((p) => p.mood === 'Easy').length,
      Moderate: problems.filter((p) => p.mood === 'Moderate').length,
      Challenging: problems.filter((p) => p.mood === 'Challenging').length,
      Frustrating: problems.filter((p) => p.mood === 'Frustrating').length,
    };
    const lowConfidence =
      (moodCounts.Challenging + moodCounts.Frustrating) / problems.length > 0.5 ||
      couldntSolveCount / problems.length > 0.33;

    // Progress analysis
    const mediumHardCount = difficultyBreakdown.Medium + difficultyBreakdown.Hard;
    const progressTrend =
      mediumHardCount > problems.length / 2
        ? 'strong progress tackling tougher problems'
        : solvedCount > problems.length / 2
        ? 'steady progress with consistent solves'
        : 'room to push into Medium/Hard problems';

    // Notes for AI analysis
    const notes = problems.map((p) => ({
      problem: p.problem,
      notes: p.notes || '',
      patterns: p.patterns.join(', '),
      difficulty: p.difficulty,
      mood: p.mood,
      status: p.status.join(', '),
    }));

    // AI analysis prompt
    const prompt = `Analyze the following user notes from their DSA problem journal for the past week. Focus on:
1. Specific mistakes in notes (e.g., "forgot edge cases", "wrong time complexity").
2. Difficulty levels (Easy: ${difficultyBreakdown.Easy}, Medium: ${difficultyBreakdown.Medium}, Hard: ${difficultyBreakdown.Hard}) to assess strengths/weaknesses.
3. Patterns (e.g., sliding window, greedy) and statuses (Solved: ${solvedCount}, Needs Revision: ${revisionCount}, Couldn't Solve: ${couldntSolveCount}).
Return a concise recap as 2-3 bullet points, identifying mistakes, suggesting solutions (e.g., practice specific problems, review techniques), and recommending focus areas. Use "•" for bullets.

Data:
${notes
      .map(
        (n, i) =>
          `Problem ${i + 1}: ${n.problem}\nDifficulty: ${n.difficulty}\nStatus: ${n.status}\nNotes: ${n.notes || 'None'}\nPatterns: ${n.patterns || 'None'}\nMood: ${n.mood}`
      )
      .join('\n\n')}

Example:
• Mistake: Forgot edge cases in array problems.
• Solution: Practice "Two Sum" and review boundary conditions.
• Focus: Study sliding window for Medium problems.`;

    // Build recap
    let recap = [
      `• Weekly Stats: ${problems.length} problems (Easy: ${difficultyBreakdown.Easy}, Medium: ${difficultyBreakdown.Medium}, Hard: ${difficultyBreakdown.Hard}).`,
      `• Status: ${solvedCount} solved, ${revisionCount} need revision, ${couldntSolveCount} couldn't solve.`,
      `• Progress: You're showing ${progressTrend}. ${
        mediumHardCount > 0 ? 'Keep challenging yourself!' : 'Try a Medium problem this week.'
      }`,
      `• Confidence: ${
        lowConfidence
          ? `Mood (${moodCounts.Frustrating} Frustrating, ${moodCounts.Challenging} Challenging) shows challenges. Small steps lead to big wins—try revisiting a familiar problem!`
          : `Mood (${moodCounts.Easy} Easy, ${moodCounts.Moderate} Moderate) reflects confidence. Push into tougher problems to grow!`
      }`,
    ];

    // AI insights
    try {
      const aiResponse = await fetchAIResponse(prompt);
      const aiBullets = aiResponse
        .split('\n')
        .filter((line) => line.trim().startsWith('•') && line.trim().length > 2)
        .slice(0, 3); // Limit to 3 bullets
      recap = [...recap, ...aiBullets];
    } catch (error) {
      console.error('AI recap generation error:', error);
      recap.push(
        '• Mistake Analysis Failed: Review notes manually for patterns.',
        '• Solution: Revisit problems marked "Needs Revision".',
        '• Focus: Strengthen core patterns like those in your recent problems.'
      );
    }

    res.status(200).json({ recap: recap.join('\n') });
  } catch (error) {
    console.error('getAIRecap error:', error);
    res.status(500).json({ message: 'Failed to generate AI recap' });
  }
};