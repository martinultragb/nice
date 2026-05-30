import { useState } from 'react';
import { View, Text, Button, Input, ScrollView } from '@tarojs/components';
import templateStore from '../../store/templateStore';
import exerciseStore from '../../store/exerciseStore';
import type { WorkoutTemplate, TemplateExercise } from '../../types';

interface SelectedExercise extends TemplateExercise {
  exerciseName: string;
}

export default function Templates() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);

  const templates = templateStore.getTemplates();
  const exercises = exerciseStore.getExercises();

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

  const handleSubmit = () => {
    if (!templateName.trim() || selectedExercises.length === 0) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }

    const templateExercises: TemplateExercise[] = selectedExercises.map((ex) => ({
      exerciseId: ex.exerciseId,
      targetSets: ex.targetSets,
      targetReps: ex.targetReps,
      notes: ex.notes,
    }));

    if (editingTemplate) {
      templateStore.updateTemplate(editingTemplate.id, {
        name: templateName,
        exercises: templateExercises,
      });
      wx.showToast({ title: '模板已更新', icon: 'success' });
    } else {
      templateStore.addTemplate({
        name: templateName,
        exercises: templateExercises,
      });
      wx.showToast({ title: '模板已创建', icon: 'success' });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (template: WorkoutTemplate) => {
    wx.showModal({
      title: '提示',
      content: `确定要删除模板 "${template.name}" 吗？`,
      success: (res) => {
        if (res.confirm) {
          templateStore.deleteTemplate(template.id);
          wx.showToast({ title: '模板已删除', icon: 'success' });
        }
      }
    });
  };

  const addExerciseToTemplate = (exerciseId: string, exerciseName: string) => {
    if (selectedExercises.find((ex) => ex.exerciseId === exerciseId)) return;
    setSelectedExercises([
      ...selectedExercises,
      { exerciseId, exerciseName, targetSets: 3, targetReps: 10 },
    ]);
    setShowExerciseSelector(false);
  };

  const updateExerciseInTemplate = (exerciseId: string, updates: Partial<TemplateExercise>) => {
    setSelectedExercises(
      selectedExercises.map((ex) =>
        ex.exerciseId === exerciseId ? { ...ex, ...updates } : ex
      )
    );
  };

  const removeExerciseFromTemplate = (exerciseId: string) => {
    setSelectedExercises(selectedExercises.filter((ex) => ex.exerciseId !== exerciseId));
  };

  const groupedExercises = exercises.reduce((acc, ex) => {
    const group = ex.muscleGroup;
    if (!acc[group]) acc[group] = [];
    acc[group].push(ex);
    return acc;
  }, {} as Record<string, typeof exercises>);

  return (
    <View style={{ paddingBottom: '24rpx', backgroundColor: '#f3f4f6' }}>
      <View style={{ padding: '32rpx', paddingTop: '40rpx' }}>
        <View style={{
          marginBottom: '40rpx',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <View>
            <Text style={{ fontSize: '28rpx', color: '#9ca3af' }}>创建和管理你的训练计划</Text>
          </View>
          <View
            style={{
              width: '80rpx',
              height: '80rpx',
              backgroundColor: '#3b82f6',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={openAddModal}
          >
            <Text style={{ color: 'white', fontSize: '40rpx' }}>+</Text>
          </View>
        </View>

        {templates.length === 0 ? (
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
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Text style={{ color: '#9ca3af', fontSize: '60rpx' }}>📋</Text>
            </View>
            <Text style={{
              fontWeight: '500',
              color: '#1f2937',
              marginBottom: '16rpx',
              display: 'block',
              fontSize: '28rpx'
            }}>还没有模板</Text>
            <Text style={{
              color: '#9ca3af',
              fontSize: '24rpx',
              marginBottom: '32rpx',
              display: 'block'
            }}>创建你的第一个训练模板</Text>
            <Button
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8rpx',
                padding: '20rpx 48rpx',
                backgroundColor: '#3b82f6',
                color: 'white',
                fontWeight: '500',
                borderRadius: '16rpx'
              }}
              onClick={openAddModal}
            >
              + 创建模板
            </Button>
          </View>
        ) : (
          <View style={{ gap: '24rpx', display: 'flex', flexDirection: 'column' }}>
            {templates.map((template) => (
              <View 
                key={template.id} 
                style={{
                  backgroundColor: 'white',
                  borderRadius: '24rpx',
                  padding: '32rpx'
                }}
              >
                <View style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: '24rpx'
                }}>
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
                      borderRadius: '16rpx',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Text style={{ color: '#3b82f6', fontSize: '40rpx' }}>📋</Text>
                    </View>
                    <View>
                      <Text style={{ fontWeight: '500', color: '#1f2937' }}>{template.name}</Text>
                      <Text style={{ fontSize: '24rpx', color: '#9ca3af' }}>
                        {template.exercises.length} 个动作
                      </Text>
                    </View>
                  </View>
                  <View style={{
                    display: 'flex',
                    flexDirection: 'row',
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
                      onClick={() => openEditModal(template)}
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
                      onClick={() => handleDelete(template)}
                    >
                      <Text style={{ color: '#ef4444' }}>🗑</Text>
                    </View>
                  </View>
                </View>
                <View style={{
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: '8rpx'
                }}>
                  {template.exercises.map((ex) => {
                    const exercise = exercises.find((e) => e.id === ex.exerciseId);
                    return (
                      <View
                        key={ex.exerciseId}
                        style={{
                          paddingLeft: '16rpx',
                          paddingRight: '16rpx',
                          paddingTop: '8rpx',
                          paddingBottom: '8rpx',
                          backgroundColor: '#f3f4f6',
                          borderRadius: '8rpx',
                          fontSize: '24rpx',
                          color: '#6b7280'
                        }}
                      >
                        {exercise?.name}
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
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
            maxHeight: '85vh'
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
                  {editingTemplate ? '编辑模板' : '新建模板'}
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
                }}>模板名称</Text>
                <Input
                  type="text"
                  value={templateName}
                  onInput={(e) => setTemplateName(e.detail.value)}
                  style={{
                    width: '100%',
                    padding: '24rpx',
                    border: '2rpx solid #e5e7eb',
                    borderRadius: '16rpx',
                    fontSize: '28rpx',
                    backgroundColor: 'white'
                  }}
                  placeholder="例如：周一胸部训练"
                />
              </View>

              <View>
                <View style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16rpx'
                }}>
                  <Text style={{ fontSize: '24rpx', color: '#6b7280' }}>动作列表</Text>
                  <View
                    style={{
                      fontSize: '24rpx',
                      color: '#3b82f6',
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: '4rpx'
                    }}
                    onClick={() => setShowExerciseSelector(true)}
                  >
                    <Text>+</Text> 添加动作
                  </View>
                </View>

                {selectedExercises.length === 0 ? (
                  <View style={{
                    textAlign: 'center',
                    padding: '48rpx',
                    color: '#9ca3af',
                    fontSize: '24rpx'
                  }}>
                    点击上方按钮添加动作
                  </View>
                ) : (
                  <View style={{ gap: '16rpx', display: 'flex', flexDirection: 'column' }}>
                    {selectedExercises.map((ex) => (
                      <View 
                        key={ex.exerciseId} 
                        style={{
                          backgroundColor: '#f3f4f6',
                          borderRadius: '16rpx',
                          padding: '24rpx'
                        }}
                      >
                        <View style={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '16rpx'
                        }}>
                          <Text style={{ fontSize: '28rpx', fontWeight: '500', color: '#1f2937' }}>
                            {ex.exerciseName}
                          </Text>
                          <View onClick={() => removeExerciseFromTemplate(ex.exerciseId)}>
                            <Text style={{ color: '#f87171' }}>✕</Text>
                          </View>
                        </View>
                        <View style={{ display: 'flex', flexDirection: 'row', gap: '24rpx' }}>
                          <View style={{ flex: 1 }}>
                            <Text style={{
                              fontSize: '20rpx',
                              color: '#9ca3af',
                              marginBottom: '8rpx',
                              display: 'block'
                            }}>组数</Text>
                            <Input
                              type="number"
                              value={String(ex.targetSets)}
                              onInput={(e) =>
                                updateExerciseInTemplate(ex.exerciseId, {
                                  targetSets: parseInt(e.detail.value) || 3,
                                })
                              }
                              style={{
                                width: '100%',
                                padding: '12rpx',
                                backgroundColor: 'white',
                                border: '2rpx solid #e5e7eb',
                                borderRadius: '8rpx',
                                textAlign: 'center',
                                fontSize: '28rpx'
                              }}
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{
                              fontSize: '20rpx',
                              color: '#9ca3af',
                              marginBottom: '8rpx',
                              display: 'block'
                            }}>每组次数</Text>
                            <Input
                              type="number"
                              value={String(ex.targetReps)}
                              onInput={(e) =>
                                updateExerciseInTemplate(ex.exerciseId, {
                                  targetReps: parseInt(e.detail.value) || 10,
                                })
                              }
                              style={{
                                width: '100%',
                                padding: '12rpx',
                                backgroundColor: 'white',
                                border: '2rpx solid #e5e7eb',
                                borderRadius: '8rpx',
                                textAlign: 'center',
                                fontSize: '28rpx'
                              }}
                            />
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              <Button
                style={{
                  width: '100%',
                  padding: '24rpx',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  fontWeight: '500',
                  borderRadius: '16rpx'
                }}
                onClick={handleSubmit}
              >
                {editingTemplate ? '保存修改' : '创建模板'}
              </Button>
            </View>
          </ScrollView>
        </View>
      )}

      {showExerciseSelector && (
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
            maxHeight: '70vh'
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
                <Text style={{ fontSize: '32rpx', fontWeight: '500', color: '#1f2937' }}>选择动作</Text>
                <View 
                  style={{ padding: '12rpx' }}
                  onClick={() => setShowExerciseSelector(false)}
                >
                  <Text style={{ color: '#6b7280', fontSize: '40rpx' }}>✕</Text>
                </View>
              </View>
            </View>
            <View style={{ padding: '40rpx' }}>
              {Object.entries(groupedExercises).map(([group, exs]) => (
                <View key={group} style={{ marginBottom: '32rpx' }}>
                  <Text style={{
                    fontSize: '24rpx',
                    color: '#9ca3af',
                    marginBottom: '16rpx',
                    display: 'block'
                  }}>
                    {group === 'chest' ? '胸部' : 
                     group === 'back' ? '背部' :
                     group === 'shoulder' ? '肩部' :
                     group === 'arm' ? '手臂' :
                     group === 'leg' ? '腿部' :
                     group === 'core' ? '核心' : '全身'}
                  </Text>
                  <View style={{ gap: '8rpx', display: 'flex', flexDirection: 'column' }}>
                    {exs.map((ex) => {
                      const isSelected = selectedExercises.find((sel) => sel.exerciseId === ex.id);
                      return (
                        <View
                          key={ex.id}
                          style={{
                            width: '100%',
                            padding: '20rpx 24rpx',
                            textAlign: 'left',
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderRadius: '16rpx',
                            backgroundColor: isSelected ? '#dbeafe' : '#f3f4f6'
                          }}
                          onClick={() =>
                            isSelected
                              ? removeExerciseFromTemplate(ex.id)
                              : addExerciseToTemplate(ex.id, ex.name)
                          }
                        >
                          <Text style={{ fontSize: '28rpx', color: '#1f2937' }}>{ex.name}</Text>
                          <Text style={{ color: isSelected ? '#3b82f6' : '#d1d5db' }}>
                            {isSelected ? '✓' : '○'}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
}