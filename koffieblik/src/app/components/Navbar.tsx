"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState("Guest");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedRole = localStorage.getItem("role");

    if (storedUsername && storedUsername.trim() !== "") {
      setUsername(storedUsername);
    } else {
      setUsername("Guest");
    }

    if (storedRole && storedRole.trim() !== "") {
      setRole(storedRole);
    } else {
      setRole("Guest");
    }
  }, []);

  const [username, setUsername] = useState("Guest");
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername && storedUsername.trim() !== "") {
      setUsername(storedUsername);
    } else {
      setUsername("Guest");
    }
  }, []);

  const [selectedTab, setSelectedTab] = useState<string | null>(null);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  useEffect(() => {
    fetch(`${API_BASE_URL}/check-token`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        if (!data.valid) {
          router.push("/login");
        }
      })
      .catch(() => {
        router.push("/login");
      });
  }, []);

  useEffect(() => {
    const now = new Date();
    setDate(
      now.toLocaleDateString("en-ZA", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    );
    setTime(
      now.toLocaleTimeString("en-ZA", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok)
        throw new Error(`Server responded with status ${res.status}`);

      const result = await res.json();

      if (result.success) {
        localStorage.removeItem("username");
        console.log("Cookies and LocalStorage cleared successfully.");
        router.push("/login");
      } else {
        console.warn("⚠️ Logout failed:", result.message);
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case "Dashboard":
        return "📊";
      case "Inventory":
        return "📦";
      case "Reports":
        return "📈";
      case "pos":
        return "🛒";
      case "Order Here":
        return "🛒";
      case "manage":
        return "⚙️";
      case "Help":
        return "❓";
      case "Logout":
        return "🚪";
      default:
        return "👤";
    }
  };

  let tabs = [""];

  // Show only based on rol
  if (role === "user") {
    tabs = ["Dashboard", "Order Here", "Help", username, "Logout"];
  } else {
    tabs = ["Dashboard"];
  }

  if (role === "admin") {
    tabs = [
      "Dashboard",
      "Inventory",
      "Reports",
      "pos",
      "manage",
      username,
      "Logout",
    ];
  }

  // const handleTabNavigation = (tab: string) => {
  //   setSelectedTab(tab);

  //   switch (tab) {
  //     case 'Dashboard':
  //       if (role === 'user') {
  //         router.push('/userdashboard');
  //       } else {
  //         router.push('/dashboard');
  //       }
  //       break;
  //     case 'Inventory':
  //       router.push('/inventory');
  //       break;
  //     case 'Order Here':
  //       router.push('/userPOS');
  //       break;
  //     case 'Reports':
  //       router.push('/reports');
  //       break;
  //     case 'pos':
  //       router.push('/pos');
  //       break;
  //     case 'manage':
  //       router.push('/manage');
  //       break;
  //     case 'Help':
  //       router.push('/help');
  //       break;
  //     default:
  //       break;
  //   }
  // };

  return (
    <nav
      className="sticky top-0 z-50 border-b border-[var(--primary-1)]" style={{ backgroundColor: 'var(--primary-3)' }}
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
                style={{ color: 'var(--primary-2)' }}
              >
                Coffee Shop Dashboard
              </h1>
              <p
                className="text-sm"
                style={{ color: 'var(--primary-2)' }}
              >
                Welcome back, {username}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p
              className="text-sm font-medium"
              style={{ color: 'var(--primary-2)' }}
            >
              {date}
            </p>
            <p
              className="text-xs"
              style={{ color: 'var(--primary-2)' }}
            >
              {time}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {tabs.map((tab) => {
            const isActive = selectedTab === tab;
            const isLogout = tab === "Logout";

            const getHref = () => {
              if (role === "user") {
                switch (tab) {
                  case "Dashboard":
                    return "/userdashboard";
                  case "Order Here":
                    return "/userPOS";
                }
              }
              switch (tab) {
                case "Dashboard":
                  return "/dashboard";
                case "Inventory":
                  return "/inventory";
                case "Reports":
                  return "/reports";
                case "pos":
                  return "/pos";
                case "manage":
                  return "/manage";
                case "Help":
                  return "/help";
                default:
                  return "#";
              }
            };

            const baseClass = `flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 ${isActive
              ? 'bg-white/10 text-white'
              : 'text-[var(--primary-2)]'
              }`;

            if (isLogout) {
              return (
                <button
                  key={tab}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-red-600 hover:text-white hover:bg-red-500 transition-colors duration-200"
                  onClick={handleLogout}
                >
                  <span className="text-lg">{getTabIcon(tab)}</span>
                  <span className="capitalize">{tab}</span>
                </button>
              );
            }

            return (
              <a
                key={tab}
                href={getHref()}
                className={baseClass}
                onClick={() => setSelectedTab(tab)}
              >
                <span className="text-lg">{getTabIcon(tab)}</span>
                <span className="capitalize">
                  {tab === "pos" ? "POS" : tab === "manage" ? "Manage" : tab}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
