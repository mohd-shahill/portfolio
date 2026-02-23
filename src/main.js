/* ═══════════════════════════════════════════════════════════════
   ShahilOS — Main Application JavaScript
   Boot Manager, Window Manager, Terminal, Dock, Router
   ═══════════════════════════════════════════════════════════════ */

import './style.css';
import { initTerminal } from './terminal.js';
import { initSnake } from './snake.js';



// ════════════════════════════════════════════════════════════
// STATE
// ════════════════════════════════════════════════════════════
let zIndex = 100;
const windowState = {};
export const apps = ['about', 'experience', 'projects', 'skills', 'contact', 'terminal', 'snake'];
let bgIndex = 0;
const bgClasses = ['', 'bg-2', 'bg-3'];
let isDarkMode = true; // starts in dark mode (Rose Pine)

// ════════════════════════════════════════════════════════════
// WALLPAPER — auto-detect from /wallpapers/ folder
// ════════════════════════════════════════════════════════════
const WALLPAPER_EXTS = ['jpg', 'jpeg', 'png', 'webp'];

async function tryLoadWallpaper() {
  const layer = document.getElementById('desktop-wallpaper');
  if (!layer) return;

  for (const ext of WALLPAPER_EXTS) {
    const url = `/wallpapers/wallpaper.${ext}`;
    try {
      const res = await fetch(url, { method: 'HEAD' });
      const type = res.headers.get('content-type');
      if (res.ok && type && type.startsWith('image/')) {
        layer.style.backgroundImage = `url("${url}")`;
        layer.style.opacity = '1';
        const desktop = document.getElementById('desktop');
        if (desktop) desktop.style.background = 'transparent';
        showToast(`🖼️ Wallpaper loaded: wallpaper.${ext}`);
        return;
      }
    } catch (e) {
      // ignore
    }
  }
  // No wallpaper found — keep gradient
}

// ════════════════════════════════════════════════════════════
// PROFILE PHOTO — auto-detect from /profile/ folder
// ════════════════════════════════════════════════════════════
const PROFILE_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'JPG', 'JPEG', 'PNG', 'WEBP'];

async function tryLoadProfilePhoto() {
  const avatar = document.getElementById('about-avatar');
  if (!avatar) return;

  for (const ext of PROFILE_EXTS) {
    const url = `/profile/profile.${ext}`;
    try {
      const res = await fetch(url, { method: 'HEAD' });
      const type = res.headers.get('content-type');
      if (res.ok && type && type.startsWith('image/')) {
        avatar.style.backgroundImage = `url("${url}")`;
        avatar.classList.add('has-photo');
        return;
      }
    } catch (e) {
      // ignore
    }
  }
}
// ════════════════════════════════════════════════════════════
// DARK / LIGHT MODE TOGGLE
// ════════════════════════════════════════════════════════════
function toggleTheme() {
  isDarkMode = !isDarkMode;
  document.body.classList.toggle('light-mode', !isDarkMode);
  localStorage.setItem('shahilos-theme', isDarkMode ? 'dark' : 'light');

  // Swap icons
  document.getElementById('icon-moon')?.classList.toggle('hidden', !isDarkMode);
  document.getElementById('icon-sun')?.classList.toggle('hidden', isDarkMode);

  showToast(isDarkMode ? '🌙 Dark mode on' : '☀️ Light mode on');
}

// ════════════════════════════════════════════════════════════
// MUSIC WIDGET
// ════════════════════════════════════════════════════════════

// Automatically import all audio files from public/music using Vite
const rawFiles = import.meta.glob('/public/music/*.{mp3,wav,ogg,m4a,flac}', { eager: true });
const playlist = Object.keys(rawFiles).map(filePath => {
  const url = rawFiles[filePath].default || rawFiles[filePath];
  // Extract filename without path and extension
  const filename = filePath.split('/').pop();
  let cleanName = decodeURIComponent(filename).replace(/\.[^/.]+$/, "");
  
  // Try to extract artist and title if formatted like "Artist - Title"
  let artist = "Local Music";
  let title = cleanName;
  if (cleanName.includes('-')) {
    const parts = cleanName.split('-');
    title = parts.slice(1).join('-').trim();
    artist = parts[0].trim();
  }

  return { title, artist, src: url };
});

