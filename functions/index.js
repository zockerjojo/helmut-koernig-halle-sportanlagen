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
/* Jede Nachricht sieht gleich aus, egal ob Aushang oder Anlage. Eine neue ersetzt die vorige auf dem Handy. */
const TITEL = "Helmut-Körnig-Halle";
const TEXT = "Es gibt Neuigkeiten";

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
  await senden(TITEL, TEXT, "neuigkeiten");
});

/* Anlagen und Tribüne: nur wenn sich Status oder ein Termin wirklich ändert. */
exports.anlagePush = onValueWritten({ ref: "/matten/{key}", ...ORT }, async (e) => {
  const vorher = e.data.before.val() ?? {};
  const m = e.data.after.val();
  if (!m || !m.name) return;
  const statusNeu = (vorher.status ?? null) !== (m.status ?? null);
  const terminNeu = (vorher.aus ?? null) !== (m.aus ?? null) || (vorher.ein ?? null) !== (m.ein ?? null);
  if (!statusNeu && !terminNeu) return;
  await senden(TITEL, TEXT, "neuigkeiten");
});
