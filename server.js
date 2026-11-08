import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  // CORS & caching headers for local development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Parse path & sanitize
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Canonical alias: Map root and legacy duplicate names seamlessly to single index.html
  if (['/', '/index.html', '/vivaah.html', '/vivaah-cards.html', '/vivaah', '/vivaah-cards', '/showcase.html'].includes(pathname)) {
    pathname = '/index.html';
  }

  let filePath = path.join(__dirname, pathname);

  // If path points to directory, look for index.html inside
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  // Prevent directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <!DOCTYPE html>
        <html lang="en">
        <head><meta charset="utf-8"><title>404 Not Found</title></head>
        <body style="font-family:sans-serif;padding:40px;background:#140105;color:#fff;">
          <h2 style="color:#d4af37;">404 — Page Not Found</h2>
          <p>Requested: <code>${pathname}</code></p>
          <hr style="border-color:#33111b;">
          <h3>Available Quick Links:</h3>
          <ul>
            <li><a style="color:#fae19c;" href="/">👑 Prime eCard Main Landing Page</a></li>
            <li><a style="color:#fae19c;" href="/Invite/studio.html">🎨 10 Royal Templates Studio</a></li>
            <li><a style="color:#fae19c;" href="/Invite/onboard/index.html">💍 Customer Onboarding Wizard</a></li>
            <li><a style="color:#fae19c;" href="/Invite/token-engine/demo.html">🌟 Token Studio &amp; Template Selector Demo</a></li>
            <li><a style="color:#fae19c;" href="/Invite/index.html">💌 Live Guest Invitation Card</a></li>
          </ul>
        </body>
        </html>
      `);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Prime eCard Server] Running at:`);
  console.log(`  > Local:   http://localhost:${PORT}/`);
  console.log(`  > Network: http://127.0.0.1:${PORT}/`);
  console.log(`  > Studio:  http://localhost:${PORT}/Invite/token-engine/demo.html`);
});
