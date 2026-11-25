/* Feier nach dem Erledigen einer Aufgabe: ein Vollbild-Overlay mit einem Schriftzug,
   der Buchstabe für Buchstabe erscheint, dazu Konfetti, Feuerwerk, Funkeln, Herzen, Emoji-Regen und Wackeln.
   Die Arbeitsplan-Seite spielt sie beim Erledigen ab, das Admin-Panel für die Vorschau.
   Dieses Modul liest nichts aus der Datenbank. Die Seiten geben die Einstellungen herein. */

export const FEIER_STANDARD = {
  aktiv: true,
  schrift: "vorlage",
  effekte: { konfetti: true, raketen: true, sterne: true, herzen: false, emojiregen: false, wackeln: false },
  texte: ["du bist der Beste!", "Stark gemacht!", "Top erledigt!", "Feierabend-Held!", "Weiter so!"],
};
export const FEIER_SCHRIFTEN = ["vorlage", "bunt"];
export const FEIER_MAX_TEXTE = 12;
export const FEIER_MAX_ZEICHEN = 80;

const PAL = ["#ff4f8b", "#ffb000", "#3ddc84", "#8fd8ff", "#ff7a1a", "#b794f6", "#3fe0d0"];
const CREME = "#fff3d6";
const NAVY = "#17416b";
const NAVY_TIEF = "#0c2a45";
const FAMILIE = "Pacifico, cursive";
const DAUER = 5600;
const DAUER_RUHIG = 2600;
const ZEILENHOEHE = 1.12;
const STERN_POS = [[0.08, 0.22], [0.92, 0.2], [0.14, 0.82], [0.86, 0.8], [0.5, 0.08], [0.5, 0.93]];
const KONF_REIBUNG = 1.6;        // wie stark das Konfetti abgebremst wird
const KONF_FALL = 0.17;          // Fallgeschwindigkeit als Anteil der Bildschirmhöhe pro Sekunde
/* Zeitpunkte (ms) der Kanonen-Salven. "tief" schießt auf die untere Bildschirmhälfte,
   damit unten nicht lange nichts fällt. */
const KONF_STOSS = [{ t: 0 }, { t: 900 }, { t: 1600, tief: true }];
const KONF_REGEN_ENDE = 3800;    // bis wann von oben Konfetti nachkommt (ms)
const KONF_REGEN_PRO_S = 34;     // Teile pro Sekunde im Regen auf einem Handy-Bildschirm

const SCHATTEN = [
  `.05em 0 0 ${NAVY}`, `-.05em 0 0 ${NAVY}`, `0 .05em 0 ${NAVY}`, `0 -.05em 0 ${NAVY}`,
  `.035em .035em 0 ${NAVY}`, `-.035em .035em 0 ${NAVY}`, `.035em -.035em 0 ${NAVY}`, `-.035em -.035em 0 ${NAVY}`,
  `0 .12em 0 ${NAVY_TIEF}`,
].join(",");

