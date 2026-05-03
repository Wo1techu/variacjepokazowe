/* ============================================================
 * Pasieka - dziennik uli + kalendarz wychowu matek
 * ============================================================ */

const STORAGE_KEY = 'pasieka.v2';
const MONTHS = ['sty','lut','mar','kwi','maj','cze','lip','sie','wrz','paź','lis','gru'];
const DAYS = ['niedz','pon','wt','śr','czw','pt','sob'];

const MOOD = {
  spokojne: { label: 'Spokojne', cls: 'good' },
  normalne: { label: 'Normalne', cls: '' },
  nerwowe:  { label: 'Nerwowe',  cls: 'warn' },
  agresywne:{ label: 'Agresywne',cls: 'bad' }
};

/* Cykl wychowu matek - dni względem przeniesienia larw (D0)
 * Ujemne = przygotowania (odkład wychowujący) */
const REARING_TASKS = [
  { day: -9, key: 'plan', icon: '📋', critical: false, phase: 'pre',
    title: 'Plan przygotowań',
    desc: 'Wybierz najsilniejszą rodzinę na wychowującą (8-10 ramek pszczół, dużo otwartego czerwiu, młode pszczoły-mamki). Przygotuj zapas karmy, klateczki na izolację, ramki hodowlane, igłę do przeszczepu.' },
  { day: -7, key: 'starter', icon: '🏗️', critical: true, phase: 'pre',
    title: 'Utwórz odkład wychowujący',
    desc: 'Z silnej rodziny zabierz matkę + 1-2 ramki pszczół do nowego ula (odkład). Macierzysta zostaje OSIEROCONA z otwartym czerwiem, karmą i wodą - to będzie rodzina wychowująca. Pszczoły zaczną budować mateczniki ratunkowe (zniszczymy je w D-1).' },
  { day: -1, key: 'cleanup', icon: '🧹', critical: true, phase: 'pre',
    title: 'Usuń mateczniki ratunkowe',
    desc: 'Dzień przed graftowaniem - dokładnie przeglądnij rodzinę wychowującą i ZNISZCZ wszystkie mateczniki ratunkowe założone na własnych larwach. Inaczej rodzina nie przyjmie przeszczepionych larw.' },
  { day: 0, key: 'graft', icon: '🥚', critical: true, phase: 'graft',
    title: 'Przeniesienie larw (D0)',
    desc: 'Przeszczep 1-2 dniowych larw na ramki hodowlane. Ramkę hodowlaną wstaw do środka rodziny wychowującej. Najlepiej w cieple, wilgotno, szybko.' },
  { day: 1, key: 'accept', icon: '🔍', critical: false, phase: 'cells',
    title: 'Sprawdź przyjęcie larw',
    desc: 'Po 24h sprawdź ile larw zostało przyjętych przez mamki (pływają w mleczku). Niewielka strata jest normalna. Oszacuj liczbę przyszłych rodzinek weselnych.' },
  { day: 5, key: 'iso-early', icon: '🛡️', critical: false, phase: 'cells',
    title: 'Najwcześniej można izolować mateczniki',
    desc: 'Możesz już zacząć izolować mateczniki w klateczkach (4-5 pszczół na każdy). Można też poczekać do D10 - ale ANI DNIA dłużej.' },
  { day: 9, key: 'add-corpus', icon: '🍯', critical: false, phase: 'cells',
    title: 'Opcja: dodaj korpus z karmą',
    desc: 'Jeśli rodzina wychowująca ma 9 ramek czerwiu - dodaj od dołu drugi korpus z karmą i pustymi ramkami. Po wygryzieniu robotnic będzie 19 ramek + hodowlana = miejsce na 20 rodzinek weselnych.' },
  { day: 10, key: 'iso-deadline', icon: '⚠️', critical: true, phase: 'cells',
    title: 'OSTATNI dzień na izolację mateczników',
    desc: 'Najpóźniej dziś musisz zaizolować WSZYSTKIE mateczniki w klateczkach! Inaczej pierwsza wygryziona matka zabije młodsze siostry. 4-5 pszczół do każdej klateczki.' },
  { day: 11, key: 'prep', icon: '📦', critical: true, phase: 'split',
    title: 'Przygotuj sprzęt na rozdział',
    desc: 'Korpusy z dennicą czterokomorową na rodzinki weselne (jedna na matecznik). Ramki z węzą, plastry, ramki z karmą. Spryskiwacz, kwas mlekowy 15%, rękawiczki, okulary, maska, podkurzacz.' },
  { day: 12, key: 'split', icon: '👑', critical: true, phase: 'split',
    title: 'Wygryzanie + rozdział na rodzinki weselne',
    desc: '1) Wyjmij ramkę hodowlaną, sprawdź mateczniki. 2) Spryskaj ramki z pszczołami kwasem mlekowym. 3) Rozdziel pszczoły do korpusów rodzinek weselnych. 4) Włóż młodą matkę / dojrzały matecznik. 5) Daszek, transport na nowe stanowisko (>3 km).' },
  { day: 17, key: 'mating', icon: '💕', critical: false, phase: 'mating',
    title: 'Loty godowe - NIE otwieraj uli',
    desc: 'Matki latają na unasiennianie (dni 17-20). Każde otwarcie ula może spłoszyć matkę i nie wróci. Tylko obserwuj wylotki z bezpiecznej odległości.' },
  { day: 21, key: 'check-queen', icon: '🔎', critical: true, phase: 'check',
    title: 'Sprawdź czy matka żyje',
    desc: 'Delikatna, krótka kontrola. Szukasz matki lub świeżych jajeczek (małe, sterczące pionowo). Brak = matka prawdopodobnie nie wróciła z lotu.' },
  { day: 25, key: 'check-brood', icon: '🐛', critical: false, phase: 'check',
    title: 'Sprawdź wzór czerwienia',
    desc: 'Powinno już być pełne czerwienie. Oceń wzór: zwarty (dobra matka) czy rozproszony z dziurami (matka słaba lub źle unasienniona, do wymiany).' },
  { day: 35, key: 'evaluate', icon: '⭐', critical: false, phase: 'check',
    title: 'Końcowa ocena jakości matki',
    desc: 'Pełna ocena: wzór czerwiu, ilość ramek, nastrój pszczół, tempo rozwoju rodziny. Decyzja: zostawić, sprzedać czy wymienić.' }
];

