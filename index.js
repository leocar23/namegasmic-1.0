// index.js — Express + EJS + MongoDB + rutas robustas + RDAP + plan gratis 3/día
const express = require("express");
const path = require("path");
const fs = require("fs");
const fetch = require("node-fetch");

// ── MongoDB
const connectDB = require("./db");
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ── Estáticos desde /public
const PUBLIC_DIR = path.join(__dirname, "public");
app.use(express.static(PUBLIC_DIR));

// ── Banderas (alias sólidos; evitan tocar todas las páginas)
["/bandera-es.PNG", "/en/bandera-es.PNG", "/es/bandera-es.PNG"].forEach(p =>
  app.use(p, express.static(path.join(PUBLIC_DIR, "img", "bandera-es.PNG")))
);
["/bandera-uk.PNG", "/en/bandera-uk.PNG", "/es/bandera-uk.PNG"].forEach(p =>
  app.use(p, express.static(path.join(PUBLIC_DIR, "img", "bandera-uk.PNG")))
);

// Helpers render / archivos
function renderSafe(res, viewPath, data = {}) {
  res.render(viewPath, data, (err, html) => {
    if (err) return res.status(404).send(`No se encontró la vista: ${viewPath}`);
    res.send(html);
  });
}
function sendIfExists(res, relPath) {
  const abs = path.join(PUBLIC_DIR, relPath);
  if (fs.existsSync(abs)) return res.sendFile(abs);
  return false;
}

// ── Protección básica (staging)
app.use((req, res, next) => {
  const auth = { login: "admin", password: "clave123" };
  const b64auth = (req.headers.authorization || "").split(" ")[1] || "";
  const [login, password] = Buffer.from(b64auth, "base64").toString().split(":");
  if (login && password && login === auth.login && password === auth.password) return next();
  res.set("WWW-Authenticate", 'Basic realm="Staging Area"');
  res.status(401).send("Acceso restringido");
});

// ── Redirecciones base
app.get("/", (_req, res) => res.redirect("/es/esp-namegasm-basica"));
app.get("/es", (_req, res) => res.redirect("/es/esp-namegasm-basica"));
app.get("/en", (_req, res) => res.redirect("/en/namegasm-basica"));
app.get("/en/", (_req, res) => res.redirect("/en/namegasm-basica"));

// ── ES base (EJS existentes)
app.get("/es/esp-namegasm-basica", (_req, res) =>
  renderSafe(res, "Espanol/esp-namegasm-basica", { title: "NameGasm — Portada (ES)" })
);
app.get("/es/esp-namegasm-pagina-inicial-basica", (_req, res) =>
  renderSafe(res, "Espanol/esp-namegasm-pagina-inicial-basica", { title: "NameGasm — Funcionalidades (ES)" })
);

// Aliases sin /es
app.get("/namegasm-pagina-inicial-basica", (_req, res) =>
  renderSafe(res, "Espanol/esp-namegasm-pagina-inicial-basica", { title: "NameGasm — Funcionalidades (ES)" })
);
app.get("/esp-about-us", (_req, res) =>
  renderSafe(res, "Espanol/esp-about-us", { title: "Acerca de nosotros" })
);

// Header (según tus vistas)
app.get("/es/esp-sign-in",  (_req, res) => renderSafe(res, "Espanol/esp-sign-in",  { title: "Entrar" }));
app.get("/es/esp-sign-up",  (_req, res) => renderSafe(res, "Espanol/esp-sign-up",  { title: "Registrarse" }));
app.get("/es/esp-sign-out", (_req, res) => renderSafe(res, "Espanol/esp-sign-out", { title: "Darse de baja" }));

// 2FA variantes
app.get("/es/esp-2fa", (_req, res) => renderSafe(res, "Espanol/esp-2fa", { title: "2FA" }));
app.get("/es/esp-2FA", (_req, res) => renderSafe(res, "Espanol/esp-2fa", { title: "2FA" }));

// Migrar dominio (ES)
app.get("/es/esp-migrate-domain", (_req, res) =>
  renderSafe(res, "Espanol/esp-migrate-domain", { title: "Migrar Dominio" })
);
app.get("/es/esp-domain-transfer", (_req, res) =>
  renderSafe(res, "Espanol/esp-domain-transfer", { title: "Migrar Dominio" })
);
// ✅ NUEVA RUTA LITERAL → renderiza la vista EJS
 app.get("/es/esp-new-TLDs", (_req, res) =>
  renderSafe(res, "Espanol/esp-new-TLDs", { title: "TLDs Nuevos" })
);
 app.get("/es/esp-2FA", (_req, res) =>
  renderSafe(res, "Espanol/esp-2fa", { title: "2FA" })
);
 app.get("/es/esp-domain-privacy", (_req, res) =>
  renderSafe(res, "Espanol/esp-domain-privacy", { title: "2FA" })
);