// Fallback if the folder is empty
if (playlist.length === 0) {
  playlist.push(
    { title: 'Chill Coding Beats', artist: 'FreeCodeCamp Radio', src: 'https://coderadio-admin.freecodecamp.org/radio/8000/radio.mp3' }
  );
}

let currentTrackIndex = 0;

function initMusicWidget() {
  const toggleBtn = document.getElementById('menu-music-toggle');
  const widget = document.getElementById('music-widget');
  const audio = document.getElementById('music-audio');
  const playBtn = document.getElementById('music-btn-play');
  const prevBtn = document.getElementById('music-btn-prev');
  const nextBtn = document.getElementById('music-btn-next');
  const volSlider = document.getElementById('music-vol');
  const artIcon = document.getElementById('music-art');
  const titleEl = document.getElementById('music-title');
  const artistEl = document.getElementById('music-artist');
  const playlistEl = document.getElementById('music-playlist');
  
  const progressSlider = document.getElementById('music-progress');
  const timeCurrent = document.getElementById('music-time-current');
  const timeTotal = document.getElementById('music-time-total');

  let hasUserInteracted = false;

  if (!toggleBtn || !widget || !audio) return;

  const playIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
  const pauseIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    widget.classList.toggle('hidden');
  });

  widget.addEventListener('click', (e) => e.stopPropagation());

  playlist.forEach((track, index) => {
    const li = document.createElement('li');
    li.textContent = `${track.title} - ${track.artist}`;
    li.addEventListener('click', () => {
      loadTrack(index);
      playTrack();
    });
    playlistEl.appendChild(li);
  });

  function loadTrack(index) {
    currentTrackIndex = index;
    const track = playlist[index];
    titleEl.textContent = track.title;
    artistEl.textContent = track.artist;
    audio.src = track.src;
    
    Array.from(playlistEl.children).forEach((li, i) => {
      li.classList.toggle('active', i === index);
    });
    
    playBtn.innerHTML = playIcon;
    artIcon.classList.remove('spinning');
  }

  function playTrack() {
    audio.play().then(() => {
      playBtn.innerHTML = pauseIcon;
      artIcon.classList.add('spinning');
    }).catch(err => {
      showToast('❌ Unable to play track');
    });
  }

  function pauseTrack() {
    audio.pause();
    playBtn.innerHTML = playIcon;
    artIcon.classList.remove('spinning');
  }

  playBtn.addEventListener('click', () => {
    if (audio.paused) {
      if (!audio.src || audio.currentSrc === location.href) loadTrack(currentTrackIndex);
      playTrack();
    } else {
      pauseTrack();
    }
  });

  prevBtn.addEventListener('click', () => {
    let newIndex = currentTrackIndex - 1;
    if (newIndex < 0) newIndex = playlist.length - 1;
    loadTrack(newIndex);
    playTrack();
  });

  nextBtn.addEventListener('click', () => {
    let newIndex = currentTrackIndex + 1;
    if (newIndex >= playlist.length) newIndex = 0;
    loadTrack(newIndex);
    playTrack();
  });

  // Timeline / Progress Logic
  function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  audio.addEventListener('timeupdate', () => {
    if (isDraggingSlider) return; // Don't fight the user dragging

    if (audio.duration && isFinite(audio.duration)) {
      const percentage = (audio.currentTime / audio.duration) * 100;
      progressSlider.value = percentage;
      timeCurrent.textContent = formatTime(audio.currentTime);
      timeTotal.textContent = formatTime(audio.duration);
    } else {
      progressSlider.value = 100;
      timeCurrent.textContent = formatTime(audio.currentTime);
      timeTotal.textContent = 'LIVE';
    }
  });

  audio.addEventListener('loadedmetadata', () => {
    if (audio.duration && isFinite(audio.duration)) {
      timeTotal.textContent = formatTime(audio.duration);
    } else {
      timeTotal.textContent = 'LIVE';
    }
  });

  let isDraggingSlider = false;

  progressSlider.addEventListener('input', (e) => {
    isDraggingSlider = true;
    if (audio.duration && isFinite(audio.duration)) {
      const previewTime = (e.target.value / 100) * audio.duration;
      timeCurrent.textContent = formatTime(previewTime);
    }
  });

  progressSlider.addEventListener('change', (e) => {
    isDraggingSlider = false;
    if (audio.duration && isFinite(audio.duration)) {
      const seekTo = (e.target.value / 100) * audio.duration;
      audio.currentTime = seekTo;
    }
  });

  volSlider.addEventListener('input', (e) => {
    audio.volume = e.target.value;
  });
  audio.volume = volSlider.value;

  audio.addEventListener('ended', () => {
    nextBtn.click();
  });

  // Initialization
  loadTrack(currentTrackIndex);
}

