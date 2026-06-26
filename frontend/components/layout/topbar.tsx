"use client";

import { Bell, Search, Plus, Building2, LogOut, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Sidebar } from "@/components/layout/sidebar";
import { useRouter } from "next/navigation";
import { useProject } from "@/context/ProjectContext";

import { useState, useEffect } from "react";

export function Topbar() {
  const router = useRouter();
  const { clearAllData } = useProject();
  const [userName, setUserName] = useState("Acme Corp (India)");
  const [userInitials, setUserInitials] = useState("AK");

  const handleLogout = () => {
    clearAllData();
    localStorage.removeItem("token");
    localStorage.removeItem("onboarding_complete");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    document.cookie = "mv_token=; path=/; max-age=0; SameSite=Lax";
    router.push("/login");
  };

  useEffect(() => {
    const savedName = localStorage.getItem("userName");
    const savedEmail = localStorage.getItem("userEmail");
    if (savedName) {
      setUserName(savedName);
      setUserInitials(savedName.substring(0, 2).toUpperCase());
    } else if (savedEmail) {
      setUserName(savedEmail.split('@')[0]);
      setUserInitials(savedEmail.substring(0, 2).toUpperCase());
    }
  }, []);
  return (
    <header className="h-[80px] px-6 flex items-center justify-between border-b border-white/5 bg-background/50 backdrop-blur-sm z-10 sticky top-0">
      <div className="flex-1 flex items-center gap-4 md:gap-6">
        <Sheet>
          <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden text-muted-foreground hover:text-foreground" />}>
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 border-r border-white/10 bg-background w-[280px]">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <Sidebar />
          </SheetContent>
        </Sheet>

        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            type="text" 
            placeholder="Ask AI-CMO anything..." 
            className="w-full pl-10 bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/50 transition-all rounded-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 gap-2 border-white/10 bg-white/5 hover:bg-white/10 hidden md:flex">
            <Building2 className="h-4 w-4 text-primary" />
            <span>{userName}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuLabel>Brands</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>{userName}</DropdownMenuItem>
              <DropdownMenuItem>TechVision Startup</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button size="icon" variant="ghost" className="relative text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-full">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive border border-background"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className="outline-hidden rounded-full">
            <Avatar className="cursor-pointer border border-white/10 hover:border-primary/50 transition-colors h-10 w-10">
              <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User Avatar" />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-red-400 focus:text-red-400 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button className="gap-2 bg-primary hover:bg-primary/90 text-white rounded-full px-6 shadow-[0_0_15px_rgba(79,70,229,0.4)]">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Campaign</span>
        </Button>
      </div>
    </header>
  );
}
