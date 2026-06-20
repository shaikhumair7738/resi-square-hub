/**
 * Resisquare prototype state — workspace, role, billing, lightweight seeded data.
 * Persisted to localStorage so create/edit flows feel real across navigation.
 * SSR-safe: hooks fall back to defaults until the client hydrates.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { PlanId, Interval } from "./pricing";

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
  trialEndsAt?: string; // ISO
  currentPeriodEnd?: string; // ISO
  addOns: Record<string, number>; // addonId -> qty
  cancelAtPeriodEnd?: boolean;
}

interface ProtoState {
  activeRoleId: RoleId;
  subscriptions: Record<string, Subscription>;
}

const STORAGE_KEY = "resisquare.proto.v1";

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
  activeRole: RoleOption;
  activeWorkspace: Workspace;
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
        const parsed = JSON.parse(raw) as ProtoState;
        setState({ ...DEFAULT_STATE, ...parsed, subscriptions: { ...DEFAULT_STATE.subscriptions, ...parsed.subscriptions } });
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
      return {
        ...s,
        subscriptions: {
          ...s.subscriptions,
          [workspaceId]: { ...existing, cancelAtPeriodEnd: true },
        },
      };
    });
  }, []);

  const reactivateSubscription = useCallback((workspaceId: string) => {
    setState((s) => {
      const existing = s.subscriptions[workspaceId];
      if (!existing) return s;
      return {
        ...s,
        subscriptions: {
          ...s.subscriptions,
          [workspaceId]: { ...existing, cancelAtPeriodEnd: false, status: "active" },
        },
      };
    });
  }, []);

  const setSubscriptionStatus = useCallback((workspaceId: string, status: BillingStatus) => {
    setState((s) => {
      const existing = s.subscriptions[workspaceId];
      if (!existing) return s;
      return {
        ...s,
        subscriptions: { ...s.subscriptions, [workspaceId]: { ...existing, status } },
      };
    });
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
      activeRole,
      activeWorkspace,
    };
  }, [state, setActiveRole, upsertSubscription, cancelSubscription, reactivateSubscription, setSubscriptionStatus]);

  return <ProtoContext.Provider value={value}>{children}</ProtoContext.Provider>;
}

export function useProto(): ProtoContextValue {
  const ctx = useContext(ProtoContext);
  if (!ctx) throw new Error("useProto must be used within ProtoProvider");
  return ctx;
}
