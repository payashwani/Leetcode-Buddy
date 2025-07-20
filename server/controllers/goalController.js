const Goal = require('../models/Goal');
const axios = require('axios');

const generateRoadmap = async (dailyTime, learningStyle, problemCount, targetDate, topic) => {
  const days = Math.max(1, Math.ceil((new Date(targetDate) - new Date()) / (1000 * 60 * 60 * 24)));
  const problemsPerDay = Math.ceil(problemCount / days);
  const normalizedTopic = topic.replace(/-/g, ' ').replace(/\bList\b/, 'Lists'); // Normalize to "Linked Lists"

  const getDifficulty = (day) => day <= 10 ? 'easy' : day <= 20 ? 'medium' : 'hard';

  const fallbackRoadmap = (() => {
    const tasks = [];
    const segmentDays = Math.ceil(days / 3);
    for (let i = 0; i < 3; i++) {
      const startDay = i * segmentDays + 1;
      const endDay = Math.min(startDay + segmentDays - 1, days);
      const difficulty = getDifficulty(startDay);
      const videoTask = learningStyle === 'Video' ? `Watch a 10-minute ${difficulty} ${normalizedTopic} video tutorial.` : '';
      tasks.push(`Day ${startDay}-${endDay}: Solve ${problemsPerDay} ${difficulty} ${normalizedTopic} problems daily, spending ${dailyTime} minutes. ${videoTask}`);
    }
    tasks.push(`Day ${days}: Review all ${normalizedTopic} problems with a quiz.`);
    return tasks.join('. ');
  })();

  try {
    const prompt = `You are an expert coding tutor specializing in LeetCode problems. Create a concise, personalized learning roadmap for a student with a ${learningStyle.toLowerCase()} learning style aiming to solve ${problemCount} LeetCode ${normalizedTopic} problems in ${days} days, with ${dailyTime} minutes daily. The roadmap should include specific daily tasks (e.g., "Day 1-2: Solve 2 easy ${normalizedTopic} problems, watch a 10-minute video") with a clear progression from easy (days 1-10), medium (days 11-20), to hard (days 21+) problems, and end with a review or quiz. Output as a single paragraph, max 150 words, in a motivational tone. Do not include arrows (e.g., "➔"), specific LeetCode problem titles, external links, or Markdown links (e.g., "[text](url)"). Avoid repetitive tasks and ensure variety in daily activities (e.g., problem-solving, video tutorials, concept reviews).`;

    const response = await axios.post(
      'https://api.together.xyz/v1/chat/completions',
      {
        model: 'meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    let roadmap = response.data.choices[0].message.content.trim();
    if (roadmap.length === 0) return fallbackRoadmap;

    // Strip any residual Markdown links
    roadmap = roadmap.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
    return roadmap;
  } catch (error) {
    console.error(`Together API error for ${normalizedTopic}:`, error.message);
    return fallbackRoadmap;
  }
};

exports.createGoal = async (req, res, next) => {
  const { title, targetDate, problemCount, dailyTime, learningStyle } = req.body;
  try {
    if (!title || !targetDate || !problemCount || !dailyTime || !learningStyle) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const topics = title
      .replace(/Master\s*/i, '')
      .replace(/\s*and\s*/gi, ',')
      .split(',')
      .map(t => t.trim())
      .filter(t => t)
      .map(t => {
        t = t.replace(/-/g, ' ').replace(/\bList\b/, 'Lists');
        return t.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      });
    if (!topics.length) {
      return res.status(400).json({ message: 'At least one topic is required' });
    }
    const topicRoadmaps = await Promise.all(topics.map(async topic => ({
      name: topic,
      roadmap: await generateRoadmap(dailyTime, learningStyle, Math.ceil(problemCount / topics.length), targetDate, topic)
    })));
    const goal = new Goal({
      userId: req.user.userId,
      title,
      targetDate,
      problemCount,
      dailyTime,
      learningStyle,
      topics: topicRoadmaps,
    });
    await goal.save();
    res.status(201).json({ message: 'Goal created', goal });
  } catch (error) {
    console.error('Create goal error:', error);
    next(error);
  }
};

exports.getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ userId: req.user.userId });
    res.status(200).json(goals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    next(error);
  }
};

exports.updateGoal = async (req, res, next) => {
  const { id } = req.params;
  const { progress, missedGoalReason } = req.body;
  try {
    const goal = await Goal.findOne({ _id: id, userId: req.user.userId });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    if (progress !== undefined) goal.progress = progress;
    if (missedGoalReason) goal.missedGoalReason = missedGoalReason;
    await goal.save();
    res.status(200).json({ message: 'Goal updated', goal });
  } catch (error) {
    console.error('Update goal error:', error);
    next(error);
  }
};

exports.deleteGoal = async (req, res, next) => {
  const { id } = req.params;
  try {
    const goal = await Goal.findOneAndDelete({ _id: id, userId: req.user.userId });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    res.status(200).json({ message: 'Goal deleted' });
  } catch (error) {
    console.error('Delete goal error:', error);
    next(error);
  }
};