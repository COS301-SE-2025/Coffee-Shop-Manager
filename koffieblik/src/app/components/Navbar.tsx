'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getTabs } from '@/constants/tabs';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState('Guest');

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedRole = localStorage.getItem('role');

    if (storedUsername && storedUsername.trim() !== '') {
      setUsername(storedUsername);
    } else {
      setUsername('Guest');
    }

    if (storedRole && storedRole.trim() !== '') {
      setRole(storedRole);
    } else {
      setRole('Guest');
    }
  }, []);



  const [username, setUsername] = useState('Guest');
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername && storedUsername.trim() !== '') {
      setUsername(storedUsername);
    } else {
      setUsername('Guest');
    }
  }, []);

  const [selectedTab, setSelectedTab] = useState<string | null>(null);

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/check-token', {
      credentials: 'include',
    })
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then(data => {
        if (!data.valid) {
          router.push('/login');
        }
      })
      .catch(() => {
        router.push('/login');
      });
  }, []);


  useEffect(() => {
    const now = new Date();
    setDate(
      now.toLocaleDateString('en-ZA', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    );
    setTime(
      now.toLocaleTimeString('en-ZA', {
        hour: '2-digit',
        minute: '2-digit'
      })
    );
  }, []);


  useEffect(() => {
    const routeMap: Record<string, string> = {
      '/dashboard': 'Dashboard',
      '/inventory': 'Inventory',
      '/pos': 'pos',
      '/manage': 'manage',
      '/reports': 'Reports',
      '/help': 'Help'
    };
    const current = routeMap[pathname] || null;
    setSelectedTab(current);
  }, [pathname]);


  useEffect(() => {
    if (!selectedTab) return;

    const routes = {
      Dashboard: '/dashboard',
      Inventory: '/inventory',
      pos: '/pos',
      manage: '/manage',
      Reports: '/reports',
      Help: '/help'
    };

    const target = routes[selectedTab as keyof typeof routes];
    if (target && pathname !== target) router.push(target);
  }, [selectedTab, router, pathname]);

  const handleLogout = async () => {
    try {
      const res = await fetch('http://localhost:5000/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) throw new Error(`Server responded with status ${res.status}`);

      const result = await res.json();

      if (result.success) {

        localStorage.removeItem('username');
        console.log('Cookies and LocalStorage cleared successfully.');
        router.push('/login');
      } else {
        console.warn('⚠️ Logout failed:', result.message);
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };




  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'Dashboard': return '📊';
      case 'Inventory': return '📦';
      case 'Reports': return '📈';
      case 'pos': return '🛒';
      case 'manage': return '⚙️';
      case 'Help': return '❓';
      case 'Logout': return '🚪';
      default: return '👤';
    }
  };

  // Load and modify tabs
  let tabs = username ? getTabs(username) : [];

  // Show only based on rol
  if (role === 'user') {
    tabs = tabs.filter(tab => tab === 'Dashboard' || tab === 'pos' || tab === 'Logout');
  }

  if (!tabs.includes('Dashboard')) {
    tabs.unshift('Dashboard');
  }

  if (!tabs.includes('Help') && tabs.includes('manage')) {
    const manageIndex = tabs.indexOf('manage');
    tabs.splice(manageIndex + 1, 0, 'Help');
  }

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-sm border-b shadow-lg"
      style={{
        backgroundColor: 'var(--primary-4)',
        borderColor: 'var(--primary-3)',
      }}
    >


      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--primary-2)' }}
            >
              <span className="text-white font-bold text-lg">☕</span>
            </div>

            <div>
              <h1
                className="text-xl font-bold"
                style={{ color: 'var(--primary-1)' }}
              >
                Coffee Shop Dashboard
              </h1>
              <p
                className="text-sm"
                style={{ color: 'var(--primary-3)' }}
              >
                Welcome back, {username}
              </p>
            </div>

          </div>
          <div className="text-right">
            <p
              className="text-sm font-medium"
              style={{ color: 'var(--primary-1)' }}
            >
              {date}
            </p>
            <p
              className="text-xs"
              style={{ color: 'var(--primary-1)' }}
            >
              {time}
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
                className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 transform hover:scale-105 ${isLogout ? 'border' : 'border'
                  }`}
                style={
                  isActive
                    ? {
                      backgroundColor: 'var(--primary-3)',
                      color: 'var(--primary-2)',
                      borderColor: 'var(--primary-3)',
                    }
                    : isLogout
                      ? {
                        backgroundColor: '#fee2e2',
                        color: '#b91c1c',
                        borderColor: '#fecaca',
                      }
                      : {
                        backgroundColor: 'var(--primary-4)',
                        color: 'var(--primary-3)',
                        borderColor: 'var(--primary-1)',
                      }
                }
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
