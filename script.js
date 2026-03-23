// Waitlist modal
const waitlistModal = document.getElementById('waitlist-modal');
const modalClose = document.getElementById('modal-close');

function openWaitlist() {
  waitlistModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeWaitlist() {
  waitlistModal.classList.remove('open');
  document.body.style.overflow = '';
}

document.querySelectorAll('.js-open-waitlist').forEach(el => el.addEventListener('click', openWaitlist));
modalClose?.addEventListener('click', closeWaitlist);
waitlistModal?.addEventListener('click', e => { if (e.target === waitlistModal) closeWaitlist(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeWaitlist(); });

// Theme toggle
const themeToggle = document.querySelector('.theme-toggle');
const html = document.documentElement;

function setTheme(theme, animate = false) {
  if (animate) {
    html.classList.add('theme-switching');
    setTimeout(() => html.classList.remove('theme-switching'), 650);
  }
  html.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  if (themeToggle) themeToggle.textContent = theme === 'dark' ? '☀' : '☾';
}

setTheme(localStorage.getItem('theme') || 'dark');
themeToggle?.addEventListener('click', () => {
  setTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
});

// Sticky nav on scroll
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// Scroll reveal
const revealEls = document.querySelectorAll(
  '.feature-card, .step, .cta-inner, .hero-badge, .section-heading, .section-label'
);
revealEls.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver(
  entries => entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  }),
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);
revealEls.forEach(el => observer.observe(el));

// Stagger feature cards
document.querySelectorAll('.feature-card').forEach((card, i) => {
  card.style.transitionDelay = `${i * 60}ms`;
});


// Wordmark sink-into-footer parallax
const wordmarkEl = document.querySelector('.wordmark-sticky');
const footerEl   = document.querySelector('.footer');

function updateWordmark() {
  if (!wordmarkEl || !footerEl) return;
  const footerTop = footerEl.getBoundingClientRect().top;
  const vh = window.innerHeight;

  // pixels of footer that have entered the viewport from the bottom
  // increase lookahead to start moving earlier (before footer is visible)
  const lookahead = vh * 0.05;
  const overlap = Math.max(0, vh + lookahead - footerTop);

  // smaller viewports get more movement (0.45vh at 375px → 0.25vh at 1440px+)
  const vw = window.innerWidth;
  const maxMoveFraction = Math.max(0.4, Math.min(0.85, 0.85 - (vw / 1440) * 0.45));
  const maxMove = vh * maxMoveFraction;

  const translateY = Math.min(overlap * 1.1, maxMove);
  wordmarkEl.style.transform = translateY > 0 ? `translateY(${translateY}px)` : '';
}

window.addEventListener('scroll', updateWordmark, { passive: true });
updateWordmark();

// Randomise peek logo position each cycle
document.querySelectorAll('.hero-peek-logo').forEach(el => {
  el.addEventListener('animationiteration', () => {
    if (el.classList.contains('hero-peek-top') || el.classList.contains('hero-peek-bottom')) {
      el.style.left = (25 + Math.random() * 50) + '%';
    } else {
      el.style.top = (25 + Math.random() * 40) + '%';
    }
  });
});

