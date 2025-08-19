"use client";

import HydrationFix from "../hydrationFix";
import { Comfortaa } from "next/font/google";
import Link from "next/link";
import { useState, FormEvent } from "react";
import { validatePassword } from "@/lib/validators/passwordValidator";
import { validateEmail } from "@/lib/validators/emailValidator";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const comfortaa = Comfortaa({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

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
