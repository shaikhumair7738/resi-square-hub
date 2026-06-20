import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, MapPin } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & demo — Resisquare" },
      { name: "description", content: "Talk to the Resisquare team or book a live demo. UK-based product." },
      { property: "og:title", content: "Contact Resisquare" },
      { property: "og:description", content: "Get in touch or book a demo." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  return (
    <PublicLayout>
      <section className="container-page py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-[1fr_1.2fr]">
          <div className="space-y-6">
            <Badge variant="secondary">Contact</Badge>
            <h1 className="text-4xl font-semibold tracking-tight">Book a demo or ask us anything</h1>
            <p className="text-muted-foreground">
              Tell us a little about your portfolio or agency and we&apos;ll be in touch within one working day.
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3"><Mail className="h-4 w-4 text-teal" aria-hidden="true" /> hello@resisquare.example</li>
              <li className="flex items-center gap-3"><Phone className="h-4 w-4 text-teal" aria-hidden="true" /> +44 161 000 0000</li>
              <li className="flex items-center gap-3"><MapPin className="h-4 w-4 text-teal" aria-hidden="true" /> Manchester, United Kingdom</li>
            </ul>
            <div className="rounded-xl border bg-accent/40 p-4 text-sm text-muted-foreground">
              This is a sample contact page for the Resisquare prototype. Submitting the form simulates a success toast and does not send a real email.
            </div>
          </div>
          <Card className="border bg-card shadow-card">
            <CardContent className="p-6 md:p-8">
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitting(true);
                  setTimeout(() => {
                    setSubmitting(false);
                    toast.success("Thanks &mdash; we'll be in touch within one working day.");
                    (e.target as HTMLFormElement).reset();
                  }, 700);
                }}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id="first" label="First name" />
                  <Field id="last" label="Last name" />
                </div>
                <Field id="email" label="Work email" type="email" required />
                <Field id="company" label="Company or portfolio name" />
                <div>
                  <Label htmlFor="type">I am</Label>
                  <Select defaultValue="agent">
                    <SelectTrigger id="type" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agent">An estate / letting agent</SelectItem>
                      <SelectItem value="landlord">A self-managing landlord</SelectItem>
                      <SelectItem value="other">Something else</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="msg">What would you like to discuss?</Label>
                  <Textarea id="msg" rows={4} className="mt-1" placeholder="A few words about what you're looking for" />
                </div>
                <Button type="submit" disabled={submitting} className="w-full bg-teal hover:bg-teal/90 text-teal-foreground">
                  {submitting ? "Sending…" : "Request demo"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </PublicLayout>
  );
}

function Field({ id, label, type = "text", required }: { id: string; label: string; type?: string; required?: boolean }) {
  return (
    <div>
      <Label htmlFor={id}>{label}{required ? <span className="ml-1 text-destructive">*</span> : null}</Label>
      <Input id={id} type={type} required={required} className="mt-1" />
    </div>
  );
}
