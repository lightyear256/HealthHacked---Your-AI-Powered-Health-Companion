// // ================================
// // File: backend/src/models/CarePlan.js
// // ================================
// const mongoose = require('mongoose');

// const recommendationSchema = new mongoose.Schema({
//   type: {
//     type: String,
//     enum: ['lifestyle', 'immediate', 'monitoring', 'medical'],
//     required: true
//   },
//   title: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   description: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   priority: {
//     type: Number,
//     min: 1,
//     max: 5,
//     default: 3
//   },
//   completed: {
//     type: Boolean,
//     default: false
//   },
//   completedAt: Date,
//   dueDate: Date,
//   notes: String
// });

// const carePlanSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//     index: true
//   },
//   contextId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'HealthContext',
//     required: true,
//     index: true
//   },
//   title: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   description: String,
//   recommendations: [recommendationSchema],
//   nextFollowUp: {
//     type: Date,
//     default: function() {
//       return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
//     }
//   },
//   lastNotificationSent: Date,
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   status: {
//     type: String,
//     enum: ['active', 'completed', 'paused', 'cancelled'],
//     default: 'active'
//   },
//   progress: {
//     completedRecommendations: {
//       type: Number,
//       default: 0
//     },
//     totalRecommendations: {
//       type: Number,
//       default: 0
//     },
//     completionPercentage: {
//       type: Number,
//       default: 0
//     }
//   }
// }, {
//   timestamps: true,
//   toJSON: { virtuals: true },
//   toObject: { virtuals: true }
// });

// // Indexes
// carePlanSchema.index({ userId: 1, isActive: 1 });
// carePlanSchema.index({ contextId: 1 });
// carePlanSchema.index({ nextFollowUp: 1 });
// carePlanSchema.index({ status: 1 });

// // Virtual for overdue status
// carePlanSchema.virtual('isOverdue').get(function() {
//   return this.nextFollowUp && this.nextFollowUp < new Date();
// });

// // Pre-save middleware to calculate progress
// carePlanSchema.pre('save', function(next) {
//   if (this.recommendations && this.recommendations.length > 0) {
//     const completed = this.recommendations.filter(rec => rec.completed).length;
//     const total = this.recommendations.length;
    
//     this.progress.completedRecommendations = completed;
//     this.progress.totalRecommendations = total;
//     this.progress.completionPercentage = Math.round((completed / total) * 100);
    
//     // Auto-complete care plan if all recommendations are done
//     if (completed === total && this.status === 'active') {
//       this.status = 'completed';
//     }
//   }
//   next();
// });

// // Instance method to add recommendation
// carePlanSchema.methods.addRecommendation = function(recommendation) {
//   this.recommendations.push(recommendation);
//   return this.save();
// };

// // Instance method to complete recommendation
// carePlanSchema.methods.completeRecommendation = function(recommendationId, notes = '') {
//   const recommendation = this.recommendations.id(recommendationId);
//   if (recommendation) {
//     recommendation.completed = true;
//     recommendation.completedAt = new Date();
//     recommendation.notes = notes;
//   }
//   return this.save();
// };

// // Instance method to schedule next follow-up
// carePlanSchema.methods.scheduleNextFollowUp = function(hours = 24) {
//   this.nextFollowUp = new Date(Date.now() + hours * 60 * 60 * 1000);
//   return this.save();
// };

// // Static method to find plans needing follow-up
// carePlanSchema.statics.findNeedingFollowUp = function() {
//   return this.find({
//     isActive: true,
//     status: 'active',
//     nextFollowUp: { $lte: new Date() }
//   }).populate('userId', 'email profile.name preferences')
//     .populate('contextId', 'primaryConcern symptoms');
// };

// // Static method to get user's active plans
// carePlanSchema.statics.getActiveForUser = function(userId) {
//   return this.find({
//     userId,
//     isActive: true,
//     status: { $in: ['active', 'paused'] }
//   }).populate('contextId', 'primaryConcern symptoms status');
// };

// module.exports = mongoose.model('CarePlan', carePlanSchema);

const mongoose = require('mongoose');

const carePlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  recommendations: [{
    type: String,
    description: String,
    completed: {
      type: Boolean,
      default: false
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CarePlan', carePlanSchema);