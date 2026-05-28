const express = require('express');
const WorkoutRecord = require('../models/WorkoutRecord');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, startDate, endDate } = req.query;
    
    const query = { userId: req.userId };
    
    if (startDate && endDate) {
      query.date = {
        $gte: startDate,
        $lte: endDate
      };
    }

    const records = await WorkoutRecord.find(query)
      .populate('exercises.exerciseId', 'name muscleGroup')
      .populate('templateId', 'name')
      .sort({ date: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await WorkoutRecord.countDocuments(query);

    res.json({
      success: true,
      data: {
        records,
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
      message: '获取训练记录失败'
    });
  }
});

router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const record = await WorkoutRecord.findOne({
      userId: req.userId,
      date: today
    }).populate('exercises.exerciseId', 'name muscleGroup');

    res.json({
      success: true,
      data: {
        record
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取今日记录失败'
    });
  }
});

router.get('/date/:date', auth, async (req, res) => {
  try {
    const record = await WorkoutRecord.findOne({
      userId: req.userId,
      date: req.params.date
    }).populate('exercises.exerciseId', 'name muscleGroup');

    res.json({
      success: true,
      data: {
        record
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取记录失败'
    });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const record = await WorkoutRecord.findOne({
      _id: req.params.id,
      userId: req.userId
    })
      .populate('exercises.exerciseId', 'name muscleGroup description')
      .populate('templateId', 'name');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: '记录不存在'
      });
    }

    res.json({
      success: true,
      data: {
        record
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取记录失败'
    });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { date, templateId, templateName, exercises, notes, duration } = req.body;

    if (!date || !exercises || exercises.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请填写完整信息'
      });
    }

    const existingRecord = await WorkoutRecord.findOne({
      userId: req.userId,
      date
    });

    if (existingRecord) {
      exercises.forEach(newEx => {
        const existingExIndex = existingRecord.exercises.findIndex(
          ex => ex.exerciseId.toString() === newEx.exerciseId
        );
        
        if (existingExIndex !== -1) {
          newEx.sets.forEach(newSet => {
            if (newSet.completed) {
              existingRecord.exercises[existingExIndex].sets.push({
                ...newSet,
                completedAt: new Date()
              });
            }
          });
        } else if (newEx.sets.some(s => s.completed)) {
          existingRecord.exercises.push({
            exerciseId: newEx.exerciseId,
            sets: newEx.sets.map(s => ({
              ...s,
              completedAt: s.completed ? new Date() : undefined
            }))
          });
        }
      });

      if (templateId && !existingRecord.templateId) {
        existingRecord.templateId = templateId;
        existingRecord.templateName = templateName;
      }

      if (notes) existingRecord.notes = notes;
      if (duration) existingRecord.duration += duration;

      await existingRecord.save();
      await existingRecord.populate('exercises.exerciseId', 'name muscleGroup');

      return res.json({
        success: true,
        message: '记录已更新',
        data: {
          record: existingRecord
        }
      });
    }

    const record = new WorkoutRecord({
      userId: req.userId,
      date,
      templateId,
      templateName,
      exercises: exercises.map(ex => ({
        ...ex,
        sets: ex.sets.map(s => ({
          ...s,
          completedAt: s.completed ? new Date() : undefined
        }))
      })),
      notes: notes || '',
      duration: duration || 0
    });

    await record.save();
    await record.populate('exercises.exerciseId', 'name muscleGroup');

    res.status(201).json({
      success: true,
      message: '训练记录创建成功',
      data: {
        record
      }
    });
  } catch (error) {
    console.error('创建训练记录错误:', error);
    res.status(500).json({
      success: false,
      message: '创建失败'
    });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { exercises, notes, duration } = req.body;
    
    const record = await WorkoutRecord.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: '记录不存在'
      });
    }

    if (exercises) record.exercises = exercises;
    if (notes !== undefined) record.notes = notes;
    if (duration !== undefined) record.duration = duration;

    await record.save();
    await record.populate('exercises.exerciseId', 'name muscleGroup');

    res.json({
      success: true,
      message: '更新成功',
      data: {
        record
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
    const record = await WorkoutRecord.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: '记录不存在'
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

module.exports = router;
