'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { buildWhatsAppOrderUrl } from '@/lib/whatsapp';

interface TraditionData {
  id: string;
  tag: string;
  title: string;
  tagline: string;
  motifs: string[];
  features: string[];
  accentColor: string;
}

const TRADITIONS: TraditionData[] = [
  {
    id: 'bengali',
    tag: 'Shubho Bibaho',
    title: 'Bengali Vedic Heritage',
    tagline: 'Alta, Topor-Mukut, swinging brass bells, and authentic Shehnai rhythms.',
    motifs: ['Shubho Drishti & Saat Paak', 'Gaye Holud & Tattva Itinerary', 'Bou Bhaat & Reception Menu'],
    features: ['Banana tree gate entrance', 'Bilingual Bengali/English script', 'Google Calendar integration'],
    accentColor: '#D4AF37',
  },
  {
    id: 'marwari',
    tag: 'Lagan Patrika & Kankotri',
    title: 'North Indian & Marwari Palace',
    tagline: 'Deep crimson velvet, gold Jharokha arches, royal elephant shobha yatra.',
    motifs: ['Kankotri & Lagan Muhurat', 'Sangeet & Mehendi Night Tracker', 'Royal Baraat GPS Pinpoint'],
    features: ['3D Rajasthani palace darbar', 'Multi-day event headcount tracker', 'Custom Shlokas in Devanagari'],
    accentColor: '#E2B144',
  },
  {
    id: 'muslim',
    tag: 'Nikah & Walima',
    title: 'Royal Islamic Noor-e-Jannat',
    tagline: 'Emerald velvet, geometric Mughal jaali arches, and serene Bismillah calligraphy.',
    motifs: ['Bismillah-ir-Rahman-ir-Rahim Inscription', 'Qubool Hai Video Portal', 'Gourmet Dawat-e-Walima Menu'],
    features: ['Arabic & Urdu typography', 'Separate Gents/Ladies RSVP tally', 'Noor crescent moon animations'],
    accentColor: '#25A244',
  },
  {
    id: 'south',
    tag: 'Mangala Vadhyam',
    title: 'South Indian Muhurtham',
    tagline: 'Temple Gopuram silks, auspicious Nadaswaram, and traditional Kolam art.',
    motifs: ['Kasi Yatra & Oonjal Ceremony', 'Tirumangalyam Muhurtham Timer', 'Traditional Banana Leaf Sadhya Menu'],
    features: ['Kanjeevaram zari gold textures', 'Vedic astrological timing sync', 'Tamil, Telugu, Kannada support'],
    accentColor: '#F59E0B',
  },
];

export default function CulturalTabs() {
  const [activeTab, setActiveTab] = useState(TRADITIONS[0]);

  return (
    <section id="traditions" className="relative py-24 bg-obsidian-900 border-t border-gold-royal/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold tracking-[0.2em] text-gold-royal uppercase">
            SACRED DIVERSITY & ROYAL REFINEMENT
          </span>
          <h2 className="font-heading text-3xl sm:text-5xl font-bold text-pearl">
            Crafted for Every Indian Tradition
          </h2>
          <p className="text-sm sm:text-base text-almond/80">
            Each community celebration carries sacred iconography and distinct customs. Our suites preserve authentic cultural heritage with modern interactive luxury.
          </p>
        </div>

        {/* Tab Controls Bar */}
        <div className="mt-12 flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 no-scrollbar">
          {TRADITIONS.map((trad) => {
            const isActive = activeTab.id === trad.id;
            return (
              <button
                key={trad.id}
                type="button"
                onClick={() => setActiveTab(trad)}
                className={`relative px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'text-obsidian-950 font-bold'
                    : 'text-almond hover:text-pearl bg-slate-midnight/60 border border-gold-royal/20'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabBadge"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-gold-royal via-gold-champagne to-gold-antique"
                    transition={{ type: 'spring', duration: 0.5 }}
                  />
                )}
                <span className="relative z-10">{trad.title}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Cultural Card Showcase */}
        <div className="mt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="rounded-3xl border border-gold-royal/30 bg-slate-midnight p-6 sm:p-10 shadow-gold-glow grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              {/* Left Column: Copy & Cultural Specifications */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-block rounded-full bg-gold-royal/15 border border-gold-royal/30 px-3.5 py-1 text-xs font-semibold text-gold-champagne">
                  ⚜ {activeTab.tag}
                </div>

                <h3 className="font-heading text-2xl sm:text-4xl font-bold text-pearl">
                  {activeTab.title} Heirloom Edition
                </h3>

                <p className="text-sm sm:text-base text-almond/90 leading-relaxed">
                  {activeTab.tagline}
                </p>

                {/* Ritual Highlights */}
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-bold tracking-wider text-gold-royal uppercase">
                    Key Ceremony Integrations Included:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeTab.motifs.map((motif, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs sm:text-sm text-pearl/90">
                        <CheckCircle2 className="h-4 w-4 text-gold-royal shrink-0" />
                        <span>{motif}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Architectural Inclusions */}
                <div className="border-t border-gold-royal/20 pt-4 flex flex-wrap gap-2">
                  {activeTab.features.map((feat, i) => (
                    <span
                      key={i}
                      className="rounded-lg bg-obsidian-950/80 px-2.5 py-1 text-[11px] font-medium text-almond/80 border border-gold-royal/15"
                    >
                      ✓ {feat}
                    </span>
                  ))}
                </div>

                {/* Direct Action Link */}
                <div className="pt-2">
                  <a
                    href={buildWhatsAppOrderUrl({
                      tradition: activeTab.title,
                      templateName: `${activeTab.title} Heirloom Suite`,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-royal via-gold-champagne to-gold-antique px-6 py-3 text-xs sm:text-sm font-bold text-obsidian-950 shadow-gold-glow hover:scale-105 transition-transform"
                  >
                    <span>Order {activeTab.tag} on WhatsApp (Flat ₹1,999)</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>

              {/* Right Column: Visual Frame */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-sm rounded-2xl border-2 border-gold-royal/40 bg-obsidian-950 p-4 text-center shadow-2xl">
                  <div className="text-xs font-bold text-gold-royal/80 tracking-widest uppercase">
                    Previewing Design Architecture
                  </div>
                  <div className="mt-4 aspect-[4/5] rounded-xl border border-gold-royal/20 bg-gradient-to-b from-slate-midnight via-obsidian-900 to-obsidian-950 p-6 flex flex-col justify-between items-center text-center">
                    <div className="text-2xl font-heading text-gold-champagne font-bold">
                      {activeTab.tag}
                    </div>
                    <div className="space-y-1">
                      <div className="text-lg font-heading text-pearl">Priya & Rohan</div>
                      <div className="text-xs text-almond/60">Royal Palace Banquet</div>
                    </div>
                    <div className="rounded-full bg-gold-royal/20 px-3 py-1 text-[10px] text-gold-champagne font-semibold">
                      100% Mobile & WhatsApp Compatible
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