// ════════════════════════════════════════════════════════════
// BOOT MANAGER
// ════════════════════════════════════════════════════════════
const bootMessages = [
  'Initializing system...',
  'Loading apps: About, Experience, Projects, Skills, Contact, Terminal...',
  'System ready.',
];

function runBoot() {
  const textEl = document.getElementById('boot-text');
  const progressBar = document.getElementById('boot-progress-bar');
  const bootScreen = document.getElementById('boot-screen');
  const desktop = document.getElementById('desktop');
  let msgIdx = 0;

  function showNextMessage() {
    if (msgIdx >= bootMessages.length) {
      // Boot complete
      progressBar.style.width = '100%';
      setTimeout(() => {
        bootScreen.classList.add('fade-out');
        desktop.classList.remove('hidden');
        setTimeout(() => {
          bootScreen.remove();
          showToast('👋 Welcome to ShahilOS! Double-click icons or use the dock.');
          handleHashRoute();
          animateSkillBars();
        }, 600);
      }, 400);
      return;
    }

    const msg = bootMessages[msgIdx];
    const progress = ((msgIdx + 1) / bootMessages.length) * 100;
    progressBar.style.width = progress + '%';

    // Typing effect
    textEl.textContent = '';
    let charIdx = 0;
    const typeInterval = setInterval(() => {
      if (charIdx < msg.length) {
        textEl.textContent += msg[charIdx];
        charIdx++;
      } else {
        clearInterval(typeInterval);
        msgIdx++;
        setTimeout(showNextMessage, 100);
      }
    }, 10);
  }

  setTimeout(showNextMessage, 300);
}

// ════════════════════════════════════════════════════════════
// CLOCK
// ════════════════════════════════════════════════════════════
function updateClock() {
  const el = document.getElementById('menu-clock');
  if (!el) return;
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  el.textContent = `${h12}:${m} ${ampm}`;
}

// ════════════════════════════════════════════════════════════
// WINDOW MANAGER
// ════════════════════════════════════════════════════════════
function openApp(name) {
  const win = document.getElementById('window-' + name);
  if (!win) return;

  // If hidden, show it
  if (win.classList.contains('hidden')) {
    win.classList.remove('hidden');
    win.classList.remove('closing');

    // Position new windows with offset
    if (!windowState[name]) {
      const offset = Object.keys(windowState).length * 30;
      win.style.top = (60 + offset % 200) + 'px';
      win.style.left = (100 + offset % 300) + 'px';
      windowState[name] = { minimized: false, maximized: false };
    }

    // Show dock indicator
    const dockDot = document.querySelector(`.dock-item[data-app="${name}"] .dock-dot`);
    if (dockDot) dockDot.classList.remove('hidden');

    // Bounce dock icon
    const dockItem = document.querySelector(`.dock-item[data-app="${name}"]`);
    if (dockItem) {
      dockItem.classList.add('bounce');
      setTimeout(() => dockItem.classList.remove('bounce'), 500);
    }
  }

  // If minimized, restore
  if (windowState[name]?.minimized) {
    win.style.transform = '';
    win.style.opacity = '';
    win.style.pointerEvents = '';
    windowState[name].minimized = false;
  }

  focusWindow(name);
  updateMenuLabel(name);
  window.location.hash = name;

  // Animate skill bars when skills window opens
  if (name === 'skills') {
    setTimeout(animateSkillBars, 100);
  }

  // Focus terminal input
  if (name === 'terminal') {
    setTimeout(() => {
      document.getElementById('terminal-input')?.focus();
    }, 100);
  }
}

function closeApp(name) {
  const win = document.getElementById('window-' + name);
  if (!win) return;

  win.classList.add('closing');
  setTimeout(() => {
    win.classList.add('hidden');
    win.classList.remove('closing', 'maximized', 'focused');
    if (windowState[name]) {
      windowState[name].maximized = false;
    }
    // Hide dock dot
    const dockDot = document.querySelector(`.dock-item[data-app="${name}"] .dock-dot`);
    if (dockDot) dockDot.classList.add('hidden');
    updateMenuLabel(null);
  }, 250);

  if (window.location.hash === '#' + name) {
    history.replaceState(null, '', window.location.pathname);
  }
}

