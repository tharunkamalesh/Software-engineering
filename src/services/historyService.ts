// History Service - Tracks user's workout and diet plan history

export interface PlanHistory {
  id: string;
  userId: string;
  type: 'workout' | 'diet';
  planName: string;
  goal: string;
  savedDate: string;
  data: Record<string, unknown>;
}

const HISTORY_KEY = 'fitness_plan_history';

function getAll(): Record<string, PlanHistory[]> {
  return JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');
}

export const historyService = {
  savePlanToHistory(userId: string, type: 'workout' | 'diet', planName: string, goal: string, data: Record<string, unknown>) {
    const all = getAll();
    if (!all[userId]) all[userId] = [];
    
    const entry: PlanHistory = {
      id: crypto.randomUUID(),
      userId,
      type,
      planName,
      goal,
      savedDate: new Date().toISOString(),
      data,
    };
    
    all[userId].push(entry);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(all));
    return entry;
  },

  getHistory(userId: string, type?: 'workout' | 'diet'): PlanHistory[] {
    const all = getAll();
    let history = all[userId] || [];
    
    if (type) {
      history = history.filter(h => h.type === type);
    }
    
    return history.sort((a, b) => new Date(b.savedDate).getTime() - new Date(a.savedDate).getTime());
  },

  getHistoryById(userId: string, id: string): PlanHistory | undefined {
    const all = getAll();
    return (all[userId] || []).find(h => h.id === id);
  },

  deleteHistoryEntry(userId: string, id: string) {
    const all = getAll();
    if (all[userId]) {
      all[userId] = all[userId].filter(h => h.id !== id);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(all));
    }
  },

  getLatestWorkoutPlan(userId: string): PlanHistory | undefined {
    const all = getAll();
    const workoutPlans = (all[userId] || []).filter(h => h.type === 'workout');
    return workoutPlans.length > 0 ? workoutPlans[0] : undefined;
  },

  getLatestDietPlan(userId: string): PlanHistory | undefined {
    const all = getAll();
    const dietPlans = (all[userId] || []).filter(h => h.type === 'diet');
    return dietPlans.length > 0 ? dietPlans[0] : undefined;
  },
};
