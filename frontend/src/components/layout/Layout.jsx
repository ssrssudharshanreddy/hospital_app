import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

export default function Layout({ children, backendConnected }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        backendConnected={backendConnected}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />
      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main
          style={{
            flex: 1,
            padding: '1.75rem 2rem',
            backgroundColor: '#f8fafc',
            overflowY: 'auto',
            maxWidth: '1600px',
            width: '100%',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
