import { useMemo } from 'react';
import { Trophy, Dumbbell, Target, TrendingUp, Calendar, Flame } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { format } from 'date-fns';
import { useWorkoutStore } from '../store/workoutStore';
import { useExerciseStore } from '../store/exerciseStore';
import { MUSCLE_GROUP_LABELS, MUSCLE_GROUP_ICONS, MuscleGroup } from '../types';

const CHART_COLORS = ['#FF6B35', '#00D9A5', '#FFB800', '#6C5CE7', '#00B4D8', '#FF6B9D', '#7950F2', '#F06595'];

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
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-500',
    },
    {
      icon: Dumbbell,
      label: '本周组数',
      value: weeklyStats.totalSets,
      unit: '组',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-500',
    },
    {
      icon: Flame,
      label: '本周容量',
      value: Math.round(weeklyStats.totalWeight / 1000),
      unit: '吨',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-500',
    },
    {
      icon: Target,
      label: '累计组数',
      value: totalSets,
      unit: '组',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-500',
    },
  ];

  if (records.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="max-w-md mx-auto px-4 pt-6">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">数据统计</h1>
            <p className="text-gray-500 text-sm mt-1">查看训练数据分析</p>
          </header>

          <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="font-bold text-gray-800 mb-2">还没有数据</h3>
            <p className="text-gray-500 text-sm">开始训练后，这里将展示你的数据分析</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-md mx-auto px-4 pt-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">数据统计</h1>
          <p className="text-gray-500 text-sm mt-1">查看你的训练数据分析</p>
        </header>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-10 h-10 ${stat.bgColor} rounded-xl flex items-center justify-center mb-3`}>
                <stat.icon size={20} className={stat.iconColor} />
              </div>
              <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-800">
                {stat.value.toLocaleString()}
                <span className="text-sm font-normal text-gray-400 ml-1">{stat.unit}</span>
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-orange-500" />
            <h3 className="font-bold text-gray-800">本周训练趋势</h3>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lineData}>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#9CA3AF' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#9CA3AF' }}
                  width={30}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                  labelStyle={{ fontWeight: 'bold', color: '#374151' }}
                />
                <Bar dataKey="sets" fill="#FF6B35" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={18} className="text-orange-500" />
            <h3 className="font-bold text-gray-800">肌群训练分布</h3>
          </div>
          <div className="space-y-3">
            {muscleGroupData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{item.icon}</span>
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 rounded-full bg-gray-100 overflow-hidden"
                    style={{ width: '80px' }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(item.value / Math.max(...muscleGroupData.map((d) => d.value))) * 100}%`,
                        backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-800 w-16 text-right">
                    {item.value} 次
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 shadow-lg">
          <div className="text-center text-white">
            <p className="text-white/80 text-sm mb-2">累计训练容量</p>
            <p className="text-4xl font-bold">
              {(totalVolume / 1000).toFixed(1)}
              <span className="text-xl ml-2">吨</span>
            </p>
            <p className="text-white/60 text-sm mt-2">
              共 {totalRecords} 次训练 · {totalSets} 组
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
