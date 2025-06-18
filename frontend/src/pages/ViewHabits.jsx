import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Switch,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { notificationService } from '../utils/notificationService';
import axios from '../utils/axios';

const ViewHabits = () => {
  const navigate = useNavigate();
  const [habits, setHabits] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    note: '',
    reminderTime: new Date(),
  });

  const fetchHabits = async () => {
    try {
      const response = await axios.get('/habits');
      setHabits(response.data);
    } catch (error) {
      toast.error('Failed to fetch habits');
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const handleToggleComplete = async (habitId, completed) => {
    try {
      const now = new Date().toISOString();
      const requestData = { 
        completed: !completed,
        completedAt: !completed ? now : null
      };

      await axios.patch(`/habits/${habitId}/toggle`, requestData);
      await fetchHabits();

      if (!completed) {
        toast.success('Habit completed! Keep it up, good work!');
      } else {
        toast.info('Habit marked as incomplete');
      }

      window.dispatchEvent(new CustomEvent('habitsUpdated'));
    } catch (error) {
      console.error('Toggle habit error:', error);
      toast.error(error.response?.data || 'Failed to update habit status');
    }
  };

  const handleDelete = async (habitId) => {
    if (window.confirm('Are you sure you want to delete this habit?')) {
      try {
        await axios.delete(`/habits/${habitId}`);

        // Cancel the notification for this habit
        const notifications = JSON.parse(localStorage.getItem('habitNotifications') || '{}');
        if (notifications[habitId]) {
          notificationService.cancelNotification(notifications[habitId]);
          delete notifications[habitId];
          localStorage.setItem('habitNotifications', JSON.stringify(notifications));
        }

        await fetchHabits();
        toast.success('Habit deleted successfully');
      } catch (error) {
        toast.error(error.response?.data || 'Failed to delete habit');
      }
    }
  };

  const handleEditClick = (habit) => {
    setSelectedHabit(habit);
    setEditFormData({
      name: habit.name,
      note: habit.note || '',
      reminderTime: new Date(habit.reminderTime),
    });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      await axios.patch(`/habits/${selectedHabit.id}`, {
        name: editFormData.name,
        note: editFormData.note,
        reminderTime: editFormData.reminderTime.toISOString(),
      });
      
      setEditDialogOpen(false);
      await fetchHabits();
      toast.success('Habit updated successfully');
    } catch (error) {
      toast.error(error.response?.data || 'Failed to update habit');
    }
  };

  const pendingHabits = habits.filter((habit) => !habit.completed);
  const completedHabits = habits.filter((habit) => habit.completed);

  const HabitList = ({ habits, title }) => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Paper elevation={2}>
        <List>
          {habits.map((habit, index) => (
            <Box key={habit.id}>
              <ListItem>
                <ListItemText
                  primary={habit.name}
                  secondary={
                    <>
                      {habit.note && (
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                        >
                          {habit.note}
                          <br />
                        </Typography>
                      )}
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                      >
                        Reminder: {new Date(habit.reminderTime).toLocaleString()}
                      </Typography>
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={habit.completed}
                    onChange={() => handleToggleComplete(habit.id, habit.completed)}
                  />
                  <IconButton
                    edge="end"
                    aria-label="edit"
                    onClick={() => handleEditClick(habit)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDelete(habit.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              {index < habits.length - 1 && <Divider />}
            </Box>
          ))}
        </List>
      </Paper>
    </Box>
  );

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Typography variant="h4" component="h1">
            My Habits
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/app/add-habit')}
          >
            Add New Habit
          </Button>
        </Box>

        <HabitList habits={pendingHabits} title="Pending Habits" />
        <HabitList habits={completedHabits} title="Completed Habits" />

        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
          <DialogTitle>Edit Habit</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Habit Name"
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, name: e.target.value })
                }
                margin="normal"
              />
              <TextField
                fullWidth
                label="Description"
                value={editFormData.note}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, note: e.target.value })
                }
                multiline
                rows={4}
                margin="normal"
              />
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Reminder Time"
                  value={editFormData.reminderTime}
                  onChange={(newValue) =>
                    setEditFormData({ ...editFormData, reminderTime: newValue })
                  }
                  renderInput={(params) => (
                    <TextField {...params} fullWidth margin="normal" />
                  )}
                />
              </LocalizationProvider>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSubmit} variant="contained">
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default ViewHabits; 