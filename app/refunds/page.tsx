import type { Metadata } from 'next';
import Link from 'next/link';
import { Crown, ArrowLeft, RefreshCw } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy | Prime eCard',
  description: 'Review the fair, transparent refund and cancellation policy for Prime eCard digital invitations, including our free watermark preview and billing guarantees.',
  alternates: {
    canonical: 'https://primeecard.com/refunds',
  },
};

export default function RefundsPage() {
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
            <span>Prime eCard Satisfaction Guarantee</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-bold text-pearl">
            Refund &amp; Cancellation Policy | Prime eCard
          </h1>
          <p className="text-xs sm:text-sm text-almond/70">
            Last Updated: November 2026 • Transparent Digital Product Policy
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-sm sm:text-base leading-relaxed bg-slate-midnight p-6 sm:p-10 rounded-3xl border border-gold-royal/30 shadow-gold-glow">
          <section className="space-y-3">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-gold-royal">
              1. Free Preview Before Payment
            </h2>
            <p>You can customize and preview your entire invitation for free with a watermark before making any payment. This lets you check all details, animations, and photos to ensure you are completely satisfied before buying.</p>
          </section>

          <hr className="border-gold-royal/20" />

          <section className="space-y-3">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-gold-royal">
              2. After Payment
            </h2>
            <p>Because this is an instant digital product:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your invitation goes live and the watermark is removed immediately after payment is confirmed.</li>
              <li>Due to this instant activation, orders cannot be cancelled and payments cannot be refunded if you change your mind or your event plans change.</li>
            </ul>
          </section>

          <hr className="border-gold-royal/20" />

          <section className="space-y-3">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-gold-royal">
              3. If Something Goes Wrong
            </h2>
            <p>We will gladly fix or refund any accidental billing issues:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Charged Twice:</strong> If your account was debited multiple times for the same card order.</li>
              <li><strong>Link Not Activated:</strong> If payment was deducted from your bank but your card did not go live, and our technical team cannot activate it within 24 hours.</li>
            </ul>
          </section>

          <hr className="border-gold-royal/20" />

          <section className="space-y-3">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-gold-royal">
              4. How to Request a Refund
            </h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Message our support team on WhatsApp with your payment reference or transaction ID and your invitation link.</li>
              <li>Once verified, extra or failed charges will be refunded directly to your original payment method (bank account, card, or UPI).</li>
              <li>Refunds typically take <strong>5 to 7 working days</strong> to reflect in your account.</li>
            </ol>
          </section>

          <hr className="border-gold-royal/20" />

          <section className="space-y-3">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-gold-royal">
              5. Delivery &amp; Shipping
            </h2>
            <p>Prime eCard is a 100% digital web service.</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>No physical items are printed, packed, or shipped.</li>
              <li>Your live card URL and private management access are delivered on your screen instantly once payment succeeds.</li>
            </ul>
          </section>
        </div>

        {/* Footer Note */}
        <div className="text-center text-xs text-almond/50 flex items-center justify-center gap-1.5">
          <RefreshCw className="h-4 w-4 text-gold-royal" />
          <span>Fair Billing • 24/7 WhatsApp Concierge Support</span>
        </div>
      </div>
    </main>
  );
}
