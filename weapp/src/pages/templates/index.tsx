import { useState } from 'react';
import { View, Text, Button, Input, ScrollView } from '@tarojs/components';
import store from '../../store/templateStore';
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
  const exercises = store.getExercises();

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
      store.dispatch.updateTemplate(editingTemplate.id, {
        name: templateName,
        exercises: templateExercises,
      });
      wx.showToast({ title: '模板已更新', icon: 'success' });
    } else {
      store.dispatch.addTemplate({
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
          store.dispatch.deleteTemplate(template.id);
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
    <View className="pb-6 bg-background">
      <View className="px-4 pt-5">
        <View className="mb-5 flex items-center justify-between">
          <View>
            <Text className="text-xs text-gray-400">创建和管理你的训练计划</Text>
          </View>
          <View
            className="w-10 h-10 bg-primary rounded-full flex items-center justify-center"
            onClick={openAddModal}
          >
            <Text className="text-white text-xl">+</Text>
          </View>
        </View>

        {templates.length === 0 ? (
          <View className="bg-white rounded-xl p-8 text-center">
            <View className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Text className="text-gray-400 text-3xl">📋</Text>
            </View>
            <Text className="font-medium text-gray-800 mb-2 block text-sm">还没有模板</Text>
            <Text className="text-gray-400 text-xs mb-4 block">创建你的第一个训练模板</Text>
            <Button
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-medium rounded-lg"
              onClick={openAddModal}
            >
              + 创建模板
            </Button>
          </View>
        ) : (
          <View className="space-y-3">
            {templates.map((template) => (
              <View key={template.id} className="bg-white rounded-xl p-4">
                <View className="flex items-start justify-between mb-3">
                  <View className="flex items-center gap-3">
                    <View className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center">
                      <Text className="text-primary text-xl">📋</Text>
                    </View>
                    <View>
                      <Text className="font-medium text-gray-800">{template.name}</Text>
                      <Text className="text-xs text-gray-400">
                        {template.exercises.length} 个动作
                      </Text>
                    </View>
                  </View>
                  <View className="flex gap-1">
                    <View
                      className="w-8 h-8 flex items-center justify-center"
                      onClick={() => openEditModal(template)}
                    >
                      <Text className="text-gray-500">✎</Text>
                    </View>
                    <View
                      className="w-8 h-8 flex items-center justify-center"
                      onClick={() => handleDelete(template)}
                    >
                      <Text className="text-red-500">🗑</Text>
                    </View>
                  </View>
                </View>
                <View className="flex flex-wrap gap-2">
                  {template.exercises.map((ex) => {
                    const exercise = exercises.find((e) => e.id === ex.exerciseId);
                    return (
                      <View
                        key={ex.exerciseId}
                        className="px-2 py-1 bg-gray-50 rounded text-xs text-gray-500"
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
        <View className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <ScrollView scrollY className="w-full max-w-md bg-white rounded-t-2xl max-h-[85vh]">
            <View className="sticky top-0 bg-white px-5 pt-4 pb-3 border-b border-gray-100">
              <View className="flex items-center justify-between">
                <Text className="text-lg font-medium text-gray-800">
                  {editingTemplate ? '编辑模板' : '新建模板'}
                </Text>
                <View className="p-1.5" onClick={() => setIsModalOpen(false)}>
                  <Text className="text-gray-500 text-xl">✕</Text>
                </View>
              </View>
            </View>

            <View className="p-5 space-y-4">
              <View>
                <Text className="text-xs text-gray-500 mb-1.5 block">模板名称</Text>
                <Input
                  type="text"
                  value={templateName}
                  onInput={(e) => setTemplateName(e.detail.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white"
                  placeholder="例如：周一胸部训练"
                />
              </View>

              <View>
                <View className="flex items-center justify-between mb-2">
                  <Text className="text-xs text-gray-500">动作列表</Text>
                  <View
                    className="text-xs text-primary flex items-center gap-1"
                    onClick={() => setShowExerciseSelector(true)}
                  >
                    <Text>+</Text> 添加动作
                  </View>
                </View>

                {selectedExercises.length === 0 ? (
                  <View className="text-center py-6 text-gray-400 text-xs">
                    点击上方按钮添加动作
                  </View>
                ) : (
                  <View className="space-y-2">
                    {selectedExercises.map((ex) => (
                      <View key={ex.exerciseId} className="bg-gray-50 rounded-lg p-3">
                        <View className="flex items-center justify-between mb-2">
                          <Text className="text-sm font-medium text-gray-800">
                            {ex.exerciseName}
                          </Text>
                          <View onClick={() => removeExerciseFromTemplate(ex.exerciseId)}>
                            <Text className="text-red-400">✕</Text>
                          </View>
                        </View>
                        <View className="flex gap-3">
                          <View className="flex-1">
                            <Text className="text-[10px] text-gray-400 mb-1 block">组数</Text>
                            <Input
                              type="number"
                              value={String(ex.targetSets)}
                              onInput={(e) =>
                                updateExerciseInTemplate(ex.exerciseId, {
                                  targetSets: parseInt(e.detail.value) || 3,
                                })
                              }
                              className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-center text-sm"
                            />
                          </View>
                          <View className="flex-1">
                            <Text className="text-[10px] text-gray-400 mb-1 block">每组次数</Text>
                            <Input
                              type="number"
                              value={String(ex.targetReps)}
                              onInput={(e) =>
                                updateExerciseInTemplate(ex.exerciseId, {
                                  targetReps: parseInt(e.detail.value) || 10,
                                })
                              }
                              className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-center text-sm"
                            />
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              <Button
                className="w-full py-3 bg-primary text-white font-medium rounded-lg"
                onClick={handleSubmit}
              >
                {editingTemplate ? '保存修改' : '创建模板'}
              </Button>
            </View>
          </ScrollView>
        </View>
      )}

      {showExerciseSelector && (
        <View className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <ScrollView scrollY className="w-full max-w-md bg-white rounded-t-2xl max-h-[70vh]">
            <View className="sticky top-0 bg-white px-5 pt-4 pb-3 border-b border-gray-100">
              <View className="flex items-center justify-between">
                <Text className="text-lg font-medium text-gray-800">选择动作</Text>
                <View className="p-1.5" onClick={() => setShowExerciseSelector(false)}>
                  <Text className="text-gray-500 text-xl">✕</Text>
                </View>
              </View>
            </View>
            <View className="p-5">
              {Object.entries(groupedExercises).map(([group, exs]) => (
                <View key={group} className="mb-4">
                  <Text className="text-xs text-gray-400 mb-2 block">
                    {group === 'chest' ? '胸部' : 
                     group === 'back' ? '背部' :
                     group === 'shoulder' ? '肩部' :
                     group === 'arm' ? '手臂' :
                     group === 'leg' ? '腿部' :
                     group === 'core' ? '核心' : '全身'}
                  </Text>
                  <View className="space-y-1">
                    {exs.map((ex) => {
                      const isSelected = selectedExercises.find((sel) => sel.exerciseId === ex.id);
                      return (
                        <View
                          key={ex.id}
                          className={`w-full px-3 py-2.5 text-left flex items-center justify-between rounded-lg ${
                            isSelected ? 'bg-primary-light' : 'bg-gray-50'
                          }`}
                          onClick={() =>
                            isSelected
                              ? removeExerciseFromTemplate(ex.id)
                              : addExerciseToTemplate(ex.id, ex.name)
                          }
                        >
                          <Text className="text-sm text-gray-800">{ex.name}</Text>
                          <Text className={isSelected ? 'text-primary' : 'text-gray-300'}>
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
