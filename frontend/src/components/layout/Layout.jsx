import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

export default function Layout({ children, backendConnected }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Header
        backendConnected={backendConnected}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />
      <div className="app-body">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="app-main">
          {children}
        </main>
      </div>
    </div>
  );
}
