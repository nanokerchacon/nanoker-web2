// js/lang.js
import { I18N } from "./i18n.js";

const KEY = "nanoker-lang";

// Normaliza: "es-ES" -> "es"
function normalizeLang(raw) {
  const base = String(raw || "").toLowerCase().split("-")[0];
  return base === "es" ? "es" : "en";
}

let current = normalizeLang(localStorage.getItem(KEY) || navigator.language);
if (!I18N[current]) current = "en";

let domObserver = null;

export function getLang() {
  return current;
}

// t() con fallback: si no existe la key, devuelve fallback (o undefined si no se pasa)
export function t(path, fallback) {
  const value = path
    .split(".")
    .reduce((o, k) => (o && typeof o === "object" ? o[k] : undefined), I18N[current]);

  // Si es string no vacía -> OK
  if (typeof value === "string" && value.trim() !== "") return value;

  // Si es número/boolean -> lo convertimos
  if (typeof value === "number" || typeof value === "boolean") return String(value);

  // Si no existe -> fallback (por defecto, lo que ya había en DOM)
  return fallback;
}

export function setLang(lang) {
  const next = normalizeLang(lang);
  if (!I18N[next]) return;

  current = next;
  localStorage.setItem(KEY, next);
  document.documentElement.lang = next;

  applyTranslations();

  window.dispatchEvent(new CustomEvent("lang:change", { detail: { lang: next } }));

  // Actualiza el botón si existe
  const btn = document.getElementById("langToggle");
  if (btn) btn.textContent = I18N[current]?.nav?.lang || current.toUpperCase();
}

export function applyTranslations(root = document) {
  // data-i18n => textContent
  root.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    const fallback = el.textContent;              // ✅ importante
    const val = t(key, fallback);
    if (typeof val === "string") el.textContent = val; // ✅ nunca vacía por missing key
  });

  // data-i18n-html => innerHTML
  root.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const key = el.dataset.i18nHtml;
    const fallback = el.innerHTML;                // ✅ importante
    const val = t(key, fallback);
    if (typeof val === "string") el.innerHTML = val;
  });

  // data-i18n-placeholder => placeholder
  root.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.dataset.i18nPlaceholder;
    const fallback = el.getAttribute("placeholder") || ""; // ✅ importante
    const val = t(key, fallback);
    if (typeof val === "string") el.setAttribute("placeholder", val);
  });
}

export function initLanguageSwitcher(options = {}) {
  applyTranslations();

  const btn = document.getElementById("langToggle");
  if (btn) {
    btn.textContent = I18N[current]?.nav?.lang || current.toUpperCase();
    btn.addEventListener("click", () => {
      setLang(current === "en" ? "es" : "en");
    });
  }

  // ✅ Opcional: observar DOM inyectado sin “vaciar” textos
  if (options.observeDOM) {
    if (domObserver) domObserver.disconnect();

    domObserver = new MutationObserver((mutations) => {
      for (const m of mutations) {
        // Traducimos solo lo que se añade
        m.addedNodes?.forEach((n) => {
          if (n && n.nodeType === 1) applyTranslations(n);
        });
      }
    });

    domObserver.observe(document.body, { childList: true, subtree: true });
  }
}
