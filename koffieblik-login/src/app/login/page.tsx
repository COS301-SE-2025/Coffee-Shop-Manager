"use client";

import HydrationFix from '../hydrationFix';
import { Comfortaa } from 'next/font/google';
import Link from 'next/link';
import { useState, FormEvent } from 'react';
import { validatePassword } from '@/lib/validators/passwordValidator';
import { validateEmail } from '@/lib/validators/emailValidator';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';


const comfortaa = Comfortaa({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

export default function LoginPage() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn) {
      router.push('/dashboard');
    }
  }, [router]);





  // Form validation states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);



  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Reset previous submission state
    setFormSubmitted(true);

    // Validate inputs
    const emailValidationResult = validateEmail(email);
    setEmailError(emailValidationResult ?? '');
    const isEmailValid = !emailValidationResult;

    const passwordValidationResult = validatePassword(password);
    setPasswordError(passwordValidationResult ?? '');
    const isPasswordValid = !passwordValidationResult;

    if (isEmailValid && isPasswordValid) {
      setIsLoading(true);

      try {
        const username = email.split('@')[0];
        const response = await fetch('/api/API', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'login', username, email, password }),
        });

        const loginResult = await response.json();

        if (loginResult.success) {
          console.log('Login success:', loginResult.user);
          setLoginError('');
          localStorage.setItem('isLoggedIn', 'true');

          const usernameResponse = await fetch('/api/API', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'username', username, email, password }),
          });
          const usernameResult = await usernameResponse.json();

          if (usernameResult.success && usernameResult.username) {
            localStorage.setItem('username', usernameResult.username);
          } else {
            console.warn('Username not found, fallback to "User"');
            localStorage.setItem('username', 'User');
          }

          router.push('/dashboard');
        } else {
          console.error('Login failed:', loginResult.message);
          setLoginError(loginResult.message || 'Login failed. Please try again.');
        }




      } catch (error) {
        console.error('Login failed', error);
        setLoginError('Something went wrong. Please try again later.');
        // Handle login failure
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <HydrationFix>
      <main className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 py-12 px-4 ${comfortaa.className}`}>
        <div className="w-full max-w-md p-6 md:p-8 bg-white dark:bg-[#1a1310] rounded-xl shadow-lg border border-amber-200 dark:border-amber-900 relative overflow-hidden">

          {/* Background decoration - coffee bean pattern */}
          <div className="absolute -right-16 -top-16 w-32 h-32 bg-amber-100 dark:bg-amber-900/20 rounded-full opacity-30"></div>
          <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-amber-100 dark:bg-amber-900/20 rounded-full opacity-30"></div>

          {/* Coffee cup icon */}
          <div className="flex justify-center mb-4 relative">
            <div className="w-16 h-16 rounded-full bg-amber-700 flex items-center justify-center shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-white">
                <path d="M2 21h18v-2H2v2zm6-4h10c2.21 0 4-1.79 4-4v-3c0-2.21-1.79-4-4-4H8v14h4v-3zm10-10c1.1 0 2 .9 2 2v3c0 1.1-.9 2-2 2H10V7h8z" />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-center mb-1 text-brown-800 dark:text-amber-100">DieKoffieBlik</h2>
          <p className="text-center mb-6 text-amber-800 dark:text-amber-300 font-medium">Welcome back</p>

          <form className="space-y-5 relative" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-amber-100 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  const value = e.target.value;
                  setEmail(value);
                  if (formSubmitted) {
                    const error = validateEmail(value);
                    setEmailError(error ?? '');
                  }
                }}
                onBlur={() => {
                  const error = validateEmail(email);
                  setEmailError(error ?? '');
                }}
                className={`w-full px-4 py-2.5 border ${emailError ? 'border-red-400 dark:border-red-600' : 'border-amber-200 dark:border-amber-900'} rounded-lg bg-amber-50 dark:bg-amber-900/30 text-brown-800 dark:text-amber-100 placeholder:text-amber-400 dark:placeholder:text-amber-700 focus:outline-none focus:ring-2 ${emailError ? 'focus:ring-red-400' : 'focus:ring-amber-600'}`}
                aria-invalid={emailError ? "true" : "false"}
                aria-describedby={emailError ? "email-error" : undefined}
              />
              {emailError && (
                <p id="email-error" className="mt-1 text-sm text-red-500 dark:text-red-400">
                  {emailError}
                </p>
              )}
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-amber-100">
                  Password
                </label>
                <a href="#" className="text-xs text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={passwordVisible ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPassword(e.target.value);
                    if (formSubmitted) {
                      const error = validatePassword(value);
                      setPasswordError(error ?? '');
                    }
                  }}
                  onBlur={() => {
                    const error = validatePassword(password);
                    setPasswordError(error ?? '');
                  }}
                  className={`w-full px-4 py-2.5 border ${passwordError ? 'border-red-400 dark:border-red-600' : 'border-amber-200 dark:border-amber-900'} rounded-lg bg-amber-50 dark:bg-amber-900/30 text-brown-800 dark:text-amber-100 placeholder:text-amber-400 dark:placeholder:text-amber-700 focus:outline-none focus:ring-2 ${passwordError ? 'focus:ring-red-400' : 'focus:ring-amber-600'}`}
                  aria-invalid={passwordError ? "true" : "false"}
                  aria-describedby={passwordError ? "password-error" : undefined}
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-amber-700 dark:text-amber-400"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  aria-label={passwordVisible ? "Hide password" : "Show password"}
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
              {passwordError && (
                <p id="password-error" className="mt-1 text-sm text-red-500 dark:text-red-400">
                  {passwordError}
                </p>
              )}
            </div>

            {/* Remember me checkbox */}
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="h-4 w-4 rounded border-amber-300 text-amber-700 focus:ring-amber-500"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-amber-300">
                Remember me
              </label>
            </div>
            {loginError && (
              <div className="text-sm text-red-600 dark:text-red-400 mt-2 font-medium text-center">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-amber-700 hover:bg-amber-800 text-white py-3 px-4 rounded-lg transition duration-200 font-medium shadow-md hover:shadow-lg flex items-center justify-center mt-6 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                    <path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z" />
                  </svg>
                  <span>Sign In</span>
                </>
              )}
            </button>

            <div className="text-sm text-center text-gray-600 dark:text-amber-300/70 mt-6">
              Don't have an account?{" "}
              <Link href="/register" className="font-medium text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 transition-colors">
                Create one now
              </Link>
            </div>
          </form>
        </div>
      </main>
    </HydrationFix>
  );
}