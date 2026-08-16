// models/Answer.js

const mongoose = require("mongoose");

const AnswerSchema = new mongoose.Schema({

    // =========================================
    // Assessment
    // =========================================

    assessment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assessment",
        required: true
    },


    // =========================================
    // Student
    // =========================================

    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },


    // =========================================
    // Class
    // =========================================

    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
        required: true
    },


    // =========================================
    // Uploaded Answer File
    // =========================================

    answerFile: {
        fileName: {
            type: String,
            required: true
        },

        filePath: {
            type: String,
            required: true
        },

        fileType: {
            type: String,
            enum: [
                "application/pdf",
                "image/jpeg",
                "image/png"
            ],
            required: true
        },

        uploadedAt: {
            type: Date,
            default: Date.now
        }

    },


    // =========================================
    // Submission Status
    // =========================================

    status: {
        type: String,
        enum: [
            "SUBMITTED",
            "PROCESSING",
            "MARKED"
        ],
        default: "SUBMITTED"
    },


    // =========================================
    // AI Assessment Result
    // =========================================

    totalMarksAwarded: {
        type: Number,
        default: 0
    },

    overallFeedback: {
        type: String,
        default: ""
    },

    questionResults: [
        {
            questionNo: {
                type: Number,
                required: true
            },

            taskCompletion: {
                type: Number,
                default: 0
            },

            taskReason: {
                type: String,
                default: ""
            },

            xlmScore: {
                type: Number,
                default: 0
            },

            languageScore: {
                type: Number,
                default: 0
            },

            finalPercentage: {
                type: Number,
                default: 0
            },

            allocatedMarks: {
                type: Number,
                required: true
            },

            awardedMarks: {
                type: Number,
                default: 0
            }
        }
    ],


    // =========================================
    // Submission / Marking Dates
    // =========================================

    submittedAt: {
        type: Date,
        default: Date.now
    },

    markedAt: {
        type: Date
    },


    // =========================================
    // Created At
    // =========================================

    createdAt: {
        type: Date,
        default: Date.now
    },

    // =========================================
    // OCR
    // =========================================

    ocrAnswers: [
        {
            questionNo: {
                type: Number,
                required: true
            },

            answer: {
                type: String,
                default: ""
            }
        }
    ],

    ocrStatus: {
        type: String,
        enum: [
            "PENDING",
            "PROCESSING",
            "COMPLETED",
            "FAILED"
        ],
        default: "PENDING"
    },

    ocrCompletedAt: {
        type: Date
    },

    ocrError: {
        type: String,
        default: ""
    },

});


// =========================================
// Prevent duplicate submission
// =========================================

AnswerSchema.index(
    {
        assessment: 1,
        student: 1
    },
    {
        unique: true
    }

);


module.exports = mongoose.model(
    "Answer",
    AnswerSchema
);