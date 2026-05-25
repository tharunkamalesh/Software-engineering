// Activity Service - Tracks daily activities and metrics

export interface DailyActivity {
  date: string;
  workoutsCompleted: string[];
  caloriesBurned: number;
  waterIntake: number; // in liters
  userId: string;
}

export interface ActivityLog {
  userId: string;
  date: string;
  activities: DailyActivity;
}

const ACTIVITY_KEY = 'fitness_activity_logs';

function getAll(): Record<string, DailyActivity[]> {
  return JSON.parse(localStorage.getItem(ACTIVITY_KEY) || '{}');
}

export const activityService = {
  addActivity(userId: string, activity: Omit<DailyActivity, 'userId'>) {
    const all = getAll();
    if (!all[userId]) all[userId] = [];
    
    const existingIdx = all[userId].findIndex(a => a.date === activity.date);
    const activityWithId = { ...activity, userId };
    
    if (existingIdx >= 0) {
      all[userId][existingIdx] = activityWithId;
    } else {
      all[userId].push(activityWithId);
    }
    
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(all));
    return activityWithId;
  },

  getActivity(userId: string, date: string): DailyActivity | undefined {
    const all = getAll();
    return (all[userId] || []).find(a => a.date === date);
  },

  getActivities(userId: string, days: number = 30): DailyActivity[] {
    const all = getAll();
    const activities = all[userId] || [];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return activities.filter(a => new Date(a.date) >= cutoffDate).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  updateWorkoutCompletion(userId: string, date: string, workoutName: string) {
    const activity = this.getActivity(userId, date);
    if (activity) {
      if (!activity.workoutsCompleted.includes(workoutName)) {
        activity.workoutsCompleted.push(workoutName);
      }
    } else {
      this.addActivity(userId, {
        date,
        workoutsCompleted: [workoutName],
        caloriesBurned: 0,
        waterIntake: 0,
      });
    }
  },

  updateCaloriesBurned(userId: string, date: string, calories: number) {
    const activity = this.getActivity(userId, date);
    if (activity) {
      activity.caloriesBurned += calories;
    } else {
      this.addActivity(userId, {
        date,
        workoutsCompleted: [],
        caloriesBurned: calories,
        waterIntake: 0,
      });
    }
  },

  updateWaterIntake(userId: string, date: string, liters: number) {
    const activity = this.getActivity(userId, date);
    if (activity) {
      activity.waterIntake += liters;
    } else {
      this.addActivity(userId, {
        date,
        workoutsCompleted: [],
        caloriesBurned: 0,
        waterIntake: liters,
      });
    }
  },

  getTotalCaloriesBurned(userId: string, date: string): number {
    const activity = this.getActivity(userId, date);
    return activity?.caloriesBurned || 0;
  },

  getWaterIntake(userId: string, date: string): number {
    const activity = this.getActivity(userId, date);
    return activity?.waterIntake || 0;
  },
};
