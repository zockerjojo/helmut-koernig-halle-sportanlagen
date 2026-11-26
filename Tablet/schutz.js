/* Personal-Tablet im Nur-Ansehen: wird zusätzlich zu huelle.js eingebunden, wenn niemand angemeldet ist.
   Blendet alles zum Bearbeiten aus und schaltet Fenster und Drucken ab. Die Datenbank erlaubt dem Tablett
   ohnehin nur das Lesen. Mit einer Anmeldung fehlt diese Datei, dann gelten die Rechte der Person. */
(function () {
  window.HKH_TABLETT = true;
  document.documentElement.classList.add("tablett");

  var stil = document.createElement("style");
  stil.textContent = [
    /* Schrift auf dem Tablet zwei Stufen größer (alle Seiten) */
    "html.tablett{--schrift-plus:2px}",
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
    "html.tablett .wrap:has(#listen-tafel) > .kopf, html.tablett #live-text, html.tablett #karten-hinweis { display:none !important }",
    "html.tablett #panel:has(#listen-tafel):not([hidden]) { display:grid !important; grid-template-columns:minmax(0,1fr) minmax(340px,32%); grid-template-rows:auto auto minmax(0,1.25fr) minmax(0,1fr) auto; column-gap:12px; row-gap:10px; height:calc(100vh - 24px); padding-top:0 !important; margin:0 !important }",
    /* Überschriften auf dem Tablet wie beim Dienstplan ("Dienstplan HKH") */
    "html.tablett #panel:has(#listen-tafel) > h1, html.tablett #app .top h1 { font-family:Barlow, system-ui, -apple-system, 'Segoe UI', sans-serif !important; font-weight:500 !important; font-size:calc(28px + var(--schrift-plus,0px)) !important; line-height:1.15 !important; text-transform:none !important; letter-spacing:0 !important }",
    "html.tablett #panel:has(#listen-tafel) > h1 { grid-column:1 / -1; grid-row:1 }",
    /* Reinigungsplan: Logo und Hallenname unter der Leiste weg */
    "html.tablett #app .top .brand .hkh-kopf { display:none !important }",
    "html.tablett #panel:has(#listen-tafel) > * { margin:0 !important }",
    "html.tablett #panel > #map { grid-column:1; grid-row:2 / span 4; position:relative !important; top:auto !important; height:100% !important; max-height:none !important; aspect-ratio:auto !important; min-height:0 }",
    "html.tablett #panel > #tafel { grid-column:2; grid-row:2; max-height:45vh; overflow:auto }",
    "html.tablett #panel > #listen-tafel { grid-column:2; grid-row:3; max-height:none !important; height:100%; overflow:auto !important }",
    /* Erledigte und gelöschte Aufgaben stehen darunter, die Karte links geht über die ganze Höhe */
    "html.tablett #panel > #erledigt-tafel { grid-column:2; grid-row:4; max-height:none !important; height:100%; overflow:auto !important; position:static !important }",
    "html.tablett #panel > #geloescht-tafel { grid-column:2; grid-row:5; max-height:22vh !important; overflow:auto !important; position:static !important }",
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

  /* Keine neuen Fenster und kein Drucken */
  window.open = function () { return null; };
  window.print = function () {};
})();
