// ============================================
// LUSO PAINTING — MAIN JS
// ============================================

document.addEventListener('DOMContentLoaded', () => {

  // ---- Nav scroll effect ----
  const nav = document.querySelector('.nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    });
  }

  // ---- Mobile menu ----
  const hamburger = document.querySelector('.nav__hamburger');
  const mobileMenu = document.querySelector('.nav__mobile');
  const mobileClose = document.querySelector('.nav__mobile-close');

  const openMenu = () => { mobileMenu.classList.add('open'); hamburger.classList.add('open'); document.body.style.overflow = 'hidden'; };
  const closeMenu = () => { mobileMenu.classList.remove('open'); hamburger.classList.remove('open'); document.body.style.overflow = ''; };

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => mobileMenu.classList.contains('open') ? closeMenu() : openMenu());
    mobileClose?.addEventListener('click', closeMenu);
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => e.key === 'Escape' && closeMenu());
  }

  // ---- Active nav link ----
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__links a, .nav__mobile a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (href === 'index.html' && currentPage === '')) {
      link.classList.add('active');
    }
  });

  // ---- Fade-up on scroll ----
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

  // ---- Contact form submit ----
  const form = document.querySelector('.contact-form form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      btn.textContent = '✓ Message Sent!';
      btn.style.background = '#2a7a4f';
      setTimeout(() => {
        btn.textContent = 'Send Message';
        btn.style.background = '';
        form.reset();
      }, 3000);
    });
  }

});
