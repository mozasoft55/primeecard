'use client';

import React, { useState } from 'react';
import { Shield, Clock, MapPin, Users, MessageCircle } from 'lucide-react';
import RoyalGatePreview from './RoyalGatePreview';
import { buildWhatsAppOrderUrl } from '@/lib/whatsapp';

interface HeroProps {
  onOpenDemo: () => void;
}

export default function Hero({ onOpenDemo }: HeroProps) {
  const [coupleInput, setCoupleInput] = useState('');

  const handleQuickOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const url = buildWhatsAppOrderUrl({
      coupleNames: coupleInput,
      isUrgent60Min: true,
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-obsidian-900 via-obsidian-950 to-[#040711]">
      
      {/* Decorative Golden Ambient Back-glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[500px] w-[600px] rounded-full bg-gold-royal/10 blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Column: Conversion Copy & Action */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            
            {/* Kicker Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-gold-royal/30 bg-gold-royal/10 px-4 py-1.5 text-xs font-bold tracking-[0.2em] text-gold-champagne uppercase shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-royal animate-ping" />
              <span>ROYAL BESPOKE DIGITAL ATELIER</span>
            </div>

            {/* Main H1 */}
            <h1 className="font-heading text-4xl sm:text-6xl lg:text-[4.2rem] font-bold text-pearl leading-[1.08] tracking-tight">
              India’s Most Royal Digital Wedding Invitations —{' '}
              <span className="bg-gradient-to-r from-gold-champagne via-gold-royal to-gold-antique bg-clip-text text-transparent">
                Delivered on WhatsApp in 60 Minutes
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-almond/85 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Replace wasteful paper invites with interactive heirloom experiences. Handcrafted 3D royal gates, bespoke background melodies, live WhatsApp RSVPs, and 1-tap Google Maps venue directions.
            </p>

            {/* 1-Line Trust Badge Strip */}
            <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-4 py-2 text-xs sm:text-sm font-semibold text-gold-champagne border-y border-gold-royal/15">
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-gold-royal" />
                <span>60-Min Express Turnaround</span>
              </span>
              <span className="text-gold-royal/40">•</span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-gold-royal" />
                <span>1-Tap GPS Venue Gate</span>
              </span>
              <span className="text-gold-royal/40">•</span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-gold-royal" />
                <span>Live WhatsApp RSVPs</span>
              </span>
            </div>

            {/* Dynamic WhatsApp Fast-Entry Form */}
            <form onSubmit={handleQuickOrder} className="max-w-md mx-auto lg:mx-0 pt-2 space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Enter Couple Names (e.g., Priya & Rohan)"
                  value={coupleInput}
                  onChange={(e) => setCoupleInput(e.target.value)}
                  className="flex-1 rounded-full border border-gold-royal/30 bg-slate-midnight px-4 py-3 text-xs sm:text-sm text-pearl placeholder:text-almond/40 focus:border-gold-royal focus:outline-none focus:ring-1 focus:ring-gold-royal"
                />
                <button
                  type="submit"
                  className="relative overflow-hidden rounded-full bg-gradient-to-r from-gold-royal via-gold-champagne to-gold-antique px-6 py-3 text-xs sm:text-sm font-bold text-obsidian-950 shadow-gold-glow hover:scale-105 transition-transform flex items-center justify-center gap-1.5 before:absolute before:inset-0 before:-translate-x-full hover:before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent"
                >
                  <MessageCircle className="h-4 w-4 fill-obsidian-950" />
                  <span>Order (Flat ₹1,999)</span>
                </button>
              </div>
              <div className="text-[11px] text-almond/60 flex items-center justify-center lg:justify-start gap-1">
                <Shield className="h-3 w-3 text-gold-royal" />
                <span>Zero Risk • Unlimited Guests • 1-Year Cloud Hosting Included</span>
              </div>
            </form>

            {/* Stat Row */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-gold-royal/15 max-w-lg mx-auto lg:mx-0 text-center lg:text-left">
              <div>
                <div className="font-heading text-2xl sm:text-3xl font-bold text-pearl">2,500+</div>
                <div className="text-[11px] text-almond/60 uppercase">Invites Delivered</div>
              </div>
              <div>
                <div className="font-heading text-2xl sm:text-3xl font-bold text-gold-royal">4.9 ★</div>
                <div className="text-[11px] text-almond/60 uppercase">Couple Rating</div>
              </div>
              <div>
                <div className="font-heading text-2xl sm:text-3xl font-bold text-pearl">₹40,000+</div>
                <div className="text-[11px] text-almond/60 uppercase">Saved on Paper</div>
              </div>
            </div>
          </div>

          {/* Right Hero Column: 3D Royal Door Interaction */}
          <div className="lg:col-span-5 flex justify-center">
            <RoyalGatePreview onOpenDemo={onOpenDemo} />
          </div>
        </div>
      </div>
    </section>
  );
}
