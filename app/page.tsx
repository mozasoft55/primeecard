'use client';

import React, { useState } from 'react';
import Hero from '@/components/Hero';
import CulturalTabs from '@/components/CulturalTabs';
import ProofComparison from '@/components/ProofComparison';
import VIPWaitlistModal from '@/components/VIPWaitlistModal';
import LegalModal, { LegalDocType } from '@/components/LegalModal';
import StickyMobileBar from '@/components/StickyMobileBar';
import { Crown, Sparkles, HelpCircle, ChevronDown, MessageCircle } from 'lucide-react';
import { buildWhatsAppOrderUrl } from '@/lib/whatsapp';

export default function PrimeECardLandingPage() {
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<LegalDocType>(null);

  const scrollToHeroGate = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-obsidian-950 text-almond selection:bg-gold-royal selection:text-obsidian-950 pb-16 md:pb-0">
      
      {/* ========================================================
          STICKY LUXURY NAVIGATION HEADER
         ======================================================== */}
      <header className="sticky top-0 z-40 border-b border-gold-royal/20 bg-obsidian-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-gold-royal via-gold-champagne to-gold-antique shadow-md">
              <Crown className="h-5 w-5 text-obsidian-950" />
            </div>
            <div>
              <span className="font-heading text-xl sm:text-2xl font-bold text-pearl tracking-wide group-hover:text-gold-champagne transition-colors">
                Prime <span className="text-gold-royal">eCard</span>
              </span>
              <span className="hidden sm:block text-[9px] font-bold uppercase tracking-[0.25em] text-gold-royal/80">
                ROYAL DIGITAL ATELIER
              </span>
            </div>
          </a>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-almond/90">
            <a href="#traditions" className="hover:text-gold-champagne transition-colors">Cultural Suites</a>
            <a href="#proof" className="hover:text-gold-champagne transition-colors">Why Prime eCard</a>
            <a href="#faq" className="hover:text-gold-champagne transition-colors">FAQ</a>
            <button
              type="button"
              onClick={() => setIsWaitlistOpen(true)}
              className="text-gold-royal hover:text-gold-champagne transition-colors flex items-center gap-1"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Occasions Suite (2026)</span>
            </button>
          </nav>

          {/* WhatsApp Direct Header CTA */}
          <div className="flex items-center gap-3">
            <a
              href={buildWhatsAppOrderUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-gradient-to-r from-gold-royal via-gold-champagne to-gold-antique px-4 py-2 text-xs font-bold text-obsidian-950 shadow-gold-glow hover:scale-105 transition-transform flex items-center gap-1.5"
            >
              <MessageCircle className="h-3.5 w-3.5 fill-obsidian-950" />
              <span className="hidden sm:inline">WhatsApp Order</span>
              <span>₹1,999</span>
            </a>
          </div>
        </div>
      </header>

      {/* ========================================================
          HERO SECTION (WITH 3D ROYAL GATE PREVIEW)
         ======================================================== */}
      <Hero onOpenDemo={scrollToHeroGate} />

      {/* ========================================================
          PROOF MATRIX (PAPER VS PRIME ECARD)
         ======================================================== */}
      <ProofComparison />

      {/* ========================================================
          INTERACTIVE CULTURAL SUITES
         ======================================================== */}
      <CulturalTabs />

      {/* ========================================================
          HIGH-INTENT FAQ SECTION
         ======================================================== */}
      <section id="faq" className="py-24 bg-obsidian-950 border-t border-gold-royal/15">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold tracking-[0.2em] text-gold-royal uppercase">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-pearl">
              Everything You Need to Know
            </h2>
          </div>

          <div className="mt-12 space-y-4">
            {[
              {
                q: 'How does the 60-Minute WhatsApp Delivery work?',
                a: 'Once you click "Order on WhatsApp", our royal concierge connects with you. You provide your names, wedding dates, and venue link. Our design artists construct your 3D digital door suite and send a private review link within 60 minutes.',
              },
              {
                q: 'What is included in the flat ₹1,999 pricing?',
                a: 'The flat ₹1,999 rate is all-inclusive for unlimited wedding guests. It includes the 3D gate opening animation, personalised guest links (e.g., "VIP Invite for Sharma Family"), background Shehnai/Sitar music, 1-tap Google Maps directions, and 1 full year of cloud hosting.',
              },
              {
                q: 'Can we update our wedding timings or venue later?',
                a: 'Yes, completely free of charge! With traditional paper invites, an error or date change requires re-printing tens of thousands of rupees worth of cards. With Prime eCard, updates reflect instantly across all guest links.',
              },
              {
                q: 'Do guests need to download any mobile application?',
                a: 'No app is needed! Your invitation is an ultra-fast, modern web link that opens seamlessly on iPhone, Android, WhatsApp, Safari, and Chrome in under a second.',
              },
            ].map((faq, i) => (
              <details
                key={i}
                className="group rounded-2xl border border-gold-royal/20 bg-slate-midnight p-5 [&_summary::-webkit-details-marker]:none transition-all duration-300 open:border-gold-royal"
              >
                <summary className="flex cursor-pointer items-center justify-between text-base font-bold text-pearl">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-gold-royal shrink-0" />
                    <span>{faq.q}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gold-royal transition-transform duration-300 group-open:-rotate-180" />
                </summary>
                <p className="mt-3 text-sm text-almond/80 leading-relaxed pl-6 border-l-2 border-gold-royal/30">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          LUXURY FOOTER WITH ACCESSIBLE LEGAL POLICIES
         ======================================================== */}
      <footer className="border-t border-gold-royal/20 bg-obsidian-900 py-12 text-center text-xs text-almond/60 space-y-4">
        <div className="flex items-center justify-center gap-2 text-pearl font-heading text-xl font-bold">
          <Crown className="h-5 w-5 text-gold-royal" />
          <span>Prime eCard Atelier</span>
        </div>
        <p className="max-w-md mx-auto text-almond/70">
          India’s premier royal digital wedding atelier. Serving couples across Kolkata, Delhi, Mumbai, Bengaluru, Dubai, and London.
        </p>

        {/* Primary Site Navigation Links */}
        <div className="flex justify-center gap-6 pt-2 text-almond/80">
          <button type="button" onClick={() => setIsWaitlistOpen(true)} className="hover:text-gold-royal transition-colors">
            Occasions Suite
          </button>
          <a href="#traditions" className="hover:text-gold-royal transition-colors">Cultural Collections</a>
          <a href="#proof" className="hover:text-gold-royal transition-colors">Pricing</a>
          <a href="https://wa.me/919477929927" target="_blank" rel="noopener noreferrer" className="hover:text-gold-royal transition-colors">
            Concierge WhatsApp (+91 94779 29927)
          </a>
        </div>

        {/* Dedicated Legal Policies Links */}
        <div className="flex justify-center items-center gap-4 pt-1 text-almond/70 text-[11px]">
          <button
            type="button"
            onClick={() => setLegalModalType('terms')}
            className="hover:text-gold-champagne underline underline-offset-4 transition-colors"
          >
            Terms of Service
          </button>
          <span className="text-gold-royal/40">•</span>
          <button
            type="button"
            onClick={() => setLegalModalType('privacy')}
            className="hover:text-gold-champagne underline underline-offset-4 transition-colors"
          >
            Privacy Policy
          </button>
          <span className="text-gold-royal/40">•</span>
          <button
            type="button"
            onClick={() => setLegalModalType('refunds')}
            className="hover:text-gold-champagne underline underline-offset-4 transition-colors"
          >
            Refund &amp; Cancellation Policy
          </button>
        </div>

        <div className="text-[11px] text-almond/40 pt-4">
          © 2026 Prime eCard. All rights reserved. Crafted with 100% royalty.
        </div>
      </footer>

      {/* ========================================================
          MODALS & MOBILE CONVERSION RIBBON
         ======================================================== */}
      <VIPWaitlistModal
        isOpen={isWaitlistOpen}
        onClose={() => setIsWaitlistOpen(false)}
      />

      <LegalModal
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />

      <StickyMobileBar onOpenGatePreview={scrollToHeroGate} />
    </main>
  );
}
