# VU Helping Desk — Setup Guide

## Agar aapke pass PEHLE se Supabase project hai (jo pehli site ke liye banaya tha)
Aap wahi project reuse kar sakte hain — koi nayi SQL chalane ki zaroorat nahi.
Bas `assets/js/supabase-config.js` mein wahi PURANI URL aur anon key daal dein
jo aapne pehle nikaali thi (Project Settings > API).

## Agar BILKUL NAYA Supabase project bana rahe hain
1. supabase.com par project banayen.
2. SQL Editor mein `supabase-schema.sql` ka poora content paste karke Run karein.
3. Project Settings > API se URL + anon key copy karein, `assets/js/supabase-config.js`
   mein paste karein.
4. Authentication > Users > Add User se apna admin email/password banayen.

## Logo
`assets/images/vhd-logo.jpg` naam se apni original VHD logo image is folder mein
daal dein (jo aapke pass WhatsApp/gallery mein hai) — index.html aur admin.html
dono isi file ko reference karte hain.

## WhatsApp number badalna ho to
`assets/js/site-config.js` file kholein, `whatsappNumber` wali line mein number
badal dein (country code ke sath, + ya spaces ke bina).

## Admin panel
`/admin.html` par jayen, apna email/password se login karein. "Past Papers"
category mein ek course code likh kar EK SAATH kai PDF files select kar sakte
hain — sab automatically usi code ke sath group ho kar site par show hongi.
