import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import Logo from "@/assets";
import {
  BarChart3,
  FileText,
  TrendingUp,
  Clock,
  MapPin,
  Users,
  Search,
  Brain,
  Timer,
  Scale,
  Gavel,
  Settings,
  HardDrive,
  Microscope,
  Shield,
  CheckCircle,
  Target,
  Database,
  Link,
  AlertTriangle,
  Star,
  Percent,
  Clock4,
  XCircle,
  AlertCircle,
  Eye,
  FileCheck,
  LayoutDashboard,
  Fingerprint,
  Layers,
  SearchCode,
  ShieldCheck,
  GavelIcon,
  Globe,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
  SidebarHeader,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";
import { ThemeToggle } from "./theme/ThemeToggle";

const mainNavItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Slip Capture", url: "/slipcapture", icon: Fingerprint },
  { title: "Mesa", url: "/mesa", icon: Gavel },
  { title: "Interpole", url: "/interpole", icon: Globe },
];
const traceReport = [
  {
    title: "Ten Print - Ten Print",
    url: "/trace-report/tp-tp",
    icon: FileText,
  },
  {
    title: "Ten Print - Chance Print",
    url: "/trace-report/tp-cp",
    icon: FileText,
  },
  {
    title: "Chance Print - Chance Print",
    url: "/trace-report/cp-cp",
    icon: FileText,
  },
  {
    title: "Chance Print - Ten Print",
    url: "/trace-report/cp-tp",
    icon: FileText,
  },
  {
    title: "Palm Print - Palm Print",
    url: "/trace-report/pp-pp",
    icon: FileText,
  },
];
export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const [cctnsOpen, setCctnsOpen] = useState(false);

  const isCollapsed = state === "collapsed";
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavClass = (path: string) =>
    isActive(path)
      ? "bg-sidebar-accent text-blue-500 font-medium border-2 border-blue-500"
      : "";

  return (
    <Sidebar collapsible="icon" className="bg-background">
      <SidebarHeader className="flex flex-row items-center justify-between h-12 border-b">
        {!isCollapsed && (
          <div className="flex items-center gap-2 px-4 transition-all duration-300">
            <h2 className="hidden lg:block text-lg font-semibold text-blue-600">
              NAFIS Dashboard
            </h2>
          </div>
        )}
        <ThemeToggle />
      </SidebarHeader>
      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} className={getNavClass(item.url)}>
                      <item.icon className="h-4 w-4" />
                      <span title={item.title}>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* CCTNS Section */}
        <SidebarGroup>
          <Collapsible open={cctnsOpen} onOpenChange={setCctnsOpen}>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="group/collapsible w-full">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  Trace Report
                  <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                </div>
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenuSub>
                  {traceReport.map((item) => (
                    <SidebarMenuSubItem key={item.title}>
                      <SidebarMenuSubButton
                        asChild
                        isActive={isActive(item.url)}
                      >
                        <NavLink
                          to={item.url}
                          className={getNavClass(item.url)}
                        >
                          <item.icon className="h-4 w-4" />
                          <span title={item.title}>{item.title}</span>
                        </NavLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
      </SidebarContent>
      <div
        className={`mx-auto mb-6 transition-all duration-300 ${
          isCollapsed ? "size-12" : "size-40"
        }`}
      >
        <img
          src={Logo}
          className="h-full w-full object-contain transition-all duration-300"
          alt="Logo"
        />
      </div>
    </Sidebar>
  );
}
