"use strict";
const qs = (selector) => {
    const el = document.querySelector(selector);
    if (!el) {
        throw new Error(`Élément introuvable pour le sélecteur ${selector}`);
    }
    return el;
};
const qsa = (selector) => {
    return Array.from(document.querySelectorAll(selector));
};
const mosaicPieces = qs("#mosaicPieces");
const mosaic = qs("#mosaic");
const statusBadge = qs("#status");
const artTitle = qs("#artTitle");
const artMeta = qs("#artMeta");
const sectionDesc = qs("#sectionDesc");
const artDesc = qs("#artDesc");
const sectionLinks = qs("#sectionLinks");
const sectionThumb = qs("#sectionThumb");
const artLinks = qs("#artLinks");
const sourceBtn = qs("#sourceBtn");
const artMedia = qs("#artMedia");
const botText = qs("#botText");
const legendPeriod = qs("#legendPeriod");
const legendCount = qs("#legendCount");
const periodTitle = qs("#periodTitle");
const periodText = qs("#periodText");
const prevPage = qs("#prevPage");
const nextPage = qs("#nextPage");
const pageInfo = qs("#pageInfo");
let oeuvres = [];
let periodeActive = "toutes";
let selectedId = null;
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
];
const gradientFromPalette = (palette) => {
    const [a = "#2a7bff", b = "#b04aff", c = "#ffcc4a"] = palette ?? [];
    return `linear-gradient(135deg, ${a}, ${b} 55%, ${c})`;
};
const setSelectedVisual = (id) => {
    Array.from(mosaicPieces.querySelectorAll(".piece")).forEach((piece) => {
        const isSelected = piece.dataset.id === id;
        piece.setAttribute("aria-selected", isSelected ? "true" : "false");
    });
};
const loadOeuvres = async () => {
    const response = await fetch("data/oeuvres.json", { cache: "no-store" });
    const data = (await response.json());
    oeuvres = data;
};
const periodeLabel = (periode) => {
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
const periodeNarration = (periode) => {
    switch (periode) {
        case "toutes":
            return {
                title: "Toutes les périodes",
                text: "Parcours global : des débuts abstraits (années 1940) au geste automatiste (années 1950), puis aux recherches et structures (années 1960) et à la maturité (années 1970–80)."
            };
        case "1940s":
            return {
                title: "Années 1940 — Débuts",
                text: "Climat de modernité naissante : l’abstraction s’installe, le geste se libère, et le Québec se prépare à la rupture (Refus global, 1948)."
            };
        case "1950s":
            return {
                title: "Années 1950 — Automatistes / geste",
                text: "Le mouvement et l’énergie priment : contrastes, tension, spontanéité. Le tableau devient trace, rythme et collision de masses."
            };
        case "1960s":
            return {
                title: "Années 1960 — Paris & transition",
                text: "Période de recherches : papiers, encres, gouaches, formats. La composition se structure et prépare une pensée plus « vitrail » (segmentation, lignes, lumière)."
            };
        case "1970s-80s":
            return {
                title: "Années 1970–80 — Maturité",
                text: "La couleur s’affirme et le langage plastique se stabilise. L’œuvre dialogue davantage avec le support, la matière et (souvent) l’architecture."
            };
        default:
            return { title: `Période : ${periode}`, text: "Sélectionne une œuvre pour explorer le contexte et l’analyse." };
    }
};
const updatePeriodCard = () => {
    const card = periodeNarration(periodeActive);
    periodTitle.textContent = card.title;
    periodText.textContent = card.text;
};
const filterOeuvresByPeriode = (list, periode) => {
    if (periode === "toutes") {
        return list;
    }
    return list.filter((oeuvre) => oeuvre.periode === periode);
};
const resetSelectionState = () => {
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
const buildLocalDescription = (oeuvre) => {
    const parts = [];
    if (oeuvre.contexte && oeuvre.contexte.trim()) {
        parts.push(oeuvre.contexte.trim());
    }
    else {
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
const updateSelectedDescription = (id) => {
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
const updateSelectedLinks = (id) => {
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
    }
    else {
        sectionLinks.setAttribute("hidden", "true");
        sourceBtn.href = "#";
    }
};
const updateSelectedMedia = (id) => {
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
const renderMosaic = () => {
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
        fragment.addEventListener("keydown", (event) => {
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
const callChatbot = async (action) => {
    const body = {
        action,
        id: selectedId,
        periodeActive
    };
    try {
        const response = await fetch("chatbot.php", {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify(body)
        });
        const data = (await response.json());
        if (!data.ok) {
            statusBadge.textContent = "Erreur";
            botText.textContent = data.text ?? "Erreur.";
            return;
        }
        statusBadge.textContent = `Sélection : ${data.title}`;
        artTitle.textContent = data.title;
        artMeta.textContent = data.meta ?? "";
        botText.textContent = data.text ?? "";
    }
    catch {
        // Si le serveur PHP n'est pas lancé, on garde quand même une expérience "musée".
        statusBadge.textContent = "Serveur non démarré";
        botText.textContent =
            "Je n'arrive pas à contacter chatbot.php.\n\nLance le serveur : php -S 127.0.0.1:8080 -t .\nPuis recharge la page (Ctrl+F5).";
    }
};
const onSelect = async (id) => {
    selectedId = id;
    document.body.classList.add("has-selection");
    setSelectedVisual(id);
    updateSelectedDescription(id);
    updateSelectedLinks(id);
    updateSelectedMedia(id);
    await callChatbot("intro");
};
const timelineStations = qsa(".station");
timelineStations.forEach((station) => {
    station.addEventListener("click", () => {
        timelineStations.forEach((btn) => {
            btn.classList.remove("active");
            btn.setAttribute("aria-pressed", "false");
        });
        station.classList.add("active");
        station.setAttribute("aria-pressed", "true");
        const periode = station.dataset.periode;
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
const actionButtons = qsa(".btn");
actionButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
        const action = btn.dataset.action;
        if (!action)
            return;
        if (!selectedId) {
            statusBadge.textContent = "Choisis d’abord un fragment";
            botText.textContent = "Clique sur une œuvre dans le vitrail, puis je lance l’analyse.";
            return;
        }
        await callChatbot(action);
    });
});
void (async function init() {
    await loadOeuvres();
    updatePeriodCard();
    renderMosaic();
    // Spotlight souris (effet "lumière")
    let rafId = 0;
    let lastX = 50;
    let lastY = 50;
    const commit = () => {
        rafId = 0;
        mosaic.style.setProperty("--x", `${lastX}%`);
        mosaic.style.setProperty("--y", `${lastY}%`);
    };
    mosaic.addEventListener("mousemove", (e) => {
        const r = mosaic.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 100;
        const y = ((e.clientY - r.top) / r.height) * 100;
        lastX = Math.min(100, Math.max(0, x));
        lastY = Math.min(100, Math.max(0, y));
        if (!rafId)
            rafId = requestAnimationFrame(commit);
    });
    mosaic.addEventListener("mouseleave", () => {
        lastX = 50;
        lastY = 50;
        if (!rafId)
            rafId = requestAnimationFrame(commit);
    });
})();
//# sourceMappingURL=script.js.map