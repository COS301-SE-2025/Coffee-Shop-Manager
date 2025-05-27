"use client";

import HydrationFix from '../hydrationFix';
import { Comfortaa } from 'next/font/google';
import Link from 'next/link';
import { useState } from 'react';
import { validatePassword } from '@/lib/validators/passwordValidator';
import { validateEmail } from '@/lib/validators/emailValidator';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';


const comfortaa = Comfortaa({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

export default function RegisterPage() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const router = useRouter();

  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    console.log({ email, confirmEmail, password, confirmPassword });

    e.preventDefault();

    setFormError('');

    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    if (emailValidation) return setEmailError(emailValidation);
    if (email !== confirmEmail) return setEmailError("Emails do not match.");
    if (passwordValidation) return setPasswordError(passwordValidation);
    if (password !== confirmPassword) return setPasswordError("Passwords do not match.");

    try {
      const username = email.split('@')[0];
      const res = await fetch('/api/API', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        
        body: JSON.stringify({ action: 'register', username,email, password }),
      });

      const result = await res.json();

      if (result.success) {
        router.push('/login');
      } else {
        setFormError(result.message || 'Registration failed');
      }
    } catch (err) {
      setFormError('Something went wrong. Please try again.');
    }
  };


  return (
    <HydrationFix>
      <main className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 py-8 px-4 ${comfortaa.className}`}>
        <div className="w-full max-w-md p-6 md:p-8 bg-white dark:bg-[#1a1310] rounded-xl shadow-lg border border-amber-200 dark:border-amber-900 relative">

          {/* Logo & Header section */}
          <div className="mb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-amber-700 flex items-center justify-center shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-white">
                  <path d="M2 21h18v-2H2v2zm6-4h10c2.21 0 4-1.79 4-4v-3c0-2.21-1.79-4-4-4H8v14h4v-3zm10-10c1.1 0 2 .9 2 2v3c0 1.1-.9 2-2 2H10V7h8z" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-1 text-brown-800 dark:text-amber-100">DieKoffieBlik</h2>
            <p className="text-center text-amber-800 dark:text-amber-300 font-medium text-sm mb-2">Create your account</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>

            {/* Progress indicator */}
            <div className="mb-6">
              <div className="w-full bg-amber-100 dark:bg-amber-900/30 h-1 rounded-full">
                <div className="bg-amber-600 h-1 rounded-full w-1/3"></div>
              </div>
              <div className="flex justify-between text-xs mt-1 text-amber-700 dark:text-amber-400">
                <span>Account</span>
                <span className="opacity-50">Details</span>
                <span className="opacity-50">Confirm</span>
              </div>
            </div>

            {/* Email section */}
            <div>
              <label htmlFor="email-primary" className="block text-sm font-medium text-gray-700 dark:text-amber-100 mb-1.5">
                Email
              </label>
              <input
                id="email-primary"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required

                className="w-full px-4 py-2.5 border border-amber-200 dark:border-amber-900 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-brown-800 dark:text-amber-100 placeholder:text-amber-400 dark:placeholder:text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">We'll send a verification link to this address</p>
            </div>

            <div>
              <label htmlFor="email-confirm" className="block text-sm font-medium text-gray-700 dark:text-amber-100 mb-1.5">
                Confirm Email
              </label>
              <input
                id="email-confirm"
                name="email-confirm"
                type="email"
                placeholder="you@example.com"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-amber-200 dark:border-amber-900 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-brown-800 dark:text-amber-100 placeholder:text-amber-400 dark:placeholder:text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>

            {/* Password section */}
            <div>
              <label htmlFor="password-primary" className="block text-sm font-medium text-gray-700 dark:text-amber-100 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password-primary"
                  name="password"
                  type={passwordVisible ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-amber-200 dark:border-amber-900 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-brown-800 dark:text-amber-100 placeholder:text-amber-400 dark:placeholder:text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-amber-700 dark:text-amber-400"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                >
                  {passwordVisible ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="mt-1 flex space-x-1">
                <div className="h-1 flex-1 rounded-full bg-amber-200"></div>
                <div className="h-1 flex-1 rounded-full bg-amber-200"></div>
                <div className="h-1 flex-1 rounded-full bg-amber-200"></div>
                <div className="h-1 flex-1 rounded-full bg-amber-200"></div>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">Must be at least 8 characters</p>
            </div>

            <div>
              <label htmlFor="password-confirm" className="block text-sm font-medium text-gray-700 dark:text-amber-100 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="password-confirm"
                  name="confirm-password"
                  type={confirmPasswordVisible ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-amber-200 dark:border-amber-900 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-brown-800 dark:text-amber-100 placeholder:text-amber-400 dark:placeholder:text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-amber-700 dark:text-amber-400"
                  onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                >
                  {confirmPasswordVisible ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-700 hover:bg-amber-800 text-white py-3 px-4 rounded-lg transition duration-200 font-medium shadow-md hover:shadow-lg flex items-center justify-center mt-6"
            >
              <span>Create Account</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-2">
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
              </svg>
            </button>

            <div className="text-sm text-center text-gray-600 dark:text-amber-300/70 mt-6">
              <Link href="/login" className="hover:text-amber-800 dark:hover:text-amber-200 transition-colors">
                Already have an account? <span className="font-medium">Login</span>
              </Link>
            </div>
          </form>
        </div>
      </main>
    </HydrationFix>
  );
}