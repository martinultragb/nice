import { useState, useEffect } from 'react';
import { View, Text, Button, Input, Image } from '@tarojs/components';
import { useDidShow } from '@tarojs/taro';
import { format } from 'date-fns';
import store from '../../store/exerciseStore';
import templateStore from '../../store/templateStore';
import workoutStore from '../../store/workoutStore';
import type { WorkoutRecord, ExerciseRecord, SetRecord } from '../../types';
import CountdownTimer from '../../components/CountdownTimer';
import RestTimeSettings from '../../components/RestTimeSettings';

export default function Home() {
  const [isTraining, setIsTraining] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutRecord | null>(null);
  const [exerciseInputs, setExerciseInputs] = useState<Record<string, { weight: string; reps: string }[]>>({});
  const [restTime, setRestTime] = useState<number>(() => {
    try {
      const saved = wx.getStorageSync('restTime');
      return saved ? parseInt(saved, 10) : 60;
    } catch (e) {
      return 60;
    }
  });
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownKey, setCountdownKey] = useState(0);
  const [lastCompletedSet, setLastCompletedSet] = useState<{
    exerciseId: string;
    setIndex: number;
  } | null>(null);

  useEffect(() => {
    store.initializeDefaultExercises();
  }, []);

  useEffect(() => {
    try {
      wx.setStorageSync('restTime', restTime.toString());
    } catch (e) {
      console.error('保存休息时间失败', e);
    }
  }, [restTime]);

  const todayWorkout = workoutStore.getTodayWorkout();
  const templates = templateStore.getTemplates();
  const exercises = store.getExercises();

  const startTraining = (templateId?: string, templateName?: string) => {
    const template = templateId ? templates.find((t) => t.id === templateId) : null;
    const today = format(new Date(), 'yyyy-MM-dd');

    if (template) {
      const exerciseRecords: ExerciseRecord[] = template.exercises.map((ex) => {
        return {
          exerciseId: ex.exerciseId,
          sets: Array.from({ length: ex.targetSets }, (_, i) => ({
            setNumber: i + 1,
            weight: 0,
            reps: ex.targetReps,
            completed: false,
          })),
        };
      });

      const newWorkout: WorkoutRecord = {
        id: `${today}-${Date.now()}`,
        date: today,
        templateId,
        templateName,
        exercises: exerciseRecords,
        createdAt: new Date().toISOString(),
      };

      const inputs: Record<string, { weight: string; reps: string }[]> = {};
      exerciseRecords.forEach((ex) => {
        inputs[ex.exerciseId] = ex.sets.map((s) => ({
          weight: s.weight > 0 ? s.weight.toString() : '',
          reps: s.reps.toString(),
        }));
      });

      setCurrentWorkout(newWorkout);
      setExerciseInputs(inputs);
    } else {
      const newWorkout: WorkoutRecord = {
        id: `${today}-${Date.now()}`,
        date: today,
        exercises: [],
        createdAt: new Date().toISOString(),
      };
      setCurrentWorkout(newWorkout);
      setExerciseInputs({});
    }

    setIsTraining(true);
    setShowTemplateSelector(false);
  };

  const updateSet = (exerciseId: string, setIndex: number, updates: Partial<SetRecord>) => {
    if (!currentWorkout) return;

    const updatedExercises = currentWorkout.exercises.map((ex) => {
      if (ex.exerciseId !== exerciseId) return ex;
      const updatedSets = [...ex.sets];
      updatedSets[setIndex] = { ...updatedSets[setIndex], ...updates };
      return { ...ex, sets: updatedSets };
    });

    setCurrentWorkout({ ...currentWorkout, exercises: updatedExercises });
  };

  const toggleSetComplete = (exerciseId: string, setIndex: number) => {
    if (!currentWorkout) return;
    const exercise = currentWorkout.exercises.find((ex) => ex.exerciseId === exerciseId);
    if (!exercise) return;
    const set = exercise.sets[setIndex];
    const wasCompleted = set.completed;
    updateSet(exerciseId, setIndex, { completed: !set.completed });

    if (!wasCompleted) {
      setLastCompletedSet({ exerciseId, setIndex });
      setShowCountdown(true);
      setCountdownKey(prev => prev + 1);
    }
  };

  const handleCountdownComplete = () => {
    wx.showToast({
      title: '休息结束！',
      icon: 'success',
      duration: 2000
    });
    wx.vibrateShort();
  };

  const handleCountdownReset = () => {
    setShowCountdown(false);
    setLastCompletedSet(null);
  };

  const addSetToExercise = (exerciseId: string) => {
    if (!currentWorkout) return;
    const exercise = currentWorkout.exercises.find((ex) => ex.exerciseId === exerciseId);
    if (!exercise) return;

    const lastSet = exercise.sets[exercise.sets.length - 1];
    const newSet: SetRecord = {
      setNumber: exercise.sets.length + 1,
      weight: lastSet?.weight || 0,
      reps: lastSet?.reps || 10,
      completed: false,
    };

    const updatedExercises = currentWorkout.exercises.map((ex) => {
      if (ex.exerciseId !== exerciseId) return ex;
      return { ...ex, sets: [...ex.sets, newSet] };
    });

    setCurrentWorkout({ ...currentWorkout, exercises: updatedExercises });
    setExerciseInputs({
      ...exerciseInputs,
      [exerciseId]: [
        ...(exerciseInputs[exerciseId] || []),
        {
          weight: lastSet?.weight > 0 ? lastSet.weight.toString() : '',
          reps: lastSet?.reps.toString() || '10',
        },
      ],
    });
  };

  const saveWorkout = () => {
    if (!currentWorkout) return;
    const completedExercises = currentWorkout.exercises.filter((ex) => ex.sets.some((s) => s.completed));

    if (completedExercises.length === 0) {
      wx.showToast({ title: '请至少完成一组动作', icon: 'none' });
      return;
    }

    workoutStore.addWorkout({
      date: currentWorkout.date,
      templateId: currentWorkout.templateId,
      templateName: currentWorkout.templateName,
      exercises: currentWorkout.exercises,
      notes: currentWorkout.notes,
    });

    setIsTraining(false);
    setCurrentWorkout(null);
    setExerciseInputs({});
    wx.showToast({ title: '训练已保存', icon: 'success' });
  };

  const cancelWorkout = () => {
    wx.showModal({
      title: '提示',
      content: '确定要取消本次训练吗？',
      success: (res) => {
        if (res.confirm) {
          setIsTraining(false);
          setCurrentWorkout(null);
          setExerciseInputs({});
        }
      }
    });
  };

  const totalSets = currentWorkout?.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
    0
  ) || 0;

  if (isTraining && currentWorkout) {
    return (
      <View className="container">
        <View className="flex justify-between items-center mb-4">
          <View>
            <Text className="subtitle">{currentWorkout.templateName || '自由训练'}</Text>
            <Text className="text-muted">{format(new Date(), 'yyyy年MM月dd日')}</Text>
          </View>
          <View className="flex items-center gap-4">
            <RestTimeSettings
              currentSeconds={restTime}
              onUpdate={setRestTime}
            />
            <View style={{ textAlign: 'right' }}>
              <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>{totalSets}</Text>
              <Text className="text-muted">已完成组数</Text>
            </View>
          </View>
        </View>

        {showCountdown && (
          <View className="mb-4">
            <CountdownTimer
              key={countdownKey}
              initialSeconds={restTime}
              onComplete={handleCountdownComplete}
              autoStart={true}
              onReset={handleCountdownReset}
            />
          </View>
        )}

        {currentWorkout.exercises.map((exerciseRecord) => {
          const exercise = exercises.find((e) => e.id === exerciseRecord.exerciseId);
          if (!exercise) return null;

          return (
            <View
              key={exerciseRecord.exerciseId}
              className="card"
            >
              <View className="flex items-center justify-between mb-4">
                <View className="flex items-center gap-3">
                  <View style={{
                    width: '36px',
                    height: '36px',
                    backgroundColor: '#dbeafe',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Text style={{ fontSize: '18px' }}>💪</Text>
                  </View>
                  <View>
                    <Text className="text">{exercise.name}</Text>
                    <Text className="text-muted">{exerciseRecord.sets.length} 组</Text>
                  </View>
                </View>
              </View>

              {exerciseRecord.sets.map((set, setIndex) => (
                <View
                  key={setIndex}
                  className="flex items-center gap-2 mb-2 p-2"
                  style={{
                    backgroundColor: set.completed ? '#dbeafe' : '#f3f4f6',
                    borderRadius: '8px'
                  }}
                >
                  <Text className="text-muted" style={{ width: '30px' }}>{set.setNumber}</Text>
                  <Input
                    type="number"
                    value={exerciseInputs[exerciseRecord.exerciseId]?.[setIndex]?.weight || ''}
                    onInput={(e) => {
                      const value = e.detail.value;
                      setExerciseInputs({
                        ...exerciseInputs,
                        [exerciseRecord.exerciseId]: (
                          exerciseInputs[exerciseRecord.exerciseId] || []
                        ).map((input, i) =>
                          i === setIndex ? { ...input, weight: value } : input
                        ),
                      });
                      updateSet(exerciseRecord.exerciseId, setIndex, {
                        weight: parseFloat(value) || 0,
                      });
                    }}
                    style={{
                      flex: 1,
                      padding: '8px',
                      backgroundColor: 'white',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      textAlign: 'center'
                    }}
                    placeholder="0"
                  />
                  <Input
                    type="number"
                    value={exerciseInputs[exerciseRecord.exerciseId]?.[setIndex]?.reps || ''}
                    onInput={(e) => {
                      const value = e.detail.value;
                      setExerciseInputs({
                        ...exerciseInputs,
                        [exerciseRecord.exerciseId]: (
                          exerciseInputs[exerciseRecord.exerciseId] || []
                        ).map((input, i) =>
                          i === setIndex ? { ...input, reps: value } : input
                        ),
                      });
                      updateSet(exerciseRecord.exerciseId, setIndex, {
                        reps: parseInt(value) || 0,
                      });
                    }}
                    style={{
                      flex: 1,
                      padding: '8px',
                      backgroundColor: 'white',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      textAlign: 'center'
                    }}
                    placeholder="10"
                  />
                  <View
                    style={{ width: '40px', textAlign: 'center' }}
                    onClick={() => toggleSetComplete(exerciseRecord.exerciseId, setIndex)}
                  >
                    <Text style={{ fontSize: '20px', color: set.completed ? '#3b82f6' : '#d1d5db' }}>
                      {set.completed ? '✓' : '○'}
                    </Text>
                  </View>
                </View>
              ))}

              <View
                style={{
                  marginTop: '12px',
                  padding: '10px',
                  border: '1px dashed #d1d5db',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}
                onClick={() => addSetToExercise(exerciseRecord.exerciseId)}
              >
                <Text className="text-muted">+ 添加一组</Text>
              </View>
            </View>
          );
        })}

        <View style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
          <Button
            className="btn btn-secondary"
            style={{ flex: 1 }}
            onClick={cancelWorkout}
          >
            取消
          </Button>
          <Button
            className="btn btn-primary"
            style={{ flex: 1 }}
            onClick={saveWorkout}
          >
            保存训练
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View className="container">
      <Text className="text-muted mb-4">{format(new Date(), 'yyyy年MM月dd日')}</Text>

      <View
        style={{
          backgroundColor: '#3b82f6',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px',
          color: 'white'
        }}
      >
        <View className="flex items-center gap-3 mb-4">
          <View style={{
            width: '36px',
            height: '36px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Text style={{ fontSize: '18px' }}>{todayWorkout ? '🏆' : '💪'}</Text>
          </View>
          <Text style={{ color: 'white', fontWeight: '500' }}>
            {todayWorkout ? '今日已完成' : '开始训练'}
          </Text>
        </View>

        {todayWorkout ? (
          <View>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', marginBottom: '12px' }}>
              完成 {todayWorkout.exercises.length} 个动作
            </Text>
            <View className="flex gap-3">
              <View style={{
                flex: 1,
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderRadius: '8px',
                padding: '12px'
              }}>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>总组数</Text>
                <Text style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>
                  {todayWorkout.exercises.reduce((sum, ex) => sum + ex.sets.filter((s) => s.completed).length, 0)}
                </Text>
              </View>
              <View style={{
                flex: 1,
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderRadius: '8px',
                padding: '12px'
              }}>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>训练容量</Text>
                <Text style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>
                  {Math.round(
                    todayWorkout.exercises.reduce(
                      (sum, ex) =>
                        sum +
                        ex.sets.reduce(
                          (setSum, s) => (s.completed ? setSum + s.weight * s.reps : setSum),
                          0
                        ),
                      0
                    )
                  ).toLocaleString()}
                  <Text style={{ fontSize: '12px', marginLeft: '4px' }}>kg</Text>
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: 'white',
              color: '#3b82f6',
              fontWeight: '500',
              padding: '12px',
              borderRadius: '8px',
              textAlign: 'center'
            }}
            onClick={() => setShowTemplateSelector(true)}
          >
            <Text>▶ 选择模板开始训练</Text>
          </View>
        )}
      </View>

      <Text className="subtitle mb-3">快速开始</Text>
      <View className="flex gap-3 mb-4">
        <View
          className="card"
          style={{ flex: 1, marginBottom: 0 }}
          onClick={() => startTraining()}
        >
          <View style={{
            width: '40px',
            height: '40px',
            backgroundColor: '#dbeafe',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '8px'
          }}>
            <Text style={{ fontSize: '20px' }}>💪</Text>
          </View>
          <Text className="text">自由训练</Text>
          <Text className="text-muted">不使用模板自由训练</Text>
        </View>
        <View
          className="card"
          style={{ flex: 1, marginBottom: 0 }}
          onClick={() => setShowTemplateSelector(true)}
        >
          <View style={{
            width: '40px',
            height: '40px',
            backgroundColor: '#dbeafe',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '8px'
          }}>
            <Text style={{ fontSize: '20px' }}>▶</Text>
          </View>
          <Text className="text">使用模板</Text>
          <Text className="text-muted">{templates.length} 个可用模板</Text>
        </View>
      </View>

      {showTemplateSelector && (
        <View style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'white',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          maxHeight: '70vh',
          overflowY: 'auto',
          padding: '20px'
        }}>
          <View className="flex justify-between items-center mb-4">
            <Text className="subtitle">选择训练模板</Text>
            <Text
              style={{ fontSize: '24px', color: '#9ca3af' }}
              onClick={() => setShowTemplateSelector(false)}
            >
              ✕
            </Text>
          </View>
          {templates.map((template) => (
            <View
              key={template.id}
              className="card"
              onClick={() => startTraining(template.id, template.name)}
            >
              <Text className="text">{template.name}</Text>
              <Text className="text-muted">
                {template.exercises.length} 个动作 ·{' '}
                {template.exercises.reduce((sum, ex) => sum + ex.targetSets, 0)} 组
              </Text>
            </View>
          ))}
          {templates.length === 0 && (
            <View className="text-muted text-center p-4">
              还没有模板，去创建吧
            </View>
          )}
        </View>
      )}
    </View>
  );
}
