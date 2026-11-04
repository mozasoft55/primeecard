export function parseGuestLinkEntries(value, { autoGenerate = false } = {}) {
  const lines = String(value ?? '').split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if (!lines.length) throw new Error('Add guests from your dashboard first, then generate their links here.');
  if (lines.length > 100) throw new Error('Generate up to 100 guest links at a time.');

  return lines.map((line, index) => {
    let code = '';
    let name = '';

    if (line.includes('|')) {
      const parts = line.split('|').map(p => p.trim());
      code = parts[0];
      name = parts[1] || 'Guest';
    } else if (autoGenerate) {
      // User ne sirf NAAM enter kiya hai - Code hum auto generate karenge
      name = line;
      const cleanPrefix = name.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase();
      const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
      code = (cleanPrefix ? `${cleanPrefix}-` : 'G-') + rand;
    } else {
      throw new Error(`Line ${index + 1}: enter an existing Supabase invite code and guest name, like VIP-AKBAR-01 | Ayesha Rahman.`);
    }

    if (!code || code.length > 120 || !name || name.length > 100) {
      throw new Error(`Line ${index + 1}: provide a valid invite code (up to 120 characters) and guest name (up to 100 characters).`);
    }

    return { code, name };
  });
}

export function buildGuestInvitationUrl(siteRoot, code, language = 'en') {
  const url = new URL('./', siteRoot);
  url.searchParams.set('code', String(code).trim());
  if (language && language !== 'en') {
    url.searchParams.set('lang', language);
  } else if (!language) {
    url.searchParams.set('lang', 'en');
  } else {
    url.searchParams.set('lang', 'en');
  }
  return url.href;
}