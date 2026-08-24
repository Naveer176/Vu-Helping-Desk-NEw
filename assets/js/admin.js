/* ============================================================
   Admin panel logic — login, category switch, add/delete items,
   file upload (single or bulk multi-file for Past Papers).
   ============================================================ */
let CURRENT_CAT = CONTENT_CATEGORIES[0].key;

function catByKey(key) { return CONTENT_CATEGORIES.find(c => c.key === key); }

async function checkSession() {
  const { data: { session } } = await sb.auth.getSession();
  if (session) showDashboard(session);
}

async function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-pass').value;
  const errEl = document.getElementById('login-error');
  errEl.classList.add('hidden');
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) { errEl.textContent = 'Login fail: ' + error.message; errEl.classList.remove('hidden'); return; }
  showDashboard(data.session);
}

async function doLogout() { await sb.auth.signOut(); location.reload(); }

function showDashboard(session) {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  document.getElementById('who').textContent = session.user.email;
  renderCatNav();
  selectCategory(CURRENT_CAT);
}

function renderCatNav() {
  const nav = document.getElementById('cat-nav');
  nav.innerHTML = CONTENT_CATEGORIES.map(c =>
    `<button data-cat="${c.key}" onclick="selectCategory('${c.key}')" class="cat-btn text-left px-3 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap ${c.key === CURRENT_CAT ? 'bg-maroon text-white' : 'hover:bg-maroon/5 text-ink/70'}">${c.label}</button>`
  ).join('');
}

function selectCategory(key) {
  CURRENT_CAT = key;
  renderCatNav();
  renderAddForm();
  loadItems();
}

/* ---------- ADD FORM ---------- */
function renderAddForm() {
  const cat = catByKey(CURRENT_CAT);
  const fieldsHtml = cat.fields.map(f => {
    const id = 'f_' + f.name;
    if (f.type === 'textarea') return `<div><label class="text-xs font-bold text-ink/60">${f.label}</label><textarea id="${id}" rows="4" class="w-full mt-1 px-3 py-2 rounded-lg border border-ink/15 text-sm outline-none focus:border-maroon"></textarea></div>`;
    if (f.type === 'select') return `<div><label class="text-xs font-bold text-ink/60">${f.label}</label><select id="${id}" class="w-full mt-1 px-3 py-2 rounded-lg border border-ink/15 text-sm outline-none focus:border-maroon">${f.options.map(o => `<option value="${o}">${o}</option>`).join('')}</select></div>`;
    return `<div><label class="text-xs font-bold text-ink/60">${f.label}</label><input id="${id}" type="text" class="w-full mt-1 px-3 py-2 rounded-lg border border-ink/15 text-sm outline-none focus:border-maroon"></div>`;
  }).join('');

  if (cat.bulk) {
    document.getElementById('add-form-card').innerHTML = `
      <h3 class="font-head font-bold text-sm mb-1">${cat.label}</h3>
      <p class="text-xs text-ink/50 mb-4">Ek course code likhein, phir jitni bhi PDF files select karni hain sab EK SAATH select karein — sab ek code ke sath save ho jayengi.</p>
      <div class="grid sm:grid-cols-2 gap-4">${fieldsHtml}
        <div><label class="text-xs font-bold text-ink/60">Select PDF Files (multiple)</label><input id="f_bulk_files" type="file" multiple accept="${cat.fileAccept || ''}" class="w-full mt-1 text-xs"></div>
      </div>
      <button onclick="addBulkItem()" id="add-btn" class="mt-4 px-6 py-2.5 rounded-xl bg-maroon text-white font-bold text-xs hover:opacity-90"><i class="fa-solid fa-plus mr-1"></i> Upload All</button>
      <p id="add-status" class="text-xs mt-2"></p>`;
    return;
  }

  const fileHtml = cat.allowFile ? `<div><label class="text-xs font-bold text-ink/60">${cat.fileLabel || 'Upload File (optional)'}</label><input id="f_upload_file" type="file" ${cat.fileAccept ? `accept="${cat.fileAccept}"` : ''} class="w-full mt-1 text-xs"></div>` : '';

  document.getElementById('add-form-card').innerHTML = `
    <h3 class="font-head font-bold text-sm mb-4">Add — ${cat.label}</h3>
    <div class="grid sm:grid-cols-2 gap-4">${fieldsHtml}${fileHtml}</div>
    <button onclick="addItem()" id="add-btn" class="mt-4 px-6 py-2.5 rounded-xl bg-maroon text-white font-bold text-xs hover:opacity-90"><i class="fa-solid fa-plus mr-1"></i> Add Entry</button>
    <p id="add-status" class="text-xs mt-2"></p>`;
}

async function uploadTo(folder, file) {
  const path = folder + '/' + Date.now() + '_' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const { error } = await sb.storage.from('uploads').upload(path, file);
  if (error) throw error;
  const { data } = sb.storage.from('uploads').getPublicUrl(path);
  return data.publicUrl;
}

