import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userService, UserProfile } from '@/services/userService';
import { progressService, ProgressMetrics } from '@/services/progressService';
import { workoutService } from '@/services/workoutService';
import { dietService } from '@/services/dietService';
import { historyService } from '@/services/historyService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const InputFormPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const existing = user ? userService.getProfile(user.id) : null;

  const [age, setAge] = useState(existing?.age?.toString() || '');
  const [height, setHeight] = useState(existing?.height?.toString() || '');
  const [weight, setWeight] = useState(existing?.weight?.toString() || '');
  const [goal, setGoal] = useState<string>(existing?.fitnessGoal || '');
  const [activity, setActivity] = useState<string>(existing?.activityLevel || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const profile: UserProfile = {
      userId: user.id,
      age: parseInt(age),
      height: parseFloat(height),
      weight: parseFloat(weight),
      fitnessGoal: goal as UserProfile['fitnessGoal'],
      activityLevel: activity as UserProfile['activityLevel'],
    };

    userService.saveProfile(profile);

    // Add progress entry with metrics
    const heightM = profile.height / 100;
    const bmi = Math.round((profile.weight / (heightM * heightM)) * 10) / 10;
    const today = new Date().toISOString().split('T')[0];
    
    progressService.addEntry(user.id, { date: today, weight: profile.weight, bmi });
    
    // Add detailed metric for analytics
    const metric: ProgressMetrics = {
      userId: user.id,
      date: today,
      weight: profile.weight,
      bmi,
      initialWeight: profile.weight,
      initialBMI: bmi,
      goalWeight: profile.weight - 5,
    };
    progressService.addMetric(user.id, metric);

    // Generate workout plan
    const workoutPlan = workoutService.saveUserPlan(user.id, goal);
    historyService.savePlanToHistory(user.id, 'workout', workoutPlan.plan.name, goal, workoutPlan.plan);

    // Generate diet plan
    const dietPlan = dietService.saveUserDietPlan(user.id, goal);
    historyService.savePlanToHistory(user.id, 'diet', dietPlan.plan.name, goal, dietPlan.plan);

    toast({ title: 'Profile saved!', description: 'Generating your personalized workout and diet plans...' });
    navigate('/recommendations');
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-2xl font-display">Your Fitness Profile</CardTitle>
              <CardDescription>Enter your details to get a personalized AI-powered fitness recommendation.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input id="age" type="number" min="10" max="100" value={age} onChange={e => setAge(e.target.value)} placeholder="25" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input id="height" type="number" min="100" max="250" step="0.1" value={height} onChange={e => setHeight(e.target.value)} placeholder="175" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input id="weight" type="number" min="30" max="300" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} placeholder="70" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Fitness Goal</Label>
                    <Select value={goal} onValueChange={setGoal} required>
                      <SelectTrigger><SelectValue placeholder="Select goal" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weight_loss">Weight Loss</SelectItem>
                        <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="endurance">Endurance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Activity Level</Label>
                  <Select value={activity} onValueChange={setActivity} required>
                    <SelectTrigger><SelectValue placeholder="Select activity level" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentary (desk job)</SelectItem>
                      <SelectItem value="light">Lightly Active (1-3 days/week)</SelectItem>
                      <SelectItem value="moderate">Moderately Active (3-5 days/week)</SelectItem>
                      <SelectItem value="active">Active (6-7 days/week)</SelectItem>
                      <SelectItem value="very_active">Very Active (athlete)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full fitness-gradient text-primary-foreground font-semibold hover:opacity-90 transition-opacity" disabled={!goal || !activity}>
                  Generate My Plan
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default InputFormPage;
