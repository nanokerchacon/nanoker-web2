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
  if (!q || !s || !e) return;

  const secQuantum = q.offsetTop - viewportH * 0.5;
  const secSemi = s.offsetTop - viewportH * 0.5;
  const secExtreme = e.offsetTop - viewportH * 0.5;

  if (scrollY < secQuantum) three.setTargetState("hero");
  else if (scrollY < secSemi) three.setTargetState("quantum");
  else if (scrollY < secExtreme) three.setTargetState("semi");
  else three.setTargetState("extreme");
}

window.addEventListener("scroll", updateStateByScroll);
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
