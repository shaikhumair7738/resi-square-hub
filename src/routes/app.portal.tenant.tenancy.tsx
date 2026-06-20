import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProto } from "@/lib/proto-store";
import { gbp, ukDate } from "@/lib/format";

export const Route = createFileRoute("/app/portal/tenant/tenancy")({
  component: TenantTenancyPage,
});

function TenantTenancyPage() {
  // Demo binding: Oliver Bennett tenant
  const { tenancies, properties, contacts } = useProto();
  const me = contacts.find((c) => c.id === "ct-oliver");
  const t = tenancies.find((x) => x.tenantContactIds.includes("ct-oliver"));
  const p = t ? properties.find((x) => x.id === t.propertyId) : undefined;

  return (
    <AppShell title="My tenancy" description={me ? `Logged in as ${me.name}` : ""}>
      {!t || !p ? <p className="text-sm text-muted-foreground">No active tenancy on file.</p> : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base">{p.address.line1}</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-muted-foreground">{p.address.city} · {p.address.postcode}</p>
              <Field label="Start" value={ukDate(t.startDate)} />
              <Field label="End" value={ukDate(t.endDate)} />
              <Field label="Rent" value={`${gbp(t.rentPcm, { showPence: false })} pcm`} />
              <Field label="Deposit" value={gbp(t.depositGbp)} />
              <Field label="Status" valueNode={<Badge variant="outline" className="capitalize">{t.status}</Badge>} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Useful links</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Link to="/app/portal/tenant/payments" className="block underline">View rent statement</Link>
              <Link to="/app/portal/tenant/maintenance" className="block underline">Report a maintenance issue</Link>
              <Link to="/app/documents" className="block underline">Tenancy documents</Link>
              <Link to="/app/messages" className="block underline">Message your property manager</Link>
            </CardContent>
          </Card>
        </div>
      )}
    </AppShell>
  );
}

function Field({ label, value, valueNode }: { label: string; value?: string; valueNode?: React.ReactNode }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{label}</span><span className="font-medium">{valueNode ?? value}</span></div>;
}
