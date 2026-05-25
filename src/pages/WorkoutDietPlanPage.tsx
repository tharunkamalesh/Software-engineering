import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';
import { workoutService } from '@/services/workoutService';
import { dietService } from '@/services/dietService';
import { historyService } from '@/services/historyService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Dumbbell, Utensils, RefreshCw, History, Edit2, Trash2, 
  ChevronDown, ChevronUp, Zap, Flame, Clock
} from 'lucide-react';
import { toast } from 'sonner';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const WorkoutDietPlanPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(user ? userService.getProfile(user.id) : null);
  const [activeWorkoutPlan, setActiveWorkoutPlan] = useState(user ? workoutService.getUserActivePlan(user.id) : null);
  const [activeDietPlan, setActiveDietPlan] = useState(user ? dietService.getUserActiveDietPlan(user.id) : null);
  const [workoutHistory, setWorkoutHistory] = useState(user ? workoutService.getUserPlans(user.id) : []);
  const [dietHistory, setDietHistory] = useState(user ? dietService.getUserDietPlans(user.id) : []);
  const [expandedDay, setExpandedDay] = useState<number | null>(0);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [editingExercise, setEditingExercise] = useState<{ dayIdx: number; exIdx: number } | null>(null);
  const [editingMeal, setEditingMeal] = useState<{ day: string; mealIdx: number } | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleRegenerateWorkoutPlan = () => {
    if (!user || !profile) return;
    
    const newPlan = workoutService.saveUserPlan(user.id, profile.fitnessGoal);
    historyService.savePlanToHistory(user.id, 'workout', newPlan.plan.name, profile.fitnessGoal, newPlan.plan);
    
    setActiveWorkoutPlan(newPlan);
    setWorkoutHistory(workoutService.getUserPlans(user.id));
    toast.success('Workout plan regenerated!');
  };

  const handleRegenerateDietPlan = () => {
    if (!user || !profile) return;
    
    const newPlan = dietService.saveUserDietPlan(user.id, profile.fitnessGoal);
    historyService.savePlanToHistory(user.id, 'diet', newPlan.plan.name, profile.fitnessGoal, newPlan.plan);
    
    setActiveDietPlan(newPlan);
    setDietHistory(dietService.getUserDietPlans(user.id));
    toast.success('Diet plan regenerated!');
  };

  const goalLabels: Record<string, string> = {
    weight_loss: 'Weight Loss',
    muscle_gain: 'Muscle Gain',
    maintenance: 'Maintenance',
    endurance: 'Endurance',
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="fitness-gradient p-2 rounded-lg">
              <Dumbbell className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-display font-bold text-foreground">Workout & Diet Plans</h1>
          </div>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>← Dashboard</Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
          
          {/* Tabs */}
          <Tabs defaultValue="workouts" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="workouts" className="gap-2">
                <Dumbbell className="h-4 w-4" /> Workout Plans
              </TabsTrigger>
              <TabsTrigger value="diet" className="gap-2">
                <Utensils className="h-4 w-4" /> Diet Plans
              </TabsTrigger>
            </TabsList>

            {/* WORKOUT SECTION */}
            <TabsContent value="workouts" className="space-y-6">
              {activeWorkoutPlan && (
                <>
                  {/* Current Plan Header */}
                  <motion.div variants={item}>
                    <Card className="glass-card overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-2xl">{activeWorkoutPlan.plan.name}</CardTitle>
                            <CardDescription className="mt-2">{activeWorkoutPlan.plan.description}</CardDescription>
                          </div>
                          <Badge className="fitness-gradient border-none">{goalLabels[profile?.fitnessGoal || '']}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2 flex-wrap">
                          <Button onClick={handleRegenerateWorkoutPlan} variant="outline" size="sm" className="gap-2">
                            <RefreshCw className="h-4 w-4" /> Regenerate Plan
                          </Button>
                          <Button variant="outline" size="sm" className="gap-2">
                            <History className="h-4 w-4" /> View History ({workoutHistory.length})
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Weekly Workout Schedule */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeWorkoutPlan.plan.days.map((day, dayIdx) => (
                      <motion.div key={dayIdx} variants={item}>
                        <Card className={`glass-card cursor-pointer hover:border-primary/50 transition-all ${expandedDay === dayIdx ? 'ring-1 ring-primary' : ''}`}>
                          <CardHeader 
                            className="pb-3 cursor-pointer"
                            onClick={() => setExpandedDay(expandedDay === dayIdx ? null : dayIdx)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg">{day.day}</CardTitle>
                                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                                  <Zap className="h-3 w-3" /> {day.focus}
                                </p>
                              </div>
                              {expandedDay === dayIdx ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                            </div>
                          </CardHeader>
                          
                          {expandedDay === dayIdx && (
                            <CardContent className="space-y-3 pt-0">
                              {day.exercises.length === 0 ? (
                                <p className="text-muted-foreground text-sm italic">Rest day - Recovery is essential!</p>
                              ) : (
                                day.exercises.map((ex, exIdx) => (
                                  <div key={exIdx} className="p-3 bg-background/50 rounded-lg border border-border/50 hover:border-primary/30 transition-all group">
                                    <div className="flex justify-between items-start mb-2">
                                      <div className="flex-1">
                                        <p className="font-semibold text-sm">{ex.name}</p>
                                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                                          <span className="flex items-center gap-1">
                                            <Flame className="h-3 w-3" /> {ex.sets} sets
                                          </span>
                                          <span>×{ex.reps} reps</span>
                                          <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" /> Rest {ex.rest}
                                          </span>
                                        </div>
                                      </div>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => setEditingExercise({ dayIdx, exIdx })}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <Edit2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))
                              )}
                            </CardContent>
                          )}
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </TabsContent>

            {/* DIET SECTION */}
            <TabsContent value="diet" className="space-y-6">
              {activeDietPlan && (
                <>
                  {/* Current Plan Header */}
                  <motion.div variants={item}>
                    <Card className="glass-card overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-2xl">{activeDietPlan.plan.name}</CardTitle>
                            <CardDescription className="mt-2">{activeDietPlan.plan.description}</CardDescription>
                          </div>
                          <Badge className="fitness-gradient border-none">{goalLabels[profile?.fitnessGoal || '']}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2 flex-wrap mb-4">
                          <Button onClick={handleRegenerateDietPlan} variant="outline" size="sm" className="gap-2">
                            <RefreshCw className="h-4 w-4" /> Regenerate Plan
                          </Button>
                          <Button variant="outline" size="sm" className="gap-2">
                            <History className="h-4 w-4" /> View History ({dietHistory.length})
                          </Button>
                        </div>
                        <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
                          <p className="text-sm text-muted-foreground">{activeDietPlan.plan.tips[0]}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Day Selection */}
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle>Select Day</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                          <Button
                            key={day}
                            variant={selectedDay === day ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedDay(day)}
                            className="text-xs"
                          >
                            {day.slice(0, 3)}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Daily Meal Plan */}
                  {activeDietPlan.weeklyPlan[selectedDay] && (
                    <motion.div variants={item}>
                      <Card className="glass-card">
                        <CardHeader>
                          <CardTitle>{selectedDay}'s Meal Plan</CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <Flame className="h-4 w-4 text-orange-500" />
                            <span className="text-sm font-semibold">
                              Total: {dietService.getTotalDailyCalories(user?.id || '', selectedDay)} kcal
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {activeDietPlan.weeklyPlan[selectedDay].meals.map((meal, mealIdx) => (
                            <div key={mealIdx} className="p-4 bg-background/50 rounded-lg border border-border/50 hover:border-primary/30 transition-all group">
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                  <h4 className="font-semibold flex items-center gap-2">
                                    {meal.name}
                                    <Badge variant="secondary" className="text-xs">
                                      <Flame className="h-3 w-3 mr-1" /> {meal.calories} kcal
                                    </Badge>
                                  </h4>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setEditingMeal({ day: selectedDay, mealIdx })}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <ul className="space-y-2">
                                {meal.items.map((item, idx) => (
                                  <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {/* Nutrition Tips */}
                  <motion.div variants={item}>
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="text-lg">Nutrition Tips</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {activeDietPlan.plan.tips.map((tip, idx) => (
                            <li key={idx} className="flex gap-2 text-sm">
                              <span className="text-primary font-bold">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default WorkoutDietPlanPage;
