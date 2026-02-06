type ChatbotAction = "intro" | "lumiere" | "couleur" | "contexte" | "similaire" | "droits";
type PeriodeFilter = "toutes" | "1940s" | "1950s" | "1960s" | "1970s-80s" | (string & {});
type HeaderLang = "fr" | "en";

interface Oeuvre {
  id: string;
  artiste?: string;
  titre: string;
  annee: number | string;
  periode: string;
  type: string;
  tags?: string[];
  mots_cles?: string[];
  palette?: string[];
  image?: string;
  resume?: string;
  contexte?: string;
  materiaux?: string[];
  lieu?: string;
  source?: string;
  source_url?: string;
}

interface ChatbotResponse {
  ok: boolean;
  title: string;
  meta?: string;
  tags?: string[];
  text?: string;
  periode?: string;
}

const qs = <T extends Element>(selector: string): T => {
  const el = document.querySelector<T>(selector);
  if (!el) {
    throw new Error(`Élément introuvable pour le sélecteur ${selector}`);
  }
  return el;
};

const qsa = <T extends Element>(selector: string): T[] => {
  return Array.from(document.querySelectorAll<T>(selector));
};

type I18nValue = string | ((vars: Record<string, string | number>) => string);

const i18n: Record<
  HeaderLang,
  {
    strings: Record<string, I18nValue>;
    periodeLabels: Record<string, string>;
    periodeNarration: Record<string, { title: string; text: string }>;
    contextePeriode: Record<string, string>;
  }
