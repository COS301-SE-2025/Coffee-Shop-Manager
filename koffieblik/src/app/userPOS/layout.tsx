import React from 'react';
import Navbar from '@/app/components/Navbar';


interface OrderLayoutProps {
  children: React.ReactNode;
}

export default function OrderLayout({ children }: OrderLayoutProps) {
  return (
    
    <div className="min-h-screen" style={{backgroundColor: 'var(--background)', color: 'var(--foreground)'}}>
      {/* Navigation Breadcrumb */}
      <Navbar />
      <nav className="border-b" style={{borderColor: 'var(--primary-4)', backgroundColor: 'var(--background)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-12 space-x-2 text-sm">
            <a href="/" className="tr-hover px-2 py-1 rounded">
              Home
            </a>
            <span style={{color: 'var(--primary-3)'}}>/</span>
            <span style={{color: 'var(--primary-3)'}} className="font-medium">
              Order Online
            </span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

     
    </div>
  );
}