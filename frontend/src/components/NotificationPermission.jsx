import { useEffect, useState } from 'react';
import { Button, Box, Typography } from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import { notificationService } from '../utils/notificationService';

const NotificationPermission = () => {
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    setHasPermission(Notification.permission === 'granted');
  }, []);

  const handleRequestPermission = async () => {
    const granted = await notificationService.requestPermission();
    setHasPermission(granted);
  };

  if (hasPermission) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        bgcolor: 'background.paper',
        p: 2,
        borderRadius: 1,
        boxShadow: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        zIndex: 1000,
      }}
    >
      <NotificationsIcon color="primary" />
      <Typography variant="body2">
        Enable notifications to receive habit reminders
      </Typography>
      <Button
        variant="contained"
        size="small"
        onClick={handleRequestPermission}
      >
        Enable
      </Button>
    </Box>
  );
};

export default NotificationPermission; 