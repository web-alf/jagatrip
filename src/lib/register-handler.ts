import { SITE } from '../data/site';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwrwCUYnuIUCflczefMlYAHdCnOD-5PMqVEL94QTPWy6Hkds6SiOQLfyo7PZpVoqtjiZg/exec';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const FILE_LABELS: Record<string, string> = {
  file_paspor: 'Paspor',
  file_ktp: 'KTP',
  file_bukti_transfer: 'Bukti Transfer',
};

const STEPS = [
  { key: 'validate', label: 'Memvalidasi data' },
  { key: 'file_paspor', label: 'Mengkonversi file Paspor' },
  { key: 'file_ktp', label: 'Mengkonversi file KTP' },
  { key: 'file_bukti_transfer', label: 'Mengkonversi file Bukti Transfer' },
  { key: 'upload', label: 'Mengupload ke server' },
  { key: 'done', label: 'Selesai! Mengalihkan ke WhatsApp' },
];

export function initRegisterForm(): void {
  const form = document.getElementById('register-form') as HTMLFormElement | null;
  if (!form) return;

  const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const statusEl = document.getElementById('register-status');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = new FormData(form);
    const payload: Record<string, string> = {};
    data.forEach((val, key) => {
      if (typeof val === 'string') payload[key] = val.trim();
    });

    // Validasi required
    const required = [
      'nama_lengkap', 'nama_panggilan', 'alamat', 'wa', 'email',
      'no_paspor', 'expired_paspor',
      'kota_asal', 'bandara', 'punya_tiket',
      'ukuran_kaos', 'teman_sekamar', 'alergi',
      'status_bayar', 'instansi', 'jabatan', 'motivasi',
    ];
    for (const field of required) {
      if (!payload[field]) {
        showStatus('error', `Mohon lengkapi field "${field.replace(/_/g, ' ')}".`);
        return;
      }
    }

    // Show progress overlay
    if (btn) btn.classList.add('hidden');
    showProgress(0);

    try {
      // Step 1: validate done
      showProgress(0);
      await sleep(200);

      // Step 2-4: file uploads → base64
      const fileFields = ['file_paspor', 'file_ktp', 'file_bukti_transfer'];
      for (let i = 0; i < fileFields.length; i++) {
        const field = fileFields[i];
        showProgress(i + 1);
        const input = form.querySelector<HTMLInputElement>(`input[name="${field}"]`);
        const file = input?.files?.[0];
        if (file) {
          if (file.size > 5 * 1024 * 1024) {
            hideProgress();
            if (btn) btn.classList.remove('hidden');
            showStatus('error', `File ${FILE_LABELS[field]} terlalu besar (maks 5MB).`);
            return;
          }
          payload[field] = await fileToBase64(file);
          payload[field + '_name'] = file.name;
          payload[field + '_type'] = file.type;
        }
        await sleep(100);
      }

      // Step 5: upload
      showProgress(4);

      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({
          _sheet: 'Registrasi',
          ...payload,
          timestamp: new Date().toISOString(),
          source: window.location.href,
        }),
      });

      // Step 6: done
      showProgress(5);
      if (window.fbq) window.fbq('track', 'CompleteRegistration');

      // Build WA message & redirect
      const msg = [
        'Halo admin JAGATRIP 👋',
        '',
        'Saya sudah mengisi *Form Registrasi Ulang* di website.',
        '',
        '📋 Data saya:',
        `Nama: ${payload.nama_lengkap}`,
        `Panggilan: ${payload.nama_panggilan}`,
        `Instansi: ${payload.instansi}`,
        `Jabatan: ${payload.jabatan}`,
        `Kota Asal: ${payload.kota_asal}`,
        `Bandara: ${payload.bandara}`,
        `Status Bayar: ${payload.status_bayar}`,
        '',
        'Mohon konfirmasi registrasi saya. Terima kasih! 🙏',
      ].join('\n');

      await sleep(1000);
      window.location.href = `https://wa.me/${SITE.waNumber}?text=${encodeURIComponent(msg)}`;

    } catch {
      hideProgress();
      if (btn) { btn.classList.remove('hidden'); btn.disabled = false; btn.textContent = 'Kirim Registrasi & Lanjut ke WhatsApp →'; }
      showStatus('error', 'Gagal mengirim. Coba lagi atau hubungi admin via WhatsApp.');
    }
  });

  function sleep(ms: number): Promise<void> {
    return new Promise(r => setTimeout(r, ms));
  }

  function showProgress(stepIndex: number): void {
    if (!statusEl) return;
    const total = STEPS.length;
    const pct = Math.round(((stepIndex + 1) / total) * 100);
    const isDone = stepIndex === total - 1;
    const current = STEPS[stepIndex];

    statusEl.innerHTML = `
      <div class="mt-6 flex flex-col items-center text-center space-y-4">
        <div class="text-4xl"><span class="reg-spin">⏳</span></div>
        <div class="w-full max-w-xs">
          <div class="h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all duration-700 ease-out ${isDone ? 'bg-green-500' : 'bg-jaga-orange'}"
                 style="width: ${pct}%"></div>
          </div>
        </div>
        <p class="text-sm font-bold ${isDone ? 'text-green-600' : 'text-gray-700'} reg-fade">${current.label}${isDone ? '' : '...'}</p>
        <p class="text-xs text-gray-400">${pct}%${isDone ? '' : ' · Jangan tutup halaman ini'}</p>
      </div>
    `;
    statusEl.classList.remove('hidden');
  }

  function hideProgress(): void {
    if (statusEl) { statusEl.innerHTML = ''; statusEl.classList.add('hidden'); }
  }

  function showStatus(type: 'success' | 'error', msg: string): void {
    if (!statusEl) return;
    statusEl.innerHTML = `<p class="text-sm text-center mt-3 font-medium ${type === 'success' ? 'text-green-600' : 'text-red-600'}">${msg}</p>`;
    statusEl.classList.remove('hidden');
  }
}
