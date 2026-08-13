const { createServer } = require('http');
const fs = require('fs');
const path = require('path');
const next = require('next');

const logFile = path.join(__dirname, 'debug.log');
function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  try { fs.appendFileSync(logFile, line); } catch (e) { }
}

log('Starting app.js initialization...');

const dev = false;
const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  log('Next.js app.prepare() succeeded!');
  createServer(async (req, res) => {
    try {
      log(`Handling request: ${req.method} ${req.url}`);
      await handle(req, res);
    } catch (err) {
      log(`Request error for ${req.url}: ${err.stack || err}`);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.end('Internal Server Error: ' + (err.message || err));
      }
    }
  }).listen(process.env.PORT || 3000, () => {
    log(`Server listening on port ${process.env.PORT || 3000}`);
  });
}).catch((err) => {
  log(`Next.js app.prepare() failed: ${err.stack || err}`);
});