/* ============================================================
 * State
 * ============================================================ */

let state = load();
let view = { tab: 'today', sub: 'list', id: null };
let detailView = localStorage.getItem('pasieka.detailView') || 'table';

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  // Try migrating from v1
  try {
    const old = localStorage.getItem('pasieka.v1');
    if (old) {
      const v1 = JSON.parse(old);
      return { hives: v1.hives || [], rearings: [] };
    }
  } catch (e) {}
  return { hives: [], rearings: [] };
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function todayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function fmtDate(iso) {
  const d = new Date(iso);
  return { day: d.getDate(), month: MONTHS[d.getMonth()], year: d.getFullYear(), dow: DAYS[d.getDay()] };
}

function addDays(iso, n) {
  const d = new Date(iso);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function daysBetween(fromIso, toIso) {
  const a = new Date(fromIso);
  const b = new Date(toIso);
  a.setHours(0,0,0,0);
  b.setHours(0,0,0,0);
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

function daysSince(iso) {
  return daysBetween(iso, todayISO());
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}

/* ============================================================
 * DOM refs + routing
 * ============================================================ */

const app = document.getElementById('app');
const titleEl = document.getElementById('title');
const backBtn = document.getElementById('backBtn');
const addBtn = document.getElementById('addBtn');
const tabsEl = document.getElementById('tabs');

tabsEl.querySelectorAll('.tab').forEach(b => {
  b.onclick = () => { view = { tab: b.dataset.tab, sub: 'list', id: null }; render(); };
});

backBtn.onclick = () => { view.sub = 'list'; view.id = null; render(); };

addBtn.onclick = () => {
  if (view.tab === 'hives' && view.sub === 'list') addHive();
  else if (view.tab === 'hives' && view.sub === 'detail') addInspection(view.id);
  else if (view.tab === 'rearing' && view.sub === 'list') addRearing();
  else if (view.tab === 'rearing' && view.sub === 'detail') {} // no add in rearing detail
};

function render() {
  app.innerHTML = '';

  const showTabs = view.sub === 'list';
  tabsEl.classList.toggle('hidden', !showTabs);
  tabsEl.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b.dataset.tab === view.tab));

  backBtn.classList.toggle('hidden', view.sub === 'list');

  let showAdd = false;
  if (view.tab === 'hives') showAdd = true;
  if (view.tab === 'rearing' && view.sub === 'list') showAdd = true;
  addBtn.classList.toggle('hidden', !showAdd);

  if (view.tab === 'today') { titleEl.textContent = 'Dziś'; renderToday(); }
  else if (view.tab === 'hives' && view.sub === 'list') { titleEl.textContent = 'Ule'; renderHives(); }
  else if (view.tab === 'hives' && view.sub === 'detail') renderHiveDetail();
  else if (view.tab === 'rearing' && view.sub === 'list') { titleEl.textContent = 'Wychów matek'; renderRearings(); }
  else if (view.tab === 'rearing' && view.sub === 'detail') renderRearingDetail();

  window.scrollTo(0, 0);
}

