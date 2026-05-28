import Taro from '@tarojs/taro'
import { format, subDays } from 'date-fns'
import type { WorkoutRecord, ExerciseRecord } from '../types'

const STORAGE_KEY = 'workout-storage';

interface DailyStats {
  date: string;
  totalSets: number;
  totalWeight: number;
}

class WorkoutStore {
  private records: WorkoutRecord[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = Taro.getStorageSync(STORAGE_KEY);
      if (stored) {
        this.records = stored;
      }
    } catch (e) {
      console.error('Failed to load workouts from storage', e);
    }
  }

  private saveToStorage() {
    try {
      Taro.setStorageSync(STORAGE_KEY, this.records);
    } catch (e) {
      console.error('Failed to save workouts to storage', e);
    }
  }

  getRecords() {
    return this.records;
  }

  getTodayWorkout(): WorkoutRecord | null {
    const today = format(new Date(), 'yyyy-MM-dd');
    return this.records.find(r => r.date === today) || null;
  }

  getWeeklyStats(): { totalSets: number; totalWeight: number; dailyStats: DailyStats[] } {
    const today = new Date();
    const weekAgo = subDays(today, 6);
    
    const weekRecords = this.records.filter(r => {
      const recordDate = new Date(r.date);
      return recordDate >= weekAgo && recordDate <= today;
    });

    const dailyStats: DailyStats[] = [];
    for (let i = 0; i < 7; i++) {
      const date = subDays(today, 6 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayRecord = weekRecords.find(r => r.date === dateStr);
      
      const totalSets = dayRecord?.exercises.reduce((sum, ex) => 
        sum + ex.sets.filter(s => s.completed).length, 0) || 0;
      
      const totalWeight = dayRecord?.exercises.reduce((sum, ex) => 
        sum + ex.sets.reduce((setSum, s) => 
          s.completed ? setSum + s.weight * s.reps : setSum, 0), 0) || 0;

      dailyStats.push({ date: dateStr, totalSets, totalWeight });
    }

    return {
      totalSets: dailyStats.reduce((sum, d) => sum + d.totalSets, 0),
      totalWeight: dailyStats.reduce((sum, d) => sum + d.totalWeight, 0),
      dailyStats
    };
  }

  calculateStreak(): number {
    if (this.records.length === 0) return 0;
    
    const sortedRecords = [...this.records].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedRecords.length; i++) {
      const recordDate = new Date(sortedRecords[i].date);
      recordDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(currentDate);
      expectedDate.setDate(expectedDate.getDate() - streak);
      expectedDate.setHours(0, 0, 0, 0);

      if (recordDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else if (recordDate.getTime() === expectedDate.getTime() - 86400000 && i === 0) {
        currentDate = recordDate;
        streak = 1;
      } else {
        break;
      }
    }

    return streak;
  }

  addWorkout(workout: Omit<WorkoutRecord, 'id' | 'createdAt'>) {
    const existingIndex = this.records.findIndex(r => r.date === workout.date);
    
    if (existingIndex !== -1) {
      const existingRecord = this.records[existingIndex];
      const mergedExercises = [...existingRecord.exercises];
      
      workout.exercises.forEach(newEx => {
        const existingExIndex = mergedExercises.findIndex(
          ex => ex.exerciseId === newEx.exerciseId
        );
        
        if (existingExIndex !== -1) {
          newEx.sets.forEach(newSet => {
            if (newSet.completed) {
              mergedExercises[existingExIndex].sets.push(newSet);
            }
          });
        } else if (newEx.sets.some(s => s.completed)) {
          mergedExercises.push(newEx);
        }
      });

      this.records[existingIndex] = {
        ...existingRecord,
        exercises: mergedExercises
      };
    } else {
      const newWorkout: WorkoutRecord = {
        id: `${workout.date}-${Date.now()}`,
        date: workout.date,
        templateId: workout.templateId,
        templateName: workout.templateName,
        exercises: workout.exercises,
        notes: workout.notes,
        createdAt: new Date().toISOString()
      };
      this.records.push(newWorkout);
    }
    
    this.saveToStorage();
  }

  updateWorkout(id: string, updates: Partial<WorkoutRecord>) {
    const index = this.records.findIndex(r => r.id === id);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...updates };
      this.saveToStorage();
    }
  }

  deleteWorkout(id: string) {
    this.records = this.records.filter(r => r.id !== id);
    this.saveToStorage();
  }
}

const workoutStore = new WorkoutStore();
export default workoutStore;
