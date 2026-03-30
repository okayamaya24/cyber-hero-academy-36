import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import { Mail, Send, Eye, AlertTriangle } from "lucide-react";

const recipientOptions = [
  { label: "All Parents", value: "all_parents" },
  { label: "All Teachers", value: "all_teachers" },
  { label: "All Users", value: "all_users" },
  { label: "Specific Email", value: "specific" },
];

export default function AdminEmailCenterPage() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [recipientType, setRecipientType] = useState("all_parents");
  const [specificEmail, setSpecificEmail] = useState("");
  const [viewEmail, setViewEmail] = useState<any>(null);

  const { data: emails, isLoading } = useQuery({
    queryKey: ["admin-emails"],
    queryFn: async () => {
      const { data, error } = await supabase.from("email_log").select("*").order("sent_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const handleSend = () => {
    // Stub — email sending requires Edge Function + Resend API key
    toast.info("Email sending is not yet configured. Set up an email provider (e.g. Resend) in your backend functions to enable this feature.");
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-foreground mb-6">Email Center</h1>

      {/* Compose */}
      <div className="rounded-xl border border-border bg-card p-6 mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2"><Mail className="h-5 w-5" /> Compose Email</h2>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 mb-4 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800">Email sending requires a Resend API key configured in your backend. Emails will be logged but not actually sent until the provider is set up.</p>
        </div>

        <div className="space-y-4 max-w-xl">
          <div><Label>Subject *</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Email subject" /></div>
          <div><Label>Body *</Label><Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} placeholder="Write your email..." /></div>
          <div>
            <Label>Send To</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {recipientOptions.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRecipientType(r.value)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors border ${recipientType === r.value ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted"}`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          {recipientType === "specific" && (
            <div><Label>Recipient Email</Label><Input type="email" value={specificEmail} onChange={(e) => setSpecificEmail(e.target.value)} placeholder="user@example.com" /></div>
          )}
          <Button onClick={handleSend} disabled={!subject.trim() || !body.trim()}>
            <Send className="mr-1.5 h-4 w-4" /> Send Email
          </Button>
        </div>
      </div>

      {/* History */}
      <h2 className="text-lg font-semibold text-foreground mb-4">Email History</h2>
      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}</div>
      ) : (emails ?? []).length === 0 ? (
        <p className="text-muted-foreground text-center py-10">No emails sent yet.</p>
      ) : (
        <div className="space-y-2">
          {(emails ?? []).map((e: any) => (
            <div key={e.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 group">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{e.subject}</p>
                <p className="text-xs text-muted-foreground">{e.recipient_type} · {new Date(e.sent_at).toLocaleDateString()}</p>
              </div>
              <Badge className={e.status === "sent" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>{e.status}</Badge>
              <Button size="sm" variant="ghost" onClick={() => setViewEmail(e)}><Eye className="h-3.5 w-3.5" /></Button>
            </div>
          ))}
        </div>
      )}

      <Sheet open={!!viewEmail} onOpenChange={() => setViewEmail(null)}>
        <SheetContent>
          <SheetHeader><SheetTitle>Email Details</SheetTitle></SheetHeader>
          {viewEmail && (
            <div className="mt-6 space-y-4">
              <div><p className="text-sm text-muted-foreground">Subject</p><p className="font-semibold text-foreground">{viewEmail.subject}</p></div>
              <div><p className="text-sm text-muted-foreground">To</p><p className="text-foreground">{viewEmail.recipient_type}{viewEmail.recipient_email ? ` — ${viewEmail.recipient_email}` : ""}</p></div>
              <div><p className="text-sm text-muted-foreground">Sent</p><p className="text-foreground">{new Date(viewEmail.sent_at).toLocaleString()}</p></div>
              <div><p className="text-sm text-muted-foreground">Body</p><p className="text-foreground whitespace-pre-wrap">{viewEmail.body}</p></div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </AdminLayout>
  );
}
