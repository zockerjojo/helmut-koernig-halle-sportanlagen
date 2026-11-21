// Zugang für das Personal. Angemeldet wird allein mit dem persönlichen Code.
// Name, Farbe und Rechte stehen beim Benutzer in der Datenbank und werden nach
// der Anmeldung von dort geholt. Die Codes selbst stehen nur in der Datenbank,
// nie in diesen Dateien.
//
// Warum das Durchprobieren: Das Gerät muss der Datenbank sagen, wessen Code es
// eingibt, denn die Datenbank kann nicht suchen. Öffentlich lesbar sind darum
// nur die nackten Kennungen der Benutzer, ohne Namen, Farben oder Codes. Das
// Gerät probiert sie durch; angenommen wird ein Eintrag nur, wenn der Code
// wirklich zu dieser Kennung gehört. Das entscheidet die Datenbank, nicht diese
// Datei.
import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, get, set, update, onValue, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { firebaseConfig } from "./config.js";

// Die öffentliche Anzeige hat die Verbindung oft schon aufgebaut. Dann wird dieselbe weiterbenutzt.
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export { ref, get, set, update, onValue, remove };

export const istRechteFehler = (err) => /permission[_ ]denied/i.test(`${err?.code ?? ""} ${err?.message ?? ""}`);

/* Die Bereiche, für die es ein Recht gibt. Der Schlüssel steht so auch in der Datenbank. */
export const BEREICHE = [
  { id: "reinigung", name: "Hallenreinigung", seite: "./Reinigungsplan", zusatz: "Gereinigte Bereiche eintragen und einsehen" },
  { id: "sportanlagen", name: "Sportanlagen", seite: "./Sportanlagen", zusatz: "Status der Anlagen und der Tribüne einstellen" },
  { id: "arbeitsplan", name: "Hallen Arbeitsplan", seite: "./Arbeitsplan", zusatz: "Aufgaben und Pfeile auf dem Hallenplan" },
  { id: "admin", name: "Admin Panel", seite: "./Adminpanel", zusatz: "Benutzer, Codes, Rechte und Sicherungen" },
];

/* Feinere Rechte innerhalb eines Bereichs. Sie stehen beim Benutzer unter
   rechte.<bereich>_tun und gelten nur, wenn der Bereich selbst erlaubt ist.
   "vertreten" ändert nie, was jemand darf, sondern nur, für wen eingetragen wird. */
export const ZUSATZRECHTE = {
  reinigung: [
    { id: "vertreten", name: "Für andere Mitarbeiter eintragen", zusatz: "Kann umstellen, für wen gewischt wird. Die eigenen Rechte bleiben gleich." },
    { id: "uebermalen", name: "Fremde Farben übermalen", zusatz: "Darf Flächen anderer übermalen und wegradieren, auch alles zurücksetzen." },
  ],
  sportanlagen: [
    { id: "aushang", name: "Aushang bearbeiten", zusatz: "Text „Aushang am Sportlereingang“ auf der Startseite" },
  ],
  arbeitsplan: [
    { id: "prio", name: "Priorität ändern", zusatz: "Darf die Reihenfolge in „Alle Aufgaben“ umstellen." },
    { id: "vertreten", name: "Für andere Mitarbeiter eintragen", zusatz: "Kann umstellen, für wen Aufgaben angelegt werden." },
  ],
};

/* Die Rechte innerhalb des Arbeitsplans. Die eigenen Aufgaben darf jeder abhaken,
   dafür gibt es darum kein Recht. */
export const AP_RECHTE = [
  "erstellen",
  "bearbeitenEigene", "verschiebenEigene", "loeschenEigene",
  "bearbeitenFremde", "verschiebenFremde", "loeschenFremde", "erledigenFremde",
  "prio", "vertreten",
];

const ALLES_ERLAUBT = {
  reinigung: true, sportanlagen: true, arbeitsplan: true, admin: true,
  reinigung_tun: { vertreten: true, uebermalen: true },
  sportanlagen_tun: { aushang: true },
  arbeitsplan_tun: Object.fromEntries(AP_RECHTE.map((r) => [r, true])),
};

/* Merkzeichen für die Startseite: Nur wenn es gesetzt ist, lädt sie die Anmeldung
   nach und blendet die Personal-Leiste ein. Für Sportler bleibt die Seite schlank. */
const MERKER = "hkh-personal";
const merken = (an) => { try { an ? localStorage.setItem(MERKER, "1") : localStorage.removeItem(MERKER); } catch (e) {} };
export const vielleichtAngemeldet = () => { try { return localStorage.getItem(MERKER) === "1"; } catch (e) { return false; } };

/* Wartet, bis feststeht, ob auf diesem Gerät schon jemand angemeldet ist */
function ersterNutzer() {
  return new Promise((fertig) => {
    let stopp = null;
    let erledigt = false;
    const melde = (user) => {
      if (erledigt) return;
      erledigt = true;
      if (stopp) stopp();
      fertig(user ?? null);
    };
    stopp = onAuthStateChanged(auth, melde, () => melde(null));
    if (erledigt) stopp();
  });
}