/* ============================================================
 * Today view - all upcoming/today tasks across all rearings
 * ============================================================ */

function renderToday() {
  const today = todayISO();
  const banner = document.createElement('div');
  banner.className = 'today-banner';
  const d = fmtDate(today);
  banner.innerHTML = `<h2>${d.dow.charAt(0).toUpperCase() + d.dow.slice(1)}, ${d.day} ${d.month}</h2>
    <p id="todayCount"></p>`;
  app.appendChild(banner);

  const items = [];
  state.rearings.forEach(r => {
    REARING_TASKS.forEach(t => {
      const date = addDays(r.graftDate, t.day);
      const days = daysBetween(today, date);
      const done = r.tasksDone?.[t.key];
      if (done) return;
      if (days < -2 || days > 7) return; // tylko -2 do +7 dni
      items.push({ rearing: r, task: t, date, days });
    });
  });

  items.sort((a, b) => a.days - b.days);

  const todayCount = items.filter(i => i.days === 0).length;
  document.getElementById('todayCount').textContent =
    todayCount ? `${todayCount} ${todayCount === 1 ? 'zadanie' : todayCount < 5 ? 'zadania' : 'zadań'} na dziś` : 'Brak zadań na dziś';

  if (!items.length) {
    const t = document.getElementById('emptyTpl').content.cloneNode(true);
    t.querySelector('h2').textContent = 'Wszystko spokojnie';
    t.querySelector('p').textContent = 'Brak pilnych zadań w najbliższych dniach. Dodaj wychów matek żeby śledzić cykl.';
    app.appendChild(t);
    return;
  }

  let lastGroup = null;
  items.forEach(item => {
    let groupLabel;
    if (item.days < 0) groupLabel = 'Zaległe';
    else if (item.days === 0) groupLabel = 'Dziś';
    else if (item.days === 1) groupLabel = 'Jutro';
    else groupLabel = 'Najbliższe dni';

    if (groupLabel !== lastGroup) {
      const h = document.createElement('div');
      h.className = 'section-title';
      h.textContent = groupLabel;
      app.appendChild(h);
      lastGroup = groupLabel;
    }

    app.appendChild(renderTaskCard(item.rearing, item.task, item.date, item.days, true));
  });
}

function renderTaskCard(rearing, task, date, days, showRearingName = false) {
  const done = rearing.tasksDone?.[task.key];
  const card = document.createElement('div');
  card.className = 'task';
  if (done) card.classList.add('done');
  if (days === 0) card.classList.add('today');
  if (days < 0 && !done) card.classList.add('overdue');
  if (days > 1) card.classList.add('future');
  if (task.critical && !done) card.classList.add('critical');

  const dt = fmtDate(date);
  const dayLabel = days === 0 ? 'DZIŚ' : days === 1 ? 'JUTRO' : days === -1 ? 'WCZORAJ' :
    days < 0 ? `${days}d` : `+${days}d`;

  card.innerHTML = `
    <div class="task-day">
      <div class="day-n">${dt.day}</div>
      <div class="day-d">${dt.month}</div>
    </div>
    <div class="task-body">
      <h3 class="task-title"><span class="task-icon">${task.icon}</span>${escapeHtml(task.title)}</h3>
      <div class="task-meta">D${task.day} cyklu · ${dayLabel}${showRearingName ? ' · ' + escapeHtml(rearing.name) : ''}</div>
      <p class="task-desc">${escapeHtml(task.desc)}</p>
    </div>
    <button class="task-check" aria-label="${done ? 'Cofnij' : 'Oznacz jako zrobione'}">${done ? '✓' : ''}</button>
  `;
  card.querySelector('.task-check').onclick = (e) => {
    e.stopPropagation();
    rearing.tasksDone = rearing.tasksDone || {};
    if (done) delete rearing.tasksDone[task.key];
    else rearing.tasksDone[task.key] = todayISO();
    save();
    render();
  };
  card.onclick = () => {
    view = { tab: 'rearing', sub: 'detail', id: rearing.id };
    render();
  };
  return card;
}

