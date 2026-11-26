/* Tablet-Hülle: wird in jede Seite eingebunden, die in der Hülle (/Tablet/) läuft, mit oder ohne Anmeldung.
   Gibt Antippen und Tastendrücke an die Hülle weiter (Vollbild, Bildschirm wach, Zeit bis zur Abmeldung)
   und hält Links innerhalb der drei Seiten. Downloads bleiben möglich. */
(function () {
  var huelle = null;
  try { if (window.parent !== window && window.parent.hkhSeite) huelle = window.parent; } catch (x) {}
  if (!huelle) return;

  function sag(name) {
    try { if (huelle[name]) huelle[name](); } catch (x) {}
  }
  document.addEventListener("pointerdown", function () {
    sag("hkhVollbild");
    sag("hkhWach");
    sag("hkhAktiv");
  }, true);
  document.addEventListener("keydown", function () { sag("hkhAktiv"); }, true);
  document.addEventListener("scroll", function () { sag("hkhAktiv"); }, true);

  /* Links: nur die drei Seiten, und zwar innerhalb der Hülle. Fremde Adressen bleiben stehen. */
  var ERLAUBT = { "Dienstplan": 1, "Arbeitsplan": 1, "Reinigungsplan": 1 };
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    if (a.hasAttribute("download") || /^(blob:|data:)/.test(a.href)) return;
    e.preventDefault();
    var u;
    try { u = new URL(a.href, location.href); } catch (x) { return; }
    if (u.origin !== location.origin) return;
    var name = u.pathname.replace(/\.html$/, "").split("/").filter(Boolean).pop() || "";
    if (ERLAUBT[name]) { try { huelle.hkhSeite(name); } catch (x) {} }
  }, true);
})();
