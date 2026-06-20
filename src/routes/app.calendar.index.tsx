import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProto } from "@/lib/proto-store";
import { ukDate } from "@/lib/format";

export const Route = createFileRoute("/app/calendar/")({
  component: CalendarPage,
});

const KIND_COLOURS: Record<string, string> = {
  viewing: "bg-sky/15 text-sky border-sky/30",
  inspection: "bg-accent text-accent-foreground border-accent",
  compliance: "bg-warn/20 text-warn-foreground border-warn/40",
  tenancy: "bg-primary/10 text-primary border-primary/30",
  maintenance: "bg-teal/15 text-teal border-teal/30",
};

function CalendarPage() {
  const { calendar, activeWorkspace, properties } = useProto();
  const events = calendar.filter((e) => e.workspaceId === activeWorkspace.id).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <AppShell title="Calendar" description="Upcoming viewings, inspections, compliance and tenancy events.">
      <Card><CardContent className="pt-5 space-y-2">
        {events.map((e) => {
          const p = e.propertyId ? properties.find((x) => x.id === e.propertyId) : undefined;
          const d = new Date(e.date);
          const day = d.toLocaleString("en-GB", { weekday: "short", timeZone: "Europe/London" });
          return (
            <div key={e.id} className="flex items-center gap-4 border rounded-lg px-4 py-3">
              <div className="text-center shrink-0 w-14">
                <div className="text-xs uppercase text-muted-foreground">{day}</div>
                <div className="text-xl font-semibold leading-none">{d.getDate()}</div>
                <div className="text-[11px] text-muted-foreground uppercase">{d.toLocaleString("en-GB", { month: "short" })}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{e.title}</div>
                <div className="text-xs text-muted-foreground truncate">{p?.address.line1 ?? ""} · {ukDate(e.date)}</div>
              </div>
              <Badge variant="outline" className={`capitalize ${KIND_COLOURS[e.kind] ?? ""}`}>{e.kind}</Badge>
            </div>
          );
        })}
        {events.length === 0 && <div className="py-10 text-center text-sm text-muted-foreground">No events scheduled.</div>}
      </CardContent></Card>
    </AppShell>
  );
}
