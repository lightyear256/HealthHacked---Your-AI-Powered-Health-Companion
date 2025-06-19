
const mongoose = require('mongoose');

const healthContextSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    default: () => 'session-' + Date.now(),
    index: true
  },
  primaryConcern: {
    type: String,
    required: true,
    trim: true
  },
  symptoms: [{
    type: String,
    trim: true
  }],
  severity: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'monitoring', 'escalated'],
    default: 'active'
  },
  chatHistory: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  aiResponses: [{
    potentialCauses: [String],
    immediateSteps: [String],
    seekHelpIf: [String],
    followUpQuestion: String,
    confidence: Number,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  followUpDate: Date,
  resolutionNotes: String,
  resolvedAt: Date
}, {
  timestamps: true
});

// Add message to chat history
healthContextSchema.methods.addMessage = function(role, content) {
  this.chatHistory.push({ role, content });
  return this.save();
};

// Add AI response data
healthContextSchema.methods.addAIResponse = function(responseData) {
  this.aiResponses.push(responseData);
  return this.save();
};

// Get recent messages for context
healthContextSchema.methods.getRecentMessages = function(limit = 5) {
  return this.chatHistory.slice(-limit);
};

// Static method to find active contexts for user
healthContextSchema.statics.findActiveForUser = function(userId) {
  return this.find({
    userId,
    status: 'active'
  }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('HealthContext', healthContextSchema);