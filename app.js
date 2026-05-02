const STORAGE_KEY = 'pasieka.v1';
const MONTHS = ['sty','lut','mar','kwi','maj','cze','lip','sie','wrz','paź','lis','gru'];
const MOOD = {
  spokojne: { label: 'Spokojne', cls: 'good' },
  normalne: { label: 'Normalne', cls: '' },
  nerwowe:  { label: 'Nerwowe',  cls: 'warn' },
  agresywne:{ label: 'Agresywne',cls: 'bad' }
};

let state = load();
let view = { name: 'list', hiveId: null };

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { hives: [] };
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function fmtDate(iso) {
  const d = new Date(iso);
  return { day: d.getDate(), month: MONTHS[d.getMonth()], year: d.getFullYear() };
}

function daysSince(iso) {
  const ms = Date.now() - new Date(iso).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

const app = document.getElementById('app');
const titleEl = document.getElementById('title');
const backBtn = document.getElementById('backBtn');
const addBtn = document.getElementById('addBtn');

function render() {
  app.innerHTML = '';
  if (view.name === 'list') renderList();
  else if (view.name === 'detail') renderDetail();
}

function renderList() {
  titleEl.textContent = 'Pasieka';
  backBtn.classList.add('hidden');
  addBtn.style.display = 'grid';

  if (!state.hives.length) {
    const tpl = document.getElementById('emptyTpl').content.cloneNode(true);
    tpl.querySelector('h2').textContent = 'Brak uli';
    tpl.querySelector('p').textContent = 'Dodaj swój pierwszy ul przyciskiem +';
    app.appendChild(tpl);
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
      const d = daysSince(last.date);
      meta.innerHTML = `<strong>${d}</strong>dni temu`;
    } else {
      meta.innerHTML = `<strong>—</strong>brak przeglądów`;
    }

    card.addEventListener('click', () => openDetail(hive.id));
    app.appendChild(tpl);
  });
}

function renderDetail() {
  const hive = state.hives.find(h => h.id === view.hiveId);
  if (!hive) { view = { name: 'list' }; render(); return; }

  titleEl.textContent = hive.name;
  backBtn.classList.remove('hidden');
  addBtn.style.display = 'grid';

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

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}

function openDetail(id) {
  view = { name: 'detail', hiveId: id };
  render();
  window.scrollTo(0, 0);
}

backBtn.onclick = () => { view = { name: 'list' }; render(); };

addBtn.onclick = () => {
  if (view.name === 'list') addHive();
  else addInspection(view.hiveId);
};

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
  view = { name: 'list' };
  render();
}

function addInspection(hiveId) {
  inspectionModal(hiveId, null);
}

function editInspection(hiveId, inspId) {
  inspectionModal(hiveId, inspId);
}

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
      { name: 'mood', label: 'Nastrój pszczół', type: 'select', value: insp?.mood ?? 'normalne',
        options: moodOptions },
      { name: 'treatment', label: 'Leczenie / zabiegi', placeholder: 'np. Apiwarol' , value: insp?.treatment ?? '' },
      { name: 'notes', label: 'Notatki', type: 'textarea', value: insp?.notes ?? '' }
    ],
    onSubmit: (data) => {
      if (insp) {
        Object.assign(insp, data);
      } else {
        hive.inspections = hive.inspections || [];
        hive.inspections.unshift({ id: uid(), ...data });
      }
      hive.inspections.sort((a, b) => b.date.localeCompare(a.date));
      save();
      render();
    }
  });
}

render();
