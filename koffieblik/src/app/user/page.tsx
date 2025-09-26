"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import firstBadge from "../badges/first.png";
import threeDayBadge from "../badges/3dayStreak.png";
import sevenDayBadge from "../badges/7dayStreak.png";
import fiveOrdersBadge from "../badges/5orders.png";
import tenOrdersBadge from "../badges/10orders.png";

export default function UserPage() {
  const [username, setUsername] = useState("Guest");
  const [userStats, setUserStats] = useState({
    totalOrders: 1,
    currentStreak: 0,
    favoritedrink: "None",
    memberSince: "2025"
  });
  const [activeTab, setActiveTab] = useState("profile");

  // Mock leaderboard data - in a real app, this would come from your backend
  const [leaderboard, setLeaderboard] = useState([
    { id: 1, username: "user1", totalOrders: 156, currentStreak: 12, favoritedrink: "Cappuccino", rank: 1 },
    { id: 2, username: "user2", totalOrders: 143, currentStreak: 8, favoritedrink: "Espresso", rank: 2 },
    { id: 3, username: "user3", totalOrders: 128, currentStreak: 15, favoritedrink: "Latte", rank: 3 },
    { id: 4, username: "user4", totalOrders: 112, currentStreak: 5, favoritedrink: "Mocha", rank: 4 },
    { id: 5, username: "user5", totalOrders: 98, currentStreak: 7, favoritedrink: "Frappuccino", rank: 5 },
    { id: 6, username: "user6", totalOrders: 87, currentStreak: 3, favoritedrink: "Americano", rank: 6 },
    { id: 7, username: "user7", totalOrders: 76, currentStreak: 9, favoritedrink: "Macchiato", rank: 7 },
    { id: 8, username: "user8", totalOrders: 65, currentStreak: 4, favoritedrink: "Cold Brew", rank: 8 },
    { id: 9, username: "user9", totalOrders: 54, currentStreak: 2, favoritedrink: "Green Tea", rank: 9 },
    { id: 10, username: "user10", totalOrders: 43, currentStreak: 1, favoritedrink: "Decaf", rank: 10 }
  ]);

  const [leaderboardFilter, setLeaderboardFilter] = useState("orders");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  // Sort leaderboard based on selected filter
  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    if (leaderboardFilter === "orders") {
      return b.totalOrders - a.totalOrders;
    } else if (leaderboardFilter === "streak") {
      return b.currentStreak - a.currentStreak;
    }
    return 0;
  });

  // Find current user's rank
  const getCurrentUserRank = () => {
    const currentUser = sortedLeaderboard.find(user => user.username === username);
    if (currentUser) return currentUser.rank;
    
    // If user not in leaderboard, calculate based on their stats
    const usersAbove = sortedLeaderboard.filter(user => 
      leaderboardFilter === "orders" ? user.totalOrders > userStats.totalOrders : user.currentStreak > userStats.currentStreak
    );
    return usersAbove.length + 1;
  };

  const badges = [
    { id: 1, name: "First Sip", description: "Made your first order", earned: true, color: "bg-yellow-500", image: firstBadge },
    { id: 2, name: "Coffee Lover", description: "Ordered 5 coffees", earned: false, color: "bg-blue-500", image: fiveOrdersBadge },
    { id: 3, name: "Regular", description: "Ordered 10 coffees", earned: false, color: "bg-gray-400", image: tenOrdersBadge },
    { id: 4, name: "Daily", description: "3 day streak", earned: false, color: "bg-green-500", image: threeDayBadge },
    { id: 5, name: "Weekly", description: "7 day streak", earned: false, color: "bg-purple-500", image: sevenDayBadge },
  ];

  const getRankIcon = (rank: number): string => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const getRankColor = (rank: number): string => {
    if (rank === 1) return "text-yellow-600";
    if (rank === 2) return "text-gray-500";
    if (rank === 3) return "text-amber-600";
    return "text-gray-700";
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 py-4 px-6 text-center font-medium ${
              activeTab === "profile"
                ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            My Profile
          </button>
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`flex-1 py-4 px-6 text-center font-medium ${
              activeTab === "leaderboard"
                ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Leaderboard 
          </button>
        </div>
      </div>

      {activeTab === "profile" && (
        <>
          {/* User Info Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl text-white">👤</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{username}</h2>
                  <p className="text-sm text-gray-500">Member since {userStats.memberSince}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${getRankColor(getCurrentUserRank())}`}>
                  {getRankIcon(getCurrentUserRank())}
                </div>
                <div className="text-sm text-gray-500">Current Rank</div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {userStats.totalOrders}
              </div>
              <div className="text-gray-600">Total Orders</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {userStats.currentStreak}
                
              </div>
              <div className="text-gray-600">Current Streak</div>
              
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-lg font-bold text-purple-600 mb-2">
                {userStats.favoritedrink}
              </div>
              <div className="text-gray-600">Favourite Drink</div>
            </div>
          </div>

          {/* Badges Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">My Badges</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-4 rounded-lg text-center ${
                    badge.earned
                      ? "bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 shadow-sm"
                      : "bg-gray-100 opacity-60"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full ${badge.color} mx-auto mb-2 flex items-center justify-center`}
                  >
                    {badge.image ? (
                      <Image 
                        src={badge.image} 
                        alt={badge.name}
                        width={32}
                        height={32}
                        className="object-contain"
                      />
                    ) : (
                      <span className="text-white text-xl"></span>
                    )}
                  </div>
                  <div className="font-medium text-gray-900 text-sm mb-1">
                    {badge.name}
                  </div>
                  <div className="text-xs text-gray-600">
                    {badge.description}
                  </div>
                  {badge.earned && (
                    <div className="mt-2">
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === "leaderboard" && (
        <>
         

          {/* Your Position */}
          {/* User Info Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl text-white">👤</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{username}</h2>
                  <p className="text-sm text-gray-500">Member since {userStats.memberSince}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${getRankColor(getCurrentUserRank())}`}>
                  {getRankIcon(getCurrentUserRank())}
                </div>
                <div className="text-sm text-gray-500">Current Rank</div>
              </div>
            </div>
          </div>

         
         
        </>
      )}
    </div>
  );
}