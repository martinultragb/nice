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
    <div className="pb-6">
      <div className="px-4 pt-5">
        <header className="mb-5">
          <p className="text-xs text-gray-400">查看历史训练数据</p>
        </header>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-1.5"
            >
              <ChevronLeft size={18} className="text-gray-500" />
            </button>
            <span className="font-medium text-gray-800 min-w-[100px] text-center text-sm">
              {format(currentMonth, 'yyyy年 MMMM', { locale: zhCN })}
            </span>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-1.5"
            >
              <ChevronRight size={18} className="text-gray-500" />
            </button>
          </div>

          <div className="flex items-center gap-1 bg-[#F7F8FA] rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'calendar'
                  ? 'bg-white text-[#07C160]'
                  : 'text-gray-400'
              }`}
            >
              <Calendar size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-[#07C160]'
                  : 'text-gray-400'
              }`}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {viewMode === 'calendar' && (
          <>
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['一', '二', '三', '四', '五', '六', '日'].map((day) => (
                <div key={day} className="text-center text-[10px] text-gray-400 py-1.5">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 mb-5">
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
                      relative aspect-square flex items-center justify-center rounded-lg text-xs font-medium
                      ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                      ${isToday(day) ? 'bg-[#07C160] text-white' : ''}
                      ${isSelected && !isToday(day) ? 'ring-2 ring-[#07C160]' : ''}
                      ${hasWorkout && !isToday(day) ? 'bg-[#E8FBF0] text-[#07C160]' : ''}
                    `}
                  >
                    {format(day, 'd')}
                    {hasWorkout && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#07C160] rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {selectedDate && (
              <div className="mb-5">
                <h3 className="font-medium text-gray-800 mb-3 text-sm">
                  {isToday(selectedDate) ? '今日' : format(selectedDate, 'M月d日')} 的训练
                </h3>
                {!selectedDateWorkout ? (
                  <div className="bg-white rounded-xl p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-[#F7F8FA] rounded-full flex items-center justify-center">
                      <Dumbbell size={24} className="text-gray-400" />
                    </div>
                    <p className="text-gray-400 text-xs">这天没有训练记录</p>
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
            <h3 className="font-medium text-gray-800 mb-3 text-sm">所有记录 ({sortedRecords.length})</h3>
            {sortedRecords.length === 0 ? (
              <div className="bg-white rounded-xl p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-[#F7F8FA] rounded-full flex items-center justify-center">
                  <List size={24} className="text-gray-400" />
                </div>
                <p className="text-gray-400 text-xs">还没有训练记录</p>
              </div>
            ) : (
              <div className="space-y-3">
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
    <div className="bg-white rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-medium text-gray-800 text-sm">
            {workout.templateName || '自由训练'}
          </h4>
          <p className="text-xs text-gray-400">{format(new Date(workout.date), 'yyyy年M月d日')}</p>
        </div>
        <button
          onClick={() => onDelete(workout.id)}
          className="p-1.5 text-gray-300 hover:text-red-500"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="space-y-2 mb-3">
        {workout.exercises.map((ex: any, index: number) => {
          const exercise = exercises.find((e) => e.id === ex.exerciseId);
          const completedSets = ex.sets.filter((s: any) => s.completed).length;
          return (
            <div key={index} className="flex items-center justify-between py-1.5 px-2.5 bg-[#F7F8FA] rounded-lg">
              <div className="flex items-center gap-2">
                <Dumbbell size={14} className="text-[#07C160]" />
                <span className="font-medium text-gray-700 text-xs">{exercise?.name || '未知动作'}</span>
              </div>
              <span className="text-xs text-gray-500">
                {completedSets}/{ex.sets.length} 组
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
        <div className="text-xs">
          <span className="text-gray-400">总组数: </span>
          <span className="font-medium text-gray-700">{totalSets}</span>
        </div>
        <div className="text-xs">
          <span className="text-gray-400">训练容量: </span>
          <span className="font-medium text-gray-700">{Math.round(totalVolume).toLocaleString()} kg</span>
        </div>
      </div>
    </div>
  );
}
