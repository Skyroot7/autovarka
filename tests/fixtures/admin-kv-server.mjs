// Disposable, memory-only Upstash REST fixture for local security/browser tests.
// No connection to an external store, no order data, and no filesystem writes.
import http from 'node:http';
import fs from 'node:fs';

const products = JSON.parse(fs.readFileSync(new URL('../../lib/productsData.json', import.meta.url), 'utf8'));
const video = JSON.parse(fs.readFileSync(new URL('../../lib/videoSettings.json', import.meta.url), 'utf8'));
const initialAnalytics = { googleAnalyticsId: 'G-FIXTURE123', googleTagManagerId: 'GTM-FIXTURE' };
const values = new Map([
  ['products', JSON.stringify(products)],
  ['videoSettings', JSON.stringify(video)],
  ['analytics_settings', JSON.stringify(initialAnalytics)],
]);
const expiresAt = new Map();
const counts = { reads: 0, writes: 0, rejected: 0, sessionWrites: 0, settingsWrites: 0, orderAccess: 0 };
const isSession = key => /^session:[a-f0-9]{64}$/.test(key);
const isSettings = key => ['analytics_settings', 'videoSettings'].includes(key);

function execute(command) {
  if (!Array.isArray(command)) throw new Error('Invalid command');
  const operation = String(command[0]).toUpperCase();
  const key = String(command[1]);
  if (key === 'orders' || key.startsWith('order:')) counts.orderAccess++;
  if (!(key === 'products' || isSettings(key) || isSession(key))) {
    counts.rejected++;
    return { error: 'Fixture permits public products, sessions and public settings only' };
  }
  if (operation === 'GET') {
    counts.reads++;
    if (expiresAt.has(key) && expiresAt.get(key) <= Date.now()) values.delete(key);
    return { result: values.get(key) ?? null };
  }
  if (!isSettings(key) && !isSession(key)) {
    counts.rejected++;
    return { error: 'Product fixture is read-only' };
  }
  if (operation === 'SET') {
    const ttlIndex = command.findIndex((part, index) => index > 2 && String(part).toUpperCase() === 'EX');
    values.set(key, typeof command[2] === 'string' ? command[2] : JSON.stringify(command[2]));
    if (ttlIndex > -1) expiresAt.set(key, Date.now() + Number(command[ttlIndex + 1]) * 1000);
    counts.writes++;
    if (isSession(key)) counts.sessionWrites++;
    else counts.settingsWrites++;
    return { result: 'OK' };
  }
  if (operation === 'DEL' && isSession(key)) {
    counts.writes++;
    expiresAt.delete(key);
    return { result: values.delete(key) ? 1 : 0 };
  }
  counts.rejected++;
  return { error: 'Unsupported fixture command' };
}

const server = http.createServer(async (request, response) => {
  response.setHeader('Content-Type', 'application/json');
  response.setHeader('Cache-Control', 'no-store');
  if (request.method === 'GET' && request.url === '/__fixture') {
    return response.end(JSON.stringify({ fixture: 'autovarka-hardening-memory-only-v1', counts }));
  }
  if (request.method !== 'POST') {
    response.statusCode = 405;
    return response.end('{"error":"Method not allowed"}');
  }
  try {
    const chunks = [];
    let length = 0;
    for await (const chunk of request) {
      length += chunk.length;
      if (length > 64 * 1024) throw new Error('Fixture request too large');
      chunks.push(chunk);
    }
    const body = JSON.parse(Buffer.concat(chunks).toString());
    const pipeline = Array.isArray(body[0]);
    const results = (pipeline ? body : [body]).map(execute);
    response.end(JSON.stringify(pipeline ? results : results[0]));
  } catch {
    response.statusCode = 400;
    response.end('{"error":"Invalid fixture command"}');
  }
});

const port = Number(process.env.KV_FIXTURE_PORT || 3601);
server.listen(port, '127.0.0.1', () => console.log(`Memory-only security fixture on loopback port ${port}`));
