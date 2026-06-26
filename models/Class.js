// models/Class.js

const mongoose = require("mongoose");

const ClassSchema = new mongoose.Schema({

    topic: {type: String, default: "Deutsch Assessment Class"},
    classDate: {type: Date, required: true},
    startTime: {type: String, required: true},
    endTime: {type: String, required: true},
    batch: {type: String, required: true},
    medium: {type: String, required: true},
    level: {type: String, required: true},
    tutor: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    zoomMeetingId: String,
    zoomJoinUrl: String,
    zoomStartUrl: String,
    createdAt: {type: Date, default: Date.now},
    status: {type: String, enum: ["UPCOMING", "ONGOING", "COMPLETED"], default: "UPCOMING"},

    // Transcript related fields
    transcript: {type: String, default: null },
    transcriptLanguage: {type: String, default: null },
    transcriptUploadedAt: {type: Date },
    assessmentGenerated: {type: Boolean, default: false }

});

module.exports = mongoose.model("Class", ClassSchema);