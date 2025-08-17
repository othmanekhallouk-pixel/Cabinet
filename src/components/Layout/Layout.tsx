import React from 'react';
import Sidebar from './Sidebar';
import { User } from '../../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
}

export default function Layout({ children, user, onLogout }: LayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={user} onLogout={onLogout} />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}