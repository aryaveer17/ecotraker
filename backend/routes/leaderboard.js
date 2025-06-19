const express = require("express")
const User = require("../models/User")
const Habit = require("../models/Habit")

const router = express.Router()

// Get global leaderboard
router.get("/global", async (req, res) => {
  try {
    const users = await User.find().select("name points level streak badges avatar").sort({ points: -1 }).limit(50)

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      ...user.toObject(),
    }))

    res.json(leaderboard)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get weekly leaderboard
router.get("/weekly", async (req, res) => {
  try {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const weeklyHabits = await Habit.aggregate([
      {
        $match: {
          createdAt: { $gte: oneWeekAgo },
        },
      },
      {
        $group: {
          _id: "$userId",
          weeklyPoints: { $sum: "$points" },
          habitCount: { $sum: 1 },
        },
      },
      {
        $sort: { weeklyPoints: -1 },
      },
      {
        $limit: 50,
      },
    ])

    // Populate user details
    const userIds = weeklyHabits.map((item) => item._id)
    const users = await User.find({ _id: { $in: userIds } }).select("name avatar level")

    const leaderboard = weeklyHabits.map((item, index) => {
      const user = users.find((u) => u._id.toString() === item._id.toString())
      return {
        rank: index + 1,
        _id: user._id,
        name: user.name,
        avatar: user.avatar,
        level: user.level,
        weeklyPoints: item.weeklyPoints,
        habitCount: item.habitCount,
      }
    })

    res.json(leaderboard)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get user's rank
router.get("/rank/:userId", async (req, res) => {
  try {
    const userId = req.params.userId
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const rank = (await User.countDocuments({ points: { $gt: user.points } })) + 1

    res.json({
      rank,
      points: user.points,
      level: user.level,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router
