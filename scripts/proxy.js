const http = require('http');
const httpProxy = require('http-proxy');

const targetPort = process.env.FRONTEND_PORT || 5173;
const listenPort = process.env.PROXY_LISTEN_PORT ? Number(process.env.PROXY_LISTEN_PORT) : 80;
const target = `http://127.0.0.1:${targetPort}`;

const proxy = httpProxy.createProxyServer({});

proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err && err.message ? err.message : err);
  if (!res.headersSent) {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
  }
  res.end('Bad Gateway — target may be down: ' + target);
});

const server = http.createServer((req, res) => {
  proxy.web(req, res, { target }, (e) => {
    // handled in proxy.on('error')
  });
});

server.on('listening', () => {
  console.log(`HTTP proxy listening on http://0.0.0.0:${listenPort} -> ${target}`);
});

server.on('error', (err) => {
  if (err.code === 'EACCES') {
    console.error(`Permission denied binding to port ${listenPort}. Run as Administrator/root to bind low ports (e.g. 80).`);
  } else {
    console.error('Proxy server error:', err);
  }
  process.exit(1);
});

server.listen(listenPort);
