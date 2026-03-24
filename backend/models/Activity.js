const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  appName: { type: String, required: true },       // e.g. "VS Code", "Chrome"
  windowTitle: { type: String, default: '' },       // e.g. "App.js — WorkPulse"
  category: {
    type: String,
    enum: ['coding', 'browsing', 'communication', 'design', 'docs', 'meeting', 'idle', 'other'],
    default: 'other',
  },
  durationSeconds: { type: Number, default: 0 },
  isPrivate: { type: Boolean, default: false },     // Employee marked private
  hour: { type: Number },                           // 0–23 for hourly aggregation
});

activitySchema.pre('save', function (next) {
  this.hour = new Date(this.date).getHours();
  next();
});

module.exports = mongoose.model('Activity', activitySchema);
