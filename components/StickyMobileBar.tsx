'use client';

import React from 'react';
import { Eye, MessageCircle } from 'lucide-react';
import { buildWhatsAppOrderUrl } from '@/lib/whatsapp';

interface StickyMobileBarProps {
  onOpenGatePreview: () => void;
}

export default function StickyMobileBar({ onOpenGatePreview }: StickyMobileBarProps) {
  return (
    <aside
      aria-label="Mobile quick action bar"
      className="fixed bottom-0 left-0 right-0 z-40 block md:hidden border-t border-gold-royal/30 bg-obsidian-950/95 p-3 backdrop-blur-xl"
    >
      <div className="flex items-center gap-2">
        {/* View 3D Demo Button */}
        <button
          type="button"
          onClick={onOpenGatePreview}
          className="flex-1 rounded-full border border-gold-royal/40 bg-slate-midnight py-2.5 px-3 text-xs font-bold text-gold-champagne shadow-md hover:bg-slate-royal transition-colors flex items-center justify-center gap-1.5"
        >
          <Eye className="h-3.5 w-3.5 text-gold-royal" />
          <span>3D Door Demo</span>
        </button>

        {/* WhatsApp Immediate Order Button */}
        <a
          href={buildWhatsAppOrderUrl({ isUrgent60Min: true })}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-full bg-gradient-to-r from-gold-royal via-gold-champagne to-gold-antique py-2.5 px-3 text-xs font-bold text-obsidian-950 shadow-gold-glow flex items-center justify-center gap-1.5"
        >
          <MessageCircle className="h-3.5 w-3.5 fill-obsidian-950" />
          <span>Order (₹1,999)</span>
        </a>
      </div>
    </aside>
  );
}
