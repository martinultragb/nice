import { useState, useEffect } from 'react';
import { Users, Dumbbell, TrendingUp, Settings, Plus, Edit2, Trash2, X, Check, Shield, User, Activity, ArrowLeft } from 'lucide-react';
import { useExerciseStore } from '../store/exerciseStore';
import { Exercise, MuscleGroup, MUSCLE_GROUP_LABELS, MUSCLE_GROUP_ICONS } from '../types';
import authService from '../services/authService';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';

const muscleGroups: MuscleGroup[] = ['chest', 'back', 'shoulder', 'arm', 'leg', 'core', 'fullbody'];

type AdminTab = 'overview' | 'exercises' | 'users';

interface UserData {
  _id: string;
  openId: string;
  nickname: string;
  avatarUrl: string;
  role: 'user' | 'admin';
  lastLoginAt: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('exercises');
  const { exercises, addExercise, updateExercise, deleteExercise, initializeDefaultExercises } = useExerciseStore();
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalWorkouts: 0, totalExercises: 0, streak: 0 });
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    muscleGroup: 'chest' as MuscleGroup,
    description: '',
  });

  useEffect(() => {
    initializeDefaultExercises();
  }, [initializeDefaultExercises]);

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
    if (activeTab === 'overview') {
      loadStats();
    }
  }, [activeTab]);

  const loadUsers = async () => {
    try {
      const response = await api.get('/users');
      if (response.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('加载用户失败', error);
    }
  };

  const loadStats = async () => {
    try {
      setStats({
        totalUsers: 1,
        totalWorkouts: 0,
        totalExercises: exercises.length,
        streak: 0
      });
    } catch (error) {
      console.error('加载统计失败', error);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      const response = await api.put(`/users/${userId}/role`, { role: newRole });
      if (response.success) {
        setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
        alert('角色更新成功');
      }
    } catch (error) {
      console.error('更新角色失败', error);
      alert('更新失败');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('确定要删除这个用户吗？')) return;
    try {
      const response = await api.delete(`/users/${userId}`);
      if (response.success) {
        setUsers(users.filter(u => u._id !== userId));
        alert('删除成功');
      }
    } catch (error) {
      console.error('删除用户失败', error);
      alert('删除失败');
    }
  };

  const openAddModal = () => {
    setEditingExercise(null);
    setFormData({ name: '', muscleGroup: 'chest', description: '' });
    setIsExerciseModalOpen(true);
  };

  const openEditModal = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setFormData({
      name: exercise.name,
      muscleGroup: exercise.muscleGroup,
      description: exercise.description || '',
    });
    setIsExerciseModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingExercise) {
      updateExercise(editingExercise.id, formData);
    } else {
      addExercise(formData);
    }
    setIsExerciseModalOpen(false);
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

  const tabs = [
    { id: 'exercises' as AdminTab, label: '动作管理', icon: Dumbbell },
    { id: 'users' as AdminTab, label: '用户管理', icon: Users },
    { id: 'overview' as AdminTab, label: '系统概览', icon: Activity },
  ];

  return (
    <div className="pb-6 bg-[#F7F8FA] min-h-screen">
      <div className="px-4 pt-5">
        <header className="mb-5">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate('/admin')}
              className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Shield className="text-[#07C160]" />
                管理员后台
              </h1>
              <p className="text-xs text-gray-400 mt-1">管理平台的所有功能和数据</p>
            </div>
          </div>
        </header>

        <div className="flex gap-2 mb-5 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#07C160] text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#E8FBF0] rounded-lg flex items-center justify-center">
                    <Users size={20} className="text-[#07C160]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{stats.totalUsers}</p>
                    <p className="text-xs text-gray-400">用户总数</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#FFF7E6] rounded-lg flex items-center justify-center">
                    <Dumbbell size={20} className="text-[#FA9D3B]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{stats.totalExercises}</p>
                    <p className="text-xs text-gray-400">动作数量</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#E8F4FF] rounded-lg flex items-center justify-center">
                    <TrendingUp size={20} className="text-[#1677FF]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{stats.totalWorkouts}</p>
                    <p className="text-xs text-gray-400">训练记录</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#FFECEC] rounded-lg flex items-center justify-center">
                    <Activity size={20} className="text-[#FF4D4F]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{stats.streak}</p>
                    <p className="text-xs text-gray-400">今日活跃</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5">
              <h3 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
                <Settings size={16} className="text-[#07C160]" />
                快速操作
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => setActiveTab('exercises')}
                  className="w-full py-3 bg-[#F7F8FA] rounded-lg text-sm text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-100"
                >
                  <Dumbbell size={16} />
                  管理动作库
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className="w-full py-3 bg-[#F7F8FA] rounded-lg text-sm text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-100"
                >
                  <Users size={16} />
                  管理用户
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-4">
            {users.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#F7F8FA] rounded-full flex items-center justify-center">
                  <Users size={32} className="text-gray-400" />
                </div>
                <h3 className="font-medium text-gray-800 mb-2 text-sm">暂无用户数据</h3>
                <p className="text-gray-400 text-xs">用户列表将在这里显示</p>
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <div key={user._id} className="bg-white rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.nickname}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-[#F7F8FA] rounded-full flex items-center justify-center">
                            <User size={20} className="text-gray-400" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium text-gray-800 text-sm">{user.nickname}</h3>
                          <p className="text-xs text-gray-400">
                            {user.role === 'admin' ? (
                              <span className="text-[#07C160]">管理员</span>
                            ) : (
                              '普通用户'
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleUpdateUserRole(user._id, 'admin')}
                            className="px-3 py-1.5 bg-[#07C160] text-white text-xs rounded-lg hover:opacity-90"
                          >
                            设为管理员
                          </button>
                        )}
                        {user.role !== 'user' && (
                          <button
                            onClick={() => handleUpdateUserRole(user._id, 'user')}
                            className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs rounded-lg hover:opacity-90"
                          >
                            设为用户
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'exercises' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-medium text-gray-800 text-sm">动作库管理</h2>
              <button
                onClick={openAddModal}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#07C160] text-white text-sm rounded-lg"
              >
                <Plus size={16} />
                添加动作
              </button>
            </div>

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
        )}
      </div>

      {isExerciseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="w-full max-w-md bg-white rounded-t-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-5 pt-4 pb-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-800">
                  {editingExercise ? '编辑动作' : '添加动作'}
                </h2>
                <button
                  onClick={() => setIsExerciseModalOpen(false)}
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
