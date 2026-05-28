import { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import workoutStore from '../../store/workoutStore';
import exerciseStore from '../../store/exerciseStore';

type ViewMode = 'calendar' | 'list';

export default function Records() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const records = workoutStore.getRecords();
  const exercises = exerciseStore.getExercises();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getWorkoutForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return records.find((r) => r.date === dateStr);
  };

  const selectedDateWorkout = selectedDate ? getWorkoutForDate(selectedDate) : null;
  const sortedRecords = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleDelete = (workoutId: string) => {
    wx.showModal({
      title: '提示',
      content: '确定要删除这条训练记录吗？',
      success: (res) => {
        if (res.confirm) {
          workoutStore.dispatch.deleteWorkout(workoutId);
          wx.showToast({ title: '记录已删除', icon: 'success' });
        }
      }
    });
  };

  const renderWorkoutCard = (workout: any) => {
    const totalSets = workout.exercises.reduce(
      (sum: number, ex: any) => sum + ex.sets.filter((s: any) => s.completed).length,
      0
    );
    const totalVolume = workout.exercises.reduce(
      (sum: number, ex: any) =>
        sum + ex.sets.reduce((setSum: number, s: any) => (s.completed ? setSum + s.weight * s.reps : setSum), 0),
      0
    );

    return (
      <View key={workout.id} className="bg-white rounded-xl p-4 mb-3">
        <View className="flex items-start justify-between mb-3">
          <View>
            <Text className="font-medium text-gray-800 text-sm">{workout.templateName || '自由训练'}</Text>
            <Text className="text-xs text-gray-400">{format(new Date(workout.date), 'yyyy年M月d日')}</Text>
          </View>
          <View onClick={() => handleDelete(workout.id)}>
            <Text className="text-gray-300">🗑</Text>
          </View>
        </View>

        <View className="space-y-2 mb-3">
          {workout.exercises.map((ex: any, index: number) => {
            const exercise = exercises.find((e) => e.id === ex.exerciseId);
            const completedSets = ex.sets.filter((s: any) => s.completed).length;
            return (
              <View key={index} className="flex items-center justify-between py-1.5 px-2.5 bg-gray-50 rounded-lg">
                <View className="flex items-center gap-2">
                  <Text className="text-primary">💪</Text>
                  <Text className="font-medium text-gray-700 text-xs">{exercise?.name || '未知动作'}</Text>
                </View>
                <Text className="text-xs text-gray-500">
                  {completedSets}/{ex.sets.length} 组
                </Text>
              </View>
            );
          })}
        </View>

        <View className="flex items-center gap-4 pt-2 border-t border-gray-100">
          <View className="text-xs">
            <Text className="text-gray-400">总组数: </Text>
            <Text className="font-medium text-gray-700">{totalSets}</Text>
          </View>
          <View className="text-xs">
            <Text className="text-gray-400">训练容量: </Text>
            <Text className="font-medium text-gray-700">{Math.round(totalVolume).toLocaleString()} kg</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="pb-6 bg-background">
      <View className="px-4 pt-5">
        <View className="mb-5">
          <Text className="text-xs text-gray-400">查看历史训练数据</Text>
        </View>

        <View className="flex items-center justify-between mb-4">
          <View className="flex items-center gap-1">
            <View className="p-1.5" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <Text className="text-gray-500">◀</Text>
            </View>
            <Text className="font-medium text-gray-800 min-w-[100px] text-center text-sm">
              {format(currentMonth, 'yyyy年M月')}
            </Text>
            <View className="p-1.5" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <Text className="text-gray-500">▶</Text>
            </View>
          </View>

          <View className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
            <View
              className={`p-1.5 rounded-lg ${viewMode === 'calendar' ? 'bg-white text-primary' : 'text-gray-400'}`}
              onClick={() => setViewMode('calendar')}
            >
              <Text className="text-sm">📅</Text>
            </View>
            <View
              className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-white text-primary' : 'text-gray-400'}`}
              onClick={() => setViewMode('list')}
            >
              <Text className="text-sm">📋</Text>
            </View>
          </View>
        </View>

        {viewMode === 'calendar' && (
          <>
            <View className="grid grid-cols-7 gap-1 mb-1">
              {['一', '二', '三', '四', '五', '六', '日'].map((day) => (
                <View key={day} className="text-center text-[10px] text-gray-400 py-1.5">
                  {day}
                </View>
              ))}
            </View>

            <View className="grid grid-cols-7 gap-1 mb-5">
              {calendarDays.map((day) => {
                const dayWorkout = getWorkoutForDate(day);
                const hasWorkout = !!dayWorkout;
                const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                const isSelected = selectedDate && isSameDay(day, selectedDate);

                return (
                  <View
                    key={day.toISOString()}
                    className={`
                      relative aspect-square flex items-center justify-center rounded-lg text-xs font-medium
                      ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                      ${isToday(day) ? 'bg-primary text-white' : ''}
                      ${isSelected && !isToday(day) ? 'ring-2 ring-primary' : ''}
                      ${hasWorkout && !isToday(day) ? 'bg-primary-light text-primary' : ''}
                    `}
                    onClick={() => setSelectedDate(day)}
                  >
                    {format(day, 'd')}
                    {hasWorkout && (
                      <View className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                    )}
                  </View>
                );
              })}
            </View>

            {selectedDate && (
              <View className="mb-5">
                <Text className="font-medium text-gray-800 mb-3 text-sm block">
                  {isToday(selectedDate) ? '今日' : format(selectedDate, 'M月d日')} 的训练
                </Text>
                {!selectedDateWorkout ? (
                  <View className="bg-white rounded-xl p-6 text-center">
                    <View className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                      <Text className="text-gray-400 text-2xl">💪</Text>
                    </View>
                    <Text className="text-gray-400 text-xs">这天没有训练记录</Text>
                  </View>
                ) : (
                  renderWorkoutCard(selectedDateWorkout)
                )}
              </View>
            )}
          </>
        )}

        {viewMode === 'list' && (
          <View>
            <Text className="font-medium text-gray-800 mb-3 text-sm block">所有记录 ({sortedRecords.length})</Text>
            {sortedRecords.length === 0 ? (
              <View className="bg-white rounded-xl p-6 text-center">
                <View className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                  <Text className="text-gray-400 text-2xl">📋</Text>
                </View>
                <Text className="text-gray-400 text-xs">还没有训练记录</Text>
              </View>
            ) : (
              <ScrollView scrollY>
                {sortedRecords.map((workout) => renderWorkoutCard(workout))}
              </ScrollView>
            )}
          </View>
        )}
      </View>
    </View>
  );
}