/* ============================================================
 * Hives - list + detail
 * ============================================================ */

function renderHives() {
  if (!state.hives.length) {
    const t = document.getElementById('emptyTpl').content.cloneNode(true);
    t.querySelector('h2').textContent = 'Brak uli';
    t.querySelector('p').textContent = 'Dodaj swój pierwszy ul przyciskiem +';
    app.appendChild(t);
    return;
  }

  state.hives.forEach(hive => {
    const tpl = document.getElementById('hiveCardTpl').content.cloneNode(true);
    const card = tpl.querySelector('.card');
    tpl.querySelector('.card-title').textContent = hive.name;
    const sub = [];
    if (hive.queenYear) sub.push(`Matka ${hive.queenYear}`);
    if (hive.location) sub.push(hive.location);
    tpl.querySelector('.card-sub').textContent = sub.join(' · ') || 'Brak danych';

    const last = hive.inspections?.[0];
    const meta = tpl.querySelector('.card-meta');
    if (last) {
      meta.innerHTML = `<strong>${daysSince(last.date)}</strong>dni temu`;
    } else {
      meta.innerHTML = `<strong>—</strong>brak przeglądów`;
    }

    card.addEventListener('click', () => { view = { tab: 'hives', sub: 'detail', id: hive.id }; render(); });
    app.appendChild(tpl);
  });
}

function renderHiveDetail() {
  const hive = state.hives.find(h => h.id === view.id);
  if (!hive) { view = { tab: 'hives', sub: 'list' }; render(); return; }

  titleEl.textContent = hive.name;

  const header = document.createElement('div');
  header.className = 'detail-header';
  header.innerHTML = `
    <div class="emoji">🐝</div>
    <h2>${escapeHtml(hive.name)}</h2>
    <p>${hive.queenYear ? `Matka ${hive.queenYear}` : ''}${hive.location ? ` · ${escapeHtml(hive.location)}` : ''}</p>
  `;
  app.appendChild(header);

  const inspections = hive.inspections || [];
  const last = inspections[0];
  const stats = document.createElement('div');
  stats.className = 'stats';
  stats.innerHTML = `
    <div class="stat"><div class="stat-val">${inspections.length}</div><div class="stat-lbl">Przeglądów</div></div>
    <div class="stat"><div class="stat-val">${last ? daysSince(last.date) : '—'}</div><div class="stat-lbl">Dni temu</div></div>
    <div class="stat"><div class="stat-val">${last?.honeyFrames ?? '—'}</div><div class="stat-lbl">Ramki miodu</div></div>
  `;
  app.appendChild(stats);

  const editRow = document.createElement('div');
  editRow.className = 'btn-row';
  editRow.innerHTML = `
    <button class="btn ghost" data-act="edit">Edytuj ul</button>
    <button class="btn danger" data-act="delete">Usuń</button>
  `;
  editRow.querySelector('[data-act="edit"]').onclick = () => editHive(hive.id);
  editRow.querySelector('[data-act="delete"]').onclick = () => deleteHive(hive.id);
  app.appendChild(editRow);

  const title = document.createElement('div');
  title.className = 'section-title';
  title.textContent = 'Historia przeglądów';
  app.appendChild(title);

  if (!inspections.length) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.style.padding = '20px';
    empty.textContent = 'Dodaj pierwszy przegląd przyciskiem +';
    app.appendChild(empty);
    return;
  }

  inspections.forEach(insp => {
    const d = fmtDate(insp.date);
    const tags = [];
    if (insp.queenSeen) tags.push(`<span class="tag good">Matka ✓</span>`);
    if (insp.broodFrames != null) tags.push(`<span class="tag">Czerw: ${insp.broodFrames}</span>`);
    if (insp.honeyFrames != null) tags.push(`<span class="tag">Miód: ${insp.honeyFrames}</span>`);
    if (insp.mood && MOOD[insp.mood]) tags.push(`<span class="tag ${MOOD[insp.mood].cls}">${MOOD[insp.mood].label}</span>`);
    if (insp.treatment) tags.push(`<span class="tag warn">${escapeHtml(insp.treatment)}</span>`);

    const card = document.createElement('div');
    card.className = 'inspection';
    card.innerHTML = `
      <div class="insp-date">
        <div class="day">${d.day}</div>
        <div class="month">${d.month}</div>
      </div>
      <div class="insp-body">
        <div class="insp-tags">${tags.join('')}</div>
        ${insp.notes ? `<p class="insp-notes">${escapeHtml(insp.notes)}</p>` : ''}
      </div>
    `;
    card.onclick = () => editInspection(hive.id, insp.id);
    app.appendChild(card);
  });
}

