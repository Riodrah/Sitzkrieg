# Sitzkrieg – Projektwissen für Claude

Begleit-App (PWA) für **Sitzkrieg**, ein Tabletop-Kriegsspiel (2. Weltkrieg), das physisch mit **Lego** gespielt wird. Die App ist ein **Werkzeug für das echte Spiel**, kein vollwertiges Computerspiel. Sie macht Folgendes:

- würfelt Karten aus Geländeplatten
- erzeugt Armeen
- führt das Aktivierungsdeck
- zeigt das Regelwerk

Optik ist sehr wichtig. Alles soll wie Lego aussehen.

Die Oberfläche und alle Texte sind auf **Deutsch**.

## Technik

- Reines HTML/CSS/JS, **kein Bundler, keine npm-Abhängigkeiten**. Node wird nur für `tools/build.mjs` gebraucht.
- `index.html` ist die Haupt-App mit den Tabs Karte, Armee, Spiel und Regelwerk.
- `digital.html` ist eine digitale Partie mit Online-Lobby über PeerJS von unpkg.
- `js/` enthält klassische Skripte mit globalen Variablen (z. B. `current`, `RULES`, `render`, `isPortrait`).
- `js3d/` enthält ES-Module mit Three.js 0.170. Sie greifen auf die globalen Variablen aus `js/` zu.
- `vendor/` enthält Three.js, OrbitControls, RoundedBoxGeometry, RoomEnvironment, GLTFLoader, BufferGeometryUtils und GSAP. Alles liegt lokal, damit die App offline läuft.
- `sw.js` ist der Service Worker, die App funktioniert offline. Navigationen sowie `js3d/`, `vendor/` und `assets/modelle/` werden mit `no-cache` geholt, weil sich die Module ohne Fingerabdruck gegenseitig importieren.

## Wichtige Dateien

| Datei | Inhalt |
|---|---|
| `js/regeln.js` | **Alle Regeln als Daten**: Waffen, Spezialeinheiten, Generalsfähigkeiten, Felderweiterungen, Missionsziele und Geländeregeln (`felder.<key>.regel`). Für Regeländerungen nur diese Datei bearbeiten. |
| `js/karte.js` | Kartengenerator. Die Geländearten stehen oben in einer Liste (`key`, `name`, `size`, `count`, `icon`). Dazu kommen die Tabs und `render()` für die 2D-Karte. |
| `js/extras.js` | Popups, z. B. `openField()` beim Antippen eines Kartenfelds |
| `js3d/modelle.js` | Lego-Bausteine: `brick()`, `slope()`, `plastic()`. Außerdem Fahrzeuge (Panzer, Kraftrad …) und Ausrüstung der Figuren. |
| `js3d/glbfig.js` | Soldatenfigur aus `assets/modelle/soldat.glb`, Uniformfarbe je Seite per Shader |
| `js3d/gelaende.js` | **3D-Modelle der Kartenfelder**. Eine Funktion pro Feld, z. B. `house3`, `tower3`, `farm3`, `see3`, `ruin3`, `trench3`, `flat3`, `beach3`, `train3`, `bunker3`, `wald3`, `church2`, `harbor2`. Die Auswahl passiert in `terrain()`, die Grundplattenfarbe in `TERRAIN`. Felder über zwei Plätze stehen in `BIG`. |
| `js3d/karte3d.js` | 3D-Spieltisch, der Umschalter 2D/3D und der Knopf „↻ Drehen“. Felder lassen sich antippen. |
| `js3d/einheiten3d.js` | Lebende 3D-Spielkarten (Schuss, Treffer, Zerfall in Steine) und Popups mit Drehteller |
| `js3d/foto.js` | Standbilder der Modelle, gespeichert im Cache Storage `fig-<FIG_V>` |
| `tools/build.mjs` | Prüft und versioniert vor jedem Hochladen |

## Arbeitsweise

1. Lokal starten (Service Worker braucht http, nicht `file://`):
   ```bash
   python3 -m http.server 8765
   ```
   Dann `http://localhost:8765/` öffnen. Bei Problemen einmal mit `?frisch=1` neu laden.
2. Nach jeder Änderung **immer** ausführen:
   ```bash
   node tools/build.mjs
   ```
   Das Skript prüft die Syntax und fehlende Dateien. Es setzt `?v=`-Fingerabdrücke an CSS/JS, die Cache-Version in `sw.js` und `js3d/version.js` (`FIG_V`). Ohne diesen Schritt sehen Handys alte Versionen.
3. Neue 3D-Modelle:
   - Im Lego-Stil bauen, also aus `brick()`/`box()`/`cyl()`/`slope()` mit Noppen.
   - Prüfen: `const f = await import('./js3d/foto.js'); await f.photo('feld:<key>', 'de', 500)` liefert eine Bild-URL.
4. **Flackern vermeiden (Z-Fighting):**
   - Zwei Flächen dürfen nie exakt auf derselben Ebene liegen, z. B. eine Tür genau in einer Wand. Lieber ein paar Millimeter davor setzen.
   - Flache Teile bis 0,05 Höhe nahe am Boden versetzen `box()`/`cyl()` in `gelaende.js` automatisch minimal (`ZF`).
5. Neue Gelände-Regel: Text in `js/regeln.js` bei `felder.<key>.regel` eintragen. Sie erscheint dann beim Antippen des Feldes.
6. Fotos des echten Lego-Aufbaus möglichst genau nachbauen: Farben, Anordnung, Details.

## Lizenzen

- Sounds: CC0 von OpenGameArt (Quellen im README)
- Three.js: MIT
- GSAP: Lizenz von GreenSock
- `assets/modelle/soldat.glb`: Die Nutzung wurde dem ursprünglichen Projektinhaber vom Ersteller mündlich erlaubt. Vor einer eigenen öffentlichen Veröffentlichung selbst klären.
