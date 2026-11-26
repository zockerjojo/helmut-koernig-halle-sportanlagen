/* Lädt die normale Seite (Dienstplan, Arbeitsplan oder Reinigungsplan) in die Tablet-Hülle.
   Ohne Anmeldung gibt es nur das Ansehen. Mit einer Anmeldung gelten die Rechte der Person.
   Ist das Tablet nicht freigeschaltet, geht es zur Freischaltung. */
(async function () {
  var SEITEN = { Dienstplan: 1, Arbeitsplan: 1, Reinigungsplan: 1 };
  var name = location.pathname.replace(/\.html$/, "").split("/").filter(Boolean).pop() || "";
  if (!SEITEN[name]) { location.replace("/Tablet/"); return; }
  /* Direkt aufgerufen: in die Tablet-Hülle, damit die Adresse gleich bleibt und das Vollbild hält */
  if (window.top === window) { location.replace("/Tablet/#" + name); return; }
  try {
    var Z = await import("../js/zugang.js?v=1795680287");
    var s = await Z.sitzung();
    if (!s) { location.replace("/Tablet/"); return; }
    var html = await (await fetch("../" + name + ".html", { cache: "no-cache" })).text();
    /* Die Hülle gilt für jede Seite. Nur ohne Anmeldung kommt der Nur-Ansehen-Schutz dazu. */
    var kopf = '<base href="../"><script src="/Tablet/huelle.js?v=1795680287"><\/script>'
      + (s.tablett ? '<script src="/Tablet/schutz.js?v=1795680287"><\/script>' : "");
    html = html.replace(/<head>/i, "<head>" + kopf);
    document.open();
    document.write(html);
    document.close();
  } catch (err) {
    console.error(err);
    document.body.innerHTML = '<p style="font:18px system-ui;padding:24px">Keine Verbindung. Die Seite lädt in einer Minute neu.</p>';
    setTimeout(function () { location.reload(); }, 60000);
  }
})();
