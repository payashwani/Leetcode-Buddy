const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  targetDate: { type: Date, required: true },
  problemCount: { type: Number, required: true },
  progress: { type: Number, default: 0 },
  dailyTime: { type: Number, required: true },
  learningStyle: {
    type: String,
    enum: ['Visual', 'Code-first', 'Video'],
    required: true
  },
  topics: [{
    name: { type: String, required: true },
    roadmap: { type: String, required: true }
  }],
  missedGoalReason: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);