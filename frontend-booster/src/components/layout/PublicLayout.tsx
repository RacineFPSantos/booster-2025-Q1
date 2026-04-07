import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-theme-bg flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col pt-16">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
