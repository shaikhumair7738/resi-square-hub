import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2, Users, Receipt, Wrench, HardHat, FileText, MessagesSquare, BarChart3, Network, ShieldCheck, CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — Resisquare" },
      { name: "description", content: "Properties, tenancies, rent, maintenance, contractors, documents, communications, reports, branches and staff — built for UK lettings." },
      { property: "og:title", content: "Resisquare features" },
      { property: "og:description", content: "Every module a UK letting agency or landlord needs." },
    ],
  }),
  component: FeaturesPage,
});

const GROUPS = [
  {
    icon: Building2,
    title: "Properties",
    items: [
      "UK address with postcode, property reference, tenure, type, bedrooms, bathrooms",
      "Owner & landlord links, branch and assigned manager",
      "Compliance certificates with issue & expiry dates",
      "Media, documents and activity timeline per property",
      "Archive with history preserved &mdash; no destructive delete",
    ],
  },
  {
    icon: Users,
    title: "Tenancies",
    items: [
      "Tenancy members, main tenant and assigned property manager",
      "Assured periodic wording &mdash; not just fixed terms",
      "Deposit scheme & reference recorded",
      "Rent ledger, invoices, maintenance and documents per tenancy",
    ],
  },
  {
    icon: Receipt,
    title: "Rent & invoices",
    items: [
      "Recurring monthly rent setup",
      "Statuses: Draft, Issued, Partial, Paid, Overdue, Cancelled",
      "Record full or part payments",
      "Downloadable mock invoices and statements",
      "Separate from your Resisquare subscription billing",
    ],
  },
  {
    icon: Wrench,
    title: "Maintenance",
    items: [
      "Tenant-reported issues with photos & availability",
      "Priority triage and manager assignment",
      "Internal quote comparison hidden from tenants",
      "Status progression with timeline auditing",
    ],
  },
  {
    icon: HardHat,
    title: "Contractors",
    items: [
      "Contractor portal with assigned jobs only",
      "Quote, accept, in-progress, completion photo and invoice upload",
      "Work orders with line items and dates",
    ],
  },
  {
    icon: FileText,
    title: "Documents",
    items: [
      "Entity-linked uploads with private, internal or shared visibility",
      "Expiry dates, uploader and audit trail",
      "Preview placeholders for common file types",
    ],
  },
  {
    icon: MessagesSquare,
    title: "Communications",
    items: [
      "Threaded messaging tied to property or job",
      "Participants, unread state and delivery indicators",
      "Tenant & contractor inclusion with appropriate scope",
    ],
  },
  {
    icon: BarChart3,
    title: "Reports",
    items: [
      "Occupancy, rent collection, arrears ageing",
      "Maintenance response and compliance expiries",
      "Branch performance for agencies",
      "Mock CSV / PDF export with permissioned access",
    ],
  },
  {
    icon: Network,
    title: "Branches & staff",
    items: [
      "One workspace, multiple branches with Head Office flag",
      "Role templates: Admin, Branch Manager, Staff, Property Manager, Accountant",
      "Permission editor grouped by module",
      "Invitation flow with branch and role scope",
      "Estate Agent plans only",
    ],
  },
];

function FeaturesPage() {
  return (
    <PublicLayout>
      <section className="container-page py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary">Features</Badge>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Every module, end to end</h1>
          <p className="mt-3 text-muted-foreground">
            Everything Resisquare does, grouped by area. Each module is permission-aware and respects UK lettings terminology.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {GROUPS.map((g) => (
            <Card key={g.title} className="border bg-card shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <g.icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h2 className="text-lg font-semibold">{g.title}</h2>
                </div>
                <ul className="mt-4 space-y-2 text-sm">
                  {g.items.map((it) => (
                    <li key={it} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-teal" aria-hidden="true" />
                      <span dangerouslySetInnerHTML={{ __html: it }} />
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border bg-accent/40 p-6 md:p-10">
          <div className="flex items-start gap-4">
            <ShieldCheck className="h-6 w-6 text-teal" aria-hidden="true" />
            <div>
              <h2 className="text-xl font-semibold">Compliance reminders, not legal advice</h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
                Resisquare surfaces certificate expiries (EPC, Gas Safety, EICR, deposit evidence) and helps you keep
                them current. We are a product, not a regulator. Always confirm UK obligations with a qualified advisor.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
