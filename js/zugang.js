// Zugang für das Personal: eine Anmeldung für alle Bereiche (Hallenreinigung und Sportanlagen).
// Das Gerät meldet sich anonym an. Die Datenbank prüft den Zugangscode, wenn der Eintrag unter
// admins/<Gerät> gespeichert wird. Der Code selbst steht nur in der Datenbank (zugang/code), nie in diesen Dateien.
import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, get, set, update, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { firebaseConfig } from "./config.js";

// Die Anzeige für Sportler hat die Verbindung schon aufgebaut. Dann wird dieselbe weiterbenutzt.
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export { ref, get, set, update, onValue };

export const istRechteFehler = (err) => /permission[_ ]denied/i.test(`${err?.code ?? ""} ${err?.message ?? ""}`);

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

/* true, wenn dieses Gerät schon mit dem Zugangscode freigeschaltet ist */
export async function istFreigeschaltet() {
  const user = await ersterNutzer();
  if (!user) return false;
  try {
    return (await get(ref(db, `admins/${user.uid}`))).exists();
  } catch (err) {
    if (istRechteFehler(err)) return false;
    throw err;
  }
}

/* Schaltet dieses Gerät frei. Lehnt die Datenbank den Code ab, kommt ein Fehler zurück. */
export async function anmelden(code) {
  const { user } = await signInAnonymously(auth);
  await set(ref(db, `admins/${user.uid}`), code);
}

export function abmelden() {
  return signOut(auth);
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
