// const mongoose = require('mongoose');

// const recommendationSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   description: {
//     type: String,
//     trim: true
//   },
//   type: {
//     type: String,
//     enum: ['immediate', 'lifestyle', 'monitoring', 'medical'],
//     default: 'immediate'
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
//   description: {
//     type: String,
//     trim: true
//   },
//   recommendations: [recommendationSchema],
//   status: {
//     type: String,
//     enum: ['active', 'completed', 'paused'],
//     default: 'active'
//   },
//   isActive: {
//     type: Boolean,
//     default: true
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
//   timestamps: true
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

// // Add indexes for better query performance
// carePlanSchema.index({ userId: 1, isActive: 1 });
// carePlanSchema.index({ contextId: 1 });
// carePlanSchema.index({ status: 1 });

// module.exports = mongoose.model('CarePlan', carePlanSchema);
const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['immediate', 'lifestyle', 'monitoring', 'medical'],
    default: 'immediate'
  },
  priority: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  dueDate: Date,
  notes: String
});

const carePlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contextId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HealthContext',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  recommendations: [recommendationSchema],
  status: {
    type: String,
    enum: ['active', 'completed', 'paused'],
    default: 'active'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  progress: {
    completedRecommendations: {
      type: Number,
      default: 0
    },
    totalRecommendations: {
      type: Number,
      default: 0
    },
    completionPercentage: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Pre-save middleware to calculate progress
carePlanSchema.pre('save', function(next) {
  if (this.recommendations && this.recommendations.length > 0) {
    const completed = this.recommendations.filter(rec => rec.completed).length;
    const total = this.recommendations.length;
    
    this.progress.completedRecommendations = completed;
    this.progress.totalRecommendations = total;
    this.progress.completionPercentage = Math.round((completed / total) * 100);
    
    // Auto-complete care plan if all recommendations are done
    if (completed === total && this.status === 'active') {
      this.status = 'completed';
    }
  }
  next();
});

// Add indexes for better query performance
carePlanSchema.index({ userId: 1, isActive: 1 });
carePlanSchema.index({ contextId: 1 });
carePlanSchema.index({ status: 1 });

module.exports = mongoose.model('CarePlan', carePlanSchema);