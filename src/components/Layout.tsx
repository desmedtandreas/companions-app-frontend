import Header from './Header';
import React from 'react';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-grow w-full">
        <main className="flex-grow max-w-7xl mx-auto px-10 py-0">
          {children}
        </main>
      </div>

      <footer className="w-full bg-gray-100 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-4 text-sm text-center">
          &copy; 2025 Companions App. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;