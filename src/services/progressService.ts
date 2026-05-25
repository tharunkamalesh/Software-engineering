// Progress tracking service

export interface ProgressEntry {
  date: string;
  weight: number;
  bmi: number;
}

export interface ProgressMetrics {
  userId: string;
  date: string;
  weight: number;
  bmi: number;
  initialWeight?: number;
  initialBMI?: number;
  goalWeight?: number;
  weightProgress?: number; // percentage
}

const PROGRESS_KEY = 'fitness_progress';
const METRICS_KEY = 'fitness_metrics';

function getAll(): Record<string, ProgressEntry[]> {
  return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
}

function getAllMetrics(): Record<string, ProgressMetrics[]> {
  return JSON.parse(localStorage.getItem(METRICS_KEY) || '{}');
}

export const progressService = {
  addEntry(userId: string, entry: ProgressEntry) {
    const all = getAll();
    if (!all[userId]) all[userId] = [];
    all[userId].push(entry);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
  },

  getEntries(userId: string): ProgressEntry[] {
    const entries = getAll()[userId] || [];
    return entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },

  addMetric(userId: string, metric: ProgressMetrics) {
    const all = getAllMetrics();
    if (!all[userId]) all[userId] = [];
    all[userId].push(metric);
    localStorage.setItem(METRICS_KEY, JSON.stringify(all));
  },

  getMetrics(userId: string, days: number = 90): ProgressMetrics[] {
    const all = getAllMetrics();
    const metrics = all[userId] || [];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return metrics
      .filter(m => new Date(m.date) >= cutoffDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },

  getLatestMetric(userId: string): ProgressMetrics | undefined {
    const all = getAllMetrics();
    const metrics = all[userId] || [];
    return metrics.length > 0 ? metrics[metrics.length - 1] : undefined;
  },

  calculateWeightProgress(userId: string): { current: number; initial: number; difference: number; percentage: number } | null {
    const metrics = getAllMetrics()[userId] || [];
    if (metrics.length === 0) return null;
    
    const initial = metrics[0].weight;
    const current = metrics[metrics.length - 1].weight;
    const difference = current - initial;
    const percentage = Math.round(((difference) / initial) * 100 * 10) / 10;
    
    return { current, initial, difference, percentage };
  },

  calculateBMIProgress(userId: string): { current: number; initial: number; difference: number } | null {
    const metrics = getAllMetrics()[userId] || [];
    if (metrics.length === 0) return null;
    
    const initial = metrics[0].bmi;
    const current = metrics[metrics.length - 1].bmi;
    const difference = Math.round((current - initial) * 10) / 10;
    
    return { current, initial, difference };
  },

  getWeightTrendData(userId: string, days: number = 90) {
    const metrics = this.getMetrics(userId, days);
    return metrics.map(m => ({
      date: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: m.weight,
      fullDate: m.date,
    }));
  },

  getBMITrendData(userId: string, days: number = 90) {
    const metrics = this.getMetrics(userId, days);
    return metrics.map(m => ({
      date: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      bmi: m.bmi,
      fullDate: m.date,
    }));
  },

  calculateGoalProgress(userId: string, goalWeight: number): number {
    const progress = this.calculateWeightProgress(userId);
    if (!progress) return 0;
    
    const totalNeeded = Math.abs(progress.initial - goalWeight);
    const totalAchieved = Math.abs(progress.current - progress.initial);
    
    if (totalNeeded === 0) return 100;
    return Math.min(100, Math.round((totalAchieved / totalNeeded) * 100));
  },
};
