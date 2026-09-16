import { SITE } from '../data/site';
import { getUtm } from './utm';
import { initFormGuard, lockForm, isPhoneSubmitted } from './form-guard';
import { parseIndonesianPhone } from './phone-formatter';
import { validatePhoneInput } from './form-enhancer';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwrwCUYnuIUCflczefMlYAHdCnOD-5PMqVEL94QTPWy6Hkds6SiOQLfyo7PZpVoqtjiZg/exec';

export function initRegistrationForm(): void {
  const form = document.getElementById('daftar-form') as HTMLFormElement | null;
  if (!form) return;

  // Anti-spam: kunci form jika sudah pernah di-submit
  initFormGuard(form, 'daftar-form', '✓ Anda sudah mengirim data pendaftaran. Tim JAGATRIP akan segera menghubungi Anda.');

  const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const statusEl = document.getElementById('form-status');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = new FormData(form);
    const payload: Record<string, string> = {};
    data.forEach((val, key) => { payload[key] = val.toString().trim(); });

    const waInput = form.querySelector<HTMLInputElement>('input[name="wa"], input[id="wa"]');
    if (waInput && !validatePhoneInput(waInput)) {
      showStatus('error', 'Format Nomor WhatsApp tidak valid.');
      return;
    }

    const parsedPhone = parseIndonesianPhone(payload.wa || '');
    payload.wa = parsedPhone.e164 || payload.wa;
    const isDuplicate = isPhoneSubmitted('daftar-form', payload.wa);

    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Mengirim...';
    }

    const msg = isDuplicate
      ? [
          `Halo admin JAGATRIP! 👋`,
          ``,
          `Saya ${payload.nama}, sebelumnya sudah mendaftar/konsultasi program JAGATRIP dengan nomor ini.`,
          `(Dari halaman: Company Profile)`,
          ``,
          `Ingin konfirmasi kelanjutan prosesnya. Terima kasih! 🙏`,
        ].join('\n')
      : [
          `Halo admin JAGATRIP! 👋`,
          ``,
          `Saya ${payload.nama}, tertarik dengan program JAGATRIP.`,
          `(Dari halaman: Company Profile)`,
          ``,
          `Mohon info detail program & pendaftaran. Terima kasih! 🙏`,
        ].join('\n');

    const waUrl = `https://wa.me/${SITE.waNumber}?text=${encodeURIComponent(msg)}`;

    // Fire-and-forget: kirim data ke Apps Script
    fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        _sheet: 'CompanyProfile',
        ...payload,
        ...getUtm(),
        timestamp: new Date().toISOString(),
        source: window.location.href,
      }),
    }).catch(() => {});

    if (window.fbq) { window.fbq('track', 'Lead'); }

    // Kunci form dan catat nomor WA
    lockForm(form, 'daftar-form', isDuplicate ? '✓ Anda sudah terdaftar sebelumnya. Mengalihkan ke WhatsApp...' : '✓ Data Anda sudah terkirim. Mengalihkan ke WhatsApp...', payload.wa);

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
