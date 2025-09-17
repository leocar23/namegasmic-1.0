// routes/index.js
const express = require("express");
const router = express.Router();

// Conexión correcta a MongoDB desde la raíz
const connectDB = require("../db");
connectDB();

/* =========================
   HUB / PÁGINAS BASE
========================= */
// EN – hub funcional
router.get("/en/namegasm-pagina-inicial-basica", (req, res) => {
  res.render("Ingles/namegasm-pagina-inicial-basica", { title: "NameGasm Start" });
});
// EN – landing básica (si la usas)
router.get("/en/namegasm-basica", (req, res) => {
  res.render("Ingles/namegasm-basica", { title: "NameGasm Home" });
});

router.get("/namegasm-pagina-inicial-basica", (req, res) => {
  const ref = req.get("referer") || "";
  const isEN = /\/en\//i.test(ref);
  if (isEN) {
    res.render("Ingles/namegasm-pagina-inicial-basica", { title: "NameGasm Start" });
  } else {
    res.render("Espanol/esp-namegasm-pagina-inicial-basica", { title: "NameGasm Inicio" });
  }
});

router.get("/namegasm-basica", (req, res) => {
  const ref = req.get("referer") || "";
  const isEN = /\/en\//i.test(ref);
  if (isEN) {
    res.render("Ingles/namegasm-basica", { title: "NameGasm Home" });
  } else {
    res.render("Espanol/esp-namegasm-basica", { title: "NameGasm Inicio" });
  }
});

// === ES — páginas base (añadir si no existen)
router.get("/es/esp-namegasm-basica", (req, res) => {
  res.render("Espanol/esp-namegasm-basica", { title: "NameGasm — Portada (ES)" });
});
router.get("/es/esp-namegasm-pagina-inicial-basica", (req, res) => {
  res.render("Espanol/esp-namegasm-pagina-inicial-basica", { title: "NameGasm — Funcionalidades (ES)" });
});

// === ABOUT / ACERCA DE (añadir si no existen)
// ES
router.get("/es/esp-about-us", (req, res) => {
  res.render("Espanol/esp-about-us", { title: "Acerca de nosotros" });
});
// Aliases ES
router.get("/es/about-us",          (_req, res) => res.redirect(301, "/es/esp-about-us"));
router.get("/acerca-de-nosotros",   (_req, res) => res.redirect(301, "/es/esp-about-us"));
router.get("/es/acerca-de-nosotros",(_req, res) => res.redirect(301, "/es/esp-about-us"));

// EN
router.get("/en/about-us", (req, res) => {
  res.render("Ingles/about-us", { title: "About us" });
});
// Aliases EN
router.get("/about-us",        (_req, res) => res.redirect(301, "/en/about-us"));
router.get("/en/esp-about-us", (_req, res) => res.redirect(301, "/en/about-us"));


/* =========================
   OTRAS PÁGINAS (si las tienes)
========================= */
// Ejemplo para carrito, checkout, etc. (ajusta si usas EJS)
/*router.get("/es/esp-cart", (req, res) => {
  res.render("Espanol/esp-cart", { title: "Carrito" });
});
router.get("/en/cart", (req, res) => {
  res.render("Ingles/cart", { title: "Cart" });
});*/

module.exports = router;
