import { Novel, Backup, BackupMetadata } from '../types';

/**
 * Backup service for managing novel data backups
 */
export class BackupService {
  private readonly BACKUP_KEY = 'novel_backups';
  private readonly MAX_BACKUPS = 10; // Maximum number of backups to keep

  /**
   * Create a backup of the novel data
   */
  async createBackup(novel: Novel, name?: string): Promise<Backup> {
    const backup: Backup = {
      id: this.generateId(),
      timestamp: new Date(),
      name: name || `Backup ${new Date().toLocaleString()}`,
      size: this.calculateSize(novel),
      novelData: JSON.parse(JSON.stringify(novel)) // Deep clone
    };

    await this.saveBackup(backup);
    await this.cleanupOldBackups();

    return backup;
  }

  /**
   * Get all backup metadata (without full novel data)
   */
  async listBackups(): Promise<BackupMetadata[]> {
    const backups = await this.loadAllBackups();
    return backups.map(backup => ({
      id: backup.id,
      timestamp: backup.timestamp,
      name: backup.name,
      size: backup.size
    }));
  }

  /**
   * Restore a backup by ID
   */
  async restoreBackup(backupId: string): Promise<Novel> {
    const backups = await this.loadAllBackups();
    const backup = backups.find(b => b.id === backupId);

    if (!backup) {
      throw new Error(`Backup not found: ${backupId}`);
    }

    return backup.novelData;
  }

  /**
   * Delete a backup by ID
   */
  async deleteBackup(backupId: string): Promise<void> {
    const backups = await this.loadAllBackups();
    const filtered = backups.filter(b => b.id !== backupId);

    if (filtered.length === backups.length) {
      throw new Error(`Backup not found: ${backupId}`);
    }

    await this.saveAllBackups(filtered);
  }

  /**
   * Delete all backups
   */
  async deleteAllBackups(): Promise<void> {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.BACKUP_KEY);
    }
  }

  /**
   * Get a specific backup by ID
   */
  async getBackup(backupId: string): Promise<Backup> {
    const backups = await this.loadAllBackups();
    const backup = backups.find(b => b.id === backupId);

    if (!backup) {
      throw new Error(`Backup not found: ${backupId}`);
    }

    return backup;
  }

  /**
   * Export backup to JSON string
   */
  exportBackup(backup: Backup): string {
    return JSON.stringify(backup, null, 2);
  }

  /**
   * Import backup from JSON string
   */
  importBackup(jsonString: string): Backup {
    try {
      const backup = JSON.parse(jsonString) as Backup;

      // Validate backup structure
      if (!backup.id || !backup.timestamp || !backup.novelData) {
        throw new Error('Invalid backup format');
      }

      // Convert timestamp string to Date if needed
      if (typeof backup.timestamp === 'string') {
        backup.timestamp = new Date(backup.timestamp);
      }

      return backup;
    } catch (error) {
      throw new Error(`Failed to import backup: ${error}`);
    }
  }

  /**
   * Auto-backup with specified interval
   */
  setupAutoBackup(novel: Novel, intervalMinutes: number): () => void {
    const intervalMs = intervalMinutes * 60 * 1000;

    const intervalId = setInterval(async () => {
      try {
        await this.createBackup(novel, `Auto-backup ${new Date().toLocaleString()}`);
        console.log('[BackupService] Auto-backup created successfully');
      } catch (error) {
        console.error('[BackupService] Auto-backup failed:', error);
      }
    }, intervalMs);

    // Return cleanup function
    return () => clearInterval(intervalId);
  }

  /**
   * Save a backup to storage
   */
  private async saveBackup(backup: Backup): Promise<void> {
    const backups = await this.loadAllBackups();
    backups.push(backup);
    await this.saveAllBackups(backups);
  }

  /**
   * Load all backups from storage
   */
  private async loadAllBackups(): Promise<Backup[]> {
    if (typeof localStorage === 'undefined') {
      return [];
    }

    try {
      const stored = localStorage.getItem(this.BACKUP_KEY);
      if (!stored) {
        return [];
      }

      const backups = JSON.parse(stored) as Backup[];

      // Convert timestamp strings to Date objects
      return backups.map(backup => ({
        ...backup,
        timestamp: new Date(backup.timestamp),
        novelData: {
          ...backup.novelData,
          createdAt: new Date(backup.novelData.createdAt),
          updatedAt: new Date(backup.novelData.updatedAt)
        }
      }));
    } catch (error) {
      console.error('[BackupService] Failed to load backups:', error);
      return [];
    }
  }

  /**
   * Save all backups to storage
   */
  private async saveAllBackups(backups: Backup[]): Promise<void> {
    if (typeof localStorage === 'undefined') {
      throw new Error('localStorage is not available');
    }

    try {
      localStorage.setItem(this.BACKUP_KEY, JSON.stringify(backups));
    } catch (error) {
      console.error('[BackupService] Failed to save backups:', error);
      throw new Error('Failed to save backups to storage');
    }
  }

  /**
   * Cleanup old backups to maintain maximum count
   */
  private async cleanupOldBackups(): Promise<void> {
    const backups = await this.loadAllBackups();

    if (backups.length <= this.MAX_BACKUPS) {
      return;
    }

    // Sort by timestamp (oldest first)
    backups.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Keep only the most recent MAX_BACKUPS
    const toKeep = backups.slice(-this.MAX_BACKUPS);
    await this.saveAllBackups(toKeep);
  }

  /**
   * Calculate approximate size of novel data in bytes
   */
  private calculateSize(novel: Novel): number {
    const jsonString = JSON.stringify(novel);
    return new Blob([jsonString]).size;
  }

  /**
   * Generate a unique ID for backup
   */
  private generateId(): string {
    return `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if storage quota is available
   */
  async checkStorageSpace(): Promise<{
    available: boolean;
    usedBytes?: number;
    totalBytes?: number;
  }> {
    if (typeof navigator === 'undefined' || !navigator.storage || !navigator.storage.estimate) {
      return { available: true };
    }

    try {
      const estimate = await navigator.storage.estimate();
      const used = estimate.usage || 0;
      const total = estimate.quota || 0;

      return {
        available: used < total * 0.9, // Consider available if less than 90% used
        usedBytes: used,
        totalBytes: total
      };
    } catch {
      return { available: true };
    }
  }
}
