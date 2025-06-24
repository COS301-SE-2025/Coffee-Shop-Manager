
import React from 'react';

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="p-6 bg-orange-50 min-h-screen">
      <h2 className="text-2xl font-bold text-amber-900 mb-4">Help </h2>
      <div>{children}</div>
    </section>
  );
}
