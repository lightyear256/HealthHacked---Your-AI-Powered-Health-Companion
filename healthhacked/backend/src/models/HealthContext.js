// // ================================
// // File: backend/src/models/HealthContext.js
// // ================================
// const mongoose = require('mongoose');

// const healthContextSchema = new mongoose.Schema({
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
//   primaryConcern: {
//     type: String,
//     required: [true, 'Primary concern is required'],
//     trim: true,
//     maxlength: [500, 'Primary concern cannot exceed 500 characters']
//   },
//   symptoms: [{
//     type: String,
//     trim: true
//   }],
//   severity: {
//     type: Number,
//     min: 1,
//     max: 10,
//     default: 3
//   },
//   duration: {
//     type: String,
//     trim: true
//   },
//   additionalInfo: {
//     triggers: [String],
//     frequency: String,
//     location: String,
//     description: String,
//     previousTreatments: [String]
//   },
//   status: {
//     type: String,
//     enum: ['active', 'resolved', 'monitoring', 'escalated'],
//     default: 'active',
//     index: true
//   },
//   aiAssessment: {
//     potentialCauses: [String],
//     immediateSteps: [String],
//     seekHelpIf: [String],
//     riskLevel: {
//       type: String,
//       enum: ['low', 'medium', 'high', 'critical'],
//       default: 'low'
//     }
//   },
//   followUpDate: {
//     type: Date,
//     default: function() {
//       return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
//     }
//   },
//   resolutionNotes: String,
//   resolvedAt: Date
// }, {
//   timestamps: true,
//   toJSON: { virtuals: true },
//   toObject: { virtuals: true }
// });

// // Indexes
// healthContextSchema.index({ userId: 1, status: 1 });
// healthContextSchema.index({ sessionId: 1 });
// healthContextSchema.index({ createdAt: -1 });
// healthContextSchema.index({ followUpDate: 1 });

// // Virtual for days since creation
// healthContextSchema.virtual('daysSinceCreated').get(function() {
//   const now = new Date();
//   const diffTime = Math.abs(now - this.createdAt);
//   return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
// });

// // Virtual for chat messages
// healthContextSchema.virtual('chatMessages', {
//   ref: 'ChatHistory',
//   localField: 'sessionId',
//   foreignField: 'sessionId'
// });

// // Instance method to mark as resolved
// healthContextSchema.methods.markResolved = function(notes = '') {
//   this.status = 'resolved';
//   this.resolutionNotes = notes;
//   this.resolvedAt = new Date();
//   return this.save();
// };

// // Instance method to escalate
// healthContextSchema.methods.escalate = function() {
//   this.status = 'escalated';
//   this.severity = Math.min(this.severity + 2, 10);
//   return this.save();
// };

// // Static method to find active contexts for user
// healthContextSchema.statics.findActiveForUser = function(userId) {
//   return this.find({userId,
//     status: 'active'
//   }).sort({ createdAt: -1 });
// };

// // Static method to find contexts needing follow-up
// healthContextSchema.statics.findNeedingFollowUp = function() {
//   return this.find({
//     status: 'active',
//     followUpDate: { $lte: new Date() }
//   }).populate('userId', 'email profile.name preferences');
// };

// module.exports = mongoose.model('HealthContext', healthContextSchema);
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
    index: true
  },
  primaryConcern: {
    type: String,
    required: true,
    trim: true
  },
  symptoms: [String],
  severity: {
    type: Number,
    min: 1,
    max: 10,
    default: 3
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'monitoring', 'escalated'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('HealthContext', healthContextSchema);