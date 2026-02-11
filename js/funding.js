// js/funding.js
// Estilo: funding-pro (tu CSS actual) + modal funding-modal (tu modal actual)

function normalizeLang(raw) {
  const base = (raw || "").toLowerCase().split("-")[0];
  return base === "es" ? "es" : "en";
}

function getCurrentLang(getLangFn) {
  const fromLib = typeof getLangFn === "function" ? getLangFn() : null;
  const htmlLang = document.documentElement.getAttribute("lang");
  return normalizeLang(fromLib || htmlLang || navigator.language);
}

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* ==========================
   DATA (EDITA SOLO AQUÍ)
========================== */

// CERTIFICADOS (PDF ES/EN)
const CERTS = [
  {
    id: "iso9001",
    badge: "ISO",
    title: { es: "Certificación ISO 9001", en: "ISO 9001 Certification" },
    desc: {
      es: "Sistema de gestión de calidad.",
      en: "Quality management system certification.",
    },
    tags: ["Quality", "ISO 9001"],
    pdf: { es: "./docs/ISO-9001-ES.pdf", en: "./docs/ISO-9001-EN.pdf" },
    thumb: "", // opcional: "./img/certs/iso9001.jpg"
  },
];

// POSTERS (imagen)
const POSTERS = [
  {
    id: "poster-1",
    badge: "EU / CDTI",
    title: {
      es: "Investigación industrial en materiales estratégicos para baterías Li-ion",
      en: "Industrial research on strategic materials for Li-ion batteries",
    },
    desc: {
      es: "Póster oficial del proyecto y reconocimiento de financiación.",
      en: "Official project poster and funding acknowledgement.",
    },
    tags: ["EU", "CDTI", "FEDER"],
    image: "./img/posters/poster-1.jpg",
  },
  {
    id: "poster-2",
    badge: "IDEPA",
    title: {
      es: "Desarrollo de cerámicas técnicas basadas en nitruro de boro",
      en: "Technical ceramics based on boron nitride development",
    },
    desc: {
      es: "Póster del proyecto de cerámicas técnicas.",
      en: "Technical ceramics development project poster.",
    },
    tags: ["EU", "IDEPA", "ASTURIAS"],
    image: "./img/posters/poster-2.jpg",
  },
  {
    id: "poster-3",
    badge: "Spain",
    title: {
      es: "Acreditación / apoyo institucional (Gobierno de España)",
      en: "Institutional accreditation / support (Government of Spain)",
    },
    desc: {
      es: "Póster de apoyo institucional.",
      en: "Institutional support poster.",
    },
    tags: ["SPAIN", "SCIENCE"],
    image: "./img/posters/poster-3.jpg",
  },
];

/* ==========================
   MODAL (usa tu markup actual)
========================== */

function initFundingModal() {
  const modal = document.getElementById("fundingModal");
  const img = document.getElementById("fundingModalImg");
  const meta = document.getElementById("fundingModalMeta");
  const titleEl = document.getElementById("fundingModalTitle");

  const prevBtn = document.getElementById("fundingPrev");
  const nextBtn = document.getElementById("fundingNext");

  if (!modal || !img || !meta || !titleEl) return null;

  let index = 0;

  const close = () => {
    modal.setAttribute("aria-hidden", "true");
    img.src = "";
    img.alt = "";
    meta.textContent = "";
    index = 0;
  };

  const openAt = (i, lang) => {
    index = (i + POSTERS.length) % POSTERS.length;
    const item = POSTERS[index];

    modal.setAttribute("aria-hidden", "false");

    const t = item.title?.[lang] || item.title?.en || "";
    const d = item.desc?.[lang] || item.desc?.en || "";

    titleEl.textContent = t;
    meta.textContent = d;

    img.src = item.image;
    img.alt = t;

    // sweep (si existe)
    const sweep = document.getElementById("fundingSweep");
    if (sweep) {
      sweep.classList.remove("play");
      // reflow
      void sweep.offsetWidth;
      sweep.classList.add("play");
    }
  };

  // Close handlers
  modal.querySelectorAll("[data-funding-close]").forEach((el) => {
    el.addEventListener("click", close);
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.getAttribute("aria-hidden") === "false") close();
  });

  // Nav
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      const lang = normalizeLang(document.documentElement.lang || "en");
      openAt(index - 1, lang);
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      const lang = normalizeLang(document.documentElement.lang || "en");
      openAt(index + 1, lang);
    });
  }

  return { openAt, close };
}

