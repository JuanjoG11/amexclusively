/* =============================================
   AM EXCLUSIVELY STORE v3.0 — JavaScript
   Cart + Catalog filters + UI
   ============================================= */
'use strict';

const $ = id => document.getElementById(id);
const fmt = n => new Intl.NumberFormat('es-CO', {
  style: 'currency', currency: 'COP', maximumFractionDigits: 0
}).format(n);

/* ══════════════════════════════════════════════
   LOADER
══════════════════════════════════════════════ */
const loader = $('loader');
document.body.style.overflow = 'hidden';
window.addEventListener('load', () => {
  setTimeout(() => {
    // Scroll al top antes de mostrar para evitar nav negra de golpe
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (loader) loader.classList.add('hidden');
    document.body.style.overflow = '';
  }, 1800);
});

/* ══════════════════════════════════════════════
   CUSTOM CURSOR
══════════════════════════════════════════════ */
if (window.innerWidth > 768) {
  const cur = $('cursor'), trail = $('cursorTrail');
  if (cur && trail) {
    let tx = 0, ty = 0, mx = 0, my = 0;
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cur.style.left = mx + 'px'; cur.style.top = my + 'px';
    });
    (function loop() {
      tx += (mx - tx) * .12; ty += (my - ty) * .12;
      trail.style.left = tx + 'px'; trail.style.top = ty + 'px';
      requestAnimationFrame(loop);
    })();
    document.addEventListener('mouseleave', () => { cur.style.opacity = '0'; trail.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { cur.style.opacity = '1'; trail.style.opacity = '1'; });
    document.querySelectorAll('a,button,.p-card').forEach(el => {
      el.addEventListener('mouseenter', () => { cur.style.width = '20px'; cur.style.height = '20px'; });
      el.addEventListener('mouseleave', () => { cur.style.width = ''; cur.style.height = ''; });
    });
  }
}

/* ══════════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════════ */
const nav = $('nav');

// Desactivar transición en carga para evitar flash negro
if (nav) {
  nav.style.transition = 'none';
  // Chequear posición inicial sin animación
  if (window.scrollY > 80) {
    nav.classList.add('scrolled');
  }
  // Reactivar transición después del primer frame
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      nav.style.transition = '';
    });
  });
}

window.addEventListener('scroll', () => {
  if (!nav) return;
  if (window.scrollY > 80) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
}, { passive: true });

/* ══════════════════════════════════════════════
   HAMBURGER
══════════════════════════════════════════════ */
const hbg = $('hamburger');
const menu = $('navMenu');

if (hbg && menu) {
  hbg.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    hbg.setAttribute('aria-expanded', String(isOpen));

    const spans = hbg.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      spans[0].style.transition = 'transform .25s ease';
      spans[1].style.transition = 'transform .25s ease';
    } else {
      spans[0].style.transform = '';
      spans[1].style.transform = '';
    }
  });

  // Cerrar al hacer click en un link
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      menu.classList.remove('open');
      const spans = hbg.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.transform = '';
      hbg.setAttribute('aria-expanded', 'false');
    });
  });

  // Cerrar con Escape (también cierra carrito)
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    // Cerrar menú
    if (menu.classList.contains('open')) {
      menu.classList.remove('open');
      hbg.querySelectorAll('span').forEach(s => s.style.transform = '');
      hbg.setAttribute('aria-expanded', 'false');
    }
    // Cerrar carrito si está abierto
    closeCart();
  });
}

/* ══════════════════════════════════════════════
   HERO CANVAS — particle network
══════════════════════════════════════════════ */
const cv = $('heroCanvas');
if (cv) {
  const ctx = cv.getContext('2d');
  let W, H;
  const resize = () => { W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight; };
  window.addEventListener('resize', resize, { passive: true });
  resize();
  const pts = Array.from({ length: 110 }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3,
    r: Math.random() * 1.1 + .2, a: Math.random() * .28 + .04,
    reset() { this.x = Math.random() * W; this.y = Math.random() * H; }
  }));
  (function animate() {
    ctx.clearRect(0, 0, W, H);
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W || p.y < 0 || p.y > H) p.reset();
      ctx.save(); ctx.globalAlpha = p.a; ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    });
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
        if (d < 90) {
          ctx.save(); ctx.globalAlpha = (1 - d / 90) * .05;
          ctx.strokeStyle = '#fff'; ctx.lineWidth = .5;
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke(); ctx.restore();
        }
      }
    }
    requestAnimationFrame(animate);
  })();
}

/* ══════════════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════════════ */
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revObs.unobserve(e.target); } });
}, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

