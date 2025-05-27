// src/app/register/layout.tsx
// This remains a Server Component (no "use client" directive)

export const metadata = {
  title: 'Register - DieKoffieBlik',
  description: 'Create an account for DieKoffieBlik coffee shop management system',
  icons: {
    icon: '/favicon.ico',
  }
}

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}