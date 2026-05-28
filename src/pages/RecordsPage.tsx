import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, List, Filter, Dumbbell, Trash2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useWorkoutStore } from '../store/workoutStore';
import { useExerciseStore } from '../store/exerciseStore';

type ViewMode = 'calendar' | 'list';

export default function RecordsPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { records, deleteWorkout } = useWorkoutStore();
  const { exercises } = useExerciseStore();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getWorkoutForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return records.find((r) => r.date === dateStr);
  };

  const selectedDateWorkout = selectedDate ? getWorkoutForDate(selectedDate) : null;
  const sortedRecords = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleDelete = (workoutId: string) => {
    if (confirm('确定要删除这条训练记录吗？')) {
      deleteWorkout(workoutId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-md mx-auto px-4 pt-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">训练记录</h1>
          <p className="text-gray-500 text-sm mt-1">查看历史训练数据</p>
        </header>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
            <span className="font-semibold text-gray-800 min-w-[120px] text-center">
              {format(currentMonth, 'yyyy年 MMMM', { locale: zhCN })}
            </span>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronRight size={20} className="text-gray-600" />
            </button>
          </div>

          <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2 rounded-full transition-all ${
                viewMode === 'calendar'
                  ? 'bg-white shadow text-orange-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Calendar size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-full transition-all ${
                viewMode === 'list'
                  ? 'bg-white shadow text-orange-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {viewMode === 'calendar' && (
          <>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['一', '二', '三', '四', '五', '六', '日'].map((day) => (
                <div key={day} className="text-center text-xs font-medium text-gray-400 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 mb-6">
              {calendarDays.map((day) => {
                const dayWorkout = getWorkoutForDate(day);
                const hasWorkout = !!dayWorkout;
                const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                const isSelected = selectedDate && isSameDay(day, selectedDate);

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      relative aspect-square flex items-center justify-center rounded-xl text-sm font-medium
                      transition-all duration-200
                      ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                      ${isToday(day) ? 'bg-orange-500 text-white' : ''}
                      ${isSelected && !isToday(day) ? 'ring-2 ring-orange-500 ring-offset-2' : ''}
                      ${hasWorkout && !isToday(day) ? 'bg-green-100 text-green-600' : ''}
                      hover:bg-orange-50
                    `}
                  >
                    {format(day, 'd')}
                    {hasWorkout && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {selectedDate && (
              <div className="mb-6">
                <h3 className="font-bold text-gray-800 mb-3">
                  {isToday(selectedDate) ? '今日' : format(selectedDate, 'M月d日')} 的训练
                </h3>
                {!selectedDateWorkout ? (
                  <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
                    <div className="text-4xl mb-2">💪</div>
                    <p className="text-gray-500 text-sm">这天没有训练记录</p>
                  </div>
                ) : (
                  <WorkoutCard workout={selectedDateWorkout} exercises={exercises} onDelete={handleDelete} />
                )}
              </div>
            )}
          </>
        )}

        {viewMode === 'list' && (
          <div>
            <h3 className="font-bold text-gray-800 mb-3">所有记录 ({sortedRecords.length})</h3>
            {sortedRecords.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
                <div className="text-4xl mb-2">📝</div>
                <p className="text-gray-500 text-sm">还没有训练记录</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedRecords.map((workout) => (
                  <WorkoutCard key={workout.id} workout={workout} exercises={exercises} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function WorkoutCard({ workout, exercises, onDelete }: { workout: any; exercises: any[]; onDelete: (id: string) => void }) {
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
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 group">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-bold text-gray-800">
            {workout.templateName || '自由训练'}
          </h4>
          <p className="text-sm text-gray-400">{format(new Date(workout.date), 'yyyy年M月d日')}</p>
        </div>
        <button
          onClick={() => onDelete(workout.id)}
          className="p-2 rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="space-y-2 mb-3">
        {workout.exercises.map((ex: any, index: number) => {
          const exercise = exercises.find((e) => e.id === ex.exerciseId);
          const completedSets = ex.sets.filter((s: any) => s.completed).length;
          return (
            <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Dumbbell size={16} className="text-orange-400" />
                <span className="font-medium text-gray-700">{exercise?.name || '未知动作'}</span>
              </div>
              <span className="text-sm text-gray-500">
                {completedSets}/{ex.sets.length} 组
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
        <div className="text-sm">
          <span className="text-gray-400">总组数: </span>
          <span className="font-medium text-gray-700">{totalSets}</span>
        </div>
        <div className="text-sm">
          <span className="text-gray-400">训练容量: </span>
          <span className="font-medium text-gray-700">{Math.round(totalVolume).toLocaleString()} kg</span>
        </div>
      </div>
    </div>
  );
}
