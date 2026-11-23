/* Alte Adresse: die Tablet-Seiten liegen jetzt unter /Tablet/ */
(function () {
  var name = location.pathname.replace(/\.html$/, "").split("/").filter(Boolean).pop() || "";
  var ziel = "/Tablet/" + ({ Dienstplan: 1, Arbeitsplan: 1, Reinigungsplan: 1 }[name] ? "#" + name : "");
  (window.top === window ? location : window.top.location).replace(ziel);
})();
