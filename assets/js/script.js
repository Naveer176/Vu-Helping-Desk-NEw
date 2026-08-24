/* ============================================================
   VU Helping Desk — main site logic
   ============================================================ */
const TABS = [
  { key: 'reviews', label: '📝 Paper Reviews', search: true },
  { key: 'handouts', label: '📘 Handouts', search: true },
  { key: 'past_papers', label: '📄 Past Papers', search: true },
  { key: 'lectures', label: '🎥 Short Lectures', search: true },
  { key: 'extractor', label: '🧠 PDF Extractor', search: false },
  { key: 'assignments', label: '📤 Assignments', search: true },
  { key: 'gdb', label: '💬 GDB', search: true },
  { key: 'community', label: '🌐 Community', search: false }
];

let ACTIVE_TAB = 'reviews';
let ASSIGN_SUB = 'files'; // files | copy
let Q = '';
let FOLDER_OPEN = {}; // tabKey -> open course code, or null

function initHeader() {
  document.getElementById('hdr-wa-btn').href = waLink('Assalam-o-Alaikum, I need help regarding LMS.');
  const nav = document.getElementById('tabs');
  nav.innerHTML = TABS.map(t => `<button class="tab-btn ${t.key === ACTIVE_TAB ? 'active' : ''}" data-tab="${t.key}">${t.label}</button>`).join('');
  nav.querySelectorAll('.tab-btn').forEach(b => b.addEventListener('click', () => { ACTIVE_TAB = b.dataset.tab; Q = ''; renderAll(); }));
}

function renderAll() {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === ACTIVE_TAB));
  const cfg = TABS.find(t => t.key === ACTIVE_TAB);
  const showSearch = cfg.search && !FOLDER_OPEN[ACTIVE_TAB];
  const searchRow = document.getElementById('search-row');
  searchRow.innerHTML = showSearch ? `<div class="card p-3 flex items-center gap-3"><i class="fa-solid fa-magnifying-glass text-ink/30 ml-1"></i><input id="q-input" value="${Q}" placeholder="Search by course code..." class="w-full bg-transparent outline-none text-sm"></div>` : '';
  if (showSearch) document.getElementById('q-input').addEventListener('input', e => { Q = e.target.value; renderList(); });
  renderList();
}

function matchQ(code) { return !Q || (code || '').toUpperCase().includes(Q.toUpperCase()); }

function renderList() {
  const el = document.getElementById('tab-content');
  const D = window.DATA || {};
  if (ACTIVE_TAB === 'reviews') return renderReviews(el, D.paper_reviews || []);
  if (ACTIVE_TAB === 'handouts') return renderFolderSection(el, groupByCode(D.handouts || []), 'handouts', 'Handout');
  if (ACTIVE_TAB === 'past_papers') return renderFolderSection(el, pastPapersToGroups(D.past_papers || []), 'past_papers', 'Past Paper');
  if (ACTIVE_TAB === 'lectures') return renderLectures(el, D.short_lectures || []);
  if (ACTIVE_TAB === 'extractor') return renderExtractor(el);
  if (ACTIVE_TAB === 'assignments') return renderAssignments(el, D.assignments || [], D.assignment_copy || []);
  if (ACTIVE_TAB === 'gdb') return renderCopyList(el, D.gdb_copy || [], 'No GDB solutions yet.');
  if (ACTIVE_TAB === 'community') return renderCommunity(el, D.community || []);
}

/* ---------- Paper Reviews ---------- */
function renderReviews(el, arr) {
  const items = arr.filter(r => matchQ(r.code));
  el.innerHTML = items.length ? `<div class="space-y-4">${items.map(r => `
    <div class="card p-5">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <span class="badge"><i class="fa-solid fa-book-open mr-1"></i> ${r.code}</span>
        <div class="flex gap-3 text-[11px] text-ink/50 font-semibold flex-wrap">
          <span><i class="fa-regular fa-user text-maroon"></i> ${r.by || '—'}</span>
          <span><i class="fa-regular fa-calendar text-maroon"></i> ${r.date || '—'}</span>
          <span><i class="fa-regular fa-clock text-maroon"></i> ${r.time || '—'}</span>
        </div>
      </div>
      <div class="bg-ivory rounded-xl p-4 mt-4 space-y-2 border border-ink/5">
        ${r.content.map((q, i) => `<p class="text-xs text-ink/70"><span class="inline-flex w-5 h-5 rounded bg-maroon text-white text-[10px] font-bold items-center justify-center mr-2">${i + 1}</span>${q}</p>`).join('')}
      </div>
    </div>`).join('')}</div>` : emptyState('Abhi koi paper review nahi hai.');
}

/* ---------- Folder-style navigation (Handouts / Past Papers / Assignment Files) ---------- */
function groupByCode(arr) {
  const map = {};
  arr.forEach(r => { const c = (r.code || '').toUpperCase(); if (!map[c]) map[c] = { code: c, items: [] }; map[c].items.push({ title: r.title, file_url: r.file_url }); });
  return Object.values(map);
}
function pastPapersToGroups(arr) {
  return arr.map(r => ({ code: (r.code || '').toUpperCase(), items: (r.files || []).map(f => ({ title: f.name, file_url: f.url })) }));
}

