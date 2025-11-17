import Store from 'electron-store';
import { KnowledgeBase } from '../types';

const store = new Store<{ knowledge: KnowledgeBase }>();

export class JsonStorageService {
  async save(data: KnowledgeBase): Promise<void> {
    store.set('knowledge', data);
  }

  async load(): Promise<KnowledgeBase | null> {
    return store.get('knowledge', null as unknown as KnowledgeBase | null);
  }
}
