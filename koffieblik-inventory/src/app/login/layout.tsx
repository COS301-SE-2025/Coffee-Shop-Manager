// src/app/register/layout.tsx
// This remains a Server Component (no "use client" directive)

export const metadata = {
  title: 'Login - DieKoffieBlik',
  description: 'Log into an existing account for DieKoffieBlik coffee shop management system',
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}