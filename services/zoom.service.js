// services/zoom.service.js
const axios = require('axios');
const Meeting = require('../models/Summary');
const aiService = require('./ai.service');
const zoomAccounts = require('../config/zoomAccounts');

exports.handleRecordingCompleted = async (payload) => {
  const meeting = payload.object;

  const transcriptFile = meeting.recording_files.find(
    f => f.file_type === "TRANSCRIPT"
  );

  if (!transcriptFile) {
    console.log("No transcript found");
    return;
  }

  const content = await aiService.generateStructuredContent(cleaned);

  await Meeting.create({
    meetingId: meeting.id,
    topic: meeting.topic,
    transcript: cleaned,
    extractedContent: content
  });
};