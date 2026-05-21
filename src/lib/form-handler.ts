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

    if (!payload.nama || !payload.wa) {
      showStatus('error', 'Mohon lengkapi Nama Lengkap dan No. WhatsApp');
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Mengirim...';
    }

    const msg = [
      `Halo admin JAGATRIP! 👋`,
      ``,
      `Saya ${payload.nama}, tertarik daftar Edutrip Malaysia-Thailand Juni 2026.`,
      `(Dari halaman: Homepage)`,
      ``,
      `Mohon konfirmasi pendaftaran saya. Terima kasih! 🙏`,
    ].join('\n');

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

    if (window.fbq) { window.fbq('track', 'Lead'); }

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
