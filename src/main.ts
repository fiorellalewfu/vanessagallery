type ChatbotAction = "intro" | "lumiere" | "couleur" | "contexte" | "similaire" | "droits";
type PeriodeFilter = "toutes" | "1940s" | "1950s" | "1960s" | "1970s-80s" | (string & {});

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
  switch (periode) {
    case "toutes":
      return "Toutes";
    case "1940s":
      return "Années 1940";
    case "1950s":
      return "Années 1950";
    case "1960s":
      return "Années 1960";
    case "1970s-80s":
      return "Années 1970–80";
    default:
      return periode;
  }
};

const periodeNarration = (periode: string): { title: string; text: string } => {
  switch (periode) {
    case "toutes":
      return {
        title: "Toutes les périodes",
        text:
          "Parcours global : des débuts abstraits (années 1940) au geste automatiste (années 1950), puis aux recherches et structures (années 1960) et à la maturité (années 1970–80)."
      };
    case "1940s":
      return {
        title: "Années 1940 — Débuts",
        text:
          "Climat de modernité naissante : l’abstraction s’installe, le geste se libère, et le Québec se prépare à la rupture (Refus global, 1948)."
      };
    case "1950s":
      return {
        title: "Années 1950 — Automatistes / geste",
        text:
          "Le mouvement et l’énergie priment : contrastes, tension, spontanéité. Le tableau devient trace, rythme et collision de masses."
      };
    case "1960s":
      return {
        title: "Années 1960 — Paris & transition",
        text:
          "Période de recherches : papiers, encres, gouaches, formats. La composition se structure et prépare une pensée plus « vitrail » (segmentation, lignes, lumière)."
      };
    case "1970s-80s":
      return {
        title: "Années 1970–80 — Maturité",
        text:
          "La couleur s’affirme et le langage plastique se stabilise. L’œuvre dialogue davantage avec le support, la matière et (souvent) l’architecture."
      };
    default:
      return { title: `Période : ${periode}`, text: "Sélectionne une œuvre pour explorer le contexte et l’analyse." };
  }
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
  statusBadge.textContent = "Sélectionne un fragment";
  artTitle.textContent = "…";
  artMeta.textContent = "Clique sur une œuvre pour commencer.";
  artMedia.setAttribute("hidden", "true");
  artMedia.style.backgroundImage = "";
  sectionDesc.setAttribute("hidden", "true");
  artDesc.textContent = "";
  sectionLinks.setAttribute("hidden", "true");
  sectionThumb.setAttribute("hidden", "true");
  sourceBtn.href = "#";
  botText.textContent = "Le commentaire apparaîtra ici.";
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
    parts.push(`Matériaux : ${oeuvre.materiaux.join(", ")}`);
  }
  if (oeuvre.lieu) {
    parts.push(`Lieu : ${oeuvre.lieu}`);
  }
  if (oeuvre.mots_cles?.length) {
    parts.push(`Mots-clés : ${oeuvre.mots_cles.join(" • ")}`);
  }
  if (oeuvre.source_url) {
    parts.push("Astuce : utilise « Voir la fiche du musée » pour l'image officielle et les détails.");
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
  switch (periode) {
    case "1940s":
      return "Contexte : débuts et climat automatiste (années 1940). L’abstraction se met en place, le geste s’émancipe, la modernité s’affirme au Québec (Refus global en 1948).";
    case "1950s":
      return "Contexte : Automatistes / abstraction gestuelle. Le geste, l’énergie et le contraste priment sur la représentation.";
    case "1960s":
      return "Contexte : années 1960 (Paris et recherches). Formats, matières, papiers, et une pensée plus structurée : segmentation, plans, contrastes.";
    case "1970s-80s":
      return "Contexte : maturité (années 1970–80). Le style se stabilise, la couleur s’affirme, et l’œuvre dialogue avec les supports et les lieux.";
    default:
      return "Contexte : parcours global (Automatistes → vitrail → art public).";
  }
};

