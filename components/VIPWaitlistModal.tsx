'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Sparkles, Send } from 'lucide-react';

interface VIPWaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VIPWaitlistModal({ isOpen, onClose }: VIPWaitlistModalProps) {
  const [email, setEmail] = useState('');
  const [occasion, setOccasion] = useState('Royal 25th / 50th Anniversary');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setEmail('');
        onClose();
      }, 2500);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-obsidian-950/80 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg rounded-3xl border-2 border-gold-royal bg-slate-midnight p-6 sm:p-8 shadow-gold-glow-lg z-10"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 rounded-full p-2 text-almond/60 hover:text-pearl transition-colors"
              aria-label="Close Modal"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="text-center space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold-royal/15 border border-gold-royal/40">
                <Crown className="h-6 w-6 text-gold-royal" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-gold-champagne">
                LAUNCHING WINTER 2026
              </span>
              <h3 id="modal-title" className="font-heading text-2xl sm:text-3xl font-bold text-pearl">
                The Royal Occasions Suite
              </h3>
              <p className="text-xs sm:text-sm text-almond/80">
                Receive priority VIP reservation access for Milestone Anniversaries, Royal Baby Showers (Godh Bharai / Aqeeqah), and Luxury Corporate Galas.
              </p>
            </div>

            {/* Form */}
            {submitted ? (
              <div className="my-8 rounded-2xl bg-gold-royal/10 border border-gold-royal/30 p-4 text-center text-gold-champagne text-sm font-semibold">
                ✨ Thank you! You have been granted Priority Concierge Access for Winter 2026.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-pearl mb-1.5">
                    Select Upcoming Occasion
                  </label>
                  <select
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    className="w-full rounded-xl border border-gold-royal/30 bg-obsidian-950 px-3.5 py-2.5 text-xs sm:text-sm text-pearl focus:border-gold-royal focus:outline-none"
                  >
                    <option value="Royal 25th / 50th Anniversary">Royal 25th / 50th Anniversary</option>
                    <option value="Royal Baby Shower (Godh Bharai / Aqeeqah)">Royal Baby Shower (Godh Bharai / Aqeeqah)</option>
                    <option value="First Rice Ceremony (Annaprashan)">First Rice Ceremony (Annaprashan)</option>
                    <option value="Luxury Corporate Gala / Jubilees">Luxury Corporate Gala / Jubilees</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-pearl mb-1.5">
                    WhatsApp Number or VIP Email
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210 or vip@family.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-gold-royal/30 bg-obsidian-950 px-3.5 py-2.5 text-xs sm:text-sm text-pearl placeholder:text-almond/40 focus:border-gold-royal focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-full bg-gradient-to-r from-gold-royal via-gold-champagne to-gold-antique py-3 text-xs sm:text-sm font-bold text-obsidian-950 shadow-gold-glow hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  <span>Join Concierge Waitlist (Complimentary)</span>
                </button>
              </form>
            )}

            <div className="mt-4 text-center text-[11px] text-almond/50 flex items-center justify-center gap-1">
              <Sparkles className="h-3 w-3 text-gold-royal" />
              <span>Strict Privacy Protocol. No spam ever.</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
