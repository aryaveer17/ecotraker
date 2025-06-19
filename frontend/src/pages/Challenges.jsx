"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import api from "../services/api"

const Challenges = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const [challenges, setChallenges] = useState([])
  const [activeTab, setActiveTab] = useState("active")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "general",
    difficulty: "Medium",
    points: 50,
    duration: 7,
    startDate: new Date().toISOString().split("T")[0],
  })

  const tabs = [
    { id: "active", label: "Active", icon: "🔥" },
    { id: "available", label: "Available", icon: "📋" },
    { id: "completed", label: "Completed", icon: "✅" },
  ]

  const categories = ["general", "transport", "energy", "waste", "water", "food"]

  const difficulties = ["Easy", "Medium", "Hard"]

  useEffect(() => {
    if (isAuthenticated) {
      fetchChallenges()
    }
  }, [isAuthenticated])

  const fetchChallenges = async () => {
    try {
      const response = await api.get("/challenges")
      setChallenges(response.data)
    } catch (error) {
      console.error("Error fetching challenges:", error)
    }
  }

  const handleCreateChallenge = async (e) => {
    e.preventDefault()
    try {
      await api.post("/challenges", formData)
      setFormData({
        title: "",
        description: "",
        category: "general",
        difficulty: "Medium",
        points: 50,
        duration: 7,
        startDate: new Date().toISOString().split("T")[0],
      })
      setShowCreateForm(false)
      fetchChallenges()
    } catch (error) {
      console.error("Error creating challenge:", error)
    }
  }

  const handleJoinChallenge = async (challengeId) => {
    try {
      await api.post(`/challenges/${challengeId}/join`)
      fetchChallenges()
    } catch (error) {
      console.error("Error joining challenge:", error)
    }
  }

  const getFilteredChallenges = () => {
    const now = new Date()

    switch (activeTab) {
      case "active":
        return challenges.filter((challenge) => {
          const isParticipant = challenge.participants.some((p) => p.userId._id === user?.id)
          const isActive = new Date(challenge.startDate) <= now && new Date(challenge.endDate) >= now
          return isParticipant && isActive
        })
      case "available":
        return challenges.filter((challenge) => {
          const isParticipant = challenge.participants.some((p) => p.userId._id === user?.id)
          const isUpcoming = new Date(challenge.startDate) > now
          const isActive = new Date(challenge.startDate) <= now && new Date(challenge.endDate) >= now
          return !isParticipant && (isUpcoming || isActive)
        })
      case "completed":
        return challenges.filter((challenge) => {
          const isParticipant = challenge.participants.some((p) => p.userId._id === user?.id)
          const isCompleted = new Date(challenge.endDate) < now
          return isParticipant && isCompleted
        })
      default:
        return challenges
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-600 bg-green-100"
      case "Medium":
        return "text-yellow-600 bg-yellow-100"
      case "Hard":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getProgressPercentage = (challenge) => {
    if (!user) return 0
    const participant = challenge.participants.find((p) => p.userId._id === user.id)
    return participant ? participant.progress : 0
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Please log in to view challenges</h2>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Community Challenges</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          {showCreateForm ? "Cancel" : "Create Challenge"}
        </button>
      </div>

      {/* Create Challenge Form */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Create New Challenge</h2>
          <form onSubmit={handleCreateChallenge} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Challenge Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., No Plastic Week"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {difficulties.map((diff) => (
                    <option key={diff} value={diff}>
                      {diff}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Points Reward</label>
                <input
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: Number.parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  min="10"
                  max="500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (days)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: Number.parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  min="1"
                  max="365"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                rows="4"
                placeholder="Describe the challenge and what participants need to do..."
                required
              />
            </div>
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Create Challenge
            </button>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Challenge List */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredChallenges().map((challenge) => (
              <div
                key={challenge._id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg">{challenge.title}</h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}
                  >
                    {challenge.difficulty}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{challenge.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Duration:</span>
                    <span>{challenge.duration} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Participants:</span>
                    <span>{challenge.participants.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Reward:</span>
                    <span className="text-green-600 font-medium">{challenge.points} points</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Ends:</span>
                    <span>{new Date(challenge.endDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {activeTab === "active" && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{getProgressPercentage(challenge)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage(challenge)}%` }}
                      />
                    </div>
                  </div>
                )}

                {activeTab === "available" && (
                  <button
                    onClick={() => handleJoinChallenge(challenge._id)}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Join Challenge
                  </button>
                )}

                {activeTab === "completed" && (
                  <div className="text-center">
                    <span className="text-green-600 font-medium">✅ Completed</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {getFilteredChallenges().length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {activeTab === "active" && "No active challenges. Join some challenges to get started!"}
                {activeTab === "available" && "No available challenges at the moment."}
                {activeTab === "completed" && "No completed challenges yet."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Challenges
