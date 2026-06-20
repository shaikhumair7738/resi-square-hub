import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ROLES, useProto, WORKSPACES } from "@/lib/proto-store";
import { Users, ChevronRight } from "lucide-react";

const WS_LABEL: Record<string, string> = {
  platform: "Platform",
  agency: "Agency workspace",
  landlord: "Landlord workspace",
  tenant: "Tenant portal",
  contractor: "Contractor portal",
  owner: "Owner portal",
};

export function RoleSwitcher() {
  const { activeRole, setActiveRole } = useProto();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="sm"
          variant="secondary"
          className="fixed bottom-4 right-4 z-50 shadow-lg border border-border bg-card text-foreground hover:bg-secondary"
          aria-label="Switch demo role"
        >
          <Users className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Demo role:</span>
          <span className="font-semibold truncate max-w-[10rem]">{activeRole.label}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Prototype role &amp; workspace</SheetTitle>
          <SheetDescription>
            Switch between Resisquare workspaces and roles to demonstrate the experience for each persona. No real
            authentication is performed.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-6 overflow-y-auto pr-1">
          {WORKSPACES.map((ws) => {
            const wsRoles = ROLES.filter((r) => r.workspaceId === ws.id);
            if (wsRoles.length === 0) return null;
            return (
              <section key={ws.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{ws.name}</h3>
                    <p className="text-xs text-muted-foreground">{WS_LABEL[ws.type]}</p>
                  </div>
                  <Badge variant="outline" className="capitalize">{ws.type}</Badge>
                </div>
                <ul className="rounded-xl border bg-card divide-y">
                  {wsRoles.map((r) => {
                    const active = r.id === activeRole.id;
                    return (
                      <li key={r.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveRole(r.id);
                            setOpen(false);
                          }}
                          className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm hover:bg-secondary/60 ring-focus ${active ? "bg-secondary" : ""}`}
                        >
                          <span>
                            <span className="block font-medium text-foreground">{r.label}</span>
                            <span className="block text-xs text-muted-foreground">{r.description}</span>
                          </span>
                          {active ? (
                            <Badge className="bg-teal text-teal-foreground">Active</Badge>
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
          <p className="text-xs text-muted-foreground">
            Sample data is shared across personas. Switching role changes what each screen reveals.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
