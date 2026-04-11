import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center gap-3">
          <Shield className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
        </div>

        <div className="space-y-6 rounded-2xl border bg-card p-8 text-sm text-muted-foreground shadow-card">
          <p className="text-base text-foreground font-medium">Last updated: April 2026</p>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">1. Information We Collect</h2>
            <p>We collect the information you provide when creating an account (name, email address) and information generated through use of the platform (progress, badges, game results). We do not collect unnecessary personal data.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">2. Children's Privacy (COPPA)</h2>
            <p>Cyber Hero Academy complies with the Children's Online Privacy Protection Act (COPPA). We do not knowingly collect personal information directly from children under 13. All child profiles are created and managed by a parent or teacher. We do not sell children's data.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">3. How We Use Your Information</h2>
            <p>We use collected information to provide and improve our service, track learning progress, send account-related communications, and ensure platform security. We do not sell your personal information to third parties.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">4. Data Storage and Security</h2>
            <p>All data is stored securely using industry-standard encryption. We use Supabase for secure data storage and authentication. Passwords are never stored in plain text.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">5. Parental Rights</h2>
            <p>Parents and guardians may review, update, or request deletion of their child's information at any time by contacting us at support@cyberhero.app. We will respond within 30 days.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">6. Cookies</h2>
            <p>We use essential cookies only to maintain your session and provide core functionality. We do not use advertising or tracking cookies.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">7. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify account holders of significant changes by email.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">8. Contact Us</h2>
            <p>If you have questions about this Privacy Policy or your data, contact us at support@cyberhero.app.</p>
          </section>
        </div>

        <div className="mt-6 flex gap-3">
          <Button variant="outline" asChild>
            <Link to="/signup">← Back to Sign Up</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/terms">Terms of Service</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
