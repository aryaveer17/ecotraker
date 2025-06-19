const express = require("express")
const Challenge = require("../models/Challenge")
const User = require("../models/User")
const auth = require("../middleware/auth")

const router = express.Router()

// Get all challenges
router.get("/", async (req, res) => {
  try {
    const challenges = await Challenge.find()
      .populate("createdBy", "name")
      .populate("participants.userId", "name")
      .sort({ createdAt: -1 })
    res.json(challenges)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Create a new challenge
router.post("/", auth, async (req, res) => {
  try {
    const { title, description, category, difficulty, points, duration, startDate } = req.body

    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + duration)

    const challenge = new Challenge({
      title,
      description,
      category,
      difficulty,
      points,
      duration,
      startDate,
      endDate,
      createdBy: req.userId,
    })

    await challenge.save()
    await challenge.populate("createdBy", "name")

    res.status(201).json(challenge)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Join a challenge
router.post("/:id/join", auth, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)

    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" })
    }

    // Check if user already joined
    const alreadyJoined = challenge.participants.some((participant) => participant.userId.toString() === req.userId)

    if (alreadyJoined) {
      return res.status(400).json({ message: "Already joined this challenge" })
    }

    challenge.participants.push({
      userId: req.userId,
      joinedAt: new Date(),
      progress: 0,
      completed: false,
    })

    await challenge.save()
    await challenge.populate("participants.userId", "name")

    res.json(challenge)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Update challenge progress
router.put("/:id/progress", auth, async (req, res) => {
  try {
    const { progress } = req.body
    const challenge = await Challenge.findById(req.params.id)

    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" })
    }

    const participant = challenge.participants.find((p) => p.userId.toString() === req.userId)

    if (!participant) {
      return res.status(400).json({ message: "Not participating in this challenge" })
    }

    participant.progress = progress
    participant.completed = progress >= 100

    // Award points if completed
    if (participant.completed && progress === 100) {
      await User.findByIdAndUpdate(req.userId, {
        $inc: { points: challenge.points },
      })
    }

    await challenge.save()
    res.json(challenge)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router