/* Die angemeldete Person, oder null. Enthält Name, Farbe und Rechte. */
export async function sitzung() {
  const user = await ersterNutzer();
  if (!user) return null;
  let eintrag = null;
  try {
    eintrag = (await get(ref(db, `geraete/${user.uid}`))).val();
  } catch (err) {
    if (istRechteFehler(err)) return null;
    throw err;
  }
  if (!eintrag) return null;
  const bid = eintrag.benutzer || "";
  if (!bid) {
    // Mit dem Admin-Code angemeldet: kein eigener Benutzereintrag, alles erlaubt.
    merken(true);
    return { uid: user.uid, bid: "", istAdmin: true, name: "Admin", farbe: "#17694B", rechte: ALLES_ERLAUBT };
  }
  let b = null;
  try {
    b = (await get(ref(db, `benutzer/${bid}`))).val();
  } catch (err) {
    if (istRechteFehler(err)) return null;   // abgemeldet oder gesperrt
    throw err;
  }
  if (!b || b.gesperrt === true) return null;
  const rechte = b.rechte ?? {};
  merken(true);
  return {
    uid: user.uid,
    bid,
    istAdmin: rechte.admin === true,
    name: b.name ?? "",
    farbe: b.farbe ?? "#55635C",
    rechte: { ...rechte, arbeitsplan_tun: rechte.arbeitsplan_tun ?? {}, reinigung_tun: rechte.reinigung_tun ?? {}, sportanlagen_tun: rechte.sportanlagen_tun ?? {} },
  };
}

/* Darf die angemeldete Person diesen Bereich sehen? */
export function darf(s, bereich) {
  return !!s && (s.istAdmin || s.rechte?.[bereich] === true);
}

/* Ein feineres Recht innerhalb eines Bereichs, z. B. darfZusatz(s, "reinigung", "uebermalen"). */
export function darfZusatz(s, bereich, recht) {
  if (!s) return false;
  if (s.istAdmin) return true;
  return s.rechte?.[bereich] === true && s.rechte?.[bereich + "_tun"]?.[recht] === true;
}

/* Darf sie in diesem Bereich einstellen, für wen eingetragen wird? Ändert keine Rechte. */
export function darfVertreten(s, bereich) {
  return darfZusatz(s, bereich, "vertreten");
}

/* Darf sie das im Arbeitsplan? eigen sagt, ob es die eigene Aufgabe ist. */
export function darfAufgabe(s, was, eigen) {
  if (!s) return false;
  if (s.istAdmin) return true;
  if (s.rechte?.arbeitsplan !== true) return false;
  const t = s.rechte?.arbeitsplan_tun ?? {};
  if (was === "erstellen") return t.erstellen === true;
  if (was === "erledigen") return eigen ? true : t.erledigenFremde === true;
  if (was === "prio") return t.prio === true;
  const schl = { bearbeiten: "bearbeiten", verschieben: "verschieben", loeschen: "loeschen" }[was];
  if (!schl) return false;
  return t[schl + (eigen ? "Eigene" : "Fremde")] === true;
}

/* Meldet dieses Gerät mit dem Code an. Wirft einen Fehler, wenn der Code nicht passt. */
export async function anmelden(code) {
  const { user } = await signInAnonymously(auth);
  const jetzt = Date.now();

  // Erst der Admin-Code: dafür braucht es keine Kennung.
  try {
    await set(ref(db, `geraete/${user.uid}`), { code, seit: jetzt });
    return { bid: "", istAdmin: true };
  } catch (err) {
    if (!istRechteFehler(err)) throw err;
  }

  // Sonst die Kennungen durchprobieren. Angenommen wird höchstens eine.
  let kennungen = [];
  try {
    const snap = await get(ref(db, "kennungen"));
    snap.forEach((k) => { kennungen.push(k.key); });
  } catch (err) {
    if (!istRechteFehler(err)) throw err;
  }
  for (const bid of kennungen) {
    try {
      await set(ref(db, `geraete/${user.uid}`), { benutzer: bid, code, seit: jetzt });
      const s = await sitzung();
      return { bid, istAdmin: !!s?.istAdmin };
    } catch (err) {
      if (!istRechteFehler(err)) throw err;
    }
  }
  await signOut(auth).catch(() => {});
  const fehler = new Error("PERMISSION_DENIED");
  fehler.code = "PERMISSION_DENIED";
  throw fehler;
}

export async function abmelden() {
  merken(false);
  const user = auth.currentUser;
  if (user) {
    // Den Geräteeintrag mitnehmen, damit er nicht liegen bleibt.
    await remove(ref(db, `geraete/${user.uid}`)).catch(() => {});
  }
  return signOut(auth);
}

/* Name und Farbe aller Benutzer. Setzt eine Anmeldung voraus; die vollen
   Benutzerdaten samt Codes bleiben den Admins vorbehalten. */
export async function namen() {
  try {
    return (await get(ref(db, "namen"))).val() ?? {};
  } catch (err) {
    if (istRechteFehler(err)) return {};
    throw err;
  }
}

/* Alte Schreibweise, die die bestehenden Seiten noch benutzen */
export async function istFreigeschaltet() {
  return (await sitzung()) !== null;
}

export function anmeldeFehler(err) {
  if (istRechteFehler(err)) return "Der Code stimmt nicht.";
  switch (err?.code) {
    case "auth/network-request-failed":
      return "Keine Verbindung zum Server.";
    case "auth/too-many-requests":
      return "Zu viele Versuche. Bitte warte einen Moment.";
    default:
      return "Anmeldung hat nicht geklappt. Bitte noch einmal versuchen.";
  }
}
