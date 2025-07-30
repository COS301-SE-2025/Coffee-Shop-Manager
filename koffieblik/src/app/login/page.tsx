'use client';

import HydrationFix from '../hydrationFix';
import { Comfortaa } from 'next/font/google';
import Link from 'next/link';
import { useState, FormEvent, useEffect } from 'react';
import { validateEmail } from '@/lib/validators/emailValidator';
import { useRouter } from 'next/navigation';

const comfortaa = Comfortaa({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export default function LoginPage() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const isFormValid = () => email !== '' && password !== '' && !emailError;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);

    const emailValidationResult = validateEmail(email);
    setEmailError(emailValidationResult ?? '');
    const isEmailValid = !emailValidationResult;

    if (isEmailValid) {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:5000/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
          credentials: 'include',
        });

        const result = await response.json();

        if (result.success && result.user) {
          const username = result.user.user_metadata?.display_name ?? result.user.email;
          const role = result.user.user_metadata?.role ?? 'guest';
          const token = result.session?.access_token ?? 'N/A';
          localStorage.setItem('username', username);
          localStorage.setItem('role', result.user.user_metadata?.role ?? 'user');
          console.log('🧑‍💼 Role:', role); // Log role
          setLoginError('');
          if (role === 'user') {
            router.push('/userdashboard');
          }
          else {
            router.push('/dashboard');
          }

        } else {
          setLoginError(result.message || 'Invalid login response.');
        }
      } catch (err) {
        console.error('Login error:', err);
        setLoginError('Could not connect to the server.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <HydrationFix>
      <main
        className={`min-h-screen flex items-center justify-center py-12 px-4 ${comfortaa.className}`}
        style={{ backgroundColor: 'var(--primary-4)', color: 'var(--primary-2)' }}
      >
        <div
          className="w-full max-w-md p-6 md:p-8 rounded-xl shadow-lg border relative overflow-hidden"
          style={{
            backgroundColor: 'var(--primary-2)',
            borderColor: 'var(--primary-3)',
          }}
        >
          <div className="absolute -right-16 -top-16 w-32 h-32 bg-amber-100 dark:bg-amber-900/20 rounded-full opacity-30"></div>
          <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-amber-100 dark:bg-amber-900/20 rounded-full opacity-30"></div>

          <div className="flex justify-center mb-4 relative">
            <div className="w-16 h-16 rounded-full bg-amber-700 flex items-center justify-center shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-10 h-10 text-white" viewBox="0 0 24 24">
                <path d="M2 21h18v-2H2v2zm6-4h10c2.21 0 4-1.79 4-4v-3c0-2.21-1.79-4-4-4H8v14h4v-3zm10-10c1.1 0 2 .9 2 2v3c0 1.1-.9 2-2 2H10V7h8z" />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-center mb-1" style={{ color: 'var(--primary-3)' }}>
            DieKoffieBlik
          </h2>

          <p className="text-center mb-6 font-medium" style={{ color: 'var(--primary-3)' }}>
            Welcome back
          </p>

          <form className="space-y-5 relative" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--primary-3)' }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
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
                className={`w-full px-4 py-2.5 border ${emailError ? 'border-red-400 dark:border-red-600' : 'border-amber-200 dark:border-amber-900'} rounded-lg placeholder:text-amber-400 dark:placeholder:text-amber-700 focus:outline-none focus:ring-2 ${emailError ? 'focus:ring-red-400' : 'focus:ring-amber-600'}`}
                style={{
                  backgroundColor: 'var(--primary-4)',
                  color: 'var(--primary-3)',
                }}
                aria-invalid={emailError ? 'true' : 'false'}
                aria-describedby={emailError ? 'email-error' : undefined}
              />
              {emailError && (
                <p id="email-error" className="mt-1 text-sm text-red-500 dark:text-red-400">
                  {emailError}
                </p>
              )}
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium" style={{ color: 'var(--primary-3)' }}>
                  Password
                </label>
                <a href="#" className="text-xs transition-colors" style={{ color: 'var(--primary-3)' }}>
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={passwordVisible ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-amber-200 dark:border-amber-900 rounded-lg placeholder:text-amber-400 dark:placeholder:text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-600"
                  style={{
                    backgroundColor: 'var(--primary-4)',
                    color: 'var(--primary-3)',
                  }}
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5"
                  style={{ color: 'var(--primary-3)' }}
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                >
                  {passwordVisible ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="h-4 w-4 rounded border-amber-300 text-amber-700 focus:ring-amber-500"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm" style={{ color: 'var(--primary-3)' }}>
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
              disabled={!isFormValid() || isLoading}
              className="btn w-full mt-6"
              style={{
                opacity: !isFormValid() || isLoading ? 0.5 : 1,
                cursor: !isFormValid() || isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              <span>{isLoading ? 'Logging into Account...' : 'Login to Account'}</span>
              {!isLoading && (
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-5 h-5 ml-2" viewBox="0 0 24 24">
                  <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                </svg>
              )}
            </button>

            <div className="text-sm text-center mt-6" style={{ color: 'var(--primary-3)' }}>
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-medium transition-colors" style={{ color: 'var(--primary-3)' }}>
                Create one now
              </Link>
            </div>
          </form>
        </div>
      </main>
    </HydrationFix>
  );
}
