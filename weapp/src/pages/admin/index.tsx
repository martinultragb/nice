import { useState, useEffect } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import store from '../../store/exerciseStore';
import userStore from '../../store/userStore';
import type { Exercise, MuscleGroup, User } from '../../types';

const muscleGroups: MuscleGroup[] = ['chest', 'back', 'shoulder', 'arm', 'leg', 'core', 'fullbody'];

const muscleGroupLabels: Record<MuscleGroup, string> = {
  chest: '胸部',
  back: '背部',
  shoulder: '肩部',
  arm: '手臂',
  leg: '腿部',
  core: '核心',
  fullbody: '全身'
};

type TabType = 'exercises' | 'users';

export default function Admin() {
  const [activeTab, setActiveTab] = useState<TabType>('exercises');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    muscleGroup: 'chest' as MuscleGroup,
    description: '',
  });
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    store.dispatch.initializeDefaultExercises();
  }, []);

  const exercises = store.getExercises();
  const users = userStore.getUsers();
  const isAdmin = userStore.getIsAdmin();

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

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      wx.showToast({ title: '请输入动作名称', icon: 'none' });
      return;
    }

    if (editingExercise) {
      store.dispatch.updateExercise(editingExercise.id, formData);
      wx.showToast({ title: '动作已更新', icon: 'success' });
    } else {
      store.dispatch.addExercise(formData);
      wx.showToast({ title: '动作已添加', icon: 'success' });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (exercise: Exercise) => {
    wx.showModal({
      title: '提示',
      content: `确定要删除动作 "${exercise.name}" 吗？`,
      success: (res) => {
        if (res.confirm) {
          store.dispatch.deleteExercise(exercise.id);
          wx.showToast({ title: '动作已删除', icon: 'success' });
        }
      }
    });
  };

  const handleUserDelete = (user: User) => {
    wx.showModal({
      title: '提示',
      content: `确定要删除用户 "${user.nickname}" 吗？`,
      success: (res) => {
        if (res.confirm) {
          userStore.deleteUser(user.id);
          wx.showToast({ title: '用户已删除', icon: 'success' });
        }
      }
    });
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setShowRoleModal(true);
  };

  const handleRoleChange = (role: 'user' | 'admin') => {
    if (selectedUser) {
      userStore.updateUserRole(selectedUser.id, role);
      wx.showToast({ title: '角色已更新', icon: 'success' });
      setShowRoleModal(false);
      setSelectedUser(null);
    }
  };

  const groupedExercises = muscleGroups.reduce((acc, group) => {
    acc[group] = exercises.filter((e) => e.muscleGroup === group);
    return acc;
  }, {} as Record<MuscleGroup, Exercise[]>);

  return (
    <View className="pb-6 bg-background">
      <View className="px-4 pt-5">
        <View className="flex gap-2 mb-5">
          <View
            className={`flex-1 py-3 rounded-xl text-center font-medium transition-all ${
              activeTab === 'exercises'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
            onClick={() => setActiveTab('exercises')}
          >
            <Text>动作管理</Text>
          </View>
          {isAdmin && (
            <View
              className={`flex-1 py-3 rounded-xl text-center font-medium transition-all ${
                activeTab === 'users'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
              onClick={() => setActiveTab('users')}
            >
              <Text>用户管理</Text>
            </View>
          )}
        </View>

        {activeTab === 'exercises' && (
          <>
            <View className="flex items-center justify-between mb-5">
              <View>
                <Text className="text-xs text-gray-400">管理你的力量训练动作库</Text>
              </View>
              <View className="w-10 h-10 bg-primary rounded-full flex items-center justify-center" onClick={openAddModal}>
                <Text className="text-white text-xl">+</Text>
              </View>
            </View>

            {exercises.length === 0 ? (
              <View className="bg-white rounded-xl p-8 text-center">
                <View className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Text className="text-gray-400 text-3xl">💪</Text>
                </View>
                <Text className="font-medium text-gray-800 mb-2 block text-sm">还没有动作</Text>
                <Text className="text-gray-400 text-xs">点击右上角按钮添加第一个训练动作</Text>
              </View>
            ) : (
              <ScrollView scrollY className="h-[calc(100vh-200px)]">
                <View className="space-y-5">
                  {muscleGroups.map((group) => {
                    const groupExercises = groupedExercises[group];
                    if (groupExercises.length === 0) return null;

                    return (
                      <View key={group}>
                        <View className="flex items-center gap-2 mb-2.5">
                          <Text className="text-lg">💪</Text>
                          <Text className="font-medium text-gray-800 text-sm">{muscleGroupLabels[group]}</Text>
                          <Text className="text-xs text-gray-400">({groupExercises.length})</Text>
                        </View>
                        <View className="space-y-2">
                          {groupExercises.map((exercise) => (
                            <View
                              key={exercise.id}
                              className="bg-white rounded-xl p-4 flex items-center justify-between"
                            >
                              <View className="flex items-center gap-3">
                                <View className="w-9 h-9 bg-primary-light rounded-lg flex items-center justify-center">
                                  <Text className="text-primary text-lg">💪</Text>
                                </View>
                                <View>
                                  <Text className="font-medium text-gray-800 text-sm">{exercise.name}</Text>
                                  {exercise.description && (
                                    <Text className="text-xs text-gray-400">{exercise.description}</Text>
                                  )}
                                </View>
                              </View>
                              <View className="flex items-center gap-1">
                                <View
                                  className="w-8 h-8 flex items-center justify-center"
                                  onClick={() => openEditModal(exercise)}
                                >
                                  <Text className="text-gray-500">✎</Text>
                                </View>
                                <View
                                  className="w-8 h-8 flex items-center justify-center"
                                  onClick={() => handleDelete(exercise)}
                                >
                                  <Text className="text-red-500">🗑</Text>
                                </View>
                              </View>
                            </View>
                          ))}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
            )}
          </>
        )}

        {activeTab === 'users' && isAdmin && (
          <>
            <View className="mb-5">
              <Text className="text-xs text-gray-400">管理平台用户</Text>
            </View>

            {users.length === 0 ? (
              <View className="bg-white rounded-xl p-8 text-center">
                <View className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Text className="text-gray-400 text-3xl">👥</Text>
                </View>
                <Text className="font-medium text-gray-800 mb-2 block text-sm">还没有用户</Text>
                <Text className="text-gray-400 text-xs">用户登录后会显示在这里</Text>
              </View>
            ) : (
              <ScrollView scrollY className="h-[calc(100vh-180px)]">
                <View className="space-y-3">
                  {users.map((user) => (
                    <View
                      key={user.id}
                      className="bg-white rounded-xl p-4 flex items-center justify-between"
                    >
                      <View className="flex items-center gap-3">
                        <View className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center">
                          <Text className="text-primary text-lg">👤</Text>
                        </View>
                        <View>
                          <View className="flex items-center gap-2">
                            <Text className="font-medium text-gray-800 text-sm">{user.nickname}</Text>
                            {user.role === 'admin' && (
                              <View className="px-2 py-0.5 bg-red-100 text-red-500 rounded text-xs">
                                <Text>管理员</Text>
                              </View>
                            )}
                          </View>
                          <Text className="text-xs text-gray-400">
                            注册时间：{new Date(user.createdAt).toLocaleDateString()}
                          </Text>
                        </View>
                      </View>
                      <View className="flex items-center gap-2">
                        <View
                          className="w-8 h-8 flex items-center justify-center"
                          onClick={() => openRoleModal(user)}
                        >
                          <Text className="text-gray-500">⚙️</Text>
                        </View>
                        {user.id !== userStore.getUser()?.id && (
                          <View
                            className="w-8 h-8 flex items-center justify-center"
                            onClick={() => handleUserDelete(user)}
                          >
                            <Text className="text-red-500">🗑</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}
          </>
        )}
      </View>

      {isModalOpen && (
        <View className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <ScrollView scrollY className="w-full max-w-md bg-white rounded-t-2xl max-h-[90vh]">
            <View className="sticky top-0 bg-white px-5 pt-4 pb-3 border-b border-gray-100">
              <View className="flex items-center justify-between">
                <Text className="text-lg font-medium text-gray-800">
                  {editingExercise ? '编辑动作' : '添加动作'}
                </Text>
                <View className="p-1.5" onClick={() => setIsModalOpen(false)}>
                  <Text className="text-gray-500 text-xl">✕</Text>
                </View>
              </View>
            </View>

            <View className="p-5 space-y-4">
              <View>
                <Text className="text-xs text-gray-500 mb-1.5 block">动作名称</Text>
                <Input
                  type="text"
                  value={formData.name}
                  onInput={(e) => setFormData({ ...formData, name: e.detail.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  placeholder="例如：卧推、深蹲"
                />
              </View>

              <View>
                <Text className="text-xs text-gray-500 mb-1.5 block">肌群</Text>
                <View className="grid grid-cols-2 gap-2">
                  {muscleGroups.map((group) => (
                    <View
                      key={group}
                      className={`px-3 py-2.5 rounded-lg border text-center ${
                        formData.muscleGroup === group
                          ? 'border-primary bg-primary-light text-primary'
                          : 'border-gray-200 bg-white text-gray-600'
                      }`}
                      onClick={() => setFormData({ ...formData, muscleGroup: group })}
                    >
                      <Text className="text-xs font-medium">{muscleGroupLabels[group]}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View>
                <Text className="text-xs text-gray-500 mb-1.5 block">描述（可选）</Text>
                <Input
                  type="text"
                  value={formData.description}
                  onInput={(e) => setFormData({ ...formData, description: e.detail.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  placeholder="动作的详细说明..."
                />
              </View>

              <View
                className="w-full py-3 bg-primary text-white font-medium rounded-lg text-center"
                onClick={handleSubmit}
              >
                <Text>{editingExercise ? '保存修改' : '添加动作'}</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      )}

      {showRoleModal && selectedUser && (
        <View className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <View className="w-full max-w-md bg-white rounded-t-2xl p-5">
            <View className="flex items-center justify-between mb-5">
              <Text className="text-lg font-medium text-gray-800">设置用户角色</Text>
              <View className="p-1.5" onClick={() => setShowRoleModal(false)}>
                <Text className="text-gray-500 text-xl">✕</Text>
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-sm text-gray-600 mb-3 block">当前用户：{selectedUser.nickname}</Text>
              <Text className="text-xs text-gray-400 mb-4 block">请选择新的角色</Text>
            </View>

            <View className="space-y-3">
              <View
                className={`w-full py-3 rounded-lg border text-center transition-all ${
                  selectedUser.role === 'user'
                    ? 'border-primary bg-primary-light text-primary'
                    : 'border-gray-200 text-gray-600'
                }`}
                onClick={() => handleRoleChange('user')}
              >
                <Text className="font-medium">普通用户</Text>
              </View>
              <View
                className={`w-full py-3 rounded-lg border text-center transition-all ${
                  selectedUser.role === 'admin'
                    ? 'border-primary bg-primary-light text-primary'
                    : 'border-gray-200 text-gray-600'
                }`}
                onClick={() => handleRoleChange('admin')}
              >
                <Text className="font-medium">管理员</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
