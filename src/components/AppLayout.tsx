import { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { SideNav } from "./SideNav";

export function AppLayout({ children }: { children?: ReactNode }) {
  return (
    <div className="min-h-screen flex w-full bg-background">
      <SideNav />
      <main className="flex-1 min-w-0 pb-32 lg:pb-12">
        <div className="max-w-3xl mx-auto px-4 lg:px-8 pt-6 lg:pt-10 pb-8 lg:pb-12">
          {children ?? <Outlet />}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
