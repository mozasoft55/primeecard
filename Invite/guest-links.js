export function parseGuestLinkEntries(value) {
  const lines = String(value ?? '').split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if (!lines.length) throw new Error('Add guests from your dashboard first, then generate their links here.');
  if (lines.length > 100) throw new Error('Generate up to 100 guest links at a time.');

  return lines.map((line, index) => {
    const separator = line.indexOf('|');
    if (separator < 1) {
      throw new Error(`Line ${index + 1}: enter an existing Supabase invite code and guest name, like VIP-AKBAR-01 | Ayesha Rahman.`);
    }
    const code = line.slice(0, separator).trim();
    const name = line.slice(separator + 1).trim();
    if (!code || code.length > 120 || !name || name.length > 100) {
      throw new Error(`Line ${index + 1}: provide a valid invite code (up to 120 characters) and guest name (up to 100 characters).`);
    }
    return { code, name };
  });
}

export function buildGuestInvitationUrl(siteRoot, code, language = 'en') {
  const url = new URL('./', siteRoot);
  url.searchParams.set('code', String(code).trim());
  url.searchParams.set('lang', language);
  return url.href;
}
