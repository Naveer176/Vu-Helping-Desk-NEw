/* ============================================================
   Yahan se aap site ka WhatsApp number waghera badal sakte hain.
   Number badalne ke liye sirf neeche wali line edit karein.
   ============================================================ */
const SITE_CONFIG = {
  brandName: 'VU Helping Desk',
  tagline: 'Learn • Support • Succeed',
  whatsappNumber: '923043888632'   // country code ke sath, + ya spaces ke bina
};

function waLink(msg) {
  return 'https://wa.me/' + SITE_CONFIG.whatsappNumber + (msg ? ('?text=' + encodeURIComponent(msg)) : '');
}
