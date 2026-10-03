import { ChecklistItem } from '../types/compliance';

const SAVED_STANDARDS_KEY = 'bis_copilot_saved_standards';
const CHECKLIST_KEY = 'bis_copilot_checklist';
const RECENT_SESSIONS_KEY = 'bis_copilot_recent_sessions';

export const storage = {
  getSavedStandards(): string[] {
    try {
      const data = localStorage.getItem(SAVED_STANDARDS_KEY);
      return data ? JSON.parse(data) : ['IS 17526:2021', 'IS 302-2-3:2021'];
    } catch {
      return [];
    }
  },

  toggleSavedStandard(standardNumber: string): string[] {
    const list = this.getSavedStandards();
    const index = list.indexOf(standardNumber);
    let updated: string[];
    if (index >= 0) {
      updated = list.filter((s) => s !== standardNumber);
    } else {
      updated = [...list, standardNumber];
    }
    try {
      localStorage.setItem(SAVED_STANDARDS_KEY, JSON.stringify(updated));
    } catch {
      // storage error ignored
    }
    return updated;
  },

  isStandardSaved(standardNumber: string): boolean {
    return this.getSavedStandards().includes(standardNumber);
  },

  getChecklist(defaultItems: ChecklistItem[]): ChecklistItem[] {
    try {
      const data = localStorage.getItem(CHECKLIST_KEY);
      return data ? JSON.parse(data) : defaultItems;
    } catch {
      return defaultItems;
    }
  },

  saveChecklist(items: ChecklistItem[]): void {
    try {
      localStorage.setItem(CHECKLIST_KEY, JSON.stringify(items));
    } catch {
      // storage error ignored
    }
  },
};
