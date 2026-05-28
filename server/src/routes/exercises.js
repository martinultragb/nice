const express = require('express');
const Exercise = require('../models/Exercise');
const { auth, admin } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { muscleGroup, search, page = 1, limit = 100 } = req.query;
    
    const query = {};
    
    if (muscleGroup) {
      query.muscleGroup = muscleGroup;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const exercises = await Exercise.find(query)
      .populate('createdBy', 'nickname')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Exercise.countDocuments(query);

    res.json({
      success: true,
      data: {
        exercises,
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
      message: '获取动作列表失败'
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id)
      .populate('createdBy', 'nickname');

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: '动作不存在'
      });
    }

    res.json({
      success: true,
      data: {
        exercise
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取动作信息失败'
    });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, muscleGroup, description } = req.body;

    if (!name || !muscleGroup) {
      return res.status(400).json({
        success: false,
        message: '请填写完整信息'
      });
    }

    const exercise = new Exercise({
      name,
      muscleGroup,
      description: description || '',
      createdBy: req.userId
    });

    await exercise.save();

    res.status(201).json({
      success: true,
      message: '动作创建成功',
      data: {
        exercise
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '创建失败'
    });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { name, muscleGroup, description } = req.body;
    
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: '动作不存在'
      });
    }

    if (exercise.createdBy && exercise.createdBy.toString() !== req.userId.toString()) {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: '无权限修改此动作'
        });
      }
    }

    if (name) exercise.name = name;
    if (muscleGroup) exercise.muscleGroup = muscleGroup;
    if (description !== undefined) exercise.description = description;

    await exercise.save();

    res.json({
      success: true,
      message: '更新成功',
      data: {
        exercise
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
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: '动作不存在'
      });
    }

    if (exercise.createdBy && exercise.createdBy.toString() !== req.userId.toString()) {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: '无权限删除此动作'
        });
      }
    }

    await Exercise.findByIdAndDelete(req.params.id);

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

module.exports = router;
