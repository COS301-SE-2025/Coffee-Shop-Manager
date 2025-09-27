"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { FaChartBar, FaShoppingCart, FaUser, FaSignOutAlt, FaQuestionCircle, FaBoxOpen, FaChartLine, FaCog } from "react-icons/fa";
import CoffeeLoading from "assets/loading";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState("Guest");
  const [isLoading, setIsLoading] = useState(false);

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

  const handleNavigation = (href: string) => {
    setIsLoading(true);
    router.push(href);
  };

  const handleLogout = async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case "Dashboard":
        return <FaChartBar />;
      case "Inventory":
        return <FaBoxOpen />;
      case "Reports":
        return <FaChartLine />;
      case "pos":
      case "Order Here":
        return <FaShoppingCart />;
      case "manage":
        return <FaCog />;
      case "Help":
        return <FaQuestionCircle />;
      case "Logout":
        return <FaSignOutAlt />;
      default:
        return <FaUser />;
    }
  };

  let tabs = [""];

  // Show only based on role
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

  return (
    <>
      <nav className="sticky top-0 z-50">
        {/* Reduced all padding */}
        <div className="px-2 py-2"> {/* Changed from px-4 */}
          <div 
            className="rounded-xl shadow-sm border border-[var(--primary-1)]"
            style={{ backgroundColor: "var(--primary-3)" }}
          >
            {/* Reduced inner padding */}
            <div className="px-3 py-3"> {/* Changed from px-4 */}
              {/* Content container */}
              <div className="flex items-center justify-between mb-3"> {/* Changed mb-4 to mb-3 */}
                <div className="flex items-center gap-3">
                  {/* <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: "var(--primary-2)" }}
                  >
                    <span className="text-white font-bold text-lg">☕</span>
                  </div> */}

                  <div>
                    <h1
                      className="text-2xl md:text-3xl"
                      style={{ color: "var(--primary-2)" }}
                    >
                      Coffee Shop Dashboard
                    </h1>
                    <p className="text-sm" style={{ color: "var(--primary-2)", marginLeft: "2em", }}>
                      Welcome back, {username}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--primary-2)" }}
                  >
                    {date}
                  </p>
                  <p className="text-xs" style={{ color: "var(--primary-2)" }}>
                    {time}
                  </p>
                </div>
              </div>

              {/* Updated tabs section with better highlighting */}
              <div className="flex flex-wrap gap-2"> {/* Reduced gap from 3 to 2 */}
                {tabs.map((tab) => {
                  const isActive = pathname.includes(tab.toLowerCase()) || 
                                 (tab === "Dashboard" && pathname === "/") ||
                                 (tab === selectedTab);
                  const isLogout = tab === "Logout";
                  const isUsername = tab === username;

                  const baseClass = `
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium 
                    transition-all duration-200
                    ${isActive 
                      ? "bg-[var(--primary-2)]/15 text-[var(--primary-2)] font-semibold shadow-sm" // More subtle highlighting
                      : "hover:bg-[var(--primary-2)]/10 text-[var(--primary-2)]"
                    }
                  `;

                  // Update the logout button styling to match
                  if (isLogout) {
                    return (
                      <button
                        key={tab}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                                   text-red-600 hover:bg-red-100 
                                   transition-all duration-200 shadow-sm"
                        onClick={handleLogout}
                      >
                        <span className="text-lg">{getTabIcon(tab)}</span>
                        <span className="capitalize">{tab}</span>
                      </button>
                    );
                  }

                  const usernameClass = isUsername 
                    ? `${baseClass} hover:bg-[var(--primary-2)]/10 cursor-pointer`
                    : baseClass;

                  function getUserHref(): string {
                    switch (tab) {
                    case "Dashboard":
                      if (role == "admin" || role == "barista"){
                        return "/dashboard";
                      } else {
                        return "/userdashboard";
                      }
                    case "Inventory":
                      return "/inventory";
                    case "Reports":
                      return "/reports";
                    case "Order Here":
                      if (role == "admin" || role == "barista"){
                        return "/pos";
                      } else {
                        return "/userPOS";
                      }
                    case "pos":
                      return "/pos";
                    case "manage":
                      return "/manage";
                    case "Help":
                      return "/help";
                    case username:
                      return "/user";
                    default:
                      return "/";
                    }
                  }

                  return (
                    <a
                      key={tab}
                      href={getUserHref()}
                      className={usernameClass}
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedTab(tab);
                        handleNavigation(getUserHref());
                      }}
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
          </div>
        </div>
      </nav>
      <CoffeeLoading visible={isLoading} />
    </>
  );
}