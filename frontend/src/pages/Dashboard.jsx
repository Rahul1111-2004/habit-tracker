import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Grid,
  Paper,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  useTheme,
} from '@mui/material';
import {
  EmojiEvents as EmojiEventsIcon,
  Timeline as TimelineIcon,
  CheckCircle as CheckCircleIcon,
  LocalFireDepartment as FireIcon,
} from '@mui/icons-material';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import CalendarView from '../components/CalendarView';
import { getMonthlyCompletionCounts, getYearlyCompletionCounts } from '../components/CalendarView';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

const Dashboard = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [stats, setStats] = useState({
    totalHabits: 0,
    completedHabits: 0,
    currentStreak: 0,
    longestStreak: 0,
  });
  const [habits, setHabits] = useState([]);
  const [achievements, setAchievements] = useState([
    {
      id: 1,
      name: 'Getting Started',
      description: 'Created your first habit',
      icon: <TimelineIcon />,
      unlocked: true,
    },
    {
      id: 2,
      name: 'Consistency King',
      description: 'Completed 7 habits in a row',
      icon: <FireIcon />,
      unlocked: stats.currentStreak >= 7,
    },
    {
      id: 3,
      name: 'Habit Master',
      description: 'Completed 50 habits',
      icon: <CheckCircleIcon />,
      unlocked: stats.completedHabits >= 50,
    },
    {
      id: 4,
      name: 'Achievement Hunter',
      description: 'Unlocked all achievements',
      icon: <EmojiEventsIcon />,
      unlocked: false,
    },
  ]);

  const fetchData = async () => {
    try {
      const response = await axios.get('/habits');
      const habitsData = response.data;
      setHabits(habitsData);

    
      const completedHabits = habitsData.filter((h) => h.completed).length;
      const currentStreak = calculateStreak(habitsData);
      const longestStreak = calculateLongestStreak(habitsData);

      setStats({
        totalHabits: habitsData.length,
        completedHabits,
        currentStreak,
        longestStreak,
      });

     
      setAchievements((prev) =>
        prev.map((achievement) => {
          if (achievement.id === 2) {
            return { ...achievement, unlocked: currentStreak >= 7 };
          }
          if (achievement.id === 3) {
            return { ...achievement, unlocked: completedHabits >= 50 };
          }
          if (achievement.id === 4) {
            return {
              ...achievement,
              unlocked: currentStreak >= 7 && completedHabits >= 50,
            };
          }
          return achievement;
        })
      );
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to fetch habits data');
    }
  };

  useEffect(() => {
    fetchData();

    
    const handleHabitsUpdated = () => {
      fetchData();
    };

    window.addEventListener('habitsUpdated', handleHabitsUpdated);

   
    return () => {
      window.removeEventListener('habitsUpdated', handleHabitsUpdated);
    };
  }, []);

  const calculateStreak = (habits) => {
    if (!habits || habits.length === 0) return 0;

   
    const completedHabits = habits
      .filter(h => h.completed)
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

    if (completedHabits.length === 0) return 0;

    let streak = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    
    const lastCompletion = new Date(completedHabits[0].completedAt);
    lastCompletion.setHours(0, 0, 0, 0);

    if (lastCompletion.getTime() !== today.getTime()) {
      return 0; 
    }

   
    for (let i = 1; i < completedHabits.length; i++) {
      const currentDate = new Date(completedHabits[i].completedAt);
      currentDate.setHours(0, 0, 0, 0);
      
      const previousDate = new Date(completedHabits[i - 1].completedAt);
      previousDate.setHours(0, 0, 0, 0);

      const dayDifference = (previousDate - currentDate) / (1000 * 60 * 60 * 24);
      
      if (dayDifference === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const calculateLongestStreak = (habits) => {
    if (!habits || habits.length === 0) return 0;

    const completedHabits = habits
      .filter(h => h.completed)
      .sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));

    if (completedHabits.length === 0) return 0;

    let longestStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < completedHabits.length; i++) {
      const currentDate = new Date(completedHabits[i].completedAt);
      currentDate.setHours(0, 0, 0, 0);

      const previousDate = new Date(completedHabits[i - 1].completedAt);
      previousDate.setHours(0, 0, 0, 0);

      const dayDifference = (currentDate - previousDate) / (1000 * 60 * 60 * 24);

      if (dayDifference === 1) {
        currentStreak++;
      } else if (dayDifference > 1) {
        currentStreak = 1;
      }
      longestStreak = Math.max(longestStreak, currentStreak);
    }

    return longestStreak;
  };

 
  const getStartOfWeek = (date) => {
    // Always returns Monday as the start of the week
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as start
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  
  const getWeeklyCompletedHabits = (habits) => {
    const today = new Date();
    const startOfWeek = getStartOfWeek(today);
    const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
    const counts = Array(7).fill(0); // Mon-Sun

    habits.forEach((habit) => {
      if (habit.completed && habit.completedAt) {
        const completedDate = new Date(habit.completedAt);
        completedDate.setHours(0, 0, 0, 0);
        if (completedDate >= startOfWeek && completedDate < endOfWeek) {
          const dayIndex = (completedDate.getDay() + 6) % 7; // Map Mon=0, ..., Sun=6
          counts[dayIndex]++;
        }
      }
    });
    return counts;
  };

  const weeklyCompleted = getWeeklyCompletedHabits(habits);

  const lineChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Completed Habits',
        data: weeklyCompleted,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const doughnutChartData = {
    labels: ['Completed', 'Pending'],
    datasets: [
      {
        data: [stats.completedHabits, stats.totalHabits - stats.completedHabits],
        backgroundColor: ['rgb(75, 192, 192)', 'rgb(255, 99, 132)'],
      },
    ],
  };

 
  const monthlyCounts = getMonthlyCompletionCounts(habits);
  const yearlyCountsObj = getYearlyCompletionCounts(habits);
  const yearlyLabels = Object.keys(yearlyCountsObj);
  const yearlyCounts = Object.values(yearlyCountsObj);

  const monthlyChartData = {
    labels: [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ],
    datasets: [
      {
        label: 'Habits Completed',
        data: monthlyCounts,
        backgroundColor: 'rgba(33, 150, 243, 0.5)',
      },
    ],
  };

  const yearlyChartData = {
    labels: yearlyLabels,
    datasets: [
      {
        label: 'Habits Completed',
        data: yearlyCounts,
        backgroundColor: 'rgba(33, 150, 243, 0.5)',
      },
    ],
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 6, mb: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 4, textAlign: 'center', letterSpacing: 1 }}>
          Your Progress Overview
        </Typography>
        <Grid container spacing={4}>
          {/* Profile Section */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={4}
              sx={{
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderRadius: 4,
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #23272f 0%, #121212 100%)'
                  : 'linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)',
                boxShadow: 3,
              }}
            >
              <Avatar
                sx={{
                  width: 110,
                  height: 110,
                  bgcolor: 'primary.main',
                  mb: 2,
                  border: '4px solid #2196f3',
                  fontSize: 48,
                }}
              >
                {user?.username?.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                {user?.username}
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Habit Tracker
              </Typography>
              <Box sx={{ mt: 2, width: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Statistics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper
                      elevation={1}
                      sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', borderRadius: 2 }}
                    >
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {stats.totalHabits}
                      </Typography>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <TimelineIcon fontSize="small" /> Total Habits
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper
                      elevation={1}
                      sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', borderRadius: 2 }}
                    >
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {stats.completedHabits}
                      </Typography>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <CheckCircleIcon fontSize="small" /> Completed
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper
                      elevation={1}
                      sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', borderRadius: 2 }}
                    >
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {stats.currentStreak}
                      </Typography>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <FireIcon fontSize="small" /> Current Streak
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper
                      elevation={1}
                      sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light', borderRadius: 2 }}
                    >
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {stats.longestStreak}
                      </Typography>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <EmojiEventsIcon fontSize="small" /> Longest Streak
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{
              p: 3, mb: 4, borderRadius: 4,
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #23272f 0%, #121212 100%)'
                : 'linear-gradient(135deg, #f5f5f5 0%, #e3f2fd 100%)'
            }}>
              <CalendarView habits={habits} />
            </Paper>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 3, borderRadius: 4, mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Monthly Completions
                  </Typography>
                  <Bar data={monthlyChartData} options={{ responsive: true, plugins: { legend: { display: false } } }} height={200} />
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 3, borderRadius: 4, mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Yearly Completions
                  </Typography>
                  <Bar data={yearlyChartData} options={{ responsive: true, plugins: { legend: { display: false } } }} height={200} />
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper elevation={3} sx={{ p: 3, borderRadius: 4, mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Weekly Progress
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <Line
                      data={lineChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 3, borderRadius: 4, mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Habit Completion
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <Doughnut
                      data={doughnutChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 3, borderRadius: 4, mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Achievements
                  </Typography>
                  <List>
                    {achievements.map((achievement, index) => (
                      <Box key={achievement.id}>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar
                              sx={{
                                bgcolor: achievement.unlocked
                                  ? 'success.main'
                                  : 'grey.300',
                                border: achievement.unlocked ? '2px solid #43a047' : '2px solid #bdbdbd',
                                boxShadow: achievement.unlocked ? 3 : 0,
                              }}
                            >
                              {achievement.icon}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={achievement.name}
                            secondary={achievement.description}
                          />
                        </ListItem>
                        {index < achievements.length - 1 && <Divider />}
                      </Box>
                    ))}
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard; 