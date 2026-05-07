/**
 * Sticky header — toggle background saat scroll.
 *
 * Saat dekat top (scrollY < 20) header transparan menyatu dengan hero.
 * Saat user scroll ke bawah, header dapat background putih + blur + shadow
 * agar teks navbar tetap readable di atas section dengan warna apapun.
 */

export function initStickyHeader(): void {
  const header = document.getElementById('site-header');
  if (!header) return;

  const SCROLLED_CLASSES = [
    'bg-white/90',
    'backdrop-blur-md',
    'shadow-[0_4px_20px_rgba(0,0,0,0.06)]',
    'border-b',
    'border-gray-100',
  ];

  let scrolled = false;
  let raf = 0;

  const update = (): void => {
    const isScrolled = window.scrollY > 20;
    if (isScrolled === scrolled) return;
    scrolled = isScrolled;

    if (isScrolled) header.classList.add(...SCROLLED_CLASSES);
    else            header.classList.remove(...SCROLLED_CLASSES);
  };

  window.addEventListener('scroll', () => {
    if (raf) return;
    raf = window.requestAnimationFrame(() => {
      update();
      raf = 0;
    });
  }, { passive: true });

  update();
}
