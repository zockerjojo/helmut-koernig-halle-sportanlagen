// Firebase-Funktionen für die Push-Nachrichten der Startseite.
// Sie laufen bei Google, sobald sich in der Datenbank der Aushang oder eine Anlage ändert,
// und schicken dann eine Nachricht an alle Geräte, bei denen die Glocke an ist.
// Hochladen: im Ordner der Seite "firebase deploy --only functions" (siehe README.md).
const { onValueWritten } = require("firebase-functions/v2/database");
const { initializeApp } = require("firebase-admin/app");
const { getDatabase } = require("firebase-admin/database");
const { getMessaging } = require("firebase-admin/messaging");

initializeApp();

const ORT = { region: "europe-west1", instance: "koernig-halle-sportanlagen-default-rtdb" };
const SEITE = "https://xn--helmut-krnig-halle-sportanlagen-edd.de/";

/* Schickt eine Nachricht an alle angemeldeten Geräte. Ungültige Schlüssel werden aufgeräumt. */
async function senden(titel, text, tag) {
  const db = getDatabase();
  const abos = (await db.ref("push/abos").get()).val() ?? {};
  const tokens = Object.keys(abos);
  for (let i = 0; i < tokens.length; i += 500) {
    const teil = tokens.slice(i, i + 500);
    const antwort = await getMessaging().sendEachForMulticast({
      tokens: teil,
      webpush: {
        notification: { title: titel, body: text, icon: SEITE + "bilder/symbol-192.png", tag, renotify: true },
        fcmOptions: { link: SEITE },
      },
    });
    const weg = {};
    antwort.responses.forEach((r, j) => {
      const code = r.error?.code ?? "";
      if (!r.success && /registration-token-not-registered|invalid-registration-token|invalid-argument/.test(code)) weg[teil[j]] = null;
    });
    if (Object.keys(weg).length) await db.ref("push/abos").update(weg);
  }
}

/* Aushang am Sportlereingang: nur wenn neuer Text drinsteht (Leeren schickt nichts). */
exports.aushangPush = onValueWritten({ ref: "/aushang/text", ...ORT }, async (e) => {
  const vorher = String(e.data.before.val() ?? "").trim();
  const nachher = String(e.data.after.val() ?? "").trim();
  if (!nachher || nachher === vorher) return;
  const text = nachher.length > 180 ? nachher.slice(0, 177) + " …" : nachher;
  await senden("Aushang am Sportlereingang", text, "aushang");
});

/* Anlagen und Tribüne: gleiche Wörter wie auf der Startseite. */
const ZUSTAENDE = {
  anlage: { aufgebaut: ["Aufgebaut", true], abgebaut: ["Abgebaut", false] },
  tribuene: { eingefahren: ["Eingefahren", true], ausgefahren: ["Ausgefahren", false] },
};
const OHNE_STATUS = { anlage: "abgebaut", tribuene: "ausgefahren" };
const VERBEN = { anlage: { aus: "abgebaut", ein: "wieder aufgebaut" }, tribuene: { aus: "ausgefahren", ein: "eingefahren" } };
const WOCHENTAGE = ["So.", "Mo.", "Di.", "Mi.", "Do.", "Fr.", "Sa."];
const ZEITPUNKT = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/;
const artVon = (m) => (m.art === "tribuene" ? "tribuene" : "anlage");
function zustand(m) {
  const art = artVon(m);
  const tabelle = ZUSTAENDE[art];
  const [text, gruen] = tabelle[Object.prototype.hasOwnProperty.call(tabelle, m.status) ? m.status : OHNE_STATUS[art]];
  return { text, gruen };
}
function satz(zeit, verb) {
  const t = ZEITPUNKT.exec(zeit ?? "");
  if (!t) return "";
  const [, jahr, monat, tag, std, min] = t;
  const wochentag = WOCHENTAGE[new Date(Date.UTC(+jahr, +monat - 1, +tag)).getUTCDay()];
  return `Wird voraussichtlich am ${wochentag}, ${tag}.${monat}.${std ? ` um ${std}:${min} Uhr` : ""} ${verb}.`;
}

exports.anlagePush = onValueWritten({ ref: "/matten/{key}", ...ORT }, async (e) => {
  const vorher = e.data.before.val() ?? {};
  const m = e.data.after.val();
  if (!m || !m.name) return;
  const statusNeu = (vorher.status ?? null) !== (m.status ?? null);
  const terminNeu = (vorher.aus ?? null) !== (m.aus ?? null) || (vorher.ein ?? null) !== (m.ein ?? null);
  if (!statusNeu && !terminNeu) return;
  const z = zustand(m);
  const { aus, ein } = VERBEN[artVon(m)];
  const teile = [z.text + "."];
  if (artVon(m) === "tribuene") teile.push(`110 Meter Sprintgerade ${z.gruen ? "nutzbar" : "nicht nutzbar"}.`);
  const termin = z.gruen ? satz(m.aus, aus) || satz(m.ein, ein) : satz(m.ein, ein) || satz(m.aus, aus);
  if (termin) teile.push(termin);
  await senden(String(m.name).slice(0, 60), teile.join(" "), "anlage-" + e.params.key);
});
