const mongoose = require('mongoose');

const muscleGroups = ['chest', 'back', 'shoulder', 'arm', 'leg', 'core', 'fullbody'];

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '动作名称不能为空'],
    trim: true
  },
  muscleGroup: {
    type: String,
    required: [true, '请选择肌群'],
    enum: muscleGroups
  },
  description: {
    type: String,
    default: ''
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

exerciseSchema.index({ name: 'text', description: 'text' });
exerciseSchema.index({ muscleGroup: 1 });

module.exports = mongoose.model('Exercise', exerciseSchema);
