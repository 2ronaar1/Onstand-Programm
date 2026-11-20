// ===== Onstand · Windows-Programm =====
// Das Programm ist ein eigenes Fenster um die Onstand-App. Es lädt Onstand bei jedem Start vom Server,
// dadurch kommt jedes Update (neue onstand.html auf GitHub) automatisch bei allen Kunden an – ohne Neuinstallation.
// Ohne Internet startet Onstand aus dem Zwischenspeicher (Service Worker); beim allerersten Start braucht es Internet.
const { app, BrowserWindow, shell, session, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

// Adresse der App. Bei einem Umzug (z. B. app.onstand.de) hier ändern und neu bauen.
const START = 'https://2ronaar1.github.io/Onstand/onstand.html';
// Eigene Seiten: dürfen im Programmfenster bleiben und Mikrofon, Ordner und Zwischenablage nutzen
const HEIMAT = ['https://2ronaar1.github.io', 'https://onstand.de', 'https://www.onstand.de', 'https://app.onstand.de'];
// Bezahlen läuft im Fenster weiter (Stripe leitet danach zurück zu Onstand)
const IM_FENSTER = [...HEIMAT, 'https://checkout.stripe.com', 'https://billing.stripe.com', 'https://pay.stripe.com'];
const RECHTE = ['media', 'clipboard-read', 'clipboard-sanitized-write', 'notifications', 'fileSystem', 'fullscreen', 'pointerLock'];

const herkunft = (u) => { try { return new URL(u).origin; } catch (e) { return ''; } };
const istHeimat = (u) => HEIMAT.includes(herkunft(u));

app.setAppUserModelId('de.onstand.app');

// Nur ein Onstand-Fenster: ein zweiter Start holt das vorhandene nach vorn
if (!app.requestSingleInstanceLock()) { app.quit(); }

let fenster = null;
const STAND = () => path.join(app.getPath('userData'), 'fenster.json');
function standLesen() { try { return JSON.parse(fs.readFileSync(STAND(), 'utf8')); } catch (e) { return null; } }
function standSchreiben() {
  if (!fenster || fenster.isDestroyed()) return;
  try { fs.writeFileSync(STAND(), JSON.stringify({ ...fenster.getNormalBounds(), max: fenster.isMaximized() })); } catch (e) {}
}

function menue() {
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { label: 'Bearbeiten', submenu: [
      { role: 'undo', label: 'Rückgängig' }, { role: 'redo', label: 'Wiederholen' }, { type: 'separator' },
      { role: 'cut', label: 'Ausschneiden' }, { role: 'copy', label: 'Kopieren' }, { role: 'paste', label: 'Einfügen' },
      { role: 'selectAll', label: 'Alles auswählen' } ] },
    { label: 'Ansicht', submenu: [
      { role: 'reload', label: 'Neu laden', accelerator: 'F5' }, { role: 'forceReload', label: 'Neu laden (ohne Zwischenspeicher)', accelerator: 'Ctrl+F5' },
      { type: 'separator' },
      { role: 'zoomIn', label: 'Größer', accelerator: 'Ctrl+=' }, { role: 'zoomOut', label: 'Kleiner' }, { role: 'resetZoom', label: 'Normale Größe' },
      { type: 'separator' }, { role: 'togglefullscreen', label: 'Vollbild', accelerator: 'F11' } ] }
  ]));
}

function oeffnen() {
  const s = standLesen() || {};
  fenster = new BrowserWindow({
    width: s.width || 1366, height: s.height || 860, x: s.x, y: s.y,
    minWidth: 900, minHeight: 600,
    title: 'Onstand', backgroundColor: '#0A0C0F', show: false, autoHideMenuBar: true,
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true, spellcheck: true }
  });
  fenster.setMenuBarVisibility(false);
  if (s.max) fenster.maximize();
  fenster.once('ready-to-show', () => fenster.show());
  ['resize', 'move', 'close'].forEach((ev) => fenster.on(ev, standSchreiben));

  const wc = fenster.webContents;
  wc.setUserAgent(wc.getUserAgent() + ' OnstandWindows/' + app.getVersion());

  // Links nach draußen (Karten, Webseiten, E-Mail, Telefon) im normalen Browser bzw. Programm öffnen
  wc.setWindowOpenHandler(({ url }) => {
    if (/^(https?|mailto|tel):/i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  wc.on('will-navigate', (e, url) => {
    if (IM_FENSTER.includes(herkunft(url))) return;
    e.preventDefault();
    if (/^(https?|mailto|tel):/i.test(url)) shell.openExternal(url);
  });

  // Ohne Internet und ohne Zwischenspeicher: freundliche Seite statt Fehlermeldung
  wc.on('did-fail-load', (e, code, text, url, istHaupt) => {
    if (istHaupt && code !== -3) fenster.loadFile(path.join(__dirname, 'offline.html'));
  });

  fenster.loadURL(START);
}

app.on('second-instance', () => {
  if (!fenster) return;
  if (fenster.isMinimized()) fenster.restore();
  fenster.focus();
});

app.whenReady().then(() => {
  menue();
  const ses = session.defaultSession;
  ses.setPermissionRequestHandler((wc, recht, ok, info) => ok(istHeimat((info && info.requestingUrl) || wc.getURL()) && RECHTE.includes(recht)));
  ses.setPermissionCheckHandler((wc, recht, ursprung) => istHeimat(ursprung || (wc && wc.getURL()) || '') && RECHTE.includes(recht));
  oeffnen();
});

app.on('window-all-closed', () => app.quit());
