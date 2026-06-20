import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useProto } from "@/lib/proto-store";
import { Search, Mail, Phone } from "lucide-react";

export const Route = createFileRoute("/app/contacts/")({
  component: ContactsPage,
});

const KIND_LABEL: Record<string, string> = {
  tenant: "Tenants",
  owner: "Owners / landlords",
  contractor: "Contractors",
  landlord: "Landlords",
  lead: "Leads",
};

function ContactsPage() {
  const { contacts, activeWorkspace, properties, tenancies } = useProto();
  const [tab, setTab] = useState<string>("tenant");
  const [q, setQ] = useState("");

  const ws = contacts.filter((c) => c.workspaceId === activeWorkspace.id);
  const kinds = Array.from(new Set(ws.map((c) => c.kind)));
  const filtered = ws
    .filter((c) => c.kind === tab)
    .filter((c) => !q.trim() || c.name.toLowerCase().includes(q.toLowerCase()) || c.email.toLowerCase().includes(q.toLowerCase()));

  return (
    <AppShell title="Contacts" description="Tenants, owners and contractors across your workspace.">
      <Card>
        <CardContent className="pt-5">
          <Tabs value={tab} onValueChange={setTab}>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <TabsList>
                {kinds.map((k) => (
                  <TabsTrigger key={k} value={k}>
                    {KIND_LABEL[k] ?? k} <Badge variant="secondary" className="ml-2">{ws.filter((c) => c.kind === k).length}</Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-8" placeholder="Search by name or email" value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
            </div>
          </Tabs>

          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Phone</TableHead>
                  <TableHead className="hidden lg:table-cell">Company</TableHead>
                  <TableHead>Linked</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => {
                  const linkedTenancies = tenancies.filter((t) => t.tenantContactIds.includes(c.id));
                  const ownedProps = properties.filter((p) => p.ownerContactId === c.id);
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="hidden md:table-cell"><a href={`mailto:${c.email}`} className="flex items-center gap-1.5 hover:underline"><Mail className="h-3 w-3" /> {c.email}</a></TableCell>
                      <TableCell className="hidden md:table-cell"><span className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {c.phone}</span></TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">{c.company ?? "—"}</TableCell>
                      <TableCell>
                        {linkedTenancies.length > 0 && <Badge variant="outline">{linkedTenancies.length} tenanc{linkedTenancies.length === 1 ? "y" : "ies"}</Badge>}
                        {ownedProps.length > 0 && (
                          <Link to="/app/properties/$id" params={{ id: ownedProps[0].id }} className="ml-1">
                            <Badge variant="outline">{ownedProps.length} propert{ownedProps.length === 1 ? "y" : "ies"}</Badge>
                          </Link>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {filtered.length === 0 && <div className="py-12 text-center text-sm text-muted-foreground">No contacts found.</div>}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
