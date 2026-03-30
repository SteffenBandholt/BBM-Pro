# BBM-Pro – Fachkonzept v1

---

## 0. Änderungslog

### v1.0 – Initial

* Grundstruktur definiert
* Projektbeteiligte festgelegt

---

## 1. Ziel der Anwendung

BBM-Pro dient der projektbezogenen Durchführung von Besprechungen und der daraus entstehenden Protokollführung.

---

## 2. Grundstruktur

Projekt
→ Projektbeteiligte (Firmen + Mitarbeiter)
→ Besprechungen
→ TOPs
→ Protokoll

---

## 3. Stammdaten

### 3.1 Globale Firmen

* projektübergreifend nutzbar

### 3.2 Globale Mitarbeiter

* gehören zu einer Firma
* global verfügbar

---

## 4. Projektbeteiligte

### 4.1 Grundprinzip

Ein Projekt startet ohne Beteiligte.

### 4.2 Firmen zuordnen

* Auswahl aus globaler Firmenliste
* alle Mitarbeiter werden verfügbar

### 4.3 Firma mit Mitarbeitern anlegen

* nur im Projekt vorhanden
* nicht global sichtbar

### 4.4 UI-Struktur

* links: Firmenliste im Projekt
* rechts:

  * Visitenkarte
  * Mitarbeiter

### 4.5 Mitarbeiterlogik

* globale Mitarbeiter werden im Projekt aktiv geschaltet
* projektlokale Mitarbeiter existieren nur im Projekt
* Mitarbeiter können auch bei globalen Firmen angelegt werden

### 4.6 Löschregeln

#### Projektlokal:

* Firmen und Mitarbeiter können gelöscht werden

#### Global:

* Firmen und Mitarbeiter dürfen nicht gelöscht werden
* nur:

  * aus Projekt entfernen
  * im Projekt deaktivieren

---

## 5. Besprechungen

### 5.1 Grundprinzip

Ein Projekt enthält mehrere Besprechungen.

### 5.2 Eigenschaften

* Titel
* Datum

---

## 6. Teilnehmer

### 6.1 Grundprinzip

Teilnehmer sind aktive Projektmitarbeiter.

---

## 7. TOPs

### 7.1 Grundprinzip

TOPs sind die Inhalte der Protokolle.

---

## 8. Nicht Bestandteil von v1

* PDF
* E-Mail
* Mängelmanagement
* Restarbeiten
* Auswertungen
* Diktieren / Scannen

---

## 9. Grundregel

Globale Stammdaten und projektlokale Daten sind strikt getrennt.

---

## 10. Erweiterungen

### Hinweis

Alle künftigen fachlichen Ergänzungen oder Präzisierungen werden nur hier unten ergänzt.
Bestehende Abschnitte oben werden nicht still umgeschrieben.

### 10.1 TOP-Regelwerk v1 – Ebene 1: Grundmodell

#### 10.1.1 Einheitliches Modell

Im System gibt es technisch keinen getrennten Datentyp für „Titel“ und „TOP“.
Beides sind `tops`.

#### 10.1.2 Unterscheidung Titel / TOP

Die Unterscheidung erfolgt über Hierarchie-Felder:

* **Titel**

  * `level = 1`
  * `parent_top_id = null`

* **TOP / Unterpunkt**

  * `level = 2..4`
  * `parent_top_id = ID eines übergeordneten tops`

#### 10.1.3 Hierarchie

Titel sind Wurzelelemente.
TOPs sind untergeordnete Elemente innerhalb dieser Hierarchie.

#### 10.1.4 Maximale Tiefe

Die Hierarchie ist auf **Level 4** begrenzt.
Tiefere Ebenen sind nicht zulässig.

#### 10.1.5 Anlegen

* Ein neuer Titel wird immer auf Root-Ebene angelegt.
* Ein neuer TOP wird immer unter dem aktuell ausgewählten Element angelegt.

#### 10.1.6 Grundwerte neuer TOPs

Neue TOPs werden mit folgenden Standardwerten angelegt:

* `status = "offen"`
* `dueDate = null`
* `longtext = null`
* `isCarriedOver = false`

#### 10.1.7 Fortlaufende Existenz

TOPs sind nicht nur Elemente einer einzelnen Besprechung, sondern Teil eines fortlaufenden fachlichen Modells.
Sie können über Besprechungen hinweg weitergeführt werden.

#### 10.1.8 Besprechungsbezug

Die Sichtbarkeit und Bearbeitung eines TOPs hängt vom jeweiligen Meeting-Kontext ab.
Ein TOP existiert also fachlich übergreifend, wird aber pro Besprechung unterschiedlich dargestellt und behandelt.

### 10.2 TOP-Regelwerk v1 – Ebene 2: Lebenszyklus

#### 10.2.1 Grundzustand neuer TOPs

Neu angelegte TOPs starten im Zustand:

* `status = "offen"`
* `dueDate = null`
* `longtext = null`
* `isCarriedOver = false`

Sie gelten fachlich als neue, noch nicht übernommene TOPs.

#### 10.2.2 Fortführung über Besprechungen

TOPs sind nicht auf genau eine einzelne Besprechung beschränkt.
Offene TOPs können über mehrere Besprechungen hinweg weitergeführt werden.

#### 10.2.3 Übernommene TOPs

Ein TOP kann aus einer früheren Besprechung in eine spätere Besprechung übernommen werden.

Dabei gilt:

* übernommene TOPs bleiben fachlich derselbe TOP
* sie sind nicht automatisch neue TOPs
* der Zustand `is_carried_over = 1` kennzeichnet die Übernahme

#### 10.2.4 Neue und übernommene TOPs

Für die Bedienlogik wird zwischen zwei grundlegenden Zuständen unterschieden:

* **neu / nicht übernommen**
* **übernommen**

Diese Unterscheidung wirkt sich später auf Bearbeitung, Verschieben und Löschen aus.

#### 10.2.5 Erledigte TOPs

Ein TOP kann den Status `erledigt` erhalten.

Erledigte TOPs werden im aktuellen relevanten Meeting noch angezeigt, dort jedoch grau dargestellt.
In späteren Meetings werden sie nicht weiter angezeigt.

#### 10.2.6 Ausblenden

Ein TOP kann ausgeblendet werden.

Dabei gilt:

* `is_hidden = 1`
* der TOP bleibt technisch erhalten
* der TOP wird in der normalen aktiven Anzeige nicht mehr gezeigt

Ausblenden ist nicht dasselbe wie Löschen.

#### 10.2.7 Papierkorb / UI-Löschen

Im aktuellen UI-Verhalten bedeutet „Löschen“ oder „Papierkorb“ in der Regel nicht sofort vollständiges Entfernen aus dem Modell.

Stattdessen wird ein TOP typischerweise:

* ausgeblendet (`is_hidden = 1`)
* zusätzlich als Papierkorb-Eintrag markiert (`is_trashed = 1`)

Dadurch verschwindet er aus der aktiven Anzeige, bleibt aber fachlich und technisch noch nachvollziehbar.

#### 10.2.8 Domain-Soft-Delete

Zusätzlich zum UI-Verhalten existiert ein weitergehender Domain-Delete-Zustand.

Dabei gilt:

* `removed_at` wird gesetzt
* die Meeting-Zuordnung wird entfernt

Dieser Zustand ist strenger als Ausblenden oder Papierkorb-Markierung.

#### 10.2.9 Lebenszyklus-Sicht

Für BBM-Pro v1 wird der Lebenszyklus eines TOPs grundsätzlich in folgenden fachlichen Stufen gedacht:

* neu
* übernommen
* geändert
* erledigt
* ausgeblendet
* Papierkorb-markiert
* domain-seitig entfernt

Nicht jede dieser Stufen muss sofort in v1 vollständig in der UI umgesetzt werden.
Sie bilden aber das fachliche Zielmodell.

#### 10.2.10 Vorrang des Lebenszyklus vor UI