/* ============================================================
 * Rearings - list + detail
 * ============================================================ */

function renderRearings() {
  if (!state.rearings.length) {
    const t = document.getElementById('emptyTpl').content.cloneNode(true);
    t.querySelector('.empty-emoji').textContent = '👑';
    t.querySelector('h2').textContent = 'Brak wychowów';
    t.querySelector('p').textContent = 'Dodaj nowy wychów matek przyciskiem +. Wprowadź datę przeniesienia larw, a aplikacja sama wyliczy wszystkie zadania.';
    app.appendChild(t);
    return;
  }

  state.rearings.forEach(r => {
    const days = daysSince(r.graftDate);
    const total = REARING_TASKS.length;
    const done = Object.keys(r.tasksDone || {}).length;
    const finished = days >= 35;

    const card = document.createElement('article');
    card.className = 'card';

    const status = finished ? 'Zakończony' :
      days < 0 ? `Start za ${-days} dni` :
      `Dzień ${days} z 35`;

    card.innerHTML = `
      <div class="card-main">
        <div class="card-emoji">👑</div>
        <div class="card-body">
          <h3 class="card-title">${escapeHtml(r.name)}</h3>
          <p class="card-sub">${status}${r.graftCount ? ` · ${r.graftCount} larw` : ''}</p>
        </div>
        <div class="card-meta"><strong>${done}/${total}</strong>zadań</div>
      </div>
      <div class="rearing-card-progress"><div style="width: ${(done/total)*100}%"></div></div>
    `;
    card.onclick = () => { view = { tab: 'rearing', sub: 'detail', id: r.id }; render(); };
    app.appendChild(card);
  });
}

function renderRearingDetail() {
  const r = state.rearings.find(x => x.id === view.id);
  if (!r) { view = { tab: 'rearing', sub: 'list' }; render(); return; }

  titleEl.textContent = r.name;
  const days = daysSince(r.graftDate);
  const done = Object.keys(r.tasksDone || {}).length;

  const header = document.createElement('div');
  header.className = 'detail-header';
  header.innerHTML = `
    <div class="emoji">👑</div>
    <h2>${escapeHtml(r.name)}</h2>
    <p>Przeniesienie larw: ${fmtDateShort(r.graftDate)}</p>
  `;
  app.appendChild(header);

  const stats = document.createElement('div');
  stats.className = 'stats';
  const dayCell = days < 0 ? `T${days}` : days > 35 ? '35+' : `D${days}`;
  stats.innerHTML = `
    <div class="stat"><div class="stat-val">${dayCell}</div><div class="stat-lbl">Dzień cyklu</div></div>
    <div class="stat"><div class="stat-val">${r.graftCount ?? '—'}</div><div class="stat-lbl">Larw</div></div>
    <div class="stat"><div class="stat-val">${done}/${REARING_TASKS.length}</div><div class="stat-lbl">Zadania</div></div>
  `;
  app.appendChild(stats);

  const editRow = document.createElement('div');
  editRow.className = 'btn-row';
  editRow.innerHTML = `
    <button class="btn ghost" data-act="edit">Edytuj</button>
    <button class="btn danger" data-act="delete">Usuń</button>
  `;
  editRow.querySelector('[data-act="edit"]').onclick = () => editRearing(r.id);
  editRow.querySelector('[data-act="delete"]').onclick = () => deleteRearing(r.id);
  app.appendChild(editRow);

  if (r.notes) {
    const notes = document.createElement('div');
    notes.className = 'card';
    notes.style.cursor = 'default';
    notes.innerHTML = `<p style="margin:0;font-size:14px;color:var(--ink-soft);line-height:1.5;">${escapeHtml(r.notes)}</p>`;
    app.appendChild(notes);
  }

  const title = document.createElement('div');
  title.className = 'section-title';
  title.textContent = 'Harmonogram cyklu';
  app.appendChild(title);

  const toggle = document.createElement('div');
  toggle.className = 'view-toggle';
  toggle.innerHTML = `
    <button data-v="table" class="${detailView==='table'?'active':''}">📊 Tabela</button>
    <button data-v="cards" class="${detailView==='cards'?'active':''}">🗂️ Karty</button>
  `;
  toggle.querySelectorAll('button').forEach(b => {
    b.onclick = () => {
      detailView = b.dataset.v;
      localStorage.setItem('pasieka.detailView', detailView);
      render();
    };
  });
  app.appendChild(toggle);

  if (detailView === 'table') {
    app.appendChild(renderRearingTable(r));
  } else {
    REARING_TASKS.forEach(t => {
      const date = addDays(r.graftDate, t.day);
      const d = daysBetween(todayISO(), date);
      app.appendChild(renderTaskCard(r, t, date, d, false));
    });
  }
}

