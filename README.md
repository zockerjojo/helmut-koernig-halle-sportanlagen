# helmut-körnig-halle-sportanlagen

Eine Webseite für die Helmut-Körnig-Halle in Dortmund mit drei Bereichen.

| Adresse | Datei | Für wen | Inhalt |
| --- | --- | --- | --- |
| `/` | `index.html` | Sportler, öffentlich | Zeigt, welche Sportanlagen aufgebaut sind und ob die Tribüne eingefahren ist. |
| `/Reinigungsplan` | `Reinigungsplan.html` | Personal, mit Zugangscode | Hallenplan, in dem eingetragen wird, was geputzt ist. |
| `/Sportanlagen` | `Sportanlagen.html` | Personal, mit Zugangscode | Status der Sportanlagen und der Tribüne einstellen. |

## Zugang für das Personal

- Auf der Startseite den runden Knopf oben rechts etwa eine Sekunde gedrückt halten. Kurz tippen schaltet nur hell und dunkel um.
- Beim ersten Mal fragt das Gerät nach dem Zugangscode. Danach merkt es sich den Zugang und zeigt sofort die Auswahl.
- Die beiden Personal-Seiten lassen sich auch direkt öffnen, zum Beispiel als Verknüpfung auf dem Handy. Sie prüfen beim Öffnen zuerst, ob das Gerät schon freigeschaltet ist.
- Der Zugangscode steht nur in der Datenbank unter `zugang/code`. Er steht in keiner Datei dieses Projekts. Geändert wird er in der Firebase-Konsole.

## Technik

- Statische Seiten ohne Build, veröffentlicht mit GitHub Pages aus dem Zweig `main`.
- Daten: Firebase Realtime Database im Projekt „helmut-koernig-halle-sport“ (Projekt-ID `koernig-halle-sportanlagen`), Standort Belgien (europe-west1).
- Anmeldung: Firebase Authentication, anonym. Das Gerät schreibt den eingegebenen Code nach `admins/<Gerät>`. Die Datenbank nimmt den Eintrag nur an, wenn der Code stimmt.
- `js/config.js`: Verbindungsdaten zu Firebase. Diese Werte sind nicht geheim.
- `js/zugang.js`: Anmeldung, gemeinsam für alle Seiten.
- `database.rules.json`: Regeln der Datenbank. Sie müssen in der Firebase-Konsole unter Realtime Database → Regeln veröffentlicht sein.
- `404.html`: Leitet andere Schreibweisen weiter, zum Beispiel `/reinigungsplan` auf `/Reinigungsplan`.

## Datenstruktur

- `matten/<schlüssel>`: `name`, `sub`, `art` (`anlage` oder `tribuene`), `status`, `aus`, `ein`, `reihenfolge`, `geaendert`. Öffentlich lesbar, schreiben nur für freigeschaltete Geräte.
- `putzplan/lanes`, `putzplan/notes`, `putzplan/free`: Einträge des Reinigungsplans. Lesen und schreiben nur für freigeschaltete Geräte.
- `admins/<Gerät>`: freigeschaltete Geräte.
- `zugang/code`: der Zugangscode. Für Besucher weder lesbar noch schreibbar.
