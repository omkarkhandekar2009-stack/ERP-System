const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain } = require('electron');
const path    = require('path');
const axios   = require('axios');
const Store   = require('electron-store');

const store = new Store();

// ── Config ────────────────────────────────────────
const API_URL       = store.get('apiUrl', 'http://localhost:5000/api');
const POLL_INTERVAL = 10 * 1000; // 10 seconds

let win, tray;
let trackingPaused  = false;
let currentSession  = null;  // { appName, windowTitle, category, startTime }
let token           = store.get('token', null);

// ── Category detection ────────────────────────────
function categorize(appName, windowTitle) {
  const app   = (appName || '').toLowerCase();
  const title = (windowTitle || '').toLowerCase();
  if (['code', 'webstorm', 'intellij', 'vim', 'sublime'].some(k => app.includes(k))) return 'coding';
  if (['slack', 'teams', 'zoom', 'discord', 'telegram', 'whatsapp'].some(k => app.includes(k))) return 'communication';
  if (['figma', 'photoshop', 'illustrator', 'sketch'].some(k => app.includes(k))) return 'design';
  if (['notion', 'word', 'docs', 'excel', 'sheets', 'powerpoint'].some(k => app.includes(k))) return 'docs';
  if (['chrome', 'firefox', 'safari', 'edge', 'brave'].some(k => app.includes(k))) return 'browsing';
  if (['meet', 'zoom'].some(k => title.includes(k))) return 'meeting';
  return 'other';
}

// ── Send activity to backend ──────────────────────
async function sendActivity(appName, windowTitle, category, durationSeconds) {
  if (!token || trackingPaused) return;
  try {
    await axios.post(`${API_URL}/activity`, { appName, windowTitle, category, durationSeconds }, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    console.error('Failed to send activity:', err.message);
  }
}

// ── Main polling loop ─────────────────────────────
async function pollActiveWindow() {
  if (trackingPaused) return;

  let activeWindow = null;
  try {
    // dynamic import for ESM module
    const { default: activeWin } = await import('active-win');
    activeWindow = await activeWin();
  } catch (e) {
    console.error('active-win error:', e.message);
    return;
  }

  if (!activeWindow) return;

  const appName     = activeWindow.owner?.name || 'Unknown';
  const windowTitle = activeWindow.title || '';
  const category    = categorize(appName, windowTitle);

  const now = Date.now();

  if (!currentSession || currentSession.appName !== appName) {
    // Flush previous session
    if (currentSession) {
      const secs = Math.round((now - currentSession.startTime) / 1000);
      if (secs > 0) await sendActivity(currentSession.appName, currentSession.windowTitle, currentSession.category, secs);
    }
    // Start new session
    currentSession = { appName, windowTitle, category, startTime: now };
  }
}

// ── Create main window ────────────────────────────
function createWindow() {
  win = new BrowserWindow({
    width: 400, height: 500,
    webPreferences: { nodeIntegration: true, contextIsolation: false },
    titleBarStyle: 'hiddenInset',
    title: 'WorkPulse',
  });
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  win.on('close', (e) => { e.preventDefault(); win.hide(); }); // minimize to tray
}

// ── System tray ───────────────────────────────────
function createTray() {
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([
    { label: trackingPaused ? '▶ Resume Tracking' : '⏸ Pause Tracking', click: () => { trackingPaused = !trackingPaused; createTray(); } },
    { label: '📊 Open Dashboard', click: () => win.show() },
    { type: 'separator' },
    { label: '❌ Quit WorkPulse', click: () => { app.exit(); } },
  ]);
  tray.setContextMenu(contextMenu);
  tray.setToolTip(trackingPaused ? 'WorkPulse — Paused' : 'WorkPulse — Tracking');
}

// ── IPC from renderer ─────────────────────────────
ipcMain.on('set-token', (event, t) => { token = t; store.set('token', t); });
ipcMain.on('toggle-pause', () => { trackingPaused = !trackingPaused; event.reply('pause-state', trackingPaused); });
ipcMain.handle('get-pause-state', () => trackingPaused);

// ── App lifecycle ─────────────────────────────────
app.whenReady().then(() => {
  createWindow();
  createTray();
  setInterval(pollActiveWindow, POLL_INTERVAL);
});

app.on('window-all-closed', (e) => e.preventDefault());
