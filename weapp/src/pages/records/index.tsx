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
          workoutStore.deleteWorkout(workoutId);
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
      <View 
        key={workout.id} 
        style={{
          backgroundColor: 'white',
          borderRadius: '24rpx',
          padding: '32rpx',
          marginBottom: '24rpx'
        }}
      >
        <View style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '24rpx'
        }}>
          <View>
            <Text style={{ fontWeight: '500', color: '#1f2937', fontSize: '28rpx' }}>
              {workout.templateName || '自由训练'}
            </Text>
            <Text style={{ fontSize: '24rpx', color: '#9ca3af' }}>
              {format(new Date(workout.date), 'yyyy年M月d日')}
            </Text>
          </View>
          <View onClick={() => handleDelete(workout.id)}>
            <Text style={{ color: '#d1d5db' }}>🗑</Text>
          </View>
        </View>

        <View style={{ gap: '16rpx', marginBottom: '24rpx', display: 'flex', flexDirection: 'column' }}>
          {workout.exercises.map((ex: any, index: number) => {
            const exercise = exercises.find((e) => e.id === ex.exerciseId);
            const completedSets = ex.sets.filter((s: any) => s.completed).length;
            return (
              <View 
                key={index} 
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12rpx 20rpx',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '16rpx'
                }}
              >
                <View style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: '16rpx'
                }}>
                  <Text style={{ color: '#3b82f6' }}>💪</Text>
                  <Text style={{ fontWeight: '500', color: '#374151', fontSize: '24rpx' }}>
                    {exercise?.name || '未知动作'}
                  </Text>
                </View>
                <Text style={{ fontSize: '24rpx', color: '#6b7280' }}>
                  {completedSets}/{ex.sets.length} 组
                </Text>
              </View>
            );
          })}
        </View>

        <View style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '32rpx',
          paddingTop: '16rpx',
          borderTop: '2rpx solid #f3f4f6'
        }}>
          <View style={{ fontSize: '24rpx' }}>
            <Text style={{ color: '#9ca3af' }}>总组数: </Text>
            <Text style={{ fontWeight: '500', color: '#374151' }}>{totalSets}</Text>
          </View>
          <View style={{ fontSize: '24rpx' }}>
            <Text style={{ color: '#9ca3af' }}>训练容量: </Text>
            <Text style={{ fontWeight: '500', color: '#374151' }}>
              {Math.round(totalVolume).toLocaleString()} kg
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ paddingBottom: '24rpx', backgroundColor: '#f3f4f6' }}>
      <View style={{ padding: '32rpx', paddingTop: '40rpx' }}>
        <View style={{ marginBottom: '40rpx' }}>
          <Text style={{ fontSize: '28rpx', color: '#9ca3af' }}>查看历史训练数据</Text>
        </View>

        <View style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '32rpx'
        }}>
          <View style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '4rpx'
          }}>
            <View 
              style={{ padding: '12rpx' }}
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <Text style={{ color: '#6b7280' }}>◀</Text>
            </View>
            <Text style={{
              fontWeight: '500',
              color: '#1f2937',
              minWidth: '200rpx',
              textAlign: 'center',
              fontSize: '28rpx'
            }}>
              {format(currentMonth, 'yyyy年M月')}
            </Text>
            <View 
              style={{ padding: '12rpx' }}
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <Text style={{ color: '#6b7280' }}>▶</Text>
            </View>
          </View>

          <View style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '4rpx',
            backgroundColor: '#f3f4f6',
            borderRadius: '16rpx',
            padding: '4rpx'
          }}>
            <View
              style={{
                padding: '12rpx',
                borderRadius: '16rpx',
                backgroundColor: viewMode === 'calendar' ? 'white' : 'transparent',
                color: viewMode === 'calendar' ? '#3b82f6' : '#9ca3af'
              }}
              onClick={() => setViewMode('calendar')}
            >
              <Text style={{ fontSize: '28rpx' }}>📅</Text>
            </View>
            <View
              style={{
                padding: '12rpx',
                borderRadius: '16rpx',
                backgroundColor: viewMode === 'list' ? 'white' : 'transparent',
                color: viewMode === 'list' ? '#3b82f6' : '#9ca3af'
              }}
              onClick={() => setViewMode('list')}
            >
              <Text style={{ fontSize: '28rpx' }}>📋</Text>
            </View>
          </View>
        </View>

        {viewMode === 'calendar' && (
          <>
            <View style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '4rpx',
              marginBottom: '4rpx'
            }}>
              {['一', '二', '三', '四', '五', '六', '日'].map((day) => (
                <View key={day} style={{
                  textAlign: 'center',
                  fontSize: '20rpx',
                  color: '#9ca3af',
                  paddingTop: '12rpx',
                  paddingBottom: '12rpx'
                }}>
                  {day}
                </View>
              ))}
            </View>

            <View style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '4rpx',
              marginBottom: '40rpx'
            }}>
              {calendarDays.map((day) => {
                const dayWorkout = getWorkoutForDate(day);
                const hasWorkout = !!dayWorkout;
                const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                const isSelected = selectedDate && isSameDay(day, selectedDate);

                let bgColor = 'transparent';
                let textColor = isCurrentMonth ? '#374151' : '#d1d5db';
                
                if (isToday(day)) {
                  bgColor = '#3b82f6';
                  textColor = 'white';
                } else if (isSelected) {
                  bgColor = '#dbeafe';
                  textColor = '#3b82f6';
                } else if (hasWorkout) {
                  bgColor = '#dbeafe';
                  textColor = '#3b82f6';
                }

                return (
                  <View
                    key={day.toISOString()}
                    style={{
                      position: 'relative',
                      aspectRatio: '1/1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '16rpx',
                      fontSize: '24rpx',
                      fontWeight: '500',
                      backgroundColor: bgColor,
                      color: textColor
                    }}
                    onClick={() => setSelectedDate(day)}
                  >
                    {format(day, 'd')}
                    {hasWorkout && (
                      <View style={{
                        position: 'absolute',
                        bottom: '8rpx',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '8rpx',
                        height: '8rpx',
                        backgroundColor: '#3b82f6',
                        borderRadius: '50%'
                      }} />
                    )}
                  </View>
                );
              })}
            </View>

            {selectedDate && (
              <View style={{ marginBottom: '40rpx' }}>
                <Text style={{
                  fontWeight: '500',
                  color: '#1f2937',
                  marginBottom: '24rpx',
                  display: 'block',
                  fontSize: '28rpx'
                }}>
                  {isToday(selectedDate) ? '今日' : format(selectedDate, 'M月d日')} 的训练
                </Text>
                {!selectedDateWorkout ? (
                  <View style={{
                    backgroundColor: 'white',
                    borderRadius: '24rpx',
                    padding: '48rpx',
                    textAlign: 'center'
                  }}>
                    <View style={{
                      width: '96rpx',
                      height: '96rpx',
                      margin: '0 auto 24rpx',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Text style={{ color: '#9ca3af', fontSize: '48rpx' }}>💪</Text>
                    </View>
                    <Text style={{ color: '#9ca3af', fontSize: '24rpx' }}>
                      这天没有训练记录
                    </Text>
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
            <Text style={{
              fontWeight: '500',
              color: '#1f2937',
              marginBottom: '24rpx',
              display: 'block',
              fontSize: '28rpx'
            }}>
              所有记录 ({sortedRecords.length})
            </Text>
            {sortedRecords.length === 0 ? (
              <View style={{
                backgroundColor: 'white',
                borderRadius: '24rpx',
                padding: '48rpx',
                textAlign: 'center'
              }}>
                <View style={{
                  width: '96rpx',
                  height: '96rpx',
                  margin: '0 auto 24rpx',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Text style={{ color: '#9ca3af', fontSize: '48rpx' }}>📋</Text>
                </View>
                <Text style={{ color: '#9ca3af', fontSize: '24rpx' }}>
                  还没有训练记录
                </Text>
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