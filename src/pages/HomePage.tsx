import { useState, useEffect } from 'react';
import { Play, CheckCircle2, Circle, Trophy, Plus, X, Dumbbell } from 'lucide-react';
import { format } from 'date-fns';
import { useWorkoutStore } from '../store/workoutStore';
import { useTemplateStore } from '../store/templateStore';
import { useExerciseStore } from '../store/exerciseStore';
import { WorkoutRecord, ExerciseRecord, SetRecord } from '../types';

export default function HomePage() {
  const { getTodayWorkout, addWorkout, updateWorkout } = useWorkoutStore();
  const { templates } = useTemplateStore();
  const { exercises, initializeDefaultExercises } = useExerciseStore();
  const todayWorkout = getTodayWorkout();
  const [isTraining, setIsTraining] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutRecord | null>(null);
  const [exerciseInputs, setExerciseInputs] = useState<
    Record<string, { weight: string; reps: string }[]>
  >({});

  useEffect(() => {
    initializeDefaultExercises();
  }, []);

  const startTraining = (templateId?: string, templateName?: string) => {
    const template = templateId ? templates.find((t) => t.id === templateId) : null;
    const today = format(new Date(), 'yyyy-MM-dd');

    if (template) {
      const exerciseRecords: ExerciseRecord[] = template.exercises.map((ex) => {
        const exercise = exercises.find((e) => e.id === ex.exerciseId);
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

  const addExerciseToWorkout = (exerciseId: string) => {
    if (!currentWorkout) return;
    const exercise = exercises.find((e) => e.id === exerciseId);
    if (!exercise) return;

    const newExercise: ExerciseRecord = {
      exerciseId,
      sets: [{ setNumber: 1, weight: 0, reps: 10, completed: false }],
    };

    setCurrentWorkout({
      ...currentWorkout,
      exercises: [...currentWorkout.exercises, newExercise],
    });

    setExerciseInputs({
      ...exerciseInputs,
      [exerciseId]: [{ weight: '', reps: '10' }],
    });
  };

  const updateSet = (
    exerciseId: string,
    setIndex: number,
    updates: Partial<SetRecord>
  ) => {
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

    const completedExercises = currentWorkout.exercises.filter((ex) =>
      ex.sets.some((s) => s.completed)
    );

    if (completedExercises.length === 0) {
      alert('请至少完成一组动作');
      return;
    }

    addWorkout({
      date: currentWorkout.date,
      templateId: currentWorkout.templateId,
      templateName: currentWorkout.templateName,
      exercises: currentWorkout.exercises,
      notes: currentWorkout.notes,
    });

    setIsTraining(false);
    setCurrentWorkout(null);
    setExerciseInputs({});
  };

  const cancelWorkout = () => {
    if (confirm('确定要取消本次训练吗？')) {
      setIsTraining(false);
      setCurrentWorkout(null);
      setExerciseInputs({});
    }
  };

  const totalSets = currentWorkout?.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
    0
  ) || 0;

  const totalVolume =
    currentWorkout?.exercises.reduce(
      (sum, ex) =>
        sum +
        ex.sets.reduce((setSum, s) => (s.completed ? setSum + s.weight * s.reps : setSum), 0),
      0
    ) || 0;

  if (isTraining && currentWorkout) {
    return (
      <div className="min-h-screen bg-gray-50 pb-32">
        <div className="max-w-md mx-auto px-4 pt-6">
          <header className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                {currentWorkout.templateName || '自由训练'}
              </h1>
              <p className="text-sm text-gray-500">
                {format(new Date(), 'yyyy年MM月dd日')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-orange-500">{totalSets}</p>
              <p className="text-xs text-gray-400">已完成组数</p>
            </div>
          </header>

          <div className="space-y-4">
            {currentWorkout.exercises.map((exerciseRecord) => {
              const exercise = exercises.find((e) => e.id === exerciseRecord.exerciseId);
              if (!exercise) return null;

              return (
                <div
                  key={exerciseRecord.exerciseId}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                        <Dumbbell size={20} className="text-orange-500" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{exercise.name}</h3>
                        <p className="text-xs text-gray-400">
                          {exerciseRecord.sets.length} 组
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-400 px-2">
                      <div className="col-span-1">组</div>
                      <div className="col-span-4">重量(kg)</div>
                      <div className="col-span-4">次数</div>
                      <div className="col-span-3 text-center">完成</div>
                    </div>

                    {exerciseRecord.sets.map((set, setIndex) => (
                      <div
                        key={setIndex}
                        className={`grid grid-cols-12 gap-2 items-center px-2 py-2 rounded-xl transition-all ${
                          set.completed ? 'bg-green-50' : 'bg-gray-50'
                        }`}
                      >
                        <div className="col-span-1 text-sm font-medium text-gray-500">
                          {set.setNumber}
                        </div>
                        <input
                          type="number"
                          value={exerciseInputs[exerciseRecord.exerciseId]?.[setIndex]?.weight || ''}
                          onChange={(e) => {
                            const value = e.target.value;
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
                          className="col-span-4 px-3 py-2 bg-white border border-gray-200 rounded-lg text-center focus:ring-2 focus:ring-orange-500 outline-none"
                          placeholder="0"
                        />
                        <input
                          type="number"
                          value={exerciseInputs[exerciseRecord.exerciseId]?.[setIndex]?.reps || ''}
                          onChange={(e) => {
                            const value = e.target.value;
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
                          className="col-span-4 px-3 py-2 bg-white border border-gray-200 rounded-lg text-center focus:ring-2 focus:ring-orange-500 outline-none"
                          placeholder="10"
                        />
                        <button
                          onClick={() => toggleSetComplete(exerciseRecord.exerciseId, setIndex)}
                          className="col-span-3 flex justify-center"
                        >
                          {set.completed ? (
                            <CheckCircle2 size={24} className="text-green-500" />
                          ) : (
                            <Circle size={24} className="text-gray-300" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => addSetToExercise(exerciseRecord.exerciseId)}
                    className="w-full mt-3 py-2 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-orange-300 hover:text-orange-500 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    添加一组
                  </button>
                </div>
              );
            })}
          </div>

          {currentWorkout.exercises.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">还没有添加任何动作</p>
            </div>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-lg">
          <div className="max-w-md mx-auto flex gap-3">
            <button
              onClick={cancelWorkout}
              className="flex-1 py-4 border-2 border-gray-200 rounded-2xl text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={saveWorkout}
              className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl text-white font-bold shadow-lg shadow-orange-200 hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={20} />
              保存训练
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-md mx-auto px-4 pt-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">力量训练</h1>
          <p className="text-gray-500 text-sm mt-1">
            {format(new Date(), 'yyyy年MM月dd日')}
          </p>
        </header>

        <div
          className={`relative overflow-hidden rounded-3xl p-6 mb-6 transition-all duration-500 ${
            todayWorkout
              ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-xl shadow-green-200'
              : 'bg-gradient-to-br from-orange-500 via-orange-600 to-red-500 shadow-xl shadow-orange-200'
          }`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  {todayWorkout ? (
                    <Trophy size={20} className="text-white" />
                  ) : (
                    <Dumbbell size={20} className="text-white" />
                  )}
                </div>
                <span className="text-white font-semibold text-lg">
                  {todayWorkout ? '今日已完成' : '开始训练'}
                </span>
              </div>
            </div>

            {todayWorkout ? (
              <div>
                <p className="text-white/80 text-sm mb-3">完成 {todayWorkout.exercises.length} 个动作</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4">
                    <p className="text-white/80 text-sm">总组数</p>
                    <p className="text-3xl font-bold text-white">
                      {todayWorkout.exercises.reduce((sum, ex) => sum + ex.sets.filter((s) => s.completed).length, 0)}
                    </p>
                  </div>
                  <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4">
                    <p className="text-white/80 text-sm">训练容量</p>
                    <p className="text-3xl font-bold text-white">
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
                      <span className="text-lg ml-1">kg</span>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowTemplateSelector(true)}
                className="w-full py-4 bg-white text-orange-600 font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <Play size={20} />
                选择模板开始训练
              </button>
            )}
          </div>
        </div>

        <div>
          <h2 className="font-bold text-gray-800 text-lg mb-4">快速开始</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => startTraining()}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-200 transition-all text-left"
            >
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-3">
                <Dumbbell size={24} className="text-orange-500" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1">自由训练</h3>
              <p className="text-sm text-gray-400">不使用模板自由训练</p>
            </button>
            <button
              onClick={() => setShowTemplateSelector(true)}
              disabled={templates.length === 0}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-200 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                <Play size={24} className="text-blue-500" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1">使用模板</h3>
              <p className="text-sm text-gray-400">{templates.length} 个可用模板</p>
            </button>
          </div>
        </div>
      </div>

      {showTemplateSelector && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-t-3xl animate-slide-up max-h-[70vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-5 pt-5 pb-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">选择训练模板</h2>
                <button
                  onClick={() => setShowTemplateSelector(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X size={24} className="text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-5 space-y-3">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => startTraining(template.id, template.name)}
                  className="w-full bg-gray-50 hover:bg-orange-50 rounded-2xl p-4 text-left transition-colors border border-transparent hover:border-orange-200"
                >
                  <h3 className="font-bold text-gray-800 mb-1">{template.name}</h3>
                  <p className="text-sm text-gray-400">
                    {template.exercises.length} 个动作 ·{' '}
                    {template.exercises.reduce((sum, ex) => sum + ex.targetSets, 0)} 组
                  </p>
                </button>
              ))}
              {templates.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  还没有模板，去创建吧
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
