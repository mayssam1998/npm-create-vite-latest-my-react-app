import { useState } from 'react';
import { Outlet } from 'react-router';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function AppShell() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  function handleSidebarToggle() {
    setIsSidebarOpen((prev) => !prev);
  }

  return (
    <div className="flex h-dvh overflow-hidden">
      {isSidebarOpen && <Sidebar />}
      <div className="flex min-w-0 flex-1 flex-col">
        <Header isSidebarOpen={isSidebarOpen} onSidebarToggle={handleSidebarToggle} />
        <main className="min-h-0 flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
