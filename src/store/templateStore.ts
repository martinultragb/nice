import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WorkoutTemplate, TemplateExercise } from '../types';

interface TemplateStore {
  templates: WorkoutTemplate[];
  addTemplate: (template: Omit<WorkoutTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTemplate: (id: string, template: Partial<Omit<WorkoutTemplate, 'id' | 'createdAt'>>) => void;
  deleteTemplate: (id: string) => void;
  getTemplateById: (id: string) => WorkoutTemplate | undefined;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useTemplateStore = create<TemplateStore>()(
  persist(
    (set, get) => ({
      templates: [],

      addTemplate: (template) => {
        const now = new Date().toISOString();
        const newTemplate: WorkoutTemplate = {
          ...template,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          templates: [...state.templates, newTemplate],
        }));
      },

      updateTemplate: (id, updates) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
          ),
        }));
      },

      deleteTemplate: (id) => {
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        }));
      },

      getTemplateById: (id) => {
        return get().templates.find((t) => t.id === id);
      },
    }),
    {
      name: 'fitness-templates',
    }
  )
);
