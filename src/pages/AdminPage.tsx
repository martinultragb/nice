import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Check, Dumbbell } from 'lucide-react';
import { useExerciseStore } from '../store/exerciseStore';
import { Exercise, MuscleGroup, MUSCLE_GROUP_LABELS, MUSCLE_GROUP_ICONS } from '../types';

const muscleGroups: MuscleGroup[] = ['chest', 'back', 'shoulder', 'arm', 'leg', 'core', 'fullbody'];

export default function AdminPage() {
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
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-md mx-auto px-4 pt-6">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">动作管理</h1>
            <p className="text-gray-500 text-sm mt-1">管理你的力量训练动作库</p>
          </div>
          <button
            onClick={openAddModal}
            className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-orange-200 hover:shadow-xl transition-all active:scale-95"
          >
            <Plus size={24} className="text-white" />
          </button>
        </header>

        {exercises.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
            <div className="text-6xl mb-4">💪</div>
            <h3 className="font-bold text-gray-800 mb-2">还没有动作</h3>
            <p className="text-gray-500 text-sm mb-4">点击右上角按钮添加第一个训练动作</p>
          </div>
        ) : (
          <div className="space-y-6">
            {muscleGroups.map((group) => {
              const groupExercises = groupedExercises[group];
              if (groupExercises.length === 0) return null;

              return (
                <div key={group}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{MUSCLE_GROUP_ICONS[group]}</span>
                    <h2 className="font-bold text-gray-800">{MUSCLE_GROUP_LABELS[group]}</h2>
                    <span className="text-sm text-gray-400">({groupExercises.length})</span>
                  </div>
                  <div className="space-y-2">
                    {groupExercises.map((exercise) => (
                      <div
                        key={exercise.id}
                        className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Dumbbell size={20} className="text-orange-500" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">{exercise.name}</h3>
                            {exercise.description && (
                              <p className="text-sm text-gray-400">{exercise.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditModal(exercise)}
                            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-orange-500 transition-colors"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(exercise)}
                            className="p-2 rounded-full hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={18} />
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
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-t-3xl animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-5 pt-5 pb-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingExercise ? '编辑动作' : '添加动作'}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">动作名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  placeholder="例如：卧推、深蹲"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">肌群</label>
                <div className="grid grid-cols-2 gap-2">
                  {muscleGroups.map((group) => (
                    <button
                      key={group}
                      type="button"
                      onClick={() => setFormData({ ...formData, muscleGroup: group })}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                        formData.muscleGroup === group
                          ? 'border-orange-500 bg-orange-50 text-orange-600'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <span>{MUSCLE_GROUP_ICONS[group]}</span>
                      <span className="text-sm font-medium">{MUSCLE_GROUP_LABELS[group]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  描述（可选）
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none"
                  rows={3}
                  placeholder="动作的详细说明..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-2xl shadow-lg shadow-orange-200 hover:shadow-xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
              >
                <Check size={20} />
                {editingExercise ? '保存修改' : '添加动作'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
