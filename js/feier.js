/* Feier nach dem Erledigen einer Aufgabe: ein Vollbild-Overlay mit einem Schriftzug,
   der Buchstabe für Buchstabe erscheint, dazu Konfetti, Feuerwerk und Funkeln.
   Die Arbeitsplan-Seite spielt sie beim Erledigen ab, das Admin-Panel für die Vorschau.
   Dieses Modul liest nichts aus der Datenbank. Die Seiten geben die Einstellungen herein. */

export const FEIER_STANDARD = {
  aktiv: true,
  schrift: "vorlage",
  effekte: { konfetti: true, raketen: true, sterne: true },
  texte: ["du bist der Beste!", "Stark gemacht!", "Top erledigt!", "Feierabend-Held!", "Weiter so!"],
};
export const FEIER_SCHRIFTEN = ["vorlage", "bunt"];
export const FEIER_MAX_TEXTE = 12;
export const FEIER_MAX_ZEICHEN = 80;

const PAL = ["#ff4f8b", "#ffb000", "#22b573", "#2f80ed", "#ff7a1a", "#8b5cf6", "#00a8c6"];
const CREME = "#fff3d6";
const NAVY = "#17416b";
const NAVY_TIEF = "#0c2a45";
const FAMILIE = "Pacifico, cursive";
const DAUER = 5600;
const DAUER_RUHIG = 2600;
const ZEILENHOEHE = 1.12;
const STERN_POS = [[0.08, 0.22], [0.92, 0.2], [0.14, 0.82], [0.86, 0.8], [0.5, 0.08], [0.5, 0.93]];

const SCHATTEN = [
  `.05em 0 0 ${NAVY}`, `-.05em 0 0 ${NAVY}`, `0 .05em 0 ${NAVY}`, `0 -.05em 0 ${NAVY}`,
  `.035em .035em 0 ${NAVY}`, `-.035em .035em 0 ${NAVY}`, `.035em -.035em 0 ${NAVY}`, `-.035em -.035em 0 ${NAVY}`,
  `0 .12em 0 ${NAVY_TIEF}`,
].join(",");

const STIL = `
.feier{position:fixed;inset:0;z-index:10000;background:#fbfaf6;overflow:hidden;cursor:pointer;touch-action:none;-webkit-tap-highlight-color:transparent;animation:feierAuf .35s ease both}
.feier.raus{animation:feierAus .8s ease-in forwards}
.feier-leinwand{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.feier-text{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 4vw;box-sizing:border-box;font-family:${FAMILIE};pointer-events:none}
.feier-zeile{margin:0;line-height:${ZEILENHOEHE};white-space:pre;text-align:center;transform:rotate(-3deg)}
.feier-zeile:nth-child(2n){transform:rotate(2deg)}
.feier-b,.feier-w{display:inline-block}
.feier-z{display:inline-block;color:var(--farbe,${CREME});text-shadow:${SCHATTEN}}
.feier-b{animation:feierPop .6s cubic-bezier(.3,1.5,.5,1) both;animation-delay:calc(var(--i)*60ms + 240ms)}
.feier-w{animation:feierWelle 2s ease-in-out infinite;animation-delay:calc(var(--i)*80ms + 1200ms)}
.feier-z{animation:feierGlanz 2.4s linear infinite;animation-delay:calc(var(--i)*70ms + 1600ms)}
.feier.ruhig .feier-text{animation:feierEin .6s ease both}
.feier.ruhig .feier-b,.feier.ruhig .feier-w,.feier.ruhig .feier-z{animation:none}
.feier-sr{position:absolute;width:1px;height:1px;margin:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@keyframes feierAuf{from{opacity:0}to{opacity:1}}
@keyframes feierAus{to{opacity:0}}
@keyframes feierEin{from{opacity:0}to{opacity:1}}
@keyframes feierPop{0%{opacity:0;transform:translateY(.5em) scale(.1) rotate(-30deg)}55%{opacity:1;transform:translateY(-.14em) scale(1.18) rotate(7deg)}78%{transform:translateY(.03em) scale(.96) rotate(-2deg)}100%{opacity:1;transform:none}}
@keyframes feierWelle{0%,100%{transform:translateY(0)}50%{transform:translateY(-.12em)}}
@keyframes feierGlanz{0%{filter:brightness(1)}7%{filter:brightness(1.6)}14%,100%{filter:brightness(1)}}
`;

const zufall = (a, b) => a + Math.random() * (b - a);