function minimizeApp(name) {
  const win = document.getElementById('window-' + name);
  if (!win) return;

  win.style.transform = 'scale(0.1) translateY(100vh)';
  win.style.opacity = '0';
  win.style.pointerEvents = 'none';
  if (windowState[name]) windowState[name].minimized = true;
  updateMenuLabel(null);
}

function maximizeApp(name) {
  const win = document.getElementById('window-' + name);
  if (!win) return;

  if (win.classList.contains('maximized')) {
    win.classList.remove('maximized');
    if (windowState[name]) windowState[name].maximized = false;
  } else {
    win.classList.add('maximized');
    if (windowState[name]) windowState[name].maximized = true;
  }
}

function focusWindow(name) {
  // Remove focus from all
  document.querySelectorAll('.app-window').forEach(w => w.classList.remove('focused'));
  const win = document.getElementById('window-' + name);
  if (!win) return;
  zIndex++;
  win.style.zIndex = zIndex;
  win.classList.add('focused');
}

function updateMenuLabel(name) {
  const label = document.getElementById('active-window-label');
  if (!label) return;
  if (name) {
    const titles = {
      about: 'About Me',
      experience: 'Experience',
      projects: 'Projects',
      skills: 'Skills',
      contact: 'Contact',
      terminal: 'Terminal',
    };
    label.textContent = titles[name] || 'ShahilOS';
  } else {
    label.textContent = 'ShahilOS';
  }
}

// ════════════════════════════════════════════════════════════
// DRAGGING
// ════════════════════════════════════════════════════════════
function initDragging() {
  let dragTarget = null;
  let offsetX = 0, offsetY = 0;

  document.addEventListener('mousedown', (e) => {
    // 1. App Windows Context
    const titlebar = e.target.closest('.window-titlebar');
    const lofiheader = e.target.closest('.lofi-header');
    const musicHeader = e.target.closest('.music-widget-header'); // New: Music Widget Header
    const draggableIcon = e.target.closest('.draggable-icon');
    
    if (titlebar && !e.target.closest('.titlebar-btns')) {
      const appName = titlebar.dataset.drag;
      const win = document.getElementById('window-' + appName);
      if (!win || win.classList.contains('maximized')) return;
      dragTarget = win;
      focusWindow(appName);
      updateMenuLabel(appName);
      e.preventDefault();
    } else if (musicHeader) {
      // 2. Music Widget Context
      const musicWin = document.getElementById('music-widget');
      if (musicWin) {
        dragTarget = musicWin;
        e.preventDefault();
      }
    } else if (lofiheader) {
      // 3. Lofi Widget Context (legacy cleanup if present)
      const lofi = document.getElementById('widget-lofi');
      if (lofi) {
        dragTarget = lofi;
        e.preventDefault();
      }
    } else if (draggableIcon) {
      // 4. Desktop Icons Context
      dragTarget = draggableIcon;
      e.preventDefault();
    }

    if (dragTarget) {
      const rect = dragTarget.getBoundingClientRect();
      const parentRect = dragTarget.offsetParent ? dragTarget.offsetParent.getBoundingClientRect() : { left: 0, top: 0 };
      
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      
      const computed = getComputedStyle(dragTarget);
      
      // Only lock coordinates and clear anchors if necessary to avoid stretching
      if (computed.bottom !== 'auto' || computed.right !== 'auto' || computed.position !== 'absolute') {
        dragTarget.style.left = (rect.left - parentRect.left) + 'px';
        dragTarget.style.top = (rect.top - parentRect.top) + 'px';
        dragTarget.style.bottom = 'auto';
        dragTarget.style.right = 'auto';
        
        if (computed.position !== 'absolute') {
          dragTarget.style.position = 'absolute';
          dragTarget.style.margin = '0';
        }
      }
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (!dragTarget) return;
    const x = e.clientX - offsetX;
    const y = Math.max(32, e.clientY - offsetY); // Don't go above menu bar
    dragTarget.style.left = x + 'px';
    dragTarget.style.top = y + 'px';
  });

  document.addEventListener('mouseup', () => {
    dragTarget = null;
  });
}

// ════════════════════════════════════════════════════════════
// CONTEXT MENU
// ════════════════════════════════════════════════════════════
function initContextMenu() {
  const menu = document.getElementById('context-menu');
  const desktop = document.getElementById('desktop');

  desktop.addEventListener('contextmenu', (e) => {
    // Only show on desktop background, not on windows or dock
    if (e.target.closest('.app-window') || e.target.closest('.dock') || e.target.closest('.menu-bar')) return;

    e.preventDefault();
    menu.classList.remove('hidden');
    menu.style.left = Math.min(e.clientX, window.innerWidth - 200) + 'px';
    menu.style.top = Math.min(e.clientY, window.innerHeight - 200) + 'px';
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.context-menu')) {
      menu?.classList.add('hidden');
    }
  });
}

