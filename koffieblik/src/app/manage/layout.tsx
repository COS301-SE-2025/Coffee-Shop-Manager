import Navbar from "@/app/components/Navbar";
import CoffeeBackground from "assets/coffee-background";
export const metadata = {
  title: "Dashboard - DieKoffieBlik",
  description: "Dashboard overview for managing DieKoffieBlik coffee shop",
  icons: {
    icon: "/icon.svg",
  },
};

export default function MANAGELayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative h-screen flex flex-col">
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






// layout.tsx



// export default function POSLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="relative h-screen flex flex-col">
//       {/* Background image layer */}
//       <div className="fixed inset-0 -z-10">
//         <CoffeeBackground />
//         <div className="absolute inset-0 bg-black/30" />
//       </div>

//       {/* Foreground content */}
//       <Navbar />
//       <div className="flex-1 overflow-auto">{children}</div>
//     </div>
//   );
// }

