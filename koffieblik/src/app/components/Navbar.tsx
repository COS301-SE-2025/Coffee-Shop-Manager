'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTabs } from '@/constants/tabs';

export default function Navbar() {
  const [selectedTab, setSelectedTab] = useState('Dashboard');
  const [username, setUsername] = useState('Guest');
  const router = useRouter();

  // useEffect(() => {
  //   const storedUsername = localStorage.getItem('username');
  //   const isLoggedIn = localStorage.getItem('isLoggedIn');
  //   if (!isLoggedIn) router.push('/login');
  //   if (storedUsername) setUsername(storedUsername);
  // }, [router]);

  useEffect(() => {
    const routes = {
      Inventory: '/inventory',
      pos: '/pos',
      manage: '/manage',
      Reports: '/reports'
    };
    const target = routes[selectedTab as keyof typeof routes];
    if (target) router.push(target);
  }, [selectedTab, router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'Dashboard': return '📊';
      case 'Inventory': return '📦';
      case 'Reports': return '📈';
      case 'pos': return '🛒';
      case 'manage': return '⚙️';
      case 'Logout': return '🚪';
      default: return '👤';
    }
  };

  const tabs = username ? getTabs(username) : [];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-amber-200 shadow-lg">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">☕</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-amber-900">Coffee Shop Dashboard</h1>
              <p className="text-sm text-amber-600">Welcome back, {username}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-amber-700 font-medium">
              {new Date().toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-xs text-amber-600">
              {new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const isActive = selectedTab === tab;
            const isLogout = tab === 'Logout';

            return (
              <button
                key={tab}
                className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 transform hover:scale-105 ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-200'
                    : isLogout
                    ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200'
                    : 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-200'
                }`}
                onClick={() => {
                  if (tab === 'Logout') handleLogout();
                  else setSelectedTab(tab);
                }}
              >
                <span className="text-lg">{getTabIcon(tab)}</span>
                <span className="capitalize">{tab === 'pos' ? 'POS' : tab === 'manage' ? 'Manage' : tab}</span>
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
