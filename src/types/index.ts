export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  description?: string;
  createdAt: string;
}

export type MuscleGroup = 
  | 'chest'      // 胸部
  | 'back'       // 背部
  | 'shoulder'   // 肩部
  | 'arm'        // 手臂
  | 'leg'        // 腿部
  | 'core'       // 核心
  | 'fullbody';  // 全身

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  chest: '胸部',
  back: '背部',
  shoulder: '肩部',
  arm: '手臂',
  leg: '腿部',
  core: '核心',
  fullbody: '全身',
};

export const MUSCLE_GROUP_ICONS: Record<MuscleGroup, string> = {
  chest: '💪',
  back: '🔙',
  shoulder: '🎯',
  arm: '💪',
  leg: '🦵',
  core: '🎯',
  fullbody: '🔥',
};

export interface TemplateExercise {
  exerciseId: string;
  targetSets: number;
  targetReps: number;
  notes?: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: TemplateExercise[];
  createdAt: string;
  updatedAt: string;
}

export interface SetRecord {
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
}

export interface ExerciseRecord {
  exerciseId: string;
  sets: SetRecord[];
  notes?: string;
}

export interface WorkoutRecord {
  id: string;
  date: string;
  templateId?: string;
  templateName?: string;
  exercises: ExerciseRecord[];
  duration?: number;
  notes?: string;
  createdAt: string;
}

export interface DailyStats {
  date: string;
  totalSets: number;
  totalReps: number;
  totalWeight: number;
  exerciseCount: number;
}

export interface WeeklyStats {
  weekStart: string;
  dailyStats: DailyStats[];
  totalSets: number;
  totalReps: number;
  totalWeight: number;
  streakDays: number;
}

export const DEFAULT_EXERCISES: Omit<Exercise, 'id' | 'createdAt'>[] = [
  { name: '卧推', muscleGroup: 'chest', description: '杠铃卧推' },
  { name: '上斜卧推', muscleGroup: 'chest', description: '上斜杠铃卧推' },
  { name: '哑铃飞鸟', muscleGroup: 'chest', description: '平板哑铃飞鸟' },
  { name: '引体向上', muscleGroup: 'back', description: '负重引体向上' },
  { name: '杠铃划船', muscleGroup: 'back', description: '俯身杠铃划船' },
  { name: '高位下拉', muscleGroup: 'back', description: '器械高位下拉' },
  { name: '肩推', muscleGroup: 'shoulder', description: '哑铃肩推' },
  { name: '侧平举', muscleGroup: 'shoulder', description: '哑铃侧平举' },
  { name: '二头弯举', muscleGroup: 'arm', description: '杠铃/哑铃弯举' },
  { name: '三头下压', muscleGroup: 'arm', description: '绳索三头下压' },
  { name: '深蹲', muscleGroup: 'leg', description: '杠铃深蹲' },
  { name: '硬拉', muscleGroup: 'leg', description: '传统硬拉' },
  { name: '腿举', muscleGroup: 'leg', description: '器械腿举' },
  { name: '腹肌卷轮', muscleGroup: 'core', description: '健腹轮卷腹' },
  { name: '平板支撑', muscleGroup: 'core', description: '标准平板支撑' },
];
