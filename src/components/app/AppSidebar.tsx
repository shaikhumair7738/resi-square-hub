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
import { Badge } from "@/components/ui/badge";
import { permsForRole, useProto } from "@/lib/proto-store";
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
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  perm: keyof ReturnType<typeof permsForRole>;
  soon?: boolean;
}

const MAIN: NavItem[] = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, perm: "dashboard" },
  { to: "/app/properties", label: "Properties", icon: Building2, perm: "properties" },
  { to: "/app/contacts", label: "Contacts", icon: Users, perm: "contacts", soon: true },
  { to: "/app/tenancies", label: "Tenancies", icon: FileText, perm: "tenancies", soon: true },
  { to: "/app/maintenance", label: "Maintenance", icon: Wrench, perm: "maintenance", soon: true },
  { to: "/app/invoices", label: "Rent & invoices", icon: Receipt, perm: "invoices", soon: true },
];

const MANAGE: NavItem[] = [
  { to: "/app/branches", label: "Branches", icon: Briefcase, perm: "branches", soon: true },
  { to: "/app/staff", label: "Staff & roles", icon: UserCog, perm: "staff", soon: true },
  { to: "/app/reports", label: "Reports", icon: BarChart3, perm: "reports", soon: true },
  { to: "/app/billing", label: "Plan & billing", icon: CreditCard, perm: "billing", soon: true },
  { to: "/app/settings", label: "Settings", icon: Settings, perm: "settings", soon: true },
];

export function AppSidebar() {
  const { activeRole, activeWorkspace } = useProto();
  const perms = permsForRole(activeRole.id);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const isActive = (to: string) =>
    to === "/app" ? pathname === "/app" : pathname === to || pathname.startsWith(`${to}/`);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border/40">
        <Link to="/app" className="flex items-center gap-2 px-2 py-1.5">
          <LogoMark size={28} />
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-sidebar-foreground">Resisquare</span>
              <span className="text-[11px] text-sidebar-foreground/65 truncate max-w-[10rem]">
                {activeWorkspace.name}
              </span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {MAIN.filter((i) => perms[i.perm]).map((item) => (
                <NavRow key={item.to} item={item} active={isActive(item.to)} collapsed={collapsed} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {MANAGE.some((i) => perms[i.perm]) && (
          <SidebarGroup>
            <SidebarGroupLabel>Manage</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {MANAGE.filter((i) => perms[i.perm]).map((item) => (
                  <NavRow key={item.to} item={item} active={isActive(item.to)} collapsed={collapsed} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/40">
        {!collapsed && (
          <div className="px-2 py-2 text-[11px] text-sidebar-foreground/65">
            Signed in as <span className="font-medium text-sidebar-foreground">{activeRole.label.split("·")[0].trim()}</span>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

function NavRow({ item, active, collapsed }: { item: NavItem; active: boolean; collapsed: boolean }) {
  const Icon = item.icon;
  if (item.soon) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton disabled tooltip={item.label} className="opacity-60 cursor-not-allowed">
          <Icon className="h-4 w-4" />
          {!collapsed && (
            <span className="flex items-center justify-between w-full">
              <span>{item.label}</span>
              <Badge variant="outline" className="text-[10px] h-4 px-1 border-sidebar-border/40 text-sidebar-foreground/70">Soon</Badge>
            </span>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
        <Link to={item.to}>
          <Icon className="h-4 w-4" />
          {!collapsed && <span>{item.label}</span>}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
