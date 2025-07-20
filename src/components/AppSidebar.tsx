import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  Activity,
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
  { title: "Slip Capture", url: "/slipcapture", icon: LayoutDashboard },
  { title: "Mesa", url: "/mesa", icon: LayoutDashboard },
  // { title: "CCTNS Analytics", url: "/cctns", icon: BarChart3 },
  // { title: "NCRC Verification", url: "/ncrc", icon: Activity },
];

// const cctnsNavItems = [
//   { title: "Total FIRs", url: "/details/total-firs", icon: FileText },
//   {
//     title: "Resolution Rate",
//     url: "/details/resolution-rate",
//     icon: TrendingUp,
//   },
//   { title: "Pending Cases", url: "/details/pending-cases", icon: Clock },
//   { title: "Resolution Time", url: "/details/resolution-time", icon: Timer },
//   { title: "Crime Hotspots", url: "/details/crime-hotspots", icon: MapPin },
//   { title: "Repeat Offenders", url: "/details/repeat-offenders", icon: Users },
//   { title: "Pattern Match", url: "/details/pattern-match", icon: Search },
//   { title: "MO Analysis", url: "/details/mo-analysis", icon: Brain },
//   {
//     title: "First Response Time",
//     url: "/details/first-response-time",
//     icon: Timer,
//   },
//   {
//     title: "Investigation Quality",
//     url: "/details/investigation-quality",
//     icon: Scale,
//   },
//   {
//     title: "Court Success Rate",
//     url: "/details/court-success-rate",
//     icon: Gavel,
//   },
//   {
//     title: "Resource Utilization",
//     url: "/details/resource-utilization",
//     icon: Settings,
//   },
//   {
//     title: "Digital Evidence",
//     url: "/details/digital-evidence",
//     icon: HardDrive,
//   },
//   { title: "Forensic TAT", url: "/details/forensic-tat", icon: Microscope },
//   {
//     title: "Public Safety Index",
//     url: "/details/public-safety-index",
//     icon: Shield,
//   },
//   {
//     title: "Compliance Score",
//     url: "/details/compliance-score",
//     icon: CheckCircle,
//   },
// ];


const traceReport=[
  { title: "TP-TP", url: "/trace-report/tp-tp", icon: FileText },
  { title: "TP-CP", url: "/trace-report/tp-cp", icon: FileText },
  { title: "CP-CP", url: "/trace-report/cp-cp", icon: FileText },
  { title: "CP-TP", url: "/trace-report/cp-tp", icon: FileText },
  { title: "PP-PP", url: "/trace-report/pp-pp", icon: FileText },
]
// const ncrcNavItems = [
//   {
//     title: "Total Verifications",
//     url: "/details/ncrc/total-verifications",
//     icon: Target,
//   },
//   {
//     title: "Success Rate",
//     url: "/details/ncrc/success-rate",
//     icon: TrendingUp,
//   },
//   {
//     title: "Pending Requests",
//     url: "/details/ncrc/pending-requests",
//     icon: Clock,
//   },
//   {
//     title: "Processing Time",
//     url: "/details/ncrc/processing-time",
//     icon: Timer,
//   },
//   { title: "Data Accuracy", url: "/details/ncrc/data-accuracy", icon: Target },
//   {
//     title: "Source Reliability",
//     url: "/details/ncrc/source-reliability",
//     icon: Database,
//   },
//   {
//     title: "Cross Reference",
//     url: "/details/ncrc/cross-reference",
//     icon: Link,
//   },
//   {
//     title: "False Positives",
//     url: "/details/ncrc/false-positives",
//     icon: AlertTriangle,
//   },
//   {
//     title: "Customer Satisfaction",
//     url: "/details/ncrc/customer-satisfaction",
//     icon: Star,
//   },
//   {
//     title: "Completion Rate",
//     url: "/details/ncrc/completion-rate",
//     icon: Percent,
//   },
//   {
//     title: "SLA Compliance",
//     url: "/details/ncrc/sla-compliance",
//     icon: Clock4,
//   },
//   {
//     title: "Abandonment Rate",
//     url: "/details/ncrc/abandonment-rate",
//     icon: XCircle,
//   },
//   {
//     title: "Fraud Detection",
//     url: "/details/ncrc/fraud-detection",
//     icon: AlertCircle,
//   },
//   {
//     title: "Compliance Score",
//     url: "/details/ncrc/compliance-score",
//     icon: CheckCircle,
//   },
//   { title: "High Risk Cases", url: "/details/ncrc/high-risk-cases", icon: Eye },
//   { title: "Audit Trail", url: "/details/ncrc/audit-trail", icon: FileCheck },
// ];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const [cctnsOpen, setCctnsOpen] = useState(false);
  const [ncrcOpen, setNcrcOpen] = useState(false);

  const isCollapsed = state === "collapsed";
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavClass = (path: string) =>
    isActive(path)
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
      : "";

  return (
    <Sidebar collapsible="icon" className="bg-background">
      <SidebarHeader className="flex flex-row items-center justify-between h-12">
        {!isCollapsed && (
          <div className="flex items-center gap-2 px-4 transition-all duration-300">
            <h2 className="hidden lg:block text-lg font-semibold">Dashboard</h2>
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
                      <span>{item.title}</span>
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
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        {/* NCRC Section */}
        {/* <SidebarGroup>
          <Collapsible open={ncrcOpen} onOpenChange={setNcrcOpen}>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="group/collapsible w-full">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-green-600" />
                  NCRC Details
                  <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                </div>
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenuSub>
                  {ncrcNavItems.map((item) => (
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
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup> */}
      </SidebarContent>
    </Sidebar>
  );
}
