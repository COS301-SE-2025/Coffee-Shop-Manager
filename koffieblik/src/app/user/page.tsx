"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import firstBadge from "../badges/first.png";
import threeDayBadge from "../badges/first.png";
import sevenDayBadge from "../badges/first.png";




export default function UserPage() {
  const [username, setUsername] = useState("Guest");
  const [userStats, setUserStats] = useState({
    totalOrders: 1,
    currentStreak: 0,
    favoritedrink: "None",
    memberSince: "2025"
  });

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

 
  const badges = [
    { id: 1, name: "First Sip", description: "Made your first order", earned: true, color: "bg-yellow-500", image: firstBadge },
    { id: 2, name: "Coffee Lover", description: "Ordered 5 coffees", earned: true, color: "bg-blue-500" },
    { id: 3, name: "Regular", description: "Ordered 10 coffees", earned: false, color: "bg-gray-400" },
    { id: 4, name: "Daily Grind", description: "3 day streak", earned: true, color: "bg-green-500", image: threeDayBadge },
    { id: 5, name: "Weekly Warrior", description: "7 day streak", earned: false, color: "bg-purple-500", image: sevenDayBadge },
  ];

  return (
    <div className="space-y-6">
      {/* User Info Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-2xl text-white">👤</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{username}</h2>
            
            <p className="text-sm text-gray-500">Member since {userStats.memberSince}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
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
          <div className="text-gray-600">Favorite Drink</div>
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
                  <span className="text-white text-xl">🏆</span>
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

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200">
            <span className="text-2xl mr-3"></span>
            <span className="font-medium text-blue-700">Order Coffee</span>
          </button>
          
          <button className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200">
            <span className="text-2xl mr-3"></span>
            <span className="font-medium text-green-700">View History</span>
          </button>
        </div>
      </div>
    </div>
  );
}