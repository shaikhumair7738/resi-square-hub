/**
 * Phase 3+ seed data — invoices, payments, maintenance, quotes, work orders,
 * documents, messages, and platform customers.
 */
import type { ContactKind } from "./seed";

export interface Invoice {
  id: string;
  propertyId: string;
  tenancyId: string;
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  amount: number;
  paid: number;
  status: "due" | "paid" | "overdue" | "part_paid";
}

export interface Payment {
  id: string;
  invoiceId: string;
  date: string;
  amount: number;
  method: "bank_transfer" | "standing_order" | "card" | "cash";
  reference?: string;
}

export type TicketStatus = "open" | "quoting" | "scheduled" | "in_progress" | "completed" | "cancelled";
export type Priority = "low" | "medium" | "high" | "emergency";

export interface MaintenanceTicket {
  id: string;
  propertyId: string;
  reportedByContactId?: string;
  reportedAt: string;
  title: string;
  description: string;
  priority: Priority;
  status: TicketStatus;
  assignedContractorId?: string;
  workOrderId?: string;
}

export interface Quote {
  id: string;
  ticketId: string;
  contractorContactId: string;
  amount: number;
  notes: string;
  status: "pending" | "accepted" | "declined";
  submittedAt: string;
}

export interface WorkOrder {
  id: string;
  ticketId: string;
  quoteId: string;
  contractorContactId: string;
  scheduledFor: string;
  status: "scheduled" | "in_progress" | "completed";
  completedAt?: string;
}

export interface DocumentItem {
  id: string;
  workspaceId: string;
  propertyId?: string;
  name: string;
  type: "tenancy_agreement" | "gas_safety" | "eicr" | "epc" | "inventory" | "invoice" | "other";
  uploadedAt: string;
  sizeKb: number;
}

export interface MessageItem {
  id: string;
  workspaceId: string;
  from: string;
  to: string;
  propertyId?: string;
  subject: string;
  body: string;
  sentAt: string;
  read: boolean;
}

export interface CalendarEvent {
  id: string;
  workspaceId: string;
  date: string;
  title: string;
  kind: "viewing" | "inspection" | "compliance" | "tenancy" | "maintenance";
  propertyId?: string;
}

export interface PlatformCustomer {
  id: string;
  workspaceId: string;
  name: string;
  type: ContactKind | "agency" | "landlord";
  plan: "landlord" | "agent";
  interval: "monthly" | "annual";
  mrr: number;
  status: "active" | "trialing" | "past_due" | "cancelled";
  signupDate: string;
  country: string;
}

export interface StripeEvent {
  id: string;
  type: string;
  workspaceId: string;
  amount?: number;
  createdAt: string;
  status: "succeeded" | "failed" | "processing";
}

const today = new Date();
const iso = (d: Date) => d.toISOString();
const addDays = (base: Date, n: number) => { const d = new Date(base); d.setDate(d.getDate() + n); return d; };
const addMonths = (base: Date, n: number) => { const d = new Date(base); d.setMonth(d.getMonth() + n); return d; };

