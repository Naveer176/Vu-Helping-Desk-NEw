/* ============================================================
   Site load hote hi Supabase se admin-added content utha kar
   window.DATA object mein bhar deta hai, phir renderAll() call
   karta hai (script.js mein defined).
   ============================================================ */
window.DATA = {
  paper_reviews: [], handouts: [], past_papers: [], short_lectures: [],
  assignments: [], assignment_copy: [], gdb_copy: [], community: []
};

(async function () {
  if (!sb) { console.warn('Supabase config missing.'); if (typeof renderAll === 'function') renderAll(); return; }

  const { data: rows, error } = await sb.from('content_items').select('*').order('created_at', { ascending: false });
  if (error) { console.error('content load error:', error); if (typeof renderAll === 'function') renderAll(); return; }

  const by = key => rows.filter(r => r.category === key);

  window.DATA.paper_reviews = by('paper_reviews').map(r => ({
    id: r.id, code: r.data.code, by: r.data.by || '', date: r.data.date || '', time: r.data.time || '',
    content: (r.data.content || '').split('\n').map(s => s.trim()).filter(Boolean)
  }));

  window.DATA.handouts = by('handouts').map(r => ({ code: r.data.code, title: r.data.title || '', file_url: r.file_url || '' }));
  window.DATA.assignments = by('assignments').map(r => ({ code: r.data.code, title: r.data.title || '', file_url: r.file_url || '' }));
  window.DATA.short_lectures = by('short_lectures').map(r => ({ code: r.data.code, title: r.data.title, link: r.data.link }));
  window.DATA.assignment_copy = by('assignment_copy').map(r => ({ code: r.data.code, title: r.data.title || '', text: r.data.text }));
  window.DATA.gdb_copy = by('gdb_copy').map(r => ({ code: r.data.code, title: r.data.title || '', text: r.data.text }));
  window.DATA.community = by('community').map(r => ({ name: r.data.name, type: r.data.type, link: r.data.link }));

  // Past papers: multiple admin submissions under the same code get merged into one card
  const ppMap = {};
  by('past_papers').forEach(r => {
    const code = (r.data.code || '').toUpperCase();
    if (!ppMap[code]) ppMap[code] = { code, files: [] };
    (r.data.files || []).forEach(f => ppMap[code].files.push(f));
  });
  window.DATA.past_papers = Object.values(ppMap);

  if (typeof renderAll === 'function') renderAll();
})();
