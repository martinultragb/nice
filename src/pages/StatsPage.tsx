import { useMemo } from 'react';
import { Trophy, Dumbbell, Target, TrendingUp, Calendar, Flame } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { format } from 'date-fns';
import { useWorkoutStore } from '../store/workoutStore';
import { useExerciseStore } from '../store/exerciseStore';
import { MUSCLE_GROUP_LABELS, MUSCLE_GROUP_ICONS, MuscleGroup } from '../types';

const CHART_COLORS = ['#07C160', '#10AEFF', '#FF9500', '#FF2D55', '#AF52DE', '#5856D6', '#34C759', '#007AFF'];

export default function StatsPage() {
  const { records, getWeeklyStats, calculateStreak } = useWorkoutStore();
  const { exercises } = useExerciseStore();
  const weeklyStats = getWeeklyStats();
  const streak = calculateStreak();

  const lineData = weeklyStats.dailyStats.map((day) => ({
    date: format(new Date(day.date), 'M/d'),
    sets: day.totalSets,
    volume: day.totalWeight,
  }));

  const muscleGroupData = useMemo(() => {
    const groupCount: Record<MuscleGroup, number> = {
      chest: 0,
      back: 0,
      shoulder: 0,
      arm: 0,
      leg: 0,
      core: 0,
      fullbody: 0,
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
        name: MUSCLE_GROUP_LABELS[group as MuscleGroup],
        icon: MUSCLE_GROUP_ICONS[group as MuscleGroup],
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
    {
      icon: Trophy,
      label: '连续打卡',
      value: streak,
      unit: '天',
      bgColor: 'bg-[#E8FBF0]',
      iconColor: 'text-[#07C160]',
    },
    {
      icon: Dumbbell,
      label: '本周组数',
      value: weeklyStats.totalSets,
      unit: '组',
      bgColor: 'bg-[#E5F3FF]',
      iconColor: 'text-[#10AEFF]',
    },
    {
      icon: Flame,
      label: '本周容量',
      value: Math.round(weeklyStats.totalWeight / 1000),
      unit: '吨',
      bgColor: 'bg-[#FFF4E5]',
      iconColor: 'text-[#FF9500]',
    },
    {
      icon: Target,
      label: '累计组数',
      value: totalSets,
      unit: '组',
      bgColor: 'bg-[#E8FBF0]',
      iconColor: 'text-[#07C160]',
    },
  ];

  if (records.length === 0) {
    return (
      <div className="pb-6">
        <div className="px-4 pt-5">
          <header className="mb-5">
            <p className="text-xs text-gray-400">查看训练数据分析</p>
          </header>

          <div className="bg-white rounded-xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#F7F8FA] rounded-full flex items-center justify-center">
              <TrendingUp size={32} className="text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-800 mb-2 text-sm">还没有数据</h3>
            <p className="text-gray-400 text-xs">开始训练后，这里将展示你的数据分析</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-6">
      <div className="px-4 pt-5">
        <header className="mb-5">
          <p className="text-xs text-gray-400">查看你的训练数据分析</p>
        </header>

        <div className="grid grid-cols-2 gap-2.5 mb-5">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl p-4"
            >
              <div className={`w-9 h-9 ${stat.bgColor} rounded-lg flex items-center justify-center mb-2.5`}>
                <stat.icon size={18} className={stat.iconColor} />
              </div>
              <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
              <p className="text-xl font-bold text-gray-800">
                {stat.value.toLocaleString()}
                <span className="text-xs font-normal text-gray-400 ml-0.5">{stat.unit}</span>
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl p-4 mb-3">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-[#07C160]" />
            <h3 className="font-medium text-gray-800 text-sm">本周训练趋势</h3>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lineData}>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#8C8C8C' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#8C8C8C' }}
                  width={25}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #F7F8FA',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  }}
                  labelStyle={{ fontWeight: 'medium', color: '#1A1A1A', fontSize: '12px' }}
                />
                <Bar dataKey="sets" fill="#07C160" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 mb-3">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={16} className="text-[#07C160]" />
            <h3 className="font-medium text-gray-800 text-sm">肌群训练分布</h3>
          </div>
          <div className="space-y-2.5">
            {muscleGroupData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">{item.icon}</span>
                  <span className="text-xs text-gray-600">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="h-1.5 rounded-full bg-[#F7F8FA] overflow-hidden"
                    style={{ width: '70px' }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(item.value / Math.max(...muscleGroupData.map((d) => d.value))) * 100}%`,
                        backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-800 w-12 text-right">
                    {item.value} 次
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#07C160] rounded-xl p-4">
          <div className="text-center text-white">
            <p className="text-white/70 text-xs mb-2">累计训练容量</p>
            <p className="text-3xl font-bold">
              {(totalVolume / 1000).toFixed(1)}
              <span className="text-lg ml-1.5">吨</span>
            </p>
            <p className="text-white/60 text-xs mt-1.5">
              共 {totalRecords} 次训练 · {totalSets} 组
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
