import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { toast } from 'react-toastify';
import { notificationService } from '../utils/notificationService';
import axios from '../utils/axios';

const AddHabit = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    note: '',
    reminderTime: new Date(),
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) {
      newErrors.name = 'Habit name is required';
    }
    if (!formData.reminderTime) {
      newErrors.reminderTime = 'Reminder time is required';
    } else if (formData.reminderTime <= new Date()) {
      newErrors.reminderTime = 'Reminder time must be in the future';
      toast.error('Cannot set reminder time in the past');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await axios.post('/habits', {
          name: formData.name,
          note: formData.note,
          reminderTime: formData.reminderTime.toISOString(),
        });
        toast.success('Habit added successfully!');
        
        // Schedule notification if reminder time is set
        if (formData.reminderTime) {
          const notificationId = notificationService.scheduleNotification({
            id: response.data.id,
            name: formData.name,
            reminderTime: formData.reminderTime,
          });
          
          // Store notification ID in localStorage for persistence
          if (notificationId) {
            const notifications = JSON.parse(localStorage.getItem('habitNotifications') || '{}');
            notifications[response.data.id] = notificationId;
            localStorage.setItem('habitNotifications', JSON.stringify(notifications));
          }
        }
        
        navigate('/app/view-habits');
      } catch (error) {
        toast.error(error.response?.data || 'Error adding habit');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleDateChange = (newValue) => {
    if (newValue <= new Date()) {
      setErrors((prev) => ({
        ...prev,
        reminderTime: 'Reminder time must be in the future',
      }));
      toast.error('Cannot set reminder time in the past');
    } else {
      setErrors((prev) => ({
        ...prev,
        reminderTime: '',
      }));
    }
    setFormData((prev) => ({
      ...prev,
      reminderTime: newValue,
    }));
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Add New Habit
        </Typography>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Habit Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="note"
                  multiline
                  rows={4}
                  value={formData.note}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label="Reminder Time"
                    value={formData.reminderTime}
                    onChange={handleDateChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={!!errors.reminderTime}
                        helperText={errors.reminderTime}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/app/view-habits')}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="contained">
                    Create Habit
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default AddHabit; 