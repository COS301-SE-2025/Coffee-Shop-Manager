"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CoffeeBackground from "assets/coffee-background";
import CoffeeLoading from "assets/loading";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleNavigation = (path: string) => {
    setIsLoading(true);
    router.push(path);
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--primary-4)" }}
    >
      <header className="flex justify-between items-center p-6 lg:px-12 lg:py-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center">
            <Image
              src="/icon.svg"
              alt="KoffieBlik Logo"
              width={24}
              height={24}
              className="text-white"
            />
          </div>
          <span className="text-3xl font-bold text-stone-800">
            DieKoffieBlik
          </span>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => handleNavigation('/login')}
            className="px-6 py-2 font-medium border-2 rounded-full transform hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            style={{
              color: "var(--primary-3)",
              borderColor: "var(--primary-3)",
            }}
          >
            Login
          </button>

          <button
            onClick={() => handleNavigation('/signup')}
            className="px-6 py-2 rounded-lg font-medium shadow-lg transform hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            style={{
              backgroundColor: "var(--primary-3)",
              color: "var(--primary-2)",
            }}
          >
            Get Started
          </button>
        </div>
      </header>

      <section className="text-center px-6 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto">
          <h1
            className="text-5xl lg:text-7xl font-bold mb-6 leading-tight"
            style={{ color: "var(--primary-1)" }}
          >
            Your Complete Coffee Shop
            <span className="block" style={{ color: "var(--primary-1)" }}>
              Experience
            </span>
          </h1>

          <p
            className="text-xl lg:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed"
            style={{ color: "var(--primary-1)" }}
          >
            Order your favourite coffee with ease, or manage your coffee shop
            operations seamlessly.
          </p>

          {/* <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link href="/pos">
              <button
                className="px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                style={{
                  backgroundColor: 'var(--primary-3)',
                  color: 'var(--primary-2)',
                }}
              >
                Order Coffee ☕
              </button>


            </Link>
            <Link href="/dashboard">
              <button
                className="px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 border-2 transform hover:-translate-y-1"
                style={{
                  backgroundColor: 'var(--primary-4)',
                  color: 'var(--primary-3)',
                  borderColor: 'var(--primary-3)',
                }}
              >
                For Coffee Shops
              </button>


            </Link>
          </div> */}

          {}
        </div>
      </section>

      {}
      <section className="relative py-20 px-6">
        <div className="absolute inset-0 z-0">
          <CoffeeBackground />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto">
          {/* For Customers */}
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              For Coffee Lovers
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12"></p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group hover:transform hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:shadow-xl">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  Browse Menu
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Explore menu items with detailed descriptions
                </p>
              </div>

              <div className="text-center group hover:transform hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:shadow-xl">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  Quick Ordering
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Place orders ahead of time and skip the queue
                </p>
              </div>

              <div className="text-center group hover:transform hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:shadow-xl">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  Order Tracking
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Get real-time updates on your order status
                </p>
              </div>
            </div>
          </div>

          {/*  Coffee Shops */}
          <div className="text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              For Coffee Shop Teams
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12"></p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group hover:transform hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:shadow-xl">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  Order Management
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Baristas can view, update, and complete orders in real-time
                </p>
              </div>

              <div className="text-center group hover:transform hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:shadow-xl">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  Staff Coordination
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Managers can schedule staff, track performance, and coordinate
                  shifts
                </p>
              </div>

              <div className="text-center group hover:transform hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:shadow-xl">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  Business Analytics
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Track sales, inventory, and performance with detailed insights
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-stone-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-6">
            Get Our Mobile App
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Experience DieKoffieBlik on the go! Download our Android app for a seamless mobile experience.
          </p>
          
          <div className="flex justify-center items-center gap-6">
            <a
              href="/app-release.apk"
              download="DieKoffieBlik.apk"
              className="flex items-center gap-3 px-8 py-4 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <svg
                className="w-8 h-8"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.6,9.48l1.84-3.18c0.16-0.31,0.04-0.69-0.26-0.85c-0.29-0.15-0.65-0.06-0.83,0.22l-1.88,3.24 c-2.86-1.21-6.08-1.21-8.94,0L5.65,5.67c-0.19-0.29-0.58-0.38-0.87-0.2C4.5,5.65,4.41,6.01,4.56,6.3L6.4,9.48 C3.3,11.25,1.28,14.44,1,18h22C22.72,14.44,20.7,11.25,17.6,9.48z M7,15.25c-0.69,0-1.25-0.56-1.25-1.25 c0-0.69,0.56-1.25,1.25-1.25S8.25,13.31,8.25,14C8.25,14.69,7.69,15.25,7,15.25z M17,15.25c-0.69,0-1.25-0.56-1.25-1.25 c0-0.69,0.56-1.25,1.25-1.25s1.25,0.56,1.25,1.25C18.25,14.69,17.69,15.25,17,15.25z"/>
              </svg>
              Download for Android
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-stone-900 text-stone-100">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <Image
                src="/icon.svg"
                alt="KoffieBlik Logo"
                width={24}
                height={24}
                className="text-white"
              />
            </div>
            <span className="text-xl font-bold">DieKoffieBlik</span>
          </div>
        </div>
      </footer>

      <CoffeeLoading visible={isLoading} />
    </div>
  );
}