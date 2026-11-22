// Push-Nachrichten für die Startseite: Glocke an = dieses Gerät bekommt eine Nachricht,
// wenn sich der Aushang oder eine Anlage ändert. Die Nachricht verschickt eine Firebase-Funktion
// (functions/index.js). Hier wird nur der Empfangsschlüssel dieses Geräts an- oder abgemeldet.
import { getApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, set, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const MESSAGING = "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js";
// Öffentlicher Web-Push-Schlüssel aus Firebase (Projekteinstellungen → Cloud Messaging). Nicht geheim.
const VAPID = "BL3anlooxv2kaspH5-YAXOwpeeEjNBoqYcSZ9y5Qro_2u7x32DgdNK1ICOCYfojMZniBGHSqggbrlMEnx7ZXf3w";
const MERKER = "hkh-push";

const merkerLesen = () => { try { return localStorage.getItem(MERKER) || ""; } catch (e) { return ""; } };
const merkerSetzen = (t) => { try { t ? localStorage.setItem(MERKER, t) : localStorage.removeItem(MERKER); } catch (e) {} };

/* iPhone und iPad können Push nur, wenn die Seite zum Home-Bildschirm hinzugefügt wurde und von dort geöffnet wird. */
export const istApple = () => /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
export const alsAppGeoeffnet = () => window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;

export async function unterstuetzt() {
  if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) return false;
  try { return await (await import(MESSAGING)).isSupported(); } catch (e) { return false; }
}

export const istAn = () => !!merkerLesen() && "Notification" in window && Notification.permission === "granted";

async function schluesselHolen() {
  const reg = await navigator.serviceWorker.register("./firebase-messaging-sw.js", { scope: "./" });
  await navigator.serviceWorker.ready;
  const m = await import(MESSAGING);
  return m.getToken(m.getMessaging(getApp()), { vapidKey: VAPID, serviceWorkerRegistration: reg });
}

/* Fragt nach der Erlaubnis und meldet das Gerät an. Wirft "verweigert", wenn der Browser es nicht erlaubt. */
export async function einschalten() {
  const erlaubnis = await Notification.requestPermission();
  if (erlaubnis !== "granted") throw Object.assign(new Error("verweigert"), { code: "verweigert" });
  const token = await schluesselHolen();
  if (!token) throw new Error("kein Schlüssel");
  await set(ref(getDatabase(getApp()), `push/abos/${token}`), { ts: Date.now() });
  merkerSetzen(token);
}

export async function ausschalten() {
  const token = merkerLesen();
  merkerSetzen("");
  if (token) { try { await remove(ref(getDatabase(getApp()), `push/abos/${token}`)); } catch (e) { console.error(e); } }
  try { const m = await import(MESSAGING); await m.deleteToken(m.getMessaging(getApp())); } catch (e) { console.error(e); }
}

/* Beim Öffnen: Ist die Glocke an, wird der Schlüssel aufgefrischt (er kann sich mit der Zeit ändern). */
export async function auffrischen() {
  if (!istAn()) return;
  try {
    const alt = merkerLesen();
    const token = await schluesselHolen();
    if (!token) return;
    const db = getDatabase(getApp());
    await set(ref(db, `push/abos/${token}`), { ts: Date.now() });
    if (alt && alt !== token) { try { await remove(ref(db, `push/abos/${alt}`)); } catch (e) {} }
    merkerSetzen(token);
  } catch (e) { console.error(e); }
}