// Grid cell logo hover
function setupGridHover(container, cellSize, avoidContent = false) {
  let current = null;
  let lastCol = -1, lastRow = -1;
  const logoSize = Math.round(cellSize * 0.55);

  function fadeOut(el) {
    el.classList.add('fading');
    setTimeout(() => el.remove(), 1000);
  }

  function spawnLogo(col, row) {
    const el = document.createElement('img');
    el.src = 'assets/anyclaw.png';
    el.className = 'grid-cell-logo';
    el.style.width = logoSize + 'px';
    el.style.height = logoSize + 'px';
    el.style.left = (col * cellSize + cellSize / 2) + 'px';
    el.style.top  = (row * cellSize + cellSize / 2) + 'px';
    el.style.transform = `translate(-50%, -50%) rotate(${Math.random() * 60 - 30}deg)`;
    container.appendChild(el);
    return el;
  }

  container.addEventListener('mousemove', e => {
    const rect = container.getBoundingClientRect();
    const col = Math.floor((e.clientX - rect.left) / cellSize);
    const row = Math.floor((e.clientY - rect.top) / cellSize);

    if (avoidContent) {
      const elUnder = document.elementFromPoint(e.clientX, e.clientY);
      const overContent = elUnder && elUnder !== container
        && container.contains(elUnder)
        && !elUnder.classList.contains('grid-cell-logo');
      if (overContent) {
        if (current) { fadeOut(current); current = null; }
        lastCol = -1; lastRow = -1;
        return;
      }
    }

    if (col === lastCol && row === lastRow) return;
    lastCol = col;
    lastRow = row;

    if (current) fadeOut(current);
    current = spawnLogo(col, row);
  });

  container.addEventListener('mouseleave', () => {
    if (current) { fadeOut(current); current = null; }
    lastCol = -1;
    lastRow = -1;
  });
}

const heroSection = document.querySelector('.hero');
if (heroSection) setupGridHover(heroSection, 60);

const ctaSection = document.querySelector('.cta');
if (ctaSection) setupGridHover(ctaSection, 60);

document.querySelectorAll('.feature-card').forEach(card => setupGridHover(card, 40, true));

// Floating "a" → logo morph
const heroASource = document.getElementById('hero-a-source');
const floatBubble = document.getElementById('float-bubble');
const floatLetter = floatBubble?.querySelector('.float-letter');
const floatLogoImg = floatBubble?.querySelector('.float-logo-img');

if (heroASource && floatBubble) {
  function updateFloatBubble() {
    const scrollY = window.scrollY;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docH > 0 ? scrollY / docH : 0;

    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const heroEl = document.querySelector('.hero');
    const heroH = heroEl ? heroEl.offsetHeight : vh;

    // Appear immediately on scroll, but ease in gradually over 30% of hero height
    const enterProgress = Math.max(0, Math.min(1, scrollY / (heroH * 0.3)));

    if (enterProgress <= 0) {
      floatBubble.style.opacity = '0';
      floatBubble.classList.remove('drifting');
      return;
    }

    floatBubble.style.opacity = String(Math.min(1, enterProgress * 2));
    floatBubble.classList.add('drifting');

    // Start position: exact location of the "a" in the hero (viewport coords)
    const sourceRect = heroASource.getBoundingClientRect();
    const startX = sourceRect.left;
    const startY = sourceRect.top;

    // Target wandering position
    const targetX = vw * 0.5 + Math.sin(progress * Math.PI * 5) * vw * 0.28 - 40;
    const yWander = Math.cos(progress * Math.PI * 3) * vh * 0.2;
    const yDrift = vh * (0.2 + progress * 0.35);
    const targetY = Math.max(vh * 0.05, Math.min(vh * 0.82, yDrift + yWander));

    // Lerp from hero source position to wandering position
    const ease = enterProgress < 1 ? enterProgress * enterProgress * (3 - 2 * enterProgress) : 1;
    const x = startX + (targetX - startX) * ease;
    const y = startY + (targetY - startY) * ease;

    floatBubble.style.left = x + 'px';
    floatBubble.style.top = y + 'px';

    // Morph: letter → logo in last 28% of page
    const morphStart = 0.72;
    const morphProgress = Math.max(0, Math.min(1, (progress - morphStart) / (1 - morphStart)));

    if (floatLetter) floatLetter.style.opacity = String(1 - morphProgress);
    if (floatLogoImg) {
      floatLogoImg.style.opacity = String(morphProgress);
      floatLogoImg.style.transform = `scale(${0.2 + morphProgress * 0.8})`;
    }
  }

  window.addEventListener('scroll', updateFloatBubble, { passive: true });
  updateFloatBubble();
}
