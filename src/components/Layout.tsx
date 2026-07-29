import { Outlet } from "react-router-dom";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";

export default function Layout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar />
      <main className="flex-1 pb-24">
        <div className="max-w-md mx-auto">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}