const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { openId, nickname, avatarUrl } = req.body;

    if (!openId) {
      return res.status(400).json({
        success: false,
        message: 'OpenID 不能为空'
      });
    }

    const existingUser = await User.findOne({ openId });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '用户已存在'
      });
    }

    const user = new User({
      openId,
      nickname: nickname || '健身用户',
      avatarUrl: avatarUrl || ''
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
      success: false,
      message: '注册失败'
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { openId, nickname, avatarUrl } = req.body;

    if (!openId) {
      return res.status(400).json({
        success: false,
        message: 'OpenID 不能为空'
      });
    }

    let user = await User.findOne({ openId });

    if (!user) {
      user = new User({
        openId,
        nickname: nickname || '健身用户',
        avatarUrl: avatarUrl || ''
      });
      await user.save();
    } else {
      user.lastLoginAt = new Date();
      if (nickname) user.nickname = nickname;
      if (avatarUrl) user.avatarUrl = avatarUrl;
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: '登录成功',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message: '登录失败'
    });
  }
});

router.get('/profile', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取用户信息失败'
    });
  }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const { nickname, avatarUrl, restTime } = req.body;
    const user = req.user;

    if (nickname) user.nickname = nickname;
    if (avatarUrl) user.avatarUrl = avatarUrl;
    if (restTime) user.restTime = restTime;

    await user.save();

    res.json({
      success: true,
      message: '更新成功',
      data: {
        user
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新失败'
    });
  }
});

router.post('/logout', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      message: '退出登录成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '退出登录失败'
    });
  }
});

module.exports = router;
