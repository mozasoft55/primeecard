import type { Metadata } from 'next';
import Link from 'next/link';
import { Crown, ArrowLeft, Lock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Prime eCard',
  description: 'Understand how Prime eCard safeguards your wedding event details, guest RSVP data, uploaded files, and payment security with a strict zero-monetization policy.',
  alternates: {
    canonical: 'https://primeecard.com/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-obsidian-950 text-almond py-16 px-4 sm:px-6 lg:px-8 selection:bg-gold-royal selection:text-obsidian-950">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-gold-royal hover:text-gold-champagne transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Prime eCard Atelier</span>
        </Link>

        {/* Header */}
        <div className="border-b border-gold-royal/20 pb-6 space-y-3">
          <div className="flex items-center gap-2 text-pearl font-heading text-xl font-bold">
            <Crown className="h-6 w-6 text-gold-royal" />
            <span>Prime eCard Privacy Protocol</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-bold text-pearl">
            Privacy Policy | Prime eCard
          </h1>
          <p className="text-xs sm:text-sm text-almond/70">
            Last Updated: November 2026 • Strict Confidentiality & Zero Third-Party Selling Guarantee
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-sm sm:text-base leading-relaxed bg-slate-midnight p-6 sm:p-10 rounded-3xl border border-gold-royal/30 shadow-gold-glow">
          <section className="space-y-3">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-gold-royal">
              1. Information We Collect
            </h2>
            <p>We only collect the details needed to create your invitation and process your order:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Event Details:</strong> Names of the couple, wedding dates, event timings, and venue locations.</li>
              <li><strong>Uploaded Files:</strong> Photos and background music you upload for your card.</li>
              <li><strong>Contact Information:</strong> Your mobile number and email address entered at checkout.</li>
              <li><strong>Guest Responses (RSVP):</strong> Guest names, attendance status, and messages submitted through your invitation page.</li>
            </ul>
          </section>

          <hr className="border-gold-royal/20" />

          <section className="space-y-3">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-gold-royal">
              2. How We Use Your Information
            </h2>
            <p>We use your data only to run our service:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To build, host, and display your digital invitation web page.</li>
              <li>To process payments and activate your live link instantly.</li>
              <li>To collect guest RSVPs and show them in your private admin link.</li>
              <li>To assist you when you contact our support team.</li>
              <li><strong className="text-pearl">We do not sell, rent, or share your personal data with third-party marketers.</strong></li>
            </ul>
          </section>

          <hr className="border-gold-royal/20" />

          <section className="space-y-3">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-gold-royal">
              3. Who Can See Your Information
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Your Invitation:</strong> Anyone who has your public link can view the card. Share your link only with people you want to invite.</li>
              <li><strong>Your RSVP Replies:</strong> Guest responses and edit options are protected. They can only be viewed using your private management link. Keep this private link safe.</li>
            </ul>
          </section>

          <hr className="border-gold-royal/20" />

          <section className="space-y-3">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-gold-royal">
              4. Payments
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>All transactions are processed securely through certified payment gateways (such as Cashfree Payments).</li>
              <li><strong className="text-pearl">Prime eCard does not see or store your card numbers, CVV, bank details, or UPI PINs.</strong></li>
            </ul>
          </section>

          <hr className="border-gold-royal/20" />

          <section className="space-y-3">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-gold-royal">
              5. Deleting Your Data
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Automatic Deletion:</strong> Your digital invitation, uploaded photos, audio files, and RSVP replies are permanently deleted <strong>30 days after your last event</strong>.</li>
              <li><strong>Early Deletion:</strong> If you want your card and files removed earlier, send a message to our WhatsApp support team, and we will delete them within 24 hours.</li>
            </ul>
          </section>
        </div>

        {/* Footer Note */}
        <div className="text-center text-xs text-almond/50 flex items-center justify-center gap-1.5">
          <Lock className="h-4 w-4 text-gold-royal" />
          <span>Zero-Ad • Zero-Spam • Encrypted RSVP Portals</span>
        </div>
      </div>
    </main>
  );
}
