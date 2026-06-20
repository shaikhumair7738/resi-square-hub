/**
 * Resisquare seed data — UK addresses, GBP, realistic personas.
 * Static initial dataset; mutable items (properties) are loaded into the
 * ProtoProvider so create/edit/archive persists in localStorage.
 */

export type PropertyType = "flat" | "house" | "hmo" | "bungalow" | "studio";
export type PropertyStatus = "vacant" | "let" | "maintenance" | "marketing";

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  postcode: string;
}

export interface Property {
  id: string;
  workspaceId: string;
  reference: string;
  address: Address;
  type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  status: PropertyStatus;
  rentPcm: number; // GBP per calendar month
  branchId?: string;
  ownerContactId?: string;
  managerStaffId?: string;
  epcRating?: "A" | "B" | "C" | "D" | "E" | "F" | "G";
  gasSafetyExpiry?: string; // ISO
  eicrExpiry?: string;
  archived?: boolean;
  createdAt: string;
  notes?: string;
}

export interface Branch {
  id: string;
  workspaceId: string;
  name: string;
  address: Address;
  phone: string;
}

export interface StaffMember {
  id: string;
  workspaceId: string;
  name: string;
  email: string;
  roleId: "branch_manager" | "property_manager" | "staff" | "accountant";
  branchId?: string;
}

export type ContactKind = "tenant" | "contractor" | "owner" | "landlord" | "lead";

export interface Contact {
  id: string;
  workspaceId: string;
  kind: ContactKind;
  name: string;
  email: string;
  phone: string;
  company?: string;
}

export interface Tenancy {
  id: string;
  propertyId: string;
  tenantContactIds: string[];
  startDate: string; // ISO
  endDate: string;
  rentPcm: number;
  depositGbp: number;
  status: "active" | "ended" | "pending" | "notice";
}

export const SEED_BRANCHES: Branch[] = [
  {
    id: "br-leeds",
    workspaceId: "ws-northstar",
    name: "Leeds City Centre",
    address: { line1: "14 Park Row", city: "Leeds", postcode: "LS1 5HD" },
    phone: "0113 555 0142",
  },
  {
    id: "br-harrogate",
    workspaceId: "ws-northstar",
    name: "Harrogate",
    address: { line1: "32 Station Parade", city: "Harrogate", postcode: "HG1 1UF" },
    phone: "01423 555 0181",
  },
];

export const SEED_STAFF: StaffMember[] = [
  { id: "st-daniel", workspaceId: "ws-northstar", name: "Daniel Okafor", email: "daniel@northstarlettings.co.uk", roleId: "branch_manager", branchId: "br-leeds" },
  { id: "st-priya", workspaceId: "ws-northstar", name: "Priya Shah", email: "priya@northstarlettings.co.uk", roleId: "property_manager", branchId: "br-leeds" },
  { id: "st-ben", workspaceId: "ws-northstar", name: "Ben Carter", email: "ben@northstarlettings.co.uk", roleId: "staff", branchId: "br-harrogate" },
  { id: "st-rachel", workspaceId: "ws-northstar", name: "Rachel Lim", email: "rachel@northstarlettings.co.uk", roleId: "accountant" },
];

export const SEED_CONTACTS: Contact[] = [
  // Northstar tenants
  { id: "ct-oliver", workspaceId: "ws-northstar", kind: "tenant", name: "Oliver Bennett", email: "oliver.bennett@example.co.uk", phone: "07700 900123" },
  { id: "ct-emma", workspaceId: "ws-northstar", kind: "tenant", name: "Emma Walsh", email: "emma.walsh@example.co.uk", phone: "07700 900145" },
  { id: "ct-james", workspaceId: "ws-northstar", kind: "tenant", name: "James Hartley", email: "james.hartley@example.co.uk", phone: "07700 900191" },
  // Northstar owners
  { id: "ct-margaret", workspaceId: "ws-northstar", kind: "owner", name: "Margaret Wilson", email: "m.wilson@example.co.uk", phone: "07700 900233" },
  { id: "ct-raj", workspaceId: "ws-northstar", kind: "owner", name: "Raj Mehta", email: "raj.mehta@example.co.uk", phone: "07700 900277" },
  // Northstar contractors
  { id: "ct-lewis", workspaceId: "ws-northstar", kind: "contractor", name: "Lewis Grant", email: "lewis@northernheating.co.uk", phone: "0113 555 0211", company: "Northern Heating Services Ltd" },
  { id: "ct-sara", workspaceId: "ws-northstar", kind: "contractor", name: "Sara Ali", email: "sara@brightspark-elec.co.uk", phone: "0113 555 0299", company: "Bright Spark Electrical" },
  // Aisha (landlord) tenants & contractors
  { id: "ct-aisha-tenant1", workspaceId: "ws-aisha", kind: "tenant", name: "Chloe Roberts", email: "chloe.r@example.co.uk", phone: "07700 900318" },
  { id: "ct-aisha-tenant2", workspaceId: "ws-aisha", kind: "tenant", name: "Mohammed Iqbal", email: "m.iqbal@example.co.uk", phone: "07700 900322" },
  { id: "ct-aisha-contractor", workspaceId: "ws-aisha", kind: "contractor", name: "Tom Whitaker", email: "tom@whitakerplumbing.co.uk", phone: "0161 555 0144", company: "Whitaker Plumbing" },
];

