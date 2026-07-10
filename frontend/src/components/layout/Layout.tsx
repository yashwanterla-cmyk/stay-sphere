import React from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { Breadcrumbs } from "./Breadcrumbs";

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex bg-background min-h-screen">
      {/* Collapsible Left Navigation */}
      <Sidebar />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Top Header */}
        <Navbar />

        {/* Dynamic Inner Route Content */}
        <main className="flex-1 overflow-y-auto p-8 max-w-7xl w-full mx-auto">
          <Breadcrumbs />
          {children}
        </main>
      </div>
    </div>
  );
};
