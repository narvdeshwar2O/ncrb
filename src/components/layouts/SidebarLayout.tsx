import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useLocation } from "react-router-dom";
import Logo from "@/assets";

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const navTitle: Record<string, string> = {
  "/dashboard": "Agency Wise Dashboard",
  "/slipcapture": "Slip Capture Dashboard",
  "/mesa": "Mesa Dashboard",
  "/trace-report/tp-tp": "Ten Print - Ten Print",
  "/trace-report/tp-cp": "Ten Print - Chance Print",
  "/trace-report/cp-cp": "Chance Print - Chance Print",
  "/trace-report/cp-tp": "Chance Print - Ten Print",
  "/trace-report/pp-pp": "Palm print - Palm Print",
};

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const nav = useLocation();
  const title = navTitle[nav.pathname];
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-12 items-center border-b px-4 bg-background justify-between">
            <div className="flex">
              <SidebarTrigger className="mr-2" />
              <h1 className="text-lg font-semibold">{title}</h1>
            </div>

            <div className="size-8">
              <img src={Logo} />
            </div>
          </header>
          <main className="flex-1 w-full">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
