// Workout Service - Stores and returns workout plans

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
}

export interface WorkoutDay {
  day: string;
  focus: string;
  exercises: Exercise[];
}

export interface WorkoutPlan {
  name: string;
  description: string;
  days: WorkoutDay[];
}

const workoutPlans: Record<string, WorkoutPlan> = {
  weight_loss: {
    name: 'Fat Burn Program',
    description: 'High-intensity mix of cardio and resistance training to maximize calorie burn.',
    days: [
      { day: 'Monday', focus: 'Full Body HIIT', exercises: [
        { name: 'Burpees', sets: 4, reps: '12', rest: '30s' },
        { name: 'Mountain Climbers', sets: 4, reps: '20', rest: '30s' },
        { name: 'Kettlebell Swings', sets: 4, reps: '15', rest: '30s' },
        { name: 'Jump Squats', sets: 3, reps: '15', rest: '45s' },
      ]},
      { day: 'Tuesday', focus: 'Cardio & Core', exercises: [
        { name: 'Running/Cycling', sets: 1, reps: '30 min', rest: '-' },
        { name: 'Plank Hold', sets: 3, reps: '60s', rest: '30s' },
        { name: 'Russian Twists', sets: 3, reps: '20', rest: '30s' },
        { name: 'Bicycle Crunches', sets: 3, reps: '20', rest: '30s' },
      ]},
      { day: 'Wednesday', focus: 'Rest / Light Walk', exercises: [] },
      { day: 'Thursday', focus: 'Upper Body Circuit', exercises: [
        { name: 'Push-ups', sets: 4, reps: '15', rest: '30s' },
        { name: 'Dumbbell Rows', sets: 4, reps: '12', rest: '30s' },
        { name: 'Shoulder Press', sets: 3, reps: '12', rest: '45s' },
        { name: 'Tricep Dips', sets: 3, reps: '15', rest: '30s' },
      ]},
      { day: 'Friday', focus: 'Lower Body + Cardio', exercises: [
        { name: 'Lunges', sets: 4, reps: '12 each', rest: '30s' },
        { name: 'Goblet Squats', sets: 4, reps: '15', rest: '30s' },
        { name: 'Box Jumps', sets: 3, reps: '10', rest: '45s' },
        { name: 'Stair Sprints', sets: 1, reps: '15 min', rest: '-' },
      ]},
      { day: 'Saturday', focus: 'Active Recovery', exercises: [
        { name: 'Yoga / Stretching', sets: 1, reps: '30 min', rest: '-' },
      ]},
    ],
  },
  muscle_gain: {
    name: 'Hypertrophy Program',
    description: 'Progressive overload focused on compound and isolation movements for muscle growth.',
    days: [
      { day: 'Monday', focus: 'Chest & Triceps', exercises: [
        { name: 'Bench Press', sets: 4, reps: '8-10', rest: '90s' },
        { name: 'Incline Dumbbell Press', sets: 4, reps: '10', rest: '75s' },
        { name: 'Cable Flyes', sets: 3, reps: '12', rest: '60s' },
        { name: 'Tricep Pushdowns', sets: 3, reps: '12', rest: '60s' },
      ]},
      { day: 'Tuesday', focus: 'Back & Biceps', exercises: [
        { name: 'Deadlifts', sets: 4, reps: '6-8', rest: '120s' },
        { name: 'Pull-ups', sets: 4, reps: '8-10', rest: '90s' },
        { name: 'Barbell Rows', sets: 4, reps: '10', rest: '75s' },
        { name: 'Barbell Curls', sets: 3, reps: '12', rest: '60s' },
      ]},
      { day: 'Wednesday', focus: 'Rest', exercises: [] },
      { day: 'Thursday', focus: 'Shoulders & Arms', exercises: [
        { name: 'Overhead Press', sets: 4, reps: '8-10', rest: '90s' },
        { name: 'Lateral Raises', sets: 4, reps: '12', rest: '60s' },
        { name: 'Hammer Curls', sets: 3, reps: '12', rest: '60s' },
        { name: 'Skull Crushers', sets: 3, reps: '12', rest: '60s' },
      ]},
      { day: 'Friday', focus: 'Legs', exercises: [
        { name: 'Barbell Squats', sets: 5, reps: '6-8', rest: '120s' },
        { name: 'Leg Press', sets: 4, reps: '10', rest: '90s' },
        { name: 'Romanian Deadlifts', sets: 4, reps: '10', rest: '75s' },
        { name: 'Calf Raises', sets: 4, reps: '15', rest: '60s' },
      ]},
    ],
  },
  maintenance: {
    name: 'Balanced Fitness Program',
    description: 'Well-rounded routine to maintain current fitness and overall health.',
    days: [
      { day: 'Monday', focus: 'Full Body Strength', exercises: [
        { name: 'Squats', sets: 3, reps: '10', rest: '60s' },
        { name: 'Push-ups', sets: 3, reps: '15', rest: '45s' },
        { name: 'Dumbbell Rows', sets: 3, reps: '12', rest: '45s' },
        { name: 'Plank', sets: 3, reps: '45s', rest: '30s' },
      ]},
      { day: 'Wednesday', focus: 'Cardio', exercises: [
        { name: 'Jogging/Cycling', sets: 1, reps: '30 min', rest: '-' },
        { name: 'Jump Rope', sets: 3, reps: '3 min', rest: '60s' },
      ]},
      { day: 'Friday', focus: 'Full Body Strength', exercises: [
        { name: 'Deadlifts', sets: 3, reps: '8', rest: '75s' },
        { name: 'Overhead Press', sets: 3, reps: '10', rest: '60s' },
        { name: 'Lunges', sets: 3, reps: '12 each', rest: '45s' },
        { name: 'Russian Twists', sets: 3, reps: '20', rest: '30s' },
      ]},
    ],
  },
  endurance: {
    name: 'Endurance Builder',
    description: 'Focused on cardiovascular conditioning and stamina improvement.',
    days: [
      { day: 'Monday', focus: 'Long Cardio', exercises: [
        { name: 'Running', sets: 1, reps: '45 min', rest: '-' },
        { name: 'Stretching', sets: 1, reps: '10 min', rest: '-' },
      ]},
      { day: 'Tuesday', focus: 'Interval Training', exercises: [
        { name: 'Sprint Intervals', sets: 8, reps: '30s sprint / 60s walk', rest: '-' },
        { name: 'Rowing', sets: 1, reps: '15 min', rest: '-' },
      ]},
      { day: 'Wednesday', focus: 'Active Recovery', exercises: [
        { name: 'Swimming / Walking', sets: 1, reps: '30 min', rest: '-' },
      ]},
      { day: 'Thursday', focus: 'Cross Training', exercises: [
        { name: 'Cycling', sets: 1, reps: '40 min', rest: '-' },
        { name: 'Bodyweight Circuit', sets: 3, reps: '10 each', rest: '30s' },
      ]},
      { day: 'Friday', focus: 'Tempo Run', exercises: [
        { name: 'Tempo Run', sets: 1, reps: '35 min', rest: '-' },
        { name: 'Core Work', sets: 3, reps: '15', rest: '30s' },
      ]},
      { day: 'Saturday', focus: 'Long Slow Distance', exercises: [
        { name: 'Long Run / Ride', sets: 1, reps: '60+ min', rest: '-' },
      ]},
    ],
  },
};

