# Onstand · Windows-Programm

Das Programm ist ein eigenes Fenster um Onstand. Es lädt Onstand bei jedem Start von
`https://2ronaar1.github.io/Onstand/onstand.html`. Jede neue `onstand.html`, die du im Repo
**Onstand** hochlädst, ist beim nächsten Start bei allen Kunden drin. Neu bauen musst du das
Programm nur, wenn sich am Fenster selbst etwas ändert (Symbol, Name, Adresse).

## Einmalig einrichten
1. Auf GitHub ein neues, **öffentliches** Repo anlegen: `Onstand-Programm` (ohne README).
2. „uploading an existing file“ → den **Inhalt** dieses Ordners `windows` hineinziehen:
   `main.js`, `offline.html`, `package.json`, `ANLEITUNG.md`, `icon.png`, Ordner `build` und Ordner `.github`.
   → Commit changes.
   Falls der Ordner `.github` nicht mit hochgeht: Add file → Create new file → als Namen
   `.github/workflows/windows.yml` eintippen und den Inhalt der Datei hineinkopieren.

## Programm bauen
1. Im Repo oben auf **Actions** → links **Onstand Windows bauen** → rechts **Run workflow** → grüner Knopf.
2. Nach ca. 5 Minuten ist der Lauf grün. Unter **Releases** (rechts auf der Startseite des Repos)
   liegt `Onstand-Setup.exe`.

Fester Download-Link für die Website (zeigt immer auf die neueste Version):
`https://github.com/2ronaar1/Onstand-Programm/releases/latest/download/Onstand-Setup.exe`

## Neue Programmversion
In `package.json` die Zeile `"version": "1.0.0"` hochzählen (z. B. `1.0.1`), hochladen, wieder **Run workflow**.

## Hinweis Windows-Warnung
Ohne Code-Signatur zeigt Windows beim ersten Öffnen „Der Computer wurde durch Windows geschützt“.
Kunden klicken auf **Weitere Informationen → Trotzdem ausführen**. Mit einem Code-Signing-Zertifikat
verschwindet die Warnung.
