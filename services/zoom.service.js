// services/zoom.service.js

const axios = require("axios");
const Meeting = require("../models/Summary");
const aiService = require("./ai.service");
const zoomAccounts = require("../config/zoomAccounts");

// ======================================================
// Handle Zoom Recording Completed Webhook
// ======================================================

exports.handleRecordingCompleted = async (payload) => {

  try {

    const meeting = payload.object;

    const transcriptFile = meeting.recording_files.find(

      file => file.file_type === "TRANSCRIPT"

    );

    if (!transcriptFile) {

      console.log("No transcript found.");

      return;

    }

    // Download transcript
    const transcriptResponse = await axios.get(

      transcriptFile.download_url,

      {

        headers: {

          Authorization: `Bearer ${await exports.getAccessToken()}`

        }

      }

    );

    const cleaned = transcriptResponse.data;

    const content = await aiService.generateStructuredContent(cleaned);

    await Meeting.create({

      meetingId: meeting.id,

      topic: meeting.topic,

      transcript: cleaned,

      extractedContent: content

    });

    console.log("Meeting summary saved.");

  }

  catch (err) {

    console.error("Recording Processing Error:");

    console.error(err.response?.data || err.message);

  }

};

// ======================================================
// Generate Zoom Server-to-Server OAuth Token
// ======================================================

exports.getAccessToken = async () => {

  try {

    const response = await axios.post(

      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,

      {},

      {

        auth: {

          username: process.env.ZOOM_CLIENT_ID,

          password: process.env.ZOOM_CLIENT_SECRET

        }

      }

    );

    return response.data.access_token;

  }

  catch (err) {

    console.error("Zoom Access Token Error:");

    console.error(err.response?.data || err.message);

    throw err;

  }

};


// ======================================================
// Calculate Meeting Duration
// ======================================================

exports.calculateDuration = (startTime, endTime) => {

  const start = new Date(`1970-01-01T${startTime}:00`);

  const end = new Date(`1970-01-01T${endTime}:00`);

  return Math.floor((end - start) / 60000);

};


// ======================================================
// Create Zoom Meeting
// ======================================================

exports.createMeeting = async (meetingData) => {

  try {

    const token = await exports.getAccessToken();

    const duration = exports.calculateDuration(

      meetingData.startTime,

      meetingData.endTime

    );

    const startDateTime =
      `${meetingData.classDate}T${meetingData.startTime}:00`;

    const response = await axios.post(

      "https://api.zoom.us/v2/users/me/meetings",

      {

        topic: meetingData.topic,

        type: 2,

        start_time: startDateTime,

        duration: duration,

        timezone: "Asia/Colombo",

        settings: {

          host_video: true,

          participant_video: true,

          join_before_host: false,

          waiting_room: true,

          approval_type: 0,

          mute_upon_entry: true,

          auto_recording: "cloud"

        }

      },

      {

        headers: {

          Authorization: `Bearer ${token}`,

          "Content-Type": "application/json"

        }

      }

    );

    return response.data;

  }

  catch (err) {

    console.error("Zoom Meeting Creation Error:");

    console.error(err.response?.data || err.message);

    throw err;

  }

};