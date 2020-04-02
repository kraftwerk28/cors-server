'use strict';

const fs = require('fs');
const http = require('http');
const https = require('https');

const server = http.createServer((req, res) => {
  const proxyurl = req.url
    .replace(/^\/*/, '')
    .replace(/^(https?):\/*/, (_match, protocol) => `${protocol}://`);

  console.log('Proxying:', proxyurl);
  try {
    const request = (proxyurl.startsWith('https') ? https : http).request(
      proxyurl,
      {},
      (proxyRes) => {
        res.writeHead(200, { ...proxyRes.headers });
        proxyRes.pipe(res);
      }
    );
    req.pipe(request)

  } catch (e) {
    res
      .writeHead(400, { 'Content-Type': 'text/plain' })
      .end(e.toString());
  }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, console.log(`Listening on :${PORT}`));
