// ── SCROLL REVEAL ──
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── NAV SCROLL EFFECT ──
window.addEventListener('scroll', () => {
  const nav = document.querySelector('.main-nav');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
});

// ── NOTIFICATION HELPER ──
window.showNotification = function(msg, type = 'success') {
  const n = document.createElement('div');
  n.className = `notification ${type}`;
  n.textContent = msg;
  document.body.appendChild(n);
  setTimeout(() => {
    n.style.opacity = '0';
    n.style.transform = 'translateX(120%)';
    n.style.transition = 'all 0.4s';
    setTimeout(() => n.remove(), 400);
  }, 3500);
};

// ── ANIMATED COUNTER ──
window.animateCounter = function(el, target, duration = 2000, prefix = '', suffix = '') {
  let start = null;
  const step = (ts) => {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = prefix + Math.floor(eased * target).toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

// ── MOBILE MENU ──
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('menuToggle');
  const links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('active');
      toggle.textContent = links.classList.contains('active') ? '✕' : '☰';
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      links.classList.remove('active');
      toggle.textContent = '☰';
    }));
  }

  // Scroll reveal init
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
});