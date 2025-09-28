import Navbar from "@/app/components/Navbar";
import CoffeeBackground from "assets/coffee-background";

export const metadata = {
  title: "Reports - DieKoffieBlik",
  description: "Reports dashboard for managing DieKoffieBlik coffee shop",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative h-screen flex flex-col">
      {/* Background image layer */}
      <div className="fixed inset-0 -z-10">
        <CoffeeBackground />
        {/* Dark overlay */}
        <div  />
      </div>

      {/* Foreground content */}
      <Navbar />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}