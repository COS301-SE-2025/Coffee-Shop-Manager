// src/app/register/layout.tsx
// This remains a Server Component (no "use client" directive)

export const metadata = {
  title: "Login - DieKoffieBlik",
  description:
    "Log into an existing account for DieKoffieBlik coffee shop management system",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