/* ══════════════════════════════════════════════
   COUNTERS
══════════════════════════════════════════════ */
function countUp(el, target) {
  const s = performance.now();
  (function u(now) {
    const p = Math.min((now - s) / 2000, 1), e = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(e * target).toLocaleString();
    if (p < 1) requestAnimationFrame(u); else el.textContent = target.toLocaleString();
  })(s);
}
const cntObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('[data-target]').forEach(el => { countUp(el, +el.dataset.target); delete el.dataset.target; });
      cntObs.unobserve(e.target);
    }
  });
}, { threshold: .3 });
// Observar la sección nosotros para los contadores
const bsStat = document.querySelector('.bs-stats');
if (bsStat) cntObs.observe(bsStat);

/* ══════════════════════════════════════════════
   HERO — JS-driven entrance animations
══════════════════════════════════════════════ */
function animateHero() {
  const lines   = document.querySelectorAll('.hero-line');
  const tag     = document.querySelector('.hero-tag');
  const desc    = document.querySelector('.hero-desc');
  const actions = document.querySelector('.hero-actions');
  const right   = document.querySelector('.hero-right');
  const scroll  = document.querySelector('.hero-scroll');
  const floats  = document.querySelector('.hero-float-info');

  // Activate immediately — staggered via setTimeout
  setTimeout(() => tag     && tag.classList.add('anim-in'),     100);
  lines.forEach((l, i) =>
    setTimeout(() => l.classList.add('anim-in'), 200 + i * 120)
  );
  setTimeout(() => desc    && desc.classList.add('anim-in'),    620);
  setTimeout(() => actions && actions.classList.add('anim-in'), 780);
  setTimeout(() => right   && right.classList.add('anim-in'),   350);
  setTimeout(() => scroll  && scroll.classList.add('anim-in'),  1400);
  setTimeout(() => floats  && floats.classList.add('anim-in'),  1000);
}

// Run after loader hides
setTimeout(animateHero, 1900);

/* ══════════════════════════════════════════════
   TILT ON CARDS
══════════════════════════════════════════════ */
document.querySelectorAll('.p-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    card.style.transform = `perspective(1000px) rotateY(${x * 4}deg) rotateX(${y * -4}deg)`;
    card.style.zIndex = '5';
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; card.style.zIndex = ''; });
});

/* ══════════════════════════════════════════════
   SIZE / COLOR SELECTORS
══════════════════════════════════════════════ */
document.querySelectorAll('.p-sizes').forEach(c =>
  c.querySelectorAll('.p-size').forEach(s =>
    s.addEventListener('click', () => {
      c.querySelectorAll('.p-size').forEach(x => x.classList.remove('active'));
      s.classList.add('active');
    })
  )
);
document.querySelectorAll('.p-colors').forEach(c =>
  c.querySelectorAll('.p-color').forEach(b =>
    b.addEventListener('click', () => {
      c.querySelectorAll('.p-color').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
    })
  )
);

/* ══════════════════════════════════════════════
   GLITCH HERO TEXT
══════════════════════════════════════════════ */
function glitch() {
  const el = document.querySelector('.hero-line--outline');
  if (!el) return;
  const orig = el.dataset.text || el.textContent;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let it = 0;
  const iv = setInterval(() => {
    el.textContent = orig.split('').map((c, i) => i < it ? orig[i] : chars[Math.floor(Math.random() * chars.length)]).join('');
    if (it >= orig.length) { clearInterval(iv); el.textContent = orig; }
    it += .5;
  }, 30);
}
setTimeout(() => { glitch(); setInterval(glitch, 8000); }, 2800);

/* ══════════════════════════════════════════════
   MARQUEE PAUSE
══════════════════════════════════════════════ */
document.querySelectorAll('.marquee-inner').forEach(el => {
  el.addEventListener('mouseenter', () => el.style.animationPlayState = 'paused');
  el.addEventListener('mouseleave', () => el.style.animationPlayState = '');
});

/* ══════════════════════════════════════════════
   CATALOG FILTERS
══════════════════════════════════════════════ */
const filterBtns = document.querySelectorAll('.cat-filter');
const catalogCards = document.querySelectorAll('#catalogGrid .p-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Update active button
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    catalogCards.forEach((card, idx) => {
      const cat = card.dataset.category;
      const show = filter === 'all' || cat === filter;

      if (show) {
        card.style.display = '';
        card.style.animationDelay = (idx % 4) * 0.05 + 's';
        card.classList.remove('hidden');
        // Trigger re-animation
        card.style.opacity = '0';
        card.style.transform = 'translateY(12px)';
        setTimeout(() => {
          card.style.transition = 'opacity .35s ease, transform .35s ease';
          card.style.opacity = '1';
          card.style.transform = '';
        }, 20 + idx * 30);
      } else {
        card.style.opacity = '0';
        card.style.transform = 'scale(.95)';
        setTimeout(() => { card.style.display = 'none'; }, 250);
      }
    });
  });
});

