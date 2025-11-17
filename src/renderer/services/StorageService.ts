import Store from 'electron-store';
import { KnowledgeBase } from '../types';

const store = new Store<{ knowledge?: KnowledgeBase }>();

export class JsonStorageService {
  async save(data: KnowledgeBase): Promise<void> {
    store.set('knowledge', data);
  }

  async load(): Promise<KnowledgeBase | null> {
    const data = store.get('knowledge');
    return data ?? null;
  }
}
