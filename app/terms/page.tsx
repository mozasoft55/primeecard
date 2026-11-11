import type { Metadata } from 'next';
import Link from 'next/link';
import { Crown, ArrowLeft, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service | Prime eCard',
  description: 'Review the official terms of service, intellectual property, copyright protections, and editing policies for Prime eCard digital wedding invitations.',
  alternates: {
    canonical: 'https://primeecard.com/terms',
  },
};

export default function TermsPage() {
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
            <span>Prime eCard Legal Agreement</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-bold text-pearl">
            Terms of Service | Prime eCard
          </h1>
          <p className="text-xs sm:text-sm text-almond/70">
            Last Updated: November 2026 • Effective for all digital invitations created on primeecard.in and primeecard.com
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-sm sm:text-base leading-relaxed bg-slate-midnight p-6 sm:p-10 rounded-3xl border border-gold-royal/30 shadow-gold-glow">
          <section className="space-y-3">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-gold-royal">
              1. What Prime eCard Provides
            </h2>
            <p>Prime eCard lets you create a digital wedding invitation from pre-made designs and share it using your own custom web link.</p>
            <ul className="list-disc pl-6 space-y-1 text-pearl/90">
              <li>This is a <strong>100% digital product</strong>.</li>
              <li>Nothing is printed, packed, or physically shipped to your address.</li>
            </ul>
          </section>

          <hr className="border-gold-royal/20" />

          <section className="space-y-3">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-gold-royal">
              2. Creating Your Invitation
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Free Preview:</strong> You can customize, test, and view your complete invitation with a watermark for free.</li>
              <li><strong>Instant Activation:</strong> Paying the displayed price removes the watermark immediately and makes your link live for sharing.</li>
            </ul>
          </section>

          <hr className="border-gold-royal/20" />

          <section className="space-y-3">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-gold-royal">
              3. Your Details and Content
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Accuracy:</strong> You are responsible for double-checking all names, event dates, ceremony timings, venue addresses, and uploaded photos before making payment.</li>
              <li><strong>Permissions:</strong> You must have the legal right or permission to use every photo and audio track you upload.</li>
              <li><strong>Content Rules:</strong> Do not upload anything unlawful, offensive, or inappropriate. We reserve the right to remove such content immediately.</li>
            </ul>
          </section>

          <hr className="border-gold-royal/20" />

          <section className="space-y-3">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-gold-royal">
              4. Editing Policy
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You can edit your invitation for up to <strong>3 days (72 hours)</strong> after payment using your private edit link.</li>
              <li>Keep your private edit link safe. Anyone who has access to this link can change your event details.</li>
            </ul>
          </section>

          <hr className="border-gold-royal/20" />

          <section className="space-y-4">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-gold-royal">
              5. How Long Your Link Stays Live
            </h2>
            <div className="overflow-x-auto rounded-xl border border-gold-royal/30">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead className="bg-obsidian-950/80 text-gold-champagne font-semibold border-b border-gold-royal/30">
                  <tr>
                    <th className="p-3 sm:p-4">Card Status</th>
                    <th className="p-3 sm:p-4">Retention Period</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold-royal/15">
                  <tr>
                    <td className="p-3 sm:p-4 font-bold text-pearl">Paid / Live Cards</td>
                    <td className="p-3 sm:p-4">Your link stays active until <strong>30 days after your last function</strong>, after which all data is permanently deleted.</td>
                  </tr>
                  <tr>
                    <td className="p-3 sm:p-4 font-bold text-pearl">Unpaid Drafts</td>
                    <td className="p-3 sm:p-4">Unpaid previews and draft designs are automatically removed <strong>7 days</strong> after the last save.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <hr className="border-gold-royal/20" />

          <section className="space-y-3">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-gold-royal">
              6. Design Ownership and Personal Use
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>All designs, layouts, visual themes, and code remain the intellectual property of <strong>Prime eCard</strong> or its licensors.</li>
              <li>Your payment gives you a personal, single-use license to use the design for your own wedding or event only.</li>
            </ul>
          </section>

          <hr className="border-gold-royal/20" />

          <section className="space-y-3">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-gold-royal">
              7. Copyright Protection
            </h2>
            <p>Everything on <strong>primeecard.in</strong> is protected by copyright law, including:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>All invitation design templates, layout elements, and artwork.</li>
              <li>Interactive animations, website code, visual styles, and written text.</li>
              <li>All rights are strictly reserved by Prime eCard.</li>
            </ul>
          </section>

          <hr className="border-gold-royal/20" />

          <section className="space-y-3">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-gold-royal">
              8. No Copying or Reselling
            </h2>
            <p>You may not copy, download, rebuild, scrape, resell, or distribute any part of this website or its designs without our explicit written permission. Using our designs to make invitations for commercial clients or hosting them on another app or site is strictly prohibited.</p>
          </section>

          <hr className="border-gold-royal/20" />

          <section className="space-y-3">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-gold-royal">
              9. No AI or Machine Learning Use
            </h2>
            <p>You are not allowed to use any part of this website, its designs, templates, artwork, or code to train, fine-tune, or test any Artificial Intelligence (AI) or machine learning models. Automated bots, scrapers, and data-mining crawlers are strictly prohibited.</p>
          </section>

          <hr className="border-gold-royal/20" />

          <section className="space-y-3">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-gold-royal">
              10. Legal Action Against Theft
            </h2>
            <p>Prime eCard takes design theft seriously. If our work is copied, scraped, or resold, we will take legal action, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Submitting takedown notices to web hosts, domain registrars, and social platforms.</li>
              <li>Pursuing civil and criminal legal action under the <strong>Copyright Act, 1957</strong> and the <strong>Information Technology Act, 2000</strong>.</li>
              <li>To report an unauthorized copy of our templates or platform, please message our support team on WhatsApp.</li>
            </ul>
          </section>
        </div>

        {/* Footer Note */}
        <div className="text-center text-xs text-almond/50 flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-gold-royal" />
          <span>Prime eCard Atelier Legal Protocol • Protected Under Indian Law</span>
        </div>
      </div>
    </main>
  );
}
