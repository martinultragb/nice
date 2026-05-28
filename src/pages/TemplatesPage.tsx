import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Check, ClipboardList, CheckCircle2, Circle } from 'lucide-react';
import { useTemplateStore } from '../store/templateStore';
import { useExerciseStore } from '../store/exerciseStore';
import { WorkoutTemplate, TemplateExercise, MUSCLE_GROUP_LABELS, MUSCLE_GROUP_ICONS } from '../types';

interface SelectedExercise extends TemplateExercise {
  exerciseName: string;
}

export default function TemplatesPage() {
  const { templates, addTemplate, updateTemplate, deleteTemplate } = useTemplateStore();
  const { exercises } = useExerciseStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);

  const openAddModal = () => {
    setEditingTemplate(null);
    setTemplateName('');
    setSelectedExercises([]);
    setIsModalOpen(true);
  };

  const openEditModal = (template: WorkoutTemplate) => {
    setEditingTemplate(template);
    setTemplateName(template.name);
    setSelectedExercises(
      template.exercises.map((ex) => {
        const exercise = exercises.find((e) => e.id === ex.exerciseId);
        return {
          ...ex,
          exerciseName: exercise?.name || '未知动作',
        };
      })
    );
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim() || selectedExercises.length === 0) return;

    const templateExercises: TemplateExercise[] = selectedExercises.map((ex) => ({
      exerciseId: ex.exerciseId,
      targetSets: ex.targetSets,
      targetReps: ex.targetReps,
      notes: ex.notes,
    }));

    if (editingTemplate) {
      updateTemplate(editingTemplate.id, {
        name: templateName,
        exercises: templateExercises,
      });
    } else {
      addTemplate({
        name: templateName,
        exercises: templateExercises,
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (template: WorkoutTemplate) => {
    if (confirm(`确定要删除模板 "${template.name}" 吗？`)) {
      deleteTemplate(template.id);
    }
  };

  const addExerciseToTemplate = (exerciseId: string, exerciseName: string) => {
    if (selectedExercises.find((ex) => ex.exerciseId === exerciseId)) return;
    setSelectedExercises([
      ...selectedExercises,
      { exerciseId, exerciseName, targetSets: 3, targetReps: 10 },
    ]);
    setShowExerciseSelector(false);
  };

  const updateExerciseInTemplate = (
    exerciseId: string,
    updates: Partial<TemplateExercise>
  ) => {
    setSelectedExercises(
      selectedExercises.map((ex) =>
        ex.exerciseId === exerciseId ? { ...ex, ...updates } : ex
      )
    );
  };

  const removeExerciseFromTemplate = (exerciseId: string) => {
    setSelectedExercises(selectedExercises.filter((ex) => ex.exerciseId !== exerciseId));
  };

  const availableExercises = exercises.filter(
    (ex) => !selectedExercises.find((sel) => sel.exerciseId === ex.id)
  );

  const groupedExercises = exercises.reduce((acc, ex) => {
    const group = ex.muscleGroup;
    if (!acc[group]) acc[group] = [];
    acc[group].push(ex);
    return acc;
  }, {} as Record<string, typeof exercises>);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-md mx-auto px-4 pt-6">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">训练模板</h1>
            <p className="text-gray-500 text-sm mt-1">创建和管理你的训练计划</p>
          </div>
          <button
            onClick={openAddModal}
            className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-orange-200 hover:shadow-xl transition-all active:scale-95"
          >
            <Plus size={24} className="text-white" />
          </button>
        </header>

        {templates.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="font-bold text-gray-800 mb-2">还没有模板</h3>
            <p className="text-gray-500 text-sm mb-4">创建你的第一个训练模板</p>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-full shadow-lg shadow-orange-200"
            >
              <Plus size={20} />
              创建模板
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
                      <ClipboardList size={24} className="text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{template.name}</h3>
                      <p className="text-sm text-gray-400">
                        {template.exercises.length} 个动作
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(template)}
                      className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-orange-500 transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(template)}
                      className="p-2 rounded-full hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {template.exercises.map((ex, index) => {
                    const exercise = exercises.find((e) => e.id === ex.exerciseId);
                    return (
                      <div
                        key={ex.exerciseId}
                        className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400">{index + 1}.</span>
                          <span className="font-medium text-gray-700">
                            {exercise?.name || '未知动作'}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {ex.targetSets}组 × {ex.targetReps}次
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-t-3xl animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-5 pt-5 pb-3 border-b border-gray-100 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingTemplate ? '编辑模板' : '创建模板'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X size={24} className="text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  模板名称
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  placeholder="例如：胸部训练日"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">动作列表</label>
                  <button
                    type="button"
                    onClick={() => setShowExerciseSelector(!showExerciseSelector)}
                    className="text-sm text-orange-500 font-medium flex items-center gap-1"
                  >
                    <Plus size={16} />
                    添加动作
                  </button>
                </div>

                {showExerciseSelector && (
                  <div className="mb-4 bg-gray-50 rounded-2xl p-4 max-h-64 overflow-y-auto">
                    {Object.entries(groupedExercises).map(([group, groupExercises]) => (
                      <div key={group} className="mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span>{MUSCLE_GROUP_ICONS[group as keyof typeof MUSCLE_GROUP_ICONS]}</span>
                          <span className="text-sm font-medium text-gray-600">
                            {MUSCLE_GROUP_LABELS[group as keyof typeof MUSCLE_GROUP_LABELS]}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {groupExercises.map((ex) => (
                            <button
                              key={ex.id}
                              type="button"
                              onClick={() => addExerciseToTemplate(ex.id, ex.name)}
                              className="text-left px-3 py-2 bg-white rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all text-sm"
                            >
                              {ex.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedExercises.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    点击上方按钮添加动作
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedExercises.map((ex, index) => (
                      <div
                        key={ex.exerciseId}
                        className="bg-gray-50 rounded-xl p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </span>
                            <span className="font-medium text-gray-800">
                              {ex.exerciseName}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeExerciseFromTemplate(ex.exerciseId)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X size={18} />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">组数</label>
                            <input
                              type="number"
                              value={ex.targetSets}
                              onChange={(e) =>
                                updateExerciseInTemplate(ex.exerciseId, {
                                  targetSets: parseInt(e.target.value) || 1,
                                })
                              }
                              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-center focus:ring-2 focus:ring-orange-500 outline-none"
                              min="1"
                              max="10"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">每组次数</label>
                            <input
                              type="number"
                              value={ex.targetReps}
                              onChange={(e) =>
                                updateExerciseInTemplate(ex.exerciseId, {
                                  targetReps: parseInt(e.target.value) || 1,
                                })
                              }
                              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-center focus:ring-2 focus:ring-orange-500 outline-none"
                              min="1"
                              max="50"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!templateName.trim() || selectedExercises.length === 0}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-2xl shadow-lg shadow-orange-200 hover:shadow-xl transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Check size={20} />
                {editingTemplate ? '保存修改' : '创建模板'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
