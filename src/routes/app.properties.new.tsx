import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/app/AppShell";
import { PropertyForm } from "@/components/app/PropertyForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useProto } from "@/lib/proto-store";
import { planPropertyLimit } from "@/lib/seed";
import { AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/app/properties/new")({
  component: NewPropertyPage,
});

function NewPropertyPage() {
  const navigate = useNavigate();
  const { activeWorkspace, properties, subscriptions, createProperty } = useProto();
  const sub = subscriptions[activeWorkspace.id];
  const limit = planPropertyLimit(sub?.planId);
  const activeCount = properties.filter((p) => p.workspaceId === activeWorkspace.id && !p.archived).length;
  const atLimit = activeCount >= limit;
  const isAgency = activeWorkspace.type === "agency";

  return (
    <AppShell
      title="Add property"
      description={`New property for ${activeWorkspace.name}.`}
    >
      {atLimit ? (
        <Alert className="border-warn/40 bg-warn/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Plan limit reached</AlertTitle>
          <AlertDescription>
            You're at {activeCount} of {limit} properties. Upgrade your plan or add the extra-properties add-on to add another.
          </AlertDescription>
        </Alert>
      ) : (
        <PropertyForm
          submitLabel="Create property"
          showAgencyFields={isAgency}
          onCancel={() => navigate({ to: "/app/properties" })}
          onSubmit={(v) => {
            const created = createProperty({
              workspaceId: activeWorkspace.id,
              reference: v.reference,
              address: { line1: v.line1, line2: v.line2 || undefined, city: v.city, postcode: v.postcode },
              type: v.type,
              status: v.status,
              bedrooms: v.bedrooms,
              bathrooms: v.bathrooms,
              rentPcm: v.rentPcm,
              branchId: v.branchId,
              ownerContactId: v.ownerContactId,
              managerStaffId: v.managerStaffId,
              epcRating: v.epcRating,
              gasSafetyExpiry: v.gasSafetyExpiry,
              eicrExpiry: v.eicrExpiry,
              notes: v.notes,
            });
            toast.success(`Property ${created.reference} created`);
            navigate({ to: "/app/properties/$id", params: { id: created.id } });
          }}
        />
      )}
    </AppShell>
  );
}
