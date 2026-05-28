import Taro from '@tarojs/taro'
import type { WorkoutTemplate, TemplateExercise } from '../types'

const STORAGE_KEY = 'template-storage';

class TemplateStore {
  private templates: WorkoutTemplate[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = Taro.getStorageSync(STORAGE_KEY);
      if (stored) {
        this.templates = stored;
      }
    } catch (e) {
      console.error('Failed to load templates from storage', e);
    }
  }

  private saveToStorage() {
    try {
      Taro.setStorageSync(STORAGE_KEY, this.templates);
    } catch (e) {
      console.error('Failed to save templates to storage', e);
    }
  }

  getTemplates() {
    return this.templates;
  }

  addTemplate(template: { name: string; exercises: TemplateExercise[] }) {
    const newTemplate: WorkoutTemplate = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: template.name,
      exercises: template.exercises,
      createdAt: new Date().toISOString()
    };
    this.templates.push(newTemplate);
    this.saveToStorage();
  }

  updateTemplate(id: string, updates: Partial<Pick<WorkoutTemplate, 'name' | 'exercises'>>) {
    const index = this.templates.findIndex(t => t.id === id);
    if (index !== -1) {
      this.templates[index] = { ...this.templates[index], ...updates };
      this.saveToStorage();
    }
  }

  deleteTemplate(id: string) {
    this.templates = this.templates.filter(t => t.id !== id);
    this.saveToStorage();
  }
}

const templateStore = new TemplateStore();
export default templateStore;
