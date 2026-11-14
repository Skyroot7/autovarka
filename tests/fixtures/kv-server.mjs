// Isolated Upstash REST fixture. Bind to loopback and NEVER accept Redis writes.
import http from 'node:http';
import fs from 'node:fs';

const products = JSON.parse(fs.readFileSync(new URL('../../lib/productsData.json', import.meta.url)));
const video = JSON.parse(fs.readFileSync(new URL('../../lib/videoSettings.json', import.meta.url)));
const values = new Map([['products', products], ['videoSettings', video]]);
const commands = [];
let unavailable = false;
let outOfStock = false;

const server = http.createServer(async (request, response) => {
  response.setHeader('Content-Type', 'application/json');
  if (request.url === '/__stats') return response.end(JSON.stringify({ commands, unavailable, outOfStock }));
  if (request.url === '/__fail') { unavailable = true; return response.end('{}'); }
  if (request.url === '/__recover') { unavailable = false; return response.end('{}'); }
  if (request.url === '/__out_of_stock') { outOfStock = true; return response.end('{}'); }
  if (unavailable) { response.statusCode = 503; return response.end('{"error":"fixture outage"}'); }
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  try {
    const body = JSON.parse(Buffer.concat(chunks).toString());
    const pipeline = Array.isArray(body[0]);
    const results = (pipeline ? body : [body]).map(command => {
      commands.push([String(command[0]).toUpperCase(), command[1]]);
      if (String(command[0]).toUpperCase() !== 'GET') return { error: 'READONLY fixture refuses writes' };
      const value = structuredClone(values.get(command[1]));
      if (command[1] === 'products' && outOfStock) value[0].inStock = false;
      return { result: value === undefined ? null : JSON.stringify(value) };
    });
    response.end(JSON.stringify(pipeline ? results : results[0]));
  } catch {
    response.statusCode = 400;
    response.end('{"error":"invalid fixture command"}');
  }
});

const port = Number(process.env.KV_FIXTURE_PORT || 3400);
server.listen(port, '127.0.0.1', () => console.log(`Read-only KV fixture: http://127.0.0.1:${port}`));
