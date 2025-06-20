import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
     
      <header className="flex justify-between items-center p-6 lg:px-12 lg:py-8">
        <div className="flex items-center gap-3">
         <div className="w-10 h-10 rounded-lg flex items-center justify-center">
            <Image src="/icon.svg" alt="KoffieBlik Logo" width={24} height={24} className="text-white" />
          </div>
          <span className="text-2xl font-bold text-amber-800">KoffieBlik</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login">
            <button className="px-6 py-2 text-amber-700 hover:text-amber-800 font-medium transition-colors">
              Login
            </button>
          </Link>
          <Link href="/register">
            <button className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium shadow-lg">
              Get Started
            </button>
          </Link>
        </div>
      </header>

      <section className="text-center px-6 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl lg:text-7xl font-bold text-amber-900 mb-6 leading-tight">
            Your Complete Coffee Shop
            <span className="block text-amber-700">Experience</span>
          </h1>
          <p className="text-xl lg:text-2xl text-amber-700 mb-12 max-w-3xl mx-auto leading-relaxed">
            Order your favourite coffee with ease, or manage your coffee shop operations 
            seamlessly.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link href="/pos">
              <button className="px-8 py-4 bg-amber-600 text-white rounded-full text-lg font-semibold hover:bg-amber-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
                Order Coffee ☕
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="px-8 py-4 border-2 border-amber-600 text-amber-700 rounded-full text-lg font-semibold hover:bg-amber-50 transition-all duration-300">
                For Coffee Shops
              </button>
            </Link>
          </div>

          {}
          
        </div>
      </section>

      
      
    </div>
  );
}