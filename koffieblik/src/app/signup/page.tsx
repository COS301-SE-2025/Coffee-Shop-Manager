"use client";

import HydrationFix from "../hydrationFix";
import { Comfortaa } from "next/font/google";
import Link from "next/link";
import { useState, FormEvent } from "react";
import { validatePassword } from "@/lib/validators/passwordValidator";
import { validateEmail } from "@/lib/validators/emailValidator";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const comfortaa = Comfortaa({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const supabase = createClientComponentClient();

export default function SignUpPage() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [SignUpError, setSignUpError] = useState("");
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  const isFormValid = () => {
    return (
      email !== "" &&
      password !== "" &&
      confirmPassword !== "" &&
      username !== "" &&
      password === confirmPassword &&
      !emailError &&
      !passwordError &&
      !confirmPasswordError
    );
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        console.error("Google sign in error:", error);
        setSignUpError("Failed to sign in with Google. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      setSignUpError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);

    const emailValidationResult = validateEmail(email);
    setEmailError(emailValidationResult ?? "");
    const isEmailValid = !emailValidationResult;

    const passwordValidationResult = validatePassword(password);
    setPasswordError(passwordValidationResult ?? "");
    const isPasswordValid = !passwordValidationResult;

    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
    } else {
      setConfirmPasswordError("");
    }

    if (isEmailValid && isPasswordValid && password === confirmPassword) {
      setIsLoading(true);

      try {
        const response = await fetch(`${API_BASE_URL}/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, username }),
          credentials: "include",
        });

        const result = await response.json();
        // console.log('Full SignUp response:', result);

        if (result.success && result.user?.user_metadata?.display_name) {
          setSignUpError("");
          router.push("/login");
        } else {
          setSignUpError(result.message || "Invalid SignUp response.");
        }
      } catch (err) {
        console.error("SignUp error:", err);
        setSignUpError("Could not connect to the server.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <HydrationFix>
      <main
        className={`min-h-screen flex items-center justify-center py-12 px-4 ${comfortaa.className}`}
        style={{
          backgroundColor: "var(--primary-4)",
          color: "var(--primary-2)",
        }}
      >
        <div
          className="w-full max-w-md p-6 md:p-8 rounded-xl shadow-lg border relative overflow-hidden"
          style={{
            backgroundColor: "var(--primary-2)",
            borderColor: "var(--primary-3)",
          }}
        >
          {/* Background decoration - coffee bean pattern */}
          <div className="absolute -right-16 -top-16 w-32 h-32 bg-amber-100 dark:bg-amber-900/20 rounded-full opacity-30"></div>
          <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-amber-100 dark:bg-amber-900/20 rounded-full opacity-30"></div>

          {/* Coffee cup icon */}
          <div className="flex justify-center mb-4 relative">
            <div className="w-16 h-16 rounded-full bg-amber-700 flex items-center justify-center shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-10 h-10 text-white"
              >
                <path d="M2 21h18v-2H2v2zm6-4h10c2.21 0 4-1.79 4-4v-3c0-2.21-1.79-4-4-4H8v14h4v-3zm10-10c1.1 0 2 .9 2 2v3c0 1.1-.9 2-2 2H10V7h8z" />
              </svg>
            </div>
          </div>

          <h2
            className="text-2xl md:text-3xl font-bold text-center mb-1"
            style={{ color: "var(--primary-3)" }}
          >
            DieKoffieBlik
          </h2>

          <p
            className="text-center mb-6 font-medium"
            style={{ color: "var(--primary-3)" }}
          >
            Welcome
          </p>

          {/* Google Sign-in Button */}
          <div className="mb-6">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-white dark:bg-amber-900/30 text-gray-700 dark:text-amber-100 border border-amber-200 dark:border-amber-900 rounded-lg px-4 py-2.5 font-medium hover:bg-amber-50 dark:hover:bg-amber-900/50 transition duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {isLoading ? "Signing in..." : "Continue with Google"}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: "var(--primary-3)", opacity: 0.3 }}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span 
                  className="px-3 text-xs font-medium" 
                  style={{ 
                    backgroundColor: "var(--primary-2)", 
                    color: "var(--primary-3)",
                    opacity: 0.8
                  }}
                >
                  or continue with email
                </span>
              </div>
            </div>
          </div>

          <form
            className="space-y-5 relative"
            onSubmit={handleSubmit}
            noValidate
          >
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--primary-3)" }}
              >
                Username
              </label>

              <input
                id="username"
                type="text"
                placeholder="Your name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 border border-amber-200 dark:border-amber-900 rounded-lg placeholder:text-amber-400 dark:placeholder:text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-600"
                style={{
                  backgroundColor: "var(--primary-4)",
                  color: "var(--primary-3)",
                }}
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--primary-3)" }}
              >
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
                    setEmailError(error ?? "");
                  }
                }}
                onBlur={() => {
                  const error = validateEmail(email);
                  setEmailError(error ?? "");
                }}
                className={`w-full px-4 py-2.5 border ${emailError ? "border-red-400 dark:border-red-600" : "border-amber-200 dark:border-amber-900"} rounded-lg placeholder:text-amber-400 dark:placeholder:text-amber-700 focus:outline-none focus:ring-2 ${emailError ? "focus:ring-red-400" : "focus:ring-amber-600"}`}
                style={{
                  backgroundColor: "var(--primary-4)",
                  color: "var(--primary-3)",
                }}
                aria-invalid={emailError ? "true" : "false"}
                aria-describedby={emailError ? "email-error" : undefined}
              />

              {emailError && (
                <p
                  id="email-error"
                  className="mt-1 text-sm text-red-500 dark:text-red-400"
                >
                  {emailError}
                </p>
              )}
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium"
                  style={{ color: "var(--primary-3)" }}
                >
                  Password
                </label>
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
                      setPasswordError(error ?? "");
                    }
                  }}
                  onBlur={() => {
                    const error = validatePassword(password);
                    setPasswordError(error ?? "");
                  }}
                  className={`w-full px-4 py-2.5 border ${passwordError ? "border-red-400 dark:border-red-600" : "border-amber-200 dark:border-amber-900"} rounded-lg placeholder:text-amber-400 dark:placeholder:text-amber-700 focus:outline-none focus:ring-2 ${passwordError ? "focus:ring-red-400" : "focus:ring-amber-600"}`}
                  style={{
                    backgroundColor: "var(--primary-4)",
                    color: "var(--primary-3)",
                  }}
                  aria-invalid={passwordError ? "true" : "false"}
                  aria-describedby={
                    passwordError ? "password-error" : undefined
                  }
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5"
                  style={{ color: "var(--primary-3)" }}
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  aria-label={
                    passwordVisible ? "Hide password" : "Show password"
                  }
                >
                  {passwordVisible ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                    </svg>
                  )}
                </button>
              </div>
              {passwordError && (
                <p
                  id="password-error"
                  className="mt-1 text-sm text-red-500 dark:text-red-400"
                >
                  {passwordError}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--primary-3)" }}
              >
                Confirm Password
              </label>

              <input
                id="confirm-password"
                type={passwordVisible ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => {
                  if (formSubmitted && confirmPassword !== password) {
                    setConfirmPasswordError("Passwords do not match.");
                  } else {
                    setConfirmPasswordError("");
                  }
                }}
                className={`w-full px-4 py-2.5 border ${
                  confirmPasswordError
                    ? "border-red-400 dark:border-red-600"
                    : "border-amber-200 dark:border-amber-900"
                } rounded-lg placeholder:text-amber-400 dark:placeholder:text-amber-700 focus:outline-none focus:ring-2 ${
                  confirmPasswordError
                    ? "focus:ring-red-400"
                    : "focus:ring-amber-600"
                }`}
                style={{
                  backgroundColor: "var(--primary-4)",
                  color: "var(--primary-3)",
                }}
                aria-invalid={confirmPasswordError ? "true" : "false"}
                aria-describedby={
                  confirmPasswordError ? "confirm-password-error" : undefined
                }
              />

              {confirmPasswordError && (
                <p
                  id="confirm-password-error"
                  className="mt-1 text-sm text-red-500 dark:text-red-400"
                >
                  {confirmPasswordError}
                </p>
              )}
            </div>

            {SignUpError && (
              <div className="text-sm text-red-600 dark:text-red-400 mt-2 font-medium text-center">
                {SignUpError}
              </div>
            )}

            <button
              type="submit"
              disabled={!isFormValid() || isLoading}
              className="btn w-full mt-6"
              style={{
                opacity: !isFormValid() || isLoading ? 0.5 : 1,
                cursor: !isFormValid() || isLoading ? "not-allowed" : "pointer",
              }}
            >
              <span>{isLoading ? "Signing Up..." : "SignUp"}</span>
              {!isLoading && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 ml-2"
                  style={{ color: "var(--primary-2)" }}
                >
                  <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                </svg>
              )}
            </button>

            <div
              className="text-sm text-center mt-6"
              style={{ color: "var(--primary-3)" }}
            >
              ALready have an account?{" "}
              <Link
                href="/login"
                className="font-medium transition-colors"
                style={{ color: "var(--primary-3)" }}
              >
                Login now
              </Link>
            </div>
          </form>
        </div>
      </main>
    </HydrationFix>
  );
}
