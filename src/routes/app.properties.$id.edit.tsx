import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/app/AppShell";
import { PropertyForm } from "@/components/app/PropertyForm";
import { useProto } from "@/lib/proto-store";

export const Route = createFileRoute("/app/properties/$id/edit")({
  component: EditPropertyPage,
});

function EditPropertyPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { properties, updateProperty, activeWorkspace } = useProto();
  const p = properties.find((x) => x.id === id);

  if (!p) {
    return (
      <AppShell title="Property not found">
        <p className="text-sm text-muted-foreground">
          <Link to="/app/properties" className="underline">Back to properties</Link>
        </p>
      </AppShell>
    );
  }

  return (
    <AppShell title={`Edit ${p.reference}`} description={p.address.line1}>
      <PropertyForm
        submitLabel="Save changes"
        showAgencyFields={activeWorkspace.type === "agency"}
        initial={{
          reference: p.reference,
          line1: p.address.line1,
          line2: p.address.line2 ?? "",
          city: p.address.city,
          postcode: p.address.postcode,
          type: p.type,
          status: p.status,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          rentPcm: p.rentPcm,
          branchId: p.branchId,
          ownerContactId: p.ownerContactId,
          managerStaffId: p.managerStaffId,
          epcRating: p.epcRating,
          gasSafetyExpiry: p.gasSafetyExpiry,
          eicrExpiry: p.eicrExpiry,
          notes: p.notes,
        }}
        onCancel={() => navigate({ to: "/app/properties/$id", params: { id: p.id } })}
        onSubmit={(v) => {
          updateProperty(p.id, {
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
          toast.success("Property updated");
          navigate({ to: "/app/properties/$id", params: { id: p.id } });
        }}
      />
    </AppShell>
  );
}
