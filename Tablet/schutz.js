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
    /* Aufgaben und Arbeitsplan: nur ansehen, Karte groß, darunter alle Aufgaben */
    "html.tablett #w-aufgabe, html.tablett #w-pfeil, html.tablett #d-bearbeiten, html.tablett #d-erledigt,",
    "html.tablett #d-loeschen, html.tablett #d-rueckfrage, html.tablett .leiste[aria-label=\"Werkzeug\"], html.tablett .feld:has(#ich-wahl) { display:none !important }",
    "html.tablett .wrap { max-width:none !important }",
    "html.tablett #panel { display:block !important }",
    "html.tablett #panel > #map { position:relative !important; top:auto !important; max-height:none !important; aspect-ratio:auto !important; height:calc(100vh - 110px) !important; min-height:420px }",
    "html.tablett #panel > #listen-tafel { max-height:none !important; overflow:visible !important; margin-top:16px }",
    "html.tablett #panel > #tafel, html.tablett #panel > #filter-tafel { margin-top:12px }",
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
