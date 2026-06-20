import type { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useProto } from "@/lib/proto-store";
import { Badge } from "@/components/ui/badge";

interface AppShellProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function AppShell({ title, description, actions, children }: AppShellProps) {
  const { activeRole, subscriptions, activeWorkspace } = useProto();
  const sub = subscriptions[activeWorkspace.id];

  return (
    <SidebarProvider>
      <div className="min-h-dvh flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 h-14 border-b bg-background/90 backdrop-blur flex items-center gap-2 px-3 md:px-5">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                <span className="truncate">{activeWorkspace.name}</span>
                <span aria-hidden>·</span>
                <span className="truncate">{activeRole.label}</span>
              </div>
            </div>
            {sub && (
              <Badge variant="outline" className="hidden sm:inline-flex capitalize">
                {sub.planId} · {sub.status === "trialing" ? "trial" : sub.status}
              </Badge>
            )}
          </header>

          <div className="border-b bg-background">
            <div className="px-4 md:px-8 py-5 flex flex-wrap items-end justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
                {description && <p className="mt-1 text-sm text-muted-foreground max-w-2xl">{description}</p>}
              </div>
              {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
            </div>
          </div>

          <main className="flex-1 px-4 md:px-8 py-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
