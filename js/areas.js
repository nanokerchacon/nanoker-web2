// js/areas.js
(function () {
  const reduceMotion =
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  const nav = document.querySelector(".nav");
  const navLinks = Array.from(document.querySelectorAll(".nav-center .nav-link"));
  const sections = Array.from(document.querySelectorAll("section.section[id]"));

  if (!navLinks.length || !sections.length) return;

  // -----------------------------
  // 1) Scroll suave con offset (por nav fijo)
  // -----------------------------
  function getNavOffset() {
    const h = nav?.getBoundingClientRect().height ?? 0;
    return Math.ceil(h + 18); // margen extra
  }

  navLinks.forEach((link) => {
    const href = link.getAttribute("href") || "";
    if (!href.startsWith("#")) return;

    link.addEventListener("click", (e) => {
      const id = href.slice(1);
      const target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();

      const y =
        window.scrollY + target.getBoundingClientRect().top - getNavOffset();

      window.history.pushState(null, "", href);

      window.scrollTo({
        top: y,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    });
  });

  // Si entras con hash (#algo), corrige offset
  function correctHashOffset() {
    const hash = window.location.hash?.slice(1);
    if (!hash) return;
    const target = document.getElementById(hash);
    if (!target) return;

    const y =
      window.scrollY + target.getBoundingClientRect().top - getNavOffset();

    window.scrollTo({ top: y, behavior: "auto" });
  }

  // -----------------------------
  // 2) Indicador de sección activa (IntersectionObserver)
  // -----------------------------
  const linkById = new Map(
    navLinks
      .map((a) => {
        const href = a.getAttribute("href") || "";
        if (!href.startsWith("#")) return null;
        return [href.slice(1), a];
      })
      .filter(Boolean)
  );

  function setActive(id) {
    navLinks.forEach((a) => a.classList.remove("is-active"));
    const active = linkById.get(id);
    if (active) active.classList.add("is-active");
  }

  const activeObserver = new IntersectionObserver(
    (entries) => {
      // coge el más visible
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];

      if (visible?.target?.id) setActive(visible.target.id);
    },
    {
      root: null,
      threshold: [0.2, 0.35, 0.5, 0.65],
      rootMargin: "-25% 0px -55% 0px",
    }
  );

  sections.forEach((sec) => activeObserver.observe(sec));

  // -----------------------------
  // 3) Mini animación de tarjetas (reveal)
  // -----------------------------
  const cards = Array.from(document.querySelectorAll(".card"));
  cards.forEach((c) => c.classList.add("reveal"));

  if (!reduceMotion) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-inview");
            revealObserver.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );

    cards.forEach((c) => revealObserver.observe(c));
  } else {
    cards.forEach((c) => c.classList.add("is-inview"));
  }

  // -----------------------------
  // Init
  // -----------------------------
  window.addEventListener("load", () => {
    // un frame después para que el layout esté listo
    requestAnimationFrame(correctHashOffset);
  });

  window.addEventListener("resize", () => {
    // Si cambian alturas, mantiene bien el offset al entrar por hash
    // (no hacemos scroll aquí para no molestar)
  });
})();
