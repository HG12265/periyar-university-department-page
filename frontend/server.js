const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      let pathname = parsedUrl.pathname || '';

      // Normalize pathname: Strip leading '/dept' if present
      if (pathname.startsWith('/dept/')) {
        pathname = pathname.replace(/^\/dept/, '');
      } else if (pathname === '/dept') {
        pathname = '/';
      }

      // 1. Direct Static Chunks Interceptor for Next.js CSS & JS (_next/static/...)
      if (pathname.startsWith('/_next/static/')) {
        const relativePath = pathname.replace('/_next/static/', '');
        const filePath = path.join(__dirname, '.next', 'static', relativePath);
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          const ext = path.extname(filePath).toLowerCase();
          res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          return fs.createReadStream(filePath).pipe(res);
        }
      }

      // 2. Direct Public Assets Interceptor for images, icons, logos in public/
      const publicFilePath = path.join(__dirname, 'public', pathname.replace(/^\/+/, ''));
      if (pathname !== '/' && fs.existsSync(publicFilePath) && fs.statSync(publicFilePath).isFile()) {
        const ext = path.extname(publicFilePath).toLowerCase();
        res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return fs.createReadStream(publicFilePath).pipe(res);
      }

      // 3. Delegate SSR pages and API routes to Next.js handler
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
