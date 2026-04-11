const mongoose = require('mongoose');
const { Schema } = mongoose;

const postSchema = new Schema({
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  photo: {
    type: String 
  },
  likes: {
    type: Number,
    default: 0 
  },
  comments: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    description: {
      type: String
    }
  }],
  tags: [{
    type: String
  }],
  communityId: {
    type: Schema.Types.ObjectId,
    ref: 'Community'
  },
  timestamp: {
    type: Date,
    default: Date.now 
  }
});

module.exports = mongoose.model('Post', postSchema);