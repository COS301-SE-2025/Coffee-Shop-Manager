"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useState, FormEvent } from "react";
import { validateEmail } from "@/lib/validators/emailValidator";
import { toast } from "react-hot-toast";
import { Comfortaa } from "next/font/google";
import Link from "next/link";
import CoffeeLoading from "assets/loading";

const comfortaa = Comfortaa({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const emailValidationResult = validateEmail(email);
    if (emailValidationResult) {
      setEmailError(emailValidationResult);
      return;
    }

    setIsLoading(true);
    const supabase = createClientComponentClient();

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
      });

      if (error) {
        toast.error(error.message);
      } else {
        setResetSent(true);
        toast.success("Reset instructions sent to your email!");
      }
    } catch (error) {
      toast.error("Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      className={`min-h-screen flex items-center justify-center py-12 px-4 ${comfortaa.className}`}
      style={{
        backgroundColor: "var(--primary-4)",
        color: "var(--primary-2)",
      }}
    >
      <div
        className="w-full max-w-md p-8 rounded-xl shadow-lg border relative overflow-hidden"
        style={{
          backgroundColor: "var(--primary-2)",
          borderColor: "var(--primary-3)",
        }}
      >
        {!resetSent ? (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-amber-700 flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
              </div>
              <h2
                className="text-2xl font-bold mb-2"
                style={{ color: "var(--primary-3)" }}
              >
                Reset Your Password
              </h2>
              <p
                className="text-sm"
                style={{ color: "var(--primary-3)", opacity: 0.8 }}
              >
                Enter your email address and we'll send you instructions to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--primary-3)" }}
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-amber-600"
                  style={{
                    backgroundColor: "var(--primary-4)",
                    color: "var(--primary-3)",
                    borderColor: emailError ? "red" : "var(--primary-3)",
                  }}
                  placeholder="you@example.com"
                />
                {emailError && (
                  <p className="mt-1 text-sm text-red-500">{emailError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn"
                style={{
                  opacity: isLoading ? 0.7 : 1,
                }}
              >
                {isLoading ? "Sending..." : "Send Reset Instructions"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2
              className="text-2xl font-bold mb-4"
              style={{ color: "var(--primary-3)" }}
            >
              Check Your Email
            </h2>
            <p
              className="mb-6"
              style={{ color: "var(--primary-3)", opacity: 0.8 }}
            >
              We've sent password reset instructions to:
              <br />
              <span className="font-medium">{email}</span>
            </p>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm hover:underline"
            style={{ color: "var(--primary-3)" }}
          >
            ← Back to Login
          </Link>
        </div>
      </div>
      <CoffeeLoading visible={isLoading} />
    </main>
  );
}