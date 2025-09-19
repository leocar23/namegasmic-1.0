// index.js — Express + EJS + MongoDB + rutas limpias (sin comodines) + RDAP + plan gratis 3/día
const express = require("express");
const path = require("path");
const fs = require("fs");
const fetch = require("node-fetch");

// ── MongoDB (si aplica)
const connectDB = require("./db");
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ── Estáticos /public
const PUBLIC_DIR = path.join(__dirname, "public");
app.use(express.static(PUBLIC_DIR));

// ── Banderas (alias sólidos)
["/bandera-es.png", "/en/bandera-es.png", "/es/bandera-es.png"].forEach(p =>
  app.use(p, express.static(path.join(PUBLIC_DIR, "img", "bandera-es.png")))
);
["/bandera-uk.png", "/en/bandera-uk.png", "/es/bandera-uk.png"].forEach(p =>
  app.use(p, express.static(path.join(PUBLIC_DIR, "img", "bandera-uk.png")))
);

// ── Helpers
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

// ======================================================================
// RUTAS LIMPIAS — ESPAÑOL (sin comodines)
// ======================================================================
const ES = (view, title) => (_req, res) => renderSafe(res, `Espanol/${view}`, { title });

app.get("/es/esp-namegasm-basica",
  ES("esp-namegasm-basica", "NameGasm — Portada (ES)")
);
app.get("/es/esp-namegasm-pagina-inicial-basica",
  ES("esp-namegasm-pagina-inicial-basica", "NameGasm — Funcionalidades (ES)")
);

// Header
app.get("/es/esp-sign-in",  ES("esp-sign-in",  "Entrar"));
app.get("/es/esp-sign-up",  ES("esp-sign-up",  "Registrarse"));
app.get("/es/esp-sign-out", ES("esp-sign-out", "Darse de baja"));

// Seguridad
app.get("/es/esp-2fa", ES("esp-2fa", "2FA"));
app.get("/es/esp-2FA", ES("esp-2fa", "2FA")); // alias mayúscula

// Migraciones
app.get("/es/esp-migrate-domain",   ES("esp-migrate-domain",   "Migrar Dominio"));
app.get("/es/esp-domain-transfer",  ES("esp-domain-transfer",  "Migrar Dominio"));
app.get("/es/esp-migrate-hosting",  ES("esp-migrate-hosting",  "Migrar Alojamiento"));
app.get("/es/esp-migrate-wordpress",ES("esp-migrate-wordpress","Migrar Wordpress"));
app.get("/es/esp-migrate-email",    ES("esp-migrate-email",    "Migrar E-mail"));

// Otras (agrega aquí más vistas ES cuando las tengas)
app.get("/es/esp-how-to",       ES("esp-how-to",       "Cómo se hace?"));
app.get("/es/esp-contact-us",   ES("esp-contact-us",   "Contáctenos"));
app.get("/es/esp-search-domain",ES("esp-search-domain","Búsqueda de dominio")); // si existiera versión ES

// Aliases sin /es (si los usas)
app.get("/namegasm-pagina-inicial-basica",
  ES("esp-namegasm-pagina-inicial-basica", "NameGasm — Funcionalidades (ES)")
);
app.get("/esp-about-us", ES("esp-about-us", "Acerca de nosotros"));

// ======================================================================
// RUTAS LIMPIAS — ENGLISH (sin comodines)
// ======================================================================
const EN = (view, title) => (_req, res) => renderSafe(res, `Ingles/${view}`, { title });

app.get("/en/namegasm-basica",
  EN("namegasm-basica", "NameGasm — Home (EN)")
);
app.get("/en/namegasm-pagina-inicial-basica",
  EN("namegasm-pagina-inicial-basica", "NameGasm — Features (EN)")
);

// Domains
app.get("/en/search-domain", EN("search-domain", "Search Domain"));
app.get("/en/new-tlds",      EN("new-tlds",      "New TLDs"));
app.get("/en/personal-domains", EN("personal-domains", "Personal Domains"));
app.get("/en/name-generator",   EN("name-generator",   "Name Generator"));
app.get("/en/premium-dns",      EN("premium-dns",      "Premium DNS"));

// Security
app.get("/en/ssl-certificates",    EN("ssl-certificates",    "SSL Certificates"));
app.get("/en/domain-privacy",      EN("domain-privacy",      "Domain Privacy"));
app.get("/en/website-security",    EN("website-security",    "Website Security"));
app.get("/en/cdn",                 EN("cdn",                 "CDN"));
app.get("/en/2FA",                 EN("2FA",                 "2FA"));
app.get("/en/anti-spam-protection",EN("anti-spam-protection","Anti-Spam Protection"));

// Hosting
app.get("/en/shared-hosting",    EN("shared-hosting",    "Shared Hosting"));
app.get("/en/wordpress-hosting", EN("wordpress-hosting", "WordPress Hosting"));
app.get("/en/reseller-hosting",  EN("reseller-hosting",  "Reseller Hosting"));
app.get("/en/dedicated-servers", EN("dedicated-servers", "Dedicated Servers"));

// Transfers
app.get("/en/migrate-to-namegasm", EN("migrate-to-namegasm", "Migrate to namegasm"));
app.get("/en/migrate-domain",      EN("migrate-domain",      "Migrate Domain"));
app.get("/en/domain-transfer",     EN("domain-transfer",     "Migrate Domain"));
app.get("/en/migrate-hosting",     EN("migrate-hosting",     "Migrate Hosting"));
app.get("/en/migrate-wordpress",   EN("migrate-wordpress",   "Migrate WordPress"));
app.get("/en/migrate-email",       EN("migrate-email",       "Migrate E-mail"));

// WordPress / Help / Contact
app.get("/en/migrate-to-wordpress", EN("migrate-to-wordpress", "Migrate to WordPress"));
app.get("/en/how-to",               EN("how-to",               "How To"));
app.get("/en/contact-us",           EN("contact-us",           "Contact Us"));

// ======================================================================
// Estáticos /public (atajos comunes)
// ======================================================================
app.get("/cart",    (_req, res) => sendIfExists(res, "cart.html"));
app.get("/en/cart", (_req, res) => sendIfExists(res, "en/cart.html"));
app.get("/checkout",           (_req, res) => sendIfExists(res, "checkout.html"));
app.get("/payment",            (_req, res) => sendIfExists(res, "payment.html"));
app.get("/order-confirmation", (_req, res) => sendIfExists(res, "order-confirmation.html"));
app.get("/en/checkout",           (_req, res) => sendIfExists(res, "en/checkout.html"));
app.get("/en/payment",            (_req, res) => sendIfExists(res, "en/payment.html"));
app.get("/en/order-confirmation", (_req, res) => sendIfExists(res, "en/order-confirmation.html"));

// ======================================================================
// API / Backoffice routers (si existen)
// ======================================================================
try {
  app.use("/api/search", require("./routes/search"));
  app.use("/api/users",  require("./routes/users"));
  app.use("/api/orders", require("./routes/orders"));
  app.use("/api",        require("./routes/orderRoutes"));
} catch (e) {
  console.warn("Aviso routers /routes: ", e.message);
}

// ======================================================================
// RDAP endpoints
// ======================================================================
const ng_rateBucket = new Map();
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
const ng_cache = new Map();
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

// Plan GRATIS (3 intentos/día/IP)
const DAILY_LIMIT = 3;
const dayBucket = new Map();
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

// ── 404
app.use((_req, res) => res.status(404).send("404 - Página no encontrada"));

// ── Start
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