// ── EN base (EJS existentes)
app.get("/en/namegasm-basica", (_req, res) =>
  renderSafe(res, "Ingles/namegasm-basica", { title: "NameGasm — Home (EN)" })
);
app.get("/en/namegasm-pagina-inicial-basica", (_req, res) =>
  renderSafe(res, "Ingles/namegasm-pagina-inicial-basica", { title: "NameGasm — Features (EN)" })
);
app.get("/en/migrate-domain", (_req, res) =>
  renderSafe(res, "Ingles/migrate-domain", { title: "Migrate Domain" })
);
app.get("/en/domain-transfer", (_req, res) =>
  renderSafe(res, "Ingles/domain-transfer", { title: "Migrate Domain" })
);

// ✅ NUEVA RUTA LITERAL → renderiza la vista EJS
app.get("/en/search-domain", (_req, res) =>
  renderSafe(res, "Ingles/search-domain", { title: "Search Domain" })
);
app.get("/en/new-TLDs", (_req, res) =>
  renderSafe(res, "Ingles/new-TLDs", { title: "New TLDs" })
);
app.get("/en/domain-transfer", (_req, res) =>
  renderSafe(res, "Ingles/domain-transfer", { title: "Migrate Domain" })
);

// ── Estáticos /public (atajos existentes)
app.get("/cart",    (_req, res) => sendIfExists(res, "cart.html"));
app.get("/en/cart", (_req, res) => sendIfExists(res, "en/cart.html"));
app.get("/checkout",           (_req, res) => sendIfExists(res, "checkout.html"));
app.get("/payment",            (_req, res) => sendIfExists(res, "payment.html"));
app.get("/order-confirmation", (_req, res) => sendIfExists(res, "order-confirmation.html"));
app.get("/en/checkout",           (_req, res) => sendIfExists(res, "en/checkout.html"));
app.get("/en/payment",            (_req, res) => sendIfExists(res, "en/payment.html"));
app.get("/en/order-confirmation", (_req, res) => sendIfExists(res, "en/order-confirmation.html"));

// ── Genéricos: primero HTML en /public, luego EJS
app.get("/es/:page", (req, res) => {
  const file = `${req.params.page}.html`;
  if (sendIfExists(res, file)) return;
  renderSafe(res, `Espanol/${req.params.page}`, { title: `ES — ${req.params.page}` });
});
app.get("/en/:page", (req, res) => {
  const file = path.join("en", `${req.params.page}.html`);
  if (sendIfExists(res, file)) return;
  renderSafe(res, `Ingles/${req.params.page}`, { title: `EN — ${req.params.page}` });
});

// ───────────────────────────────────────────────────────────
// Routers backend existentes (si están)
// ───────────────────────────────────────────────────────────
try {
  app.use("/api/search", require("./routes/search"));
  app.use("/api/users",  require("./routes/users"));
  app.use("/api/orders", require("./routes/orders"));
  app.use("/api",        require("./routes/orderRoutes"));
} catch (e) {
  console.warn("Aviso routers /routes: ", e.message);
}

// ───────────────────────────────────────────────────────────
// RDAP: endpoint general (ilimitado, con rate/minuto)
// ───────────────────────────────────────────────────────────
const ng_rateBucket = new Map(); // ip -> { count, ts }
const NG_WINDOW_MS = 60 * 1000;
const NG_MAX_REQ   = 60;

