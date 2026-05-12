/**
 * Zaraz custom event tracking untuk Cloudflare Zaraz.
 *
 * Events:
 * - generate_lead: saat user klik CTA WhatsApp (semua tombol daftar/konsultasi)
 * - form_submit: saat user submit form konsultasi
 *
 * Zaraz sudah di-inject oleh Cloudflare — `zaraz` tersedia di window global.
 */

declare global {
  interface Window {
    zaraz?: {
      track: (event: string, properties?: Record<string, unknown>) => void;
    };
  }
}

export function initZarazEvents(): void {
  // Track semua link WA (wa.me) sebagai generate_lead
  document.querySelectorAll<HTMLAnchorElement>('a[href*="wa.me"]').forEach(link => {
    link.addEventListener('click', () => {
      window.zaraz?.track('generate_lead', {
        source: link.textContent?.trim().slice(0, 50),
        href: link.href.split('?')[0],
      });
    });
  });

  // Track form konsultasi
  const form = document.getElementById('konsultasi-form') as HTMLFormElement | null;
  form?.addEventListener('submit', () => {
    window.zaraz?.track('form_submit', {
      form_name: 'konsultasi',
    });
  });
}