/* Macht aus beliebigen (auch fehlenden) Einstellungen eine vollständige Feier. */
export function feierBereinigt(roh) {
  const r = roh && typeof roh === "object" ? roh : {};
  const e = r.effekte && typeof r.effekte === "object" ? r.effekte : {};
  const rohTexte = r.texte && typeof r.texte === "object" ? Object.values(r.texte) : [];
  const texte = rohTexte
    .filter((t) => typeof t === "string")
    .map((t) => Array.from(t.trim()).slice(0, FEIER_MAX_ZEICHEN).join(""))
    .filter((t) => t.length > 0)
    .slice(0, FEIER_MAX_TEXTE);
  const schalter = (wert, vorgabe) => (wert === undefined || wert === null ? vorgabe : wert === true);
  return {
    aktiv: schalter(r.aktiv, true),
    schrift: FEIER_SCHRIFTEN.includes(r.schrift) ? r.schrift : "vorlage",
    effekte: {
      konfetti: schalter(e.konfetti, true),
      raketen: schalter(e.raketen, true),
      sterne: schalter(e.sterne, true),
    },
    texte: texte.length ? texte : FEIER_STANDARD.texte.slice(),
  };
}

/* Zufällig einer der Texte, möglichst nicht derselbe wie beim letzten Mal. */
let zuletzt = null;
function zufallsText(texte) {
  const andere = texte.length > 1 ? texte.filter((t) => t !== zuletzt) : texte;
  zuletzt = andere[Math.floor(Math.random() * andere.length)];
  return zuletzt;
}

/* Emojis bleiben als ganze Zeichen zusammen (z. B. mit Hautton oder Joiner). */
function zeichenVon(text) {
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    return [...new Intl.Segmenter("de", { granularity: "grapheme" }).segment(text)].map((s) => s.segment);
  }
  return Array.from(text);
}

let messCtx = null;
function breiteBei100(text) {
  if (!messCtx) messCtx = document.createElement("canvas").getContext("2d");
  messCtx.font = `100px ${FAMILIE}`;
  return messCtx.measureText(text).width;
}

/* Die größte Schrift, die in die Breite (90 %) und in die Höhe (74 %) passt. */
function skalaFuer(zeilen, w, h) {
  const breit = Math.max(...zeilen.map(breiteBei100), 1);
  const nachBreite = ((w * 0.9) / breit) * 100;
  const nachHoehe = (h * 0.74) / (zeilen.length * ZEILENHOEHE);
  return Math.max(16, Math.min(nachBreite, nachHoehe, 520));
}

/* Ein Satz wird in eine oder zwei Zeilen gebrochen, je nachdem, was am größten wird. */
function besteZeilen(satz, w, h) {
  const worte = satz.split(" ");
  const kandidaten = [[satz]];
  for (let i = 1; i < worte.length; i++) {
    kandidaten.push([worte.slice(0, i).join(" "), worte.slice(i).join(" ")]);
  }
  let beste = kandidaten[0];
  let bestGroesse = -1;
  for (const k of kandidaten) {
    const g = skalaFuer(k, w, h);
    if (g > bestGroesse) { bestGroesse = g; beste = k; }
  }
  return beste;
}

function textAufbauen(box, zeilen, bunt) {
  box.innerHTML = "";
  let n = 0;
  for (const zeile of zeilen) {
    const reihe = document.createElement("div");
    reihe.className = "feier-zeile";
    for (const ch of zeichenVon(zeile)) {
      if (/\s/.test(ch)) { reihe.appendChild(document.createTextNode(" ")); continue; }
      const b = document.createElement("span");
      b.className = "feier-b";
      b.style.setProperty("--i", n);
      const welle = document.createElement("span");
      welle.className = "feier-w";
      const z = document.createElement("span");
      z.className = "feier-z";
      if (bunt) z.style.setProperty("--farbe", PAL[n % PAL.length]);
      z.textContent = ch;
      welle.appendChild(z);
      b.appendChild(welle);
      reihe.appendChild(b);
      n++;
    }
    box.appendChild(reihe);
  }
}

/* Stil und Schriftfreigabe einmal eintragen. Der Promise wartet, bis das Schrift-Stylesheet
   da ist (true), oder meldet, dass es nicht geladen werden kann (false). */
let stilBereit = null;
function stilEinmal() {
  if (stilBereit) return stilBereit;
  const s = document.createElement("style");
  s.id = "feier-stil";
  s.textContent = STIL;
  document.head.appendChild(s);
  stilBereit = new Promise((fertig) => {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Pacifico&display=swap";
    l.addEventListener("load", () => fertig(true));
    l.addEventListener("error", () => fertig(false));
    document.head.appendChild(l);
  });
  return stilBereit;
}

