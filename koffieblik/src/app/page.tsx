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

      
      
    </div>
  );
}