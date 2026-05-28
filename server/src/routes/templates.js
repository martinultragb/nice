const express = require('express');
const Template = require('../models/Template');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const templates = await Template.find({ 
      $or: [
        { userId: req.userId },
        { isPublic: true }
      ]
    })
      .populate('exercises.exerciseId', 'name muscleGroup')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Template.countDocuments({ 
      $or: [
        { userId: req.userId },
        { isPublic: true }
      ]
    });

    res.json({
      success: true,
      data: {
        templates,
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
      message: '获取模板列表失败'
    });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const template = await Template.findOne({
      _id: req.params.id,
      $or: [
        { userId: req.userId },
        { isPublic: true }
      ]
    }).populate('exercises.exerciseId', 'name muscleGroup description');

    if (!template) {
      return res.status(404).json({
        success: false,
        message: '模板不存在'
      });
    }

    res.json({
      success: true,
      data: {
        template
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取模板信息失败'
    });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, description, exercises, isPublic } = req.body;

    if (!name || !exercises || exercises.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请填写完整信息'
      });
    }

    const template = new Template({
      name,
      description: description || '',
      exercises,
      userId: req.userId,
      isPublic: isPublic || false
    });

    await template.save();
    await template.populate('exercises.exerciseId', 'name muscleGroup');

    res.status(201).json({
      success: true,
      message: '模板创建成功',
      data: {
        template
      }
    });
  } catch (error) {
    console.error('创建模板错误:', error);
    res.status(500).json({
      success: false,
      message: '创建失败'
    });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description, exercises, isPublic } = req.body;
    
    const template = await Template.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: '模板不存在或无权限修改'
      });
    }

    if (name) template.name = name;
    if (description !== undefined) template.description = description;
    if (exercises) template.exercises = exercises;
    if (isPublic !== undefined) template.isPublic = isPublic;

    await template.save();
    await template.populate('exercises.exerciseId', 'name muscleGroup');

    res.json({
      success: true,
      message: '更新成功',
      data: {
        template
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新失败'
    });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const template = await Template.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: '模板不存在或无权限删除'
      });
    }

    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除失败'
    });
  }
});

router.post('/:id/use', auth, async (req, res) => {
  try {
    const template = await Template.findByIdAndUpdate(
      req.params.id,
      { $inc: { usageCount: 1 } },
      { new: true }
    );

    if (!template) {
      return res.status(404).json({
        success: false,
        message: '模板不存在'
      });
    }

    res.json({
      success: true,
      message: '使用次数 +1',
      data: {
        usageCount: template.usageCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '操作失败'
    });
  }
});

module.exports = router;
