// src/app/register/layout.tsx
// This remains a Server Component (no "use client" directive)

export const metadata = {
  title: "Register - DieKoffieBlik",
  description:
    "Create an account for DieKoffieBlik coffee shop management system",
  icons: {
    icon: "/icon.svg",
  },
};

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
