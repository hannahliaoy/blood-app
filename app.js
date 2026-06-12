const form = document.getElementById('bpForm');
const entriesList = document.getElementById('entries');
const clearAllBtn = document.getElementById('clearAll');
const themeToggle = document.getElementById('themeToggle');

const STORAGE_KEY = 'bpEntries_v1';
const THEME_KEY = 'bp_theme_v1';
let entries = [];

function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    entries = raw ? JSON.parse(raw) : [];
  } catch (e) { entries = []; }
}

function saveEntries() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function createEntryElement(entry, index) {
  const li = document.createElement('li');
  li.className = 'entry';

  const left = document.createElement('div');
  left.className = 'left';

  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.textContent = entry.datetime;

  const main = document.createElement('div');
  main.className = 'small';
  main.innerHTML = `收縮壓: <strong>${entry.systolic}</strong> mmHg，舒張壓: <strong>${entry.diastolic}</strong> mmHg，脈搏: <strong>${entry.pulse}</strong> bpm`;

  const note = document.createElement('div');
  note.className = 'meta';
  note.textContent = `用藥: ${entry.medicationLabel}${entry.notes? ' — 備註: ' + entry.notes : ''}`;

  left.appendChild(meta);
  left.appendChild(main);
  left.appendChild(note);

  const right = document.createElement('div');
  right.className = 'right';
  const del = document.createElement('button');
  del.textContent = '刪除';
  del.style.background = '#ef4444';
  del.style.marginLeft = '8px';
  del.onclick = () => { entries.splice(index,1); saveEntries(); render(); };

  right.appendChild(del);

  li.appendChild(left);
  li.appendChild(right);
  return li;
}

function render() {
  entriesList.innerHTML = '';
  // newest first
  for (let i = entries.length - 1; i >= 0; i--) {
    entriesList.appendChild(createEntryElement(entries[i], i));
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const systolic = document.getElementById('systolic').value.trim();
  const diastolic = document.getElementById('diastolic').value.trim();
  const pulse = document.getElementById('pulse').value.trim();
  const medication = document.getElementById('medication').value;
  const notes = document.getElementById('notes').value.trim();

  if (!systolic || !diastolic || !pulse) {
    alert('請輸入收縮壓、舒張壓與脈搏。');
    return;
  }

  const medLabelMap = { none: '無', taken: '已服藥', not_taken: '未服藥' };

  const entry = {
    systolic: Number(systolic),
    diastolic: Number(diastolic),
    pulse: Number(pulse),
    medication,
    medicationLabel: medLabelMap[medication] || medication,
    notes,
    datetime: new Date().toLocaleString(),
  };

  entries.push(entry);
  saveEntries();
  render();
  form.reset();
});

clearAllBtn.addEventListener('click', () => {
  if (!confirm('確定要清除所有紀錄嗎？')) return;
  entries = [];
  saveEntries();
  render();
});

// init
loadEntries();
render();

// Theme handling
function applyTheme(theme) {
  if (theme === 'dark') document.documentElement.classList.add('dark');
  else document.documentElement.classList.remove('dark');
}

function loadTheme() {
  try {
    const t = localStorage.getItem(THEME_KEY) || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(t);
    if (themeToggle) themeToggle.checked = (t === 'dark');
  } catch (e) {}
}

function saveTheme(theme) {
  try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
}

if (themeToggle) {
  themeToggle.addEventListener('change', () => {
    const t = themeToggle.checked ? 'dark' : 'light';
    applyTheme(t);
    saveTheme(t);
  });
}

loadTheme();
