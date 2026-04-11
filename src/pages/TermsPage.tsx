import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center gap-3">
          <Shield className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold">Terms of Service</h1>
        </div>

        <div className="space-y-6 rounded-2xl border bg-card p-8 text-sm text-muted-foreground shadow-card">
          <p className="text-base text-foreground font-medium">Last updated: April 2026</p>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">1. Acceptance of Terms</h2>
            <p>By creating an account and using Cyber Hero Academy, you agree to these Terms of Service. If you do not agree, please do not use this service.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">2. Who Can Use This Service</h2>
            <p>Cyber Hero Academy is designed for children ages 5–12, used under the supervision of a parent, guardian, or teacher. Accounts must be created by an adult (18+) on behalf of a child.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">3. Account Responsibilities</h2>
            <p>You are responsible for keeping your login credentials secure and for all activity that occurs under your account. Please notify us immediately of any unauthorized use.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">4. Content and Use</h2>
            <p>All educational content provided is for personal, non-commercial use only. You may not copy, redistribute, or resell any content from Cyber Hero Academy.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">5. Subscriptions and Payments</h2>
            <p>Some features may require a paid subscription. All payments are processed securely. Refund requests are handled on a case-by-case basis within 14 days of purchase.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">6. Termination</h2>
            <p>We reserve the right to suspend or terminate accounts that violate these terms or engage in abusive behavior.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">7. Changes to Terms</h2>
            <p>We may update these terms from time to time. Continued use of the service after changes are posted constitutes your acceptance of the updated terms.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">8. Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us at support@cyberhero.app.</p>
          </section>
        </div>

        <div className="mt-6 flex gap-3">
          <Button variant="outline" asChild>
            <Link to="/signup">← Back to Sign Up</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/privacy">Privacy Policy</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
