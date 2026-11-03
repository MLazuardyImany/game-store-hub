// Server statis kecil untuk membuka dashboard diagram Archify.
// Jalankan: npm run arch:serve  →  http://127.0.0.1:4321/dashboard.html
import { createServer } from "node:http";
import { createReadStream, readFileSync, statSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";

const ROOT = resolve(process.cwd(), ".archify");
const PORT = Number(process.env.ARCHIFY_PORT ?? 4321);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

const DIAGRAMS = {
  architecture: "architecture-gameshop-20261104-0042/gameshop-architecture.html",
  sequence: "sequence-catalog-20261104-0042/catalog-request.html",
  dataflow: "dataflow-stock-20261104-0042/stock-dataflow.html",
};

function statePayload() {
  const diagrams = {};
  for (const [key, relative] of Object.entries(DIAGRAMS)) {
    try {
      diagrams[key] = statSync(join(ROOT, relative)).mtimeMs;
    } catch {
      diagrams[key] = 0;
    }
  }

  let drift = null;
  try {
    drift = JSON.parse(readFileSync(join(ROOT, "drift.json"), "utf8"));
  } catch {
    drift = null;
  }

  return { diagrams, drift };
}

const server = createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host}`);

  if (url.pathname === "/api/state") {
    response.writeHead(200, {
      "Content-Type": MIME[".json"],
      "Cache-Control": "no-store",
    });
    response.end(JSON.stringify(statePayload()));
    return;
  }

  const requested = url.pathname === "/" ? "/dashboard.html" : url.pathname;
  const filePath = join(ROOT, normalize(decodeURIComponent(requested)));

  if (!filePath.startsWith(ROOT)) {
    response.writeHead(403).end("Forbidden");
    return;
  }

  try {
    const stats = statSync(filePath);
    if (!stats.isFile()) throw new Error("bukan file");

    response.writeHead(200, {
      "Content-Type": MIME[extname(filePath)] ?? "application/octet-stream",
      "Cache-Control": "no-store",
      "Content-Length": stats.size,
    });
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Tidak ditemukan: " + requested);
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Dashboard Archify: http://127.0.0.1:${PORT}/dashboard.html`);
});
