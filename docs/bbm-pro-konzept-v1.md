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
