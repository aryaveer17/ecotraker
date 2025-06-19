"use client"

import { Routes, Route } from "react-router-dom"
import { useEffect } from "react"
import { useDispatch } from "react-redux"
import Navbar from "./components/Navbar"
import Dashboard from "./pages/Dashboard"
import HabitTracker from "./pages/HabitTracker"
import Challenges from "./pages/Challenges"
import Leaderboard from "./pages/Leaderboard"
import Forum from "./pages/Forum"
import Login from "./pages/Login"
import Register from "./pages/Register"
import { loadUser } from "./store/slices/authSlice"

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    // Load user from localStorage on app start
    const token = localStorage.getItem("token")
    if (token) {
      dispatch(loadUser())
    }
  }, [dispatch])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/habits" element={<HabitTracker />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
