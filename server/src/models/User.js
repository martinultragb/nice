const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  openId: {
    type: String,
    unique: true,
    sparse: true
  },
  nickname: {
    type: String,
    default: '健身用户'
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    sparse: true
  },
  password: {
    type: String,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  restTime: {
    type: Number,
    default: 60
  },
  lastLoginAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
