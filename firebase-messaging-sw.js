// Service Worker für Push-Nachrichten der Startseite (Firebase Cloud Messaging).
// Er zeigt Nachrichten an, wenn die Seite geschlossen oder im Hintergrund ist.
// Ein Tippen auf die Nachricht öffnet die Startseite.
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js",
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js"
);
firebase.initializeApp({
  apiKey: "AIzaSyAJI5JxxeknmKb8TE_kXYO3yi0x87Rt2vc",
  authDomain: "koernig-halle-sportanlagen.firebaseapp.com",
  databaseURL: "https://koernig-halle-sportanlagen-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "koernig-halle-sportanlagen",
  storageBucket: "koernig-halle-sportanlagen.firebasestorage.app",
  messagingSenderId: "593209093596",
  appId: "1:593209093596:web:5d91db9853bdf658d57319",
});
firebase.messaging();
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
