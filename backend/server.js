const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 5001

// Middleware
app.use(cors())
app.use(express.json())

// MongoDB Connection with Console Confirmation
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/sustainable-tracker", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection failed:", err.message))

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB runtime error:", err)
})

// Routes
const authRoutes = require("./routes/auth")
const habitRoutes = require("./routes/habits")
const challengeRoutes = require("./routes/challenges")
const forumRoutes = require("./routes/forum")
const leaderboardRoutes = require("./routes/leaderboard")

app.use("/api/auth", authRoutes)
app.use("/api/habits", habitRoutes)
app.use("/api/challenges", challengeRoutes)
app.use("/api/forum", forumRoutes)
app.use("/api/leaderboard", leaderboardRoutes)

// Test Route
app.get("/", (req, res) => {
  res.json({ message: "Sustainable Living Tracker API" })
})

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})
