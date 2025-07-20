const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    problem: {
      type: String,
      required: true
    },
    slug: {
      type: String,
      required: true
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: true
    },
    mood: { type: String, enum: ['Easy', 'Moderate', 'Challenging', 'Frustrating'], required: true },
    status: {
      type: [String],
      enum: ['Solved', 'Needs Revision', "Couldn't Solve"],
      default: ['Needs Revision']
    },
    patterns: {
      type: [String],
      default: []
    },
    notes: {
      type: String,
      default: ''
    },
    aiSuggestions: {
      type: String,
      default: ''
    },
    solvedDate: { type: Date } // Added for Calendar Heatmap
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Problem', problemSchema);