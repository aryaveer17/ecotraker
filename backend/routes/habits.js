const express = require("express")
const Habit = require("../models/Habit")
const User = require("../models/User")
const auth = require("../middleware/auth")

const router = express.Router()

// Get user's habits
router.get("/", auth, async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(50)
    res.json(habits)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Log a new habit
router.post("/", auth, async (req, res) => {
  try {
    const { action, category, points, notes, impact } = req.body

    const habit = new Habit({
      userId: req.userId,
      action,
      category,
      points,
      notes,
      impact,
    })

    await habit.save()

    // Update user points
    await User.findByIdAndUpdate(req.userId, {
      $inc: { points: points },
    })

    res.status(201).json(habit)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get habit statistics
router.get("/stats", auth, async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.userId })

    const stats = {
      totalHabits: habits.length,
      totalPoints: habits.reduce((sum, habit) => sum + habit.points, 0),
      totalCO2Saved: habits.reduce((sum, habit) => sum + (habit.impact?.co2Saved || 0), 0),
      totalWaterSaved: habits.reduce((sum, habit) => sum + (habit.impact?.waterSaved || 0), 0),
      categoryBreakdown: {},
    }

    // Calculate category breakdown
    habits.forEach((habit) => {
      if (!stats.categoryBreakdown[habit.category]) {
        stats.categoryBreakdown[habit.category] = 0
      }
      stats.categoryBreakdown[habit.category]++
    })

    res.json(stats)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router
