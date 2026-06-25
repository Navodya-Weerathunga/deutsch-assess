// models/User.js

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    regNo: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['ADMIN', 'STUDENT', 'TUTOR'], default: 'STUDENT' },
    medium: { type: [String], required: function() { return this.role === 'STUDENT' || this.role === 'TUTOR'; }},
    batch: { type: [String], required: function() { return this.role === 'STUDENT' || this.role === 'TUTOR'; }},
    plan: { type: String, enum: ['PLATINUM', 'SILVER'], default: 'PLATINUM', required: function() { return this.role === 'STUDENT'; }},
    status: { type: String, enum: ['ONGOING', 'WITHDREW', 'COMPLETED', 'UNCERTAIN'], default: 'ONGOING', required: function() { return this.role === 'STUDENT'; }},
    tutorIncharged: { type: String, required: function() { return this.role === 'STUDENT'; }},
    assignedCourses: { type: [String], required: function() { return this.role === 'TUTOR' || this.role === 'STUDENT'; }},
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);