function renderFolderSection(el, groups, tabKey, label) {
  groups = groups.filter(g => matchQ(g.code));
  const open = FOLDER_OPEN[tabKey];

  if (open) {
    const g = groups.find(x => x.code === open) || { code: open, items: [] };
    el.innerHTML = `
      <button id="folder-back-${tabKey}" class="btn btn-outline mb-4"><i class="fa-solid fa-arrow-left"></i> Back to folders</button>
      <div class="card p-5">
        <span class="badge mb-3 inline-block"><i class="fa-solid fa-folder-open mr-1"></i> ${g.code} — ${g.items.length} file${g.items.length !== 1 ? 's' : ''}</span>
        <div class="flex flex-wrap gap-2">
          ${g.items.length ? g.items.map(it => it.file_url ? `<a target="_blank" href="${it.file_url}" class="btn btn-outline"><i class="fa-solid fa-file-pdf text-red-500"></i> ${it.title || label}</a>` : '').join('') : emptyState('Is folder mein koi file nahi.')}
        </div>
      </div>`;
    document.getElementById('folder-back-' + tabKey).onclick = () => { FOLDER_OPEN[tabKey] = null; renderAll(); };
    return;
  }

  el.innerHTML = groups.length ? `<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">${groups.map(g => `
    <button data-code="${g.code}" class="folder-card-${tabKey} card p-5 flex flex-col items-center gap-2 text-center hover:-translate-y-0.5">
      <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold to-maroon text-white flex items-center justify-center text-2xl"><i class="fa-solid fa-folder"></i></div>
      <p class="font-head font-extrabold text-sm text-ink">${g.code}</p>
      <p class="text-[11px] text-ink/40 font-semibold">${g.items.length} file${g.items.length !== 1 ? 's' : ''}</p>
    </button>`).join('')}</div>` : emptyState(`Abhi koi ${label.toLowerCase()} nahi hai.`);
  el.querySelectorAll('.folder-card-' + tabKey).forEach(b => b.addEventListener('click', () => { FOLDER_OPEN[tabKey] = b.dataset.code; renderAll(); }));
}

/* ---------- Past Papers (grouped, multiple files per code) ---------- */

/* ---------- Short Lectures ---------- */
function renderLectures(el, arr) {
  const items = arr.filter(r => matchQ(r.code));
  el.innerHTML = items.length ? `<div class="grid sm:grid-cols-2 gap-4">${items.map(r => `
    <div class="card p-5 flex items-center justify-between gap-3">
      <div class="min-w-0"><span class="badge">${r.code}</span><p class="font-head font-bold text-sm text-ink mt-2 truncate">${r.title}</p></div>
      <a target="_blank" href="${r.link}" class="btn btn-outline shrink-0"><i class="fa-brands fa-youtube text-red-600"></i> Watch</a>
    </div>`).join('')}</div>` : emptyState('Abhi koi short lecture nahi hai.');
}

/* ---------- Assignments (Files / Copy-Paste sub-tabs) ---------- */
function renderAssignments(el, files, copies) {
  el.innerHTML = `
    <div class="flex gap-2 mb-4 bg-white p-1.5 rounded-xl border border-ink/10 w-fit">
      <button id="asub-files" class="px-4 py-2 rounded-lg text-xs font-extrabold">📄 Files</button>
      <button id="asub-copy" class="px-4 py-2 rounded-lg text-xs font-extrabold">⧉ Copy/Paste</button>
    </div>
    <div id="asub-area"></div>`;
  const styleTab = () => { document.getElementById('asub-files').className = 'px-4 py-2 rounded-lg text-xs font-extrabold ' + (ASSIGN_SUB === 'files' ? 'bg-maroon text-white' : 'text-ink/60'); document.getElementById('asub-copy').className = 'px-4 py-2 rounded-lg text-xs font-extrabold ' + (ASSIGN_SUB === 'copy' ? 'bg-maroon text-white' : 'text-ink/60'); };
  const draw = () => { styleTab(); const area = document.getElementById('asub-area'); ASSIGN_SUB === 'files' ? renderFolderSection(area, groupByCode(files), 'assignments', 'Assignment') : renderCopyList(area, copies, 'Abhi koi copy-paste solution nahi hai.'); };
  document.getElementById('asub-files').onclick = () => { ASSIGN_SUB = 'files'; draw(); };
  document.getElementById('asub-copy').onclick = () => { ASSIGN_SUB = 'copy'; draw(); };
  draw();
}