// ════════════════════════════════════════════════════════════
// TOAST NOTIFICATIONS
// ════════════════════════════════════════════════════════════
export function showToast(message, duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.classList.add('toast');
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ════════════════════════════════════════════════════════════
// WALLPAPER CHANGER
// ════════════════════════════════════════════════════════════
function changeBg() {
  const desktop = document.getElementById('desktop');
  if (!desktop) return;

  // Remove current bg class
  bgClasses.forEach(c => { if (c) desktop.classList.remove(c); });
  bgIndex = (bgIndex + 1) % bgClasses.length;
  if (bgClasses[bgIndex]) desktop.classList.add(bgClasses[bgIndex]);
  showToast('🎨 Wallpaper changed!');

  // Close context menu
  document.getElementById('context-menu')?.classList.add('hidden');
}

// ════════════════════════════════════════════════════════════
// CONTACT FORM
// ════════════════════════════════════════════════════════════
function handleContactSubmit(e) {
  e.preventDefault();
  showToast('✅ Message sent! (Demo — connect via email for real contact)');
  e.target.reset();
}

// ════════════════════════════════════════════════════════════
// HASH ROUTER
// ════════════════════════════════════════════════════════════
function handleHashRoute() {
  const hash = window.location.hash.slice(1);
  if (hash && apps.includes(hash)) {
    openApp(hash);
  }
}

// ════════════════════════════════════════════════════════════
// FOCUS WINDOW ON CLICK
// ════════════════════════════════════════════════════════════
function initWindowFocus() {
  document.addEventListener('mousedown', (e) => {
    const win = e.target.closest('.app-window');
    if (win) {
      const name = win.dataset.app;
      if (name) {
        focusWindow(name);
        updateMenuLabel(name);
      }
    }
  });
}

// ════════════════════════════════════════════════════════════
// LOFI MUSIC PLAYER
// ════════════════════════════════════════════════════════════
function initLofiPlayer() {
  const btn = document.getElementById('lofi-play');
  const audio = document.getElementById('lofi-audio');
  const anim = document.querySelector('.lofi-anim');
  if (!btn || !audio || !anim) return;

  btn.addEventListener('click', () => {
    if (audio.paused) {
      audio.volume = 0.5;
      audio.play().then(() => {
        btn.textContent = '⏸';
        anim.classList.add('playing');
        showToast('🎵 Playing Lofi Beats');
      }).catch(err => {
        showToast('❌ Auto-play blocked by browser. Please try again.');
        console.error(err);
      });
    } else {
      audio.pause();
      btn.textContent = '▶';
      anim.classList.remove('playing');
    }
  });
}

// ════════════════════════════════════════════════════════════
// INIT
// ════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  // Restore saved theme
  const savedTheme = localStorage.getItem('shahilos-theme');
  if (savedTheme === 'light') {
    isDarkMode = false;
    document.body.classList.add('light-mode');
    document.getElementById('icon-moon')?.classList.add('hidden');
    document.getElementById('icon-sun')?.classList.remove('hidden');
  }

  runBoot();
  initDragging();
  initContextMenu();
  initMusicWidget();
  initTerminal();
  initWindowFocus();
  tryLoadWallpaper();
  tryLoadProfilePhoto();

  updateClock();
  setInterval(updateClock, 10000);

  window.addEventListener('hashchange', handleHashRoute);
});

// Expose to global for inline handlers
window.openApp = openApp;
window.closeApp = closeApp;
window.minimizeApp = minimizeApp;
window.maximizeApp = maximizeApp;
window.changeBg = changeBg;
window.handleContactSubmit = handleContactSubmit;
window.toggleTheme = toggleTheme;