/* ==========================
   RENDER HELPERS
========================== */

function renderTags(tags = []) {
  return (tags || [])
    .map((t) => `<span class="funding-pro-tag">${escapeHtml(t)}</span>`)
    .join("");
}

/* ==========================
   INIT
========================== */

export function initFunding(getLangFn) {
  const certGrid = document.getElementById("certGrid");
  const postersGrid = document.getElementById("fundingGrid");
  if (!certGrid && !postersGrid) return;

  const modal = initFundingModal();

  const render = () => {
    const lang = getCurrentLang(getLangFn);

    // CERTS
    if (certGrid) {
      certGrid.innerHTML = CERTS.map((c) => {
        const title = c.title?.[lang] || c.title?.en || "";
        const desc = c.desc?.[lang] || c.desc?.en || "";
        const href = c.pdf?.[lang] || c.pdf?.en || "#";

        const thumbHtml = c.thumb
          ? `<img src="${escapeHtml(c.thumb)}" alt="${escapeHtml(title)}" />`
          : `<div class="funding-pro-thumbGlow"></div>`;

        return `
          <article class="funding-pro-card">
            <div class="funding-pro-thumb">
              ${thumbHtml}
              <div class="funding-pro-thumbGlow"></div>
              <div class="funding-pro-openHint">${c.badge ? escapeHtml(c.badge) : "PDF"}</div>
            </div>

            <div class="funding-pro-cardBody">
              <div class="funding-pro-cardTitle">${escapeHtml(title)}</div>
              <div class="funding-pro-cardMeta">${escapeHtml(desc)}</div>

              <div class="funding-pro-tags">${renderTags(c.tags)}</div>

              <div class="funding-pro-actionsRow">
                <a class="funding-pro-btn" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">
                  <span data-i18n="funding.open">Open</span> ↗
                </a>
              </div>
            </div>
          </article>
        `;
      }).join("");
    }

    // POSTERS
    if (postersGrid) {
      postersGrid.innerHTML = POSTERS.map((p, idx) => {
        const title = p.title?.[lang] || p.title?.en || "";
        const desc = p.desc?.[lang] || p.desc?.en || "";

        return `
          <article class="funding-pro-card" data-poster="${escapeHtml(p.id)}" data-index="${idx}">
            <div class="funding-pro-thumb">
              <img src="${escapeHtml(p.image)}" alt="${escapeHtml(title)}" />
              <div class="funding-pro-thumbGlow"></div>
              <div class="funding-pro-openHint">${escapeHtml(p.badge || "OPEN")}</div>
            </div>

            <div class="funding-pro-cardBody">
              <div class="funding-pro-cardTitle">${escapeHtml(title)}</div>
              <div class="funding-pro-cardMeta">${escapeHtml(desc)}</div>

              <div class="funding-pro-tags">${renderTags(p.tags)}</div>

              <div class="funding-pro-actionsRow">
                <button class="funding-pro-btn" type="button" data-preview="${escapeHtml(p.id)}">
                  <span data-i18n="funding.preview">Preview</span>
                </button>

                <a class="funding-pro-btn" href="${escapeHtml(p.image)}" target="_blank" rel="noopener noreferrer">
                  <span data-i18n="funding.open">Open</span> ↗
                </a>
              </div>
            </div>
          </article>
        `;
      }).join("");

      // Preview handlers
      postersGrid.querySelectorAll("[data-preview]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-preview");
          const idx = POSTERS.findIndex((x) => x.id === id);
          if (!modal || idx < 0) return;
          modal.openAt(idx, lang);
        });
      });

      // Click card (optional: open modal by clicking the card)
      postersGrid.querySelectorAll(".funding-pro-card").forEach((card) => {
        card.addEventListener("click", (e) => {
          // Si click en <a> o <button>, no abrir doble
          const target = e.target;
          if (target && (target.closest("a") || target.closest("button"))) return;

          const idx = Number(card.getAttribute("data-index") || "0");
          if (!modal) return;
          modal.openAt(idx, lang);
        });
      });
    }
  };

  render();
  window.addEventListener("lang:change", render);
}