/* ---------- Copy/Paste list (Assignment copy + GDB) ---------- */
function renderCopyList(el, arr, emptyMsg) {
  const items = arr.filter(r => matchQ(r.code));
  el.innerHTML = items.length ? `<div class="space-y-4">${items.map((r, idx) => `
    <div class="card p-5">
      <div class="flex items-center justify-between gap-3 flex-wrap">
        <div><span class="badge">${r.code}</span> ${r.title ? `<span class="font-head font-bold text-sm text-ink ml-2">${r.title}</span>` : ''}</div>
        <button class="btn btn-gold copy-btn" data-idx="${idx}"><i class="fa-regular fa-copy"></i> Copy</button>
      </div>
      <pre id="cp-text-${idx}" class="bg-ivory rounded-xl p-4 mt-3 text-xs text-ink/70 whitespace-pre-wrap border border-ink/5">${escapeHtml(r.text)}</pre>
    </div>`).join('')}</div>` : emptyState(emptyMsg);
  el.querySelectorAll('.copy-btn').forEach(b => b.addEventListener('click', () => {
    const t = el.querySelector('#cp-text-' + b.dataset.idx).innerText;
    navigator.clipboard.writeText(t).then(() => { b.innerHTML = '<i class="fa-solid fa-check"></i> Copied!'; setTimeout(() => b.innerHTML = '<i class="fa-regular fa-copy"></i> Copy', 1500); });
  }));
}

/* ---------- Smart PDF Extractor (client-side, mobile friendly) ---------- */
function renderExtractor(el) {
  el.innerHTML = `
    <div class="card p-6 max-w-2xl mx-auto text-center">
      <div class="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-maroon to-maroon-deep text-white flex items-center justify-center text-2xl shadow-lg"><i class="fa-solid fa-file-shield"></i></div>
      <h3 class="font-head font-extrabold text-lg text-ink mt-4">Smart PDF Extractor</h3>
      <p class="text-xs text-ink/50 mt-2">Koi bhi PDF (paper, handout, assignment) upload karein, iska text/questions nikal kar copy karne ke liye tayyar mil jayenge — kahin bhi paste kar sakte hain.</p>
      <label class="btn btn-maroon mt-5 cursor-pointer inline-flex"><i class="fa-solid fa-cloud-arrow-up"></i> Choose PDF <input type="file" accept="application/pdf" class="hidden" id="pdfx-input"></label>
      <p id="pdfx-status" class="text-xs font-semibold mt-3 text-ink/50"></p>
    </div>
    <div id="pdfx-result" class="max-w-2xl mx-auto mt-5"></div>`;
  document.getElementById('pdfx-input').addEventListener('change', onPdfExtract);
}

async function onPdfExtract(e) {
  const file = e.target.files[0];
  if (!file) return;
  const status = document.getElementById('pdfx-status');
  const resultEl = document.getElementById('pdfx-result');
  status.textContent = 'Extracting text...'; resultEl.innerHTML = '';
  try {
    if (typeof pdfjsLib === 'undefined') throw new Error('PDF library abhi load ho rahi hai, thodi der mein dobara try karein.');
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    const buf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(it => it.str).join(' ') + '\n\n';
    }
    status.textContent = `✅ ${pdf.numPages} page(s) se text nikal liya.`;
    resultEl.innerHTML = `<div class="card p-5">
      <div class="flex items-center justify-between mb-3"><p class="font-head font-bold text-sm">Extracted Text</p><button id="pdfx-copy" class="btn btn-gold"><i class="fa-regular fa-copy"></i> Copy All</button></div>
      <pre id="pdfx-text" class="bg-ivory rounded-xl p-4 text-xs text-ink/70 whitespace-pre-wrap border border-ink/5 max-h-96 overflow-y-auto">${escapeHtml(text.trim())}</pre></div>`;
    document.getElementById('pdfx-copy').addEventListener('click', () => {
      navigator.clipboard.writeText(document.getElementById('pdfx-text').innerText);
      document.getElementById('pdfx-copy').innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
    });
  } catch (err) {
    status.textContent = '❌ ' + err.message;
  }
}

/* ---------- Community ---------- */
function renderCommunity(el, arr) {
  const groups = arr.filter(x => x.type === 'WhatsApp Group');
  const channels = arr.filter(x => x.type === 'WhatsApp Channel');
  const yt = arr.filter(x => x.type === 'YouTube Channel');
  const block = (title, icon, list, btnClass) => list.length ? `<div><h4 class="font-head font-bold text-sm text-ink/70 mb-2">${icon} ${title}</h4><div class="flex flex-wrap gap-2 mb-5">${list.map(x => `<a target="_blank" href="${x.link}" class="btn ${btnClass}">${x.name}</a>`).join('')}</div></div>` : '';
  el.innerHTML = `<div class="card p-6">
    ${block('WhatsApp Groups', '💬', groups, 'btn-green')}
    ${block('WhatsApp Channels', '📢', channels, 'btn-green')}
    ${block('YouTube Channel', '🎥', yt, 'btn-maroon')}
    ${!arr.length ? emptyState('Abhi koi community link add nahi hua.') : ''}
  </div>`;
}

function emptyState(msg) { return `<div class="empty-state">${msg}</div>`; }
function escapeHtml(s) { const d = document.createElement('div'); d.innerText = s || ''; return d.innerHTML; }

document.addEventListener('DOMContentLoaded', initHeader);
