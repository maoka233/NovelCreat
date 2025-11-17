import { create } from 'zustand';
import { Chapter, KnowledgeBase, NovelOutline } from '../types';

interface KnowledgeState extends KnowledgeBase {
  chapters: Chapter[];
  setOutline: (outline: NovelOutline) => void;
  setChapters: (chapters: Chapter[]) => void;
}

export const useKnowledgeStore = create<KnowledgeState>(set => ({
  outline: null,
  characterCards: [],
  worldSettings: [],
  chapterSummaries: [],
  plotPoints: [],
  consistencyRules: [],
  chapters: [],
  setOutline: outline => set({ outline }),
  setChapters: chapters => set({ chapters })
}));
