/* Lädt die normale Seite (Dienstplan, Arbeitsplan oder Reinigungsplan) als Tablett-Fassung:
   gleicher Inhalt, nur zum Ansehen. Ist das Tablett nicht freigeschaltet, geht es zur Freischaltung. */
(async function () {
  var SEITEN = { Dienstplan: 1, Arbeitsplan: 1, Reinigungsplan: 1 };
  var name = location.pathname.replace(/\.html$/, "").split("/").filter(Boolean).pop() || "";
  if (!SEITEN[name]) { location.replace("/Tablett/"); return; }
  try {
    var Z = await import("../js/zugang.js");
    var s = await Z.sitzung();
    if (!s) { location.replace("/Tablett/"); return; }
    var html = await (await fetch("../" + name + ".html", { cache: "no-cache" })).text();
    var kopf = '<base href="../"><script src="/Tablett/schutz.js"><\/script>';
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
