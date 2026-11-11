'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Sparkles, MapPin, Calendar, Heart, Eye } from 'lucide-react';

interface RoyalGatePreviewProps {
  onOpenDemo?: () => void;
}

export default function RoyalGatePreview({ onOpenDemo }: RoyalGatePreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const toggleGate = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState && !isPlayingAudio) {
      setIsPlayingAudio(true);
    }
  };

  const toggleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlayingAudio((prev) => !prev);
  };

  return (
    <div className="relative mx-auto w-full max-w-[340px] sm:max-w-[380px] select-none">
      {/* Ambient Gold Halo */}
      <div className="absolute -inset-4 rounded-[48px] bg-gradient-to-b from-gold-royal/20 via-gold-antique/10 to-transparent blur-2xl transition-all duration-700 pointer-events-none" />

      {/* Outer Smartphone Frame */}
      <div className="relative overflow-hidden rounded-[44px] border-[10px] border-[#1C1619] bg-obsidian-950 shadow-gate-depth ring-1 ring-gold-royal/30">
        
        {/* Dynamic Island Notch */}
        <div className="absolute top-2 left-1/2 z-40 h-5 w-28 -translate-x-1/2 rounded-full bg-[#1C1619] flex items-center justify-end px-3">
          <div className="h-2 w-2 rounded-full bg-gold-royal/40 animate-pulse" />
        </div>

        {/* Smartphone Screen Viewport with 3D Perspective */}
        <div
          onClick={toggleGate}
          className="relative h-[580px] w-full cursor-pointer bg-gradient-to-b from-obsidian-950 via-slate-midnight to-obsidian-900 overflow-hidden"
          style={{ perspective: 1200 }}
          role="button"
          tabIndex={0}
          aria-expanded={isOpen}
          aria-label="Interactive 3D Royal Gate. Click to open or close the wedding invitation."
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              toggleGate();
            }
          }}
        >
          {/* ========================================================
              INNER SANCTUM: REVEALED WEDDING CARD BEHIND THE DOORS
             ======================================================== */}
          <div className="absolute inset-0 flex flex-col items-center justify-between p-6 pt-10 text-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-midnight via-obsidian-950 to-[#040711]">
            
            {/* Sacred Kolka / Invocation Motif */}
            <div className="space-y-1 mt-2">
              <span className="text-[11px] font-semibold tracking-[0.25em] text-gold-champagne/90 uppercase">
                ॥ श्री श्री प्रजापतये नमः ॥
              </span>
              <div className="text-xs font-heading tracking-widest text-gold-royal">
                SHUBHO BIBAHO
              </div>
            </div>

            {/* Couple Names */}
            <div className="space-y-2 my-auto">
              <div className="font-heading text-4xl text-pearl font-bold tracking-wide">
                Priya
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="h-px w-8 bg-gold-royal/40" />
                <Heart className="h-3.5 w-3.5 fill-gold-royal text-gold-royal animate-pulse" />
                <span className="h-px w-8 bg-gold-royal/40" />
              </div>
              <div className="font-heading text-4xl text-pearl font-bold tracking-wide">
                Rohan
              </div>

              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-gold-royal/30 bg-gold-royal/10 px-3 py-1 text-[11px] font-medium text-gold-champagne">
                <Calendar className="h-3 w-3 text-gold-royal" />
                <span>Sunday, 14 December 2026</span>
              </div>

              <div className="text-xs text-almond/80 flex items-center justify-center gap-1 mt-1">
                <MapPin className="h-3 w-3 text-gold-royal" />
                <span>The Rajbari Bawali, Kolkata</span>
              </div>
            </div>

            {/* Card Interactive Footer Controls */}
            <div className="w-full space-y-2 pb-2">
              <div className="rounded-xl border border-gold-royal/20 bg-slate-midnight/80 p-2.5 backdrop-blur-sm">
                <div className="flex items-center justify-between text-[11px] text-gold-champagne">
                  <span>VIP Guest:</span>
                  <span className="font-bold text-pearl">Chatterjee Family (3 Guests)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDemo?.();
                }}
                className="w-full rounded-full bg-gradient-to-r from-gold-royal via-gold-champagne to-gold-antique py-2 text-xs font-bold text-obsidian-950 shadow-md transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Open Full HD Invitation</span>
              </button>
            </div>
          </div>

          {/* ========================================================
              DOUBLE DOOR 3D ROYAL GATES (FRAMER MOTION)
             ======================================================== */}
          {/* LEFT DOOR */}
          <motion.div
            initial={false}
            animate={{
              rotateY: isOpen ? -110 : 0,
            }}
            transition={{
              duration: 1.1,
              ease: [0.25, 1, 0.5, 1],
            }}
            style={{ transformOrigin: 'left center' }}
            className="absolute top-0 left-0 bottom-0 w-1/2 z-20 border-r border-gold-champagne/40 bg-gradient-to-r from-[#140D07] via-[#20150B] to-[#120B06] p-4 flex flex-col justify-between shadow-2xl"
          >
            {/* Ornate Gold Filigree Inlay */}
            <div className="h-full w-full rounded-l-2xl border-2 border-gold-royal/40 p-2 flex flex-col justify-between bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold-royal/10 via-transparent to-transparent">
              <div className="text-[10px] text-gold-royal/70 tracking-widest text-left">⚜ ॐ</div>
              <div className="my-auto mx-auto h-20 w-8 rounded-full border border-gold-royal/50 flex items-center justify-center bg-gold-royal/10">
                <div className="h-12 w-2 rounded-full bg-gradient-to-b from-gold-royal to-gold-antique" />
              </div>
              <div className="h-4 w-full border-t border-gold-royal/30" />
            </div>

            {/* Left Brass Door Handle */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 h-14 w-2.5 rounded-full bg-gradient-to-r from-gold-champagne to-gold-deep border border-gold-royal shadow-lg" />
          </motion.div>

          {/* RIGHT DOOR */}
          <motion.div
            initial={false}
            animate={{
              rotateY: isOpen ? 110 : 0,
            }}
            transition={{
              duration: 1.1,
              ease: [0.25, 1, 0.5, 1],
            }}
            style={{ transformOrigin: 'right center' }}
            className="absolute top-0 right-0 bottom-0 w-1/2 z-20 border-l border-gold-champagne/40 bg-gradient-to-l from-[#140D07] via-[#20150B] to-[#120B06] p-4 flex flex-col justify-between shadow-2xl"
          >
            {/* Ornate Gold Filigree Inlay */}
            <div className="h-full w-full rounded-r-2xl border-2 border-gold-royal/40 p-2 flex flex-col justify-between bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold-royal/10 via-transparent to-transparent">
              <div className="text-[10px] text-gold-royal/70 tracking-widest text-right">⚜ ॐ</div>
              <div className="my-auto mx-auto h-20 w-8 rounded-full border border-gold-royal/50 flex items-center justify-center bg-gold-royal/10">
                <div className="h-12 w-2 rounded-full bg-gradient-to-b from-gold-royal to-gold-antique" />
              </div>
              <div className="h-4 w-full border-t border-gold-royal/30" />
            </div>

            {/* Right Brass Door Handle */}
            <div className="absolute left-2 top-1/2 -translate-y-1/2 h-14 w-2.5 rounded-full bg-gradient-to-l from-gold-champagne to-gold-deep border border-gold-royal shadow-lg" />
          </motion.div>

          {/* Golden Royal Wax Seal & Hint Pill (Fades when gate opens) */}
          <AnimatePresence>
            {!isOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none"
              >
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-gold-champagne bg-gradient-to-br from-gold-royal via-gold-antique to-gold-deep shadow-gold-glow animate-pulse-glow">
                  <Sparkles className="h-7 w-7 text-obsidian-950" />
                </div>
                <div className="mt-4 rounded-full border border-gold-royal/50 bg-obsidian-950/90 px-4 py-1.5 text-xs font-semibold text-gold-champagne shadow-xl backdrop-blur-md">
                  ✦ Tap to Open Royal Darbar ✦
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Ambient Shehnai Audio Controller Pill */}
        <div className="border-t border-gold-royal/20 bg-obsidian-900/90 px-4 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={toggleAudio}
            className="flex items-center gap-2 text-xs font-medium text-gold-champagne hover:text-pearl transition-colors"
            aria-label={isPlayingAudio ? 'Mute Shehnai Music' : 'Play Shehnai Music'}
          >
            {isPlayingAudio ? (
              <>
                <Volume2 className="h-4 w-4 text-gold-royal animate-pulse" />
                <span>Playing Shehnai (Tap to Mute)</span>
              </>
            ) : (
              <>
                <VolumeX className="h-4 w-4 text-almond/60" />
                <span>♫ Preview Shehnai Melody</span>
              </>
            )}
          </button>

          {/* Visualizer Equalizer Waves */}
          <div className="flex items-end gap-1 h-3.5">
            <span className={`w-0.5 rounded-full bg-gold-royal transition-all duration-300 ${isPlayingAudio ? 'h-3 animate-bounce' : 'h-1'}`} />
            <span className={`w-0.5 rounded-full bg-gold-royal transition-all duration-300 ${isPlayingAudio ? 'h-3.5 animate-bounce delay-75' : 'h-1'}`} />
            <span className={`w-0.5 rounded-full bg-gold-royal transition-all duration-300 ${isPlayingAudio ? 'h-2 animate-bounce delay-150' : 'h-1'}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
