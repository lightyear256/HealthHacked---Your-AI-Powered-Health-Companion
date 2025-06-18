// //================================
// // File: backend/src/models/ChatHistory.js
// // ================================
// const mongoose = require('mongoose');

// const messageSchema = new mongoose.Schema({
//   role: {
//     type: String,
//     enum: ['user', 'assistant'],
//     required: true
//   },
//   content: {
//     type: String,
//     required: [true, 'Message content is required'],
//     trim: true,
//     maxlength: [2000, 'Message cannot exceed 2000 characters']
//   },
//   timestamp: {
//     type: Date,
//     default: Date.now
//   },
//   chatbotType: {
//     type: String,
//     enum: ['primary', 'secondary'],
//     default: 'primary'
//   },
//   metadata: {
//     intent: String,
//     confidence: Number,
//     processingTime: Number,
//     tokensUsed: Number
//   }
// });

// const chatHistorySchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//     index: true
//   },
//   sessionId: {
//     type: String,
//     required: true,
//     index: true
//   },
//   contextId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'HealthContext',
//     index: true
//   },
//   messages: [messageSchema],
//   summary: {
//     totalMessages: {
//       type: Number,
//       default: 0
//     },
//     lastActivity: {
//       type: Date,
//       default: Date.now
//     },
//     topics: [String],
//     sentiment: {
//       type: String,
//       enum: ['positive', 'neutral', 'negative', 'concerned'],
//       default: 'neutral'
//     }
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   }
// }, {
//   timestamps: true
// });

// // Indexes
// chatHistorySchema.index({ userId: 1, sessionId: 1 });
// chatHistorySchema.index({ 'messages.timestamp': -1 });
// chatHistorySchema.index({ 'summary.lastActivity': -1 });

// // Pre-save middleware to update summary
// chatHistorySchema.pre('save', function(next) {
//   if (this.messages && this.messages.length > 0) {
//     this.summary.totalMessages = this.messages.length;
//     this.summary.lastActivity = this.messages[this.messages.length - 1].timestamp;
//   }
//   next();
// });

// // Instance method to add message
// chatHistorySchema.methods.addMessage = function(role, content, chatbotType = 'primary', metadata = {}) {
//   this.messages.push({
//     role,
//     content,
//     chatbotType,
//     metadata,
//     timestamp: new Date()
//   });
//   return this.save();
// };

// // Instance method to get recent messages
// chatHistorySchema.methods.getRecentMessages = function(limit = 10) {
//   return this.messages.slice(-limit);
// };

// // Static method to find by session
// chatHistorySchema.statics.findBySession = function(sessionId) {
//   return this.findOne({ sessionId }).populate('userId', 'profile.name');
// };

// // Static method to get user's chat sessions
// chatHistorySchema.statics.getUserSessions = function(userId, limit = 20) {
//   return this.find({ userId })
//     .sort({ 'summary.lastActivity': -1 })
//     .limit(limit)
//     .select('sessionId summary createdAt');
// };

// module.exports = mongoose.model('ChatHistory', chatHistorySchema);

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const chatHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  messages: [messageSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('ChatHistory', chatHistorySchema);