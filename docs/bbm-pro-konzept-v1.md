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
