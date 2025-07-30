"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import api from "../services/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [recentHabits, setRecentHabits] = useState([]);
  const [activeChallenges, setActiveChallenges] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, habitsRes, challengesRes] = await Promise.all([
        api.get("/habits/stats"),
        api.get("/habits"),
        api.get("/challenges"),
      ]);

      setStats(statsRes.data);
      setRecentHabits(habitsRes.data.slice(0, 5));
      setActiveChallenges(
        challengesRes.data.filter((c) => c.status === "active").slice(0, 3)
      );
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const chartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Daily Points",
        data: [12, 19, 15, 25, 22, 18, 30],
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.2)",
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Weekly Progress",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to EcoTracker! 🌱
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Track your sustainable habits and join the community
        </p>
        <div className="space-x-4">
          <Link
            to="/register"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="border border-green-600 text-green-600 px-6 py-3 rounded-lg hover:bg-green-50 transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name}! 🌟
        </h1>
        <p className="text-green-100">
          Keep up the great work on your sustainability journey!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Points</p>
              <p className="text-2xl font-bold text-green-600">
                {user?.points || 0}
              </p>
            </div>
            <div className="text-3xl">🏆</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Current Level</p>
              <p className="text-2xl font-bold text-blue-600">
                {user?.level || 1}
              </p>
            </div>
            <div className="text-3xl">⭐</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Current Streak</p>
              <p className="text-2xl font-bold text-orange-600">
                {user?.streak || 0} days
              </p>
            </div>
            <div className="text-3xl">🔥</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">CO₂ Saved</p>
              <p className="text-2xl font-bold text-green-600">
                {stats?.totalCO2Saved?.toFixed(1) || 0} kg
              </p>
            </div>
            <div className="text-3xl">🌍</div>
          </div>
        </div>
      </div>

      {/* Chart and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Progress Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Line data={chartData} options={chartOptions} />
        </div>

        {/* Recent Habits */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4">Recent Habits</h3>
          <div className="space-y-3">
            {recentHabits.length > 0 ? (
              recentHabits.map((habit) => (
                <div
                  key={habit._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{habit.action}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(habit.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-green-600 font-bold">
                    +{habit.points}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                No habits logged yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Active Challenges */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4">Active Challenges</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activeChallenges.length > 0 ? (
            activeChallenges.map((challenge) => (
              <div
                key={challenge._id}
                className="border border-gray-200 p-4 rounded-lg"
              >
                <h4 className="font-bold mb-2">{challenge.title}</h4>
                <p className="text-sm text-gray-600 mb-2">
                  {challenge.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-600">
                    {challenge.participants.length} participants
                  </span>
                  <span className="text-sm font-bold text-orange-600">
                    {challenge.points} pts
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 col-span-3 text-center py-4">
              No active challenges
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
