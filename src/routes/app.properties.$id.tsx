import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useProto } from "@/lib/proto-store";
import { gbp, ukDate } from "@/lib/format";
import { ArrowLeft, Pencil, Archive, ArchiveRestore } from "lucide-react";

export const Route = createFileRoute("/app/properties/$id")({
  component: PropertyDetailPage,
});

function PropertyDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { properties, branches, staffList: staff, contacts, tenancies, archiveProperty } = useProto();
  const p = properties.find((x) => x.id === id);
  const [tab, setTab] = useState("overview");

  if (!p) {
    return (
      <AppShell title="Property not found">
        <p className="text-sm text-muted-foreground">
          This property doesn't exist or has been removed.{" "}
          <Link to="/app/properties" className="underline">Back to properties</Link>
        </p>
      </AppShell>
    );
  }

  const branch = branches.find((b) => b.id === p.branchId);
  const owner = contacts.find((c) => c.id === p.ownerContactId);
  const manager = staff.find((s) => s.id === p.managerStaffId);
  const tenancy = tenancies.find((t) => t.propertyId === p.id && t.status !== "ended");
  const tenants = tenancy ? contacts.filter((c) => tenancy.tenantContactIds.includes(c.id)) : [];

  return (
    <AppShell
      title={p.address.line1}
      description={`${p.address.city} · ${p.address.postcode} · Ref ${p.reference}`}
      actions={
        <>
          <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/app/properties" })}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/app/properties/$id/edit" params={{ id: p.id }}>
              <Pencil className="h-4 w-4" /> Edit
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                {p.archived ? <><ArchiveRestore className="h-4 w-4" /> Restore</> : <><Archive className="h-4 w-4" /> Archive</>}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{p.archived ? "Restore this property?" : "Archive this property?"}</AlertDialogTitle>
                <AlertDialogDescription>
                  {p.archived
                    ? "It will be visible again in the active properties list and count toward your plan limit."
                    : "It will be hidden from the active list. Existing tenancies and data are kept and it won't count toward your plan limit."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    archiveProperty(p.id, !p.archived);
                    toast.success(p.archived ? "Property restored" : "Property archived");
                  }}
                >
                  {p.archived ? "Restore" : "Archive"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      }
    >
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tenancy">Tenancy</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="owner">Owner</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2 text-sm">
                <DD label="Status"><Badge variant="outline" className="capitalize">{p.status}</Badge>{p.archived && <Badge variant="outline" className="ml-2">Archived</Badge>}</DD>
                <DD label="Type">{p.type} · {p.bedrooms} bed · {p.bathrooms} bath</DD>
                <DD label="Rent">{gbp(p.rentPcm, { showPence: false })} pcm</DD>
                <DD label="EPC rating">{p.epcRating ?? "—"}</DD>
                <DD label="Gas safety">{p.gasSafetyExpiry ? ukDate(p.gasSafetyExpiry) : "—"}</DD>
                <DD label="EICR">{p.eicrExpiry ? ukDate(p.eicrExpiry) : "—"}</DD>
                <DD label="Added">{ukDate(p.createdAt)}</DD>
                <DD label="Reference">{p.reference}</DD>
              </dl>
              {p.notes && (
                <div className="mt-5 pt-5 border-t">
                  <h4 className="text-xs uppercase tracking-wide font-medium text-muted-foreground">Notes</h4>
                  <p className="mt-2 text-sm">{p.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Assigned</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <DD label="Branch">{branch?.name ?? "—"}</DD>
                <DD label="Property manager">{manager?.name ?? "—"}</DD>
                <DD label="Owner / landlord">{owner?.name ?? "—"}</DD>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Current tenancy</CardTitle></CardHeader>
              <CardContent className="text-sm">
                {tenancy ? (
                  <div className="space-y-2">
                    <div className="flex justify-between"><span className="text-muted-foreground">Tenants</span><span className="text-right">{tenants.map((t) => t.name).join(", ") || "—"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Start</span><span>{ukDate(tenancy.startDate)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">End</span><span>{ukDate(tenancy.endDate)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Deposit</span><span>{gbp(tenancy.depositGbp)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge variant="outline" className="capitalize">{tenancy.status}</Badge></div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No active tenancy.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tenancy" className="mt-4">
          <ComingSoon label="Tenancy management" />
        </TabsContent>
        <TabsContent value="maintenance" className="mt-4">
          <ComingSoon label="Maintenance tickets, quotes & work orders" />
        </TabsContent>
        <TabsContent value="documents" className="mt-4">
          <ComingSoon label="Tenancy agreements, certificates & inventory" />
        </TabsContent>
        <TabsContent value="owner" className="mt-4">
          <ComingSoon label="Owner statements & payouts" />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function DD({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground font-medium">{label}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}

function ComingSoon({ label }: { label: string }) {
  return (
    <Card>
      <CardContent className="py-12 text-center text-sm text-muted-foreground">
        <p className="font-medium text-foreground">{label}</p>
        <p className="mt-1">This area will be wired up in the next phase of the prototype.</p>
      </CardContent>
    </Card>
  );
}
