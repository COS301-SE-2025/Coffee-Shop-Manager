import HydrationFix from '../hydrationFix';
import { Comfortaa } from 'next/font/google';
import Link from 'next/link';

const comfortaa = Comfortaa({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

export const metadata = {
  title: 'Register',
  description: 'Register to DieKoffieBlik coffee shop management system',
}

export default function LoginPage() {
  return (
    <HydrationFix>
      <main className={`h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 p-4 ${comfortaa.className}`}>
        <div className="w-full max-w-md p-8 bg-white dark:bg-[#1a1310] rounded-xl shadow-lg border border-amber-200 relative">
          
          {/* Coffee cup icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-brown-700 flex items-center justify-center shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-white">
                <path d="M2 21h18v-2H2v2zm6-4h10c2.21 0 4-1.79 4-4v-3c0-2.21-1.79-4-4-4H8v14h4v-3zm10-10c1.1 0 2 .9 2 2v3c0 1.1-.9 2-2 2H10V7h8z" />
              </svg>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-center mb-1 text-brown-800 dark:text-amber-100">DieKoffieBlik</h2>
          <p className="text-center mb-6 text-amber-800 dark:text-amber-300 font-medium">Portal</p>
          
          <form className="space-y-5">
            <div className="relative">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-amber-100 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-amber-200 dark:border-amber-900 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-brown-800 dark:text-amber-100 placeholder:text-amber-400 dark:placeholder:text-amber-700 focus:outline-none focus:ring-2 focus:ring-brown-700"
              />
            </div>

            <div className="relative">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-amber-100 mb-1">
                Email again
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-amber-200 dark:border-amber-900 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-brown-800 dark:text-amber-100 placeholder:text-amber-400 dark:placeholder:text-amber-700 focus:outline-none focus:ring-2 focus:ring-brown-700"
              />
            </div>

            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-amber-100 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-amber-200 dark:border-amber-900 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-brown-800 dark:text-amber-100 placeholder:text-amber-400 dark:placeholder:text-amber-700 focus:outline-none focus:ring-2 focus:ring-brown-700"
              />
            </div>

            <button
              type="button"
              className="w-full bg-amber-700 hover:bg-amber-800 text-white py-3 px-4 rounded-lg transition duration-300 font-medium shadow-md hover:shadow-lg flex items-center justify-center mt-4"
            >
              <span>Register</span>
            </button>

            <div className="text-sm text-center text-gray-600 dark:text-amber-300/70 mt-6 flex flex-col sm:flex-row sm:justify-center gap-2 sm:gap-4">
              <Link href="/login" className="hover:text-brown-700 dark:hover:text-amber-200 transition-colors">
                Login
              </Link>
            </div>
          </form>
        </div>
      </main>
    </HydrationFix>
  );
}