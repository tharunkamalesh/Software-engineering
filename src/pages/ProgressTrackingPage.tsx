import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';
import { progressService, ProgressMetrics } from '@/services/progressService';
import { activityService, DailyActivity } from '@/services/activityService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter
} from 'recharts';
import {
  TrendingUp, TrendingDown, Activity, Flame, Droplet, Target,
  Plus, Calendar, Check, X
} from 'lucide-react';
import { toast } from 'sonner';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const ProgressTrackingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(user ? userService.getProfile(user.id) : null);
  const [metrics, setMetrics] = useState<ProgressMetrics[]>(user ? progressService.getMetrics(user.id, 90) : []);
  const [activities, setActivities] = useState<DailyActivity[]>(user ? activityService.getActivities(user.id, 30) : []);
  const [weightProgress, setWeightProgress] = useState(user ? progressService.calculateWeightProgress(user.id) : null);
  const [bmiProgress, setBMIProgress] = useState(user ? progressService.calculateBMIProgress(user.id) : null);
  const [goalProgress, setGoalProgress] = useState(0);
  
  // Dialog states
  const [isAddMetricOpen, setIsAddMetricOpen] = useState(false);
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [newActivityDate, setNewActivityDate] = useState(new Date().toISOString().split('T')[0]);
  const [newWorkoutName, setNewWorkoutName] = useState('');
  const [newCaloriesBurned, setNewCaloriesBurned] = useState('');
  const [newWaterIntake, setNewWaterIntake] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
    if (profile?.weight) {
      setGoalProgress(progressService.calculateGoalProgress(user?.id || '', profile.weight - 5));
    }
  }, [user, profile, navigate]);

  const handleAddMetric = () => {
    if (!user || !newWeight || !profile) return;
    const weight = parseFloat(newWeight);
    if (isNaN(weight)) {
      toast.error('Invalid weight value');
      return;
    }

    const heightM = profile.height / 100;
    const bmi = Math.round((weight / (heightM * heightM)) * 10) / 10;
    const today = new Date().toISOString().split('T')[0];

    const metric: ProgressMetrics = {
      userId: user.id,
      date: today,
      weight,
      bmi,
      initialWeight: metrics.length === 0 ? weight : metrics[0].weight,
      initialBMI: metrics.length === 0 ? bmi : metrics[0].bmi,
    };

    progressService.addMetric(user.id, metric);
    setMetrics(progressService.getMetrics(user.id, 90));
    setWeightProgress(progressService.calculateWeightProgress(user.id));
    setBMIProgress(progressService.calculateBMIProgress(user.id));

    toast.success('Weight metric added!');
    setIsAddMetricOpen(false);
    setNewWeight('');
  };

  const handleAddActivity = () => {
    if (!user) return;

    const activity: DailyActivity = {
      userId: user.id,
      date: newActivityDate,
      workoutsCompleted: newWorkoutName ? [newWorkoutName] : [],
      caloriesBurned: newCaloriesBurned ? parseFloat(newCaloriesBurned) : 0,
      waterIntake: newWaterIntake ? parseFloat(newWaterIntake) : 0,
    };

    activityService.addActivity(user.id, activity);
    setActivities(activityService.getActivities(user.id, 30));

    toast.success('Activity logged!');
    setIsAddActivityOpen(false);
    setNewWorkoutName('');
    setNewCaloriesBurned('');
    setNewWaterIntake('');
  };

  const weightTrendData = user ? progressService.getWeightTrendData(user.id, 90) : [];
  const bmiTrendData = user ? progressService.getBMITrendData(user.id, 90) : [];

  const goalLabels: Record<string, string> = {
    weight_loss: 'Weight Loss',
    muscle_gain: 'Muscle Gain',
    maintenance: 'Maintenance',
    endurance: 'Endurance',
  };

  const StatCard = ({ icon: Icon, label, value, change, color }: { icon: typeof TrendingUp; label: string; value: string | number; change?: number; color: string }) => (
    <motion.div variants={item}>
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
              <p className="text-3xl font-bold mt-2">{value}</p>
              {change !== undefined && (
                <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${change >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {Math.abs(change).toFixed(1)} {change >= 0 ? '↑' : '↓'}
                </div>
              )}
            </div>
            <div className={`p-3 rounded-lg ${color}`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="fitness-gradient p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-display font-bold text-foreground">Progress & Analytics</h1>
          </div>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>← Dashboard</Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
          
          {/* Key Metrics */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Progress Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard 
                icon={TrendingUp} 
                label="Current Weight" 
                value={`${weightProgress?.current.toFixed(1) || 0} kg`}
                change={weightProgress?.difference}
                color="bg-blue-500"
              />
              <StatCard 
                icon={Activity} 
                label="BMI Score" 
                value={bmiProgress?.current.toFixed(1) || 0}
                change={bmiProgress?.difference}
                color="bg-primary"
              />
              <StatCard 
                icon={Target} 
                label="Goal Progress" 
                value={`${goalProgress}%`}
                color="bg-green-500"
              />
              <StatCard 
                icon={Calendar} 
                label="Total Logs" 
                value={metrics.length}
                color="bg-purple-500"
              />
            </div>
          </div>

          {/* Charts */}
          <Tabs defaultValue="weight" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="weight">Weight Trend</TabsTrigger>
              <TabsTrigger value="bmi">BMI Trend</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>

            {/* Weight Trend Chart */}
            <TabsContent value="weight">
              <motion.div variants={item}>
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Weight Trend (90 Days)</CardTitle>
                    <CardDescription>Track your weight changes over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {weightTrendData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={weightTrendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,100,100,0.1)" />
                          <XAxis dataKey="date" stroke="rgba(150,150,150,0.5)" style={{ fontSize: '12px' }} />
                          <YAxis stroke="rgba(150,150,150,0.5)" style={{ fontSize: '12px' }} />
                          <Tooltip contentStyle={{ backgroundColor: 'rgba(20,20,30,0.95)', border: '1px solid rgba(100,150,200,0.3)' }} />
                          <Legend />
                          <Line type="monotone" dataKey="weight" stroke="#3b82f6" dot={{ fill: '#3b82f6' }} name="Weight (kg)" />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-80 flex items-center justify-center text-muted-foreground">
                        <p>No weight data yet. Add your first weight entry.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* BMI Trend Chart */}
            <TabsContent value="bmi">
              <motion.div variants={item}>
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>BMI Trend (90 Days)</CardTitle>
                    <CardDescription>Monitor your BMI progression</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {bmiTrendData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={bmiTrendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,100,100,0.1)" />
                          <XAxis dataKey="date" stroke="rgba(150,150,150,0.5)" style={{ fontSize: '12px' }} />
                          <YAxis stroke="rgba(150,150,150,0.5)" style={{ fontSize: '12px' }} />
                          <Tooltip contentStyle={{ backgroundColor: 'rgba(20,20,30,0.95)', border: '1px solid rgba(100,150,200,0.3)' }} />
                          <Legend />
                          <Line type="monotone" dataKey="bmi" stroke="#ec4899" dot={{ fill: '#ec4899' }} name="BMI" />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-80 flex items-center justify-center text-muted-foreground">
                        <p>No BMI data yet. Add your first weight entry.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Activity Chart */}
            <TabsContent value="activity">
              <motion.div variants={item}>
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Daily Activity Summary</CardTitle>
                    <CardDescription>Calories burned over the last 30 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {activities.length > 0 ? (
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={activities.slice(-20).map(a => ({
                          date: new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                          calories: a.caloriesBurned,
                          workouts: a.workoutsCompleted.length,
                          water: a.waterIntake,
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,100,100,0.1)" />
                          <XAxis dataKey="date" stroke="rgba(150,150,150,0.5)" style={{ fontSize: '12px' }} />
                          <YAxis stroke="rgba(150,150,150,0.5)" style={{ fontSize: '12px' }} />
                          <Tooltip contentStyle={{ backgroundColor: 'rgba(20,20,30,0.95)', border: '1px solid rgba(100,150,200,0.3)' }} />
                          <Legend />
                          <Bar dataKey="calories" fill="#f59e0b" name="Calories Burned" />
                          <Bar dataKey="workouts" fill="#10b981" name="Workouts" />
                          <Bar dataKey="water" fill="#06b6d4" name="Water (L)" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-80 flex items-center justify-center text-muted-foreground">
                        <p>No activity data yet. Start logging your activities.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Fitness Logs Table */}
            <TabsContent value="logs">
              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Fitness Logs</CardTitle>
                    <CardDescription>All recorded metrics and activities</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Dialog open={isAddMetricOpen} onOpenChange={setIsAddMetricOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="gap-2">
                          <Plus className="h-4 w-4" /> Add Weight
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Log Weight</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <Label>Weight (kg)</Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={newWeight}
                              onChange={(e) => setNewWeight(e.target.value)}
                              placeholder="e.g. 75.5"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleAddMetric}>Save</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={isAddActivityOpen} onOpenChange={setIsAddActivityOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="gap-2" variant="outline">
                          <Plus className="h-4 w-4" /> Log Activity
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Log Activity</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <Label>Date</Label>
                            <Input
                              type="date"
                              value={newActivityDate}
                              onChange={(e) => setNewActivityDate(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Workout Name (optional)</Label>
                            <Input
                              placeholder="e.g. Morning Run"
                              value={newWorkoutName}
                              onChange={(e) => setNewWorkoutName(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Calories Burned</Label>
                            <Input
                              type="number"
                              value={newCaloriesBurned}
                              onChange={(e) => setNewCaloriesBurned(e.target.value)}
                              placeholder="e.g. 500"
                            />
                          </div>
                          <div>
                            <Label>Water Intake (liters)</Label>
                            <Input
                              type="number"
                              step="0.5"
                              value={newWaterIntake}
                              onChange={(e) => setNewWaterIntake(e.target.value)}
                              placeholder="e.g. 2.5"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleAddActivity}>Save</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="weight-logs" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="weight-logs">Weight Logs</TabsTrigger>
                      <TabsTrigger value="activity-logs">Activity Logs</TabsTrigger>
                    </TabsList>

                    <TabsContent value="weight-logs">
                      <div className="border rounded-lg overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Weight (kg)</TableHead>
                              <TableHead>BMI</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {metrics.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                  No weight logs yet. Start tracking your progress!
                                </TableCell>
                              </TableRow>
                            ) : (
                              metrics.map((metric, idx) => {
                                const prevMetric = idx > 0 ? metrics[idx - 1] : null;
                                const weightChange = prevMetric ? metric.weight - prevMetric.weight : 0;
                                return (
                                  <TableRow key={idx}>
                                    <TableCell className="font-medium">
                                      {new Date(metric.date).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>{metric.weight.toFixed(1)}</TableCell>
                                    <TableCell>{metric.bmi.toFixed(1)}</TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        {weightChange === 0 && <Badge variant="outline">→</Badge>}
                                        {weightChange < 0 && <Badge className="bg-green-500">↓ {Math.abs(weightChange).toFixed(1)}</Badge>}
                                        {weightChange > 0 && <Badge variant="destructive">↑ {weightChange.toFixed(1)}</Badge>}
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                );
                              })
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </TabsContent>

                    <TabsContent value="activity-logs">
                      <div className="border rounded-lg overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Workouts</TableHead>
                              <TableHead>Calories</TableHead>
                              <TableHead>Water (L)</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {activities.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                  No activity logs yet. Start logging your activities!
                                </TableCell>
                              </TableRow>
                            ) : (
                              activities.map((activity, idx) => (
                                <TableRow key={idx}>
                                  <TableCell className="font-medium">
                                    {new Date(activity.date).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell>
                                    {activity.workoutsCompleted.length > 0 ? (
                                      <div className="flex flex-wrap gap-1">
                                        {activity.workoutsCompleted.map((w, i) => (
                                          <Badge key={i} variant="outline" className="text-xs">{w}</Badge>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-muted-foreground">-</span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1">
                                      <Flame className="h-4 w-4 text-orange-500" />
                                      {activity.caloriesBurned}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1">
                                      <Droplet className="h-4 w-4 text-blue-500" />
                                      {activity.waterIntake}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default ProgressTrackingPage;