const buildChatbotResponse = (
  action: ChatbotAction,
  oeuvre: Oeuvre,
  all: Oeuvre[]
): ChatbotResponse => {
  const titre = oeuvre.titre ?? "Œuvre";
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
    sourceLine = `Source : ${source} — ${sourceUrl}`;
  } else if (sourceUrl) {
    sourceLine = `Source : ${sourceUrl}`;
  } else if (source) {
    sourceLine = `Source : ${source}`;
  }

  let text = "";
  switch (action) {
    case "intro": {
      const introParts: string[] = [];
      if (typeof resume === "string" && resume.trim() !== "") {
        introParts.push(resume.trim());
      }
      if (materiauxStr) {
        introParts.push(`Matériaux : ${materiauxStr}`);
      }
      if (typeof lieu === "string" && lieu.trim() !== "") {
        introParts.push(`Lieu : ${lieu.trim()}`);
      }
      if (sourceLine) {
        introParts.push(sourceLine);
      }
      introParts.push(ctxLocal);
      introParts.push(
        "Angles possibles :\n" +
          "• structure (lignes sombres / ‘plomb’)\n" +
          "• lumière (zones qui ‘s’allument’)\n" +
          "• tension chaud/froid (couleurs)"
      );
      if (motsClesStr) {
        introParts.push(`Mots-clés : ${motsClesStr}`);
      } else if (tagsStr) {
        introParts.push(`Tags : ${tagsStr}`);
      }
      text = `${introParts.join("\n\n")}\n`;
      break;
    }
    case "lumiere":
      text =
        `Analyse lumière — ${titre}\n\n` +
        "1) Repère les zones les plus claires : ce sont les ‘sources’ visuelles.\n" +
        "2) Observe comment les lignes sombres retiennent la lumière (effet vitrail).\n" +
        "3) Imagine l’œuvre rétroéclairée : quelles zones deviendraient dominantes ?\n\n" +
        ctx;
      break;
    case "couleur":
      text =
        `Analyse couleur — ${titre}\n\n` +
        "• Palette et hiérarchie : quelle couleur domine, laquelle déclenche l’impact ?\n" +
        "• Chaud/froid : le chaud avance, le froid recule… mais Ferron adore brouiller cette règle.\n" +
        "• Saturation : plus c’est saturé, plus ça ‘vibre’ (surtout en logique vitrail).\n\n" +
        `Tags : ${tagsStr}`;
      break;
    case "contexte":
      text =
        `Contexte — ${titre}\n\n` +
        `${ctxLocal}\n\n` +
        "Indice ‘Ferron’ : les lignes sombres ne sont pas juste des contours.\n" +
        "Elles servent d’ossature, comme le plomb d’un vitrail : elles font tenir la lumière.";
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
        if (samePeriode) why.push("même période (+2)");

        let common = 0;
        baseTags.forEach((tag) => {
          if (candTags.includes(tag)) common += 1;
        });
        score += common;
        if (common > 0) why.push(`tags communs (+${common})`);

        if (baseType && candType && baseType === candType) {
          score += 1;
          why.push("même type (+1)");
        }

        const dist = rgbDistance(basePalette, candPalette);
        if (dist !== null && dist <= 140) {
          score += 1;
          why.push("palette proche (+1)");
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
            ? `Pourquoi : ${bestWhy.join(", ")}.\n\n`
            : "Pourquoi : proximité de période / style.\n\n";
        text =
          `Œuvre ‘similaire’ suggérée : ${bestItem.titre ?? "…"} (${bestItem.annee ?? ""})\n\n` +
          whyLine +
          "Tu peux cliquer une autre œuvre dans le vitrail, ou filtrer une période pour comparer.\n\n" +
          "Astuce : plus tu mets de tags précis dans data/oeuvres.json, plus ce matching devient intelligent.";
      } else {
        text = "Je n’ai pas trouvé de comparaison solide. Ajoute plus d’œuvres et de tags dans data/oeuvres.json.";
      }
      break;
    }
    case "droits":
      text =
        `Droits & réutilisation — ${titre}\n\n` +
        "• Domaine public (Canada) : Marcelle Ferron est décédée en 2001, ses œuvres n’entrent donc pas dans le domaine public avant le 1er janvier 2072.\n" +
        "• Règle d’or : “trouvé sur Google” ≠ libre. Une image est réutilisable seulement si sa licence le permet.\n" +
        "• Photos sous licence libre : privilégie Wikimedia Commons (CC BY / CC BY-SA, etc.) et copie l’attribution demandée.\n\n" +
        (sourceLine ? `${sourceLine}\n\n` : "") +
        "Exemple d’attribution (CC BY) :\n" +
        "Photo : NOM, “TITRE”, CC BY X.Y, via Wikimedia Commons. (Modifications : recadrage.)\n\n" +
        "Exemple d’attribution (CC BY-SA) :\n" +
        "Photo : NOM, “TITRE”, CC BY-SA X.Y, via Wikimedia Commons. (Modifications : recadrage.)\n" +
        "Note : CC BY-SA impose de repartager toute adaptation sous la même licence.";
      break;
    default:
      text = "Action inconnue.";
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

  legendPeriod.textContent = `Période : ${periodeLabel(periodeActive)}`;
  legendCount.textContent = `Œuvres : ${filtered.length}`;

  const totalPages = Math.max(1, Math.ceil(filtered.length / 9));
  pageIndex = Math.min(pageIndex, totalPages - 1);

  const start = pageIndex * 9;
  const visible = filtered.slice(start, start + 9);
  mosaicPieces.innerHTML = "";

  prevPage.disabled = pageIndex <= 0;
  nextPage.disabled = pageIndex >= totalPages - 1;
  pageInfo.textContent = `Page ${totalPages === 0 ? 0 : pageIndex + 1} / ${totalPages}`;

  visible.forEach((oeuvre, index) => {
    const slotName = SLOTS[index];
    const fragment = document.createElement("div");
    fragment.className = `piece ${slotName}`;
    fragment.tabIndex = 0;
    fragment.role = "button";
    fragment.dataset.id = oeuvre.id;
    fragment.dataset.titre = oeuvre.titre;
    fragment.dataset.meta = `${oeuvre.annee} · ${oeuvre.periode} · ${oeuvre.type}`;
    fragment.setAttribute("aria-label", `${oeuvre.titre} (${oeuvre.annee}) — ${oeuvre.type}`);
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
  if (!selectedId) {
    statusBadge.textContent = "Choisis d’abord un fragment";
    botText.textContent = "Clique sur une œuvre dans le vitrail, puis je lance l’analyse.";
    return;
  }

  const oeuvre = oeuvres.find((o) => o.id === selectedId);
  if (!oeuvre) {
    statusBadge.textContent = "Sélectionne un fragment";
    botText.textContent = "Clique sur une œuvre dans le vitrail pour que je puisse la commenter.";
    return;
  }

  const data = buildChatbotResponse(action, oeuvre, oeuvres);
  if (!data.ok) {
    statusBadge.textContent = "Erreur";
    botText.textContent = data.text ?? "Erreur.";
    return;
  }

  statusBadge.textContent = `Sélection : ${data.title}`;
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

    if (!selectedId) {
      statusBadge.textContent = "Choisis d’abord un fragment";
      botText.textContent = "Clique sur une œuvre dans le vitrail, puis je lance l’analyse.";
      return;
    }

    await callChatbot(action);
  });
});

void (async function init(): Promise<void> {
  await loadOeuvres();
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
