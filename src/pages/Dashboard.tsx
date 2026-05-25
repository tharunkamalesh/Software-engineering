import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';
import { recommendationService } from '@/services/recommendationService';
import { progressService } from '@/services/progressService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Activity, Flame, Dumbbell, Target, LogOut,
  ClipboardList, TrendingUp, User, Utensils,
  CheckCircle2, AlertCircle, RefreshCw, Plus
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [newWeight, setNewWeight] = useState('');
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [status, setStatus] = useState(recommendationService.getStatus());
  const [profile, setProfile] = useState(user ? userService.getProfile(user.id) : null);
  const [progressData, setProgressData] = useState(user ? progressService.getEntries(user.id) : []);

  const rec = profile ? recommendationService.generate(profile) : null;

  const handleUpdateWeight = () => {
    if (!user || !newWeight) return;
    const weight = parseFloat(newWeight);
    if (isNaN(weight)) return;

    const updatedProfile = userService.updateWeight(user.id, weight);
    if (updatedProfile) {
      setProfile({ ...updatedProfile });
      const bmi = Math.round((weight / Math.pow(updatedProfile.height / 100, 2)) * 10) / 10;
      progressService.addEntry(user.id, {
        date: new Date().toLocaleDateString(),
        weight,
        bmi
      });
      setProgressData(progressService.getEntries(user.id));
      toast.success('Weight updated and plan regenerated!');
      setIsUpdateOpen(false);
      setNewWeight('');
    }
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
            <h1 className="text-xl font-display font-bold text-foreground">FitAI</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              <Badge variant="outline" className="flex gap-1 items-center px-2 py-0.5">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Systems Nominal</span>
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden sm:inline">Hey, {user?.name}!</span>
              <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground">
                <LogOut className="h-4 w-4 mr-1" /> Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">

          {/* Quick Navigation */}
          <motion.div variants={item}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button 
                variant="outline" 
                className="gap-2 h-20 flex-col justify-center"
                onClick={() => navigate('/dashboard')}
              >
                <Activity className="h-5 w-5" />
                <span className="text-xs">Dashboard</span>
              </Button>
              <Button 
                variant="outline" 
                className="gap-2 h-20 flex-col justify-center"
                onClick={() => navigate('/plans')}
              >
                <Dumbbell className="h-5 w-5" />
                <span className="text-xs">Plans</span>
              </Button>
              <Button 
                variant="outline" 
                className="gap-2 h-20 flex-col justify-center"
                onClick={() => navigate('/progress')}
              >
                <TrendingUp className="h-5 w-5" />
                <span className="text-xs">Progress</span>
              </Button>
              <Button 
                variant="outline" 
                className="gap-2 h-20 flex-col justify-center"
                onClick={() => navigate('/recommendations')}
              >
                <Target className="h-5 w-5" />
                <span className="text-xs">AI Insights</span>
              </Button>
            </div>
          </motion.div>

          {/* Top Section: Profile Summary & Microservices Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div variants={item} className="lg:col-span-2">
              <Card className="glass-card overflow-hidden">
                <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent w-full absolute top-0 pointer-events-none" />
                <CardContent className="p-6 pt-12 relative">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <User className="h-10 w-10 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-display font-bold text-foreground">{user?.name}</h2>
                        <p className="text-muted-foreground">{user?.email}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {profile && (
                            <>
                              <Badge variant="secondary">{profile.age} years</Badge>
                              <Badge variant="secondary">{profile.height} cm</Badge>
                              <Badge variant="secondary">{profile.weight} kg</Badge>
                              <Badge className="fitness-gradient border-none">{goalLabels[profile.fitnessGoal]}</Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Plus className="h-4 w-4" /> Update Weight
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Your Weight</DialogTitle>
                            <p className="text-sm text-muted-foreground">This will recalculate your BMI and update your fitness plan automatically.</p>
                          </DialogHeader>
                          <div className="py-4">
                            <label className="text-sm font-medium mb-2 block">New Weight (kg)</label>
                            <Input
                              type="number"
                              placeholder="e.g. 75.5"
                              value={newWeight}
                              onChange={(e) => setNewWeight(e.target.value)}
                            />
                          </div>
                          <DialogFooter>
                            <Button onClick={handleUpdateWeight}>Save Changes</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button size="sm" className="fitness-gradient gap-2 px-6" onClick={() => navigate('/recommendations')}>
                        <RefreshCw className="h-4 w-4" /> Regenerate Plan
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="glass-card h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">System Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  {Object.entries(status).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between text-sm py-1 border-b border-border/50 last:border-0 uppercase font-medium">
                      <span className="text-muted-foreground">{key} Service</span>
                      <span className="flex items-center gap-1 text-green-500">
                        <CheckCircle2 className="h-3.5 w-3.5" /> {val}
                      </span>
                    </div>
                  ))}
                  <div className="pt-2">
                    <div className="bg-primary/5 rounded-lg p-2 text-[10px] text-muted-foreground flex gap-2">
                      <Activity className="h-3 w-3 mt-0.5 shrink-0" />
                      <span>API Gateway routing requests to specialized microservices for real-time AI processing.</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* AI Recommendation Summary */}
          {rec && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Activity, label: 'BMI Score', value: rec.bmi.toString(), sub: rec.bmiCategory, color: 'text-blue-500' },
                { icon: Flame, label: 'Target Calories', value: rec.dailyCalories.toLocaleString(), sub: 'kcal/day', color: 'text-orange-500' },
                { icon: Dumbbell, label: 'Workout Plan', value: rec.workoutFrequency, sub: rec.intensity, color: 'text-primary' },
                { icon: Target, label: 'Fitness Goal', value: goalLabels[rec.fitnessGoal] || rec.fitnessGoal, sub: 'Daily Priority', color: 'text-purple-500' },
              ].map((stat, i) => (
                <motion.div key={i} variants={item}>
                  <Card className="glass-card group hover:border-primary/30 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-2 rounded-xl bg-background/50 border border-border group-hover:scale-110 transition-transform`}>
                          <stat.icon className={`h-5 w-5 ${stat.color}`} />
                        </div>
                        <Badge variant="outline" className="text-[10px] font-bold">LIVE</Badge>
                      </div>
                      <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
                      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-tight">{stat.label}</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">{stat.sub}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Recommendation Reasoning */}
          {rec && (
            <motion.div variants={item}>
              <Card className="glass-card overflow-hidden border-primary/20">
                <CardHeader className="bg-primary/5 pb-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-primary" />
                    <CardTitle className="font-display">Why this plan is recommended</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-foreground/90 leading-relaxed italic">
                    "{rec.reasoning}"
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Progress Chart */}
            <motion.div variants={item}>
              <Card className="glass-card h-full">
                <CardHeader>
                  <CardTitle className="font-display flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /> Progress Analytics</span>
                    <Button variant="outline" size="sm" onClick={() => navigate('/progress')}>View Full Dashboard →</Button>
                  </CardTitle>
                  <CardDescription>Visual tracker for weight and BMI trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full mt-4">
                    {progressData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={progressData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                          <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                          <Tooltip
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                          />
                          <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: 'hsl(var(--primary))' }} name="Weight (kg)" />
                          <Line type="monotone" dataKey="bmi" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} name="BMI" />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl">
                        <TrendingUp className="h-10 w-10 mb-2 opacity-20" />
                        <p>No records found yet.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Progress Table */}
            <motion.div variants={item}>
              <Card className="glass-card h-full">
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-primary" /> Fitness Log
                  </CardTitle>
                  <CardDescription>Date-wise record of your body metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  {progressData.length > 0 ? (
                    <div className="rounded-md border border-border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Weight (kg)</TableHead>
                            <TableHead className="text-right">BMI</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {progressData.slice().reverse().slice(0, 5).map((entry, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="font-medium">{entry.date}</TableCell>
                              <TableCell>{entry.weight}</TableCell>
                              <TableCell className="text-right">
                                <Badge variant="secondary">{entry.bmi}</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      Add your first weight update to start tracking progress.
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div variants={item}>
              <Card className="glass-card h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5 text-primary" /> Active Workout Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="space-y-4">
                    {rec?.workoutPlan.days.map((day, i) => (
                      <div key={i} className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-sm">{day.day}</span>
                          <Badge variant="outline" className="text-[10px]">{day.focus}</Badge>
                        </div>
                        <ul className="text-xs space-y-1">
                          {day.exercises.map((ex, j) => (
                            <li key={j} className="flex items-center gap-2">
                              <div className="h-1 w-1 rounded-full bg-primary" /> {ex.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <div className="p-4 pt-0">
                  <Button variant="link" className="text-primary p-0 h-auto text-sm" onClick={() => navigate('/plans')}>
                    View all plans & exercises →
                  </Button>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="glass-card h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Utensils className="h-5 w-5 text-orange-500" /> Personalized Diet Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="space-y-4">
                    {rec?.dietPlan.sampleDay.meals.map((meal, i) => (
                      <div key={i} className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/10">
                        <span className="font-bold text-sm block mb-1 text-orange-600">{meal.name}</span>
                        <ul className="text-xs space-y-1">
                          {meal.items.map((it, j) => (
                            <li key={j} className="flex items-center gap-2">
                              <div className="h-1 w-1 rounded-full bg-orange-500" /> {it}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <div className="p-4 pt-0">
                  <Button variant="link" className="text-orange-500 p-0 h-auto text-sm" onClick={() => navigate('/plans')}>
                    View all meals & nutrients →
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>

          {!profile && (
            <motion.div variants={item}>
              <Card className="glass-card border-dashed">
                <CardContent className="p-12 text-center">
                  <Dumbbell className="h-16 w-16 mx-auto mb-6 text-primary animate-bounce" />
                  <h3 className="text-2xl font-display font-bold text-foreground mb-4">Complete Your Profile</h3>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">Our AI Recommendation Service needs your health data to generate perfectly optimized workout and diet plans.</p>
                  <Button onClick={() => navigate('/input')} size="lg" className="fitness-gradient text-primary-foreground font-bold px-12 rounded-full hover:scale-105 transition-transform">
                    Initialize Profile Service
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
