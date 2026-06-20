import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import type { Property, PropertyStatus, PropertyType } from "@/lib/seed";
import { useProto } from "@/lib/proto-store";

export interface PropertyFormValues {
  reference: string;
  line1: string;
  line2: string;
  city: string;
  postcode: string;
  type: PropertyType;
  status: PropertyStatus;
  bedrooms: number;
  bathrooms: number;
  rentPcm: number;
  branchId?: string;
  ownerContactId?: string;
  managerStaffId?: string;
  epcRating?: Property["epcRating"];
  gasSafetyExpiry?: string;
  eicrExpiry?: string;
  notes?: string;
}

interface Props {
  initial?: Partial<PropertyFormValues>;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (values: PropertyFormValues) => void;
  showAgencyFields: boolean;
}

export function PropertyForm({ initial, submitLabel, onCancel, onSubmit, showAgencyFields }: Props) {
  const { branches, staff, contacts, activeWorkspace } = useProto();
  const wsBranches = branches.filter((b) => b.workspaceId === activeWorkspace.id);
  const wsStaff = staff.filter((s) => s.workspaceId === activeWorkspace.id);
  const wsOwners = contacts.filter((c) => c.workspaceId === activeWorkspace.id && c.kind === "owner");

  const [v, setV] = useState<PropertyFormValues>({
    reference: initial?.reference ?? "",
    line1: initial?.line1 ?? "",
    line2: initial?.line2 ?? "",
    city: initial?.city ?? "",
    postcode: initial?.postcode ?? "",
    type: initial?.type ?? "flat",
    status: initial?.status ?? "vacant",
    bedrooms: initial?.bedrooms ?? 1,
    bathrooms: initial?.bathrooms ?? 1,
    rentPcm: initial?.rentPcm ?? 0,
    branchId: initial?.branchId,
    ownerContactId: initial?.ownerContactId,
    managerStaffId: initial?.managerStaffId,
    epcRating: initial?.epcRating,
    gasSafetyExpiry: initial?.gasSafetyExpiry,
    eicrExpiry: initial?.eicrExpiry,
    notes: initial?.notes ?? "",
  });

  function set<K extends keyof PropertyFormValues>(k: K, val: PropertyFormValues[K]) {
    setV((s) => ({ ...s, [k]: val }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit(v);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Card>
        <CardContent className="pt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Reference" required>
            <Input value={v.reference} onChange={(e) => set("reference", e.target.value)} placeholder="e.g. NS-004" required />
          </Field>
          <Field label="Status">
            <Select value={v.status} onValueChange={(val) => set("status", val as PropertyStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="vacant">Vacant</SelectItem>
                <SelectItem value="let">Let</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Address line 1" required>
            <Input value={v.line1} onChange={(e) => set("line1", e.target.value)} required />
          </Field>
          <Field label="Address line 2 (optional)">
            <Input value={v.line2} onChange={(e) => set("line2", e.target.value)} />
          </Field>
          <Field label="Town / city" required>
            <Input value={v.city} onChange={(e) => set("city", e.target.value)} required />
          </Field>
          <Field label="Postcode" required>
            <Input value={v.postcode} onChange={(e) => set("postcode", e.target.value.toUpperCase())} placeholder="LS1 5HD" required />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Type">
            <Select value={v.type} onValueChange={(val) => set("type", val as PropertyType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="flat">Flat</SelectItem>
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="hmo">HMO</SelectItem>
                <SelectItem value="bungalow">Bungalow</SelectItem>
                <SelectItem value="studio">Studio</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Bedrooms">
            <Input type="number" min={0} value={v.bedrooms} onChange={(e) => set("bedrooms", Number(e.target.value))} />
          </Field>
          <Field label="Bathrooms">
            <Input type="number" min={0} value={v.bathrooms} onChange={(e) => set("bathrooms", Number(e.target.value))} />
          </Field>
          <Field label="Rent (£ pcm)">
            <Input type="number" min={0} step={5} value={v.rentPcm} onChange={(e) => set("rentPcm", Number(e.target.value))} />
          </Field>
          <Field label="EPC rating">
            <Select value={v.epcRating ?? ""} onValueChange={(val) => set("epcRating", (val || undefined) as Property["epcRating"])}>
              <SelectTrigger><SelectValue placeholder="Not set" /></SelectTrigger>
              <SelectContent>
                {(["A", "B", "C", "D", "E", "F", "G"] as const).map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Gas safety expiry">
            <Input type="date" value={v.gasSafetyExpiry?.slice(0, 10) ?? ""} onChange={(e) => set("gasSafetyExpiry", e.target.value ? new Date(e.target.value).toISOString() : undefined)} />
          </Field>
          <Field label="EICR expiry">
            <Input type="date" value={v.eicrExpiry?.slice(0, 10) ?? ""} onChange={(e) => set("eicrExpiry", e.target.value ? new Date(e.target.value).toISOString() : undefined)} />
          </Field>
        </CardContent>
      </Card>

      {showAgencyFields && (
        <Card>
          <CardContent className="pt-6 grid gap-4 sm:grid-cols-3">
            <Field label="Branch">
              <Select value={v.branchId ?? ""} onValueChange={(val) => set("branchId", val || undefined)}>
                <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                <SelectContent>
                  {wsBranches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Property manager">
              <Select value={v.managerStaffId ?? ""} onValueChange={(val) => set("managerStaffId", val || undefined)}>
                <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                <SelectContent>
                  {wsStaff.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Owner / landlord contact">
              <Select value={v.ownerContactId ?? ""} onValueChange={(val) => set("ownerContactId", val || undefined)}>
                <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                <SelectContent>
                  {wsOwners.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <Field label="Internal notes">
            <Textarea rows={3} value={v.notes ?? ""} onChange={(e) => set("notes", e.target.value)} placeholder="Optional context for the team" />
          </Field>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-teal hover:bg-teal/90 text-teal-foreground">{submitLabel}</Button>
      </div>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}
