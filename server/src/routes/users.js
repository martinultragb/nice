const express = require('express');
const User = require('../models/User');
const { auth, admin } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, admin, async (req, res) => {
  try {
    const { page = 1, limit = 20, role } = req.query;
    
    const query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取用户列表失败'
    });
  }
});

router.get('/:id', auth, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取用户信息失败'
    });
  }
});

router.put('/:id/role', auth, admin, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: '无效的角色'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      message: '角色更新成功',
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

router.delete('/:id', auth, admin, async (req, res) => {
  try {
    if (req.params.id === req.userId.toString()) {
      return res.status(400).json({
        success: false,
        message: '不能删除自己'
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      message: '用户删除成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除失败'
    });
  }
});

module.exports = router;
