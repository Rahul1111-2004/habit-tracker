import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameDay, isSameMonth, getMonth, getYear } from 'date-fns';

export function getMonthlyCompletionCounts(habits) {
 
  const now = new Date();
  const year = getYear(now);
  const counts = Array(12).fill(0);
  habits.forEach(h => {
    if (h.completed && h.completedAt) {
      const d = new Date(h.completedAt);
      if (getYear(d) === year) {
        counts[getMonth(d)]++;
      }
    }
  });
  return counts;
}

export function getYearlyCompletionCounts(habits) {

  const counts = {};
  habits.forEach(h => {
    if (h.completed && h.completedAt) {
      const d = new Date(h.completedAt);
      const y = getYear(d);
      counts[y] = (counts[y] || 0) + 1;
    }
  });
  return counts;
}

const CalendarView = ({ habits }) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());


  const completedDates = habits
    .filter(h => h.completed && h.completedAt)
    .map(h => new Date(h.completedAt));

  const renderHeader = () => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Typography variant="h6">{format(currentMonth, 'MMMM yyyy')}</Typography>
      <Box>
        <button onClick={() => setCurrentMonth(prev => addDays(startOfMonth(prev), -1))}>{'<'}</button>
        <button onClick={() => setCurrentMonth(prev => addDays(endOfMonth(prev), 1))}>{'>'}</button>
      </Box>
    </Box>
  );

  const renderDays = () => {
    const days = [];
    const date = startOfWeek(currentMonth, { weekStartsOn: 1 });
    for (let i = 0; i < 7; i++) {
      days.push(
        <Box key={i} sx={{ textAlign: 'center', fontWeight: 'bold' }}>
          {format(addDays(date, i), 'EEE')}
        </Box>
      );
    }
    return <Grid container columns={7}>{days.map((d, i) => <Grid item xs={1} key={i}>{d}</Grid>)}</Grid>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const isCompleted = completedDates.some(cd => isSameDay(cd, day));
        days.push(
          <Grid item xs={1} key={day}>
            <Paper
              sx={{
                height: 40,
                width: 40,
                mt: 1,
                mb: 1,
                mx: 'auto',
                bgcolor: isCompleted ? 'success.light' : isSameMonth(day, monthStart) ? 'background.paper' : 'grey.100',
                color: isSameMonth(day, monthStart) ? 'text.primary' : 'grey.400',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                border: isCompleted ? '2px solid green' : '1px solid #eee',
              }}
              elevation={isCompleted ? 4 : 1}
            >
              {formattedDate}
            </Paper>
          </Grid>
        );
        day = addDays(day, 1);
      }
      rows.push(<Grid container columns={7} key={day}>{days}</Grid>);
      days = [];
    }
    return <Box>{rows}</Box>;
  };

  return (
    <Box sx={{ p: 2 }}>
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </Box>
  );
};

export default CalendarView; 