// const mongoose = require('mongoose');

// const sleepProfileSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//     unique: true,
//     index: true
//   },
//   chronotype: {
//     type: String,
//     enum: ['morning', 'evening', 'intermediate'],
//     default: 'intermediate'
//   },
//   weekdayBedtime: {
//     type: String,
//     default: '22:30', // HH:MM format
//     validate: {
//       validator: function(v) {
//         return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
//       },
//       message: 'Bedtime must be in HH:MM format'
//     }
//   },
//   weekdayWakeTime: {
//     type: String,
//     default: '06:30',
//     validate: {
//       validator: function(v) {
//         return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
//       },
//       message: 'Wake time must be in HH:MM format'
//     }
//   },
//   weekendBedtime: {
//     type: String,
//     default: '23:30'
//   },
//   weekendWakeTime: {
//     type: String,
//     default: '08:00'
//   },
//   targetSleepHours: {
//     type: Number,
//     default: 8,
//     min: 4,
//     max: 12
//   },
//   sleepEfficiency: {
//     type: Number,
//     default: 85, // percentage
//     min: 0,
//     max: 100
//   }
// }, {
//   timestamps: true
// });

// module.exports = mongoose.model('SleepProfile', sleepProfileSchema);

// // backend/src/models/SleepEntry.js
// const mongoose = require('mongoose');

// const sleepEntrySchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//     index: true
//   },
//   date: {
//     type: Date,
//     required: true,
//     index: true
//   },
//   bedtime: {
//     type: Date,
//     required: true
//   },
//   wakeTime: {
//     type: Date,
//     required: true
//   },
//   sleepQuality: {
//     type: Number,
//     min: 1,
//     max: 10,
//     default: 5
//   },
//   stanfordSleepinessScore: {
//     type: Number,
//     min: 1,
//     max: 7,
//     default: 4
//   },
//   productivitySelfReport: {
//     type: Number,
//     min: 1,
//     max: 10
//   },
//   notes: {
//     type: String,
//     trim: true,
//     maxlength: 500
//   },
//   mood: {
//     type: String,
//     enum: ['excellent', 'good', 'average', 'poor', 'terrible'],
//     default: 'average'
//   },
//   caffeine: {
//     consumed: { type: Boolean, default: false },
//     amount: { type: Number, min: 0 }, // mg
//     lastIntake: { type: Date }
//   },
//   exercise: {
//     type: Boolean,
//     default: false
//   },
//   stress: {
//     type: Number,
//     min: 1,
//     max: 10,
//     default: 5
//   }
// }, {
//   timestamps: true
// });

// // Compound index for efficient querying
// sleepEntrySchema.index({ userId: 1, date: -1 });

// // Calculate sleep duration
// sleepEntrySchema.virtual('sleepDuration').get(function() {
//   if (this.bedtime && this.wakeTime) {
//     return (this.wakeTime - this.bedtime) / (1000 * 60 * 60); // hours
//   }
//   return 0;
// });

// // Calculate sleep debt for this entry
// sleepEntrySchema.methods.calculateDebt = function(targetHours) {
//   const actualSleep = this.sleepDuration;
//   return Math.max(0, targetHours - actualSleep);
// };

// module.exports = mongoose.model('SleepEntry', sleepEntrySchema);

// // backend/src/models/ProductivityPrediction.js
// const mongoose = require('mongoose');

// const productivityPredictionSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//     index: true
//   },
//   date: {
//     type: Date,
//     required: true,
//     index: true
//   },
//   sleepDebt: {
//     type: Number,
//     default: 0
//   },
//   curve: [{
//     hour: {
//       type: Number,
//       min: 0,
//       max: 23
//     },
//     productivity: {
//       type: Number,
//       min: 0,
//       max: 1
//     },
//     zone: {
//       type: String,
//       enum: ['peak', 'high', 'moderate', 'low', 'critical']
//     },
//     circadianFactor: Number,
//     homeostaticFactor: Number
//   }],
//   recommendations: [{
//     type: {
//       type: String,
//       enum: ['deep_work', 'creative', 'routine', 'rest', 'exercise']
//     },
//     timeSlot: {
//       start: Number, // hour
//       end: Number    // hour
//     },
//     priority: {
//       type: Number,
//       min: 1,
//       max: 5
//     },
//     description: String
//   }],
//   confidence: {
//     type: Number,
//     min: 0,
//     max: 1,
//     default: 0.5
//   }
// }, {
//   timestamps: true
// });

// // Compound index for efficient querying
// productivityPredictionSchema.index({ userId: 1, date: -1 });

// module.exports = mongoose.model('ProductivityPrediction', productivityPredictionSchema);

// backend/src/models/SleepProfile.js
const mongoose = require('mongoose');

const sleepProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  chronotype: {
    type: String,
    enum: ['morning', 'evening', 'intermediate'],
    default: 'intermediate'
  },
  weekdayBedtime: {
    type: String,
    default: '22:30', // HH:MM format
    validate: {
      validator: function(v) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Bedtime must be in HH:MM format'
    }
  },
  weekdayWakeTime: {
    type: String,
    default: '06:30',
    validate: {
      validator: function(v) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Wake time must be in HH:MM format'
    }
  },
  weekendBedtime: {
    type: String,
    default: '23:30'
  },
  weekendWakeTime: {
    type: String,
    default: '08:00'
  },
  targetSleepHours: {
    type: Number,
    default: 8,
    min: 4,
    max: 12
  },
  sleepEfficiency: {
    type: Number,
    default: 85, // percentage
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SleepProfile', sleepProfileSchema);