/* ---------- ADD (normal) ---------- */
async function addItem() {
  const cat = catByKey(CURRENT_CAT);
  const status = document.getElementById('add-status');
  const btn = document.getElementById('add-btn');
  btn.disabled = true; status.textContent = 'Saving...'; status.className = 'text-xs mt-2 text-ink/50';
  try {
    const data = {};
    for (const f of cat.fields) {
      const el = document.getElementById('f_' + f.name);
      data[f.name] = el.value.trim();
      if (f.required && !data[f.name]) throw new Error(f.label + ' zaroori hai');
    }
    let file_url = null;
    const fileInput = document.getElementById('f_upload_file');
    if (fileInput && fileInput.files[0]) file_url = await uploadTo(cat.key, fileInput.files[0]);
    const { error } = await sb.from('content_items').insert({ category: cat.key, data, file_url });
    if (error) throw error;
    status.textContent = '✅ Add ho gaya!'; status.className = 'text-xs mt-2 text-emerald-600 font-bold';
    renderAddForm(); loadItems();
  } catch (e) {
    status.textContent = '❌ ' + e.message; status.className = 'text-xs mt-2 text-red-600 font-bold';
  } finally { btn.disabled = false; }
}

/* ---------- ADD (bulk multi-file, e.g. Past Papers) ---------- */
async function addBulkItem() {
  const cat = catByKey(CURRENT_CAT);
  const status = document.getElementById('add-status');
  const btn = document.getElementById('add-btn');
  btn.disabled = true; status.className = 'text-xs mt-2 text-ink/50';
  try {
    const code = document.getElementById('f_code').value.trim();
    if (!code) throw new Error('Course Code zaroori hai');
    const filesInput = document.getElementById('f_bulk_files');
    const fileList = Array.from(filesInput.files || []);
    if (!fileList.length) throw new Error('Kam az kam ek PDF select karein');

    const files = [];
    for (let i = 0; i < fileList.length; i++) {
      status.textContent = `Uploading ${i + 1}/${fileList.length}: ${fileList[i].name}...`;
      const url = await uploadTo(cat.key, fileList[i]);
      files.push({ name: fileList[i].name, url });
    }
    const { error } = await sb.from('content_items').insert({ category: cat.key, data: { code, files } });
    if (error) throw error;
    status.textContent = `✅ ${files.length} file(s) add ho gayi!`; status.className = 'text-xs mt-2 text-emerald-600 font-bold';
    renderAddForm(); loadItems();
  } catch (e) {
    status.textContent = '❌ ' + e.message; status.className = 'text-xs mt-2 text-red-600 font-bold';
  } finally { btn.disabled = false; }
}

/* ---------- LIST + DELETE ---------- */
async function loadItems() {
  const listEl = document.getElementById('items-list');
  listEl.innerHTML = '<p class="text-ink/40 text-xs">Loading...</p>';
  const { data: rows, error } = await sb.from('content_items').select('*').eq('category', CURRENT_CAT).order('created_at', { ascending: false });
  if (error) { listEl.innerHTML = '<p class="text-red-600 text-xs">Error: ' + error.message + '</p>'; return; }
  if (!rows.length) { listEl.innerHTML = '<p class="text-ink/40 text-xs">Abhi koi entry nahi hai.</p>'; return; }

  const cat = catByKey(CURRENT_CAT);
  listEl.innerHTML = rows.map(r => {
    if (cat.bulk) {
      const fileLinks = (r.data.files || []).map(f => `<a href="${f.url}" target="_blank" class="text-blue-600 underline mr-2">${f.name}</a>`).join('');
      return `<div class="flex items-start justify-between gap-3 border-b border-ink/5 pb-2">
        <div><p class="font-bold">${r.data.code} <span class="text-ink/40 font-normal">(${(r.data.files || []).length} files)</span></p><p class="text-[11px] mt-1">${fileLinks}</p></div>
        <button onclick="deleteItem('${r.id}')" class="text-xs text-red-600 font-bold px-3 py-1.5 rounded-lg hover:bg-red-50 shrink-0"><i class="fa-solid fa-trash"></i></button>
      </div>`;
    }
    const summary = cat.fields.slice(0, 2).map(f => r.data[f.name]).filter(Boolean).join(' — ');
    const link = r.file_url ? `<a href="${r.file_url}" target="_blank" class="text-blue-600 underline">file</a>` : '';
    return `<div class="flex items-center justify-between gap-3 border-b border-ink/5 pb-2">
      <div><p class="font-bold">${summary || '(untitled)'}</p><p class="text-[11px] text-ink/40">${link}</p></div>
      <button onclick="deleteItem('${r.id}')" class="text-xs text-red-600 font-bold px-3 py-1.5 rounded-lg hover:bg-red-50"><i class="fa-solid fa-trash"></i></button>
    </div>`;
  }).join('');
}

async function deleteItem(id) {
  if (!confirm('Ye entry delete karni hai?')) return;
  const { error } = await sb.from('content_items').delete().eq('id', id);
  if (error) { alert('Delete fail: ' + error.message); return; }
  loadItems();
}

window.addEventListener('DOMContentLoaded', () => {
  const wait = setInterval(() => { if (typeof sb !== 'undefined' && sb) { clearInterval(wait); checkSession(); } }, 100);
});
