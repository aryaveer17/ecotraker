"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import api from "../services/api"

const Leaderboard = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const [activeTab, setActiveTab] = useState("global")
  const [globalLeaderboard, setGlobalLeaderboard] = useState([])
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState([])
  const [userRank, setUserRank] = useState(null)

  const tabs = [
    { id: "global", label: "All Time", icon: "🌍" },
    { id: "weekly", label: "This Week", icon: "📅" },
  ]

  useEffect(() => {
    if (isAuthenticated) {
      fetchLeaderboards()
      if (user?.id) {
        fetchUserRank()
      }
    }
  }, [isAuthenticated, user])

  const fetchLeaderboards = async () => {
    try {
      const [globalRes, weeklyRes] = await Promise.all([api.get("/leaderboard/global"), api.get("/leaderboard/weekly")])
      setGlobalLeaderboard(globalRes.data)
      setWeeklyLeaderboard(weeklyRes.data)
    } catch (error) {
      console.error("Error fetching leaderboards:", error)
    }
  }

  const fetchUserRank = async () => {
    try {
      const response = await api.get(`/leaderboard/rank/${user.id}`)
      setUserRank(response.data)
    } catch (error) {
      console.error("Error fetching user rank:", error)
    }
  }

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return "🏆"
      case 2:
        return "🥈"
      case 3:
        return "🥉"
      default:
        return "🏅"
    }
  }

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return "text-yellow-600 bg-yellow-50"
      case 2:
        return "text-gray-600 bg-gray-50"
      case 3:
        return "text-orange-600 bg-orange-50"
      default:
        return "text-blue-600 bg-blue-50"
    }
  }

  const getCurrentLeaderboard = () => {
    return activeTab === "global" ? globalLeaderboard : weeklyLeaderboard
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Please log in to view the leaderboard</h2>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Leaderboard</h1>
        <p className="text-gray-600">See how you rank among eco-warriors!</p>
      </div>

      {/* User's Current Rank */}
      {userRank && (
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">Your Current Rank</h2>
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold">#{userRank.rank}</div>
                <div className="text-green-100">Global Rank</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{userRank.points}</div>
                <div className="text-green-100">Total Points</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{userRank.level}</div>
                <div className="text-green-100">Level</div>
              </div>
            </div>
          </div>
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

        {/* Leaderboard List */}
        <div className="p-6">
          <div className="space-y-4">
            {getCurrentLeaderboard().map((entry, index) => (
              <div
                key={entry._id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  entry._id === user?.id ? "border-green-500 bg-green-50" : "border-gray-200"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${getRankColor(entry.rank)}`}
                  >
                    <span className="text-lg">{getRankIcon(entry.rank)}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">{entry.name}</h3>
                      {entry._id === user?.id && (
                        <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">You</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      Level {entry.level}
                      {entry.streak && ` • ${entry.streak} day streak`}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {activeTab === "global" ? entry.points : entry.weeklyPoints}
                  </div>
                  <div className="text-sm text-gray-500">
                    {activeTab === "global" ? "total points" : "weekly points"}
                  </div>
                  {activeTab === "weekly" && entry.habitCount && (
                    <div className="text-xs text-gray-400">{entry.habitCount} habits this week</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {getCurrentLeaderboard().length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No data available for this leaderboard yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Achievement Badges */}
      {user?.badges && user.badges.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Your Achievements</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {user.badges.map((badge, index) => (
              <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">{badge.icon}</div>
                <div className="text-sm font-medium">{badge.name}</div>
                <div className="text-xs text-gray-500">{new Date(badge.earnedAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Leaderboard
