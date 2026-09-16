/**
 * Form Guard — cegah submit berulang (anti-spam kombo: LocalStorage + Nomor WhatsApp).
 *
 * Setelah form berhasil di-submit, form dikunci (disable inputs + button)
 * dan flag formId serta nomor WhatsApp disimpan di localStorage.
 * Saat user kembali ke halaman, form tetap terkunci dan nomor WA dikenali.
 */

const STORAGE_KEY = 'jagatrip_form_submitted';
const PHONES_KEY = 'jagatrip_submitted_phones';

/** Normalisasi nomor telepon standar internasional (628...) */
export function normalizePhoneForGuard(phone: string): string {
  if (!phone) return '';
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) clean = '62' + clean.slice(1);
  return clean;
}

/** Cek apakah form (berdasarkan formId) sudah pernah di-submit di browser ini */
export function isFormSubmitted(formId: string): boolean {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return false;
    const submitted: string[] = JSON.parse(data);
    return submitted.includes(formId);
  } catch {
    return false;
  }
}

/** Cek apakah nomor WhatsApp tertentu sudah pernah di-submit untuk formId ini */
export function isPhoneSubmitted(formId: string, phone: string): boolean {
  try {
    const clean = normalizePhoneForGuard(phone);
    if (!clean) return false;
    const data = localStorage.getItem(PHONES_KEY);
    if (!data) return false;
    const map: Record<string, string[]> = JSON.parse(data);
    const list = map[formId] || [];
    return list.includes(clean);
  } catch {
    return false;
  }
}

/** Catat nomor WhatsApp yang sudah di-submit ke penyimpanan lokal */
export function recordSubmittedPhone(formId: string, phone: string): void {
  try {
    const clean = normalizePhoneForGuard(phone);
    if (!clean) return;
    const data = localStorage.getItem(PHONES_KEY);
    const map: Record<string, string[]> = data ? JSON.parse(data) : {};
    if (!map[formId]) map[formId] = [];
    if (!map[formId].includes(clean)) {
      map[formId].push(clean);
      localStorage.setItem(PHONES_KEY, JSON.stringify(map));
    }
  } catch {
    // localStorage mungkin unavailable (incognito) — abaikan
  }
}

/** Ambil nomor WhatsApp terakhir yang pernah di-submit untuk form ini */
export function getLatestSubmittedPhone(formId: string): string | null {
  try {
    const data = localStorage.getItem(PHONES_KEY);
    if (!data) return null;
    const map: Record<string, string[]> = JSON.parse(data);
    const list = map[formId];
    return (list && list.length > 0) ? list[list.length - 1] : null;
  } catch {
    return null;
  }
}

/** Tandai form sudah di-submit, simpan nomor WA (jika ada), & kunci form-nya */
export function lockForm(form: HTMLFormElement, formId: string, message?: string, phone?: string): void {
  // Simpan flag formId
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const submitted: string[] = data ? JSON.parse(data) : [];
    if (!submitted.includes(formId)) {
      submitted.push(formId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(submitted));
    }
  } catch {
    // localStorage mungkin unavailable (incognito) — abaikan
  }

  // Simpan nomor telepon jika disertakan
  if (phone) {
    recordSubmittedPhone(formId, phone);
  }

  // Kunci semua input + button
  form.querySelectorAll('input, select, textarea, button').forEach((el) => {
    (el as HTMLInputElement).disabled = true;
  });

  // Tampilkan pesan jika ada status element
  if (message) {
    const status = form.querySelector('[class*="status"], [id*="status"]');
    if (status) {
      status.textContent = message;
      status.className = status.className.replace(/ok|err/g, '').trim() + ' ok';
      (status as HTMLElement).hidden = false;
    }
  }
}

/**
 * Inisialisasi guard untuk sebuah form.
 * Panggil di DOMContentLoaded — jika form sudah pernah di-submit, kunci otomatis.
 */
export function initFormGuard(form: HTMLFormElement | null, formId: string, message?: string): void {
  if (!form) return;
  if (isFormSubmitted(formId)) {
    lockForm(form, formId, message ?? '✓ Anda sudah mengirim data. Form ini tidak bisa diisi lagi.');
  }
}

