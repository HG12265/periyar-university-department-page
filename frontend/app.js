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
  if (!fs.existsSync(filePath)) {
    res.statusCode = 404;
    res.end('Not Found');
    return;
  }
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';
  const data = fs.readFileSync(filePath);
  res.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': 'public, max-age=31536000, immutable',
  });
  res.end(data);
}

app.prepare().then(() => {
  log('Next.js app prepared successfully');

  createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    let pathname = parsedUrl.pathname || '/';

    log(`${req.method} ${pathname}`);

    // Strip /dept prefix (Passenger passes full URL including /dept to our app)
    // e.g., /dept/_next/static/css/xxx.css -> /_next/static/css/xxx.css
    const stripped = pathname.startsWith('/dept/') ? pathname.slice(5) : pathname;

    // Serve /_next/static/* directly from .next/static on disk
    // (handles both /dept/_next/static/... and /_next/static/...)
    if (stripped.startsWith('/_next/static/')) {
      const relPath = stripped.replace('/_next/static/', '');
      const filePath = path.join(__dirname, '.next', 'static', relPath);
      log(`Serving static: ${filePath} (exists: ${fs.existsSync(filePath)})`);
      return serveFile(filePath, res);
    }

    // Serve /_next/image and other /_next/* via Next.js handler
    if (stripped.startsWith('/_next/')) {
      // Rewrite URL to stripped version so Next.js handles it correctly
      req.url = stripped + (parsedUrl.search || '');
      try {
        await handle(req, res, url.parse(req.url, true));
      } catch (err) {
        log(`_next handler error: ${err.message}`);
        if (!res.headersSent) { res.statusCode = 500; res.end('Error'); }
      }
      return;
    }

    // Serve public/* files directly
    const publicPath = path.join(__dirname, 'public', stripped);
    if (fs.existsSync(publicPath) && fs.statSync(publicPath).isFile()) {
      log(`Serving public: ${publicPath}`);
      return serveFile(publicPath, res);
    }

    // All page requests — rewrite URL to stripped so Next.js routes correctly
    req.url = stripped + (parsedUrl.search || '') || '/';
    try {
      await handle(req, res, url.parse(req.url, true));
    } catch (err) {
      log(`Page handler error for ${stripped}: ${err.message}`);
      if (!res.headersSent) { res.statusCode = 500; res.end('Internal Server Error'); }
    }

  }).listen(process.env.PORT || 3000, () => {
    log(`Server ready on port ${process.env.PORT || 3000}`);
  });

}).catch((err) => {
  log(`Failed to prepare Next.js: ${err.stack || err}`);
  process.exit(1);
});
