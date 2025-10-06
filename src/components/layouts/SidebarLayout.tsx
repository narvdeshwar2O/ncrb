import Logo from "@/assets";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { User } from "lucide-react";

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const navTitle: Record<string, string> = {
  "/dashboard": "Agency Wise Dashboard",
  "/slipcapture": "Slip Capture Dashboard",
  "/mesa": "Mesa Dashboard",
  "/interpol": "Interpol",
  "/trace-report/tp-tp": "Ten Print - Ten Print",
  "/trace-report/tp-cp": "Ten Print - Chance Print",
  "/trace-report/cp-cp": "Chance Print - Chance Print",
  "/trace-report/cp-tp": "Chance Print - Ten Print",
  "/trace-report/pp-pp": "Palm print - Palm Print",
};

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const nav = useLocation();
  const title = navTitle[nav.pathname] || "";
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <AppSidebar />

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Sticky header aligned with main content */}
          <header className="sticky top-0 z-50 h-12 px-4 bg-background border-b flex justify-between items-center">
            <div className="flex items-center">
              {/* Sidebar toggle */}
              <SidebarTrigger className="mr-2" />
              <h1 className="text-lg font-semibold">{title}</h1>
            </div>

            <div className="flex items-center gap-4">
              {/* User dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <User className="size-5 text-slate-600" />
                    <span className="text-sm font-medium">{"Admin"}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer"
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="size-8">
                <img src={Logo} alt="logo" />
              </div>
            </div>
          </header>

          {/* Scrollable main content with padding-top equal to header height */}
          <main className="flex-1 w-full overflow-auto pt-1">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