export const SEED_INVOICES: Invoice[] = [
  // Park Row tenancy — last 4 months
  { id: "in-1", propertyId: "pr-park-row-12", tenancyId: "tn-1", periodStart: iso(addMonths(today, -3)), periodEnd: iso(addMonths(today, -2)), dueDate: iso(addMonths(today, -3)), amount: 1250, paid: 1250, status: "paid" },
  { id: "in-2", propertyId: "pr-park-row-12", tenancyId: "tn-1", periodStart: iso(addMonths(today, -2)), periodEnd: iso(addMonths(today, -1)), dueDate: iso(addMonths(today, -2)), amount: 1250, paid: 1250, status: "paid" },
  { id: "in-3", propertyId: "pr-park-row-12", tenancyId: "tn-1", periodStart: iso(addMonths(today, -1)), periodEnd: iso(today), dueDate: iso(addDays(today, -5)), amount: 1250, paid: 800, status: "part_paid" },
  { id: "in-4", propertyId: "pr-park-row-12", tenancyId: "tn-1", periodStart: iso(today), periodEnd: iso(addMonths(today, 1)), dueDate: iso(addDays(today, 5)), amount: 1250, paid: 0, status: "due" },
  // Harrogate
  { id: "in-5", propertyId: "pr-station-parade-32", tenancyId: "tn-2", periodStart: iso(addMonths(today, -1)), periodEnd: iso(today), dueDate: iso(addDays(today, -10)), amount: 1895, paid: 0, status: "overdue" },
  { id: "in-6", propertyId: "pr-station-parade-32", tenancyId: "tn-2", periodStart: iso(addMonths(today, -2)), periodEnd: iso(addMonths(today, -1)), dueDate: iso(addMonths(today, -2)), amount: 1895, paid: 1895, status: "paid" },
  // Aisha Manchester
  { id: "in-7", propertyId: "pr-aisha-1", tenancyId: "tn-3", periodStart: iso(addMonths(today, -1)), periodEnd: iso(today), dueDate: iso(addDays(today, -2)), amount: 825, paid: 825, status: "paid" },
  { id: "in-8", propertyId: "pr-aisha-1", tenancyId: "tn-3", periodStart: iso(today), periodEnd: iso(addMonths(today, 1)), dueDate: iso(addDays(today, 8)), amount: 825, paid: 0, status: "due" },
];

export const SEED_PAYMENTS: Payment[] = [
  { id: "pm-1", invoiceId: "in-1", date: iso(addMonths(today, -3)), amount: 1250, method: "standing_order", reference: "OB-RENT" },
  { id: "pm-2", invoiceId: "in-2", date: iso(addMonths(today, -2)), amount: 1250, method: "standing_order", reference: "OB-RENT" },
  { id: "pm-3", invoiceId: "in-3", date: iso(addDays(today, -3)), amount: 800, method: "bank_transfer", reference: "Partial" },
  { id: "pm-4", invoiceId: "in-6", date: iso(addMonths(today, -2)), amount: 1895, method: "standing_order" },
  { id: "pm-5", invoiceId: "in-7", date: iso(addDays(today, -1)), amount: 825, method: "bank_transfer" },
];

export const SEED_TICKETS: MaintenanceTicket[] = [
  {
    id: "tk-1",
    propertyId: "pr-park-row-12",
    reportedByContactId: "ct-oliver",
    reportedAt: iso(addDays(today, -2)),
    title: "Boiler losing pressure",
    description: "Pressure drops to below 1 bar every few days. Hot water still works but heating cuts out.",
    priority: "high",
    status: "quoting",
    assignedContractorId: "ct-lewis",
  },
  {
    id: "tk-2",
    propertyId: "pr-station-parade-32",
    reportedByContactId: "ct-emma",
    reportedAt: iso(addDays(today, -8)),
    title: "Leaking kitchen tap",
    description: "Slow drip from the cold tap, getting worse.",
    priority: "medium",
    status: "scheduled",
    assignedContractorId: "ct-lewis",
    workOrderId: "wo-1",
  },
  {
    id: "tk-3",
    propertyId: "pr-headingley-7",
    reportedAt: iso(addDays(today, -15)),
    title: "Communal hallway light out",
    description: "Bulb replaced once, fitting may be faulty.",
    priority: "low",
    status: "open",
  },
  {
    id: "tk-4",
    propertyId: "pr-aisha-1",
    reportedByContactId: "ct-aisha-tenant1",
    reportedAt: iso(addDays(today, -25)),
    title: "Washing machine not draining",
    description: "Resolved — pump replaced.",
    priority: "medium",
    status: "completed",
    assignedContractorId: "ct-aisha-contractor",
    workOrderId: "wo-2",
  },
];

