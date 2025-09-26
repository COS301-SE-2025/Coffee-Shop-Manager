// layout.tsx
import CoffeeBackground from "assets/coffee-background";
import Navbar from "@/app/components/Navbar";

export default function POSLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background image layer */}
      <div className="fixed inset-0 -z-10">
        <CoffeeBackground />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Foreground content */}
      <Navbar />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
