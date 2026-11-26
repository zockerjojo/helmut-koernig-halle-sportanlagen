// Personal-Leiste: unten rechts ein Symbol, darüber klappt eine Leiste mit den
// Bereichen auf, die der angemeldete Mitarbeiter sehen darf. Nur Symbole; als
// einziger Text stehen Farbe und Name. Rechts außen die Einstellungen mit
// Hell/Dunkel und Abmelden. Wird auf jeder Personalseite und, sobald ein Gerät
// angemeldet ist, auch auf der Startseite eingeblendet.
import { abmelden, BEREICHE, darf } from "./zugang.js";

const SYM = {"clipboard-list": "<path d=\"M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2\" /> <path d=\"M9 5a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2\" /> <path d=\"M9 12l.01 0\" /> <path d=\"M13 12l2 0\" /> <path d=\"M9 16l.01 0\" /> <path d=\"M13 16l2 0\" />", "shield-lock": "<path d=\"M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3\" /> <path d=\"M11 11a1 1 0 1 0 2 0a1 1 0 1 0 -2 0\" /> <path d=\"M12 12l0 2.5\" />", "apps": "<path d=\"M4 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4\" /> <path d=\"M4 15a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4\" /> <path d=\"M14 15a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4\" /> <path d=\"M14 7l6 0\" /> <path d=\"M17 4l0 6\" />", "settings": "<path d=\"M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065\" /> <path d=\"M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0\" />", "sun": "<path d=\"M8 12a4 4 0 1 0 8 0a4 4 0 1 0 -8 0\" /> <path d=\"M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7\" />", "moon": "<path d=\"M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454l0 .008\" />", "logout": "<path d=\"M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2\" /> <path d=\"M9 12h12l-3 -3\" /> <path d=\"M18 15l3 -3\" />", "tafel-zahnrad": "<path d=\"M8 4h-1.5a2 2 0 0 0 -2 2v13a2 2 0 0 0 2 2h5.5\" /> <path d=\"M8 4a1.5 1.5 0 0 1 1.5 -1.5h1a1.5 1.5 0 0 1 1.5 1.5a1.5 1.5 0 0 1 -1.5 1.5h-1a1.5 1.5 0 0 1 -1.5 -1.5\" /> <path d=\"M12 4h1.5a2 2 0 0 1 2 2v3\" /> <path d=\"M7.5 10l1 1l1.5 -2\" /> <path d=\"M7.5 15l1 1l1.5 -2\" /> <path d=\"M15 14.2a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0\" /> <path d=\"M17.2 10.2v1.4m0 5.2v1.4m4 -4h-1.4m-5.2 0h-1.4m6.83 -2.83l-1 1m-3.66 3.66l-1 1m5.66 0l-1 -1m-3.66 -3.66l-1 -1\" />", "wischmaschine": "<path d=\"M3 16.5v-3.5a2 2 0 0 1 2 -2h10.5l3.8 2.6a2 2 0 0 1 .7 1.5v1.4z\" /> <path d=\"M5 18.5a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0\" /> <path d=\"M16 18.5a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0\" /> <path d=\"M10.5 20h4\" /> <path d=\"M7.5 3.3a1.3 1.3 0 1 0 2.6 0a1.3 1.3 0 1 0 -2.6 0\" /> <path d=\"M8.8 5.5v3.5h3\" /> <path d=\"M8.8 6.5l3.7 1.2\" /> <path d=\"M13 11l1.6 -4.5\" /> <path d=\"M13.4 6.2h2.6\" /> <path d=\"M6 11v-3.5\" />", "schluessel-schrauber": "<path d=\"M3 5l2 -2\" /> <path d=\"M4 4l7 7\" /> <path d=\"M10.5 12.5l2 -2\" /> <path d=\"M13.77 11.23l6.5 6.5a1.8 1.8 0 0 1 -2.54 2.54l-6.5 -6.5a1.8 1.8 0 0 1 2.54 -2.54z\" /> <path d=\"M7.4 16.6l9.2 -9.2\" /> <path d=\"M15.2 14.8l2.4 2.4\" /> <path d=\"M18.99 2.74l.21 2.06l2.06 .21a2.8 2.8 0 1 1 -2.27 -2.27z\" /> <path d=\"M5.01 21.26l-.21 -2.06l-2.06 -.21a2.8 2.8 0 1 1 2.27 2.27z\" />", "tabelle": "<path d=\"M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14z\" /> <path d=\"M3 10h18\" /> <path d=\"M10 3v18\" />", "maximize": "<path d=\"M4 8v-2a2 2 0 0 1 2 -2h2\" /> <path d=\"M4 16v2a2 2 0 0 0 2 2h2\" /> <path d=\"M16 4h2a2 2 0 0 1 2 2v2\" /> <path d=\"M16 20h2a2 2 0 0 0 2 -2v-2\" />", "minimize": "<path d=\"M15 19v-2a2 2 0 0 1 2 -2h2\" /> <path d=\"M15 5v2a2 2 0 0 0 2 2h2\" /> <path d=\"M5 15h2a2 2 0 0 1 2 2v2\" /> <path d=\"M5 9h2a2 2 0 0 0 2 -2v-2\" />"};
const BEREICH_SYMBOL = { reinigung: "wischmaschine", sportanlagen: "tafel-zahnrad", arbeitsplan: "schluessel-schrauber", dienstplan: "tabelle", admin: "shield-lock" };
const svg = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${SYM[name]}</svg>`;
const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const CSS = `
.hkh-leiste{--l-panel:#F7F9F7; --l-ink:#14201B; --l-ink2:#55635C; --l-line:#C3CCC6; --l-akzent:#17694B; --l-auf-akzent:#fff; --l-schatten:0 6px 24px rgba(20,32,27,.18)}
:root[data-theme="dark"] .hkh-leiste{--l-panel:#18211C; --l-ink:#E7EEE9; --l-ink2:#9BAAA1; --l-line:#33413A; --l-akzent:#4CC38A; --l-auf-akzent:#06150E; --l-schatten:0 6px 24px rgba(0,0,0,.5)}
.hkh-leiste *{box-sizing:border-box}
.hkh-leiste svg{width:22px; height:22px; fill:none; stroke:currentColor; stroke-width:1.9; stroke-linecap:round; stroke-linejoin:round}
.hkh-schalter{position:fixed; z-index:60; right:max(12px, env(safe-area-inset-right)); bottom:max(12px, env(safe-area-inset-bottom)); width:52px; height:52px; border-radius:16px; border:1px solid var(--l-line); background:var(--l-panel); color:var(--l-ink); display:flex; align-items:center; justify-content:center; padding:0; cursor:pointer; box-shadow:var(--l-schatten); -webkit-tap-highlight-color:transparent; transition:background .15s, color .15s}
.hkh-schalter[aria-expanded="true"]{background:var(--l-akzent); border-color:var(--l-akzent); color:var(--l-auf-akzent)}
.hkh-band{position:fixed; z-index:59; left:max(12px, env(safe-area-inset-left)); right:calc(max(12px, env(safe-area-inset-right)) + 60px); bottom:max(12px, env(safe-area-inset-bottom)); height:52px; display:flex; align-items:center; gap:4px; padding:4px; border-radius:16px; border:1px solid var(--l-line); background:var(--l-panel); color:var(--l-ink); box-shadow:var(--l-schatten); transform:translateY(calc(100% + 24px)); opacity:0; pointer-events:none; transition:transform .2s ease, opacity .2s ease}
.hkh-leiste[data-offen="true"] .hkh-band{transform:none; opacity:1; pointer-events:auto}
@media (min-width:900px){ .hkh-band{left:auto; width:min(560px, calc(100vw - 96px))} }
.hkh-sym{flex:none; width:44px; height:42px; border-radius:12px; border:0; background:none; color:var(--l-ink); display:inline-flex; align-items:center; justify-content:center; padding:0; cursor:pointer; text-decoration:none; -webkit-tap-highlight-color:transparent}
.hkh-sym:hover{background:color-mix(in srgb, var(--l-ink) 8%, transparent)}
.hkh-sym[aria-current="page"]{background:var(--l-akzent); color:var(--l-auf-akzent)}
.hkh-trenn{flex:none; width:1px; height:28px; background:var(--l-line); margin:0 4px}
.hkh-wer{flex:1 1 auto; min-width:0; display:flex; align-items:center; gap:8px; padding:0 6px; font:600 15px/1.1 Barlow, system-ui, -apple-system, "Segoe UI", sans-serif; color:var(--l-ink)}
.hkh-wer span:last-child{overflow:hidden; text-overflow:ellipsis; white-space:nowrap}
.hkh-punkt{flex:none; width:14px; height:14px; border-radius:50%; border:1px solid var(--l-ink)}
.hkh-einst{position:fixed; z-index:61; right:calc(max(12px, env(safe-area-inset-right)) + 60px); bottom:calc(max(12px, env(safe-area-inset-bottom)) + var(--hkh-leiste-h, 62px)); min-width:200px; padding:6px; border-radius:14px; border:1px solid var(--l-line); background:var(--l-panel); color:var(--l-ink); box-shadow:var(--l-schatten); display:flex; flex-direction:column; gap:2px}
.hkh-einst[hidden]{display:none}
.hkh-einst button{display:flex; align-items:center; gap:10px; min-height:44px; padding:0 12px; border:0; border-radius:10px; background:none; color:var(--l-ink); font:500 15px Barlow, system-ui, -apple-system, "Segoe UI", sans-serif; text-align:left; cursor:pointer}
.hkh-einst button[hidden]{display:none}
.hkh-einst button:hover{background:color-mix(in srgb, var(--l-ink) 8%, transparent)}
.hkh-haken{flex:none; display:inline-flex; align-items:center; justify-content:center; width:20px; height:20px; border:2px solid var(--l-ink); border-radius:5px; font-size:14px; font-weight:700; line-height:1}
.hkh-haken::after{content:"✓"}
.hkh-einst button[aria-checked="false"] .hkh-haken::after{content:""}
.hkh-leiste :focus-visible{outline:3px solid var(--l-akzent); outline-offset:2px}
body.hkh-mit-leiste{padding-bottom:calc(var(--hkh-leiste-h, 62px) + 14px + env(safe-area-inset-bottom))}
/* Schmale Bildschirme: die Leiste wird zweizeilig, damit nichts abgeschnitten ist und nichts gescrollt werden muss. */
@media (max-width:899px){
  /* zwei Ebenen: oben Name mit Farbe und Einstellungen, unten nur die Symbole */
  .hkh-band{height:auto; min-height:52px; flex-wrap:wrap; row-gap:2px}
  .hkh-trenn{display:block; order:-1; flex:1 0 100%; width:auto; height:1px; margin:2px 4px}
  .hkh-wer{order:-3; flex:1 1 0; min-height:42px}
  .hkh-sym[data-einst]{order:-2}
}
`;

const istDunkel = () => {
  const t = document.documentElement.dataset.theme;
  return t ? t === "dark" : !!window.matchMedia?.("(prefers-color-scheme: dark)").matches;
};
function themaSetzen(dunkel) {
  document.documentElement.dataset.theme = dunkel ? "dark" : "light";
  try { localStorage.setItem("hkh-thema", dunkel ? "dark" : "light"); } catch (e) {}
  window.dispatchEvent(new CustomEvent("hkh-thema", { detail: { dunkel } }));
}

let leiste = null;
/* Läuft die Seite in der Tablet-Hülle (/Tablet/), gilt dort die Hülle. */
const inTabletHuelle = () => {
  try { return window.parent !== window && typeof window.parent.hkhSeite === "function"; } catch (e) { return false; }
};
/* sitz: die Sitzung aus zugang.js. aktiv: Bereich der aktuellen Seite ("" = Startseite). */
export function leisteStarten(sitz, aktiv = "") {
  if (!sitz) return;
  if (leiste) leiste.remove();
  if (!document.getElementById("hkh-leiste-stil")) {
    const st = document.createElement("style");
    st.id = "hkh-leiste-stil"; st.textContent = CSS;
    document.head.appendChild(st);
  }
  /* Reihenfolge in der Leiste: Sportanlagen vor Hallenreinigung */
  const REIHENFOLGE = ["sportanlagen", "reinigung", "arbeitsplan", "dienstplan", "admin"];
  const rang = (id) => { const i = REIHENFOLGE.indexOf(id); return i < 0 ? 99 : i; };
  const bereiche = BEREICHE.filter((f) => darf(sitz, f.id)).sort((x, y) => rang(x.id) - rang(y.id));
  const bezeichnung = (f) => (f.id === "admin" && !sitz.istAdmin ? "Animation beim Erledigen" : f.name);
  leiste = document.createElement("div");
  leiste.className = "hkh-leiste";
  /* In der Tablet-Hülle gibt es keine Leiste: Knöpfe und Anmeldung stehen oben in der Hülle. */
  if (sitz?.tablett || inTabletHuelle()) return;
  const tab = false;
  const ziel = (seite) => (tab ? seite.replace(/^\.\//, "./Tablet/") : seite);
  let offen = tab;
  if (!tab) try { offen = localStorage.getItem("hkh-leiste") === "auf"; } catch (e) {}
  leiste.dataset.offen = String(offen);
  leiste.innerHTML = `
    <nav class="hkh-band" id="hkh-band" aria-label="Personalbereiche">
      <a class="hkh-sym" href="${tab ? "./Tablet/" : "./"}" aria-label="Startseite" title="Startseite"${aktiv === "" ? ' aria-current="page"' : ""}>${svg("clipboard-list")}</a>
      ${bereiche.map((f) => `<a class="hkh-sym" href="${esc(ziel(f.seite))}" aria-label="${esc(bezeichnung(f))}" title="${esc(bezeichnung(f))}"${aktiv === f.id ? ' aria-current="page"' : ""}>${svg(BEREICH_SYMBOL[f.id])}</a>`).join("")}
      <span class="hkh-trenn" aria-hidden="true"></span>
      <span class="hkh-wer" title="Angemeldet"><span class="hkh-punkt" style="background:${esc(sitz.farbe)}"></span><span>${esc(sitz.name)}</span></span>
      <button class="hkh-sym" type="button" data-einst aria-label="Einstellungen" title="Einstellungen" aria-haspopup="true" aria-expanded="false">${svg("settings")}</button>
    </nav>
    <div class="hkh-einst" role="menu" aria-label="Einstellungen" hidden>
      <button type="button" role="menuitem" data-thema></button>
      ${tab ? `<button type="button" role="menuitemcheckbox" data-voll aria-pressed="false"></button>` : ""}
      <button type="button" role="menuitemcheckbox" data-animation aria-checked="true"><span class="hkh-haken" aria-hidden="true"></span><span>Animation zeigen</span></button>
      <button type="button" role="menuitem" data-ab${tab ? " hidden" : ""}>${svg("logout")}<span>Abmelden</span></button>
    </div>
    <button class="hkh-schalter" type="button" aria-controls="hkh-band" aria-expanded="${offen}" aria-label="Personal-Leiste ein- oder ausklappen" title="Bereiche">${svg("apps")}</button>`;
  document.body.appendChild(leiste);
  document.body.classList.add("hkh-mit-leiste");

  const schalter = leiste.querySelector(".hkh-schalter");
  const einst = leiste.querySelector(".hkh-einst");
  const einstKnopf = leiste.querySelector("[data-einst]");
  const themaKnopf = leiste.querySelector("[data-thema]");
  const themaZeigen = () => { themaKnopf.innerHTML = istDunkel() ? `${svg("sun")}<span>Hell</span>` : `${svg("moon")}<span>Dunkel</span>`; };
  themaZeigen();
  /* Tablet: Vollbild an oder aus. Gemerkt wird es auf dem Gerät; nach dem Wechsel auf eine
     andere Seite geht der Browser beim nächsten Antippen wieder ins Vollbild (siehe Tablet/schutz.js). */
  const vollKnopf = leiste.querySelector("[data-voll]");
  if (vollKnopf) {
    const vollAn = () => { try { return localStorage.getItem("hkh-tablett-vollbild") === "1"; } catch (e) { return false; } };
    const vollZeigen = () => {
      const an = vollAn();
      vollKnopf.setAttribute("aria-pressed", String(an));
      vollKnopf.innerHTML = an ? `${svg("minimize")}<span>Vollbild aus</span>` : `${svg("maximize")}<span>Vollbild an</span>`;
    };
    vollZeigen();
    vollKnopf.addEventListener("click", () => {
      const an = !vollAn();
      try { localStorage.setItem("hkh-tablett-vollbild", an ? "1" : "0"); } catch (e) {}
      const el = document.documentElement;
      if (an) (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el)?.catch?.(() => {});
      else if (document.fullscreenElement || document.webkitFullscreenElement) (document.exitFullscreen || document.webkitExitFullscreen)?.call(document)?.catch?.(() => {});
      vollZeigen();
    });
  }
  /* Animation zeigen: jede Person kann die Feier auf diesem Gerät ausschalten (siehe feierAnzeigen in feier.js). */
  const animKnopf = leiste.querySelector("[data-animation]");
  if (animKnopf) {
    const animAn = () => { try { return localStorage.getItem("hkh-animation-aus") !== "1"; } catch (e) { return true; } };
    animKnopf.setAttribute("aria-checked", String(animAn()));
    animKnopf.addEventListener("click", () => {
      const an = !animAn();
      try { localStorage.setItem("hkh-animation-aus", an ? "0" : "1"); } catch (e) {}
      animKnopf.setAttribute("aria-checked", String(an));
    });
  }
  const einstZu = () => { einst.hidden = true; einstKnopf.setAttribute("aria-expanded", "false"); };
  const setzeOffen = (auf) => {
    leiste.dataset.offen = String(auf);
    schalter.setAttribute("aria-expanded", String(auf));
    try { localStorage.setItem("hkh-leiste", auf ? "auf" : "zu"); } catch (e) {}
    if (!auf) einstZu();
    hoeheMelden();
  };
  /* Wie hoch die Leiste gerade ist: danach richten sich Speichern-Leiste und Seitenabstand. */
  const band = leiste.querySelector(".hkh-band");
  const hoeheMelden = () => {
    const h = leiste.dataset.offen === "true" ? Math.max(band.offsetHeight, 52) : 52;
    document.documentElement.style.setProperty("--hkh-leiste-h", `${h + 10}px`);
  };
  hoeheMelden();
  try { new ResizeObserver(hoeheMelden).observe(band); } catch (e) { window.addEventListener("resize", hoeheMelden); }
  schalter.addEventListener("click", () => setzeOffen(leiste.dataset.offen !== "true"));
  einstKnopf.addEventListener("click", (e) => {
    e.stopPropagation();
    const auf = einst.hidden;
    einst.hidden = !auf;
    einstKnopf.setAttribute("aria-expanded", String(auf));
    if (auf) themaKnopf.focus();
  });
  themaKnopf.addEventListener("click", () => { themaSetzen(!istDunkel()); themaZeigen(); });
  leiste.querySelector("[data-ab]").addEventListener("click", async () => {
    try { await abmelden(); } catch (e) { console.error(e); }
    location.href = "./";
  });
  document.addEventListener("click", (e) => { if (!einst.hidden && !einst.contains(e.target)) einstZu(); });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!einst.hidden) { einstZu(); einstKnopf.focus(); }
    else if (leiste.dataset.offen === "true") { setzeOffen(false); schalter.focus(); }
  });
  window.addEventListener("hkh-thema", themaZeigen);
}