export const SEED_QUOTES: Quote[] = [
  { id: "q-1", ticketId: "tk-1", contractorContactId: "ct-lewis", amount: 220, notes: "Investigate, repressurise, replace expansion vessel if needed.", status: "pending", submittedAt: iso(addDays(today, -1)) },
  { id: "q-2", ticketId: "tk-2", contractorContactId: "ct-lewis", amount: 95, notes: "Replace tap cartridge.", status: "accepted", submittedAt: iso(addDays(today, -6)) },
  { id: "q-3", ticketId: "tk-4", contractorContactId: "ct-aisha-contractor", amount: 180, notes: "Pump replacement and disposal.", status: "accepted", submittedAt: iso(addDays(today, -22)) },
];

export const SEED_WORK_ORDERS: WorkOrder[] = [
  { id: "wo-1", ticketId: "tk-2", quoteId: "q-2", contractorContactId: "ct-lewis", scheduledFor: iso(addDays(today, 2)), status: "scheduled" },
  { id: "wo-2", ticketId: "tk-4", quoteId: "q-3", contractorContactId: "ct-aisha-contractor", scheduledFor: iso(addDays(today, -23)), status: "completed", completedAt: iso(addDays(today, -22)) },
];

export const SEED_DOCUMENTS: DocumentItem[] = [
  { id: "doc-1", workspaceId: "ws-northstar", propertyId: "pr-park-row-12", name: "AST — Oliver Bennett.pdf", type: "tenancy_agreement", uploadedAt: iso(addMonths(today, -8)), sizeKb: 412 },
  { id: "doc-2", workspaceId: "ws-northstar", propertyId: "pr-park-row-12", name: "Gas Safety 2025.pdf", type: "gas_safety", uploadedAt: iso(addMonths(today, -6)), sizeKb: 188 },
  { id: "doc-3", workspaceId: "ws-northstar", propertyId: "pr-station-parade-32", name: "EICR Report 2024.pdf", type: "eicr", uploadedAt: iso(addMonths(today, -14)), sizeKb: 622 },
  { id: "doc-4", workspaceId: "ws-northstar", propertyId: "pr-park-row-12", name: "EPC Certificate.pdf", type: "epc", uploadedAt: iso(addMonths(today, -10)), sizeKb: 240 },
  { id: "doc-5", workspaceId: "ws-aisha", propertyId: "pr-aisha-1", name: "AST — Chloe Roberts.pdf", type: "tenancy_agreement", uploadedAt: iso(addMonths(today, -16)), sizeKb: 388 },
  { id: "doc-6", workspaceId: "ws-aisha", propertyId: "pr-aisha-1", name: "Inventory check-in.pdf", type: "inventory", uploadedAt: iso(addMonths(today, -16)), sizeKb: 1240 },
];

export const SEED_MESSAGES: MessageItem[] = [
  { id: "ms-1", workspaceId: "ws-northstar", from: "Oliver Bennett", to: "Priya Shah", propertyId: "pr-park-row-12", subject: "Boiler still cutting out", body: "Hi Priya — the heating dropped out again last night. Let me know when the engineer can come.", sentAt: iso(addDays(today, -1)), read: false },
  { id: "ms-2", workspaceId: "ws-northstar", from: "Lewis Grant", to: "Priya Shah", propertyId: "pr-park-row-12", subject: "Quote for boiler repair", body: "Submitted £220 to investigate and replace the expansion vessel if needed.", sentAt: iso(addDays(today, -1)), read: false },
  { id: "ms-3", workspaceId: "ws-northstar", from: "Margaret Wilson", to: "Amelia Hart", propertyId: "pr-park-row-12", subject: "Statement query — March", body: "Could you confirm the management fee on the latest statement?", sentAt: iso(addDays(today, -5)), read: true },
  { id: "ms-4", workspaceId: "ws-aisha", from: "Chloe Roberts", to: "Aisha Khan", propertyId: "pr-aisha-1", subject: "Renewal", body: "Happy to renew for another 12 months — same terms work for me.", sentAt: iso(addDays(today, -3)), read: true },
];

