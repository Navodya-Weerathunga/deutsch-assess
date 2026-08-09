// models/Assessment.js

const mongoose = require("mongoose");

const AssessmentSchema = new mongoose.Schema({

    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
        required: true,
        unique: true
    },

    title: {
        type: String,
        required: true
    },

    topic: {
        type: String,
        required: true
    },

    level: {
        type: String,
        required: true
    },

    language: {
        type: String,
        default: "German"
    },

    instructions: {
        type: String,
        required: true
    },

    totalMarks: {
        type: Number,
        default: 100
    },

    questions: [{
        questionNo: {
            type: Number,
            required: true
        },
        question: {
            type: String,
            required: true
        },
        englishQuestion: {
            type: String,
            default: ""
        },
        marks: {
            type: Number,
            required: true
        }
    }],

    generatedBy: {
        type: String,
        default: "GPT"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model("Assessment", AssessmentSchema);