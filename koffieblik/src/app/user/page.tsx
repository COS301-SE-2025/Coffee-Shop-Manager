"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import firstBadge from "../badges/first.png";
import threeDayBadge from "../badges/3dayStreak.png";
import sevenDayBadge from "../badges/7dayStreak.png";
import fiveOrdersBadge from "../badges/5orders.png";
import tenOrdersBadge from "../badges/10orders.png";
import yearAccount from "../badges/year_account.png"
import week_month_account from "../badges/week_account.png"

//api url
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface LeaderboardUser {
  user_id: string;
  total_orders: number;
  current_streak?: number;
  favorite_drink?: string;
  rank?: number;
  id: string;
  username: string;
  totalOrders: number;
  currentStreak: number;
  favoritedrink: string;
}

export default function UserPage() {
  const [username, setUsername] = useState("Guest");
  const [userStats, setUserStats] = useState({
    totalOrders: 0,
    currentStreak: 0,
    favoritedrink: "None",
    memberSince: "2025"
  });
  const [activeTab, setActiveTab] = useState("profile");
  const [isClient, setIsClient] = useState(false);

  // User stats loading state
  const [statsLoading, setStatsLoading] = useState(false);

  // Badges state
  const [userBadges, setUserBadges] = useState<string[]>([]);
  const [badgesLoading, setBadgesLoading] = useState(false);

  // Favorite drink state
  const [favoriteDrink, setFavoriteDrink] = useState("None");

  // Real leaderboard data from API
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);

  const [leaderboardFilter, setLeaderboardFilter] = useState("orders");

  useEffect(() => {
    // Set client flag to true once component mounts on client
    setIsClient(true);
    
    // Only access localStorage in the browser
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }

    // Fetch user stats and badges on mount
    fetchUserStats();
    fetchUserBadges();
    fetchFavoriteDrink();
  }, []);

  // Fetch user stats from API
  const fetchUserStats = async () => {
    setStatsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/user/stats`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success && data.stats) {
        // Calculate member since year from account age
        const currentDate = new Date();
        const accountCreationDate = new Date();
        accountCreationDate.setDate(currentDate.getDate() - data.stats.account_age_days);
        const memberSinceYear = accountCreationDate.getFullYear();

        setUserStats({
          totalOrders: data.stats.total_orders,
          currentStreak: data.stats.current_streak,
          favoritedrink: "", // api gaan fill
          memberSince: memberSinceYear.toString()
        });
      } else {
        console.warn(" Failed to fetch user stats:", data.error || "Unknown error");
      }
    } catch (error: any) {
      console.error(" Error fetching user stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch user badges from API
  const fetchUserBadges = async () => {
    setBadgesLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/user/badges`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success && data.badges) {
        setUserBadges(data.badges);
      } else {
        console.warn("Failed to fetch user badges:", data.error || "Unknown error");
        setUserBadges([]);
      }
    } catch (error: any) {
      console.error("Error fetching user badges:", error);
      setUserBadges([]);
    } finally {
      setBadgesLoading(false);
    }
  };

  // Fetch favorite drink from orders API
  const fetchFavoriteDrink = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/order`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.sucess && data.orders) {
        // Calculate most frequent drink
        const drinkCounts: { [key: string]: number } = {};
        
        data.orders.forEach((order: any) => {
          order.order_products.forEach((orderProduct: any) => {
            const drinkName = orderProduct.products.name;
            drinkCounts[drinkName] = (drinkCounts[drinkName] || 0) + orderProduct.quantity;
          });
        });

        // Find most frequent drink
        let maxCount = 0;
        let mostFrequentDrink = "None";
        
        Object.entries(drinkCounts).forEach(([drink, count]) => {
          if (count > maxCount) {
            maxCount = count;
            mostFrequentDrink = drink;
          }
        });

        setFavoriteDrink(mostFrequentDrink);
      } else {
        console.warn("Failed to fetch orders for favorite drink:", data.error || "Unknown error");
        setFavoriteDrink("None");
      }
    } catch (error: any) {
      console.error("Error fetching favorite drink:", error);
      setFavoriteDrink("None");
    }
  };

  // Fetch leaderboard data from API
  const fetchLeaderboard = async () => {
    setLeaderboardLoading(true);
    setLeaderboardError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/leaderboard`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        if (data.success && data.leaderboard) {
          // Add rank to each user and map to expected format
          const leaderboardWithRank = data.leaderboard.map((user: any, index: number) => ({
            user_id: user.user_id,
            total_orders: user.total_orders,
            current_streak: user.current_streak || 0,
            favorite_drink: user.favorite_drink || "Unknown",
            // Mapped properties for easier access
            id: user.user_id,
            username: user.user_id.substring(0, 8), // Use first 8 chars of user_id as display name
            totalOrders: user.total_orders,
            currentStreak: user.current_streak || 0,
            favoritedrink: user.favorite_drink || "Unknown",
            rank: index + 1
          }));
          
          setLeaderboard(leaderboardWithRank);
        } else {
          throw new Error(data.error || "Failed to fetch leaderboard");
        }
      } else {
        console.warn(" Failed to fetch leaderboard:", data.error || "Unknown error");
        setLeaderboardError(data.error || "Failed to load leaderboard");
        setLeaderboard([]);
      }
    } catch (error: any) {
      console.error(" Network or server error:", error);
      setLeaderboardError(error.message || "Failed to load leaderboard");
      setLeaderboard([]);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  // Fetch leaderboard when component mounts or when switching to leaderboard tab
  useEffect(() => {
    if (activeTab === "leaderboard") {
      fetchLeaderboard();
    }
  }, [activeTab]);

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
    if (!isClient) return 0;
    
    // If user not in leaderboard, calculate based on their stats
    const usersAbove = sortedLeaderboard.filter(user => 
      leaderboardFilter === "orders" ? user.totalOrders > userStats.totalOrders : user.currentStreak > userStats.currentStreak
    );
    return usersAbove.length + 1;
  };

  // Define all available badges with their API keys
  const allBadges = [
    { 
      id: 1, 
      apiKey: "first_order",
      name: "First Sip", 
      description: "Placed your first order", 
      color: "bg-yellow-500", 
      image: firstBadge 
    },
    { 
      id: 2, 
      apiKey: "5_orders",
      name: "Coffee Lover", 
      description: "Ordered 5 coffees", 
      color: "bg-blue-500", 
      image: fiveOrdersBadge 
    },
    { 
      id: 3, 
      apiKey: "10_orders",
      name: "Regular", 
      description: "Ordered 10 coffees", 
      color: "bg-gray-400", 
      image: tenOrdersBadge 
    },
    { 
      id: 4, 
      apiKey: "3_day_streak",
      name: "Daily", 
      description: "3 day streak", 
      color: "bg-green-500", 
      image: threeDayBadge 
    },
    { 
      id: 5, 
      apiKey: "7_day_streak",
      name: "Weekly", 
      description: "7 day streak", 
      color: "bg-purple-500", 
      image: sevenDayBadge 
    },
    { 
      id: 6, 
      apiKey: "week_member",
      name: "Week Member", 
      description: "Member for a week", 
      color: "bg-emerald-100" ,
      image: week_month_account 
    },
    { 
      id: 7, 
      apiKey: "month_member",
      name: "Month Member", 
      color: "bg-emerald-100",
      description: "Member for a month", 
      
      image: week_month_account
    },
    

    {
      id: 8, 
      apiKey: "year_member",
      name: "Year Member", 
      description: "Member for a year", 
      color: "bg-pink-500", 
      image: yearAccount

    }
  ];

  // Create badges array with earned status from API
  const badges = allBadges.map(badge => ({
    ...badge,
    earned: userBadges.includes(badge.apiKey)
  }));

  const getRankIcon = (rank: number): string => {
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
                ? "text-brown-700 border-b-2 border-brown-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            My Profile
          </button>
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`flex-1 py-4 px-6 text-center font-medium ${
              activeTab === "leaderboard"
                ? "text-brown-700 border-b-2 border-brown-700"
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
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              {statsLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-20 mx-auto"></div>
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {userStats.totalOrders}
                  </div>
                  <div className="text-gray-600">Total Orders</div>
                </>
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              {statsLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-24 mx-auto"></div>
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {userStats.currentStreak}
                  </div>
                  <div className="text-gray-600">Current Streak</div>
                </>
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-lg font-bold text-purple-600 mb-2">
                {favoriteDrink}
              </div>
              <div className="text-gray-600">Favourite Drink</div>
            </div>
          </div>

          {/* Badges Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">My Badges</h3>
              {badgesLoading && (
                <div className="text-sm text-gray-500">Loading badges...</div>
              )}
              {!badgesLoading && (
                <button
                  onClick={fetchUserBadges}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Refresh
                </button>
              )}
            </div>
            
            {badgesLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="p-4 rounded-lg bg-gray-100 animate-pulse">
                    <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded mb-1"></div>
                    <div className="h-3 bg-gray-300 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-lg text-center transition-all duration-200 ${
                      badge.earned
                        ? "bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 shadow-sm hover:shadow-md"
                        : "bg-gray-100 opacity-60"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full ${badge.color} mx-auto mb-2 flex items-center justify-center ${
                        badge.earned ? "shadow-sm" : "grayscale"
                      }`}
                    >
                      {badge.image ? (
                        <Image 
                          src={badge.image} 
                          alt={badge.name}
                          width={32}
                          height={32}
                          className={`object-contain ${!badge.earned ? "grayscale opacity-50" : ""}`}
                        />
                      ) : (
                        <span className="text-white text-xl">🏆</span>
                      )}
                    </div>
                    <div className={`font-medium text-sm mb-1 ${
                      badge.earned ? "text-gray-900" : "text-gray-500"
                    }`}>
                      {badge.name}
                    </div>
                    <div className={`text-xs ${
                      badge.earned ? "text-gray-600" : "text-gray-400"
                    }`}>
                      {badge.description}
                    </div>
                    {badge.earned && (
                      <div className="mt-2">
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            
          </div>
        </>
      )}

      {activeTab === "leaderboard" && (
        <>
          {/* Your Position */}
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

          {/* Leaderboard */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  Top Users
                </h3>
                {leaderboardLoading && (
                  <div className="text-sm text-gray-500">Loading...</div>
                )}
                {!leaderboardLoading && leaderboard.length > 0 && (
                  <button
                    onClick={fetchLeaderboard}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Refresh
                  </button>
                )}
              </div>
            </div>
            
            {leaderboardError && (
              <div className="p-6 text-center">
                <div className="text-red-600 mb-2">Error loading leaderboard</div>
                <div className="text-sm text-gray-500 mb-4">{leaderboardError}</div>
                <button
                  onClick={fetchLeaderboard}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            )}

            {leaderboardLoading && (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <div className="mt-2 text-gray-500">Loading leaderboard...</div>
              </div>
            )}

            {!leaderboardLoading && !leaderboardError && leaderboard.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                No leaderboard data available
              </div>
            )}

            {!leaderboardLoading && !leaderboardError && leaderboard.length > 0 && (
              <div className="divide-y">
                {sortedLeaderboard.slice(0, 10).map((user, index) => {
                  // Only check current user after client hydration
                  const currentUserId = isClient 
                    ? (localStorage.getItem("userId") || localStorage.getItem("user_id"))
                    : null;
                  const isCurrentUser = user.user_id === currentUserId;
                  const displayRank = index + 1;
                  
                  return (
                    <div
                      key={user.user_id}
                      className={`p-4 flex items-center justify-between hover:bg-gray-50 ${
                        isCurrentUser ? "bg-blue-50 border-l-4 border-blue-500" : ""
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`text-xl font-bold ${getRankColor(displayRank)} min-w-[3rem]`}>
                          {getRankIcon(displayRank)}
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {user.username}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                You
                              </span>
                            )}
                          </div>
                          
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">
                          {leaderboardFilter === "orders" ? user.totalOrders : user.currentStreak}
                        </div>
                        <div className="text-xs text-gray-500">
                          {leaderboardFilter === "orders" ? "orders" : "day streak"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}