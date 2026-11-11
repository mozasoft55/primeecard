'use client';

import React from 'react';
import { XCircle, CheckCircle2, Sparkles, ShieldCheck } from 'lucide-react';
import { buildWhatsAppOrderUrl } from '@/lib/whatsapp';

export default function ProofComparison() {
  return (
    <section id="proof" className="py-24 bg-obsidian-950 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold tracking-[0.2em] text-gold-royal uppercase">
            WHY MODERN NOBILITY IS SWITCHING
          </span>
          <h2 className="font-heading text-3xl sm:text-5xl font-bold text-pearl">
            Save ₹40,000+ Without Sacrificing Royalty
          </h2>
          <p className="text-sm sm:text-base text-almond/80">
            Traditional wedding cards burden families with exorbitant costs, lost couriers, and endless RSVP phone calls. Prime eCard delivers a royal heirloom experience in under 60 minutes.
          </p>
        </div>

        {/* Side-by-Side Comparison Matrix */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          {/* Column 1: Traditional Paper Cards */}
          <div className="rounded-3xl border border-slate-700/50 bg-slate-midnight/40 p-8 sm:p-10 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-almond/60">
                  The Old Clumsy Route
                </span>
                <span className="rounded-full bg-red-950/60 border border-red-500/30 px-3 py-1 text-[11px] font-semibold text-red-400">
                  High Stress
                </span>
              </div>

              <h3 className="font-heading text-2xl sm:text-3xl font-bold text-almond">
                Traditional Box Paper Cards
              </h3>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-pearl">₹45,000 to ₹80,000+ Cost:</strong>
                    <p className="text-xs sm:text-sm text-almond/70">Expensive box printing, gold foil plate charges, courier parcels, and postages for 300+ guests.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-pearl">3 to 4 Weeks Delivery Delay:</strong>
                    <p className="text-xs sm:text-sm text-almond/70">Proofing iterations, printing press delays, and last-minute courier dispatch nightmares.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-pearl">Zero Attendance Tracking:</strong>
                    <p className="text-xs sm:text-sm text-almond/70">Manual follow-up phone calls; caterers get wrong headcount leading to food wastage or shortages.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-pearl">40+ Trees Felled:</strong>
                    <p className="text-xs sm:text-sm text-almond/70">Heavy paper consumption. Cards are discarded in trash bins right after the reception.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-slate-700/40 pt-4 text-xs text-almond/60 text-center">
              Heavy logistics • No last-minute corrections allowed
            </div>
          </div>

          {/* Column 2: Prime eCard Atelier */}
          <div className="relative rounded-3xl border-2 border-gold-royal bg-gradient-to-b from-slate-midnight via-obsidian-900 to-obsidian-950 p-8 sm:p-10 shadow-gold-glow-lg flex flex-col justify-between">
            {/* Best Value Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-gold-royal via-gold-champagne to-gold-antique px-4 py-1 text-[11px] font-extrabold text-obsidian-950 uppercase tracking-widest shadow-md">
              ★ The Royal Future of Invites
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gold-royal">
                  PRIME ECARD BESPOKE SUITE
                </span>
                <span className="rounded-full bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 text-[11px] font-semibold text-emerald-400">
                  Instant Peace of Mind
                </span>
              </div>

              <h3 className="font-heading text-2xl sm:text-3xl font-bold text-pearl flex items-center gap-2">
                <span>Royal Interactive E-Card</span>
                <Sparkles className="h-5 w-5 text-gold-royal" />
              </h3>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-gold-royal shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-pearl">Flat ₹1,999 All-Inclusive:</strong>
                    <p className="text-xs sm:text-sm text-almond/80">Unlimited guests. Zero courier expenses. Save ₹40,000+ for your honeymoon or bridal jewellery.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-gold-royal shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-pearl">60-Minute Express Draft:</strong>
                    <p className="text-xs sm:text-sm text-almond/80">Direct delivery to WhatsApp in under 1 hour. Shareable instantly to global family groups.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-gold-royal shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-pearl">Live WhatsApp RSVP Dashboard:</strong>
                    <p className="text-xs sm:text-sm text-almond/80">Real-time ceremony headcount (Haldi, Sangeet, Reception) with dietary notes for your caterer.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-gold-royal shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-pearl">0 Trees Cut · 100% Eco-Royalty:</strong>
                    <p className="text-xs sm:text-sm text-almond/80">Zero carbon waste, 1-tap Google Maps directions, and treasured forever on the cloud.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gold-royal/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 text-xs text-gold-champagne font-medium">
                <ShieldCheck className="h-4 w-4 text-gold-royal" />
                <span>100% Satisfaction Guarantee</span>
              </div>

              <a
                href={buildWhatsAppOrderUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto rounded-full bg-gradient-to-r from-gold-royal via-gold-champagne to-gold-antique px-6 py-2.5 text-xs font-bold text-obsidian-950 shadow-md hover:scale-105 transition-transform text-center"
              >
                Order Now at ₹1,999
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
