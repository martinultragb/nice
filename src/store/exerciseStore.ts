import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Exercise, MuscleGroup, DEFAULT_EXERCISES } from '../types';

interface ExerciseStore {
  exercises: Exercise[];
  addExercise: (exercise: Omit<Exercise, 'id' | 'createdAt'>) => void;
  updateExercise: (id: string, exercise: Partial<Omit<Exercise, 'id' | 'createdAt'>>) => void;
  deleteExercise: (id: string) => void;
  getExerciseById: (id: string) => Exercise | undefined;
  getExercisesByMuscle: (muscleGroup: MuscleGroup) => Exercise[];
  initializeDefaultExercises: () => void;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useExerciseStore = create<ExerciseStore>()(
  persist(
    (set, get) => ({
      exercises: [],

      addExercise: (exercise) => {
        const newExercise: Exercise = {
          ...exercise,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          exercises: [...state.exercises, newExercise],
        }));
      },

      updateExercise: (id, updates) => {
        set((state) => ({
          exercises: state.exercises.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        }));
      },

      deleteExercise: (id) => {
        set((state) => ({
          exercises: state.exercises.filter((e) => e.id !== id),
        }));
      },

      getExerciseById: (id) => {
        return get().exercises.find((e) => e.id === id);
      },

      getExercisesByMuscle: (muscleGroup) => {
        return get().exercises.filter((e) => e.muscleGroup === muscleGroup);
      },

      initializeDefaultExercises: () => {
        const current = get().exercises;
        if (current.length === 0) {
          const defaultExercises: Exercise[] = DEFAULT_EXERCISES.map((e) => ({
            ...e,
            id: generateId(),
            createdAt: new Date().toISOString(),
          }));
          set({ exercises: defaultExercises });
        }
      },
    }),
    {
      name: 'fitness-exercises',
    }
  )
);
