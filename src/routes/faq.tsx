import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Resisquare" },
      { name: "description", content: "Common questions about plans, trials, portals, VAT and the simulated checkout in this prototype." },
      { property: "og:title", content: "Resisquare FAQ" },
      { property: "og:description", content: "Trial, billing, portals, branches and prototype notes." },
    ],
  }),
  component: FaqPage,
});

const FAQS = [
  {
    q: "How does the 14-day free trial work?",
    a: "You pick a plan and create a workspace. No card is taken upfront in this prototype. After 14 days a real Resisquare account would charge your saved payment method automatically. You can cancel at any time during the trial.",
  },
  {
    q: "What is the difference between a Landlord workspace and a Landlord contact?",
    a: "A Landlord contact inside an agency workspace is a view-only record managed by the agency. A Landlord plan creates a separate workspace owned by that landlord, with their own properties, tenancies, finances and portal users. Buying a Landlord plan never grants edit access inside an agency.",
  },
  {
    q: "Do tenants, contractors or owners count as paid seats?",
    a: "No. Tenant, Contractor and Owner portals are free across every plan. Only Estate Agent staff seats (Admin, Branch Manager, Staff, Property Manager, Accountant) consume the staff allowance on the Estate Agent plan.",
  },
  {
    q: "Can a landlord get a Property Manager?",
    a: "Yes. Landlord workspaces can add a Property Manager seat add-on for £49/month + VAT. That manager then sees only the landlord's portfolio, and operates with the same maintenance and tenancy tools as an agency property manager.",
  },
  {
    q: "Is this a real Stripe checkout?",
    a: "No. This is a clickable prototype. The checkout screens are labelled 'Simulated Stripe Checkout' and never request a real card number. They let reviewers demonstrate the successful, failed and cancelled lifecycles end to end.",
  },
  {
    q: "Why are prices shown excluding VAT?",
    a: "Resisquare prices are quoted ex-VAT to match B2B UK norms. VAT is shown as a placeholder line in the order summary. Once we are VAT registered we will add VAT to invoices automatically.",
  },
  {
    q: "Can I move from monthly to annual later?",
    a: "Yes. From Plan & Billing you can change interval, add capacity, upgrade or downgrade. We show a clear price preview before confirming, and prorate the difference for the remainder of the period.",
  },
  {
    q: "What happens if my payment fails?",
    a: "Your workspace enters a past-due grace period. You see a banner everywhere with a one-click 'Update payment method' action. Billing, exports and support stay available; create/edit on properties is paused until you settle.",
  },
];

function FaqPage() {
  return (
    <PublicLayout>
      <section className="container-page py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary">FAQ</Badge>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Frequently asked questions</h1>
          <p className="mt-3 text-muted-foreground">
            Quick answers about plans, portals and how this prototype behaves.
          </p>
        </div>
        <div className="mx-auto mt-10 max-w-3xl">
          <Accordion type="single" collapsible className="rounded-2xl border bg-card shadow-card divide-y">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-0 px-4">
                <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </PublicLayout>
  );
}
