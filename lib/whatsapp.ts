export interface WhatsAppOrderParams {
  templateName?: string;
  tradition?: string;
  coupleNames?: string;
  isUrgent60Min?: boolean;
}

const OFFICIAL_PHONE_NUMBER = '919477929927';

/**
 * Builds a dynamic, URL-encoded WhatsApp VIP concierge order link.
 * Automatically injects the selected cultural template, ceremony tradition, couple names, and urgency flags.
 */
export function buildWhatsAppOrderUrl({
  templateName = 'Rajmahal Vedic Royal Suite',
  tradition = 'Hindu / Bengali Vedic (Shubho Bibaho)',
  coupleNames = '',
  isUrgent60Min = true,
}: WhatsAppOrderParams = {}): string {
  const parts: string[] = [
    '✨ *NAMASTE PRIME ECARD ATELIER*',
    'I would like to order a bespoke Royal Digital Wedding Invitation.',
    '',
    `⚜️ *Package:* Royal Heirloom Suite (Flat ₹1,999)`,
    `🏛️ *Selected Design:* ${templateName}`,
    `🪔 *Ceremony Tradition:* ${tradition}`,
  ];

  if (coupleNames.trim()) {
    parts.push(`💍 *Couple Names:* ${coupleNames.trim()}`);
  }

  if (isUrgent60Min) {
    parts.push(`⚡ *Delivery Preference:* Urgent 60-Minute Express Draft Requested`);
  }

  parts.push(
    '',
    'Please share the draft submission questionnaire and UPI booking details. Thank you!'
  );

  const message = encodeURIComponent(parts.join('\n'));
  return `https://wa.me/${OFFICIAL_PHONE_NUMBER}?text=${message}`;
}
