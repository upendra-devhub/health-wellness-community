const mongoose = require('mongoose');
const { Schema } = mongoose;

const dailyLogSchema = new Schema({
  date: {
    type: String,
    required: true,
    match: /^\d{4}-\d{2}-\d{2}$/
  },
  walkingSteps: {
    type: Number,
    min: 0,
    default: 0
  },
  runningKm: {
    type: Number,
    min: 0,
    default: 0
  },
  sleepHours: {
    type: Number,
    min: 0,
    default: 0
  },
  waterIntake: {
    type: Number,
    min: 0,
    default: 0
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 280,
    default: ''
  }
}, {
  _id: false,
  timestamps: true
});

const healthTrackerSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  waterIntake: {
    type: Number,
    default: 0
  },
  waterGoal: {
    type: Number,
    required: true,
    default: 0
  },
  steps: {
    type: Number,
    default: 0
  },
  dailyLogs: {
    type: [dailyLogSchema],
    default: []
  }
}, {
  timestamps: true
});

healthTrackerSchema.index({ userId: 1 });

module.exports = mongoose.model('HealthTracker', healthTrackerSchema);
