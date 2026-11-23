/* Pausenraum-Tablet: wird in jede Seite eingebunden, die in der Tablet-Hülle (/Tablet/) läuft.
   Blendet alles zum Bearbeiten aus, gibt Antippen an die Hülle weiter (Vollbild, Bildschirm wach)
   und hält Links innerhalb der Hülle. Die Datenbank erlaubt dem Tablet ohnehin nur das Lesen. */
(function () {
  window.HKH_TABLETT = true;
  document.documentElement.classList.add("tablett");
  var huelle = null;
  try { if (window.parent !== window && window.parent.hkhSeite) huelle = window.parent; } catch (x) {}

  var stil = document.createElement("style");
  stil.textContent = [
    /* überall: keine Personal-Leiste, Logo ohne Link-Gefühl */
    "html.tablett .hkh-leiste { display:none !important }",
    "html.tablett body { padding-bottom:16px !important }",
    "html.tablett body:has(#listen-tafel) { padding:0 !important }",
    /* Aufgaben und Arbeitsplan: nur ansehen, Karte groß, darunter alle Aufgaben */
    "html.tablett #w-aufgabe, html.tablett #w-pfeil, html.tablett #d-bearbeiten, html.tablett #d-erledigt,",
    "html.tablett #d-loeschen, html.tablett #d-rueckfrage, html.tablett .leiste[aria-label=\"Werkzeug\"], html.tablett .feld:has(#ich-wahl) { display:none !important }",
    /* Aufgaben und Arbeitsplan: Plan links, Aufgaben rechts, beide über die ganze Höhe */
    "html.tablett body:has(#listen-tafel) { overflow:hidden }",
    "html.tablett .wrap:has(#listen-tafel) { max-width:none !important; padding:12px !important }",
    "html.tablett .wrap:has(#listen-tafel) > .kopf, html.tablett #panel:has(#listen-tafel) > h1, html.tablett #live-text, html.tablett #karten-hinweis { display:none !important }",
    "html.tablett #panel:has(#listen-tafel):not([hidden]) { display:grid !important; grid-template-columns:minmax(0,1fr) minmax(340px,32%); grid-template-rows:auto minmax(0,1fr); column-gap:12px; row-gap:12px; height:calc(100vh - 24px); padding-top:0 !important; margin:0 !important }",
    "html.tablett #panel:has(#listen-tafel) > * { margin:0 !important }",
    "html.tablett #panel > #map { grid-column:1; grid-row:1 / span 2; position:relative !important; top:auto !important; height:100% !important; max-height:none !important; aspect-ratio:auto !important; min-height:0 }",
    "html.tablett #panel > #tafel { grid-column:2; grid-row:1; max-height:45vh; overflow:auto }",
    "html.tablett #panel > #listen-tafel { grid-column:2; grid-row:2; max-height:none !important; height:100%; overflow:auto !important }",
    "html.tablett #panel > #filter-tafel { display:none !important }",
    /* Reinigungsplan */
    "html.tablett .ctl .who, html.tablett #art-sl, html.tablett #dir-sw, html.tablett .ctl .seg,",
    "html.tablett #open-reset, html.tablett #undo, html.tablett #redo, html.tablett #note-list button { display:none !important }",
    "html.tablett #live { pointer-events:none }",
    /* nichts herunterladen, drucken oder ins eigene Vollbild schalten */
    "html.tablett #btn-bild, html.tablett #z-full, html.tablett #drucken { display:none !important }",
    "html.tablett [data-datei] { pointer-events:none !important }",
    /* Dienstplan */
    "html.tablett #modus, html.tablett #anlegen, html.tablett #speicher-leiste { display:none !important }",
  ].join("\n");
  document.head.appendChild(stil);

  /* Antippen: Vollbild und Wachhalten gehören zur Hülle */
  document.addEventListener("pointerdown", function () {
    if (!huelle) return;
    try { huelle.hkhVollbild && huelle.hkhVollbild(); huelle.hkhWach && huelle.hkhWach(); } catch (x) {}
  }, true);

  /* Keine neuen Fenster und kein Drucken */
  window.open = function () { return null; };
  window.print = function () {};

  /* Links: nur die drei Seiten, und zwar innerhalb der Hülle. Alles andere bleibt stehen,
     auch Downloads (Anhänge, Bilder vom Plan). */
  var ERLAUBT = { "Dienstplan": 1, "Arbeitsplan": 1, "Reinigungsplan": 1 };
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    e.preventDefault();
    if (a.hasAttribute("download") || /^(blob:|data:)/.test(a.href)) return;
    var u;
    try { u = new URL(a.href, location.href); } catch (x) { return; }
    if (u.origin !== location.origin) return;
    var name = u.pathname.replace(/\.html$/, "").split("/").filter(Boolean).pop() || "";
    if (ERLAUBT[name] && huelle) huelle.hkhSeite(name);
  }, true);
})();
