import { create } from 'zustand';

/**
 * Editor store state interface
 */
interface EditorStore {
  // Word count tracking
  wordCount: number;
  targetWordCount: number;
  setWordCount: (count: number) => void;
  setTargetWordCount: (count: number) => void;

  // Auto-save state
  lastSaved: Date | null;
  isSaving: boolean;
  autoSaveEnabled: boolean;
  setLastSaved: (date: Date) => void;
  setIsSaving: (saving: boolean) => void;
  toggleAutoSave: () => void;

  // Editor state
  isDirty: boolean;
  isGenerating: boolean;
  setIsDirty: (dirty: boolean) => void;
  setIsGenerating: (generating: boolean) => void;

  // Reading time estimation
  estimatedReadTime: number;
  setEstimatedReadTime: (minutes: number) => void;
}

/**
 * Editor store for managing editor state and statistics
 */
export const useEditorStore = create<EditorStore>(set => ({
  // Word count
  wordCount: 0,
  targetWordCount: 5000,
  setWordCount: (count: number) => set({ wordCount: count }),
  setTargetWordCount: (count: number) => set({ targetWordCount: count }),

  // Auto-save
  lastSaved: null,
  isSaving: false,
  autoSaveEnabled: true,
  setLastSaved: (date: Date) => set({ lastSaved: date }),
  setIsSaving: (saving: boolean) => set({ isSaving: saving }),
  toggleAutoSave: () => set(state => ({ autoSaveEnabled: !state.autoSaveEnabled })),

  // Editor state
  isDirty: false,
  isGenerating: false,
  setIsDirty: (dirty: boolean) => set({ isDirty: dirty }),
  setIsGenerating: (generating: boolean) => set({ isGenerating: generating }),

  // Reading time
  estimatedReadTime: 0,
  setEstimatedReadTime: (minutes: number) => set({ estimatedReadTime: minutes })
}));

/**
 * Calculate estimated reading time based on word count
 * Assumes average reading speed of 300 words per minute
 */
export function calculateReadingTime(wordCount: number): number {
  const wordsPerMinute = 300;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(current: number, target: number): number {
  if (target === 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}