> = {
  fr: {
    strings: {
      siteTitle: "Mur de lumière",
      langGroup: "Langue",
      headerPlace: "Centre des sciences de Montréal",
      headerEvent: "Journée des femmes en science",
      headerBack: "Retourner à l’accueil",
      heroTitle: "Mur de lumière",
      heroSubtitle:
        "Clique une période, puis un fragment. Le guide commente l’œuvre avec le contexte (Automatistes → vitrail → art public).",
      timelineAria: "Ligne de temps",
      timelineAll: "Toutes",
      timeline1940s: "1940s · Débuts",
      timeline1950s: "1950s · Automatistes",
      timeline1960s: "1960s · Paris & transition",
      timeline1970s: "1970–80s · Maturité",
      periodCardAria: "Contexte de la période",
      vitrailAria: "Galerie vitrail",
      mosaicEyebrow: "galerie immersive",
      mosaicTitle: "Choisis un fragment pour explorer l'œuvre lumineuse de Marcelle Ferron",
      mosaicCopy:
        "Chaque morceau de lumière est une porte vers une œuvre : clique et laisse le guide raconter les gestes, la couleur et le contexte Automatistes → vitrail → art public.",
      mosaicHint: "Survole un fragment, puis clique pour révéler l’histoire.",
      legendPeriodPrefix: "Période",
      legendCountPrefix: "Œuvres",
      pagerAria: "Pagination des œuvres",
      pagerPrev: "◀ Précédent",
      pagerNext: "Suivant ▶",
      pageInfo: ({ current, total }) => `Page ${current} / ${total}`,
      panelAria: "Panneau guide",
      statusDefault: "Sélectionne un fragment",
      guideLabel: "Guide Ferron",
      artMetaDefault: "Clique sur une œuvre pour commencer.",
      sectionDescription: "Description",
      sourceBtn: "Voir la fiche du musée",
      thumbAria: "Vignette vitrail",
      botDefault: "Le commentaire apparaîtra ici.",
      periodFallback: "Sélectionne une œuvre pour explorer le contexte et l’analyse.",
      actionIntro: "Intro",
      actionLumiere: "Lumière",
      actionCouleur: "Couleur",
      actionContexte: "Contexte",
      actionSimilaire: "Œuvre similaire",
      actionDroits: "Droits",
      noteHtml:
        "<strong>Note :</strong> ce prototype n’utilise pas d’IA externe. Le JavaScript génère des réponses guidées. " +
        "Plus tard, tu pourras brancher une API IA (ou un endpoint) sur la même interface." +
        "<br /><br />" +
        "<strong>Droits :</strong> les œuvres de Marcelle Ferron ne sont pas dans le domaine public (Canada) avant le 1er janvier 2072. " +
        "Ici, on affiche des vignettes générées (dégradés) et on renvoie vers les fiches officielles via le bouton « Voir la fiche du musée »." +
        "<br />" +
        "<strong>Fond d’ambiance :</strong> fichier `images/hero.jpg` (à remplacer par une illustration libre de ton choix).",
      statusSelectFirst: "Choisis d’abord un fragment",
      botSelectFirst: "Clique sur une œuvre dans le vitrail, puis je lance l’analyse.",
      botNeedSelection: "Clique sur une œuvre dans le vitrail pour que je puisse la commenter.",
      statusError: "Erreur",
      defaultTitle: "Œuvre",
      selectionLabel: ({ title }) => `Sélection : ${title}`,
      pieceAria: ({ title, year, type }) => `${title} (${year}) — ${type}`,
      materialsLabel: "Matériaux",
      placeLabel: "Lieu",
      keywordsLabel: "Mots-clés",
      tagsLabel: "Tags",
      tipLabel: "Astuce",
      tipSource: "Astuce : utilise « Voir la fiche du musée » pour l'image officielle et les détails.",
      sourceLabel: "Source",
      introAngles:
        "Angles possibles :\n" +
        "• structure (lignes sombres / ‘plomb’)\n" +
        "• lumière (zones qui ‘s’allument’)\n" +
        "• tension chaud/froid (couleurs)",
      analysisLumiereTitle: ({ title }) => `Analyse lumière — ${title}`,
      analysisLumiereBody:
        "1) Repère les zones les plus claires : ce sont les ‘sources’ visuelles.\n" +
        "2) Observe comment les lignes sombres retiennent la lumière (effet vitrail).\n" +
        "3) Imagine l’œuvre rétroéclairée : quelles zones deviendraient dominantes ?\n\n",
      analysisCouleurTitle: ({ title }) => `Analyse couleur — ${title}`,
      analysisCouleurBody:
        "• Palette et hiérarchie : quelle couleur domine, laquelle déclenche l’impact ?\n" +
        "• Chaud/froid : le chaud avance, le froid recule… mais Ferron adore brouiller cette règle.\n" +
        "• Saturation : plus c’est saturé, plus ça ‘vibre’ (surtout en logique vitrail).\n\n",
      contexteTitle: ({ title }) => `Contexte — ${title}`,
      contexteHint:
        "Indice ‘Ferron’ : les lignes sombres ne sont pas juste des contours.\n" +
        "Elles servent d’ossature, comme le plomb d’un vitrail : elles font tenir la lumière.",
      similaireTitle: ({ title, year }) => `Œuvre ‘similaire’ suggérée : ${title} (${year})`,
      similaireWhyDefault: "Pourquoi : proximité de période / style.",
      similaireNext:
        "Tu peux cliquer une autre œuvre dans le vitrail, ou filtrer une période pour comparer.",
      similaireTip:
        "Astuce : plus tu mets de tags précis dans data/oeuvres.json, plus ce matching devient intelligent.",
      similaireNone:
        "Je n’ai pas trouvé de comparaison solide. Ajoute plus d’œuvres et de tags dans data/oeuvres.json.",
      droitsTitle: ({ title }) => `Droits & réutilisation — ${title}`,
      droitsBody:
        "• Domaine public (Canada) : Marcelle Ferron est décédée en 2001, ses œuvres n’entrent donc pas dans le domaine public avant le 1er janvier 2072.\n" +
        "• Règle d’or : “trouvé sur Google” ≠ libre. Une image est réutilisable seulement si sa licence le permet.\n" +
        "• Photos sous licence libre : privilégie Wikimedia Commons (CC BY / CC BY-SA, etc.) et copie l’attribution demandée.\n\n",
      droitsExampleCcBy:
        "Exemple d’attribution (CC BY) :\n" +
        "Photo : NOM, “TITRE”, CC BY X.Y, via Wikimedia Commons. (Modifications : recadrage.)\n\n",
      droitsExampleCcBySa:
        "Exemple d’attribution (CC BY-SA) :\n" +
        "Photo : NOM, “TITRE”, CC BY-SA X.Y, via Wikimedia Commons. (Modifications : recadrage.)\n",
      droitsNote: "Note : CC BY-SA impose de repartager toute adaptation sous la même licence.",
      unknownAction: "Action inconnue."
    },
    periodeLabels: {
      toutes: "Toutes",
      "1940s": "Années 1940",
      "1950s": "Années 1950",
      "1960s": "Années 1960",
      "1970s-80s": "Années 1970–80"
    },
    periodeNarration: {
      toutes: {
        title: "Toutes les périodes",
        text:
          "Parcours global : des débuts abstraits (années 1940) au geste automatiste (années 1950), puis aux recherches et structures (années 1960) et à la maturité (années 1970–80)."
      },
      "1940s": {
        title: "Années 1940 — Débuts",
        text:
          "Climat de modernité naissante : l’abstraction s’installe, le geste se libère, et le Québec se prépare à la rupture (Refus global, 1948)."
      },
      "1950s": {
        title: "Années 1950 — Automatistes / geste",
        text:
          "Le mouvement et l’énergie priment : contrastes, tension, spontanéité. Le tableau devient trace, rythme et collision de masses."
      },
      "1960s": {
        title: "Années 1960 — Paris & transition",
        text:
          "Période de recherches : papiers, encres, gouaches, formats. La composition se structure et prépare une pensée plus « vitrail » (segmentation, lignes, lumière)."
      },
      "1970s-80s": {
        title: "Années 1970–80 — Maturité",
        text:
          "La couleur s’affirme et le langage plastique se stabilise. L’œuvre dialogue davantage avec le support, la matière et (souvent) l’architecture."
      }
    },
    contextePeriode: {
      "1940s":
        "Contexte : débuts et climat automatiste (années 1940). L’abstraction se met en place, le geste s’émancipe, la modernité s’affirme au Québec (Refus global en 1948).",
      "1950s":
        "Contexte : Automatistes / abstraction gestuelle. Le geste, l’énergie et le contraste priment sur la représentation.",
      "1960s":
        "Contexte : années 1960 (Paris et recherches). Formats, matières, papiers, et une pensée plus structurée : segmentation, plans, contrastes.",
      "1970s-80s":
        "Contexte : maturité (années 1970–80). Le style se stabilise, la couleur s’affirme, et l’œuvre dialogue avec les supports et les lieux.",
      default: "Contexte : parcours global (Automatistes → vitrail → art public)."
    }
  },
  en: {
    strings: {
      siteTitle: "Wall of Light",
      langGroup: "Language",
      headerPlace: "Montréal Science Centre",
      headerEvent: "Women in Science Day",
      headerBack: "Back to home",
      heroTitle: "Wall of Light",
      heroSubtitle:
        "Click a period, then a fragment. The guide comments on the work with context (Automatists → stained glass → public art).",
      timelineAria: "Timeline",
      timelineAll: "All",
      timeline1940s: "1940s · Early years",
      timeline1950s: "1950s · Automatists",
      timeline1960s: "1960s · Paris & transition",
      timeline1970s: "1970–80s · Maturity",
      periodCardAria: "Period context",
      vitrailAria: "Stained glass gallery",
      mosaicEyebrow: "immersive gallery",
      mosaicTitle: "Choose a fragment to explore Marcelle Ferron's luminous work",
      mosaicCopy:
        "Each piece of light is a door to a work: click and let the guide describe the gestures, color, and context (Automatists → stained glass → public art).",
      mosaicHint: "Hover a fragment, then click to reveal the story.",
      legendPeriodPrefix: "Period",
      legendCountPrefix: "Works",
      pagerAria: "Works pagination",
      pagerPrev: "◀ Previous",
      pagerNext: "Next ▶",
      pageInfo: ({ current, total }) => `Page ${current} / ${total}`,
      panelAria: "Guide panel",
      statusDefault: "Select a fragment",
      guideLabel: "Ferron Guide",
      artMetaDefault: "Click a work to begin.",
      sectionDescription: "Description",
      sourceBtn: "View museum record",
      thumbAria: "Stained glass thumbnail",
      botDefault: "The commentary will appear here.",
      periodFallback: "Select a work to explore context and analysis.",
      actionIntro: "Intro",
      actionLumiere: "Light",
      actionCouleur: "Color",
      actionContexte: "Context",
      actionSimilaire: "Similar work",
      actionDroits: "Rights",
      noteHtml:
        "<strong>Note:</strong> this prototype does not use external AI. JavaScript generates guided responses. " +
        "Later, you can connect an AI API (or an endpoint) on the same interface." +
        "<br /><br />" +
        "<strong>Rights:</strong> Marcelle Ferron’s works are not in the public domain (Canada) before January 1, 2072. " +
        "Here we show generated thumbnails (gradients) and link to the official records via the “View museum record” button." +
        "<br />" +
        "<strong>Backdrop:</strong> file `images/hero.jpg` (replace with a free illustration of your choice).",
      statusSelectFirst: "Choose a fragment first",
      botSelectFirst: "Click a work in the stained glass, then I’ll start the analysis.",
      botNeedSelection: "Click a work in the stained glass so I can comment on it.",
      statusError: "Error",
      defaultTitle: "Artwork",
      selectionLabel: ({ title }) => `Selection: ${title}`,
      pieceAria: ({ title, year, type }) => `${title} (${year}) — ${type}`,
      materialsLabel: "Materials",
      placeLabel: "Location",
      keywordsLabel: "Keywords",
      tagsLabel: "Tags",
      tipLabel: "Tip",
      tipSource: "Tip: use “View museum record” for the official image and details.",
      sourceLabel: "Source",
      introAngles:
        "Possible angles:\n" +
        "• structure (dark lines / ‘lead’)\n" +
        "• light (areas that ‘light up’)\n" +
        "• warm/cool tension (colors)",
      analysisLumiereTitle: ({ title }) => `Light analysis — ${title}`,
      analysisLumiereBody:
        "1) Identify the lightest areas: these are the visual ‘sources’.\n" +
        "2) Observe how the dark lines hold the light (stained-glass effect).\n" +
        "3) Imagine the work backlit: which areas would dominate?\n\n",
      analysisCouleurTitle: ({ title }) => `Color analysis — ${title}`,
      analysisCouleurBody:
        "• Palette and hierarchy: which color dominates, which triggers the impact?\n" +
        "• Warm/cool: warm advances, cool recedes… but Ferron loves to blur this rule.\n" +
        "• Saturation: the more saturated, the more it ‘vibrates’ (especially in stained-glass logic).\n\n",
      contexteTitle: ({ title }) => `Context — ${title}`,
      contexteHint:
        "Ferron clue: the dark lines are not just outlines.\n" +
        "They act as a skeleton, like the lead in stained glass: they hold the light together.",
      similaireTitle: ({ title, year }) => `Suggested similar work: ${title} (${year})`,
      similaireWhyDefault: "Why: proximity of period / style.",
      similaireNext:
        "You can click another work in the stained glass, or filter a period to compare.",
      similaireTip:
        "Tip: the more precise tags you add in data/oeuvres.json, the smarter this matching becomes.",
      similaireNone:
        "I didn’t find a solid comparison. Add more works and tags in data/oeuvres.json.",
      droitsTitle: ({ title }) => `Rights & reuse — ${title}`,
      droitsBody:
        "• Public domain (Canada): Marcelle Ferron died in 2001, so her works do not enter the public domain before January 1, 2072.\n" +
        "• Golden rule: “found on Google” ≠ free. An image is reusable only if its license allows it.\n" +
        "• Free-licensed photos: prefer Wikimedia Commons (CC BY / CC BY-SA, etc.) and copy the required attribution.\n\n",
      droitsExampleCcBy:
        "Attribution example (CC BY):\n" +
        "Photo: NAME, “TITLE”, CC BY X.Y, via Wikimedia Commons. (Modifications: crop.)\n\n",
      droitsExampleCcBySa:
        "Attribution example (CC BY-SA):\n" +
        "Photo: NAME, “TITLE”, CC BY-SA X.Y, via Wikimedia Commons. (Modifications: crop.)\n",
      droitsNote: "Note: CC BY-SA requires sharing any adaptation under the same license.",
      unknownAction: "Unknown action."
    },
    periodeLabels: {
      toutes: "All",
      "1940s": "1940s",
      "1950s": "1950s",
      "1960s": "1960s",
      "1970s-80s": "1970–80s"
    },
    periodeNarration: {
      toutes: {
        title: "All periods",
        text:
          "Overall path: from early abstraction (1940s) to Automatist gesture (1950s), then research and structures (1960s), and maturity (1970–80s)."
      },
      "1940s": {
        title: "1940s — Early years",
        text:
          "Rising modernity: abstraction takes root, the gesture frees itself, and Quebec prepares for a rupture (Refus global, 1948)."
      },
      "1950s": {
        title: "1950s — Automatists / gesture",
        text:
          "Movement and energy dominate: contrasts, tension, spontaneity. The painting becomes trace, rhythm, and collision of masses."
      },
      "1960s": {
        title: "1960s — Paris & transition",
        text:
          "A period of research: papers, inks, gouaches, formats. Composition becomes structured and prepares a more “stained-glass” thinking (segmentation, lines, light)."
      },
      "1970s-80s": {
        title: "1970–80s — Maturity",
        text:
          "Color asserts itself and the visual language stabilizes. The work dialogues more with support, matter, and (often) architecture."
      }
    },
    contextePeriode: {
      "1940s":
        "Context: early years and Automatist climate (1940s). Abstraction takes shape, the gesture emancipates, and modernity asserts itself in Quebec (Refus global in 1948).",
      "1950s":
        "Context: Automatists / gestural abstraction. Gesture, energy, and contrast prevail over representation.",
      "1960s":
        "Context: 1960s (Paris and research). Formats, materials, papers, and a more structured thinking: segmentation, planes, contrasts.",
      "1970s-80s":
        "Context: maturity (1970–80s). Style stabilizes, color asserts itself, and the work dialogues with supports and sites.",
      default: "Context: overall path (Automatists → stained glass → public art)."
    }
  }
};

