import { useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import workoutStore from '../../store/workoutStore';
import exerciseStore from '../../store/exerciseStore';
import type { MuscleGroup } from '../../types';

export default function Stats() {
  const records = workoutStore.getRecords();
  const exercises = exerciseStore.getExercises();
  const weeklyStats = workoutStore.getWeeklyStats();
  const streak = workoutStore.calculateStreak();

  const muscleGroupData = useMemo(() => {
    const groupCount: Record<MuscleGroup, number> = {
      chest: 0, back: 0, shoulder: 0, arm: 0, leg: 0, core: 0, fullbody: 0
    };

    records.forEach((workout) => {
      workout.exercises.forEach((ex) => {
        const exercise = exercises.find((e) => e.id === ex.exerciseId);
        if (exercise) {
          groupCount[exercise.muscleGroup]++;
        }
      });
    });

    return Object.entries(groupCount)
      .filter(([_, value]) => value > 0)
      .map(([group, value]) => ({
        name: group === 'chest' ? '胸部' : group === 'back' ? '背部' :
              group === 'shoulder' ? '肩部' : group === 'arm' ? '手臂' :
              group === 'leg' ? '腿部' : group === 'core' ? '核心' : '全身',
        icon: '💪',
        value,
      }));
  }, [records, exercises]);

  const totalRecords = records.length;
  const totalSets = records.reduce(
    (sum, r) => sum + r.exercises.reduce((s, ex) => s + ex.sets.filter((set) => set.completed).length, 0),
    0
  );
  const totalVolume = records.reduce(
    (sum, r) =>
      sum +
      r.exercises.reduce(
        (s, ex) =>
          s + ex.sets.reduce((setSum, set) => (set.completed ? setSum + set.weight * set.reps : setSum), 0),
        0
      ),
    0
  );

  const stats = [
    { label: '连续打卡', value: streak, unit: '天', bgColor: 'bg-primary-light', icon: '🏆' },
    { label: '本周组数', value: weeklyStats.totalSets, unit: '组', bgColor: 'bg-blue-100', icon: '💪' },
    { label: '本周容量', value: Math.round(weeklyStats.totalWeight / 1000), unit: '吨', bgColor: 'bg-orange-100', icon: '🔥' },
    { label: '累计组数', value: totalSets, unit: '组', bgColor: 'bg-primary-light', icon: '🎯' },
  ];

  if (records.length === 0) {
    return (
      <View className="pb-6 bg-background">
        <View className="px-4 pt-5">
          <View className="mb-5">
            <Text className="text-xs text-gray-400">查看训练数据分析</Text>
          </View>
          <View className="bg-white rounded-xl p-8 text-center">
            <View className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Text className="text-gray-400 text-3xl">📊</Text>
            </View>
            <Text className="font-medium text-gray-800 mb-2 block text-sm">还没有数据</Text>
            <Text className="text-gray-400 text-xs">开始训练后，这里将展示你的数据分析</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="pb-6 bg-background">
      <View className="px-4 pt-5">
        <View className="mb-5">
          <Text className="text-xs text-gray-400">查看你的训练数据分析</Text>
        </View>

        <View className="grid grid-cols-2 gap-2.5 mb-5">
          {stats.map((stat) => (
            <View key={stat.label} className="bg-white rounded-xl p-4">
              <View className={`w-9 h-9 ${stat.bgColor} rounded-lg flex items-center justify-center mb-2.5`}>
                <Text className="text-xl">{stat.icon}</Text>
              </View>
              <Text className="text-xs text-gray-400 mb-1 block">{stat.label}</Text>
              <Text className="text-xl font-bold text-gray-800">
                {stat.value.toLocaleString()}
                <Text className="text-xs font-normal text-gray-400 ml-0.5">{stat.unit}</Text>
              </Text>
            </View>
          ))}
        </View>

        <View className="bg-white rounded-xl p-4 mb-3">
          <View className="flex items-center gap-2 mb-3">
            <Text className="text-primary">📈</Text>
            <Text className="font-medium text-gray-800 text-sm">本周训练趋势</Text>
          </View>
          <View className="space-y-2">
            {weeklyStats.dailyStats.map((day, index) => (
              <View key={day.date} className="flex items-center justify-between">
                <Text className="text-xs text-gray-600 w-12">{day.date.slice(5)}</Text>
                <View className="flex-1 mx-2">
                  <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <View
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${Math.min((day.totalSets / Math.max(...weeklyStats.dailyStats.map(d => d.totalSets), 1)) * 100, 100)}%` }}
                    />
                  </View>
                </View>
                <Text className="text-xs font-medium text-gray-800 w-8 text-right">{day.totalSets}组</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="bg-white rounded-xl p-4 mb-3">
          <View className="flex items-center gap-2 mb-3">
            <Text className="text-primary">📅</Text>
            <Text className="font-medium text-gray-800 text-sm">肌群训练分布</Text>
          </View>
          <View className="space-y-2.5">
            {muscleGroupData.map((item) => (
              <View key={item.name} className="flex items-center justify-between">
                <View className="flex items-center gap-2">
                  <Text className="text-base">{item.icon}</Text>
                  <Text className="text-xs text-gray-600">{item.name}</Text>
                </View>
                <View className="flex items-center gap-2">
                  <View className="h-1.5 bg-gray-100 rounded-full overflow-hidden" style={{ width: '70px' }}>
                    <View
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(item.value / Math.max(...muscleGroupData.map((d) => d.value))) * 100}%` }}
                    />
                  </View>
                  <Text className="text-xs font-medium text-gray-800 w-12 text-right">
                    {item.value} 次
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className="bg-primary rounded-xl p-4">
          <View className="text-center text-white">
            <Text className="text-white/70 text-xs mb-2 block">累计训练容量</Text>
            <Text className="text-3xl font-bold">
              {(totalVolume / 1000).toFixed(1)}
              <Text className="text-lg ml-1.5">吨</Text>
            </Text>
            <Text className="text-white/60 text-xs mt-1.5 block">
              共 {totalRecords} 次训练 · {totalSets} 组
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
