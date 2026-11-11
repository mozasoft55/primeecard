'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, FileText, RefreshCw, Lock } from 'lucide-react';

export type LegalDocType = 'terms' | 'privacy' | 'refunds' | null;

interface LegalModalProps {
  type: LegalDocType;
  onClose: () => void;
}

export default function LegalModal({ type, onClose }: LegalModalProps) {
  if (!type) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-obsidian-950/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl border-2 border-gold-royal/40 bg-slate-midnight p-6 sm:p-10 shadow-gold-glow-lg z-10 text-almond selection:bg-gold-royal selection:text-obsidian-950"
          role="dialog"
          aria-modal="true"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="sticky top-0 float-right -mt-2 -mr-2 rounded-full bg-obsidian-900/80 p-2 text-almond/70 hover:text-pearl transition-colors border border-gold-royal/20 z-20"
            aria-label="Close legal modal"
          >
            <X className="h-5 w-5" />
          </button>

          {/* ========================================================
              TERMS OF SERVICE
             ======================================================== */}
          {type === 'terms' && (
            <div className="space-y-6 clear-both">
              <div className="space-y-2 border-b border-gold-royal/20 pb-4">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-gold-royal/10 border border-gold-royal/30 px-3 py-1 text-[11px] font-semibold text-gold-champagne">
                  <FileText className="h-3.5 w-3.5 text-gold-royal" />
                  <span>Prime eCard Legal Agreement</span>
                </div>
                <h2 className="font-heading text-2xl sm:text-4xl font-bold text-pearl">
                  Terms of Service | Prime eCard
                </h2>
              </div>

              <div className="space-y-6 text-xs sm:text-sm leading-relaxed text-almond/90">
                <section className="space-y-2">
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-gold-royal">
                    1. What Prime eCard Provides
                  </h3>
                  <p>Prime eCard lets you create a digital wedding invitation from pre-made designs and share it using your own custom web link.</p>
                  <ul className="list-disc pl-5 space-y-1 text-pearl/90">
                    <li>This is a <strong>100% digital product</strong>.</li>
                    <li>Nothing is printed, packed, or physically shipped to your address.</li>
                  </ul>
                </section>

                <hr className="border-gold-royal/20" />

                <section className="space-y-2">
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-gold-royal">
                    2. Creating Your Invitation
                  </h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Free Preview:</strong> You can customize, test, and view your complete invitation with a watermark for free.</li>
                    <li><strong>Instant Activation:</strong> Paying the displayed price removes the watermark immediately and makes your link live for sharing.</li>
                  </ul>
                </section>

                <hr className="border-gold-royal/20" />

                <section className="space-y-2">
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-gold-royal">
                    3. Your Details and Content
                  </h3>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li><strong>Accuracy:</strong> You are responsible for double-checking all names, event dates, ceremony timings, venue addresses, and uploaded photos before making payment.</li>
                    <li><strong>Permissions:</strong> You must have the legal right or permission to use every photo and audio track you upload.</li>
                    <li><strong>Content Rules:</strong> Do not upload anything unlawful, offensive, or inappropriate. We reserve the right to remove such content immediately.</li>
                  </ul>
                </section>

                <hr className="border-gold-royal/20" />

                <section className="space-y-2">
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-gold-royal">
                    4. Editing Policy
                  </h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>You can edit your invitation for up to <strong>3 days (72 hours)</strong> after payment using your private edit link.</li>
                    <li>Keep your private edit link safe. Anyone who has access to this link can change your event details.</li>
                  </ul>
                </section>

                <hr className="border-gold-royal/20" />

                <section className="space-y-3">
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-gold-royal">
                    5. How Long Your Link Stays Live
                  </h3>
                  <div className="overflow-x-auto rounded-xl border border-gold-royal/30">
                    <table className="w-full text-left text-xs sm:text-sm border-collapse">
                      <thead className="bg-obsidian-950/80 text-gold-champagne font-semibold border-b border-gold-royal/30">
                        <tr>
                          <th className="p-3">Card Status</th>
                          <th className="p-3">Retention Period</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gold-royal/15">
                        <tr>
                          <td className="p-3 font-bold text-pearl">Paid / Live Cards</td>
                          <td className="p-3">Your link stays active until <strong>30 days after your last function</strong>, after which all data is permanently deleted.</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-bold text-pearl">Unpaid Drafts</td>
                          <td className="p-3">Unpaid previews and draft designs are automatically removed <strong>7 days</strong> after the last save.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>

                <hr className="border-gold-royal/20" />

                <section className="space-y-2">
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-gold-royal">
                    6. Design Ownership and Personal Use
                  </h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>All designs, layouts, visual themes, and code remain the intellectual property of <strong>Prime eCard</strong> or its licensors.</li>
                    <li>Your payment gives you a personal, single-use license to use the design for your own wedding or event only.</li>
                  </ul>
                </section>

                <hr className="border-gold-royal/20" />

                <section className="space-y-2">
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-gold-royal">
                    7. Copyright Protection
                  </h3>
                  <p>Everything on <strong>primeecard.in</strong> is protected by copyright law, including:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>All invitation design templates, layout elements, and artwork.</li>
                    <li>Interactive animations, website code, visual styles, and written text.</li>
                    <li>All rights are strictly reserved by Prime eCard.</li>
                  </ul>
                </section>

                <hr className="border-gold-royal/20" />

                <section className="space-y-2">
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-gold-royal">
                    8. No Copying or Reselling
                  </h3>
                  <p>You may not copy, download, rebuild, scrape, resell, or distribute any part of this website or its designs without our explicit written permission. Using our designs to make invitations for commercial clients or hosting them on another app or site is strictly prohibited.</p>
                </section>

                <hr className="border-gold-royal/20" />

                <section className="space-y-2">
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-gold-royal">
                    9. No AI or Machine Learning Use
                  </h3>
                  <p>You are not allowed to use any part of this website, its designs, templates, artwork, or code to train, fine-tune, or test any Artificial Intelligence (AI) or machine learning models. Automated bots, scrapers, and data-mining crawlers are strictly prohibited.</p>
                </section>

                <hr className="border-gold-royal/20" />

                <section className="space-y-2">
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-gold-royal">
                    10. Legal Action Against Theft
                  </h3>
                  <p>Prime eCard takes design theft seriously. If our work is copied, scraped, or resold, we will take legal action, including:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Submitting takedown notices to web hosts, domain registrars, and social platforms.</li>
                    <li>Pursuing civil and criminal legal action under the <strong>Copyright Act, 1957</strong> and the <strong>Information Technology Act, 2000</strong>.</li>
                    <li>To report an unauthorized copy of our templates or platform, please message our support team on WhatsApp.</li>
                  </ul>
                </section>
              </div>
            </div>
          )}

          {/* ========================================================
              PRIVACY POLICY
             ======================================================== */}
          {type === 'privacy' && (
            <div className="space-y-6 clear-both">
              <div className="space-y-2 border-b border-gold-royal/20 pb-4">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-gold-royal/10 border border-gold-royal/30 px-3 py-1 text-[11px] font-semibold text-gold-champagne">
                  <Lock className="h-3.5 w-3.5 text-gold-royal" />
                  <span>Zero Data-Monetization Promise</span>
                </div>
                <h2 className="font-heading text-2xl sm:text-4xl font-bold text-pearl">
                  Privacy Policy | Prime eCard
                </h2>
              </div>

              <div className="space-y-6 text-xs sm:text-sm leading-relaxed text-almond/90">
                <section className="space-y-2">
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-gold-royal">
                    1. Information We Collect
                  </h3>
                  <p>We only collect the details needed to create your invitation and process your order:</p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li><strong>Event Details:</strong> Names of the couple, wedding dates, event timings, and venue locations.</li>
                    <li><strong>Uploaded Files:</strong> Photos and background music you upload for your card.</li>
                    <li><strong>Contact Information:</strong> Your mobile number and email address entered at checkout.</li>
                    <li><strong>Guest Responses (RSVP):</strong> Guest names, attendance status, and messages submitted through your invitation page.</li>
                  </ul>
                </section>

                <hr className="border-gold-royal/20" />

                <section className="space-y-2">
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-gold-royal">
                    2. How We Use Your Information
                  </h3>
                  <p>We use your data only to run our service:</p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>To build, host, and display your digital invitation web page.</li>
                    <li>To process payments and activate your live link instantly.</li>
                    <li>To collect guest RSVPs and show them in your private admin link.</li>
                    <li>To assist you when you contact our support team.</li>
                    <li><strong className="text-pearl">We do not sell, rent, or share your personal data with third-party marketers.</strong></li>
                  </ul>
                </section>

                <hr className="border-gold-royal/20" />

                <section className="space-y-2">
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-gold-royal">
                    3. Who Can See Your Information
                  </h3>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li><strong>Your Invitation:</strong> Anyone who has your public link can view the card. Share your link only with people you want to invite.</li>
                    <li><strong>Your RSVP Replies:</strong> Guest responses and edit options are protected. They can only be viewed using your private management link. Keep this private link safe.</li>
                  </ul>
                </section>

                <hr className="border-gold-royal/20" />

                <section className="space-y-2">
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-gold-royal">
                    4. Payments
                  </h3>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>All transactions are processed securely through certified payment gateways (such as Cashfree Payments).</li>
                    <li><strong className="text-pearl">Prime eCard does not see or store your card numbers, CVV, bank details, or UPI PINs.</strong></li>
                  </ul>
                </section>

                <hr className="border-gold-royal/20" />

                <section className="space-y-2">
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-gold-royal">
                    5. Deleting Your Data
                  </h3>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li><strong>Automatic Deletion:</strong> Your digital invitation, uploaded photos, audio files, and RSVP replies are permanently deleted <strong>30 days after your last event</strong>.</li>
                    <li><strong>Early Deletion:</strong> If you want your card and files removed earlier, send a message to our WhatsApp support team, and we will delete them within 24 hours.</li>
                  </ul>
                </section>
              </div>
            </div>
          )}

          {/* ========================================================
              REFUND & CANCELLATION POLICY
             ======================================================== */}
          {type === 'refunds' && (
            <div className="space-y-6 clear-both">
              <div className="space-y-2 border-b border-gold-royal/20 pb-4">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-gold-royal/10 border border-gold-royal/30 px-3 py-1 text-[11px] font-semibold text-gold-champagne">
                  <RefreshCw className="h-3.5 w-3.5 text-gold-royal" />
                  <span>Fair & Transparent Guarantee</span>
                </div>
                <h2 className="font-heading text-2xl sm:text-4xl font-bold text-pearl">
                  Refund &amp; Cancellation Policy | Prime eCard
                </h2>
              </div>

              <div className="space-y-6 text-xs sm:text-sm leading-relaxed text-almond/90">
                <section className="space-y-2">
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-gold-royal">
                    1. Free Preview Before Payment
                  </h3>
                  <p>You can customize and preview your entire invitation for free with a watermark before making any payment. This lets you check all details, animations, and photos to ensure you are completely satisfied before buying.</p>
                </section>

                <hr className="border-gold-royal/20" />

                <section className="space-y-2">
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-gold-royal">
                    2. After Payment
                  </h3>
                  <p>Because this is an instant digital product:</p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>Your invitation goes live and the watermark is removed immediately after payment is confirmed.</li>
                    <li>Due to this instant activation, orders cannot be cancelled and payments cannot be refunded if you change your mind or your event plans change.</li>
                  </ul>
                </section>

                <hr className="border-gold-royal/20" />

                <section className="space-y-2">
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-gold-royal">
                    3. If Something Goes Wrong
                  </h3>
                  <p>We will gladly fix or refund any accidental billing issues:</p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li><strong>Charged Twice:</strong> If your account was debited multiple times for the same card order.</li>
                    <li><strong>Link Not Activated:</strong> If payment was deducted from your bank but your card did not go live, and our technical team cannot activate it within 24 hours.</li>
                  </ul>
                </section>

                <hr className="border-gold-royal/20" />

                <section className="space-y-2">
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-gold-royal">
                    4. How to Request a Refund
                  </h3>
                  <ol className="list-decimal pl-5 space-y-1.5">
                    <li>Message our support team on WhatsApp with your payment reference or transaction ID and your invitation link.</li>
                    <li>Once verified, extra or failed charges will be refunded directly to your original payment method (bank account, card, or UPI).</li>
                    <li>Refunds typically take <strong>5 to 7 working days</strong> to reflect in your account.</li>
                  </ol>
                </section>

                <hr className="border-gold-royal/20" />

                <section className="space-y-2">
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-gold-royal">
                    5. Delivery &amp; Shipping
                  </h3>
                  <p>Prime eCard is a 100% digital web service.</p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>No physical items are printed, packed, or shipped.</li>
                    <li>Your live card URL and private management access are delivered on your screen instantly once payment succeeds.</li>
                  </ul>
                </section>
              </div>
            </div>
          )}

          {/* Acknowledge Button */}
          <div className="mt-8 pt-4 border-t border-gold-royal/20">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-full bg-gradient-to-r from-gold-royal via-gold-champagne to-gold-antique py-3 text-xs sm:text-sm font-bold text-obsidian-950 shadow-gold-glow hover:scale-[1.01] transition-transform"
            >
              Understood &amp; Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
