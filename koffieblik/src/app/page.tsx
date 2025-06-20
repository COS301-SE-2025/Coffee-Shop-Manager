import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-500 via-yellow-100 to-amber-300">
     
      <header className="flex justify-between items-center p-6 lg:px-12 lg:py-8">
        <div className="flex items-center gap-3">
         <div className="w-10 h-10 rounded-lg flex items-center justify-center">
            <Image src="/icon.svg" alt="KoffieBlik Logo" width={24} height={24} className="text-white" />
          </div>
          <span className="text-2xl font-bold text-stone-800">KoffieBlik</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login">
            <button className="px-6 py-2 text-stone-700 hover:text-stone-800 font-medium transition-colors">
              Login
            </button>
          </Link>
          <Link href="/register">
            <button className="px-6 py-2 bg-stone-600 text-white rounded-lg hover:bg-stone-800 transition-colors font-medium shadow-lg">
              Get Started
            </button>
          </Link>
        </div>
      </header>

      <section className="text-center px-6 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl lg:text-7xl font-bold text-stone-800 mb-6 leading-tight">
            Your Complete Coffee Shop
            <span className="block text-stone-700">Experience</span>
          </h1>
          <p className="text-xl lg:text-2xl text-stone-700 mb-12 max-w-3xl mx-auto leading-relaxed">
            Order your favourite coffee with ease, or manage your coffee shop operations 
            seamlessly.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link href="/pos">
              <button className="px-8 py-4 bg-stone-600 text-white rounded-full text-lg font-semibold hover:bg-stone-800 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
                Order Coffee ☕
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="px-8 py-4 border-2 border-stone-600 text-stone-700 rounded-full text-lg font-semibold hover:bg-amber-100 transition-all duration-300">
                For Coffee Shops
              </button>
            </Link>
          </div>

          {}
          
        </div>
      </section>

      {}
      <section className="py-20 px-6 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          
          {/* For Customers */}
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">For Coffee Lovers</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
              
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group hover:transform hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:shadow-xl">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Browse Menu</h3>
                <p className="text-gray-600 leading-relaxed">
                  Explore menu items with detailed descriptions
                </p>
              </div>

              <div className="text-center group hover:transform hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:shadow-xl">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Quick Ordering</h3>
                <p className="text-gray-600 leading-relaxed">
                  Place orders ahead of time and skip the queue
                </p>
              </div>

              <div className="text-center group hover:transform hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:shadow-xl">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Order Tracking</h3>
                <p className="text-gray-600 leading-relaxed">
                  Get real-time updates on your order status
                </p>
              </div>
            </div>
          </div>

          {/*  Coffee Shops */}
          <div className="text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">For Coffee Shop Teams</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
              
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group hover:transform hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:shadow-xl">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Order Management</h3>
                <p className="text-gray-600 leading-relaxed">
                  Baristas can view, update, and complete orders in real-time
                </p>
              </div>

              <div className="text-center group hover:transform hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:shadow-xl">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Staff Coordination</h3>
                <p className="text-gray-600 leading-relaxed">
                  Managers can schedule staff, track performance, and coordinate shifts
                </p>
              </div>

              <div className="text-center group hover:transform hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:shadow-xl">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Business Analytics</h3>
                <p className="text-gray-600 leading-relaxed">
                  Track sales, inventory, and performance with detailed insights
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      

      {/* Footer */}
      <footer className="py-8 px-6 bg-stone-900 text-stone-100">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
             <Image src="/icon.svg" alt="KoffieBlik Logo" width={24} height={24} className="text-white" />
            </div>
            <span className="text-xl font-bold">KoffieBlik</span>
          </div>
          
        </div>
      </footer>

      
      
    </div>
  );
}