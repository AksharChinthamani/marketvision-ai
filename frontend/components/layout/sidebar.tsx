"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  BrainCircuit, 
  Users, 
  Palette, 
  Route, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useProject } from "@/context/ProjectContext";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Strategy Studio", href: "/dashboard/strategy", icon: BrainCircuit },
  { name: "Competitor Intelligence", href: "/dashboard/competitors", icon: Users },
  { name: "Creative Lab", href: "/dashboard/creative-lab", icon: Palette },
  { name: "Campaign Roadmap", href: "/dashboard/roadmap", icon: Route },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { clearAllData } = useProject();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    // Clear all project data and auth tokens from localStorage
    clearAllData();
    localStorage.removeItem("token");
    localStorage.removeItem("onboarding_complete");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    // Expire the cookie used by Next.js middleware
    document.cookie = "mv_token=; path=/; max-age=0; SameSite=Lax";
    router.push("/login");
  };

  return (
    <aside 
      className={cn(
        "bg-background/80 backdrop-blur-xl border-r border-white/5 transition-all duration-300 flex flex-col relative",
        collapsed ? "w-[80px]" : "w-[280px]"
      )}
    >
      <div className="p-6 flex items-center h-[80px]">
        {collapsed ? (
          <Sparkles className="h-8 w-8 text-primary mx-auto" />
        ) : (
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-lg glow-border">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">MarketVision <span className="text-accent">AI</span></span>
          </Link>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden",
                isActive 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-md"></div>
              )}
              <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5 space-y-2">
        {/* Logout button */}
        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors rounded-lg px-3 py-3",
            collapsed ? "justify-center" : "justify-start"
          )}
          title="Logout"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Logout</span>}
        </Button>

        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex justify-center text-muted-foreground hover:text-foreground"
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>
    </aside>
  );
}
