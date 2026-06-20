/**
 * Resisquare prototype state — workspace, role, billing, and the mutable
 * Properties slice (create / edit / archive persisted to localStorage).
 * Static seed for branches, staff, contacts and tenancies lives in seed.ts.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { PlanId, Interval } from "./pricing";
import {
  SEED_BRANCHES,
  SEED_CONTACTS,
  SEED_PROPERTIES,
  SEED_STAFF,
  SEED_TENANCIES,
  type Branch,
  type Contact,
  type Property,
  type StaffMember,
  type Tenancy,
} from "./seed";
import {
  SEED_INVOICES,
  SEED_PAYMENTS,
  SEED_TICKETS,
  SEED_QUOTES,
  SEED_WORK_ORDERS,
  SEED_DOCUMENTS,
  SEED_MESSAGES,
  SEED_CALENDAR,
  SEED_PLATFORM_CUSTOMERS,
  SEED_STRIPE_EVENTS,
  type Invoice,
  type Payment,
  type MaintenanceTicket,
  type Quote,
  type WorkOrder,
  type DocumentItem,
  type MessageItem,
  type CalendarEvent,
  type PlatformCustomer,
  type StripeEvent,
  type TicketStatus,
} from "./seed-extra";

export type WorkspaceType = "platform" | "agency" | "landlord" | "tenant" | "contractor" | "owner";
export type RoleId =
  | "super_admin"
  | "agent_admin"
  | "branch_manager"
  | "staff"
  | "accountant"
  | "property_manager"
  | "landlord_owner"
  | "tenant"
  | "contractor"
  | "owner_portal";

export interface Workspace {
  id: string;
  name: string;
  type: WorkspaceType;
}

export interface RoleOption {
  id: RoleId;
  label: string;
  workspaceId: string;
  description: string;
}

export const WORKSPACES: Workspace[] = [
  { id: "platform", name: "Resisquare Platform", type: "platform" },
  { id: "ws-northstar", name: "Northstar Lettings Ltd", type: "agency" },
  { id: "ws-aisha", name: "Aisha Khan Portfolio", type: "landlord" },
  { id: "ws-tenant-oliver", name: "Oliver Bennett (tenant)", type: "tenant" },
  { id: "ws-contractor-nhs", name: "Northern Heating Services Ltd", type: "contractor" },
  { id: "ws-owner-margaret", name: "Margaret Wilson (owner)", type: "owner" },
];

export const ROLES: RoleOption[] = [
  { id: "super_admin", label: "Resisquare Super Admin", workspaceId: "platform", description: "Operates the platform" },
  { id: "agent_admin", label: "Estate Agent Admin · Amelia Hart", workspaceId: "ws-northstar", description: "Full agency control" },
  { id: "branch_manager", label: "Branch Manager · Daniel Okafor", workspaceId: "ws-northstar", description: "Scoped to branch" },
  { id: "property_manager", label: "Property Manager · Priya Shah", workspaceId: "ws-northstar", description: "Assigned properties only" },
  { id: "staff", label: "Staff · agency", workspaceId: "ws-northstar", description: "Operational tasks" },
  { id: "accountant", label: "Accountant / Invoice Staff", workspaceId: "ws-northstar", description: "Finance focus" },
  { id: "landlord_owner", label: "Landlord Subscriber · Aisha Khan", workspaceId: "ws-aisha", description: "Own portfolio" },
  { id: "tenant", label: "Tenant · Oliver Bennett", workspaceId: "ws-tenant-oliver", description: "Tenant portal" },
  { id: "contractor", label: "Contractor · Lewis Grant", workspaceId: "ws-contractor-nhs", description: "Contractor portal" },
  { id: "owner_portal", label: "Owner · Margaret Wilson", workspaceId: "ws-owner-margaret", description: "Owner portal" },
];

export type BillingStatus = "trialing" | "active" | "past_due" | "cancelled" | "none";

export interface Subscription {
  workspaceId: string;
  planId: PlanId;
  interval: Interval;
  status: BillingStatus;
  trialEndsAt?: string;
  currentPeriodEnd?: string;
  addOns: Record<string, number>;
  cancelAtPeriodEnd?: boolean;
}

interface ProtoState {
  activeRoleId: RoleId;
  subscriptions: Record<string, Subscription>;
  properties: Property[];
  invoices: Invoice[];
  payments: Payment[];
  tickets: MaintenanceTicket[];
  quotes: Quote[];
  workOrders: WorkOrder[];
  messages: MessageItem[];
  staffList: StaffMember[];
}

const STORAGE_KEY = "resisquare.proto.v3";

const DEFAULT_STATE: ProtoState = {
  activeRoleId: "agent_admin",
  subscriptions: {
    "ws-northstar": {
      workspaceId: "ws-northstar",
      planId: "agent",
      interval: "annual",
      status: "active",
      currentPeriodEnd: "2027-03-15T00:00:00.000Z",
      addOns: { "staff-seat": 1 },
    },
    "ws-aisha": {
      workspaceId: "ws-aisha",
      planId: "landlord",
      interval: "monthly",
      status: "trialing",
      trialEndsAt: addDaysISO(new Date(), 14),
      currentPeriodEnd: addDaysISO(new Date(), 14),
      addOns: {},
    },
  },
  properties: SEED_PROPERTIES,
  invoices: SEED_INVOICES,
  payments: SEED_PAYMENTS,
  tickets: SEED_TICKETS,
  quotes: SEED_QUOTES,
  workOrders: SEED_WORK_ORDERS,
  messages: SEED_MESSAGES,
  staffList: SEED_STAFF,
};

function addDaysISO(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

interface ProtoContextValue extends ProtoState {
  setActiveRole: (id: RoleId) => void;
  upsertSubscription: (sub: Subscription) => void;
  cancelSubscription: (workspaceId: string) => void;
  reactivateSubscription: (workspaceId: string) => void;
  setSubscriptionStatus: (workspaceId: string, status: BillingStatus) => void;
  createProperty: (p: Omit<Property, "id" | "createdAt">) => Property;
  updateProperty: (id: string, patch: Partial<Property>) => void;
  archiveProperty: (id: string, archived: boolean) => void;
  recordPayment: (invoiceId: string, amount: number, method: Payment["method"], reference?: string) => void;
  createTicket: (t: Omit<MaintenanceTicket, "id" | "reportedAt" | "status">) => MaintenanceTicket;
  setTicketStatus: (id: string, status: TicketStatus) => void;
  assignContractor: (ticketId: string, contractorContactId: string) => void;
  addQuote: (q: Omit<Quote, "id" | "status" | "submittedAt">) => Quote;
  acceptQuote: (quoteId: string, scheduledFor: string) => void;
  markWorkOrderComplete: (id: string) => void;
  addStaff: (s: Omit<StaffMember, "id">) => StaffMember;
  removeStaff: (id: string) => void;
  markMessageRead: (id: string) => void;
  activeRole: RoleOption;
  activeWorkspace: Workspace;
  // static lookups
  branches: Branch[];
  contacts: Contact[];
  tenancies: Tenancy[];
  documents: DocumentItem[];
  calendar: CalendarEvent[];
  platformCustomers: PlatformCustomer[];
  stripeEvents: StripeEvent[];
}

const ProtoContext = createContext<ProtoContextValue | null>(null);

export function ProtoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProtoState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ProtoState>;
        setState({
          ...DEFAULT_STATE,
          ...parsed,
          subscriptions: { ...DEFAULT_STATE.subscriptions, ...(parsed.subscriptions ?? {}) },
          properties: parsed.properties && parsed.properties.length > 0 ? parsed.properties : DEFAULT_STATE.properties,
        });
      }
    } catch (err) {
      console.warn("proto state hydrate failed", err);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const setActiveRole = useCallback((id: RoleId) => {
    setState((s) => ({ ...s, activeRoleId: id }));
  }, []);

  const upsertSubscription = useCallback((sub: Subscription) => {
    setState((s) => ({ ...s, subscriptions: { ...s.subscriptions, [sub.workspaceId]: sub } }));
  }, []);

  const cancelSubscription = useCallback((workspaceId: string) => {
    setState((s) => {
      const existing = s.subscriptions[workspaceId];
      if (!existing) return s;
      return { ...s, subscriptions: { ...s.subscriptions, [workspaceId]: { ...existing, cancelAtPeriodEnd: true } } };
    });
  }, []);

  const reactivateSubscription = useCallback((workspaceId: string) => {
    setState((s) => {
      const existing = s.subscriptions[workspaceId];
      if (!existing) return s;
      return { ...s, subscriptions: { ...s.subscriptions, [workspaceId]: { ...existing, cancelAtPeriodEnd: false, status: "active" } } };
    });
  }, []);

  const setSubscriptionStatus = useCallback((workspaceId: string, status: BillingStatus) => {
    setState((s) => {
      const existing = s.subscriptions[workspaceId];
      if (!existing) return s;
      return { ...s, subscriptions: { ...s.subscriptions, [workspaceId]: { ...existing, status } } };
    });
  }, []);

  const createProperty = useCallback<ProtoContextValue["createProperty"]>((p) => {
    const newProp: Property = {
      ...p,
      id: `pr-${Math.random().toString(36).slice(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    setState((s) => ({ ...s, properties: [newProp, ...s.properties] }));
    return newProp;
  }, []);

  const updateProperty = useCallback((id: string, patch: Partial<Property>) => {
    setState((s) => ({
      ...s,
      properties: s.properties.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  }, []);

  const archiveProperty = useCallback((id: string, archived: boolean) => {
    setState((s) => ({
      ...s,
      properties: s.properties.map((p) => (p.id === id ? { ...p, archived } : p)),
    }));
  }, []);

  const recordPayment = useCallback<ProtoContextValue["recordPayment"]>((invoiceId, amount, method, reference) => {
    setState((s) => {
      const inv = s.invoices.find((i) => i.id === invoiceId);
      if (!inv) return s;
      const newPaid = Math.min(inv.amount, inv.paid + amount);
      const status: Invoice["status"] = newPaid >= inv.amount ? "paid" : newPaid > 0 ? "part_paid" : inv.status;
      const payment: Payment = { id: `pm-${Math.random().toString(36).slice(2, 9)}`, invoiceId, amount, method, reference, date: new Date().toISOString() };
      return {
        ...s,
        payments: [payment, ...s.payments],
        invoices: s.invoices.map((i) => (i.id === invoiceId ? { ...i, paid: newPaid, status } : i)),
      };
    });
  }, []);

  const createTicket = useCallback<ProtoContextValue["createTicket"]>((t) => {
    const ticket: MaintenanceTicket = { ...t, id: `tk-${Math.random().toString(36).slice(2, 9)}`, reportedAt: new Date().toISOString(), status: "open" };
    setState((s) => ({ ...s, tickets: [ticket, ...s.tickets] }));
    return ticket;
  }, []);

  const setTicketStatus = useCallback((id: string, status: TicketStatus) => {
    setState((s) => ({ ...s, tickets: s.tickets.map((t) => (t.id === id ? { ...t, status } : t)) }));
  }, []);

  const assignContractor = useCallback((ticketId: string, contractorContactId: string) => {
    setState((s) => ({
      ...s,
      tickets: s.tickets.map((t) => (t.id === ticketId ? { ...t, assignedContractorId: contractorContactId, status: t.status === "open" ? "quoting" : t.status } : t)),
    }));
  }, []);

  const addQuote = useCallback<ProtoContextValue["addQuote"]>((q) => {
    const quote: Quote = { ...q, id: `q-${Math.random().toString(36).slice(2, 9)}`, status: "pending", submittedAt: new Date().toISOString() };
    setState((s) => ({ ...s, quotes: [quote, ...s.quotes], tickets: s.tickets.map((t) => (t.id === q.ticketId && t.status === "open" ? { ...t, status: "quoting" } : t)) }));
    return quote;
  }, []);

  const acceptQuote = useCallback((quoteId: string, scheduledFor: string) => {
    setState((s) => {
      const q = s.quotes.find((x) => x.id === quoteId);
      if (!q) return s;
      const woId = `wo-${Math.random().toString(36).slice(2, 9)}`;
      const wo: WorkOrder = { id: woId, ticketId: q.ticketId, quoteId, contractorContactId: q.contractorContactId, scheduledFor, status: "scheduled" };
      return {
        ...s,
        quotes: s.quotes.map((x) => (x.ticketId === q.ticketId ? { ...x, status: x.id === quoteId ? "accepted" : "declined" } : x)),
        workOrders: [wo, ...s.workOrders],
        tickets: s.tickets.map((t) => (t.id === q.ticketId ? { ...t, status: "scheduled", workOrderId: woId, assignedContractorId: q.contractorContactId } : t)),
      };
    });
  }, []);

  const markWorkOrderComplete = useCallback((id: string) => {
    setState((s) => {
      const wo = s.workOrders.find((x) => x.id === id);
      if (!wo) return s;
      return {
        ...s,
        workOrders: s.workOrders.map((x) => (x.id === id ? { ...x, status: "completed", completedAt: new Date().toISOString() } : x)),
        tickets: s.tickets.map((t) => (t.id === wo.ticketId ? { ...t, status: "completed" } : t)),
      };
    });
  }, []);

  const addStaff = useCallback<ProtoContextValue["addStaff"]>((data) => {
    const staffMember: StaffMember = { ...data, id: `st-${Math.random().toString(36).slice(2, 9)}` };
    setState((s) => ({ ...s, staffList: [...s.staffList, staffMember] }));
    return staffMember;
  }, []);

  const removeStaff = useCallback((id: string) => {
    setState((s) => ({ ...s, staffList: s.staffList.filter((x) => x.id !== id) }));
  }, []);

  const markMessageRead = useCallback((id: string) => {
    setState((s) => ({ ...s, messages: s.messages.map((m) => (m.id === id ? { ...m, read: true } : m)) }));
  }, []);

  const value = useMemo<ProtoContextValue>(() => {
    const activeRole = ROLES.find((r) => r.id === state.activeRoleId) ?? ROLES[0];
    const activeWorkspace = WORKSPACES.find((w) => w.id === activeRole.workspaceId) ?? WORKSPACES[0];
    return {
      ...state,
      setActiveRole,
      upsertSubscription,
      cancelSubscription,
      reactivateSubscription,
      setSubscriptionStatus,
      createProperty,
      updateProperty,
      archiveProperty,
      recordPayment,
      createTicket,
      setTicketStatus,
      assignContractor,
      addQuote,
      acceptQuote,
      markWorkOrderComplete,
      addStaff,
      removeStaff,
      markMessageRead,
      activeRole,
      activeWorkspace,
      branches: SEED_BRANCHES,
      contacts: SEED_CONTACTS,
      tenancies: SEED_TENANCIES,
      documents: SEED_DOCUMENTS,
      calendar: SEED_CALENDAR,
      platformCustomers: SEED_PLATFORM_CUSTOMERS,
      stripeEvents: SEED_STRIPE_EVENTS,
    };
  }, [state, setActiveRole, upsertSubscription, cancelSubscription, reactivateSubscription, setSubscriptionStatus, createProperty, updateProperty, archiveProperty, recordPayment, createTicket, setTicketStatus, assignContractor, addQuote, acceptQuote, markWorkOrderComplete, addStaff, removeStaff, markMessageRead]);

  return <ProtoContext.Provider value={value}>{children}</ProtoContext.Provider>;
}

export function useProto(): ProtoContextValue {
  const ctx = useContext(ProtoContext);
  if (!ctx) throw new Error("useProto must be used within ProtoProvider");
  return ctx;
}

// ---------- permission helpers ----------

export interface NavPermissions {
  dashboard: boolean;
  properties: boolean;
  contacts: boolean;
  tenancies: boolean;
  maintenance: boolean;
  invoices: boolean;
  branches: boolean;
  staff: boolean;
  reports: boolean;
  billing: boolean;
  settings: boolean;
}

export function permsForRole(roleId: RoleId): NavPermissions {
  switch (roleId) {
    case "agent_admin":
      return { dashboard: true, properties: true, contacts: true, tenancies: true, maintenance: true, invoices: true, branches: true, staff: true, reports: true, billing: true, settings: true };
    case "branch_manager":
      return { dashboard: true, properties: true, contacts: true, tenancies: true, maintenance: true, invoices: true, branches: false, staff: true, reports: true, billing: false, settings: false };
    case "property_manager":
      return { dashboard: true, properties: true, contacts: true, tenancies: true, maintenance: true, invoices: false, branches: false, staff: false, reports: false, billing: false, settings: false };
    case "staff":
      return { dashboard: true, properties: true, contacts: true, tenancies: true, maintenance: true, invoices: false, branches: false, staff: false, reports: false, billing: false, settings: false };
    case "accountant":
      return { dashboard: true, properties: true, contacts: true, tenancies: true, maintenance: false, invoices: true, branches: false, staff: false, reports: true, billing: true, settings: false };
    case "landlord_owner":
      return { dashboard: true, properties: true, contacts: true, tenancies: true, maintenance: true, invoices: true, branches: false, staff: false, reports: true, billing: true, settings: true };
    default:
      return { dashboard: true, properties: false, contacts: false, tenancies: false, maintenance: false, invoices: false, branches: false, staff: false, reports: false, billing: false, settings: false };
  }
}
