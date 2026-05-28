import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Check, Dumbbell, Shield } from 'lucide-react';
import { useExerciseStore } from '../store/exerciseStore';
import { Exercise, MuscleGroup, MUSCLE_GROUP_LABELS, MUSCLE_GROUP_ICONS } from '../types';
import { useNavigate } from 'react-router-dom';

const muscleGroups: MuscleGroup[] = ['chest', 'back', 'shoulder', 'arm', 'leg', 'core', 'fullbody'];

export default function AdminPage() {
  const navigate = useNavigate();
  const { exercises, addExercise, updateExercise, deleteExercise, initializeDefaultExercises } = useExerciseStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    muscleGroup: 'chest' as MuscleGroup,
    description: '',
  });

  useEffect(() => {
    initializeDefaultExercises();
  }, []);

  const openAddModal = () => {
    setEditingExercise(null);
    setFormData({ name: '', muscleGroup: 'chest', description: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setFormData({
      name: exercise.name,
      muscleGroup: exercise.muscleGroup,
      description: exercise.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingExercise) {
      updateExercise(editingExercise.id, formData);
    } else {
      addExercise(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (exercise: Exercise) => {
    if (confirm(`确定要删除动作 "${exercise.name}" 吗？`)) {
      deleteExercise(exercise.id);
    }
  };

  const groupedExercises = muscleGroups.reduce((acc, group) => {
    acc[group] = exercises.filter((e) => e.muscleGroup === group);
    return acc;
  }, {} as Record<MuscleGroup, Exercise[]>);

  return (
    <div className="pb-6">
      <div className="px-4 pt-5">
        <header className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">管理你的力量训练动作库</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
            >
              <Shield size={14} />
              管理后台
            </button>
            <button
              onClick={openAddModal}
              className="w-10 h-10 bg-[#07C160] rounded-full flex items-center justify-center"
            >
              <Plus size={20} className="text-white" />
            </button>
          </div>
        </header>

        {exercises.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#F7F8FA] rounded-full flex items-center justify-center">
              <Dumbbell size={32} className="text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-800 mb-2 text-sm">还没有动作</h3>
            <p className="text-gray-400 text-xs">点击右上角按钮添加第一个训练动作</p>
          </div>
        ) : (
          <div className="space-y-5">
            {muscleGroups.map((group) => {
              const groupExercises = groupedExercises[group];
              if (groupExercises.length === 0) return null;

              return (
                <div key={group}>
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="text-lg">{MUSCLE_GROUP_ICONS[group]}</span>
                    <h2 className="font-medium text-gray-800 text-sm">{MUSCLE_GROUP_LABELS[group]}</h2>
                    <span className="text-xs text-gray-400">({groupExercises.length})</span>
                  </div>
                  <div className="space-y-2">
                    {groupExercises.map((exercise) => (
                      <div
                        key={exercise.id}
                        className="bg-white rounded-xl p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-[#E8FBF0] rounded-lg flex items-center justify-center">
                            <Dumbbell size={18} className="text-[#07C160]" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-800 text-sm">{exercise.name}</h3>
                            {exercise.description && (
                              <p className="text-xs text-gray-400">{exercise.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(exercise)}
                            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-[#07C160]"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(exercise)}
                            className="p-1.5 rounded-full hover:bg-red-50 text-gray-500 hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="w-full max-w-md bg-white rounded-t-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-5 pt-4 pb-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-800">
                  {editingExercise ? '编辑动作' : '添加动作'}
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
                <label className="block text-xs text-gray-500 mb-1.5">动作名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#F7F8FA] border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#07C160]"
                  placeholder="例如：卧推、深蹲"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">肌群</label>
                <div className="grid grid-cols-2 gap-2">
                  {muscleGroups.map((group) => (
                    <button
                      key={group}
                      type="button"
                      onClick={() => setFormData({ ...formData, muscleGroup: group })}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-colors ${
                        formData.muscleGroup === group
                          ? 'border-[#07C160] bg-[#E8FBF0] text-[#07C160]'
                          : 'border-gray-200 bg-white text-gray-600'
                      }`}
                    >
                      <span>{MUSCLE_GROUP_ICONS[group]}</span>
                      <span className="text-xs font-medium">{MUSCLE_GROUP_LABELS[group]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  描述（可选）
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#F7F8FA] border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#07C160] resize-none"
                  rows={3}
                  placeholder="动作的详细说明..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#07C160] text-white font-medium rounded-lg flex items-center justify-center gap-2"
              >
                <Check size={18} />
                {editingExercise ? '保存修改' : '添加动作'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
