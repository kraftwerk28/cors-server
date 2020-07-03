'use strict';
const http = require('http');
const https = require('https');
const qs = require('querystring');
const URL_PARAM = ['u', 'q', 'url', 'uri'];

function parseUrl(url) {
  const parts = url.split('?');
  if (parts.length < 2) return;
  const [, query] = parts;
  for (const p of query.split('&')) {
    const [k, v] = p.split('=');
    if (URL_PARAM.includes(k))
      return qs.unescape(v);
  }
}

const server = http.createServer((req, res) => {
  function fail(err) {
    if (err)
      res
        .writeHead(400, { 'Content-Type': 'text/plain' })
        .end(err.toString());
    else
      res.writeHead(400).end();
  }

  const proxyurl = parseUrl(req.url);
  if (!proxyurl) return fail('Bad URL');

  console.log('Proxying:', proxyurl);
  try {
    const h = proxyurl.startsWith('https') ? https : http;
    const request = h.request(
      proxyurl,
      {},
      (proxyRes) => {
        const { headers } = proxyRes;

        for (const k in headers) {
          if (/^access-control-allow/i.test(k)) {
            delete headers[k];
          }
        }

        res.writeHead(200, headers);
        proxyRes.pipe(res);
      }
    );
    req.pipe(request)

  } catch (e) {
    fail(e);
  }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, console.log(`Listening on :${PORT}`));
