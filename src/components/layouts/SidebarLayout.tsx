import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useLocation, useNavigate } from "react-router-dom";
import Logo from "@/assets";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const navTitle: Record<string, string> = {
  "/dashboard": "Agency Wise Dashboard",
  "/slipcapture": "Slip Capture Dashboard",
  "/mesa": "Mesa Dashboard",
  "/interpole": "Interpole",
  "/trace-report/tp-tp": "Ten Print - Ten Print",
  "/trace-report/tp-cp": "Ten Print - Chance Print",
  "/trace-report/cp-cp": "Chance Print - Chance Print",
  "/trace-report/cp-tp": "Chance Print - Ten Print",
  "/trace-report/pp-pp": "Palm print - Palm Print",
};

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const nav = useLocation();
  const title = navTitle[nav.pathname];
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-12 items-center border-b px-4 bg-background justify-between">
            <div className="flex items-center">
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
          <main className="flex-1 w-full">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
