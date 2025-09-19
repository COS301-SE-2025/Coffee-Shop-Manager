// layout.tsx
import Navbar from "@/app/components/Navbar";
import CoffeeBackground from "../../../assets/coffee-background";

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
    <div className="relative min-h-screen flex flex-col">
      {/* Background container */}
      <div className="fixed inset-0 -z-10">
        <CoffeeBackground />
      </div>

      {/* Foreground content */}
      <div className="relative flex-1 z-10">{children}</div>
    </div>
  );
}
