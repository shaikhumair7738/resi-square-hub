import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProto } from "@/lib/proto-store";
import { gbp } from "@/lib/format";

export const Route = createFileRoute("/app/portal/owner/portfolio")({
  component: OwnerPortfolioPage,
});

function OwnerPortfolioPage() {
  const { properties, tenancies } = useProto();
  const mine = properties.filter((p) => p.ownerContactId === "ct-margaret");

  return (
    <AppShell title="My portfolio" description="Properties under management.">
      <div className="grid gap-4 md:grid-cols-2">
        {mine.map((p) => {
          const t = tenancies.find((tn) => tn.propertyId === p.id && tn.status !== "ended");
          return (
            <Card key={p.id}><CardContent className="pt-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{p.address.line1}</h3>
                  <p className="text-sm text-muted-foreground">{p.address.city} · {p.address.postcode}</p>
                </div>
                <Badge variant="outline" className="capitalize">{p.status}</Badge>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm border-t pt-3">
                <div><span className="text-muted-foreground">Rent</span><div className="font-medium">{gbp(p.rentPcm, { showPence: false })} pcm</div></div>
                <div><span className="text-muted-foreground">Type</span><div className="font-medium capitalize">{p.type}</div></div>
                <div><span className="text-muted-foreground">Tenancy</span><div className="font-medium">{t ? "Active" : "—"}</div></div>
                <div><span className="text-muted-foreground">EPC</span><div className="font-medium">{p.epcRating ?? "—"}</div></div>
              </div>
            </CardContent></Card>
          );
        })}
        {mine.length === 0 && <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No properties on file.</CardContent></Card>}
      </div>
    </AppShell>
  );
}