Darstellungsfragen wie Farbe, Stern, Sichtbarkeit oder Bearbeitbarkeit leiten sich aus dem Lebenszyklus eines TOPs ab.
Deshalb wird der Lebenszyklus als fachliche Grundlage vor den späteren UI-Regeln festgelegt.

### 10.3 TOP-Regelwerk v1 – Ebene 3: Nummerierung und Reihenfolge

#### 10.3.1 Interne Nummer

Jeder TOP besitzt ein Feld `number`.

Diese Nummer ist nicht die vollständige sichtbare Nummer, sondern nur die Nummer innerhalb seiner direkten Geschwistergruppe.

Beispiele:

* Titel A hat `number = 1`
* Titel B hat `number = 2`
* Unter Titel A hat der erste Unterpunkt `number = 1`
* Unter Titel A hat der zweite Unterpunkt `number = 2`

#### 10.3.2 Sichtbare Nummer

Die sichtbare Regelnummerierung wird rekursiv aufgebaut.

Dabei gilt:

* Root-/Titel-Ebene: `displayNumber = number`
* Kind-Ebene: `displayNumber = parent.displayNumber + "." + own number`

Beispiele:

* `3`
* `3.2`
* `3.2.1`

#### 10.3.3 Lokale Nummerierung pro Geschwistergruppe

Die Nummerierung ist nicht global über das gesamte Projekt, sondern lokal innerhalb einer Geschwistergruppe.

Eine Geschwistergruppe wird bestimmt über:

* `level`
* `parentTopId`

#### 10.3.4 Vergabe neuer Nummern

Neue Nummern werden innerhalb der jeweiligen Geschwistergruppe vergeben.

Regel:

* `MAX(number) + 1`

Das gilt sowohl für:

* neue Titel auf Root-Ebene
* neue Unterpunkte unter einem konkreten Parent

#### 10.3.5 Sortierung in der Anzeige

Die sichtbare Liste wird nach `displayNumber` sortiert.

Die Anzeige folgt damit der hierarchischen Regelnummerierung, nicht der Erstellzeit.

Beispiel:

* `1`
* `1.1`
* `1.2`
* `2`
* `2.1`

#### 10.3.6 Nummernlücken

Wenn innerhalb einer Geschwistergruppe durch Löschen oder Verschieben eine Nummernlücke entsteht, wird diese nicht durch vollständiges Neu-Nummerieren aller Elemente geschlossen.

#### 10.3.7 Schließen von Nummernlücken

Statt vollständiger Neu-Nummerierung gilt:

* die erste Lücke wird gesucht
* der TOP mit der höchsten Nummer in derselben Geschwistergruppe wird auf diese Lücke gesetzt

Beispiel:

* vorhanden: `1`, `2`, `4`
* danach: `1`, `2`, `3`

#### 10.3.8 Geltungsbereich der Lückenlogik

Die Nummernlücken-Logik gilt immer nur innerhalb der konkreten Geschwistergruppe, also innerhalb derselben Kombination aus:

* `level`
* `parentTopId`

#### 10.3.9 Verschieben und neue Nummer

Wird ein TOP in eine andere Gruppe verschoben, erhält er dort:

* einen neuen Parent
* ein neues Level
* eine neue Nummer nach der Regel `MAX(number) + 1`

Ein verschobener TOP wird damit immer ans Ende der Zielgruppe gesetzt.

#### 10.3.10 Keine freie Zielposition

Das bestehende Regelmodell sieht kein freies Einsortieren an beliebige Positionen vor.
Beim Verschieben wird immer an das Ende der Zielgruppe angehängt.

---

### 10.4 TOP-Regelwerk v1 – Ebene 4: Bearbeitbarkeit und Read-only

#### 10.4.1 Geschlossene Besprechung

Ist eine Besprechung geschlossen, ist sie vollständig read only.

Dann sind alle Eingaben und Aktionen gesperrt, insbesondere:

* Titel
* Langtext
* Datum
* Status
* Verantwortlich
* Hidden
* Wichtig
* Speichern
* Papierkorb
* Verschieben