const STIL = `
.feier{position:fixed;inset:0;z-index:10000;background:radial-gradient(ellipse at 50% 42%,#2b78cc 0%,#1a4f8f 55%,#0c2a45 100%);overflow:hidden;cursor:pointer;touch-action:none;-webkit-tap-highlight-color:transparent;animation:feierAuf .35s ease both}
.feier.raus{animation:feierAus .8s ease-in forwards}
.feier-leinwand{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.feier-text{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 4vw;box-sizing:border-box;font-family:${FAMILIE};pointer-events:none}
.feier-zeile{position:relative;margin:0;line-height:${ZEILENHOEHE};white-space:pre;text-align:center;transform:rotate(-3deg)}
.feier-zeile:nth-child(2n){transform:rotate(2deg)}
/* Der Glanz ist eine helle Bahn über jeder Zeile. Sie wandert innerhalb der Zeile (background-position),
   damit sie nicht über den Textrand hinausläuft. An den Rändern wird sie weich ausgeblendet.
   Ein Filter für jeden einzelnen Buchstaben hatte das Bild ruckeln lassen. */
.feier-zeile::after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(100deg,transparent 46.6%,rgba(255,255,255,.55) 50%,transparent 53.4%) no-repeat;background-size:300% 100%;background-position:100% 0;-webkit-mask-image:linear-gradient(90deg,transparent,#000 14%,#000 86%,transparent),linear-gradient(180deg,transparent,#000 22%,#000 78%,transparent);-webkit-mask-composite:source-in;mask-image:linear-gradient(90deg,transparent,#000 14%,#000 86%,transparent),linear-gradient(180deg,transparent,#000 22%,#000 78%,transparent);mask-composite:intersect;animation:feierSchein 3.2s ease-in-out 1.2s infinite}
.feier-b,.feier-w{display:inline-block}
.feier-z{display:inline-block;color:var(--farbe,${CREME});text-shadow:${SCHATTEN}}
.feier-b{animation:feierPop .6s cubic-bezier(.3,1.5,.5,1) both;animation-delay:calc(var(--i)*60ms + 240ms)}
.feier-w{animation:feierWelle 2s ease-in-out infinite;animation-delay:calc(var(--i)*80ms + 1200ms)}
.feier.ruhig .feier-text{animation:feierEin .6s ease both}
.feier.ruhig .feier-b,.feier.ruhig .feier-w{animation:none}
.feier.ruhig .feier-zeile::after{display:none}
.feier.wackeln .feier-text{animation:feierWackel .45s ease-in-out .9s 5 both}
.feier-sr{position:absolute;width:1px;height:1px;margin:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@keyframes feierAuf{from{opacity:0}to{opacity:1}}
@keyframes feierAus{to{opacity:0}}
@keyframes feierEin{from{opacity:0}to{opacity:1}}
@keyframes feierPop{0%{opacity:0;transform:translateY(.5em) scale(.1) rotate(-30deg)}55%{opacity:1;transform:translateY(-.14em) scale(1.18) rotate(7deg)}78%{transform:translateY(.03em) scale(.96) rotate(-2deg)}100%{opacity:1;transform:none}}
@keyframes feierWelle{0%,100%{transform:translateY(0)}50%{transform:translateY(-.12em)}}
@keyframes feierSchein{0%{background-position:100% 0}45%,100%{background-position:0 0}}
@keyframes feierWackel{0%,100%{transform:translate(0,0) rotate(0)}20%{transform:translate(-.5vw,.3vw) rotate(-.6deg)}40%{transform:translate(.5vw,-.3vw) rotate(.6deg)}60%{transform:translate(-.4vw,-.2vw) rotate(-.4deg)}80%{transform:translate(.4vw,.2vw) rotate(.4deg)}}
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
      herzen: schalter(e.herzen, false),
      emojiregen: schalter(e.emojiregen, false),
      wackeln: schalter(e.wackeln, false),
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

/* Emojis aus den Texten für den Emoji-Regen. Ohne Emoji in den Texten: Standard-Emojis. */
const EMOJI_VORGABE = ["🎉", "🏆", "⭐", "💪", "🥳", "🎈"];
function emojisAus(texte) {
  const alle = texte.flatMap((t) => zeichenVon(t)).filter((z) => /\p{Extended_Pictographic}/u.test(z));
  return alle.length ? alle : EMOJI_VORGABE;
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

/* Ob die Feier auf diesem Gerät gezeigt wird. Jede Person schaltet sie in den Einstellungen der Leiste aus;
   das merkt sich das Gerät ("hkh-animation-aus"). Die Arbeitsplan-Seite fragt das ab, die Vorschau nicht. */
export function feierAnzeigen() {
  try { return localStorage.getItem("hkh-animation-aus") !== "1"; } catch (e) { return true; }
}

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
  let herzenListe = [], emojiListe = [], letzteHerz = 0, letzteEmoji = 0, emojiVorrat = [];
  let konfettiStoss = 0, konfettiRest = 0;

  function groesse() {
    w = el.clientWidth;
    h = el.clientHeight;
    maas = Math.max(0.8, Math.min(2.4, Math.min(w, h) / 400));
    /* Das Konfetti braucht keine volle Schärfe. Mit 1,5 ist die Leinwand deutlich leichter als bei 2. */
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
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

  /* Konfetti: Zwei Kanonen unten in den Ecken schießen quer über den Bildschirm bis in die
     Mitte, dazu fällt von oben über die ganze Breite ein Regen. Alle Teile fallen gleich
     schnell, und der Fall ist ein Anteil der Bildschirmhöhe, damit sie lange sichtbar bleiben. */
  function konfettiTeil(x, y, vx, vy, leben) {
    teile.push({
      typ: "k", x, y, vx, vy,
      bw: zufall(6, 10) * maas, bh: zufall(3.5, 6) * maas,
      rot: zufall(0, 6.28), vr: zufall(-6, 6), flip: zufall(0, 6.28), vf: zufall(4, 9),
      farbe: PAL[Math.floor(Math.random() * PAL.length)], alt: 0, leben,
    });
  }

  function konfettiKanone(n, tief) {
    for (let k = 0; k < n; k++) {
      const links = k % 2 === 0;
      const x0 = links ? -4 : w + 4, y0 = h + 4;
      const zx = links ? zufall(0.08, 0.85) * w : zufall(0.15, 0.92) * w;
      const zy = tief ? zufall(0.5, 0.9) * h : zufall(0.08, 0.55) * h;
      konfettiTeil(x0, y0, (zx - x0) * KONF_REIBUNG * 1.1, (zy - y0) * KONF_REIBUNG * 1.45, zufall(4.6, 5.6));
    }
  }

  function konfettiRegenNeu() {
    konfettiTeil(zufall(0, 1) * w, -12 * maas, zufall(-18, 18) * maas, zufall(30, 80) * maas, zufall(4.2, 5.4));
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
      r: zufall(1.2, 2.2) * maas, farbe: Math.random() < 0.5 ? "#ffb000" : "#fff3d6", alt: 0, leben: zufall(3.5, 5.5),
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

  function herzNeu() {
    herzenListe.push({
      x: zufall(0.06, 0.94) * w, y: h + 24, vy: zufall(90, 160) * maas, sw: zufall(0, 6.28),
      s: zufall(9, 16) * maas, farbe: Math.random() < 0.6 ? "#ff4f8b" : "#ffb3d1", alt: 0, leben: zufall(3.8, 5),
    });
  }

  function herzZeichnen(x, y, s, farbe, a) {
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = farbe;
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.35);
    ctx.bezierCurveTo(x - s, y - s * 0.35, x - s * 0.5, y - s * 1.1, x, y - s * 0.45);
    ctx.bezierCurveTo(x + s * 0.5, y - s * 1.1, x + s, y - s * 0.35, x, y + s * 0.35);
    ctx.fill();
    ctx.restore();
  }

  function emojiNeu() {
    emojiListe.push({
      x: zufall(0.05, 0.95) * w, y: -36, vy: zufall(110, 190) * maas, sw: zufall(0, 6.28),
      gross: zufall(22, 36) * maas, zeichen: emojiVorrat[Math.floor(Math.random() * emojiVorrat.length)],
      alt: 0, leben: zufall(3.6, 4.8),
    });
  }

  function schleife(jetzt) {
    if (fertig) return;
    const t = jetzt - t0;
    const dt = Math.max(0, Math.min(0.05, (jetzt - letzt) / 1000));
    letzt = jetzt;
    ctx.clearRect(0, 0, w, h);

    while (raketenPlan.length && raketenPlan[0].start <= t) raketen.push(raketenPlan.shift());
    if (effekte.sterne && !ruhig && t < 4300 && jetzt - letzteFunke > 45) { funkeNeu(); letzteFunke = jetzt; }
    if (effekte.herzen && !ruhig && t < 4600 && jetzt - letzteHerz > 150) { herzNeu(); letzteHerz = jetzt; }
    if (effekte.emojiregen && !ruhig && t < 4600 && jetzt - letzteEmoji > 170) { emojiNeu(); letzteEmoji = jetzt; }
    if (effekte.konfetti && !ruhig) {
      while (konfettiStoss < KONF_STOSS.length && t >= KONF_STOSS[konfettiStoss].t) { konfettiKanone(60, KONF_STOSS[konfettiStoss].tief); konfettiStoss++; }
      if (t < KONF_REGEN_ENDE) {
        konfettiRest += dt * KONF_REGEN_PRO_S * Math.min(3, Math.max(0.6, (w * h) / 329000));
        while (konfettiRest >= 1) { konfettiRegenNeu(); konfettiRest -= 1; }
      }
    }

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
      const k = p.typ === "k" ? KONF_REIBUNG : 2.4;
      p.vy += (p.typ === "k" ? KONF_REIBUNG * KONF_FALL * h : 160) * dt;
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

    herzenListe = herzenListe.filter((p) => {
      p.alt += dt;
      if (p.alt >= p.leben || p.y < -2 * p.s) return false;
      p.y -= p.vy * dt;
      p.x += Math.sin(p.alt * 2.2 + p.sw) * 26 * dt;
      herzZeichnen(p.x, p.y, p.s, p.farbe, Math.min(1, (p.leben - p.alt) / 0.8));
      return true;
    });

    emojiListe = emojiListe.filter((p) => {
      p.alt += dt;
      if (p.alt >= p.leben || p.y > h + 40) return false;
      p.y += p.vy * dt;
      p.x += Math.sin(p.alt * 1.6 + p.sw) * 18 * dt;
      ctx.save();
      ctx.globalAlpha = Math.min(1, (p.leben - p.alt) / 0.7);
      ctx.font = `${p.gross}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(p.zeichen, p.x, p.y);
      ctx.restore();
      return true;
    });

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
      if (effekte.emojiregen) emojiVorrat = emojisAus(konfig.texte);
      if (effekte.wackeln) el.classList.add("wackeln");
    }
    rAF = requestAnimationFrame(schleife);
    zeitgeber.push(setTimeout(() => el.classList.add("raus"), dauer - 900));
    zeitgeber.push(setTimeout(stoppe, dauer));
  });

  return stoppe;
}
