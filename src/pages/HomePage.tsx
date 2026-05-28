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
      <div className="pb-32">
        <div className="px-4 pt-5">
          <header className="mb-5 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-800">
                {currentWorkout.templateName || '自由训练'}
              </h1>
              <p className="text-xs text-gray-400">
                {format(new Date(), 'yyyy年MM月dd日')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-[#07C160]">{totalSets}</p>
              <p className="text-[10px] text-gray-400">已完成组数</p>
            </div>
          </header>

          <div className="space-y-3">
            {currentWorkout.exercises.map((exerciseRecord) => {
              const exercise = exercises.find((e) => e.id === exerciseRecord.exerciseId);
              if (!exercise) return null;

              return (
                <div
                  key={exerciseRecord.exerciseId}
                  className="bg-white rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#E8FBF0] rounded-lg flex items-center justify-center">
                        <Dumbbell size={18} className="text-[#07C160]" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">{exercise.name}</h3>
                        <p className="text-xs text-gray-400">
                          {exerciseRecord.sets.length} 组
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-2 text-[10px] text-gray-400 px-1">
                      <div className="col-span-1">组</div>
                      <div className="col-span-4">重量(kg)</div>
                      <div className="col-span-4">次数</div>
                      <div className="col-span-3 text-center">完成</div>
                    </div>

                    {exerciseRecord.sets.map((set, setIndex) => (
                      <div
                        key={setIndex}
                        className={`grid grid-cols-12 gap-2 items-center px-1 py-2 rounded-lg transition-all ${
                          set.completed ? 'bg-[#E8FBF0]' : 'bg-[#F7F8FA]'
                        }`}
                      >
                        <div className="col-span-1 text-xs text-gray-500">
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
                          className="col-span-4 px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-center text-sm focus:outline-none focus:border-[#07C160]"
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
                          className="col-span-4 px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-center text-sm focus:outline-none focus:border-[#07C160]"
                          placeholder="10"
                        />
                        <button
                          onClick={() => toggleSetComplete(exerciseRecord.exerciseId, setIndex)}
                          className="col-span-3 flex justify-center"
                        >
                          {set.completed ? (
                            <CheckCircle2 size={22} className="text-[#07C160]" />
                          ) : (
                            <Circle size={22} className="text-gray-300" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => addSetToExercise(exerciseRecord.exerciseId)}
                    className="w-full mt-3 py-2 border border-dashed border-gray-200 rounded-lg text-gray-400 text-xs flex items-center justify-center gap-1"
                  >
                    <Plus size={14} />
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

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="max-w-md mx-auto flex gap-3">
            <button
              onClick={cancelWorkout}
              className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-600 font-medium"
            >
              取消
            </button>
            <button
              onClick={saveWorkout}
              className="flex-1 py-3 bg-[#07C160] text-white font-medium rounded-lg"
            >
              保存训练
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-6">
      <div className="px-4 pt-5">
        <div className="mb-5">
          <p className="text-xs text-gray-400">
            {format(new Date(), 'yyyy年MM月dd日')}
          </p>
        </div>

        <div
          className={`relative rounded-2xl p-5 mb-5 ${
            todayWorkout
              ? 'bg-[#07C160]'
              : 'bg-[#07C160]'
          }`}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                {todayWorkout ? (
                  <Trophy size={18} className="text-white" />
                ) : (
                  <Dumbbell size={18} className="text-white" />
                )}
              </div>
              <span className="text-white font-medium">
                {todayWorkout ? '今日已完成' : '开始训练'}
              </span>
            </div>

            {todayWorkout ? (
              <div>
                <p className="text-white/80 text-xs mb-3">完成 {todayWorkout.exercises.length} 个动作</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/15 rounded-lg p-3">
                    <p className="text-white/80 text-xs mb-1">总组数</p>
                    <p className="text-2xl font-bold text-white">
                      {todayWorkout.exercises.reduce((sum, ex) => sum + ex.sets.filter((s) => s.completed).length, 0)}
                    </p>
                  </div>
                  <div className="bg-white/15 rounded-lg p-3">
                    <p className="text-white/80 text-xs mb-1">训练容量</p>
                    <p className="text-2xl font-bold text-white">
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
                      <span className="text-sm ml-1">kg</span>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowTemplateSelector(true)}
                className="w-full py-3 bg-white text-[#07C160] font-medium rounded-lg flex items-center justify-center gap-2"
              >
                <Play size={18} />
                选择模板开始训练
              </button>
            )}
          </div>
        </div>

        <div>
          <h2 className="font-medium text-gray-800 mb-3">快速开始</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => startTraining()}
              className="bg-white rounded-xl p-4 text-left"
            >
              <div className="w-10 h-10 bg-[#E8FBF0] rounded-lg flex items-center justify-center mb-2">
                <Dumbbell size={20} className="text-[#07C160]" />
              </div>
              <h3 className="font-medium text-gray-800 mb-1">自由训练</h3>
              <p className="text-xs text-gray-400">不使用模板自由训练</p>
            </button>
            <button
              onClick={() => setShowTemplateSelector(true)}
              disabled={templates.length === 0}
              className="bg-white rounded-xl p-4 text-left disabled:opacity-50"
            >
              <div className="w-10 h-10 bg-[#E5F3FF] rounded-lg flex items-center justify-center mb-2">
                <Play size={20} className="text-[#10AEFF]" />
              </div>
              <h3 className="font-medium text-gray-800 mb-1">使用模板</h3>
              <p className="text-xs text-gray-400">{templates.length} 个可用模板</p>
            </button>
          </div>
        </div>
      </div>

      {showTemplateSelector && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="w-full max-w-md bg-white rounded-t-2xl max-h-[70vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-5 pt-4 pb-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-800">选择训练模板</h2>
                <button
                  onClick={() => setShowTemplateSelector(false)}
                  className="p-1.5"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-5 space-y-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => startTraining(template.id, template.name)}
                  className="w-full bg-[#F7F8FA] rounded-xl p-4 text-left"
                >
                  <h3 className="font-medium text-gray-800 mb-1">{template.name}</h3>
                  <p className="text-xs text-gray-400">
                    {template.exercises.length} 个动作 ·{' '}
                    {template.exercises.reduce((sum, ex) => sum + ex.targetSets, 0)} 组
                  </p>
                </button>
              ))}
              {templates.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
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