#### 10.4.2 Offene Besprechung

Ist eine Besprechung offen, sind TOPs grundsätzlich bearbeitbar, solange keine spezielleren Einschränkungen greifen.

#### 10.4.3 Übernommene TOPs im offenen Meeting

Ist ein TOP übernommen (`is_carried_over = 1`) und das Meeting offen, gilt kein vollständiger Read-only-Zustand.

Im aktuellen Regelstand ist dann:

* der Titel gesperrt
* der Langtext bearbeitbar
* das Datum bearbeitbar
* der Status bearbeitbar
* der Verantwortlich-Eintrag bearbeitbar
* Hidden bearbeitbar
* Wichtig bearbeitbar

#### 10.4.4 Neue / nicht übernommene TOPs

Neue bzw. nicht übernommene TOPs sind im offenen Meeting grundsätzlich vollständig bearbeitbar, soweit keine weiteren Bedienregeln dagegen sprechen.

#### 10.4.5 Read-only als Vorrangregel

Der Read-only-Zustand einer geschlossenen Besprechung hat Vorrang vor allen weiteren Bearbeitungsregeln.

#### 10.4.6 Bearbeitbarkeit ist nicht gleich Sichtbarkeit

Ein TOP kann sichtbar sein, ohne vollständig bearbeitbar zu sein.
Die Regeln für Bearbeitbarkeit und die Regeln für Sichtbarkeit werden getrennt betrachtet.

---

### 10.5 TOP-Regelwerk v1 – Ebene 5: Sichtbarkeit und Darstellung

#### 10.5.1 Grundregel der Sichtbarkeit

Ein TOP wird in der aktiven Liste nicht angezeigt, wenn:

* `is_hidden = 1`
* oder die Meeting-Regel `shouldShowTopForMeeting(...)` den TOP für dieses Meeting nicht mehr zulässt

#### 10.5.2 Erledigte TOPs

Ein erledigter TOP bleibt im aktuellen relevanten Meeting noch sichtbar.
Dort wird er grau dargestellt.

In späteren Meetings wird er nicht weiter angezeigt.

#### 10.5.3 Collapse von Titeln

Wird ein Level-1-Titel eingeklappt, werden seine Unterpunkte im Renderer nicht angezeigt.

Dies ist nur ein UI-Collapse und kein fachliches Ausblenden im Datenmodell.

#### 10.5.4 Schriftfarbe im offenen Meeting

Im offenen Meeting gilt im aktuellen Ist-Zustand im Wesentlichen:

* erledigt und im aktuellen Meeting noch sichtbar → grau
* wichtig → rot
* übernommen (`is_carried_over = 1`) → schwarz
* neu / nicht übernommen → blau

#### 10.5.5 Schriftfarbe im geschlossenen Meeting

Im geschlossenen Meeting gilt im aktuellen Ist-Zustand:

* wichtig → rot
* sonst grundsätzlich schwarz

#### 10.5.6 Langtext-Farbe

Für den Langtext gilt zusätzlich:

* übernommen + geändert (`is_touched = 1`) → blau
* übernommen + nicht geändert → schwarz

#### 10.5.7 Stern-Markierung

Ein gelber Stern `★` wird angezeigt, wenn:

* ein TOP neu ist (`!is_carried_over`)
* oder ein übernommener TOP geändert wurde (`is_carried_over && is_touched`)

Die Stern-Markierung kennzeichnet damit:

* neue TOPs
* oder übernommene, geänderte TOPs

#### 10.5.8 Ampellogik – Hauptregel

Im aktuellen System gibt es eine Haupt-Ampellogik.

Dort gilt:

* `blockiert` → blau
* `verzug` → rot
* `erledigt` → grün
* `offen` / `in arbeit` mit Datum:

  * überfällig oder heute → rot
  * 1–10 Tage → orange
  * mehr als 10 Tage → grün
* ohne Datum → keine Ampel

#### 10.5.9 Ampellogik – Inkonsistenz

