export type PlanId = "landlord" | "agent";
export type Interval = "monthly" | "annual";

export interface Plan {
  id: PlanId;
  name: string;
  audience: string;
  monthly: number;
  annual: number;
  includes: string[];
  highlights: string[];
}

export const PLANS: Plan[] = [
  {
    id: "landlord",
    name: "Landlord",
    audience: "Self-managing landlords with a small portfolio",
    monthly: 19,
    annual: 190,
    includes: [
      "5 active properties",
      "1 admin user",
      "Unlimited assigned portal users",
      "5 GB document storage",
    ],
    highlights: [
      "Rent ledger & invoices",
      "Tenant & contractor portals",
      "Compliance reminders",
      "Maintenance workflow",
    ],
  },
  {
    id: "agent",
    name: "Estate Agent",
    audience: "Letting & property management agencies with branches and staff",
    monthly: 149,
    annual: 1490,
    includes: [
      "100 active properties",
      "2 branches",
      "5 staff seats",
      "Unlimited portal contacts",
      "25 GB document storage",
    ],
    highlights: [
      "Multi-branch & staff roles",
      "Lead & tenancy pipeline",
      "Bulk rent runs & arrears",
      "Reports & exports",
    ],
  },
];

export interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  appliesTo: PlanId[];
}

export const ADDONS: AddOn[] = [
  {
    id: "pm-seat",
    name: "Property Manager seat",
    description: "Add a dedicated property manager to a Landlord workspace.",
    price: 49,
    unit: "/month",
    appliesTo: ["landlord"],
  },
  {
    id: "landlord-properties",
    name: "+10 properties",
    description: "Extra active property capacity for landlords.",
    price: 10,
    unit: "/month",
    appliesTo: ["landlord"],
  },
  {
    id: "branch",
    name: "Extra branch",
    description: "Add an additional branch beyond the 2 included.",
    price: 25,
    unit: "/month",
    appliesTo: ["agent"],
  },
  {
    id: "staff-seat",
    name: "Staff seat",
    description: "Add a staff user beyond the 5 included.",
    price: 9,
    unit: "/month",
    appliesTo: ["agent"],
  },
  {
    id: "agent-properties",
    name: "+100 properties",
    description: "Extra active property capacity for agencies.",
    price: 35,
    unit: "/month",
    appliesTo: ["agent"],
  },
  {
    id: "storage",
    name: "+25 GB storage",
    description: "Extra document storage.",
    price: 8,
    unit: "/month",
    appliesTo: ["landlord", "agent"],
  },
];

export function planPrice(plan: Plan, interval: Interval): number {
  return interval === "annual" ? plan.annual : plan.monthly;
}

export function intervalLabel(interval: Interval): string {
  return interval === "annual" ? "/year" : "/month";
}
