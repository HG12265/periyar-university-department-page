const { createServer } = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const next = require('next');

// --- Simple file logger ---
const logFile = path.join(__dirname, 'debug.log');
function log(msg) {
  try { fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`); } catch (e) {}
}

log('=== app.js starting ===');

const dev = false;
const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

// MIME type map for static files
const MIME = {
  '.js':   'application/javascript',
  '.css':  'text/css',
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

function serveStaticFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, data) => {
    if (err) return false;
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    });
    res.end(data);
    return true;
  });
  return true;
}

app.prepare().then(() => {
  log('Next.js app prepared successfully');

  createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname || '/';

    log(`${req.method} ${pathname}`);

    // Serve /_next/static/* directly from disk (bypasses Passenger/Apache issues)
    if (pathname.startsWith('/_next/static/')) {
      const filePath = path.join(__dirname, '.next', 'static', pathname.replace('/_next/static/', ''));
      if (fs.existsSync(filePath)) {
        log(`Serving static file: ${filePath}`);
        return serveStaticFile(filePath, res);
      }
    }

    // Serve /public/* files directly
    if (!pathname.startsWith('/_next/') && !pathname.startsWith('/api/')) {
      const publicFilePath = path.join(__dirname, 'public', pathname);
      if (fs.existsSync(publicFilePath) && fs.statSync(publicFilePath).isFile()) {
        log(`Serving public file: ${publicFilePath}`);
        return serveStaticFile(publicFilePath, res);
      }
    }

    // All other requests go to Next.js
    try {
      await handle(req, res, parsedUrl);
    } catch (err) {
      log(`Error handling ${pathname}: ${err.message}`);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    }
  }).listen(process.env.PORT || 3000, () => {
    log(`Server listening on port ${process.env.PORT || 3000}`);
  });

}).catch((err) => {
  log(`Failed to prepare Next.js: ${err.stack || err}`);
  process.exit(1);
});
