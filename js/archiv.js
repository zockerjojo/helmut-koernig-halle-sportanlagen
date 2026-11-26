/* Regeln für fertige und gelöschte Aufgaben am Arbeitsplan.
   Erledigte Aufgaben wandern nach 30 Tagen ins Archiv, gelöschte nach 30 Tagen ganz weg.
   Reine Rechnung ohne Datenbank, damit sie sich prüfen lässt. */

export const FRIST_TAGE = 30;
export const FRIST_MS = FRIST_TAGE * 24 * 60 * 60 * 1000;
export const MONATE = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

const TEILE = new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", year: "numeric", month: "2-digit" });

/* Jahr und Monat der Erledigung in deutscher Zeit, z. B. { jahr: "2026", monat: "03" }. */
export function archivPlatz(ts) {
  const teile = Object.fromEntries(TEILE.formatToParts(new Date(ts)).map((t) => [t.type, t.value]));
  return { jahr: teile.year, monat: teile.month };
}

/* Der Weg im Archiv nach dem Schema jahr/monat/id. */
export function archivWeg(ts, id) {
  const { jahr, monat } = archivPlatz(ts);
  return `${jahr}/${monat}/${id}`;
}

/* Ist die Frist seit dem Zeitpunkt vorbei? Ohne gültigen Zeitpunkt nie. */
export function istUeberFrist(ts, jetzt = Date.now()) {
  return typeof ts === "number" && Number.isFinite(ts) && jetzt - ts > FRIST_MS;
}

/* Wann eine gelöschte Aufgabe endgültig weg ist. */
export function endetAm(ts) {
  return ts + FRIST_MS;
}

/* "03" wird zu "März". */
export function monatsName(monat) {
  return MONATE[Number(monat) - 1] ?? monat;
}
