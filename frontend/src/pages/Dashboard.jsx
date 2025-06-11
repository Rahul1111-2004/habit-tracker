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
} from '@mui/material';
import {
  EmojiEvents as EmojiEventsIcon,
  Timeline as TimelineIcon,
  CheckCircle as CheckCircleIcon,
  LocalFireDepartment as FireIcon,
} from '@mui/icons-material';
import { Line, Doughnut } from 'react-chartjs-2';
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
} from 'chart.js';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const { user } = useAuth();
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8080/api/habits', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const habitsData = response.data;
        setHabits(habitsData);

        // Calculate statistics
        const completedHabits = habitsData.filter((h) => h.completed).length;
        const currentStreak = calculateStreak(habitsData);
        const longestStreak = Math.max(currentStreak, 5); // Example value

        setStats({
          totalHabits: habitsData.length,
          completedHabits,
          currentStreak,
          longestStreak,
        });

        // Update achievements based on stats
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
      }
    };

    fetchData();
  }, []);

  const calculateStreak = (habits) => {
    // This is a simplified streak calculation
    // In a real app, you'd want to track daily completions
    return Math.floor(Math.random() * 10); // Example value
  };

  const lineChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Completed Habits',
        data: [3, 4, 2, 5, 3, 4, 6],
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

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Profile Section */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: 'primary.main',
                  mb: 2,
                }}
              >
                {user?.username?.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {user?.username}
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                Habit Tracker
              </Typography>
              <Box sx={{ mt: 2, width: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Statistics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper
                      elevation={2}
                      sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light' }}
                    >
                      <Typography variant="h4">{stats.totalHabits}</Typography>
                      <Typography variant="body2">Total Habits</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper
                      elevation={2}
                      sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light' }}
                    >
                      <Typography variant="h4">
                        {stats.completedHabits}
                      </Typography>
                      <Typography variant="body2">Completed</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper
                      elevation={2}
                      sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light' }}
                    >
                      <Typography variant="h4">{stats.currentStreak}</Typography>
                      <Typography variant="body2">Current Streak</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper
                      elevation={2}
                      sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light' }}
                    >
                      <Typography variant="h4">{stats.longestStreak}</Typography>
                      <Typography variant="body2">Longest Streak</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>

          {/* Charts Section */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper elevation={3} sx={{ p: 3 }}>
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
                <Paper elevation={3} sx={{ p: 3 }}>
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
                <Paper elevation={3} sx={{ p: 3 }}>
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