/* Die Zeilen werden erst gemessen, wenn die Schrift wirklich da ist. Sonst wird mit der
   Ersatzschrift gerechnet und der Text ragt über den Rand. Wartet höchstens 900 ms, ohne Netz
   geht es mit der Ersatzschrift weiter. */
function schriftBereit() {
  const laden = stilEinmal().then((ok) =>
    ok && document.fonts && document.fonts.load ? document.fonts.load("100px Pacifico").catch(() => null) : null);
  return Promise.race([laden, new Promise((r) => setTimeout(r, 900))]);
}

let lauf = null;

/* Spielt die Feier ab. Ein Tippen (oder Escape) beendet sie früher.
   Gibt eine Funktion zurück, die sie sofort beendet. */
export function feierSpielen(roh) {
  const konfig = feierBereinigt(roh);
  stilEinmal();
  if (lauf) lauf();

  const ruhig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dauer = ruhig ? DAUER_RUHIG : DAUER;
  const satz = zufallsText(konfig.texte);
  const effekte = konfig.effekte;

  const el = document.createElement("div");
  el.className = "feier" + (ruhig ? " ruhig" : "");
  el.innerHTML = '<canvas class="feier-leinwand" aria-hidden="true"></canvas><div class="feier-text" aria-hidden="true"></div><p class="feier-sr"></p>';
  el.querySelector(".feier-sr").textContent = satz;
  document.body.appendChild(el);

  const leinwand = el.querySelector(".feier-leinwand");
  const box = el.querySelector(".feier-text");
  const ctx = leinwand.getContext("2d");
  const zeitgeber = [];
  let fertig = false, rAF = 0, zeilen = null, w = 0, h = 0, maas = 1;
  let t0 = 0, letzt = 0, letzteFunke = 0;
  let teile = [], raketen = [], raketenPlan = [], funken = [], sterne = [];

  function groesse() {
    w = el.clientWidth;
    h = el.clientHeight;
    maas = Math.max(0.8, Math.min(2.4, Math.min(w, h) / 400));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    leinwand.width = Math.round(w * dpr);
    leinwand.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (zeilen) box.style.fontSize = skalaFuer(zeilen, w, h) + "px";
  }

  function stoppe() {
    if (fertig) return;
    fertig = true;
    cancelAnimationFrame(rAF);
    zeitgeber.forEach(clearTimeout);
    window.removeEventListener("resize", groesse);
    window.removeEventListener("keydown", taste);
    el.remove();
    if (lauf === stoppe) lauf = null;
  }

  function taste(e) { if (e.key === "Escape") stoppe(); }

  function konfetti(n) {
    for (let k = 0; k < n; k++) {
      const links = k % 2 === 0;
      const winkel = zufall(links ? -86 : -120, links ? -60 : -94) * Math.PI / 180;
      const v = zufall(380, 760);
      teile.push({
        typ: "k", x: links ? -4 : w + 4, y: h + 4,
        vx: Math.cos(winkel) * v, vy: Math.sin(winkel) * v,
        bw: zufall(6, 10) * maas, bh: zufall(3.5, 6) * maas,
        rot: zufall(0, 6.28), vr: zufall(-6, 6), flip: zufall(0, 6.28), vf: zufall(4, 9),
        farbe: PAL[k % PAL.length], alt: 0, leben: zufall(3.6, 5),
      });
    }
  }

  function raketenPlanBauen() {
    return [260, 1000, 1700, 2450, 3200, 3950].map((s) => ({
      start: s, flugzeit: zufall(700, 900),
      x0: zufall(0.2, 0.8) * w, y0: h,
      x1: zufall(0.15, 0.85) * w, y1: zufall(0.08, 0.3) * h,
      farbe: PAL[Math.floor(Math.random() * PAL.length)],
    }));
  }

  function explodiere(x, y, farbe) {
    for (let k = 0; k < 54; k++) {
      const a = zufall(0, Math.PI * 2), s = zufall(80, 250) * maas;
      teile.push({
        typ: "p", x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        r: zufall(1.6, 2.9) * maas,
        farbe: Math.random() < 0.5 ? farbe : PAL[Math.floor(Math.random() * PAL.length)],
        alt: 0, leben: zufall(1, 1.8),
      });
    }
  }

  function funkeNeu() {
    funken.push({
      x: Math.random() * w, y: -6, vy: zufall(40, 90) * maas, sw: zufall(0, 6.28), ph: zufall(0, 6.28),
      r: zufall(1.2, 2.2) * maas, farbe: Math.random() < 0.5 ? "#ffb000" : "#2f80ed", alt: 0, leben: zufall(3.5, 5.5),
    });
  }

  function stern(x, y, r, a, farbe) {
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = farbe;
    ctx.beginPath();
    for (let k = 0; k < 8; k++) {
      const ang = k * Math.PI / 4 - Math.PI / 2;
      const rad = k % 2 ? r * 0.26 : r;
      ctx.lineTo(x + Math.cos(ang) * rad, y + Math.sin(ang) * rad);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function schleife(jetzt) {
    if (fertig) return;
    const t = jetzt - t0;
    const dt = Math.max(0, Math.min(0.05, (jetzt - letzt) / 1000));
    letzt = jetzt;
    ctx.clearRect(0, 0, w, h);

    while (raketenPlan.length && raketenPlan[0].start <= t) raketen.push(raketenPlan.shift());
    if (effekte.sterne && !ruhig && t < 4300 && jetzt - letzteFunke > 45) { funkeNeu(); letzteFunke = jetzt; }

    raketen = raketen.filter((r) => {
      const p = Math.min(1, (t - r.start) / r.flugzeit);
      if (p >= 1) { explodiere(r.x1, r.y1, r.farbe); return false; }
      ctx.fillStyle = r.farbe;
      for (let s = 0; s < 4; s++) {
        const q = 1 - Math.pow(1 - Math.max(0, p - s * 0.035), 2.2);
        ctx.globalAlpha = 0.9 - s * 0.2;
        ctx.beginPath();
        ctx.arc(r.x0 + (r.x1 - r.x0) * q, r.y0 + (r.y1 - r.y0) * q, (2.8 - s * 0.5) * maas, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      return true;
    });

    teile = teile.filter((p) => {
      p.alt += dt;
      if (p.alt >= p.leben) return false;
      const k = p.typ === "k" ? 2.2 : 2.4;
      p.vy += (p.typ === "k" ? 140 : 160) * dt;
      const f = Math.exp(-k * dt);
      p.vx *= f;
      p.vy *= f;
      ctx.globalAlpha = Math.min(1, (p.leben - p.alt) / 0.7);
      ctx.fillStyle = p.farbe;
      if (p.typ === "k") {
        p.x += (p.vx + Math.sin(p.alt * 5 + p.flip) * 22) * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        p.flip += p.vf * dt;
        if (p.y > h + 12) return false;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(1, Math.cos(p.flip));
        ctx.fillRect(-p.bw / 2, -p.bh / 2, p.bw, p.bh);
        ctx.restore();
      } else {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      return true;
    });

    funken = funken.filter((f) => {
      f.alt += dt;
      if (f.alt >= f.leben || f.y > h + 10) return false;
      f.y += f.vy * dt;
      f.x += Math.sin(f.alt * 2 + f.sw) * 14 * dt;
      const tw = Math.max(0, 0.45 + 0.55 * Math.sin(t * 0.008 + f.ph));
      ctx.globalAlpha = Math.min(1, (f.leben - f.alt) / 0.8) * tw;
      ctx.fillStyle = f.farbe;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      return true;
    });

    if (sterne.length && t > 1300 && t < 4900) {
      const env = Math.min(1, (t - 1300) / 400, (4900 - t) / 500);
      for (const s of sterne) {
        const tw = 0.5 + 0.5 * Math.sin(t * 0.009 + s.ph);
        stern(s.fx * w, s.fy * h, s.r * maas * (0.6 + 0.4 * tw), env * (0.35 + 0.65 * tw), "#ffb000");
      }
    }

    rAF = requestAnimationFrame(schleife);
  }

  el.addEventListener("click", stoppe);
  window.addEventListener("keydown", taste);
  window.addEventListener("resize", groesse);
  lauf = stoppe;
  groesse();

  schriftBereit().then(() => {
    if (fertig) return;
    zeilen = besteZeilen(satz, w, h);
    textAufbauen(box, zeilen, konfig.schrift === "bunt");
    groesse();
    t0 = performance.now();
    letzt = t0;
    if (!ruhig) {
      if (effekte.sterne) sterne = STERN_POS.map(([fx, fy]) => ({ fx, fy, r: zufall(6, 11), ph: zufall(0, 6.28) }));
      if (effekte.raketen) raketenPlan = raketenPlanBauen();
      if (effekte.konfetti) konfetti(150);
    }
    rAF = requestAnimationFrame(schleife);
    zeitgeber.push(setTimeout(() => el.classList.add("raus"), dauer - 900));
    zeitgeber.push(setTimeout(stoppe, dauer));
  });

  return stoppe;
}
