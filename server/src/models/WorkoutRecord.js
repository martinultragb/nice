const mongoose = require('mongoose');

const setRecordSchema = new mongoose.Schema({
  setNumber: {
    type: Number,
    required: true
  },
  weight: {
    type: Number,
    default: 0
  },
  reps: {
    type: Number,
    default: 0
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  }
});

const exerciseRecordSchema = new mongoose.Schema({
  exerciseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise',
    required: true
  },
  sets: [setRecordSchema]
});

const workoutRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String,
    required: true
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template'
  },
  templateName: {
    type: String
  },
  exercises: {
    type: [exerciseRecordSchema],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: '训练记录至少需要一个动作'
    }
  },
  notes: {
    type: String,
    default: ''
  },
  duration: {
    type: Number,
    default: 0
  },
  totalSets: {
    type: Number,
    default: 0
  },
  totalWeight: {
    type: Number,
    default: 0
  },
  totalReps: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

workoutRecordSchema.index({ userId: 1, date: -1 });
workoutRecordSchema.index({ date: -1 });

workoutRecordSchema.pre('save', function(next) {
  let totalSets = 0;
  let totalWeight = 0;
  let totalReps = 0;

  this.exercises.forEach(exercise => {
    exercise.sets.forEach(set => {
      if (set.completed) {
        totalSets++;
        totalWeight += set.weight * set.reps;
        totalReps += set.reps;
      }
    });
  });

  this.totalSets = totalSets;
  this.totalWeight = totalWeight;
  this.totalReps = totalReps;

  next();
});

module.exports = mongoose.model('WorkoutRecord', workoutRecordSchema);