function ng_rateLimit(req, res, next) {
  const ip = (req.headers["x-forwarded-for"] || req.ip || "").toString().split(",")[0].trim();
  const now = Date.now();
  const entry = ng_rateBucket.get(ip) || { count: 0, ts: now };
  if (now - entry.ts > NG_WINDOW_MS) { entry.count = 1; entry.ts = now; }
  else { entry.count += 1; }
  ng_rateBucket.set(ip, entry);
  if (entry.count > NG_MAX_REQ) return res.status(429).json({ error: "Too many requests, slow down." });
  next();
}
function ng_isValidDomain(domain) {
  const d = (domain || "").trim().toLowerCase();
  if (!d || d.length > 253) return false;
  if (d.indexOf("..") !== -1) return false;
  const re = /^([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)(\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;
  return re.test(d);
}
const ng_cache = new Map(); // key -> { value, exp }
const NG_TTL_MS = 5 * 60 * 1000;
function ng_getCache(key) {
  const it = ng_cache.get(key);
  if (!it) return null;
  if (Date.now() > it.exp) { ng_cache.delete(key); return null; }
  return it.value;
}
function ng_setCache(key, value, ttl) {
  ng_cache.set(key, { value, exp: Date.now() + (ttl || NG_TTL_MS) });
}

app.post("/api/search-domain", ng_rateLimit, async (req, res) => {
  try {
    const domain = String((req.body || {}).domain || "").trim();
    if (!ng_isValidDomain(domain)) return res.status(400).json({ error: "Invalid domain format." });

    const cached = ng_getCache(domain);
    if (cached) return res.json({ domain, available: cached.available, cached: true, source: "cache" });

    const rdapUrl = "https://rdap.org/domain/" + encodeURIComponent(domain);
    const resp = await fetch(rdapUrl, { headers: { "User-Agent": "NameGasm/1.0" }, timeout: 8000 });

    if (resp.status === 200) { ng_setCache(domain, { available: false }); return res.json({ domain, available: false, source: "rdap" }); }
    if (resp.status === 404) { ng_setCache(domain, { available: true  }); return res.json({ domain, available: true,  source: "rdap" }); }
    return res.status(502).json({ error: "Upstream RDAP error", status: resp.status });
  } catch (err) {
    console.error("Error /api/search-domain:", err?.message || err);
    res.status(500).json({ error: "Internal error" });
  }
});

// ───────────────────────────────────────────────────────────
// RDAP: endpoint del plan GRATIS (3 intentos/día/IP)
// ───────────────────────────────────────────────────────────
const DAILY_LIMIT = 3;
const dayBucket = new Map(); // ip -> { day: 'YYYY-MM-DD', count: n }

function todayStr() {
  const d = new Date();
  return d.getUTCFullYear() + "-" + String(d.getUTCMonth()+1).padStart(2,"0") + "-" + String(d.getUTCDate()).padStart(2,"0");
}

app.post("/api/search-domain-free", async (req, res) => {
  try {
    const domain = String((req.body || {}).domain || "").trim();
    if (!ng_isValidDomain(domain)) return res.status(400).json({ error: "Invalid domain format." });

    const ip = (req.headers["x-forwarded-for"] || req.ip || "").toString().split(",")[0].trim();
    const today = todayStr();
    const rec = dayBucket.get(ip) || { day: today, count: 0 };
    if (rec.day !== today) { rec.day = today; rec.count = 0; }

    if (rec.count >= DAILY_LIMIT) {
      res.setHeader("X-Daily-Limit", DAILY_LIMIT);
      res.setHeader("X-Remaining", 0);
      return res.status(402).json({ error: "Has alcanzado el límite diario gratuito (3). Compra o vuelve mañana." });
    }

    rec.count += 1;
    dayBucket.set(ip, rec);

    const cached = ng_getCache(domain);
    if (cached) {
      res.setHeader("X-Daily-Limit", DAILY_LIMIT);
      res.setHeader("X-Remaining", Math.max(DAILY_LIMIT - rec.count, 0));
      return res.json({ domain, available: cached.available, cached: true, source: "cache" });
    }

    const rdapUrl = "https://rdap.org/domain/" + encodeURIComponent(domain);
    const resp = await fetch(rdapUrl, { headers: { "User-Agent": "NameGasm/1.0" }, timeout: 8000 });

    let payload;
    if (resp.status === 200) { ng_setCache(domain, { available: false }); payload = { domain, available: false, source: "rdap" }; }
    else if (resp.status === 404) { ng_setCache(domain, { available: true }); payload = { domain, available: true, source: "rdap" }; }
    else return res.status(502).json({ error: "Upstream RDAP error", status: resp.status });

    res.setHeader("X-Daily-Limit", DAILY_LIMIT);
    res.setHeader("X-Remaining", Math.max(DAILY_LIMIT - rec.count, 0));
    return res.json(payload);
  } catch (err) {
    console.error("Error /api/search-domain-free:", err?.message || err);
    res.status(500).json({ error: "Internal error" });
  }
});

// 404
app.use((_req, res) => res.status(404).send("404 - Página no encontrada"));

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});










