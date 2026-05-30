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
    { label: '连续打卡', value: streak, unit: '天', bgColor: '#dbeafe', icon: '🏆' },
    { label: '本周组数', value: weeklyStats.totalSets, unit: '组', bgColor: '#dbeafe', icon: '💪' },
    { label: '本周容量', value: Math.round(weeklyStats.totalWeight / 1000), unit: '吨', bgColor: '#dbeafe', icon: '🔥' },
    { label: '累计组数', value: totalSets, unit: '组', bgColor: '#dbeafe', icon: '🎯' },
  ];

  if (records.length === 0) {
    return (
      <View style={{ paddingBottom: '24rpx', backgroundColor: '#f3f4f6' }}>
        <View style={{ padding: '32rpx', paddingTop: '40rpx' }}>
          <View style={{ marginBottom: '40rpx' }}>
            <Text style={{ fontSize: '28rpx', color: '#9ca3af' }}>查看训练数据分析</Text>
          </View>
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
              <Text style={{ color: '#9ca3af', fontSize: '60rpx' }}>📊</Text>
            </View>
            <Text style={{
              fontWeight: '500',
              color: '#1f2937',
              marginBottom: '16rpx',
              display: 'block',
              fontSize: '28rpx'
            }}>
              还没有数据
            </Text>
            <Text style={{ color: '#9ca3af', fontSize: '24rpx' }}>
              开始训练后，这里将展示你的数据分析
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ paddingBottom: '24rpx', backgroundColor: '#f3f4f6' }}>
      <View style={{ padding: '32rpx', paddingTop: '40rpx' }}>
        <View style={{ marginBottom: '40rpx' }}>
          <Text style={{ fontSize: '28rpx', color: '#9ca3af' }}>查看你的训练数据分析</Text>
        </View>

        <View style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '20rpx',
          marginBottom: '40rpx'
        }}>
          {stats.map((stat) => (
            <View 
              key={stat.label} 
              style={{
                backgroundColor: 'white',
                borderRadius: '24rpx',
                padding: '32rpx'
              }}
            >
              <View style={{
                width: '72rpx',
                height: '72rpx',
                backgroundColor: stat.bgColor,
                borderRadius: '16rpx',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20rpx'
              }}>
                <Text style={{ fontSize: '40rpx' }}>{stat.icon}</Text>
              </View>
              <Text style={{
                fontSize: '24rpx',
                color: '#9ca3af',
                marginBottom: '8rpx',
                display: 'block'
              }}>
                {stat.label}
              </Text>
              <Text style={{ fontSize: '40rpx', fontWeight: 'bold', color: '#1f2937' }}>
                {stat.value.toLocaleString()}
                <Text style={{ fontSize: '24rpx', fontWeight: 'normal', color: '#9ca3af', marginLeft: '4rpx' }}>
                  {stat.unit}
                </Text>
              </Text>
            </View>
          ))}
        </View>

        <View style={{
          backgroundColor: 'white',
          borderRadius: '24rpx',
          padding: '32rpx',
          marginBottom: '24rpx'
        }}>
          <View style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '16rpx',
            marginBottom: '24rpx'
          }}>
            <Text style={{ color: '#3b82f6' }}>📈</Text>
            <Text style={{ fontWeight: '500', color: '#1f2937', fontSize: '28rpx' }}>
              本周训练趋势
            </Text>
          </View>
          <View style={{ gap: '16rpx', display: 'flex', flexDirection: 'column' }}>
            {weeklyStats.dailyStats.map((day, index) => {
              const maxSets = Math.max(...weeklyStats.dailyStats.map(d => d.totalSets));
              const percentage = maxSets > 0 ? Math.min((day.totalSets / maxSets) * 100, 100) : 0;
              return (
                <View 
                  key={day.date} 
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <Text style={{
                    fontSize: '24rpx',
                    color: '#4b5563',
                    width: '96rpx'
                  }}>
                    {day.date.slice(5)}
                  </Text>
                  <View style={{
                    flex: 1,
                    marginLeft: '16rpx',
                    marginRight: '16rpx'
                  }}>
                    <View style={{
                      height: '8rpx',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '9999px',
                      overflow: 'hidden'
                    }}>
                      <View
                        style={{
                          height: '100%',
                          backgroundColor: '#3b82f6',
                          borderRadius: '9999px',
                          width: `${percentage}%`
                        }}
                      />
                    </View>
                  </View>
                  <Text style={{
                    fontSize: '24rpx',
                    fontWeight: '500',
                    color: '#1f2937',
                    width: '64rpx',
                    textAlign: 'right'
                  }}>
                    {day.totalSets}组
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={{
          backgroundColor: 'white',
          borderRadius: '24rpx',
          padding: '32rpx',
          marginBottom: '24rpx'
        }}>
          <View style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '16rpx',
            marginBottom: '24rpx'
          }}>
            <Text style={{ color: '#3b82f6' }}>📅</Text>
            <Text style={{ fontWeight: '500', color: '#1f2937', fontSize: '28rpx' }}>
              肌群训练分布
            </Text>
          </View>
          <View style={{ gap: '20rpx', display: 'flex', flexDirection: 'column' }}>
            {muscleGroupData.map((item) => {
              const maxValue = Math.max(...muscleGroupData.map((d) => d.value));
              const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
              return (
                <View 
                  key={item.name} 
                  style={{
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
                    gap: '16rpx'
                  }}>
                    <Text style={{ fontSize: '32rpx' }}>{item.icon}</Text>
                    <Text style={{ fontSize: '24rpx', color: '#4b5563' }}>{item.name}</Text>
                  </View>
                  <View style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '16rpx'
                  }}>
                    <View style={{
                      height: '12rpx',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '9999px',
                      overflow: 'hidden',
                      width: '140rpx'
                    }}>
                      <View
                        style={{
                          height: '100%',
                          backgroundColor: '#3b82f6',
                          borderRadius: '9999px',
                          width: `${percentage}%`
                        }}
                      />
                    </View>
                    <Text style={{
                      fontSize: '24rpx',
                      fontWeight: '500',
                      color: '#1f2937',
                      width: '96rpx',
                      textAlign: 'right'
                    }}>
                      {item.value} 次
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={{
          backgroundColor: '#3b82f6',
          borderRadius: '24rpx',
          padding: '32rpx'
        }}>
          <View style={{ textAlign: 'center', color: 'white' }}>
            <Text style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '24rpx',
              marginBottom: '16rpx',
              display: 'block'
            }}>
              累计训练容量
            </Text>
            <Text style={{ fontSize: '60rpx', fontWeight: 'bold' }}>
              {(totalVolume / 1000).toFixed(1)}
              <Text style={{ fontSize: '32rpx', marginLeft: '12rpx' }}>吨</Text>
            </Text>
            <Text style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '24rpx',
              marginTop: '12rpx',
              display: 'block'
            }}>
              共 {totalRecords} 次训练 · {totalSets} 组
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}