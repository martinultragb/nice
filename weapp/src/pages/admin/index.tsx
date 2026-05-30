import { useState, useEffect } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import exerciseStore from '../../store/exerciseStore';
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
    exerciseStore.initializeDefaultExercises();
  }, []);

  const exercises = exerciseStore.getExercises();
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
      exerciseStore.updateExercise(editingExercise.id, formData);
      wx.showToast({ title: '动作已更新', icon: 'success' });
    } else {
      exerciseStore.addExercise(formData);
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
          exerciseStore.deleteExercise(exercise.id);
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
    <View style={{ paddingBottom: '24rpx', backgroundColor: '#f3f4f6' }}>
      <View style={{ padding: '32rpx', paddingTop: '40rpx' }}>
        <View style={{ display: 'flex', flexDirection: 'row', gap: '8rpx', marginBottom: '40rpx' }}>
          <View
            style={{
              flex: 1,
              padding: '24rpx',
              borderRadius: '24rpx',
              textAlign: 'center',
              fontWeight: '500',
              backgroundColor: activeTab === 'exercises' ? '#3b82f6' : '#f3f4f6',
              color: activeTab === 'exercises' ? 'white' : '#4b5563'
            }}
            onClick={() => setActiveTab('exercises')}
          >
            <Text>动作管理</Text>
          </View>
          {isAdmin && (
            <View
              style={{
                flex: 1,
                padding: '24rpx',
                borderRadius: '24rpx',
                textAlign: 'center',
                fontWeight: '500',
                backgroundColor: activeTab === 'users' ? '#3b82f6' : '#f3f4f6',
                color: activeTab === 'users' ? 'white' : '#4b5563'
              }}
              onClick={() => setActiveTab('users')}
            >
              <Text>用户管理</Text>
            </View>
          )}
        </View>

        {activeTab === 'exercises' && (
          <>
            <View style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '40rpx'
            }}>
              <View>
                <Text style={{ fontSize: '24rpx', color: '#9ca3af' }}>
                  管理你的力量训练动作库
                </Text>
              </View>
              <View
                style={{
                  width: '80rpx',
                  height: '80rpx',
                  backgroundColor: '#3b82f6',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={openAddModal}
              >
                <Text style={{ color: 'white', fontSize: '40rpx' }}>+</Text>
              </View>
            </View>

            {exercises.length === 0 ? (
              <View style={{
                backgroundColor: 'white',
                borderRadius: '24rpx',
                padding: '64rpx',
                textAlign: 'center'
              }}>
                <View style={{
                  width: '128rpx',
                  height: '128rpx',
                  margin: '0 auto 32rpx',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Text style={{ color: '#9ca3af', fontSize: '60rpx' }}>💪</Text>
                </View>
                <Text style={{
                  fontWeight: '500',
                  color: '#1f2937',
                  marginBottom: '16rpx',
                  display: 'block',
                  fontSize: '28rpx'
                }}>
                  还没有动作
                </Text>
                <Text style={{ color: '#9ca3af', fontSize: '24rpx' }}>
                  点击右上角按钮添加第一个训练动作
                </Text>
              </View>
            ) : (
              <ScrollView scrollY style={{ height: 'calc(100vh - 200px)' }}>
                <View style={{ gap: '40rpx', display: 'flex', flexDirection: 'column' }}>
                  {muscleGroups.map((group) => {
                    const groupExercises = groupedExercises[group];
                    if (groupExercises.length === 0) return null;

                    return (
                      <View key={group}>
                        <View style={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: '8rpx',
                          marginBottom: '20rpx'
                        }}>
                          <Text style={{ fontSize: '36rpx' }}>💪</Text>
                          <Text style={{ fontWeight: '500', color: '#1f2937', fontSize: '28rpx' }}>
                            {muscleGroupLabels[group]}
                          </Text>
                          <Text style={{ fontSize: '24rpx', color: '#9ca3af' }}>
                            ({groupExercises.length})
                          </Text>
                        </View>
                        <View style={{ gap: '16rpx', display: 'flex', flexDirection: 'column' }}>
                          {groupExercises.map((exercise) => (
                            <View
                              key={exercise.id}
                              style={{
                                backgroundColor: 'white',
                                borderRadius: '24rpx',
                                padding: '32rpx',
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                              }}
                            >
                              <View style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: '24rpx'
                              }}>
                                <View style={{
                                  width: '72rpx',
                                  height: '72rpx',
                                  backgroundColor: '#dbeafe',
                                  borderRadius: '16rpx',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  <Text style={{ color: '#3b82f6', fontSize: '36rpx' }}>💪</Text>
                                </View>
                                <View>
                                  <Text style={{
                                    fontWeight: '500',
                                    color: '#1f2937',
                                    fontSize: '28rpx'
                                  }}>
                                    {exercise.name}
                                  </Text>
                                  {exercise.description && (
                                    <Text style={{ fontSize: '24rpx', color: '#9ca3af' }}>
                                      {exercise.description}
                                    </Text>
                                  )}
                                </View>
                              </View>
                              <View style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: '4rpx'
                              }}>
                                <View
                                  style={{
                                    width: '64rpx',
                                    height: '64rpx',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                  onClick={() => openEditModal(exercise)}
                                >
                                  <Text style={{ color: '#6b7280' }}>✎</Text>
                                </View>
                                <View
                                  style={{
                                    width: '64rpx',
                                    height: '64rpx',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                  onClick={() => handleDelete(exercise)}
                                >
                                  <Text style={{ color: '#ef4444' }}>🗑</Text>
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
            <View style={{ marginBottom: '40rpx' }}>
              <Text style={{ fontSize: '24rpx', color: '#9ca3af' }}>管理平台用户</Text>
            </View>

            {users.length === 0 ? (
              <View style={{
                backgroundColor: 'white',
                borderRadius: '24rpx',
                padding: '64rpx',
                textAlign: 'center'
              }}>
                <View style={{
                  width: '128rpx',
                  height: '128rpx',
                  margin: '0 auto 32rpx',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Text style={{ color: '#9ca3af', fontSize: '60rpx' }}>👥</Text>
                </View>
                <Text style={{
                  fontWeight: '500',
                  color: '#1f2937',
                  marginBottom: '16rpx',
                  display: 'block',
                  fontSize: '28rpx'
                }}>
                  还没有用户
                </Text>
                <Text style={{ color: '#9ca3af', fontSize: '24rpx' }}>
                  用户登录后会显示在这里
                </Text>
              </View>
            ) : (
              <ScrollView scrollY style={{ height: 'calc(100vh - 180px)' }}>
                <View style={{ gap: '24rpx', display: 'flex', flexDirection: 'column' }}>
                  {users.map((user) => (
                    <View
                      key={user.id}
                      style={{
                        backgroundColor: 'white',
                        borderRadius: '24rpx',
                        padding: '32rpx',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <View style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: '24rpx'
                      }}>
                        <View style={{
                          width: '80rpx',
                          height: '80rpx',
                          backgroundColor: '#dbeafe',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Text style={{ color: '#3b82f6', fontSize: '36rpx' }}>👤</Text>
                        </View>
                        <View>
                          <View style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: '8rpx'
                          }}>
                            <Text style={{
                              fontWeight: '500',
                              color: '#1f2937',
                              fontSize: '28rpx'
                            }}>
                              {user.nickname}
                            </Text>
                            {user.role === 'admin' && (
                              <View style={{
                                paddingLeft: '16rpx',
                                paddingRight: '16rpx',
                                paddingTop: '4rpx',
                                paddingBottom: '4rpx',
                                backgroundColor: '#fee2e2',
                                color: '#ef4444',
                                borderRadius: '8rpx',
                                fontSize: '24rpx'
                              }}>
                                <Text>管理员</Text>
                              </View>
                            )}
                          </View>
                          <Text style={{ fontSize: '24rpx', color: '#9ca3af' }}>
                            注册时间：{new Date(user.createdAt).toLocaleDateString()}
                          </Text>
                        </View>
                      </View>
                      <View style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: '8rpx'
                      }}>
                        <View
                          style={{
                            width: '64rpx',
                            height: '64rpx',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onClick={() => openRoleModal(user)}
                        >
                          <Text style={{ color: '#6b7280' }}>⚙️</Text>
                        </View>
                        {user.id !== userStore.getUser()?.id && (
                          <View
                            style={{
                              width: '64rpx',
                              height: '64rpx',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            onClick={() => handleUserDelete(user)}
                          >
                            <Text style={{ color: '#ef4444' }}>🗑</Text>
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
        <View style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)'
        }}>
          <ScrollView scrollY style={{
            width: '100%',
            maxWidth: '768rpx',
            backgroundColor: 'white',
            borderTopLeftRadius: '32rpx',
            borderTopRightRadius: '32rpx',
            maxHeight: '90vh'
          }}>
            <View style={{
              position: 'sticky',
              top: 0,
              backgroundColor: 'white',
              padding: '40rpx',
              paddingTop: '32rpx',
              paddingBottom: '24rpx',
              borderBottom: '2rpx solid #f3f4f6'
            }}>
              <View style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <Text style={{ fontSize: '32rpx', fontWeight: '500', color: '#1f2937' }}>
                  {editingExercise ? '编辑动作' : '添加动作'}
                </Text>
                <View
                  style={{ padding: '12rpx' }}
                  onClick={() => setIsModalOpen(false)}
                >
                  <Text style={{ color: '#6b7280', fontSize: '40rpx' }}>✕</Text>
                </View>
              </View>
            </View>

            <View style={{ padding: '40rpx', gap: '32rpx', display: 'flex', flexDirection: 'column' }}>
              <View>
                <Text style={{
                  fontSize: '24rpx',
                  color: '#6b7280',
                  marginBottom: '12rpx',
                  display: 'block'
                }}>
                  动作名称
                </Text>
                <Input
                  type="text"
                  value={formData.name}
                  onInput={(e) => setFormData({ ...formData, name: e.detail.value })}
                  style={{
                    width: '100%',
                    padding: '20rpx 24rpx',
                    backgroundColor: '#f3f4f6',
                    border: '2rpx solid #e5e7eb',
                    borderRadius: '16rpx',
                    fontSize: '28rpx'
                  }}
                  placeholder="例如：卧推、深蹲"
                />
              </View>

              <View>
                <Text style={{
                  fontSize: '24rpx',
                  color: '#6b7280',
                  marginBottom: '12rpx',
                  display: 'block'
                }}>
                  肌群
                </Text>
                <View style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '16rpx'
                }}>
                  {muscleGroups.map((group) => (
                    <View
                      key={group}
                      style={{
                        padding: '20rpx 24rpx',
                        borderRadius: '16rpx',
                        border: '2rpx solid',
                        textAlign: 'center',
                        borderColor: formData.muscleGroup === group ? '#3b82f6' : '#e5e7eb',
                        backgroundColor: formData.muscleGroup === group ? '#dbeafe' : 'white',
                        color: formData.muscleGroup === group ? '#3b82f6' : '#4b5563'
                      }}
                      onClick={() => setFormData({ ...formData, muscleGroup: group })}
                    >
                      <Text style={{ fontSize: '24rpx', fontWeight: '500' }}>
                        {muscleGroupLabels[group]}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              <View>
                <Text style={{
                  fontSize: '24rpx',
                  color: '#6b7280',
                  marginBottom: '12rpx',
                  display: 'block'
                }}>
                  描述（可选）
                </Text>
                <Input
                  type="text"
                  value={formData.description}
                  onInput={(e) => setFormData({ ...formData, description: e.detail.value })}
                  style={{
                    width: '100%',
                    padding: '20rpx 24rpx',
                    backgroundColor: '#f3f4f6',
                    border: '2rpx solid #e5e7eb',
                    borderRadius: '16rpx',
                    fontSize: '28rpx'
                  }}
                  placeholder="动作的详细说明..."
                />
              </View>

              <View
                style={{
                  width: '100%',
                  padding: '24rpx',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  fontWeight: '500',
                  borderRadius: '16rpx',
                  textAlign: 'center'
                }}
                onClick={handleSubmit}
              >
                <Text>{editingExercise ? '保存修改' : '添加动作'}</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      )}

      {showRoleModal && selectedUser && (
        <View style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)'
        }}>
          <View style={{
            width: '100%',
            maxWidth: '768rpx',
            backgroundColor: 'white',
            borderTopLeftRadius: '32rpx',
            borderTopRightRadius: '32rpx',
            padding: '40rpx'
          }}>
            <View style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '40rpx'
            }}>
              <Text style={{ fontSize: '32rpx', fontWeight: '500', color: '#1f2937' }}>
                设置用户角色
              </Text>
              <View
                style={{ padding: '12rpx' }}
                onClick={() => setShowRoleModal(false)}
              >
                <Text style={{ color: '#6b7280', fontSize: '40rpx' }}>✕</Text>
              </View>
            </View>

            <View style={{ marginBottom: '32rpx' }}>
              <Text style={{
                fontSize: '28rpx',
                color: '#4b5563',
                marginBottom: '24rpx',
                display: 'block'
              }}>
                当前用户：{selectedUser.nickname}
              </Text>
              <Text style={{
                fontSize: '24rpx',
                color: '#9ca3af',
                marginBottom: '32rpx',
                display: 'block'
              }}>
                请选择新的角色
              </Text>
            </View>

            <View style={{ gap: '24rpx', display: 'flex', flexDirection: 'column' }}>
              <View
                style={{
                  width: '100%',
                  padding: '24rpx',
                  borderRadius: '16rpx',
                  border: '2rpx solid',
                  textAlign: 'center',
                  borderColor: selectedUser.role === 'user' ? '#3b82f6' : '#e5e7eb',
                  backgroundColor: selectedUser.role === 'user' ? '#dbeafe' : 'white',
                  color: selectedUser.role === 'user' ? '#3b82f6' : '#4b5563'
                }}
                onClick={() => handleRoleChange('user')}
              >
                <Text style={{ fontWeight: '500' }}>普通用户</Text>
              </View>
              <View
                style={{
                  width: '100%',
                  padding: '24rpx',
                  borderRadius: '16rpx',
                  border: '2rpx solid',
                  textAlign: 'center',
                  borderColor: selectedUser.role === 'admin' ? '#3b82f6' : '#e5e7eb',
                  backgroundColor: selectedUser.role === 'admin' ? '#dbeafe' : 'white',
                  color: selectedUser.role === 'admin' ? '#3b82f6' : '#4b5563'
                }}
                onClick={() => handleRoleChange('admin')}
              >
                <Text style={{ fontWeight: '500' }}>管理员</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}