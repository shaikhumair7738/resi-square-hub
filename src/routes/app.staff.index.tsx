import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProto } from "@/lib/proto-store";
import type { StaffMember } from "@/lib/seed";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/app/staff/")({
  component: StaffPage,
});

const ROLE_LABEL: Record<StaffMember["roleId"], string> = {
  branch_manager: "Branch manager",
  property_manager: "Property manager",
  staff: "Staff",
  accountant: "Accountant",
};

function StaffPage() {
  const { staffList, branches, activeWorkspace, addStaff, removeStaff } = useProto();
  const ws = staffList.filter((s) => s.workspaceId === activeWorkspace.id);
  const wsBranches = branches.filter((b) => b.workspaceId === activeWorkspace.id);

  return (
    <AppShell
      title="Staff & roles"
      description="Manage who has access to your workspace and what they can do."
      actions={<InviteDialog wsBranches={wsBranches} onInvite={(s) => { addStaff({ ...s, workspaceId: activeWorkspace.id }); toast.success(`${s.name} invited`); }} />}
    >
      <Card>
        <CardContent className="pt-5 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden md:table-cell">Branch</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ws.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-sm">{s.email}</TableCell>
                  <TableCell><Badge variant="outline">{ROLE_LABEL[s.roleId]}</Badge></TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{wsBranches.find((b) => b.id === s.branchId)?.name ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => { removeStaff(s.id); toast.success("Staff removed"); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {ws.length === 0 && <div className="py-10 text-center text-sm text-muted-foreground">No staff yet. Invite your team to get started.</div>}
        </CardContent>
      </Card>
    </AppShell>
  );
}

function InviteDialog({ wsBranches, onInvite }: { wsBranches: ReturnType<typeof useProto>["branches"]; onInvite: (s: Omit<StaffMember, "id" | "workspaceId">) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roleId, setRole] = useState<StaffMember["roleId"]>("staff");
  const [branchId, setBranch] = useState<string>("");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" className="bg-teal hover:bg-teal/90 text-teal-foreground"><Plus className="h-4 w-4" /> Invite staff</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Invite a team member</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><Label>Work email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div>
            <Label>Role</Label>
            <Select value={roleId} onValueChange={(v) => setRole(v as StaffMember["roleId"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(ROLE_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {wsBranches.length > 0 && (
            <div>
              <Label>Branch (optional)</Label>
              <Select value={branchId} onValueChange={setBranch}>
                <SelectTrigger><SelectValue placeholder="No branch" /></SelectTrigger>
                <SelectContent>{wsBranches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button className="bg-teal hover:bg-teal/90 text-teal-foreground" disabled={!name || !email} onClick={() => { onInvite({ name, email, roleId, branchId: branchId || undefined }); setOpen(false); setName(""); setEmail(""); setBranch(""); }}>Send invite</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
