import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-heading',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#040711',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://primeecard.com'),
  title: 'Prime eCard — India’s Most Royal Digital Wedding Invitations (Delivered in 60 Mins)',
  description:
    'Handcrafted 3D royal gates, bespoke Shehnai/Sitar melodies, live WhatsApp RSVPs, and 1-tap Google Maps directions. Flat ₹1,999. Delivered on WhatsApp in 60 minutes.',
  keywords: [
    'Digital Wedding Invitation India',
    'Royal Bengali Wedding Card',
    '3D Door Opening E-Card',
    'WhatsApp Wedding Invitation Video',
    'Muslim Nikah Digital Invite',
    'Marwari Kankotri Online',
    'South Indian Muhurtham Invite',
  ],
  authors: [{ name: 'Prime eCard Atelier' }],
  creator: 'Prime eCard',
  publisher: 'Prime eCard Digital Media',
  alternates: {
    canonical: 'https://primeecard.com',
  },
  openGraph: {
    title: 'India’s Most Royal Digital Wedding Invitations — Prime eCard',
    description:
      'Experience 3D royal double-door gates, bespoke background melodies, and live WhatsApp guest tracking. Delivered in 60 minutes.',
    url: 'https://primeecard.com',
    siteName: 'Prime eCard',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: 'https://primeecard.com/og-royal-gate.webp',
        width: 1200,
        height: 630,
        alt: 'Prime eCard 3D Royal Double Door Gate Wedding Invitation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prime eCard — India’s Most Royal Digital Wedding Invitations',
    description: '3D Royal Gates, Shehnai Melodies & Live WhatsApp RSVPs. Flat ₹1,999.',
    images: ['https://primeecard.com/og-royal-gate.webp'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        '@id': 'https://primeecard.com/#product',
        name: 'Prime eCard Royal Digital Wedding Invitation Suite',
        image: 'https://primeecard.com/og-royal-gate.webp',
        description:
          'Bespoke royal 3D digital wedding invitation with door entrance animation, Shehnai audio, live RSVP tracking, and Google Maps venue sync.',
        brand: {
          '@type': 'Brand',
          name: 'Prime eCard',
        },
        offers: {
          '@type': 'Offer',
          url: 'https://primeecard.com',
          priceCurrency: 'INR',
          price: '1999',
          priceValidUntil: '2026-12-31',
          itemCondition: 'https://schema.org/NewCondition',
          availability: 'https://schema.org/InStock',
          seller: {
            '@type': 'Organization',
            name: 'Prime eCard Atelier',
          },
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          bestRating: '5',
          worstRating: '1',
          ratingCount: '380',
          reviewCount: '380',
        },
      },
      {
        '@type': ['LocalBusiness', 'ProfessionalService'],
        '@id': 'https://primeecard.com/#business',
        name: 'Prime eCard Luxury Wedding Atelier',
        url: 'https://primeecard.com',
        logo: 'https://primeecard.com/logo-gold.svg',
        image: 'https://primeecard.com/og-royal-gate.webp',
        telephone: '+919477929927',
        priceRange: '₹1,999 - ₹4,999',
        areaServed: [
          { '@type': 'City', name: 'Kolkata' },
          { '@type': 'City', name: 'New Delhi' },
          { '@type': 'City', name: 'Mumbai' },
          { '@type': 'City', name: 'Bengaluru' },
          { '@type': 'City', name: 'Dubai' },
          { '@type': 'City', name: 'London' },
        ],
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Kolkata',
          addressRegion: 'West Bengal',
          addressCountry: 'IN',
        },
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://primeecard.com/#faq',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How quickly is my royal digital wedding invitation delivered?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Your custom digital invitation draft is delivered directly to your WhatsApp in under 60 minutes after you submit your couple and ceremony details.',
            },
          },
          {
            '@type': 'Question',
            name: 'What is included in the flat ₹1,999 pricing?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'The flat ₹1,999 package includes the 3D royal opening gate animation, personalised guest names, background Shehnai/Sitar music, real-time RSVP tracking, 1-tap Google Maps directions, and 1 year of cloud hosting for unlimited guests.',
            },
          },
          {
            '@type': 'Question',
            name: 'Can I customize the background music and language?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. You can select classical Shehnai, sitar melodies, Vedic chants, Sufi instrumental, or upload your own favorite audio track in Hindi, Bengali, Urdu, English, Tamil, or Telugu.',
            },
          },
          {
            '@type': 'Question',
            name: 'Can dates and venues be updated after the card is delivered?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes! Unlike paper cards that cost tens of thousands to reprint, Prime eCard allows instantaneous cloud updates for dates, venue locations, or muhurat timings in seconds.',
            },
          },
        ],
      },
    ],
  };

  return (
    <html lang="en" className={`${cormorant.variable} ${plusJakarta.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-obsidian-950 font-body text-almond antialiased selection:bg-gold-royal selection:text-obsidian-950">
        {children}
      </body>
    </html>
  );
}
