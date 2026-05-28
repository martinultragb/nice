import Taro from '@tarojs/taro'
import type { Exercise, MuscleGroup } from '../types'

const STORAGE_KEY = 'exercise-storage';

interface ExerciseState {
  exercises: Exercise[];
}

const defaultExercises: Exercise[] = [
  { id: 'bench-press', name: '卧推', muscleGroup: 'chest', description: '主要锻炼胸大肌' },
  { id: 'incline-bench', name: '上斜卧推', muscleGroup: 'chest', description: '锻炼上胸部' },
  { id: 'chest-fly', name: '蝴蝶机夹胸', muscleGroup: 'chest', description: '孤立锻炼胸肌' },
  { id: 'push-up', name: '俯卧撑', muscleGroup: 'chest', description: '自重训练' },
  { id: 'squat', name: '深蹲', muscleGroup: 'leg', description: '主要锻炼股四头肌和臀大肌' },
  { id: 'leg-press', name: '腿举', muscleGroup: 'leg', description: '锻炼腿部力量' },
  { id: 'leg-curl', name: '腿弯举', muscleGroup: 'leg', description: '锻炼腘绳肌' },
  { id: 'calf-raise', name: '提踵', muscleGroup: 'leg', description: '锻炼小腿肌群' },
  { id: 'deadlift', name: '硬拉', muscleGroup: 'back', description: '综合性背部训练' },
  { id: 'lat-pulldown', name: '高位下拉', muscleGroup: 'back', description: '锻炼背阔肌' },
  { id: 'barbell-row', name: '杠铃划船', muscleGroup: 'back', description: '锻炼背部厚度' },
  { id: 'pull-up', name: '引体向上', muscleGroup: 'back', description: '自重背部训练' },
  { id: 'overhead-press', name: '推举', muscleGroup: 'shoulder', description: '锻炼肩部肌肉' },
  { id: 'lateral-raise', name: '侧平举', muscleGroup: 'shoulder', description: '孤立锻炼三角肌中束' },
  { id: 'front-raise', name: '前平举', muscleGroup: 'shoulder', description: '锻炼三角肌前束' },
  { id: 'bicep-curl', name: '哑铃弯举', muscleGroup: 'arm', description: '锻炼肱二头肌' },
  { id: 'tricep-pushdown', name: '绳索下压', muscleGroup: 'arm', description: '锻炼肱三头肌' },
  { id: 'hammer-curl', name: '锤式弯举', muscleGroup: 'arm', description: '锻炼肱肌和肱二头肌' },
  { id: 'plank', name: '平板支撑', muscleGroup: 'core', description: '核心稳定性训练' },
  { id: 'crunch', name: '卷腹', muscleGroup: 'core', description: '腹肌训练' },
  { id: 'russian-twist', name: '俄式转体', muscleGroup: 'core', description: '腹斜肌训练' },
  { id: 'cable-crunch', name: '绳索卷腹', muscleGroup: 'core', description: '负重腹肌训练' }
];

class ExerciseStore {
  private exercises: Exercise[] = [];

  constructor() {
    this.loadFromStorage();
    this.initializeDefaultExercises();
  }

  private loadFromStorage() {
    try {
      const stored = Taro.getStorageSync(STORAGE_KEY);
      if (stored) {
        this.exercises = stored;
      }
    } catch (e) {
      console.error('Failed to load exercises from storage', e);
    }
  }

  private saveToStorage() {
    try {
      Taro.setStorageSync(STORAGE_KEY, this.exercises);
    } catch (e) {
      console.error('Failed to save exercises to storage', e);
    }
  }

  initializeDefaultExercises() {
    if (this.exercises.length === 0) {
      this.exercises = defaultExercises;
      this.saveToStorage();
    }
  }

  getExercises() {
    return this.exercises;
  }

  addExercise(exercise: Omit<Exercise, 'id'>) {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.exercises.push({ ...exercise, id });
    this.saveToStorage();
  }

  updateExercise(id: string, updates: Partial<Exercise>) {
    const index = this.exercises.findIndex(e => e.id === id);
    if (index !== -1) {
      this.exercises[index] = { ...this.exercises[index], ...updates };
      this.saveToStorage();
    }
  }

  deleteExercise(id: string) {
    this.exercises = this.exercises.filter(e => e.id !== id);
    this.saveToStorage();
  }
}

const exerciseStore = new ExerciseStore();
export default exerciseStore;
