// layout.tsx - Updated
import Navbar from "@/app/components/Navbar";

export const metadata = {
  title: "Dashboard - DieKoffieBlik",
  description: "Dashboard overview for managing DieKoffieBlik coffee shop",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative h-screen flex flex-col">
      {/* Background image layer */}
      <div
        className="absolute inset-0 -z-10"
        style={{ backgroundColor: "var(--primary-4)" }}
      />

      {/* Optional overlay */}
      {/* <div className="absolute inset-0 bg-black/60 -z-10" /> */}

      {/* Foreground content */}
      <Navbar />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