/* ══════════════════════════════════════════════
   🛒 CART — Product catalogue
══════════════════════════════════════════════ */
const PRODUCTS = {
  '1':  { name: 'Urban Drop Vol.1',    category: 'Camiseta · Hombre',    price: 89000  },
  '2':  { name: 'Midnight Bomber',     category: 'Chaqueta · Caballero', price: 195000 },
  '3':  { name: 'Cargo Elite',         category: 'Pantalón · Caballero', price: 129000 },
  '4':  { name: 'AM Signature',        category: 'Tenis · Unisex',       price: 249000 },
  '5':  { name: 'Classic Black Tee',   category: 'Camiseta · Hombre',    price: 79000  },
  '6':  { name: 'Oversized Drop',      category: 'Camiseta Oversized',   price: 95000  },
  '7':  { name: 'Graphic Series Vol.3',category: 'Camiseta Gráfica',     price: 105000 },
  '8':  { name: 'Varsity Edition',     category: 'Chaqueta Varsity',     price: 220000 },
  '9':  { name: 'Windbreaker Pro',     category: 'Cortaviento',          price: 175000 },
  '10': { name: 'Jogger Premium',      category: 'Jogger · Hombre',      price: 119000 },
  '11': { name: 'Slim Fit Essential',  category: 'Pantalón Slim',        price: 135000 },
  '12': { name: 'Runner X Pro',        category: 'Tenis Running',        price: 265000 },
  '13': { name: 'Lifestyle Court',     category: 'Tenis Lifestyle',      price: 229000 },
  '14': { name: 'Set Urbano AM',       category: 'Conjunto · Unisex',    price: 198000 },
  '15': { name: 'Fem Essentials',      category: 'Camiseta · Mujer',     price: 85000  },
  '16': { name: 'Fem Power Set',       category: 'Conjunto · Mujer',     price: 185000 },
};

/* ── State ── */
let cart = JSON.parse(localStorage.getItem('am-cart-v3') || '[]');
function saveCart() { localStorage.setItem('am-cart-v3', JSON.stringify(cart)); }

/* ── Helpers ── */
function totalItems() { return cart.reduce((s, i) => s + i.qty, 0); }
function totalPrice() { return cart.reduce((s, i) => s + i.price * i.qty, 0); }

/* ── Badge ── */
function updateBadge() {
  const btn = $('cartBtn'), cnt = $('cartCount');
  if (!cnt) return;
  const n = totalItems();
  cnt.textContent = n;
  cnt.classList.toggle('visible', n > 0);
  btn && btn.classList.toggle('has-items', n > 0);
}
function bumpBadge() {
  const cnt = $('cartCount');
  if (!cnt) return;
  cnt.classList.remove('bump');
  void cnt.offsetWidth;
  cnt.classList.add('bump');
}

/* ── Render ── */
function renderCart() {
  const list = $('cartItems'), empty = $('cartEmpty'), footer = $('cartFooter'), hCount = $('cartHeaderCount');
  if (!list) return;
  const n = totalItems();
  hCount && (hCount.textContent = n === 0 ? '0 items' : `${n} item${n !== 1 ? 's' : ''}`);

  if (cart.length === 0) {
    list.innerHTML = '';
    empty  && (empty.style.display  = '');
    footer && (footer.style.display = 'none');
    return;
  }
  empty  && (empty.style.display  = 'none');
  footer && (footer.style.display = '');

  list.innerHTML = cart.map((item, idx) => `
    <div class="cart-item" data-idx="${idx}">
      <div class="cart-item-thumb">
        <img src="${item.img}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover;border-radius:4px" loading="lazy" />
      </div>
      <div class="cart-item-body">
        <span class="cart-item-category">${item.category}</span>
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-meta">
          ${item.size  ? `<span class="cart-item-size">${item.size}</span>` : ''}
          ${item.color ? `<span class="cart-item-color-label">${item.color}</span>` : ''}
        </div>
        <div class="cart-item-qty">
          <button class="cart-qty-btn" data-action="decrease" data-idx="${idx}" aria-label="Disminuir">−</button>
          <span class="cart-qty-num">${item.qty}</span>
          <button class="cart-qty-btn" data-action="increase" data-idx="${idx}" aria-label="Aumentar">+</button>
        </div>
      </div>
      <div class="cart-item-price">
        <span>${fmt(item.price * item.qty)}</span>
        <button class="cart-item-remove" data-action="remove" data-idx="${idx}" aria-label="Eliminar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </button>
      </div>
    </div>
  `).join('');

  const sub = totalPrice();
  $('cartSubtotal') && ($('cartSubtotal').textContent = fmt(sub));
  $('cartTotal')    && ($('cartTotal').textContent    = fmt(sub));
}

