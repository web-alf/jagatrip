import { SITE } from '../data/site';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwrwCUYnuIUCflczefMlYAHdCnOD-5PMqVEL94QTPWy6Hkds6SiOQLfyo7PZpVoqtjiZg/exec';

export function initRegistrationForm(): void {
  const form = document.getElementById('daftar-form') as HTMLFormElement | null;
  if (!form) return;

  const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const statusEl = document.getElementById('form-status');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = new FormData(form);
    const payload: Record<string, string> = {};
    data.forEach((val, key) => { payload[key] = val.toString().trim(); });

    // Validasi
    const required = ['nama', 'email', 'wa', 'jabatan', 'sekolah', 'kota_asal', 'kota_berangkat', 'program'];
    for (const field of required) {
      if (!payload[field]) {
        showStatus('error', 'Mohon lengkapi semua field yang wajib diisi (*)');
        return;
      }
    }

    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Mengirim...';
    }

    // Build WA URL
    const msg = [
      `Halo admin JAGATRIP 👋`,
      ``,
      `Saya sudah mengisi form pendaftaran di website.`,
      ``,
      `📋 Data saya:`,
      `Nama: ${payload.nama}`,
      `Jabatan: ${payload.jabatan}`,
      `Sekolah/Instansi: ${payload.sekolah}`,
      `Kota Asal: ${payload.kota_asal}`,
      `Kota Berangkat: ${payload.kota_berangkat}`,
      `Program: ${payload.program}`,
      payload.peserta ? `Estimasi Peserta: ${payload.peserta}` : '',
      ``,
      `Mohon konfirmasi pendaftaran saya. Terima kasih! 🙏`,
    ].filter(Boolean).join('\n');

    const waUrl = `https://wa.me/${SITE.waNumber}?text=${encodeURIComponent(msg)}`;

    // Fire-and-forget: kirim data ke Apps Script
    fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString(),
        source: window.location.href,
      }),
    }).catch(() => {});

    // Meta Pixel: track InitiateCheckout
    if (window.fbq) {
      window.fbq('track', 'InitiateCheckout');
    }

    // Redirect ke WA (delay 300ms biar pixel sempat fire)
    setTimeout(() => {
      window.location.href = waUrl;
    }, 300);
  });

  function showStatus(type: 'success' | 'error', msg: string): void {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.className = `text-sm text-center mt-3 font-medium ${
      type === 'success' ? 'text-green-600' : 'text-red-600'
    }`;
    statusEl.classList.remove('hidden');
  }
}
