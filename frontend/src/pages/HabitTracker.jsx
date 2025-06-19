"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import api from "../services/api"

const HabitTracker = () => {
  const { isAuthenticated } = useSelector((state) => state.auth)
  const [habits, setHabits] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    action: "",
    category: "transport",
    points: 10,
    notes: "",
    date: new Date().toISOString().split("T")[0],
  })

  const predefinedHabits = [
    { action: "Used reusable water bottle", category: "waste", points: 5 },
    { action: "Walked instead of driving", category: "transport", points: 15 },
    { action: "Recycled plastic/paper", category: "waste", points: 10 },
    { action: "Used public transport", category: "transport", points: 12 },
    { action: "Ate vegetarian meal", category: "food", points: 8 },
    { action: "Turned off lights when leaving room", category: "energy", points: 5 },
    { action: "Took shorter shower", category: "water", points: 10 },
    { action: "Brought reusable bags shopping", category: "waste", points: 8 },
  ]

  const categories = [
    { value: "transport", label: "Transport", icon: "🚲" },
    { value: "energy", label: "Energy", icon: "💡" },
    { value: "waste", label: "Waste", icon: "♻️" },
    { value: "water", label: "Water", icon: "💧" },
    { value: "food", label: "Food", icon: "🥗" },
    { value: "other", label: "Other", icon: "🌱" },
  ]

  useEffect(() => {
    if (isAuthenticated) {
      fetchHabits()
    }
  }, [isAuthenticated])

  const fetchHabits = async () => {
    try {
      const response = await api.get("/habits")
      setHabits(response.data)
    } catch (error) {
      console.error("Error fetching habits:", error)
    }
  }

  const handleQuickLog = async (habit) => {
    try {
      await api.post("/habits", {
        ...habit,
        date: new Date().toISOString(),
      })
      fetchHabits()
    } catch (error) {
      console.error("Error logging habit:", error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post("/habits", formData)
      setFormData({
        action: "",
        category: "transport",
        points: 10,
        notes: "",
        date: new Date().toISOString().split("T")[0],
      })
      setShowForm(false)
      fetchHabits()
    } catch (error) {
      console.error("Error creating habit:", error)
    }
  }

  const getCategoryIcon = (category) => {
    const cat = categories.find((c) => c.value === category)
    return cat ? cat.icon : "🌱"
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Please log in to track your habits</h2>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Habit Tracker</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          {showForm ? "Cancel" : "Log Custom Habit"}
        </button>
      </div>

      {/* Quick Log Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Quick Log</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {predefinedHabits.map((habit, index) => (
            <button
              key={index}
              onClick={() => handleQuickLog(habit)}
              className="p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{getCategoryIcon(habit.category)}</span>
                <span className="text-sm text-green-600 font-medium">+{habit.points} pts</span>
              </div>
              <p className="text-sm font-medium">{habit.action}</p>
              <p className="text-xs text-gray-500 capitalize">{habit.category}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Habit Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Log Custom Habit</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Habit Action</label>
                <input
                  type="text"
                  value={formData.action}
                  onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="What did you do?"
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
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                <input
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: Number.parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  min="1"
                  max="50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                rows="3"
                placeholder="Any additional details..."
              />
            </div>
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Log Habit
            </button>
          </form>
        </div>
      )}

      {/* Recent Habits */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Recent Habits</h2>
        {habits.length > 0 ? (
          <div className="space-y-3">
            {habits.map((habit) => (
              <div key={habit._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getCategoryIcon(habit.category)}</span>
                  <div>
                    <p className="font-medium">{habit.action}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(habit.date).toLocaleDateString()} • {habit.category}
                    </p>
                    {habit.notes && <p className="text-sm text-gray-500 mt-1">{habit.notes}</p>}
                  </div>
                </div>
                <div className="text-green-600 font-bold">+{habit.points}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No habits logged yet. Start by logging your first eco-friendly action!
          </p>
        )}
      </div>
    </div>
  )
}

export default HabitTracker
