import { initThreeBackground } from "./three-bg.js";

let three = null;

try {
  three = initThreeBackground();
} catch (e) {
  console.warn("Three no pudo inicializarse en este dispositivo:", e);
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
  const m = document.getElementById("sec-medical"); // ✅ NUEVO
  const v = document.getElementById("sec-value");
  if (!q || !s || !e || !m || !v) return;

  const triggerPoint = (el) => el.offsetTop - viewportH * 0.45;
  const secQuantum = triggerPoint(q);
  const secSemi = triggerPoint(s);
  const secExtreme = triggerPoint(e);
  const secMedical = triggerPoint(m); // ✅ NUEVO
  const secValue = triggerPoint(v);

  if (scrollY < secQuantum) three.setTargetState("hero");
  else if (scrollY < secSemi) three.setTargetState("quantum");
  else if (scrollY < secExtreme) three.setTargetState("semi");
  else if (scrollY < secMedical) three.setTargetState("extreme"); // ✅
  else if (scrollY < secValue) three.setTargetState("medical"); // ✅
  else three.setTargetState("value");
}

window.addEventListener("scroll", updateStateByScroll, { passive: true });
updateStateByScroll();

// IntersectionObserver para activar tarjetas
const cardObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("active");
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll(".section").forEach((s) => cardObserver.observe(s));
