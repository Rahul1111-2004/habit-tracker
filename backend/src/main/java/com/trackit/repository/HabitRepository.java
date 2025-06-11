package com.trackit.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.trackit.model.Habit;
import com.trackit.model.User;

public interface HabitRepository extends JpaRepository<Habit, Long> {
    List<Habit> findByUser(User user);
    List<Habit> findByUserOrderByCreatedAtDesc(User user);
} 