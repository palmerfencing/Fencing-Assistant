import { Calculator, Menu, Trees } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";

export function AppShell() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-[#f6f3ed]/90 backdrop-blur-xl">
        <div className="page-shell flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3 font-bold text-forest-950">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-forest-900 text-white">
              <Trees size={21} />
            </span>
            <span className="leading-tight">
              <span className="block text-sm">Fencing Site</span>
              <span className="block text-xs font-medium text-stone-500">Assistant</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                cn("rounded-lg px-3 py-2 text-sm font-semibold", isActive ? "bg-white text-forest-900" : "text-stone-500")
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/gate-calculator"
              className={({ isActive }) =>
                cn("flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold", isActive ? "bg-white text-forest-900" : "text-stone-500")
              }
            >
              <Calculator size={16} /> Gate Calculator
            </NavLink>
          </nav>
          <Menu className="text-forest-900 sm:hidden" />
        </div>
      </header>
      <main><Outlet /></main>
    </div>
  );
}
