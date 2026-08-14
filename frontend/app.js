const { createServer } = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const next = require('next');

// --- Logger ---
const logFile = path.join(__dirname, 'debug.log');
function log(msg) {
  try { fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`); } catch (e) {}
}
log('=== app.js starting ===');

const dev = false;
const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

const MIME = {
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.map':  'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.json': 'application/json',
  '.txt':  'text/plain',
  '.pdf':  'application/pdf',
};

function serveFile(filePath, res) {
  if (!fs.existsSync(filePath)) return false;
  const ext = path.extname(filePath).toLowerCase();
  const data = fs.readFileSync(filePath);
  res.writeHead(200, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
  });
  res.end(data);
  return true;
}

app.prepare().then(() => {
  log('Next.js app prepared successfully');

  createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname || '/';

    log(`${req.method} ${pathname}`);

    // ── 1. Handle /_next/static/* asset requests ───────────────────────────
    // assetPrefix '/dept' means browser requests /dept/_next/static/css/xxx.css
    // Passenger routes /dept/* to us, so we receive /dept/_next/static/css/xxx.css
    // Strip /dept to get /_next/static/css/xxx.css and serve from .next/static/
    if (pathname.startsWith('/dept/_next/static/')) {
      const relPath = pathname.replace('/dept/_next/static/', '');
      const filePath = path.join(__dirname, '.next', 'static', relPath);
      log(`[STATIC] ${filePath} exists=${fs.existsSync(filePath)}`);
      if (serveFile(filePath, res)) return;
      res.statusCode = 404; res.end('Not Found'); return;
    }

    // ── 2. Handle /_next/* other internal requests (images, webpack, etc.) ──
    if (pathname.startsWith('/dept/_next/')) {
      req.url = pathname.replace('/dept/_next/', '/_next/') + (parsedUrl.search || '');
      try { await handle(req, res, url.parse(req.url, true)); } catch(e) { log(e.message); }
      return;
    }

    // ── 3. Also handle bare /_next/* (in case Passenger strips prefix) ──────
    if (pathname.startsWith('/_next/static/')) {
      const relPath = pathname.replace('/_next/static/', '');
      const filePath = path.join(__dirname, '.next', 'static', relPath);
      if (serveFile(filePath, res)) return;
    }

    // ── 4. Serve public/* image/file requests ────────────────────────────────
    // Handles /dept/logo.JPG, /dept/home.png, /dept/gowtham.jpg etc.
    // Also bare /logo.JPG etc.
    const pathsToTryForPublic = [];
    if (pathname.startsWith('/dept/')) {
      pathsToTryForPublic.push(pathname.slice('/dept'.length)); // strip /dept
    }
    pathsToTryForPublic.push(pathname); // try as-is

    for (const candidate of pathsToTryForPublic) {
      const publicFilePath = path.join(__dirname, 'public', candidate);
      if (fs.existsSync(publicFilePath) && fs.statSync(publicFilePath).isFile()) {
        log(`[PUBLIC] ${publicFilePath}`);
        if (serveFile(publicFilePath, res)) return;
      }
    }

    // ── 5. All page requests — pass AS-IS to Next.js ─────────────────────────
    // /dept/computer-science → Next.js route /dept/[slug] ✓
    // /dept/admin            → Next.js route /admin (will 404 from Next.js)
    // /dept/                 → Next.js route /dept ✓
    // We also try admin/resume routes by rewriting /dept/admin → /admin
    let pageUrl = pathname + (parsedUrl.search || '');

    // Remap /dept/admin* → /admin*, /dept/dev* → /dev*, and /dept/resume → /resume
    if (pathname === '/dept/admin' || pathname.startsWith('/dept/admin/')) {
      pageUrl = pathname.replace('/dept/admin', '/admin') + (parsedUrl.search || '');
    } else if (pathname === '/dept/dev' || pathname.startsWith('/dept/dev/')) {
      pageUrl = pathname.replace('/dept/dev', '/dev') + (parsedUrl.search || '');
    } else if (pathname === '/dept/resume') {
      pageUrl = '/resume' + (parsedUrl.search || '');
    }

    req.url = pageUrl;
    log(`[PAGE] passing to Next.js: ${req.url}`);
    try {
      await handle(req, res, url.parse(req.url, true));
    } catch (err) {
      log(`[ERROR] ${err.message}`);
      if (!res.headersSent) { res.statusCode = 500; res.end('Internal Server Error'); }
    }

  }).listen(process.env.PORT || 3000, () => {
    log(`Server ready on port ${process.env.PORT || 3000}`);
  });

}).catch((err) => {
  log(`Failed to prepare Next.js: ${err.stack || err}`);
  process.exit(1);
});
