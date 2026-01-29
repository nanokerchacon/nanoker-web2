import { initThreeBackground } from "./three-bg.js";

const three = initThreeBackground();

// --- SCROLL STATE ---
function updateStateByScroll() {
  const scrollY = window.scrollY;
  const viewportH = window.innerHeight;

  const secQuantum = document.getElementById("sec-quantum").offsetTop - viewportH * 0.5;
  const secSemi = document.getElementById("sec-semi").offsetTop - viewportH * 0.5;
  const secExtreme = document.getElementById("sec-extreme").offsetTop - viewportH * 0.5;

  if (scrollY < secQuantum) three.setTargetState("hero");
  else if (scrollY < secSemi) three.setTargetState("quantum");
  else if (scrollY < secExtreme) three.setTargetState("semi");
  else three.setTargetState("extreme");

  const nav = document.getElementById("navbar");
  if (scrollY > 50) nav.classList.add("scrolled");
  else nav.classList.remove("scrolled");
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
