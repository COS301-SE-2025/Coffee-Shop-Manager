"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Import your actual background and loading components
import CoffeeBackground from "assets/coffee-background";
import CoffeeLoading from "assets/loading";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigation = (path: string) => {
    setIsLoading(true);
    // Simulate navigation - replace with actual router.push(path) in your Next.js app
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-amber-50/95 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 lg:py-6">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-amber-700 flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z"/>
                </svg>
              </div>
              <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-stone-800">
                DieKoffieBlik
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden sm:flex gap-3 lg:gap-4">
              <button
                onClick={() => handleNavigation('/login')}
                className="px-4 py-2 lg:px-6 font-medium border-2 border-amber-700 text-amber-700 rounded-full hover:bg-amber-700 hover:text-white transform hover:-translate-y-0.5 transition-all duration-300"
              >
                Login
              </button>
              <button
                onClick={() => handleNavigation('/signup')}
                className="px-4 py-2 lg:px-6 rounded-full font-medium bg-amber-700 text-amber-50 shadow-lg hover:bg-amber-800 transform hover:-translate-y-0.5 transition-all duration-300"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 text-stone-800"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="sm:hidden pb-4 space-y-2">
              <button
                onClick={() => handleNavigation('/login')}
                className="w-full px-4 py-3 font-medium border-2 border-amber-700 text-amber-700 rounded-lg hover:bg-amber-700 hover:text-white transition-all duration-300"
              >
                Login
              </button>
              <button
                onClick={() => handleNavigation('/signup')}
                className="w-full px-4 py-3 rounded-lg font-medium bg-amber-700 text-amber-50 shadow-lg hover:bg-amber-800 transition-all duration-300"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight text-stone-800">
            Your Complete Coffee Shop
            <span className="block mt-2">Experience</span>
          </h1>

          <p className="text-lg sm:text-xl lg:text-2xl mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed text-stone-700 px-4">
            Order your favourite coffee with ease, or manage your coffee shop operations seamlessly.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 z-0">
          <CoffeeBackground />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto">
          {/* For Customers */}
          <div className="mb-16 sm:mb-20 lg:mb-24">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">
                For Coffee Lovers
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mx-auto mb-4 sm:mb-6 flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3 text-center">
                  Browse Menu
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed text-center">
                  Explore menu items with detailed descriptions
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mx-auto mb-4 sm:mb-6 flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3 text-center">
                  Quick Ordering
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed text-center">
                  Place orders ahead of time and skip the queue
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 sm:col-span-2 lg:col-span-1">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mx-auto mb-4 sm:mb-6 flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3 text-center">
                  Order Tracking
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed text-center">
                  Get real-time updates on your order status
                </p>
              </div>
            </div>
          </div>

          {/* For Coffee Shops */}
          <div>
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">
                For Coffee Shop Teams
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mx-auto mb-4 sm:mb-6 flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3 text-center">
                  Order Management
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed text-center">
                  Baristas can view, update, and complete orders in real-time
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mx-auto mb-4 sm:mb-6 flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3 text-center">
                  Staff Coordination
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed text-center">
                  Managers can schedule staff, track performance, and coordinate shifts
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 sm:col-span-2 lg:col-span-1">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl mx-auto mb-4 sm:mb-6 flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3 text-center">
                  Business Analytics
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed text-center">
                  Track sales, inventory, and performance with detailed insights
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile App Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-stone-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 sm:mb-6">
            Get Our Mobile App
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 px-4">
            Experience DieKoffieBlik on the go! Download our Android app for a seamless mobile experience.
          </p>
          
          <a
            href="/app_apk/app-release.apk"
            download="DieKoffieBlik.apk"
            className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm sm:text-base"
          >
            <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.6,9.48l1.84-3.18c0.16-0.31,0.04-0.69-0.26-0.85c-0.29-0.15-0.65-0.06-0.83,0.22l-1.88,3.24 c-2.86-1.21-6.08-1.21-8.94,0L5.65,5.67c-0.19-0.29-0.58-0.38-0.87-0.2C4.5,5.65,4.41,6.01,4.56,6.3L6.4,9.48 C3.3,11.25,1.28,14.44,1,18h22C22.72,14.44,20.7,11.25,17.6,9.48z M7,15.25c-0.69,0-1.25-0.56-1.25-1.25 c0-0.69,0.56-1.25,1.25-1.25S8.25,13.31,8.25,14C8.25,14.69,7.69,15.25,7,15.25z M17,15.25c-0.69,0-1.25-0.56-1.25-1.25 c0-0.69,0.56-1.25,1.25-1.25s1.25,0.56,1.25,1.25C18.25,14.69,17.69,15.25,17,15.25z"/>
            </svg>
            <span>Download for Android</span>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 sm:py-8 px-4 sm:px-6 bg-stone-900 text-stone-100">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-amber-700 flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z"/>
              </svg>
            </div>
            <span className="text-lg sm:text-xl font-bold">DieKoffieBlik</span>
          </div>
          <p className="text-xs sm:text-sm text-stone-400">© 2025 All rights reserved</p>
        </div>
      </footer>

      <CoffeeLoading visible={isLoading} />
    </div>
  );
}