package com.trackit.controller;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.trackit.model.Habit;
import com.trackit.model.User;
import com.trackit.repository.HabitRepository;
import com.trackit.repository.UserRepository;

@RestController
@RequestMapping("/api/habits")
@CrossOrigin(origins = "http://localhost:5173")
public class HabitController {

    private static final Logger logger = LoggerFactory.getLogger(HabitController.class);
    private final HabitRepository habitRepository;
    private final UserRepository userRepository;

    public HabitController(HabitRepository habitRepository, UserRepository userRepository) {
        this.habitRepository = habitRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<Habit>> getUserHabits() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        logger.info("Getting habits for user: {}", username);
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    logger.error("User not found: {}", username);
                    return new RuntimeException("User not found");
                });
        
        List<Habit> habits = habitRepository.findByUserOrderByCreatedAtDesc(user);
        logger.info("Found {} habits for user: {}", habits.size(), username);
        
        return ResponseEntity.ok(habits);
    }

    @PostMapping
    public ResponseEntity<?> createHabit(@RequestBody Map<String, String> request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        logger.info("Creating habit for user: {}", username);
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    logger.error("User not found: {}", username);
                    return new RuntimeException("User not found");
                });

        Habit habit = new Habit();
        habit.setName(request.get("name"));
        habit.setNote(request.get("note"));
        habit.setReminderTime(request.get("reminderTime"));
        habit.setUser(user);
        
        Habit savedHabit = habitRepository.save(habit);
        logger.info("Created habit: {} for user: {}", savedHabit.getName(), username);
        
        return ResponseEntity.ok(savedHabit);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteHabit(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        logger.info("Deleting habit with ID: {} for user: {}", id, username);
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    logger.error("User not found: {}", username);
                    return new RuntimeException("User not found");
                });

        Habit habit = habitRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("Habit not found with ID: {}", id);
                    return new RuntimeException("Habit not found");
                });

        if (!habit.getUser().getId().equals(user.getId())) {
            logger.error("User: {} is not authorized to delete habit with ID: {}", username, id);
            return ResponseEntity.badRequest().body("Not authorized to delete this habit");
        }

        habitRepository.delete(habit);
        logger.info("Deleted habit with ID: {} for user: {}", id, username);
        
        return ResponseEntity.ok("Habit deleted successfully");
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<?> toggleHabitCompletion(@PathVariable Long id, @RequestBody Map<String, Boolean> request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        logger.info("Toggling completion status for habit with ID: {} for user: {}", id, username);
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    logger.error("User not found: {}", username);
                    return new RuntimeException("User not found");
                });

        Habit habit = habitRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("Habit not found with ID: {}", id);
                    return new RuntimeException("Habit not found");
                });

        if (!habit.getUser().getId().equals(user.getId())) {
            logger.error("User: {} is not authorized to update habit with ID: {}", username, id);
            return ResponseEntity.badRequest().body("Not authorized to update this habit");
        }

        Boolean completed = request.get("completed");
        if (completed == null) {
            logger.error("Invalid request: completed status is required");
            return ResponseEntity.badRequest().body("Completed status is required");
        }

        habit.setCompleted(completed);
        Habit updatedHabit = habitRepository.save(habit);
        logger.info("Updated completion status for habit with ID: {} to: {} for user: {}", 
            id, completed, username);
        
        return ResponseEntity.ok(updatedHabit);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> updateHabit(@PathVariable Long id, @RequestBody Map<String, String> request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        logger.info("Updating habit with ID: {} for user: {}", id, username);
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    logger.error("User not found: {}", username);
                    return new RuntimeException("User not found");
                });

        Habit habit = habitRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("Habit not found with ID: {}", id);
                    return new RuntimeException("Habit not found");
                });

        if (!habit.getUser().getId().equals(user.getId())) {
            logger.error("User: {} is not authorized to update habit with ID: {}", username, id);
            return ResponseEntity.badRequest().body("Not authorized to update this habit");
        }

        String name = request.get("name");
        if (name == null || name.trim().isEmpty()) {
            logger.error("Invalid request: name is required");
            return ResponseEntity.badRequest().body("Name is required");
        }

        habit.setName(name.trim());
        
        String note = request.get("note");
        if (note != null) {
            habit.setNote(note.trim());
        }

        String reminderTime = request.get("reminderTime");
        if (reminderTime != null) {
            habit.setReminderTime(reminderTime.trim());
        }

        Habit updatedHabit = habitRepository.save(habit);
        logger.info("Updated habit with ID: {} for user: {}", id, username);
        
        return ResponseEntity.ok(updatedHabit);
    }
} 