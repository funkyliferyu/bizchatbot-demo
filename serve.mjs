/**
 * 비즈플래닛 챗봇관리 데모 정적 서버 + API 프록시.
 *
 *  - CHATBOT-demo/ 정적 파일을 서빙
 *  - /api/* 요청은 poc-server(기본 http://localhost:5177)로 리버스 프록시
 *    → 원본 컨트롤러 JS 의 상대경로 `/api` fetch 가 그대로 동작(JS 수정 불필요)
 *
 * 실행: poc-server 가 떠 있는 상태에서
 *   node serve.mjs            # 기본 :4179, poc-server :5177
 *   PORT=4000 API=http://localhost:5177 node serve.mjs
 */
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, normalize, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const PORT = Number(process.env.PORT ?? 4179);
const API = process.env.API ?? 'http://localhost:5177';
const apiUrl = new URL(API);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

function proxyApi(req, res) {
  const options = {
    protocol: apiUrl.protocol,
    hostname: apiUrl.hostname,
    port: apiUrl.port,
    method: req.method,
    path: req.url,
    headers: { ...req.headers, host: apiUrl.host }
  };
  const upstream = http.request(options, (up) => {
    res.writeHead(up.statusCode || 502, up.headers);
    up.pipe(res);
  });
  upstream.on('error', (err) => {
    res.writeHead(502, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: 'proxy_failed', detail: String(err), hint: `poc-server(${API}) 실행 여부 확인` }));
  });
  req.pipe(upstream);
}

async function serveStatic(req, res) {
  let pathname = decodeURIComponent((req.url || '/').split('?')[0]);
  if (pathname === '/' || pathname === '') pathname = '/index.html';
  // 디렉토리 탈출 방지
  const filePath = normalize(join(root, pathname));
  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end('forbidden');
    return;
  }
  try {
    const info = await stat(filePath);
    const target = info.isDirectory() ? join(filePath, 'index.html') : filePath;
    const body = await readFile(target);
    res.writeHead(200, { 'content-type': MIME[extname(target).toLowerCase()] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
    res.end('<h1>404</h1><p>먼저 <code>tsx build/render.tsx</code> 로 화면을 빌드하세요.</p>');
  }
}

http
  .createServer((req, res) => {
    if ((req.url || '').startsWith('/api/')) proxyApi(req, res);
    else serveStatic(req, res);
  })
  .listen(PORT, () => {
    console.log(`▶ 데모 서버:  http://localhost:${PORT}`);
    console.log(`▶ API 프록시: /api/* → ${API}`);
    console.log('  (정적 데모는 바로 볼 수 있고, DOCX 다운로드 API를 실제로 쓰려면 poc-server를 실행하세요.)');
  });
