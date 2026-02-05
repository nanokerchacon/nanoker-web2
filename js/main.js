import { initThreeBackground } from "./three-bg.js";

let three = null;

try {
  three = initThreeBackground();
} catch (e) {
  console.warn("Three no pudo inicializarse en este dispositivo:", e);
  document.body.classList.add("no-three");
}

// --- SCROLL STATE ---
function updateStateByScroll() {
  const scrollY = window.scrollY;

  const navBar = document.getElementById("navbar");
  if (navBar) {
    if (scrollY > 50) navBar.classList.add("scrolled");
    else navBar.classList.remove("scrolled");
  }

  if (!three) return;

  const viewportH = window.innerHeight;

  const q = document.getElementById("sec-quantum");
  const s = document.getElementById("sec-semi");
  const e = document.getElementById("sec-extreme");
  const m = document.getElementById("sec-medical");
  const v = document.getElementById("sec-value");
  const f = document.getElementById("sec-funding");

  if (!q || !s || !e || !m || !v) return;

  const triggerPoint = (el) => el.offsetTop - viewportH * 0.45;

  const secQuantum = triggerPoint(q);
  const secSemi = triggerPoint(s);
  const secExtreme = triggerPoint(e);
  const secMedical = triggerPoint(m);
  const secValue = triggerPoint(v);
  const secFunding = f ? triggerPoint(f) : Number.POSITIVE_INFINITY;

  if (scrollY < secQuantum) three.setTargetState("hero");
  else if (scrollY < secSemi) three.setTargetState("quantum");
  else if (scrollY < secExtreme) three.setTargetState("semi");
  else if (scrollY < secMedical) three.setTargetState("extreme");
  else if (scrollY < secValue) three.setTargetState("medical");
  else if (scrollY < secFunding) three.setTargetState("value");
  else three.setTargetState("value");
}

window.addEventListener("scroll", updateStateByScroll, { passive: true });
updateStateByScroll();

// IntersectionObserver para activar tarjetas / secciones
const cardObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("active");
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll(".section").forEach((s) => cardObserver.observe(s));

/* ==========================
   CERTIFICATIONS PDF LINKS
   (auto ES/EN)
========================== */

(function () {
  // ✅ Si tu <html lang="es"> / <html lang="en"> cambia algún día, esto lo respeta.
  // Si no, usa el idioma del navegador.
  function normalizeLang(raw) {
    const base = (raw || "").toLowerCase().split("-")[0];
    return base === "es" ? "es" : "en";
  }

  function getCurrentLang() {
    const htmlLang = document.documentElement.getAttribute("lang");
    return normalizeLang(htmlLang || navigator.language);
  }

  const lang = getCurrentLang();

  // ✅ RUTAS (según tu captura: /docs en raíz del proyecto)
  // IMPORTANTE: asegúrate de que los archivos se llamen EXACTO así en Windows:
  // ISO-9001-ES.pdf e ISO-9001-EN.pdf
  const CERT_PDFS = {
    iso9001: {
      es: "./docs/ISO-9001-ES.pdf",
      en: "./docs/ISO-9001-EN.pdf",
    },
    // cuando tengas los otros:
    // iso13485: { es:"./docs/ISO-13485-ES.pdf", en:"./docs/ISO-13485-EN.pdf" },
    // iso14001: { es:"./docs/ISO-14001-ES.pdf", en:"./docs/ISO-14001-EN.pdf" },
  };

  // Aplica href automáticamente a los links del footer (o donde sea)
  document.querySelectorAll("[data-cert]").forEach((a) => {
    const key = a.getAttribute("data-cert");
    const map = CERT_PDFS[key];
    if (!map) return;
    a.href = map[lang] || map.en;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
  });
})();
