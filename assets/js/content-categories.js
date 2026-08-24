/* ============================================================
   Har content "category" ke fields yahan define hain.
   Admin panel isi se forms banata hai, data-loader.js isi se
   Supabase se data uthata hai.
   ============================================================ */
const CONTENT_CATEGORIES = [
  {
    key: 'paper_reviews',
    label: 'Current Paper Reviews',
    fields: [
      { name: 'code', label: 'Course Code (e.g. CS101)', type: 'text', required: true },
      { name: 'by', label: 'Shared By', type: 'text' },
      { name: 'date', label: 'Date', type: 'text' },
      { name: 'time', label: 'Time', type: 'text' },
      { name: 'content', label: 'Questions (har question ek nayi line par)', type: 'textarea', required: true }
    ]
  },
  {
    key: 'handouts',
    label: 'VU Handouts (PDF)',
    fields: [
      { name: 'code', label: 'Course Code', type: 'text', required: true },
      { name: 'title', label: 'Title', type: 'text' }
    ],
    allowFile: true,
    fileAccept: '.pdf,application/pdf',
    fileLabel: 'Upload Handout PDF'
  },
  {
    key: 'past_papers',
    label: 'Past Papers (PDF — Bulk Upload)',
    bulk: true,
    fields: [
      { name: 'code', label: 'Course Code (sab files isi code ke sath save hongi)', type: 'text', required: true }
    ],
    fileAccept: '.pdf,application/pdf'
  },
  {
    key: 'short_lectures',
    label: 'Short Lectures (YouTube)',
    fields: [
      { name: 'code', label: 'Course Code', type: 'text', required: true },
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'link', label: 'YouTube Link', type: 'text', required: true }
    ]
  },
  {
    key: 'assignments',
    label: 'Assignment Files (PDF)',
    fields: [
      { name: 'code', label: 'Course Code', type: 'text', required: true },
      { name: 'title', label: 'Title', type: 'text' }
    ],
    allowFile: true,
    fileAccept: '.pdf,application/pdf',
    fileLabel: 'Upload Assignment PDF'
  },
  {
    key: 'assignment_copy',
    label: 'Assignment — Copy/Paste Solution',
    fields: [
      { name: 'code', label: 'Course Code', type: 'text', required: true },
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'text', label: 'Solution Text', type: 'textarea', required: true }
    ]
  },
  {
    key: 'gdb_copy',
    label: 'GDB — Copy/Paste Solution',
    fields: [
      { name: 'code', label: 'Course Code', type: 'text', required: true },
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'text', label: 'Solution Text', type: 'textarea', required: true }
    ]
  },
  {
    key: 'community',
    label: 'WhatsApp / YouTube Links',
    fields: [
      { name: 'name', label: 'Name (e.g. Main Group)', type: 'text', required: true },
      { name: 'type', label: 'Type', type: 'select', options: ['WhatsApp Group', 'WhatsApp Channel', 'YouTube Channel'], required: true },
      { name: 'link', label: 'Link', type: 'text', required: true }
    ]
  }
];
