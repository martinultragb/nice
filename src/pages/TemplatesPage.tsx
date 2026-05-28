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
    <div className="pb-6">
      <div className="px-4 pt-5">
        <header className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">创建和管理你的训练计划</p>
          </div>
          <button
            onClick={openAddModal}
            className="w-10 h-10 bg-[#07C160] rounded-full flex items-center justify-center"
          >
            <Plus size={20} className="text-white" />
          </button>
        </header>

        {templates.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#E8FBF0] rounded-full flex items-center justify-center">
              <ClipboardList size={32} className="text-[#07C160]" />
            </div>
            <h3 className="font-medium text-gray-800 mb-2">还没有模板</h3>
            <p className="text-gray-400 text-xs mb-4">创建你的第一个训练模板</p>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#07C160] text-white font-medium rounded-lg"
            >
              <Plus size={18} />
              创建模板
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-xl p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#E8FBF0] rounded-lg flex items-center justify-center">
                      <ClipboardList size={20} className="text-[#07C160]" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{template.name}</h3>
                      <p className="text-xs text-gray-400">
                        {template.exercises.length} 个动作
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditModal(template)}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                    >
                      <Edit2 size={16} className="text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleDelete(template)}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {template.exercises.map((ex) => {
                    const exercise = exercises.find((e) => e.id === ex.exerciseId);
                    return (
                      <span
                        key={ex.exerciseId}
                        className="px-2 py-1 bg-[#F7F8FA] rounded text-xs text-gray-500"
                      >
                        {exercise?.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="w-full max-w-md bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-5 pt-4 pb-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-800">
                  {editingTemplate ? '编辑模板' : '新建模板'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">模板名称</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#07C160]"
                  placeholder="例如：周一胸部训练"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-gray-500">动作列表</label>
                  <button
                    type="button"
                    onClick={() => setShowExerciseSelector(true)}
                    className="text-xs text-[#07C160] flex items-center gap-1"
                  >
                    <Plus size={14} />
                    添加动作
                  </button>
                </div>

                {selectedExercises.length === 0 ? (
                  <div className="text-center py-6 text-gray-400 text-xs">
                    点击上方按钮添加动作
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedExercises.map((ex) => (
                      <div
                        key={ex.exerciseId}
                        className="bg-[#F7F8FA] rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-800">
                            {ex.exerciseName}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeExerciseFromTemplate(ex.exerciseId)}
                            className="text-red-400 hover:text-red-500"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <label className="block text-[10px] text-gray-400 mb-1">组数</label>
                            <input
                              type="number"
                              min={1}
                              value={ex.targetSets}
                              onChange={(e) =>
                                updateExerciseInTemplate(ex.exerciseId, {
                                  targetSets: parseInt(e.target.value) || 3,
                                })
                              }
                              className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-center text-sm"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-[10px] text-gray-400 mb-1">每组次数</label>
                            <input
                              type="number"
                              min={1}
                              value={ex.targetReps}
                              onChange={(e) =>
                                updateExerciseInTemplate(ex.exerciseId, {
                                  targetReps: parseInt(e.target.value) || 10,
                                })
                              }
                              className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-center text-sm"
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
                className="w-full py-3 bg-[#07C160] text-white font-medium rounded-lg disabled:opacity-50"
              >
                {editingTemplate ? '保存修改' : '创建模板'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showExerciseSelector && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="w-full max-w-md bg-white rounded-t-2xl max-h-[70vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-5 pt-4 pb-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-800">选择动作</h2>
                <button
                  onClick={() => setShowExerciseSelector(false)}
                  className="p-1.5"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-5">
              {Object.entries(groupedExercises).map(([group, exs]) => (
                <div key={group} className="mb-4">
                  <h3 className="text-xs text-gray-400 mb-2">
                    {MUSCLE_GROUP_LABELS[group as keyof typeof MUSCLE_GROUP_LABELS]}
                  </h3>
                  <div className="space-y-1">
                    {exs.map((ex) => {
                      const isSelected = selectedExercises.find((sel) => sel.exerciseId === ex.id);
                      return (
                        <button
                          key={ex.id}
                          onClick={() =>
                            isSelected
                              ? removeExerciseFromTemplate(ex.id)
                              : addExerciseToTemplate(ex.id, ex.name)
                          }
                          className={`w-full px-3 py-2.5 text-left flex items-center justify-between rounded-lg ${
                            isSelected ? 'bg-[#E8FBF0]' : 'bg-[#F7F8FA]'
                          }`}
                        >
                          <span className="text-sm text-gray-800">{ex.name}</span>
                          {isSelected ? (
                            <CheckCircle2 size={18} className="text-[#07C160]" />
                          ) : (
                            <Circle size={18} className="text-gray-300" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
