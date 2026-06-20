import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProto } from "@/lib/proto-store";
import { ukDate } from "@/lib/format";
import { Mail, MailOpen } from "lucide-react";

export const Route = createFileRoute("/app/messages/")({
  component: MessagesPage,
});

function MessagesPage() {
  const { messages, activeWorkspace, properties, markMessageRead } = useProto();
  const all = messages.filter((m) => m.workspaceId === activeWorkspace.id).sort((a, b) => b.sentAt.localeCompare(a.sentAt));
  const [active, setActive] = useState<string | null>(all[0]?.id ?? null);
  const selected = all.find((m) => m.id === active);

  return (
    <AppShell title="Messages" description="In-platform conversations with tenants, owners and contractors.">
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card><CardContent className="pt-3">
          <div className="divide-y">
            {all.map((m) => (
              <button key={m.id} onClick={() => { setActive(m.id); if (!m.read) markMessageRead(m.id); }} className={`w-full text-left py-3 px-2 flex items-start gap-2 hover:bg-secondary/40 rounded ${active === m.id ? "bg-secondary/50" : ""}`}>
                {m.read ? <MailOpen className="h-4 w-4 text-muted-foreground mt-1 shrink-0" /> : <Mail className="h-4 w-4 text-teal mt-1 shrink-0" />}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-sm truncate ${m.read ? "" : "font-semibold"}`}>{m.from}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">{ukDate(m.sentAt)}</span>
                  </div>
                  <div className="text-xs truncate text-muted-foreground">{m.subject}</div>
                </div>
              </button>
            ))}
            {all.length === 0 && <div className="py-8 text-center text-sm text-muted-foreground">No messages.</div>}
          </div>
        </CardContent></Card>

        <Card><CardContent className="pt-6">
          {selected ? (
            <article className="space-y-3">
              <h2 className="text-lg font-semibold">{selected.subject}</h2>
              <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">
                <span>From <strong>{selected.from}</strong> to <strong>{selected.to}</strong></span>
                <span>·</span>
                <span>{ukDate(selected.sentAt)}</span>
                {selected.propertyId && (() => {
                  const p = properties.find((x) => x.id === selected.propertyId);
                  return p ? <><span>·</span><Link to="/app/properties/$id" params={{ id: p.id }} className="hover:underline"><Badge variant="outline">{p.address.line1}</Badge></Link></> : null;
                })()}
              </div>
              <p className="text-sm pt-2 border-t leading-relaxed">{selected.body}</p>
              <div className="pt-2 flex gap-2">
                <Button size="sm" variant="outline">Reply</Button>
                <Button size="sm" variant="ghost">Archive</Button>
              </div>
            </article>
          ) : <p className="text-sm text-muted-foreground">Select a message to read.</p>}
        </CardContent></Card>
      </div>
    </AppShell>
  );
}
