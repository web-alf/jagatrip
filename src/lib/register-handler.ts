import { SITE } from '../data/site';
import { getUtm } from './utm';
import { initFormGuard, lockForm, isPhoneSubmitted } from './form-guard';
import { parseIndonesianPhone } from './phone-formatter';
import { validatePhoneInput } from './form-enhancer';

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

  // Anti-spam: kunci form jika sudah pernah di-submit
  initFormGuard(form, 'register-form', '✓ Anda sudah mengirim pendaftaran. Tim JAGATRIP akan menghubungi Anda untuk langkah selanjutnya.');

  const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const statusEl = document.getElementById('register-status');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = new FormData(form);
    const payload: Record<string, string> = {};
    data.forEach((val, key) => {
      if (typeof val === 'string') payload[key] = val.trim();
    });

    // Validasi required — scroll ke field kosong pertama
    const required: [string, string][] = [
      ['nama_lengkap', 'Nama Lengkap'],
      ['nama_panggilan', 'Nama Panggilan'],
      ['alamat', 'Alamat Domisili'],
      ['wa', 'No. WhatsApp'],
      ['email', 'Email'],
      ['no_paspor', 'Nomor Paspor'],
      ['expired_paspor', 'Masa Berlaku Paspor'],
      ['kota_asal', 'Kota Asal'],
      ['bandara', 'Bandara Keberangkatan'],
      ['punya_tiket', 'Status Tiket'],
      ['ukuran_kaos', 'Ukuran Kaos'],
      ['teman_sekamar', 'Teman Sekamar'],
      ['alergi', 'Riwayat Alergi/Penyakit'],
      ['status_bayar', 'Status Pembayaran'],
      ['instansi', 'Instansi/Sekolah'],
      ['jabatan', 'Jabatan'],
      ['motivasi', 'Motivasi Ikut Trip'],
    ];
    // File required
    const requiredFiles: [string, string][] = [
      ['file_paspor', 'Upload Paspor'],
      ['file_ktp', 'Upload KTP'],
      ['file_bukti_transfer', 'Upload Bukti Transfer'],
    ];

    for (const [field, label] of required) {
      if (!payload[field]) {
        highlightField(field, label);
        return;
      }
    }

    const waInput = form.querySelector<HTMLInputElement>('input[name="wa"], input[id="r-wa"]');
    if (waInput && !validatePhoneInput(waInput)) {
      highlightField('wa', 'Nomor WhatsApp Valid (diawali 08/628)');
      return;
    }

    const parsedPhone = parseIndonesianPhone(payload['wa'] || '');
    payload['wa'] = parsedPhone.e164 || payload['wa'];
    // Conditional: rencana_tiket wajib jika punya_tiket === 'Belum'
    if (payload['punya_tiket'] === 'Belum' && !payload['rencana_tiket']) {
      highlightField('rencana_tiket', 'Rencana Tiket');
      return;
    }

    for (const [field, label] of requiredFiles) {
      const input = form.querySelector<HTMLInputElement>(`input[name="${field}"]`);
      if (!input?.files?.length) {
        highlightField(field, label);
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
          ...getUtm(),
          timestamp: new Date().toISOString(),
          source: window.location.href,
        }),
      });

      // Step 6: done
      showProgress(5);
      if (window.fbq) window.fbq('track', 'CompleteRegistration');

      const isDuplicate = isPhoneSubmitted('register-form', payload.wa);

      // Build WA message & redirect
      const msg = [
        'Halo admin JAGATRIP 👋',
        '',
        isDuplicate
          ? 'Saya sebelumnya sudah mengisi *Form Registrasi* dengan nomor ini, ingin konfirmasi status berkas saya.'
          : 'Saya sudah mengisi *Form Registrasi* di website.',
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
      lockForm(form, 'register-form', isDuplicate ? '✓ Anda sudah terdaftar sebelumnya.' : '✓ Registrasi berhasil dikirim.', payload.wa);
      window.location.href = `https://wa.me/${SITE.waNumber}?text=${encodeURIComponent(msg)}`;

    } catch {
      hideProgress();
      if (btn) { btn.classList.remove('hidden'); btn.disabled = false; btn.textContent = 'Kirim Registrasi & Lanjut ke WhatsApp →'; }
      showStatus('error', 'Gagal mengirim. Coba lagi atau hubungi admin via WhatsApp.');
    }
  });

  function highlightField(fieldName: string, label: string): void {
    // Cari element input/select/textarea
    const el = form!.querySelector<HTMLElement>(`[name="${fieldName}"]`);
    if (!el) return;

    // Scroll ke field
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Highlight border merah + shake
    el.classList.add('!border-red-500', 'reg-shake');
    setTimeout(() => el.classList.remove('reg-shake'), 600);

    // Focus
    setTimeout(() => el.focus(), 400);

    // Hapus highlight saat user mulai isi
    const clearHighlight = () => {
      el.classList.remove('!border-red-500');
      el.removeEventListener('input', clearHighlight);
      el.removeEventListener('change', clearHighlight);
    };
    el.addEventListener('input', clearHighlight);
    el.addEventListener('change', clearHighlight);

    // Warning message di bawah tombol
    showStatus('error', `⚠️ "${label}" belum diisi. Silakan lengkapi field di atas.`);
  }

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
