const express = require('express');
const WorkoutRecord = require('../models/WorkoutRecord');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/weekly', auth, async (req, res) => {
  try {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 6);

    const startDate = weekAgo.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];

    const records = await WorkoutRecord.find({
      userId: req.userId,
      date: { $gte: startDate, $lte: endDate }
    }).populate('exercises.exerciseId', 'muscleGroup');

    const dailyStats = [];
    let totalSets = 0;
    let totalWeight = 0;
    let totalReps = 0;
    let workoutDays = 0;

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekAgo);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayRecord = records.find(r => r.date === dateStr);
      
      let daySets = 0;
      let dayWeight = 0;
      let dayReps = 0;
      const muscleGroupStats = {};

      if (dayRecord) {
        workoutDays++;
        dayRecord.exercises.forEach(exercise => {
          const muscleGroup = exercise.exerciseId?.muscleGroup || 'other';
          if (!muscleGroupStats[muscleGroup]) {
            muscleGroupStats[muscleGroup] = { sets: 0, weight: 0, reps: 0 };
          }

          exercise.sets.forEach(set => {
            if (set.completed) {
              daySets++;
              dayWeight += set.weight * set.reps;
              dayReps += set.reps;
              
              muscleGroupStats[muscleGroup].sets++;
              muscleGroupStats[muscleGroup].weight += set.weight * set.reps;
              muscleGroupStats[muscleGroup].reps += set.reps;
            }
          });
        });

        totalSets += daySets;
        totalWeight += dayWeight;
        totalReps += dayReps;
      }

      dailyStats.push({
        date: dateStr,
        dayOfWeek: date.toLocaleDateString('zh-CN', { weekday: 'short' }),
        totalSets: daySets,
        totalWeight: Math.round(dayWeight),
        totalReps: dayReps,
        exerciseCount: dayRecord ? dayRecord.exercises.length : 0,
        muscleGroups: muscleGroupStats
      });
    }

    const streak = await calculateStreak(req.userId);

    res.json({
      success: true,
      data: {
        weekStart: startDate,
        weekEnd: endDate,
        dailyStats,
        summary: {
          totalSets,
          totalWeight: Math.round(totalWeight),
          totalReps,
          workoutDays,
          avgSetsPerWorkout: workoutDays > 0 ? Math.round(totalSets / workoutDays) : 0,
          streak
        }
      }
    });
  } catch (error) {
    console.error('获取周统计错误:', error);
    res.status(500).json({
      success: false,
      message: '获取统计数据失败'
    });
  }
});

router.get('/monthly', auth, async (req, res) => {
  try {
    const today = new Date();
    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 29);

    const startDate = monthAgo.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];

    const records = await WorkoutRecord.find({
      userId: req.userId,
      date: { $gte: startDate, $lte: endDate }
    });

    let totalSets = 0;
    let totalWeight = 0;
    let totalReps = 0;
    let workoutDays = new Set();

    const dailyStats = {};
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(monthAgo);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      dailyStats[dateStr] = { sets: 0, weight: 0, reps: 0 };
    }

    records.forEach(record => {
      workoutDays.add(record.date);
      totalSets += record.totalSets || 0;
      totalWeight += record.totalWeight || 0;
      totalReps += record.totalReps || 0;

      if (dailyStats[record.date]) {
        dailyStats[record.date] = {
          sets: record.totalSets || 0,
          weight: record.totalWeight || 0,
          reps: record.totalReps || 0
        };
      }
    });

    const streak = await calculateStreak(req.userId);

    res.json({
      success: true,
      data: {
        monthStart: startDate,
        monthEnd: endDate,
        dailyStats: Object.entries(dailyStats).map(([date, stats]) => ({
          date,
          ...stats
        })),
        summary: {
          totalSets,
          totalWeight: Math.round(totalWeight),
          totalReps,
          workoutDays: workoutDays.size,
          avgSetsPerWorkout: workoutDays.size > 0 ? Math.round(totalSets / workoutDays.size) : 0,
          streak,
          consistency: Math.round((workoutDays.size / 30) * 100)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取统计数据失败'
    });
  }
});

router.get('/summary', auth, async (req, res) => {
  try {
    const records = await WorkoutRecord.find({ userId: req.userId });

    const totalWorkouts = records.length;
    const totalSets = records.reduce((sum, r) => sum + (r.totalSets || 0), 0);
    const totalWeight = records.reduce((sum, r) => sum + (r.totalWeight || 0), 0);
    const totalReps = records.reduce((sum, r) => sum + (r.totalReps || 0), 0);
    const streak = await calculateStreak(req.userId);

    const firstWorkout = records.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )[0];

    const muscleGroupStats = {};
    records.forEach(record => {
      record.exercises.forEach(exercise => {
        const muscleGroup = exercise.exerciseId?.muscleGroup || 'other';
        if (!muscleGroupStats[muscleGroup]) {
          muscleGroupStats[muscleGroup] = { sets: 0, count: 0 };
        }
        exercise.sets.forEach(set => {
          if (set.completed) {
            muscleGroupStats[muscleGroup].sets++;
          }
        });
        muscleGroupStats[muscleGroup].count++;
      });
    });

    res.json({
      success: true,
      data: {
        totalWorkouts,
        totalSets,
        totalWeight: Math.round(totalWeight),
        totalReps,
        streak,
        firstWorkoutDate: firstWorkout?.date,
        muscleGroupStats,
        favoriteExercise: getMostUsedExercise(records)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取统计数据失败'
    });
  }
});

async function calculateStreak(userId) {
  const records = await WorkoutRecord.find({ userId })
    .sort({ date: -1 })
    .select('date');

  if (records.length === 0) return 0;

  const dates = new Set(records.map(r => r.date));
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (!dates.has(today) && !dates.has(yesterday)) return 0;

  let streak = 0;
  let checkDate = dates.has(today) ? today : yesterday;

  for (let i = 0; i < 365; i++) {
    if (dates.has(checkDate)) {
      streak++;
      const date = new Date(checkDate);
      date.setDate(date.getDate() - 1);
      checkDate = date.toISOString().split('T')[0];
    } else {
      break;
    }
  }

  return streak;
}

function getMostUsedExercise(records) {
  const exerciseCounts = {};
  
  records.forEach(record => {
    record.exercises.forEach(exercise => {
      const exerciseId = exercise.exerciseId?.toString();
      if (exerciseId) {
        if (!exerciseCounts[exerciseId]) {
          exerciseCounts[exerciseId] = {
            count: 0,
            name: exercise.exerciseId?.name || '未知动作',
            totalSets: 0
          };
        }
        exerciseCounts[exerciseId].count++;
        exerciseCounts[exerciseId].totalSets += exercise.sets.filter(s => s.completed).length;
      }
    });
  });

  const sorted = Object.values(exerciseCounts).sort((a, b) => b.count - a.count);
  return sorted[0] || null;
}

module.exports = router;
