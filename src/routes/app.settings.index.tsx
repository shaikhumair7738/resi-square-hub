import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProto } from "@/lib/proto-store";

export const Route = createFileRoute("/app/settings/")({
  component: SettingsPage,
});

function SettingsPage() {
  const { activeWorkspace } = useProto();
  const [name, setName] = useState(activeWorkspace.name);
  const [email, setEmail] = useState("billing@northstarlettings.co.uk");
  const [phone, setPhone] = useState("0113 555 0142");
  const [vat, setVat] = useState("GB 123 4567 89");
  const [address, setAddress] = useState("14 Park Row, Leeds, LS1 5HD");
  const [bio, setBio] = useState("Family-run letting agency covering Leeds and Harrogate since 2009.");

  return (
    <AppShell title="Settings" description="Workspace and company profile.">
      <form className="space-y-4 max-w-3xl" onSubmit={(e) => { e.preventDefault(); toast.success("Settings saved"); }}>
        <Card>
          <CardHeader><CardTitle className="text-base">Company profile</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><Label>Trading name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div><Label>Billing email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
            <div><Label>VAT number</Label><Input value={vat} onChange={(e) => setVat(e.target.value)} /></div>
            <div className="sm:col-span-2"><Label>Registered address</Label><Input value={address} onChange={(e) => setAddress(e.target.value)} /></div>
            <div className="sm:col-span-2"><Label>About</Label><Textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} /></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Branding</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">Brand colour, logo and email templates will appear here in a later phase.</CardContent>
        </Card>
        <div className="flex justify-end"><Button type="submit" className="bg-teal hover:bg-teal/90 text-teal-foreground">Save changes</Button></div>
      </form>
    </AppShell>
  );
}
