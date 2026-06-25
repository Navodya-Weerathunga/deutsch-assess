// models/Course.js

const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    level: { type: String, required: true },
    medium: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
