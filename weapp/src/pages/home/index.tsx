import { useState, useEffect } from 'react';
import { View, Text, Button, Input } from '@tarojs/components';
import { useDidShow } from '@tarojs/taro';
import { format } from 'date-fns';
import store from '../../store/exerciseStore';
import templateStore from '../../store/templateStore';
import workoutStore from '../../store/workoutStore';
import type { WorkoutRecord, ExerciseRecord, SetRecord } from '../../types';

export default function Home() {
  const [isTraining, setIsTraining] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutRecord | null>(null);
  const [exerciseInputs, setExerciseInputs] = useState<Record<string, { weight: string; reps: string }[]>>({});

  useEffect(() => {
    store.dispatch.initializeDefaultExercises();
  }, []);

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
    updateSet(exerciseId, setIndex, { completed: !set.completed });
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

    workoutStore.dispatch.addWorkout({
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
      <View className="pb-32 bg-background">
        <View className="px-4 pt-5">
          <View className="mb-5 flex items-center justify-between">
            <View>
              <Text className="text-lg font-semibold text-gray-800">
                {currentWorkout.templateName || '自由训练'}
              </Text>
              <Text className="text-xs text-gray-400 block mt-1">
                {format(new Date(), 'yyyy年MM月dd日')}
              </Text>
            </View>
            <View className="text-right">
              <Text className="text-xl font-bold text-primary">{totalSets}</Text>
              <Text className="text-[10px] text-gray-400 block">已完成组数</Text>
            </View>
          </View>

          <View className="space-y-3">
            {currentWorkout.exercises.map((exerciseRecord) => {
              const exercise = exercises.find((e) => e.id === exerciseRecord.exerciseId);
              if (!exercise) return null;

              return (
                <View
                  key={exerciseRecord.exerciseId}
                  className="bg-white rounded-xl p-4"
                >
                  <View className="flex items-center justify-between mb-4">
                    <View className="flex items-center gap-3">
                      <View className="w-9 h-9 bg-primary-light rounded-lg flex items-center justify-center">
                        <Text className="text-primary text-lg">💪</Text>
                      </View>
                      <View>
                        <Text className="font-medium text-gray-800">{exercise.name}</Text>
                        <Text className="text-xs text-gray-400">
                          {exerciseRecord.sets.length} 组
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="space-y-2">
                    <View className="grid grid-cols-12 gap-2 text-[10px] text-gray-400 px-1">
                      <View className="col-span-1">组</View>
                      <View className="col-span-4">重量(kg)</View>
                      <View className="col-span-4">次数</View>
                      <View className="col-span-3 text-center">完成</View>
                    </View>

                    {exerciseRecord.sets.map((set, setIndex) => (
                      <View
                        key={setIndex}
                        className={`grid grid-cols-12 gap-2 items-center px-1 py-2 rounded-lg ${
                          set.completed ? 'bg-primary-light' : 'bg-gray-50'
                        }`}
                      >
                        <View className="col-span-1 text-xs text-gray-500">
                          {set.setNumber}
                        </View>
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
                          className="col-span-4 px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-center text-sm"
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
                          className="col-span-4 px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-center text-sm"
                          placeholder="10"
                        />
                        <View
                          className="col-span-3 flex justify-center"
                          onClick={() => toggleSetComplete(exerciseRecord.exerciseId, setIndex)}
                        >
                          <Text className={`text-xl ${set.completed ? 'text-primary' : 'text-gray-300'}`}>
                            {set.completed ? '✓' : '○'}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>

                  <View
                    className="w-full mt-3 py-2 border border-dashed border-gray-200 rounded-lg text-gray-400 text-xs flex items-center justify-center"
                    onClick={() => addSetToExercise(exerciseRecord.exerciseId)}
                  >
                    <Text>+ 添加一组</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <View className="flex gap-3">
            <Button
              className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-600 font-medium"
              onClick={cancelWorkout}
            >
              取消
            </Button>
            <Button
              className="flex-1 py-3 bg-primary text-white font-medium rounded-lg"
              onClick={saveWorkout}
            >
              保存训练
            </Button>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="pb-6 bg-background">
      <View className="px-4 pt-5">
        <View className="mb-5">
          <Text className="text-xs text-gray-400">
            {format(new Date(), 'yyyy年MM月dd日')}
          </Text>
        </View>

        <View
          className={`relative rounded-2xl p-5 mb-5 bg-primary`}
        >
          <View className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />

          <View className="relative z-10">
            <View className="flex items-center gap-2 mb-4">
              <View className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                <Text className="text-white text-lg">{todayWorkout ? '🏆' : '💪'}</Text>
              </View>
              <Text className="text-white font-medium">
                {todayWorkout ? '今日已完成' : '开始训练'}
              </Text>
            </View>

            {todayWorkout ? (
              <View>
                <Text className="text-white/80 text-xs mb-3">完成 {todayWorkout.exercises.length} 个动作</Text>
                <View className="grid grid-cols-2 gap-3">
                  <View className="bg-white/15 rounded-lg p-3">
                    <Text className="text-white/80 text-xs mb-1 block">总组数</Text>
                    <Text className="text-2xl font-bold text-white">
                      {todayWorkout.exercises.reduce((sum, ex) => sum + ex.sets.filter((s) => s.completed).length, 0)}
                    </Text>
                  </View>
                  <View className="bg-white/15 rounded-lg p-3">
                    <Text className="text-white/80 text-xs mb-1 block">训练容量</Text>
                    <Text className="text-2xl font-bold text-white">
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
                      <Text className="text-sm ml-1">kg</Text>
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <View
                className="w-full py-3 bg-white text-primary font-medium rounded-lg flex items-center justify-center gap-2"
                onClick={() => setShowTemplateSelector(true)}
              >
                <Text>▶ 选择模板开始训练</Text>
              </View>
            )}
          </View>
        </View>

        <View>
          <Text className="font-medium text-gray-800 mb-3 block">快速开始</Text>
          <View className="grid grid-cols-2 gap-3">
            <View
              className="bg-white rounded-xl p-4 text-left"
              onClick={() => startTraining()}
            >
              <View className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center mb-2">
                <Text className="text-primary text-xl">💪</Text>
              </View>
              <Text className="font-medium text-gray-800 mb-1 block">自由训练</Text>
              <Text className="text-xs text-gray-400">不使用模板自由训练</Text>
            </View>
            <View
              className="bg-white rounded-xl p-4 text-left"
              onClick={() => setShowTemplateSelector(true)}
            >
              <View className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                <Text className="text-blue-500 text-xl">▶</Text>
              </View>
              <Text className="font-medium text-gray-800 mb-1 block">使用模板</Text>
              <Text className="text-xs text-gray-400">{templates.length} 个可用模板</Text>
            </View>
          </View>
        </View>
      </View>

      {showTemplateSelector && (
        <View className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <View className="w-full bg-white rounded-t-2xl max-h-[70vh] overflow-y-auto">
            <View className="sticky top-0 bg-white px-5 pt-4 pb-3 border-b border-gray-100">
              <View className="flex items-center justify-between">
                <Text className="text-lg font-medium text-gray-800">选择训练模板</Text>
                <View
                  className="p-1.5"
                  onClick={() => setShowTemplateSelector(false)}
                >
                  <Text className="text-gray-500 text-xl">✕</Text>
                </View>
              </View>
            </View>
            <View className="p-5 space-y-2">
              {templates.map((template) => (
                <View
                  key={template.id}
                  className="w-full bg-gray-50 rounded-xl p-4 text-left"
                  onClick={() => startTraining(template.id, template.name)}
                >
                  <Text className="font-medium text-gray-800 mb-1 block">{template.name}</Text>
                  <Text className="text-xs text-gray-400">
                    {template.exercises.length} 个动作 ·{' '}
                    {template.exercises.reduce((sum, ex) => sum + ex.targetSets, 0)} 组
                  </Text>
                </View>
              ))}
              {templates.length === 0 && (
                <View className="text-center py-8 text-gray-400 text-sm">
                  还没有模板，去创建吧
                </View>
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
