import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format, subDays } from 'date-fns';
import { WorkoutRecord, ExerciseRecord, SetRecord, DailyStats, WeeklyStats } from '../types';

interface WorkoutStore {
  records: WorkoutRecord[];
  addWorkout: (workout: Omit<WorkoutRecord, 'id' | 'createdAt'>) => void;
  updateWorkout: (id: string, workout: Partial<Omit<WorkoutRecord, 'id' | 'createdAt'>>) => void;
  deleteWorkout: (id: string) => void;
  getWorkoutByDate: (date: string) => WorkoutRecord | undefined;
  getTodayWorkout: () => WorkoutRecord | undefined;
  getWorkoutsByDateRange: (startDate: string, endDate: string) => WorkoutRecord[];
  getWeeklyStats: () => WeeklyStats;
  calculateStreak: () => number;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const formatDate = (date: Date) => format(date, 'yyyy-MM-dd');

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set, get) => ({
      records: [],

      addWorkout: (workout) => {
        const newWorkout: WorkoutRecord = {
          ...workout,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          records: [...state.records, newWorkout],
        }));
      },

      updateWorkout: (id, updates) => {
        set((state) => ({
          records: state.records.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        }));
      },

      deleteWorkout: (id) => {
        set((state) => ({
          records: state.records.filter((r) => r.id !== id),
        }));
      },

      getWorkoutByDate: (date) => {
        return get().records.find((r) => r.date === date);
      },

      getTodayWorkout: () => {
        const today = formatDate(new Date());
        return get().records.find((r) => r.date === today);
      },

      getWorkoutsByDateRange: (startDate, endDate) => {
        return get().records.filter((r) => r.date >= startDate && r.date <= endDate);
      },

      getWeeklyStats: () => {
        const records = get().records;
        const today = new Date();
        const dailyStats: DailyStats[] = [];

        for (let i = 6; i >= 0; i--) {
          const date = formatDate(subDays(today, i));
          const dayRecord = records.find((r) => r.date === date);
          
          let totalSets = 0;
          let totalReps = 0;
          let totalWeight = 0;
          let exerciseCount = 0;

          if (dayRecord) {
            dayRecord.exercises.forEach((ex) => {
              exerciseCount++;
              ex.sets.forEach((set) => {
                if (set.completed) {
                  totalSets++;
                  totalReps += set.reps;
                  totalWeight += set.weight * set.reps;
                }
              });
            });
          }

          dailyStats.push({
            date,
            totalSets,
            totalReps,
            totalWeight,
            exerciseCount,
          });
        }

        const totalSets = dailyStats.reduce((sum, d) => sum + d.totalSets, 0);
        const totalReps = dailyStats.reduce((sum, d) => sum + d.totalReps, 0);
        const totalWeight = dailyStats.reduce((sum, d) => sum + d.totalWeight, 0);
        const streakDays = get().calculateStreak();

        return {
          weekStart: formatDate(subDays(today, 6)),
          dailyStats,
          totalSets,
          totalReps,
          totalWeight,
          streakDays,
        };
      },

      calculateStreak: () => {
        const records = get().records;
        if (records.length === 0) return 0;

        const dates = new Set(records.map((r) => r.date));
        const today = formatDate(new Date());
        const yesterday = formatDate(subDays(new Date(), 1));

        if (!dates.has(today) && !dates.has(yesterday)) return 0;

        let streak = 0;
        const checkDate = dates.has(today) ? today : yesterday;

        for (let i = 0; i < 365; i++) {
          const date = formatDate(subDays(new Date(checkDate), i));
          if (dates.has(date)) {
            streak++;
          } else {
            break;
          }
        }

        return streak;
      },
    }),
    {
      name: 'fitness-workouts',
    }
  )
);