const i18nValue = (key: string, vars: Record<string, string | number> = {}): string => {
  const raw = i18n[currentLang].strings[key];
  if (typeof raw === "function") return raw(vars);
  return raw ?? "";
};

const applyI18nStatic = (): void => {
  document.title = i18nValue("siteTitle");
  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (!key) return;
    el.textContent = i18nValue(key);
  });
  document.querySelectorAll<HTMLElement>("[data-i18n-html]").forEach((el) => {
    const key = el.dataset.i18nHtml;
    if (!key) return;
    el.innerHTML = i18nValue(key);
  });
  document.querySelectorAll<HTMLElement>("[data-i18n-attr]").forEach((el) => {
    const raw = el.dataset.i18nAttr;
    if (!raw) return;
    raw.split(";").forEach((pair) => {
      const [attr, key] = pair.split(":").map((part) => part.trim());
      if (!attr || !key) return;
      el.setAttribute(attr, i18nValue(key));
    });
  });
};

const headerRoot = document.querySelector<HTMLElement>(".marcelle-header");
const headerPlace = document.querySelector<HTMLElement>("#mhPlace");
const headerEvent = document.querySelector<HTMLElement>("#mhEvent");
const headerBack = document.querySelector<HTMLAnchorElement>(".mh-back");
const headerLangButtons = qsa<HTMLButtonElement>(".mh-lang-btn");