function renderRearingTable(r) {
  const wrap = document.createElement('div');
  wrap.className = 'cal-wrap';

  const legend = document.createElement('div');
  legend.className = 'cal-legend';
  legend.innerHTML = `
    <span><span class="dot" style="background:#faf5ff"></span>Przygotowania</span>
    <span><span class="dot" style="background:var(--accent-soft)"></span>Cykl</span>
    <span><span class="dot" style="background:var(--info-soft)"></span>Dziś</span>
    <span><span class="dot" style="background:var(--danger-soft)"></span>Zaległe</span>
    <span><span class="dot" style="background:var(--good)"></span>Zrobione</span>
  `;
  wrap.appendChild(legend);

  const table = document.createElement('table');
  table.className = 'cal';
  table.innerHTML = `
    <thead>
      <tr>
        <th>Data</th>
        <th>Dzień</th>
        <th>Zadanie</th>
        <th>✓</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;
  const tbody = table.querySelector('tbody');
  const today = todayISO();

  REARING_TASKS.forEach(t => {
    const date = addDays(r.graftDate, t.day);
    const d = daysBetween(today, date);
    const done = r.tasksDone?.[t.key];
    const dt = fmtDate(date);

    const tr = document.createElement('tr');
    if (done) tr.classList.add('row-done');
    else if (d === 0) tr.classList.add('row-today');
    else if (d < 0) tr.classList.add('row-overdue');
    if (t.critical && !done) tr.classList.add('row-critical');
    if (t.phase === 'pre') tr.classList.add('row-pre');
    if (t.phase === 'graft') tr.classList.add('row-graft');

    const dayCls = t.day < 0 ? 'neg' : t.day === 0 ? 'zero' : '';
    const dayLabel = t.day === 0 ? 'D0' : t.day < 0 ? `D${t.day}` : `D+${t.day}`;

    tr.innerHTML = `
      <td>
        <div class="t-date">${String(dt.day).padStart(2,'0')}.${String(new Date(date).getMonth()+1).padStart(2,'0')}<small>${dt.dow}</small></div>
      </td>
      <td><span class="t-day ${dayCls}">${dayLabel}</span></td>
      <td>
        <h4 class="t-title"><span class="t-icon">${t.icon}</span>${escapeHtml(t.title)}</h4>
        <p class="t-desc">${escapeHtml(t.desc)}</p>
      </td>
      <td><button class="t-check" aria-label="Oznacz">${done ? '✓' : ''}</button></td>
    `;

    tr.onclick = (e) => {
      if (e.target.closest('.t-check')) return;
      tr.classList.toggle('expanded');
    };
    tr.querySelector('.t-check').onclick = (e) => {
      e.stopPropagation();
      r.tasksDone = r.tasksDone || {};
      if (done) delete r.tasksDone[t.key];
      else r.tasksDone[t.key] = todayISO();
      save();
      render();
    };
    tbody.appendChild(tr);
  });

  wrap.appendChild(table);
  return wrap;
}

function fmtDateShort(iso) {
  const d = fmtDate(iso);
  return `${d.dow} ${d.day} ${d.month} ${d.year}`;
}

/* ============================================================
 * Modal helper
 * ============================================================ */

const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalFields = document.getElementById('modalFields');
const modalForm = document.getElementById('modalForm');
const modalCancel = document.getElementById('modalCancel');

modalCancel.onclick = () => modal.close();

function openModal({ title, fields, onSubmit }) {
  modalTitle.textContent = title;
  modalFields.innerHTML = '';
  fields.forEach(f => modalFields.appendChild(buildField(f)));

  modalForm.onsubmit = (e) => {
    e.preventDefault();
    const data = {};
    fields.forEach(f => {
      const el = modalFields.querySelector(`[name="${f.name}"]`);
      if (f.type === 'checkbox') data[f.name] = el.checked;
      else if (f.type === 'number') data[f.name] = el.value === '' ? null : Number(el.value);
      else data[f.name] = el.value.trim() || null;
    });
    onSubmit(data);
    modal.close();
  };
  modal.showModal();
}

function buildField(f) {
  const wrap = document.createElement('div');
  wrap.className = f.type === 'checkbox' ? 'checkrow' : 'field';

  if (f.type === 'checkbox') {
    wrap.innerHTML = `
      <input type="checkbox" id="f-${f.name}" name="${f.name}" ${f.value ? 'checked' : ''}>
      <label for="f-${f.name}">${f.label}</label>
    `;
    return wrap;
  }

  const label = document.createElement('label');
  label.textContent = f.label;
  label.htmlFor = `f-${f.name}`;
  wrap.appendChild(label);

  let input;
  if (f.type === 'select') {
    input = document.createElement('select');
    f.options.forEach(o => {
      const opt = document.createElement('option');
      opt.value = o.value;
      opt.textContent = o.label;
      if (o.value === f.value) opt.selected = true;
      input.appendChild(opt);
    });
  } else if (f.type === 'textarea') {
    input = document.createElement('textarea');
    if (f.value) input.value = f.value;
  } else {
    input = document.createElement('input');
    input.type = f.type || 'text';
    if (f.value != null) input.value = f.value;
    if (f.min != null) input.min = f.min;
    if (f.max != null) input.max = f.max;
    if (f.step != null) input.step = f.step;
    if (f.placeholder) input.placeholder = f.placeholder;
  }
  input.id = `f-${f.name}`;
  input.name = f.name;
  if (f.required) input.required = true;
  wrap.appendChild(input);
  return wrap;
}

/* ============================================================
 * Hive CRUD
 * ============================================================ */

function addHive() {
  openModal({
    title: 'Nowy ul',
    fields: [
      { name: 'name', label: 'Nazwa / numer', required: true, placeholder: 'np. Ul nr 1' },
      { name: 'queenYear', label: 'Rok matki', type: 'number', min: 2015, max: 2030, placeholder: '2024' },
      { name: 'location', label: 'Lokalizacja', placeholder: 'np. sad za stodołą' }
    ],
    onSubmit: (data) => {
      if (!data.name) return;
      state.hives.unshift({
        id: uid(),
        name: data.name,
        queenYear: data.queenYear,
        location: data.location,
        createdAt: new Date().toISOString(),
        inspections: []
      });
      save();
      render();
    }
  });
}

function editHive(id) {
  const hive = state.hives.find(h => h.id === id);
  if (!hive) return;
  openModal({
    title: 'Edytuj ul',
    fields: [
      { name: 'name', label: 'Nazwa / numer', required: true, value: hive.name },
      { name: 'queenYear', label: 'Rok matki', type: 'number', min: 2015, max: 2030, value: hive.queenYear ?? '' },
      { name: 'location', label: 'Lokalizacja', value: hive.location ?? '' }
    ],
    onSubmit: (data) => {
      hive.name = data.name;
      hive.queenYear = data.queenYear;
      hive.location = data.location;
      save();
      render();
    }
  });
}

function deleteHive(id) {
  if (!confirm('Usunąć ten ul i całą historię przeglądów?')) return;
  state.hives = state.hives.filter(h => h.id !== id);
  save();
  view = { tab: 'hives', sub: 'list' };
  render();
}

function addInspection(hiveId) { inspectionModal(hiveId, null); }
function editInspection(hiveId, inspId) { inspectionModal(hiveId, inspId); }

function inspectionModal(hiveId, inspId) {
  const hive = state.hives.find(h => h.id === hiveId);
  const insp = inspId ? hive.inspections.find(i => i.id === inspId) : null;
  const moodOptions = Object.entries(MOOD).map(([v, m]) => ({ value: v, label: m.label }));

  openModal({
    title: insp ? 'Edytuj przegląd' : 'Nowy przegląd',
    fields: [
      { name: 'date', label: 'Data', type: 'date', required: true, value: insp?.date ?? todayISO() },
      { name: 'queenSeen', label: 'Widziałem matkę', type: 'checkbox', value: insp?.queenSeen ?? false },
      { name: 'broodFrames', label: 'Ramki czerwiu', type: 'number', min: 0, max: 30, value: insp?.broodFrames ?? '' },
      { name: 'honeyFrames', label: 'Ramki miodu', type: 'number', min: 0, max: 30, value: insp?.honeyFrames ?? '' },
      { name: 'mood', label: 'Nastrój pszczół', type: 'select', value: insp?.mood ?? 'normalne', options: moodOptions },
      { name: 'treatment', label: 'Leczenie / zabiegi', placeholder: 'np. Apiwarol', value: insp?.treatment ?? '' },
      { name: 'notes', label: 'Notatki', type: 'textarea', value: insp?.notes ?? '' }
    ],
    onSubmit: (data) => {
      if (insp) Object.assign(insp, data);
      else {
        hive.inspections = hive.inspections || [];
        hive.inspections.unshift({ id: uid(), ...data });
      }
      hive.inspections.sort((a, b) => b.date.localeCompare(a.date));
      save();
      render();
    }
  });
}

/* ============================================================
 * Rearing CRUD
 * ============================================================ */

function addRearing() {
  openModal({
    title: 'Nowy wychów matek',
    fields: [
      { name: 'name', label: 'Nazwa wychowu', required: true, placeholder: 'np. Wiosna 2026' },
      { name: 'graftDate', label: 'Data przeniesienia larw (D0)', type: 'date', required: true, value: addDays(todayISO(), 9) },
      { name: 'graftCount', label: 'Liczba przeniesionych larw', type: 'number', min: 1, max: 100, placeholder: '24' },
      { name: 'rearingHive', label: 'Rodzina wychowująca (nazwa ula)', placeholder: 'np. Ul nr 3' },
      { name: 'motherHive', label: 'Rodzina matczyna (skąd larwy)', placeholder: 'np. Ul nr 7' },
      { name: 'notes', label: 'Notatki', type: 'textarea', placeholder: 'Linia hodowlana, plany itp.' }
    ],
    onSubmit: (data) => {
      if (!data.name || !data.graftDate) return;
      state.rearings.unshift({
        id: uid(),
        name: data.name,
        graftDate: data.graftDate,
        graftCount: data.graftCount,
        rearingHive: data.rearingHive,
        motherHive: data.motherHive,
        notes: data.notes,
        tasksDone: {},
        createdAt: new Date().toISOString()
      });
      save();
      render();
    }
  });
}

function editRearing(id) {
  const r = state.rearings.find(x => x.id === id);
  if (!r) return;
  openModal({
    title: 'Edytuj wychów',
    fields: [
      { name: 'name', label: 'Nazwa wychowu', required: true, value: r.name },
      { name: 'graftDate', label: 'Data przeniesienia larw (D0)', type: 'date', required: true, value: r.graftDate },
      { name: 'graftCount', label: 'Liczba larw', type: 'number', min: 1, max: 100, value: r.graftCount ?? '' },
      { name: 'rearingHive', label: 'Rodzina wychowująca', value: r.rearingHive ?? '' },
      { name: 'motherHive', label: 'Rodzina matczyna', value: r.motherHive ?? '' },
      { name: 'notes', label: 'Notatki', type: 'textarea', value: r.notes ?? '' }
    ],
    onSubmit: (data) => {
      Object.assign(r, data);
      save();
      render();
    }
  });
}

function deleteRearing(id) {
  if (!confirm('Usunąć ten wychów i wszystkie zaznaczone zadania?')) return;
  state.rearings = state.rearings.filter(x => x.id !== id);
  save();
  view = { tab: 'rearing', sub: 'list' };
  render();
}

/* ============================================================
 * Boot
 * ============================================================ */

render();