export const SEED_PROPERTIES: Property[] = [
  {
    id: "pr-park-row-12",
    workspaceId: "ws-northstar",
    reference: "NS-001",
    address: { line1: "Flat 4, 12 Park Row", city: "Leeds", postcode: "LS1 5HD" },
    type: "flat",
    bedrooms: 2,
    bathrooms: 1,
    status: "let",
    rentPcm: 1250,
    branchId: "br-leeds",
    ownerContactId: "ct-margaret",
    managerStaffId: "st-priya",
    epcRating: "C",
    gasSafetyExpiry: "2026-09-12T00:00:00.000Z",
    eicrExpiry: "2029-02-20T00:00:00.000Z",
    createdAt: "2024-01-18T00:00:00.000Z",
  },
  {
    id: "pr-station-parade-32",
    workspaceId: "ws-northstar",
    reference: "NS-002",
    address: { line1: "32 Station Parade", city: "Harrogate", postcode: "HG1 1UF" },
    type: "house",
    bedrooms: 4,
    bathrooms: 2,
    status: "let",
    rentPcm: 1895,
    branchId: "br-harrogate",
    ownerContactId: "ct-raj",
    managerStaffId: "st-priya",
    epcRating: "B",
    gasSafetyExpiry: "2027-01-04T00:00:00.000Z",
    eicrExpiry: "2028-05-19T00:00:00.000Z",
    createdAt: "2023-11-02T00:00:00.000Z",
  },
  {
    id: "pr-headingley-7",
    workspaceId: "ws-northstar",
    reference: "NS-003",
    address: { line1: "7 Cardigan Lane", city: "Leeds", postcode: "LS6 3AB" },
    type: "hmo",
    bedrooms: 5,
    bathrooms: 2,
    status: "marketing",
    rentPcm: 2750,
    branchId: "br-leeds",
    ownerContactId: "ct-margaret",
    managerStaffId: "st-priya",
    epcRating: "D",
    createdAt: "2026-05-04T00:00:00.000Z",
  },
  {
    id: "pr-aisha-1",
    workspaceId: "ws-aisha",
    reference: "AK-001",
    address: { line1: "8 Whalley Range", city: "Manchester", postcode: "M16 8AB" },
    type: "flat",
    bedrooms: 1,
    bathrooms: 1,
    status: "let",
    rentPcm: 825,
    epcRating: "C",
    gasSafetyExpiry: "2026-10-30T00:00:00.000Z",
    createdAt: "2024-06-12T00:00:00.000Z",
  },
  {
    id: "pr-aisha-2",
    workspaceId: "ws-aisha",
    reference: "AK-002",
    address: { line1: "21 Burton Road", city: "Manchester", postcode: "M20 3EB" },
    type: "house",
    bedrooms: 3,
    bathrooms: 2,
    status: "vacant",
    rentPcm: 1495,
    epcRating: "B",
    createdAt: "2025-09-30T00:00:00.000Z",
  },
];

export const SEED_TENANCIES: Tenancy[] = [
  {
    id: "tn-1",
    propertyId: "pr-park-row-12",
    tenantContactIds: ["ct-oliver"],
    startDate: "2025-04-01T00:00:00.000Z",
    endDate: "2027-03-31T00:00:00.000Z",
    rentPcm: 1250,
    depositGbp: 1442,
    status: "active",
  },
  {
    id: "tn-2",
    propertyId: "pr-station-parade-32",
    tenantContactIds: ["ct-emma", "ct-james"],
    startDate: "2024-09-01T00:00:00.000Z",
    endDate: "2026-08-31T00:00:00.000Z",
    rentPcm: 1895,
    depositGbp: 2186,
    status: "notice",
  },
  {
    id: "tn-3",
    propertyId: "pr-aisha-1",
    tenantContactIds: ["ct-aisha-tenant1"],
    startDate: "2024-07-01T00:00:00.000Z",
    endDate: "2026-06-30T00:00:00.000Z",
    rentPcm: 825,
    depositGbp: 952,
    status: "active",
  },
];

export function planPropertyLimit(planId: "landlord" | "agent" | string | undefined): number {
  if (planId === "landlord") return 5;
  if (planId === "agent") return 100;
  return 3;
}