export const SEED_CALENDAR: CalendarEvent[] = [
  { id: "ev-1", workspaceId: "ws-northstar", date: iso(addDays(today, 2)), title: "Boiler repair — 12 Park Row", kind: "maintenance", propertyId: "pr-park-row-12" },
  { id: "ev-2", workspaceId: "ws-northstar", date: iso(addDays(today, 3)), title: "Viewing — 7 Cardigan Lane", kind: "viewing", propertyId: "pr-headingley-7" },
  { id: "ev-3", workspaceId: "ws-northstar", date: iso(addDays(today, 9)), title: "Mid-tenancy inspection — Harrogate", kind: "inspection", propertyId: "pr-station-parade-32" },
  { id: "ev-4", workspaceId: "ws-northstar", date: iso(addDays(today, 21)), title: "Tenancy ends — Harrogate", kind: "tenancy", propertyId: "pr-station-parade-32" },
  { id: "ev-5", workspaceId: "ws-aisha", date: iso(addDays(today, 6)), title: "Gas safety due — Whalley Range", kind: "compliance", propertyId: "pr-aisha-1" },
];

export const SEED_PLATFORM_CUSTOMERS: PlatformCustomer[] = [
  { id: "pc-1", workspaceId: "ws-northstar", name: "Northstar Lettings Ltd", type: "agency", plan: "agent", interval: "annual", mrr: 158, status: "active", signupDate: "2024-03-15T00:00:00.000Z", country: "United Kingdom" },
  { id: "pc-2", workspaceId: "ws-aisha", name: "Aisha Khan Portfolio", type: "landlord", plan: "landlord", interval: "monthly", mrr: 19, status: "trialing", signupDate: iso(addDays(today, -10)), country: "United Kingdom" },
  { id: "pc-3", workspaceId: "ws-other-1", name: "Highgate Property Partners", type: "agency", plan: "agent", interval: "annual", mrr: 184, status: "active", signupDate: "2024-08-22T00:00:00.000Z", country: "United Kingdom" },
  { id: "pc-4", workspaceId: "ws-other-2", name: "James Whitmore", type: "landlord", plan: "landlord", interval: "annual", mrr: 16, status: "active", signupDate: "2024-11-04T00:00:00.000Z", country: "United Kingdom" },
  { id: "pc-5", workspaceId: "ws-other-3", name: "Riverside Residential", type: "agency", plan: "agent", interval: "monthly", mrr: 149, status: "past_due", signupDate: "2025-04-19T00:00:00.000Z", country: "United Kingdom" },
  { id: "pc-6", workspaceId: "ws-other-4", name: "Patel Properties", type: "landlord", plan: "landlord", interval: "monthly", mrr: 0, status: "cancelled", signupDate: "2024-09-30T00:00:00.000Z", country: "United Kingdom" },
];

export const SEED_STRIPE_EVENTS: StripeEvent[] = [
  { id: "se-1", type: "invoice.paid", workspaceId: "ws-northstar", amount: 1788, createdAt: iso(addDays(today, -2)), status: "succeeded" },
  { id: "se-2", type: "customer.subscription.created", workspaceId: "ws-aisha", amount: 22.80, createdAt: iso(addDays(today, -10)), status: "succeeded" },
  { id: "se-3", type: "invoice.payment_failed", workspaceId: "ws-other-3", amount: 178.80, createdAt: iso(addDays(today, -3)), status: "failed" },
  { id: "se-4", type: "customer.subscription.deleted", workspaceId: "ws-other-4", createdAt: iso(addDays(today, -45)), status: "succeeded" },
  { id: "se-5", type: "checkout.session.completed", workspaceId: "ws-aisha", amount: 22.80, createdAt: iso(addDays(today, -10)), status: "succeeded" },
  { id: "se-6", type: "invoice.paid", workspaceId: "ws-other-1", amount: 220.80, createdAt: iso(addDays(today, -8)), status: "succeeded" },
];
