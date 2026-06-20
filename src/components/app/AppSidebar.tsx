import { Link, useRouterState } from "@tanstack/react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { LogoMark } from "@/components/brand/Logo";
import { permsForRole, useProto, type RoleId } from "@/lib/proto-store";
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  Wrench,
  Receipt,
  Briefcase,
  UserCog,
  BarChart3,
  CreditCard,
  Settings,
  FolderArchive,
  MessageSquare,
  Calendar,
  Home,
  ClipboardList,
  PoundSterling,
  Globe,
  ListTree,
  Activity,
  type LucideIcon,
} from "lucide-react";

interface NavItem { to: string; label: string; icon: LucideIcon; }
interface NavGroup { label: string; items: NavItem[]; }

function navForRole(roleId: RoleId): NavGroup[] {
  if (roleId === "tenant") {
    return [{
      label: "Tenant portal",
      items: [
        { to: "/app", label: "Dashboard", icon: LayoutDashboard },
        { to: "/app/portal/tenant/tenancy", label: "My tenancy", icon: Home },
        { to: "/app/portal/tenant/payments", label: "Rent & payments", icon: PoundSterling },
        { to: "/app/portal/tenant/maintenance", label: "Maintenance", icon: Wrench },
        { to: "/app/documents", label: "Documents", icon: FolderArchive },
        { to: "/app/messages", label: "Messages", icon: MessageSquare },
      ],
    }];
  }
  if (roleId === "contractor") {
    return [{
      label: "Contractor portal",
      items: [
        { to: "/app", label: "Dashboard", icon: LayoutDashboard },
        { to: "/app/portal/contractor/work-orders", label: "Work orders", icon: ClipboardList },
        { to: "/app/portal/contractor/quotes", label: "Quotes", icon: FileText },
        { to: "/app/calendar", label: "Schedule", icon: Calendar },
        { to: "/app/messages", label: "Messages", icon: MessageSquare },
      ],
    }];
  }
  if (roleId === "owner_portal") {
    return [{
      label: "Owner portal",
      items: [
        { to: "/app", label: "Dashboard", icon: LayoutDashboard },
        { to: "/app/portal/owner/portfolio", label: "My portfolio", icon: Building2 },
        { to: "/app/portal/owner/statements", label: "Statements", icon: PoundSterling },
        { to: "/app/documents", label: "Documents", icon: FolderArchive },
        { to: "/app/messages", label: "Messages", icon: MessageSquare },
      ],
    }];
  }
  if (roleId === "super_admin") {
    return [{
      label: "Platform",
      items: [
        { to: "/platform", label: "Overview", icon: Activity },
        { to: "/platform/customers", label: "Customers", icon: Users },
        { to: "/platform/subscriptions", label: "Subscriptions", icon: CreditCard },
        { to: "/platform/events", label: "Stripe events", icon: ListTree },
      ],
    }];
  }

  const p = permsForRole(roleId);
  const main: NavItem[] = [];
  if (p.dashboard) main.push({ to: "/app", label: "Dashboard", icon: LayoutDashboard });
  if (p.properties) main.push({ to: "/app/properties", label: "Properties", icon: Building2 });
  if (p.contacts) main.push({ to: "/app/contacts", label: "Contacts", icon: Users });
  if (p.tenancies) main.push({ to: "/app/tenancies", label: "Tenancies", icon: FileText });
  if (p.maintenance) main.push({ to: "/app/maintenance", label: "Maintenance", icon: Wrench });
  if (p.invoices) main.push({ to: "/app/invoices", label: "Rent & invoices", icon: Receipt });

  const collab: NavItem[] = [];
  if (p.documents) collab.push({ to: "/app/documents", label: "Documents", icon: FolderArchive });
  if (p.messages) collab.push({ to: "/app/messages", label: "Messages", icon: MessageSquare });
  if (p.calendar) collab.push({ to: "/app/calendar", label: "Calendar", icon: Calendar });

  const manage: NavItem[] = [];
  if (p.branches) manage.push({ to: "/app/branches", label: "Branches", icon: Briefcase });
  if (p.staff) manage.push({ to: "/app/staff", label: "Staff & roles", icon: UserCog });
  if (p.reports) manage.push({ to: "/app/reports", label: "Reports", icon: BarChart3 });
  if (p.billing) manage.push({ to: "/app/billing", label: "Plan & billing", icon: CreditCard });
  if (p.settings) manage.push({ to: "/app/settings", label: "Settings", icon: Settings });

  const groups: NavGroup[] = [{ label: "Workspace", items: main }];
  if (collab.length) groups.push({ label: "Collaborate", items: collab });
  if (manage.length) groups.push({ label: "Manage", items: manage });
  return groups;
}

export function AppSidebar() {
  const { activeRole, activeWorkspace } = useProto();
  const groups = navForRole(activeRole.id);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const isActive = (to: string) => {
    if (to === "/app" || to === "/platform") return pathname === to;
    return pathname === to || pathname.startsWith(`${to}/`);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border/40">
        <Link to={activeRole.id === "super_admin" ? "/platform" : "/app"} className="flex items-center gap-2 px-2 py-1.5">
          <LogoMark size={28} />
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-sidebar-foreground">Resisquare</span>
              <span className="text-[11px] text-sidebar-foreground/65 truncate max-w-[10rem]">
                {activeRole.id === "super_admin" ? "Super Admin" : activeWorkspace.name}
              </span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((g) => (
          <SidebarGroup key={g.label}>
            <SidebarGroupLabel>{g.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {g.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.to);
                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                        <Link to={item.to}>
                          <Icon className="h-4 w-4" />
                          {!collapsed && <span>{item.label}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/40">
        {!collapsed && (
          <div className="px-2 py-2 text-[11px] text-sidebar-foreground/65 flex items-center gap-1">
            <Globe className="h-3 w-3" />
            <span>UK · GBP</span>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