export interface UserWorkoutPlan {
  userId: string;
  goal: string;
  plan: WorkoutPlan;
  savedDate: string;
  isActive: boolean;
}

const USER_PLANS_KEY = 'fitness_user_workout_plans';

function getUserPlans(): Record<string, UserWorkoutPlan[]> {
  return JSON.parse(localStorage.getItem(USER_PLANS_KEY) || '{}');
}

export const workoutService = {
  getWorkoutPlan(goal: string): WorkoutPlan {
    return workoutPlans[goal] || workoutPlans.maintenance;
  },

  saveUserPlan(userId: string, goal: string, customPlan?: WorkoutPlan) {
    const plans = getUserPlans();
    if (!plans[userId]) plans[userId] = [];
    
    const plan = customPlan || this.getWorkoutPlan(goal);
    
    // Mark previous active plan as inactive
    plans[userId].forEach(p => p.isActive = false);
    
    const userPlan: UserWorkoutPlan = {
      userId,
      goal,
      plan,
      savedDate: new Date().toISOString(),
      isActive: true,
    };
    
    plans[userId].push(userPlan);
    localStorage.setItem(USER_PLANS_KEY, JSON.stringify(plans));
    return userPlan;
  },

  getUserActivePlan(userId: string): UserWorkoutPlan | undefined {
    const plans = getUserPlans();
    return (plans[userId] || []).find(p => p.isActive);
  },

  getUserPlans(userId: string): UserWorkoutPlan[] {
    const plans = getUserPlans();
    return (plans[userId] || []).sort((a, b) => new Date(b.savedDate).getTime() - new Date(a.savedDate).getTime());
  },

  updateWorkoutDay(userId: string, dayIndex: number, newDay: WorkoutDay) {
    const plans = getUserPlans();
    const activePlan = (plans[userId] || []).find(p => p.isActive);
    
    if (activePlan) {
      activePlan.plan.days[dayIndex] = newDay;
      localStorage.setItem(USER_PLANS_KEY, JSON.stringify(plans));
      return activePlan;
    }
  },

  updateExercise(userId: string, dayIndex: number, exerciseIndex: number, newExercise: Exercise) {
    const plans = getUserPlans();
    const activePlan = (plans[userId] || []).find(p => p.isActive);
    
    if (activePlan && activePlan.plan.days[dayIndex]) {
      activePlan.plan.days[dayIndex].exercises[exerciseIndex] = newExercise;
      localStorage.setItem(USER_PLANS_KEY, JSON.stringify(plans));
      return activePlan;
    }
  },

  deleteUserPlan(userId: string, planSavedDate: string) {
    const plans = getUserPlans();
    if (plans[userId]) {
      plans[userId] = plans[userId].filter(p => p.savedDate !== planSavedDate);
      localStorage.setItem(USER_PLANS_KEY, JSON.stringify(plans));
    }
  },
};
