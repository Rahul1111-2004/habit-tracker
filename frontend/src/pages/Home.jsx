import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  useTheme,
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  Notifications as NotificationsIcon,
  EmojiEvents as EmojiEventsIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';

const features = [
  {
    icon: <TimelineIcon sx={{ fontSize: 40 }} />,
    title: 'Track Your Habits',
    description: 'Create and manage your daily habits with ease',
  },
  {
    icon: <NotificationsIcon sx={{ fontSize: 40 }} />,
    title: 'Smart Reminders',
    description: 'Get timely notifications to stay on track',
  },
  {
    icon: <EmojiEventsIcon sx={{ fontSize: 40 }} />,
    title: 'Achievement Badges',
    description: 'Earn badges for completing your habits',
  },
  {
    icon: <BarChartIcon sx={{ fontSize: 40 }} />,
    title: 'Progress Analytics',
    description: 'View your progress with detailed statistics',
  },
];

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: { xs: 6, md: 8 },
          textAlign: 'center',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            Welcome to TrackIt
          </Typography>
          <Typography 
            variant="h5" 
            component="h2" 
            gutterBottom 
            sx={{ 
              fontSize: { xs: '1.2rem', md: '1.5rem' },
              color: 'white',
              opacity: 0.9,
            }}
          >
            Your personal habit tracking companion
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              onClick={() => navigate('/signup')}
              sx={{ 
                mr: 2, 
                mb: { xs: 2, md: 0 },
                '&:hover': {
                  bgcolor: 'secondary.dark',
                },
              }}
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              size="large"
              onClick={() => navigate('/login')}
              sx={{
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Sign In
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Typography
          variant="h3"
          component="h2"
          align="center"
          gutterBottom
          sx={{ 
            mb: 6, 
            fontSize: { xs: '2rem', md: '2.5rem' },
            color: 'text.primary',
          }}
        >
          Features
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  transition: 'transform 0.2s',
                  bgcolor: 'background.paper',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <Box
                  sx={{
                    color: 'primary.main',
                    mb: 2,
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography 
                  variant="h6" 
                  component="h3" 
                  gutterBottom
                  sx={{ color: 'text.primary' }}
                >
                  {feature.title}
                </Typography>
                <Typography 
                  color="text.secondary"
                  sx={{ opacity: 0.8 }}
                >
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Call to Action */}
      <Box
        sx={{
          bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'grey.100',
          py: { xs: 6, md: 8 },
          textAlign: 'center',
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="md">
          <Typography 
            variant="h4" 
            component="h2" 
            gutterBottom 
            sx={{ 
              fontSize: { xs: '1.8rem', md: '2.2rem' },
              color: 'text.primary',
            }}
          >
            Ready to start tracking your habits?
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate('/signup')}
            sx={{ 
              mt: 2,
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}
          >
            Create Your Account
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 