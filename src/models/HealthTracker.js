const mongoose = require('mongoose');
const { Schema } = mongoose;

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
  running: {
    type: Number,
    default: 0
  },
  sleep: {
    type: Number,
    default: 0
  },
  dailyLogs: {
    type: [
      {
        date: {
          type: String,
          required: true
        },
        walking: {
          type: Number,
          default: 0
        },
        running: {
          type: Number,
          default: 0
        },
        sleep: {
          type: Number,
          default: 0
        }
      }
    ],
    default: []
  }
});

module.exports = mongoose.model('HealthTracker', healthTrackerSchema);