const mosaicPieces = qs<HTMLDivElement>("#mosaicPieces");
const mosaic = qs<HTMLElement>("#mosaic");
const statusBadge = qs<HTMLElement>("#status");
const artTitle = qs<HTMLElement>("#artTitle");
const artMeta = qs<HTMLElement>("#artMeta");
const sectionDesc = qs<HTMLElement>("#sectionDesc");
const artDesc = qs<HTMLElement>("#artDesc");
const sectionLinks = qs<HTMLElement>("#sectionLinks");
const sectionThumb = qs<HTMLElement>("#sectionThumb");
const artLinks = qs<HTMLElement>("#artLinks");
const sourceBtn = qs<HTMLAnchorElement>("#sourceBtn");
const artMedia = qs<HTMLElement>("#artMedia");
const botText = qs<HTMLElement>("#botText");
const legendPeriod = qs<HTMLElement>("#legendPeriod");
const legendCount = qs<HTMLElement>("#legendCount");
const periodTitle = qs<HTMLElement>("#periodTitle");
const periodText = qs<HTMLElement>("#periodText");
const prevPage = qs<HTMLButtonElement>("#prevPage");
const nextPage = qs<HTMLButtonElement>("#nextPage");
const pageInfo = qs<HTMLElement>("#pageInfo");