Zusätzlich existiert in der Editbox-Vorschau aktuell eine abweichende Logik.

Dort gilt im Ist-Zustand:

* `blockiert` oder `verzug` → rot

Das ist nicht identisch mit der Hauptlogik und wird als bestehende Inkonsistenz dokumentiert.

#### 10.5.10 Eltern-Ampel

Für Parent-TOPs kann die Ampel aus den Kindern aggregiert werden.

Die Priorität der Aggregation ist aktuell:

* blau
* rot
* orange
* grün

Damit kann ein Parent die kritischste Ampel seiner Kinder übernehmen.

---

### 10.6 TOP-Regelwerk v1 – Ebene 6: Bedienregeln für Löschen, Papierkorb und Verschieben

#### 10.6.1 Löschen-Button

Der sichtbare Löschen-Button ist nur aktiv, wenn alle folgenden Bedingungen erfüllt sind:

* Besprechung ist nicht read only
* kein Busy-Zustand
* kein aktiver Löschvorgang
* TOP ist nicht übernommen (`is_carried_over !== 1`)
* TOP hat keine Kinder

#### 10.6.2 Papierkorb

Der Papierkorb ist gegenüber dem Löschen-Button lockerer.

Er ist grundsätzlich möglich, wenn:

* Besprechung ist nicht read only
* kein Busy-Zustand
* kein aktiver Löschvorgang
* TOP ist nicht übernommen

Im aktuellen Ist-Zustand werden Kinder hier nicht zusätzlich gesperrt.

#### 10.6.3 Unterschied Löschen-Button vs. Papierkorb

Der sichtbare Löschen-Button ist restriktiver als der Papierkorb.
Insbesondere blockiert der Löschen-Button TOPs mit Kindern, während der Papierkorb in diesem Punkt lockerer ist.

#### 10.6.4 UI-Löschen ist nicht Domain-Delete

Im sichtbaren UI-Verhalten bedeutet Löschen typischerweise:

* `is_hidden = 1`
* `is_trashed = 1`

Dies ist strenger als einfaches Ausblenden, aber noch nicht dasselbe wie der Domain-Soft-Delete.

#### 10.6.5 Verschieben – Grundvoraussetzungen

Ein TOP darf nur verschoben werden, wenn:

* Besprechung ist nicht read only
* kein Busy-Zustand
* ein TOP ist ausgewählt
* TOP ist nicht übernommen (`is_carried_over !== 1`)
* TOP hat keine Kinder

#### 10.6.6 Verschieben – zulässige Ziele

UI-seitig sind nur Ziel-TOPs mit Level 1 bis 3 zulässig.

Zusätzlich gilt service-seitig:

* kein Verschieben unter sich selbst
* kein Zyklus im eigenen Stammbaum
* Parent muss im selben Projekt liegen
* Parent darf nicht Level 4 sein
* Root (`targetParentId = null`) ist nur für Level-1-TOPs zulässig

#### 10.6.7 Verschieben ans Ende

Beim Verschieben erhält ein TOP in der Zielgruppe immer die nächste freie Nummer.
Er wird damit ans Ende der Zielgruppe gesetzt.

#### 10.6.8 Nummernlücke in der alten Gruppe

Durch Verschieben kann in der alten Gruppe eine Nummernlücke entstehen.
Diese wird anschließend mit der festgelegten Lückenlogik geschlossen.

#### 10.6.9 Vorrang der Bedienregeln

Die Regeln für Löschen, Papierkorb und Verschieben sind keine freien UI-Aktionen, sondern folgen dem fachlichen Zustand eines TOPs:

* neu oder übernommen
* mit oder ohne Kinder
* offenes oder geschlossenes Meeting

#### 10.6.10 Zielbild für BBM-Pro v1

Für BBM-Pro v1 gilt:
Das Bedienverhalten von TOPs soll sich an diesen fachlichen Regeln orientieren.
Nicht jede Einzelregel muss sofort vollständig umgesetzt werden, aber das Modell für spätere Implementierung ist damit festgelegt.