/* ── Add to cart ── */
function addToCart(card) {
  const id    = card.dataset.id;
  const prod  = PRODUCTS[id];
  if (!prod) return;

  // Get image src from card
  const imgEl  = card.querySelector('.p-card-media img');
  const imgSrc = imgEl ? imgEl.src : '';

  // Size & color
  const sizeEl  = card.querySelector('.p-size.active');
  const colorEl = card.querySelector('.p-color.active');
  const size    = sizeEl  ? sizeEl.textContent.trim()           : '';
  const color   = colorEl ? (colorEl.getAttribute('aria-label') || '') : '';

  const key = `${id}-${size}-${color}`;
  const existing = cart.find(i => i.key === key);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ key, id, name: prod.name, category: prod.category, price: prod.price, img: imgSrc, size, color, qty: 1 });
  }
  saveCart();
  renderCart();
  updateBadge();
  bumpBadge();
  showToast(prod.name);
}

/* ── Remove ── */
function removeItem(idx) {
  cart.splice(idx, 1);
  saveCart(); renderCart(); updateBadge();
}

/* ── Change qty ── */
function changeQty(idx, delta) {
  if (!cart[idx]) return;
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) removeItem(idx);
  else { saveCart(); renderCart(); updateBadge(); }
}

/* ── Toast ── */
function showToast(name) {
  const t = $('cartToast');
  if (!t) return;
  t.innerHTML = `<span class="cart-toast-check"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></span><span><strong>${name}</strong> agregado al carrito</span>`;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 2800);
}

/* ── WhatsApp message ── */
function buildWAMessage() {
  const note = ($('cartNote') || {}).value || '';
  let msg = '🛍️ *Pedido AM Exclusively Store*\n\n';
  cart.forEach((item, i) => {
    msg += `${i + 1}. *${item.name}*\n`;
    if (item.size)  msg += `   Talla: ${item.size}\n`;
    if (item.color) msg += `   Color: ${item.color}\n`;
    msg += `   Cant: ${item.qty} · ${fmt(item.price * item.qty)}\n\n`;
  });
  msg += `---\n*Total: ${fmt(totalPrice())}*\n`;
  if (note.trim()) msg += `\nNota: ${note.trim()}`;
  msg += '\n\n¿Me pueden confirmar disponibilidad y datos de envío? Gracias 🙏';
  return encodeURIComponent(msg);
}

/* ── Open / Close drawer ── */
function openCart() {
  $('cartDrawer')  && $('cartDrawer').classList.add('open');
  $('cartOverlay') && $('cartOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  $('cartDrawer')  && $('cartDrawer').classList.remove('open');
  $('cartOverlay') && $('cartOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

/* ── Event listeners ── */
$('cartBtn')     && $('cartBtn').addEventListener('click', openCart);
$('cartClose')   && $('cartClose').addEventListener('click', closeCart);
$('cartOverlay') && $('cartOverlay').addEventListener('click', closeCart);
// Escape key handled in hamburger section above (also closes cart)

$('cartEmptyCta') && $('cartEmptyCta').addEventListener('click', () => {
  closeCart();
  document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
});

$('cartItems') && $('cartItems').addEventListener('click', e => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const idx = +btn.dataset.idx, action = btn.dataset.action;
  if (action === 'increase') changeQty(idx, 1);
  if (action === 'decrease') changeQty(idx, -1);
  if (action === 'remove')   removeItem(idx);
});

$('cartClearBtn') && $('cartClearBtn').addEventListener('click', () => {
  if (confirm('¿Vaciar el carrito?')) {
    cart = []; saveCart(); renderCart(); updateBadge();
  }
});

$('cartWaBtn') && $('cartWaBtn').addEventListener('click', () => {
  if (cart.length === 0) return;
  window.open(`https://wa.link/yx9v35?text=${buildWAMessage()}`, '_blank');
  // Si tienes el número directo: `https://wa.me/57XXXXXXXXXX?text=${buildWAMessage()}`
});

/* ── Add to cart buttons on ALL cards ── */
document.querySelectorAll('.p-card[data-id]').forEach(card => {
  const addBtn = card.querySelector('[data-action="add-to-cart"]');
  if (!addBtn) return;
  addBtn.addEventListener('click', e => {
    e.stopPropagation();
    addToCart(card);
    // Button feedback
    const span = addBtn.querySelector('span');
    if (span) {
      const orig = span.textContent;
      span.textContent = '✓ LISTO';
      addBtn.classList.add('added');
      setTimeout(() => { span.textContent = orig; addBtn.classList.remove('added'); }, 1500);
    }
  });
});

/* ── Init ── */
renderCart();
updateBadge();
