// models/Summary.js
const mongoose = require('mongoose');

const SummarySchema = new mongoose.Schema(
  {
    meetingId: { type: String, required: true, index: true },
    meetingTopic: { type: String, required: true },

    batch: { type: String },
    level: { type: String },
    extractedContent: {
      topics: [String],
      vocabulary: [String],
      grammar: [String],
      examples: [String]
    },

    transcript: String,
    createdAt: { type: Date, default: Date.now }
  });

module.exports = mongoose.model('Summary', SummarySchema);
