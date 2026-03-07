import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="Privacy Policy"
        description="MindPrism Privacy Policy — learn how we collect, use, and protect your personal information."
      />

      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <Link href="/">
          <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Go back">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-base font-semibold">Privacy Policy</h1>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-8 pb-20">
        {/* Title block */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight mb-1">Privacy Policy</h2>
          <p className="text-sm text-muted-foreground">Effective Date: March 6, 2026</p>
          <p className="text-sm text-muted-foreground">Last Updated: March 6, 2026</p>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed text-foreground">
          <p className="text-muted-foreground">
            Welcome to MindPrism. We take your privacy seriously. This Privacy Policy explains how MindPrism
            ("we," "us," or "our") collects, uses, stores, and protects your information when you use our
            psychology book summary and learning app ("App"). By using MindPrism, you agree to the practices
            described in this policy.
          </p>

          {/* Section 1 */}
          <section>
            <h3 className="text-base font-semibold mb-3 text-foreground">1. Information We Collect</h3>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <p className="font-medium text-foreground mb-1">Account Information</p>
                <p>
                  When you create an account, we collect information you provide directly, including your
                  name, email address, and profile picture (if applicable). This information is used to
                  identify your account and personalize your experience.
                </p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Reading Habits & Learning Activity</p>
                <p>
                  We collect data about your in-app activity, including the books and chapters you read,
                  reading progress, time spent on content, audio listening history, and navigation patterns.
                  This helps us personalize your content recommendations and track your learning journey.
                </p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Journal Entries</p>
                <p>
                  MindPrism allows you to write personal journal entries. Your journal entries are
                  encrypted at rest using industry-standard encryption. We do not read, analyze, or share
                  the content of your journal entries. Only you can access your journal.
                </p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Quiz Results</p>
                <p>
                  We store the results of quizzes and knowledge checks you complete within the App,
                  including scores, answers, and completion timestamps. This data is used to track
                  your learning progress and adjust content difficulty.
                </p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Saved Highlights</p>
                <p>
                  Text passages and insights you choose to save are stored in your account so you can
                  review them later.
                </p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Device & Technical Information</p>
                <p>
                  We automatically collect certain technical information, including your device type,
                  operating system, browser type, IP address, and crash reports. This information helps
                  us maintain App stability and diagnose technical issues.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h3 className="text-base font-semibold mb-3 text-foreground">2. How We Use Your Information</h3>
            <div className="space-y-3 text-muted-foreground">
              <div>
                <p className="font-medium text-foreground mb-1">Personalization</p>
                <p>
                  We use your reading history, interests selected during onboarding, and in-app activity
                  to recommend books, chapters, and content that match your interests and learning goals.
                </p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Streak & Progress Tracking</p>
                <p>
                  We use your activity data to maintain your learning streak, track milestones, and
                  calculate progress statistics displayed in your Growth Vault.
                </p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Analytics & App Improvement</p>
                <p>
                  Aggregated and anonymized usage data helps us understand how users interact with the
                  App, identify areas for improvement, and develop new features.
                </p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Communications</p>
                <p>
                  We may send you notifications about your streak, new content, and app updates.
                  You can manage notification preferences in the Settings section of your Vault.
                </p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Security & Fraud Prevention</p>
                <p>
                  We use technical information to detect and prevent unauthorized access, abuse,
                  and fraudulent activity.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h3 className="text-base font-semibold mb-3 text-foreground">3. Data Storage & Security</h3>
            <div className="space-y-3 text-muted-foreground">
              <p>
                Your data is stored on secure servers with access controls, firewalls, and monitoring
                systems in place. We use encryption in transit (TLS/HTTPS) for all data exchanged
                between your device and our servers.
              </p>
              <p>
                <span className="font-medium text-foreground">Journal encryption:</span>{" "}
                Journal entries are encrypted at rest. The encryption keys are managed separately from
                the encrypted data, ensuring that even in the event of unauthorized server access,
                your private journal entries remain protected.
              </p>
              <p>
                While we take commercially reasonable measures to protect your data, no system is
                completely secure. We encourage you to use a strong, unique password for your account
                and to contact us immediately if you suspect any unauthorized access.
              </p>
              <p>
                We retain your data for as long as your account is active. If you delete your account,
                we will delete your personal data within 30 days, except where retention is required
                by law.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h3 className="text-base font-semibold mb-3 text-foreground">4. Third-Party Services</h3>
            <div className="space-y-4 text-muted-foreground">
              <p>
                We work with carefully selected third-party service providers to operate the App.
                These providers only receive the data necessary to perform their specific function.
              </p>
              <div>
                <p className="font-medium text-foreground mb-1">Stripe (Payment Processing)</p>
                <p>
                  If you subscribe to MindPrism Premium, payment processing is handled by Stripe, Inc.
                  We do not store your full credit card details on our servers. Stripe processes and
                  stores payment information in accordance with PCI-DSS standards. Stripe's privacy
                  policy is available at{" "}
                  <a
                    href="https://stripe.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-2"
                  >
                    stripe.com/privacy
                  </a>
                  .
                </p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Sentry (Error Tracking)</p>
                <p>
                  We use Sentry to monitor and diagnose technical errors in the App. When the App
                  encounters an error, Sentry may collect diagnostic information including device
                  information, the error stack trace, and the page or action that triggered the error.
                  Sentry's privacy policy is available at{" "}
                  <a
                    href="https://sentry.io/privacy/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-2"
                  >
                    sentry.io/privacy
                  </a>
                  .
                </p>
              </div>
              <p>
                We do not sell, rent, or share your personal information with third parties for their
                own marketing purposes.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h3 className="text-base font-semibold mb-3 text-foreground">5. Children's Privacy</h3>
            <p className="text-muted-foreground">
              MindPrism is not intended for use by children under the age of 13. We do not knowingly
              collect personal information from children under 13. If you are a parent or guardian and
              believe your child has provided us with personal information, please contact us at{" "}
              <a href="mailto:support@mindprism.io" className="text-primary underline underline-offset-2">
                support@mindprism.io
              </a>{" "}
              and we will promptly delete such information from our systems.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h3 className="text-base font-semibold mb-3 text-foreground">6. Your Rights & Data Deletion</h3>
            <div className="space-y-3 text-muted-foreground">
              <p>You have the following rights regarding your personal data:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <span className="font-medium text-foreground">Access:</span> You can request a copy
                  of the personal data we hold about you.
                </li>
                <li>
                  <span className="font-medium text-foreground">Correction:</span> You can request
                  that we correct inaccurate or incomplete data.
                </li>
                <li>
                  <span className="font-medium text-foreground">Deletion:</span> You can delete your
                  account at any time from the Settings tab in your Growth Vault. Account deletion
                  permanently removes your profile, journal entries, reading progress, quiz results,
                  saved highlights, and all other associated data. This action is irreversible.
                </li>
                <li>
                  <span className="font-medium text-foreground">Portability:</span> You can request
                  an export of your personal data.
                </li>
              </ul>
              <p>
                To exercise any of these rights, use the in-app account deletion feature in Settings,
                or contact us at{" "}
                <a href="mailto:support@mindprism.io" className="text-primary underline underline-offset-2">
                  support@mindprism.io
                </a>
                .
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section>
            <h3 className="text-base font-semibold mb-3 text-foreground">7. Cookies & Tracking Technologies</h3>
            <p className="text-muted-foreground">
              We use session cookies and local storage to keep you logged in and maintain your
              preferences. We do not use third-party advertising cookies. You can clear cookies
              through your browser or device settings, but this may require you to log in again.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h3 className="text-base font-semibold mb-3 text-foreground">8. Changes to This Policy</h3>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. When we make material changes,
              we will notify you through the App or by email. The "Last Updated" date at the top
              of this page will reflect when changes were last made. Continued use of MindPrism
              after changes are posted constitutes your acceptance of the updated policy.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h3 className="text-base font-semibold mb-3 text-foreground">9. Contact Us</h3>
            <p className="text-muted-foreground">
              If you have questions, concerns, or requests regarding this Privacy Policy or your
              personal data, please contact us at:
            </p>
            <div className="mt-3 p-4 rounded-xl border border-border bg-muted/30 text-sm space-y-1">
              <p className="font-medium text-foreground">MindPrism Support</p>
              <p className="text-muted-foreground">
                Email:{" "}
                <a
                  href="mailto:support@mindprism.io"
                  className="text-primary underline underline-offset-2"
                >
                  support@mindprism.io
                </a>
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            MindPrism — Big Ideas, Made Simple
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            © {new Date().getFullYear()} MindPrism. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
