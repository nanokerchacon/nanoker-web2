// js/i18n.js
// Single source of truth for UI copy (EN/ES).
// Tip: Keep keys identical between languages.

function deepFreeze(obj) {
  if (!obj || typeof obj !== "object" || Object.isFrozen(obj)) return obj;
  Object.freeze(obj);
  Object.getOwnPropertyNames(obj).forEach((prop) => deepFreeze(obj[prop]));
  return obj;
}

export const I18N = deepFreeze({
  en: {
    nav: {
      sectors: "Sectors:",
      partner: "Partner Access",
      menu: "Open menu",
      quantum: "Quantum",
      semi: "Semiconductors",
      extreme: "Defense & Space",
      medical: "Medical",
      lang: "EN",
    },

    hero: {
      tagline:
        "Architecting the invisible layer of innovation.<br/>European Sovereignty in Advanced Materials.",
      scroll: "Scroll to Explore",
    },

    cards: {
      quantum: {
        title: "Quantum<br><b>Sensing.</b>",
        text:
          "Atomic-scale defect engineering. CVD diamond with Nitrogen-Vacancy (NV) centers exhibiting quantum coherence at room temperature.",
        spec: {
          coherence: "Coherence",
          defects: "Defects",
          growth: "Growth Rate",
          process: "Process",
        },
      },

      semi: {
        title: "Wide Bandgap<br><b>Power.</b>",
        text:
          "Silicon Carbide (SiC) and EPI-ready sapphire substrates. Atomically flat surfaces (< 0.2 nm) for next-generation power electronics.",
        spec: {
          material: "Material",
          purity: "Purity",
          roughness: "Roughness",
          focus: "Focus Ring",
        },
      },

      extreme: {
        title: "Extreme<br><b>Environ<wbr>ments.</b>",
        text:
          "Sintered technical ceramics (SPS). Alumina and B4C engineered for extreme abrasion, ballistic impact, and atmospheric re-entry.",
        spec: {
          temp: "Temp",
          thermal: "Thermal",
          cert: "Cert",
          density: "Density",
        },
      },

      medical: {
        title: "Medical<br><b>Services.</b>",
        text:
          "Consultations, diagnostics, and clinical follow-up with advanced equipment and a patient-centered approach.",
        spec: {
          wait: "Wait Time",
          results: "Results",
          specialties: "Specialties",
          support: "Support",
        },
      },
    },
  },

  es: {
    nav: {
      sectors: "Sectores:",
      partner: "Acceso Partners",
      menu: "Abrir menú",
      quantum: "Cuántica",
      semi: "Semiconductores",
      extreme: "Defensa y Espacio",
      medical: "Médico",
      lang: "ES",
    },

    hero: {
      tagline:
        "Arquitectura de la capa invisible de la innovación.<br/>Soberanía europea en materiales avanzados.",
      scroll: "Desplázate para explorar",
    },

    cards: {
      quantum: {
        title: "Sensado<br><b>Cuántico.</b>",
        text:
          "Ingeniería de defectos a escala atómica. Diamante CVD con centros Nitrógeno-Vacante (NV) que exhiben coherencia cuántica a temperatura ambiente.",
        spec: {
          coherence: "Coherencia",
          defects: "Defectos",
          growth: "Crecimiento",
          process: "Proceso",
        },
      },

      semi: {
        title: "Potencia de<br><b>Banda Ancha.</b>",
        text:
          "Sustratos de Carburo de Silicio (SiC) y zafiro EPI-Ready. Superficies atómicamente planas (< 0.2 nm) para la próxima generación de electrónica de potencia.",
        spec: {
          material: "Material",
          purity: "Pureza",
          roughness: "Rugosidad",
          focus: "Anillo de foco",
        },
      },

      extreme: {
        title: "Entornos<br><b>Extremos.</b>",
        text:
          "Cerámicas técnicas sinterizadas (SPS). Alúmina y B4C diseñados para soportar abrasión extrema, impacto balístico y reentrada atmosférica.",
        spec: {
          temp: "Temp",
          thermal: "Térmica",
          cert: "Cert",
          density: "Densidad",
        },
      },

      medical: {
        title: "Servicios<br><b>Médicos.</b>",
        text:
          "Consultas, diagnóstico y seguimiento clínico con equipos avanzados y un enfoque centrado en el paciente.",
        spec: {
          wait: "Espera",
          results: "Resultados",
          specialties: "Especialidades",
          support: "Soporte",
        },
      },
    },
  },
});
