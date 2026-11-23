/* Nächtliche Sicherung der Datenbank.
 *
 * Läuft als GitHub-Zeitplan, nicht im Browser. Angemeldet wird genauso wie auf
 * der Seite: anonym, dann der Admin-Code in den eigenen Geräteeintrag. Damit
 * braucht es keinen gesonderten Dienstschlüssel. Der Admin-Code steht als
 * GitHub-Secret ADMIN_CODE bereit und niemals in einer Datei.
 *
 * Gesichert werden Hallenreinigung, Arbeitsplan und Sportanlagen. Es bleiben
 * die sieben neuesten Stände.
 */
import { readFileSync } from "node:fs";

const BEREICHE = ["putzplan", "arbeitsplan", "matten", "dienstplan"];
const BEHALTEN = 7;

const code = process.env.ADMIN_CODE;
if (!code) {
  console.error("ADMIN_CODE fehlt. In den Einstellungen des Repos unter Secrets hinterlegen.");
  process.exit(1);
}

/* Schlüssel und Adresse stehen in js/config.js und sind nicht geheim. */
const quelle = readFileSync(new URL("../../js/config.js", import.meta.url), "utf8");
const hole = (name) => {
  const treffer = quelle.match(new RegExp(name + ':\\s*"([^"]+)"'));
  if (!treffer) throw new Error("In js/config.js fehlt " + name);
  return treffer[1];
};
const apiKey = hole("apiKey");
const dbUrl = hole("databaseURL").replace(/\/$/, "");

const heute = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Berlin" }).format(new Date());

async function json(url, optionen) {
  const antwort = await fetch(url, optionen);
  const text = await antwort.text();
  if (!antwort.ok) throw new Error(`${antwort.status} bei ${url.split("?")[0]}: ${text.slice(0, 200)}`);
  return text ? JSON.parse(text) : null;
}
const pfad = (p, token) => `${dbUrl}/${p}.json?auth=${encodeURIComponent(token)}`;

/* 1. Anonym anmelden */
const anmeldung = await json(
  `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
  { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ returnSecureToken: true }) },
);
const token = anmeldung.idToken;
const uid = anmeldung.localId;
console.log("Angemeldet als Gerät", uid);

try {
  /* 2. Mit dem Admin-Code freischalten. Die Datenbank prüft ihn. */
  await json(pfad(`geraete/${uid}`, token), {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ code, seit: Date.now() }),
  });

  /* 3. Gibt es für heute schon eine Sicherung? Der Zeitplan läuft zweimal,
        damit er Sommer wie Winter nahe Mitternacht nach Berliner Zeit greift. */
  const vorhanden = (await json(pfad("sicherungen", token), { method: "GET" })) ?? {};
  if (vorhanden[heute]) {
    console.log("Für", heute, "gibt es schon eine Sicherung. Nichts zu tun.");
  } else {
    /* 4. Daten holen */
    const daten = {};
    for (const bereich of BEREICHE) {
      daten[bereich] = await json(pfad(bereich, token), { method: "GET" });
      console.log("gelesen:", bereich);
    }
    const groesse = JSON.stringify(daten).length;
    await json(pfad(`sicherungen/${heute}`, token), {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ erstellt: Date.now(), groesse, daten }),
    });
    console.log("Sicherung", heute, "abgelegt,", Math.round(groesse / 1024), "KB");

    /* 5. Ältere wegwerfen */
    const alle = Object.keys({ ...vorhanden, [heute]: true }).sort().reverse();
    for (const tag of alle.slice(BEHALTEN)) {
      await json(pfad(`sicherungen/${tag}`, token), { method: "DELETE" });
      console.log("alte Sicherung entfernt:", tag);
    }
  }
} finally {
  /* 6. Den Geräteeintrag wieder aufräumen */
  await json(pfad(`geraete/${uid}`, token), { method: "DELETE" }).catch(() => {});
}
console.log("Fertig.");
