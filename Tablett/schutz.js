/* Pausenraum-Tablett: wird in jede Tablett-Seite eingebunden.
   Blendet alles zum Bearbeiten aus, hält Links auf den Tablett-Seiten,
   hält den Bildschirm wach und lädt nachts einmal neu. Die Datenbank erlaubt
   dem Tablett ohnehin nur das Lesen. */
(function () {
  window.HKH_TABLETT = true;
  document.documentElement.classList.add("tablett");

  var stil = document.createElement("style");
  stil.textContent = [
    /* Aufgaben und Arbeitsplan */
    "html.tablett #w-aufgabe, html.tablett #w-pfeil, html.tablett #d-bearbeiten, html.tablett #d-erledigt,",
    "html.tablett #d-loeschen, html.tablett #d-rueckfrage, html.tablett .leiste[aria-label=\"Werkzeug\"], html.tablett .feld:has(#ich-wahl) { display:none !important }",
    /* Reinigungsplan */
    "html.tablett .ctl .who, html.tablett #art-sl, html.tablett #dir-sw, html.tablett .ctl .seg,",
    "html.tablett #open-reset, html.tablett #undo, html.tablett #redo, html.tablett #note-list button { display:none !important }",
    "html.tablett #live { pointer-events:none }",
    /* Dienstplan */
    "html.tablett #modus, html.tablett #anlegen, html.tablett #speicher-leiste { display:none !important }",
  ].join("\n");
  document.head.appendChild(stil);

  /* Links: nur die Tablett-Seiten. Die normalen Seiten werden auf ihre Tablett-Fassung umgelenkt. */
  var ERLAUBT = { "Dienstplan": 1, "Arbeitsplan": 1, "Reinigungsplan": 1 };
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a || a.hasAttribute("download") || /^(blob:|data:)/.test(a.href)) return;
    var u;
    try { u = new URL(a.href, location.href); } catch (x) { e.preventDefault(); return; }
    if (u.origin !== location.origin) { e.preventDefault(); return; }
    var teile = u.pathname.replace(/\.html$/, "").split("/").filter(Boolean);
    var name = teile[teile.length - 1] || "";
    e.preventDefault();
    if (ERLAUBT[name]) location.href = "/Tablett/" + name;
    else location.href = "/Tablett/";
  }, true);

  /* Bildschirm wach halten, solange die Seite sichtbar ist */
  var sperre = null;
  function wach() {
    if (!("wakeLock" in navigator) || document.visibilityState !== "visible") return;
    navigator.wakeLock.request("screen").then(function (s) { sperre = s; }).catch(function () {});
  }
  document.addEventListener("visibilitychange", wach);
  document.addEventListener("pointerdown", function () { if (!sperre || sperre.released) wach(); }, { passive: true });
  wach();

  /* Nachts um 3 Uhr einmal neu laden: neuer Monat, neue Seitenversion */
  var start = Date.now();
  setInterval(function () {
    var d = new Date();
    if (d.getHours() === 3 && Date.now() - start > 2 * 3600 * 1000) location.reload();
  }, 60 * 1000);
})();
