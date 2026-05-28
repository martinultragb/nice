const mongoose = require('mongoose');

const templateExerciseSchema = new mongoose.Schema({
  exerciseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise',
    required: true
  },
  targetSets: {
    type: Number,
    required: true,
    min: 1
  },
  targetReps: {
    type: Number,
    required: true,
    min: 1
  },
  notes: {
    type: String,
    default: ''
  }
});

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '模板名称不能为空'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  exercises: {
    type: [templateExerciseSchema],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: '模板至少需要一个动作'
    }
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  usageCount: {
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

templateSchema.index({ userId: 1 });
templateSchema.index({ isPublic: 1 });

module.exports = mongoose.model('Template', templateSchema);