let currentLang: HeaderLang = "fr";
let lastAction: ChatbotAction = "intro";

const setHeaderLang = (lang: HeaderLang): void => {
  currentLang = lang;
  if (headerPlace) headerPlace.textContent = i18nValue("headerPlace");
  if (headerEvent) headerEvent.textContent = i18nValue("headerEvent");
  if (headerBack) {
    const backLabel = i18nValue("headerBack");
    headerBack.setAttribute("aria-label", backLabel);
    headerBack.setAttribute("title", backLabel);
  }
  headerLangButtons.forEach((btn) => {
    const isActive = btn.dataset.lang === lang;
    btn.classList.toggle("is-active", isActive);
    btn.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
  document.documentElement.lang = lang;
  applyI18nStatic();
  updatePeriodCard();
  renderMosaic();
  updateSelectedDescription(selectedId);
  updateSelectedLinks(selectedId);
  updateSelectedMedia(selectedId);
  if (selectedId) {
    void callChatbot(lastAction);
  } else {
    statusBadge.textContent = i18nValue("statusDefault");
    artTitle.textContent = "…";
    artMeta.textContent = i18nValue("artMetaDefault");
    botText.textContent = i18nValue("botDefault");
  }
};

let oeuvres: Oeuvre[] = [];
let periodeActive: PeriodeFilter = "toutes";
let selectedId: string | null = null;
let pageIndex = 0;

const SLOTS = [
  "slot1",
  "slot2",
  "slot3",
  "slot4",
  "slot5",
  "slot6",
  "slot7",
  "slot8",
  "slot9"
] as const;

const gradientFromPalette = (palette?: string[]): string => {
  const [a = "#2a7bff", b = "#b04aff", c = "#ffcc4a"] = palette ?? [];
  return `linear-gradient(135deg, ${a}, ${b} 55%, ${c})`;
};

const setSelectedVisual = (id: string | null): void => {
  Array.from(mosaicPieces.querySelectorAll<HTMLDivElement>(".piece")).forEach((piece) => {
    const isSelected = piece.dataset.id === id;
    piece.setAttribute("aria-selected", isSelected ? "true" : "false");
  });
};

const loadOeuvres = async (): Promise<void> => {
  const response = await fetch("/data/oeuvres.json", { cache: "no-store" });
  const data = (await response.json()) as Oeuvre[];
  oeuvres = data;
};

const periodeLabel = (periode: string): string => {
  return i18n[currentLang].periodeLabels[periode] ?? periode;
};

const periodeNarration = (periode: string): { title: string; text: string } => {
  const data = i18n[currentLang].periodeNarration[periode];
  if (data) return data;
  return {
    title: `${i18nValue("legendPeriodPrefix")} : ${periode}`,
    text: i18nValue("periodFallback")
  };
};

const updatePeriodCard = (): void => {
  const card = periodeNarration(periodeActive);
  periodTitle.textContent = card.title;
  periodText.textContent = card.text;
};

const filterOeuvresByPeriode = (list: Oeuvre[], periode: string): Oeuvre[] => {
  if (periode === "toutes") {
    return list;
  }
  return list.filter((oeuvre) => oeuvre.periode === periode);
};

const resetSelectionState = (): void => {
  selectedId = null;
  document.body.classList.remove("has-selection");
  statusBadge.textContent = i18nValue("statusDefault");
  artTitle.textContent = "…";
  artMeta.textContent = i18nValue("artMetaDefault");
  artMedia.setAttribute("hidden", "true");
  artMedia.style.backgroundImage = "";
  sectionDesc.setAttribute("hidden", "true");
  artDesc.textContent = "";
  sectionLinks.setAttribute("hidden", "true");
  sectionThumb.setAttribute("hidden", "true");
  sourceBtn.href = "#";
  botText.textContent = i18nValue("botDefault");
};

const buildLocalDescription = (oeuvre: Oeuvre): string => {
  const parts: string[] = [];

  if (oeuvre.contexte && oeuvre.contexte.trim()) {
    parts.push(oeuvre.contexte.trim());
  } else {
    // Fallback: narration par période si pas de contexte spécifique.
    parts.push(periodeNarration(oeuvre.periode).text);
  }

  if (oeuvre.materiaux?.length) {
    parts.push(`${i18nValue("materialsLabel")} : ${oeuvre.materiaux.join(", ")}`);
  }
  if (oeuvre.lieu) {
    parts.push(`${i18nValue("placeLabel")} : ${oeuvre.lieu}`);
  }
  if (oeuvre.mots_cles?.length) {
    parts.push(`${i18nValue("keywordsLabel")} : ${oeuvre.mots_cles.join(" • ")}`);
  }
  if (oeuvre.source_url) {
    parts.push(i18nValue("tipSource"));
  }

  return parts.join("\n\n");
};

const updateSelectedDescription = (id: string | null): void => {
  if (!id) {
    sectionDesc.setAttribute("hidden", "true");
    artDesc.textContent = "";
    return;
  }

  const oeuvre = oeuvres.find((o) => o.id === id);
  if (!oeuvre) {
    sectionDesc.setAttribute("hidden", "true");
    artDesc.textContent = "";
    return;
  }

  artDesc.textContent = buildLocalDescription(oeuvre);
  sectionDesc.removeAttribute("hidden");
};

const updateSelectedLinks = (id: string | null): void => {
  if (!id) {
    sectionLinks.setAttribute("hidden", "true");
    sourceBtn.href = "#";
    return;
  }

  const oeuvre = oeuvres.find((o) => o.id === id);
  const url = oeuvre?.source_url;
  if (url) {
    sectionLinks.removeAttribute("hidden");
    sourceBtn.href = url;
  } else {
    sectionLinks.setAttribute("hidden", "true");
    sourceBtn.href = "#";
  }
};

const updateSelectedMedia = (id: string | null): void => {
  if (!id) {
    sectionThumb.setAttribute("hidden", "true");
    artMedia.style.backgroundImage = "";
    return;
  }

  const oeuvre = oeuvres.find((o) => o.id === id);
  if (!oeuvre) {
    sectionThumb.setAttribute("hidden", "true");
    artMedia.style.backgroundImage = "";
    return;
  }

  // Stratégie "safe": on affiche une vignette générée (dégradé), pas la photo de l'oeuvre.
  artMedia.style.backgroundImage = gradientFromPalette(oeuvre.palette);
  sectionThumb.removeAttribute("hidden");
};

const normalizeStrList = (val: unknown): string[] => {
  if (!Array.isArray(val)) return [];
  return val
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

const hexToRgb = (hex: string): [number, number, number] | null => {
  const cleaned = hex.trim().replace("#", "");
  if (cleaned.length !== 3 && cleaned.length !== 6) return null;
  const full = cleaned.length === 3
    ? cleaned
        .split("")
        .map((char) => `${char}${char}`)
        .join("")
    : cleaned;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return [r, g, b];
};

const paletteAvgRgb = (palette?: string[]): [number, number, number] | null => {
  if (!palette?.length) return null;
  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  let count = 0;
  palette.forEach((hex) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return;
    sumR += rgb[0];
    sumG += rgb[1];
    sumB += rgb[2];
    count += 1;
  });
  if (count === 0) return null;
  return [sumR / count, sumG / count, sumB / count];
};

const rgbDistance = (a: [number, number, number] | null, b: [number, number, number] | null): number | null => {
  if (!a || !b) return null;
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
};

const contextePeriode = (periode: string): string => {
  return i18n[currentLang].contextePeriode[periode] ?? i18n[currentLang].contextePeriode.default;
};

const buildChatbotResponse = (
  action: ChatbotAction,
  oeuvre: Oeuvre,
  all: Oeuvre[]
): ChatbotResponse => {
  const titre = oeuvre.titre ?? i18nValue("defaultTitle");
  const artiste = oeuvre.artiste ?? "Marcelle Ferron";
  const annee = oeuvre.annee ?? "";
  const periode = oeuvre.periode ?? "";
  const type = oeuvre.type ?? "";
  const tags = oeuvre.tags ?? [];
  const resume = oeuvre.resume ?? "";
  const contexte = oeuvre.contexte ?? "";
  const materiaux = oeuvre.materiaux ?? [];
  const lieu = oeuvre.lieu ?? "";
  const motsCles = oeuvre.mots_cles ?? [];
  const source = oeuvre.source ?? "";
  const sourceUrl = oeuvre.source_url ?? "";

  const metaParts: string[] = [];
  if (artiste) metaParts.push(artiste);
  if (annee !== "") metaParts.push(String(annee));
  if (periode) metaParts.push(periode);
  if (type) metaParts.push(type);
  if (source) metaParts.push(source);
  const meta = metaParts.join(" · ");

  const tagsStr = normalizeStrList(tags).join(" • ");
  const motsClesStr = normalizeStrList(motsCles).join(" • ");
  const materiauxStr = normalizeStrList(materiaux).join(", ");

  const ctx = contextePeriode(periode);
  const ctxLocal = typeof contexte === "string" && contexte.trim() !== "" ? contexte.trim() : ctx;

  let sourceLine = "";
  if (sourceUrl && source) {
    sourceLine = `${i18nValue("sourceLabel")} : ${source} — ${sourceUrl}`;
  } else if (sourceUrl) {
    sourceLine = `${i18nValue("sourceLabel")} : ${sourceUrl}`;
  } else if (source) {
    sourceLine = `${i18nValue("sourceLabel")} : ${source}`;
  }

  let text = "";
  switch (action) {
    case "intro": {
      const introParts: string[] = [];
      if (typeof resume === "string" && resume.trim() !== "") {
        introParts.push(resume.trim());
      }
      if (materiauxStr) {
        introParts.push(`${i18nValue("materialsLabel")} : ${materiauxStr}`);
      }
      if (typeof lieu === "string" && lieu.trim() !== "") {
        introParts.push(`${i18nValue("placeLabel")} : ${lieu.trim()}`);
      }
      if (sourceLine) {
        introParts.push(sourceLine);
      }
      introParts.push(ctxLocal);
      introParts.push(i18nValue("introAngles"));
      if (motsClesStr) {
        introParts.push(`${i18nValue("keywordsLabel")} : ${motsClesStr}`);
      } else if (tagsStr) {
        introParts.push(`${i18nValue("tagsLabel")} : ${tagsStr}`);
      }
      text = `${introParts.join("\n\n")}\n`;
      break;
    }
    case "lumiere":
      text =
        `${i18nValue("analysisLumiereTitle", { title: titre })}\n\n` +
        i18nValue("analysisLumiereBody") +
        ctx;
      break;
    case "couleur":
      text =
        `${i18nValue("analysisCouleurTitle", { title: titre })}\n\n` +
        i18nValue("analysisCouleurBody") +
        `${i18nValue("tagsLabel")} : ${tagsStr}`;
      break;
    case "contexte":
      text =
        `${i18nValue("contexteTitle", { title: titre })}\n\n` +
        `${ctxLocal}\n\n` +
        i18nValue("contexteHint");
      break;
    case "similaire": {
      let best: Oeuvre | null = null;
      let bestScore = -1;
      let bestWhy: string[] = [];
      let bestDist: number | null = null;

      const baseTags = normalizeStrList(tags);
      const basePalette = paletteAvgRgb(oeuvre.palette);
      const baseType = typeof type === "string" ? type.trim() : "";

      all.forEach((cand) => {
        if (cand.id === oeuvre.id) return;
        const candTags = normalizeStrList(cand.tags);
        const candType = typeof cand.type === "string" ? cand.type.trim() : "";
        const candPalette = paletteAvgRgb(cand.palette);

        const samePeriode = cand.periode === periode;
        let score = samePeriode ? 2 : 0;
        const why: string[] = [];
        if (samePeriode) why.push(currentLang === "fr" ? "même période (+2)" : "same period (+2)");

        let common = 0;
        baseTags.forEach((tag) => {
          if (candTags.includes(tag)) common += 1;
        });
        score += common;
        if (common > 0)
          why.push(currentLang === "fr" ? `tags communs (+${common})` : `shared tags (+${common})`);

        if (baseType && candType && baseType === candType) {
          score += 1;
          why.push(currentLang === "fr" ? "même type (+1)" : "same type (+1)");
        }

        const dist = rgbDistance(basePalette, candPalette);
        if (dist !== null && dist <= 140) {
          score += 1;
          why.push(currentLang === "fr" ? "palette proche (+1)" : "close palette (+1)");
        }

        let isBetter = false;
        if (score > bestScore) {
          isBetter = true;
        } else if (score === bestScore) {
          let bestCommon = 0;
          if (best?.tags) {
            const bestTags = normalizeStrList(best.tags);
            baseTags.forEach((tag) => {
              if (bestTags.includes(tag)) bestCommon += 1;
            });
          }
          if (common > bestCommon) {
            isBetter = true;
          } else if (dist !== null && bestDist !== null && dist < bestDist) {
            isBetter = true;
          } else if (dist !== null && bestDist === null) {
            isBetter = true;
          }
        }

        if (isBetter) {
          bestScore = score;
          best = cand;
          bestWhy = why;
          bestDist = dist;
        }
      });

      if (best) {
        const bestItem: Oeuvre = best;
        const whyLine =
          bestWhy.length > 0
            ? `${currentLang === "fr" ? "Pourquoi" : "Why"} : ${bestWhy.join(", ")}.\n\n`
            : `${i18nValue("similaireWhyDefault")}\n\n`;
        text =
          `${i18nValue("similaireTitle", {
            title: bestItem.titre ?? "…",
            year: bestItem.annee ?? ""
          })}\n\n` +
          whyLine +
          `${i18nValue("similaireNext")}\n\n` +
          i18nValue("similaireTip");
      } else {
        text = i18nValue("similaireNone");
      }
      break;
    }
    case "droits":
      text =
        `${i18nValue("droitsTitle", { title: titre })}\n\n` +
        i18nValue("droitsBody") +
        (sourceLine ? `${sourceLine}\n\n` : "") +
        i18nValue("droitsExampleCcBy") +
        i18nValue("droitsExampleCcBySa") +
        i18nValue("droitsNote");
      break;
    default:
      text = i18nValue("unknownAction");
  }

  return {
    ok: true,
    title: titre,
    meta,
    tags,
    text,
    periode
  };
};

const renderMosaic = (): void => {
  const filtered = filterOeuvresByPeriode(oeuvres, periodeActive);

  legendPeriod.textContent = `${i18nValue("legendPeriodPrefix")} : ${periodeLabel(periodeActive)}`;
  legendCount.textContent = `${i18nValue("legendCountPrefix")} : ${filtered.length}`;

  const totalPages = Math.max(1, Math.ceil(filtered.length / 9));
  pageIndex = Math.min(pageIndex, totalPages - 1);

  const start = pageIndex * 9;
  const visible = filtered.slice(start, start + 9);
  mosaicPieces.innerHTML = "";

  prevPage.disabled = pageIndex <= 0;
  nextPage.disabled = pageIndex >= totalPages - 1;
  pageInfo.textContent = i18nValue("pageInfo", {
    current: totalPages === 0 ? 0 : pageIndex + 1,
    total: totalPages
  });

  visible.forEach((oeuvre, index) => {
    const slotName = SLOTS[index];
    const fragment = document.createElement("div");
    fragment.className = `piece ${slotName}`;
    fragment.tabIndex = 0;
    fragment.role = "button";
    fragment.dataset.id = oeuvre.id;
    fragment.dataset.titre = oeuvre.titre;
    fragment.dataset.meta = `${oeuvre.annee} · ${oeuvre.periode} · ${oeuvre.type}`;
    fragment.setAttribute(
      "aria-label",
      i18nValue("pieceAria", {
        title: oeuvre.titre,
        year: oeuvre.annee,
        type: oeuvre.type
      })
    );
    const gradient = gradientFromPalette(oeuvre.palette);
    // Stratégie "safe": on n'utilise pas d'images d'oeuvres, uniquement des vignettes générées.
    fragment.style.backgroundImage = gradient;
    fragment.setAttribute("aria-selected", oeuvre.id === selectedId ? "true" : "false");

    fragment.addEventListener("click", () => void onSelect(oeuvre.id));
    fragment.addEventListener("keydown", (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        void onSelect(oeuvre.id);
      }
    });

    mosaicPieces.appendChild(fragment);
  });

  const stillVisible = visible.some((oeuvre) => oeuvre.id === selectedId);
  if (!stillVisible) {
    resetSelectionState();
  }
};

const callChatbot = async (action: ChatbotAction): Promise<void> => {
  lastAction = action;
  if (!selectedId) {
    statusBadge.textContent = i18nValue("statusSelectFirst");
    botText.textContent = i18nValue("botSelectFirst");
    return;
  }

  const oeuvre = oeuvres.find((o) => o.id === selectedId);
  if (!oeuvre) {
    statusBadge.textContent = i18nValue("statusDefault");
    botText.textContent = i18nValue("botNeedSelection");
    return;
  }

  const data = buildChatbotResponse(action, oeuvre, oeuvres);
  if (!data.ok) {
    statusBadge.textContent = i18nValue("statusError");
    botText.textContent = data.text ?? i18nValue("statusError");
    return;
  }

  statusBadge.textContent = i18nValue("selectionLabel", { title: data.title });
  artTitle.textContent = data.title;
  artMeta.textContent = data.meta ?? "";
  botText.textContent = data.text ?? "";
};

const onSelect = async (id: string): Promise<void> => {
  selectedId = id;
  document.body.classList.add("has-selection");
  setSelectedVisual(id);
  updateSelectedDescription(id);
  updateSelectedLinks(id);
  updateSelectedMedia(id);
  await callChatbot("intro");
};

const timelineStations = qsa<HTMLButtonElement>(".station");
timelineStations.forEach((station) => {
  station.addEventListener("click", () => {
    timelineStations.forEach((btn) => {
      btn.classList.remove("active");
      btn.setAttribute("aria-pressed", "false");
    });

    station.classList.add("active");
    station.setAttribute("aria-pressed", "true");

    const periode = station.dataset.periode as PeriodeFilter | undefined;
    periodeActive = periode ?? "toutes";
    pageIndex = 0;
    updatePeriodCard();
    renderMosaic();
  });
});

prevPage.addEventListener("click", () => {
  pageIndex = Math.max(0, pageIndex - 1);
  renderMosaic();
});
nextPage.addEventListener("click", () => {
  pageIndex = pageIndex + 1;
  renderMosaic();
});

const actionButtons = qsa<HTMLButtonElement>(".btn");
actionButtons.forEach((btn) => {
  btn.addEventListener("click", async () => {
    const action = btn.dataset.action as ChatbotAction | undefined;
    if (!action) return;
    lastAction = action;

    if (!selectedId) {
      statusBadge.textContent = i18nValue("statusSelectFirst");
      botText.textContent = i18nValue("botSelectFirst");
      return;
    }

    await callChatbot(action);
  });
});

if (headerRoot && headerLangButtons.length) {
  headerLangButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = (btn.dataset.lang || "fr") as HeaderLang;
      setHeaderLang(lang);
    });
  });
  setHeaderLang("fr");
}

void (async function init(): Promise<void> {
  await loadOeuvres();
  applyI18nStatic();
  updatePeriodCard();
  renderMosaic();

  // Spotlight souris (effet "lumière")
  let rafId = 0;
  let lastX = 50;
  let lastY = 50;

  const commit = (): void => {
    rafId = 0;
    mosaic.style.setProperty("--x", `${lastX}%`);
    mosaic.style.setProperty("--y", `${lastY}%`);
  };

  mosaic.addEventListener("mousemove", (e: MouseEvent) => {
    const r = mosaic.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    lastX = Math.min(100, Math.max(0, x));
    lastY = Math.min(100, Math.max(0, y));
    if (!rafId) rafId = requestAnimationFrame(commit);
  });

  mosaic.addEventListener("mouseleave", () => {
    lastX = 50;
    lastY = 50;
    if (!rafId) rafId = requestAnimationFrame(commit);
  });
})();
