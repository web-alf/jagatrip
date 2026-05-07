export const SITE = {
  url:         'https://jagatrip.com',
  name:        'JAGATRIP',
  legalName:   'PT JAGATRIP MITRA EDUKASI',
  tagline:     'Buka Jendela Dunia untuk Generasi Indonesia',
  subTagline:  'Ekspedisi Benchmarking Internasional · Edu-Tourism Premium',
  description: 'Program Edu-Tourism premium untuk praktisi pendidikan Indonesia. Benchmarking sekolah-sekolah terbaik dunia: kepala sekolah, guru, pengawas, pemilik yayasan.',
  waNumber:    '628139190363',
  waDisplay:   '08139190363',
  email:       'pm@jagatrip.com',
  emailLegacy: 'alfatihahtourtravel@alfatihah.com',
  operator:    'Alfatihah Tour & Travel',
  locale:      'id-ID',
  lang:        'id',
  location:    'Semarang, Indonesia',
  foundingYear: 2026,
} as const;

export const WA_URL = `https://wa.me/${SITE.waNumber}`;

export function waLink(tripName?: string, tripDate?: string): string {
  // Default message matches fix.html
  if (!tripName) {
    const defaultMsg = 'Halo admin, saya mau daftar edu-tourism Malaysia-Thailand di jagatrip.com, mohon penjelesannya. Terimakasih';
    return `https://wa.me/${SITE.waNumber}?text=${encodeURIComponent(defaultMsg)}`;
  }
  let msg = `Halo admin, saya tertarik dengan program JAGATRIP — ${tripName}`;
  if (tripDate) msg += ` (${tripDate})`;
  msg += '. Mohon info lebih lanjut. Terimakasih.';
  return `https://wa.me/${SITE.waNumber}?text=${encodeURIComponent(msg)}`;
}
