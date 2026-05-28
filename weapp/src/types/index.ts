export type MuscleGroup = 'chest' | 'back' | 'shoulder' | 'arm' | 'leg' | 'core' | 'fullbody';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  description?: string;
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
}

export interface WorkoutRecord {
  id: string;
  date: string;
  templateId?: string;
  templateName?: string;
  exercises: ExerciseRecord[];
  notes?: string;
  createdAt: string;
}

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
}

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  chest: '胸部',
  back: '背部',
  shoulder: '肩部',
  arm: '手臂',
  leg: '腿部',
  core: '核心',
  fullbody: '全身'
};

export const MUSCLE_GROUP_ICONS: Record<MuscleGroup, string> = {
  chest: '💪',
  back: '🔙',
  shoulder: '🎯',
  arm: '💪',
  leg: '🦵',
  core: '🎯',
  fullbody: '🏃'
};

export interface User {
  id: string;
  openId: string;
  nickname: string;
  avatarUrl: string;
  role: 'user' | 'admin';
  createdAt: string;
  lastLoginAt: string;
}

export interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
}
