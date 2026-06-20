import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProto } from "@/lib/proto-store";
import { gbp, ukDate } from "@/lib/format";
import { ArrowLeft, Check } from "lucide-react";

export const Route = createFileRoute("/app/maintenance/$id")({
  component: TicketDetail,
});

function TicketDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { tickets, properties, contacts, quotes, workOrders, assignContractor, setTicketStatus, addQuote, acceptQuote, markWorkOrderComplete } = useProto();
  const t = tickets.find((x) => x.id === id);

  if (!t) {
    return <AppShell title="Ticket not found"><Link to="/app/maintenance" className="text-sm underline">Back</Link></AppShell>;
  }

  const p = properties.find((x) => x.id === t.propertyId);
  const reporter = t.reportedByContactId ? contacts.find((c) => c.id === t.reportedByContactId) : undefined;
  const ticketQuotes = quotes.filter((q) => q.ticketId === t.id);
  const wo = workOrders.find((w) => w.ticketId === t.id);
  const contractors = contacts.filter((c) => c.kind === "contractor");
  const assignedContractor = t.assignedContractorId ? contacts.find((c) => c.id === t.assignedContractorId) : undefined;

  return (
    <AppShell
      title={t.title}
      description={`${p?.address.line1 ?? ""} · Reported ${ukDate(t.reportedAt)}${reporter ? ` by ${reporter.name}` : ""}`}
      actions={
        <>
          <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/app/maintenance" })}><ArrowLeft className="h-4 w-4" /> Back</Button>
          {t.status !== "completed" && t.status !== "cancelled" && (
            <Button variant="outline" size="sm" onClick={() => { setTicketStatus(t.id, "cancelled"); toast.success("Ticket cancelled"); }}>Cancel ticket</Button>
          )}
        </>
      }
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Description</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-3">
            <p>{t.description}</p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Badge variant="outline" className="capitalize">{t.priority}</Badge>
              <Badge variant="outline" className="capitalize">{t.status.replace("_", " ")}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Assigned contractor</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Select value={t.assignedContractorId ?? ""} onValueChange={(v) => { assignContractor(t.id, v); toast.success("Contractor assigned"); }}>
              <SelectTrigger><SelectValue placeholder="Assign a contractor" /></SelectTrigger>
              <SelectContent>{contractors.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}{c.company ? ` · ${c.company}` : ""}</SelectItem>)}</SelectContent>
            </Select>
            {assignedContractor && <div className="text-xs text-muted-foreground">{assignedContractor.email} · {assignedContractor.phone}</div>}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Quotes</CardTitle>
          {t.status !== "completed" && t.status !== "cancelled" && <AddQuoteDialog ticketId={t.id} contractors={contractors} defaultContractorId={t.assignedContractorId} onAdd={(amount, contractorContactId, notes) => { addQuote({ ticketId: t.id, contractorContactId, amount, notes }); toast.success("Quote added"); }} />}
        </CardHeader>
        <CardContent className="space-y-2">
          {ticketQuotes.length === 0 && <p className="text-sm text-muted-foreground">No quotes yet.</p>}
          {ticketQuotes.map((q) => {
            const c = contacts.find((x) => x.id === q.contractorContactId);
            return (
              <div key={q.id} className="border rounded-lg p-3 flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm">
                  <div className="font-medium">{c?.name} <span className="text-muted-foreground font-normal">· {ukDate(q.submittedAt)}</span></div>
                  <div className="text-xs text-muted-foreground">{q.notes}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{gbp(q.amount)}</span>
                  <Badge variant="outline" className="capitalize">{q.status}</Badge>
                  {q.status === "pending" && <AcceptQuoteDialog onAccept={(date) => { acceptQuote(q.id, date); toast.success("Quote accepted · work order scheduled"); }} />}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {wo && (
        <Card className="mt-4">
          <CardHeader><CardTitle className="text-base">Work order</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div>Scheduled for <strong>{ukDate(wo.scheduledFor)}</strong></div>
                <div className="text-xs text-muted-foreground">Contractor: {contacts.find((c) => c.id === wo.contractorContactId)?.name}</div>
              </div>
              <Badge variant="outline" className="capitalize">{wo.status.replace("_", " ")}</Badge>
            </div>
            {wo.status !== "completed" && (
              <div className="flex gap-2">
                {wo.status === "scheduled" && <Button size="sm" variant="outline" onClick={() => { setTicketStatus(t.id, "in_progress"); toast.success("Marked in progress"); }}>Mark in progress</Button>}
                <Button size="sm" className="bg-teal hover:bg-teal/90 text-teal-foreground" onClick={() => { markWorkOrderComplete(wo.id); toast.success("Work order completed"); }}><Check className="h-4 w-4" /> Mark complete</Button>
              </div>
            )}
            {wo.completedAt && <div className="text-xs text-muted-foreground">Completed {ukDate(wo.completedAt)}</div>}
          </CardContent>
        </Card>
      )}
    </AppShell>
  );
}

function AddQuoteDialog({ ticketId, contractors, defaultContractorId, onAdd }: { ticketId: string; contractors: ReturnType<typeof useProto>["contacts"]; defaultContractorId?: string; onAdd: (amount: number, contractorContactId: string, notes: string) => void }) {
  const [open, setOpen] = useState(false);
  const [contractorContactId, setContractor] = useState(defaultContractorId ?? contractors[0]?.id ?? "");
  const [amount, setAmount] = useState(0);
  const [notes, setNotes] = useState("");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="outline">Add quote</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add quote for ticket</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div>
            <Label>Contractor</Label>
            <Select value={contractorContactId} onValueChange={setContractor}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{contractors.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Amount (£)</Label><Input type="number" min={0} step={5} value={amount} onChange={(e) => setAmount(Number(e.target.value))} /></div>
          <div><Label>Notes</Label><Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button className="bg-teal hover:bg-teal/90 text-teal-foreground" disabled={!contractorContactId || amount <= 0} onClick={() => { onAdd(amount, contractorContactId, notes); setOpen(false); }}>Submit quote</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AcceptQuoteDialog({ onAccept }: { onAccept: (date: string) => void }) {
  const [open, setOpen] = useState(false);
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const [date, setDate] = useState(tomorrow.toISOString().slice(0, 10));
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" className="bg-teal hover:bg-teal/90 text-teal-foreground">Accept</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Schedule work order</DialogTitle></DialogHeader>
        <div>
          <Label>Scheduled date</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button className="bg-teal hover:bg-teal/90 text-teal-foreground" onClick={() => { onAccept(new Date(date).toISOString()); setOpen(false); }}>Accept &amp; schedule</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
