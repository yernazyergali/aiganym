// ===== Настройки =====
const TELEGRAM_USERNAME = "yyernaz"; // ответ откроется в Telegram с готовым текстом
// =====================
const $ = s => document.querySelector(s);
const song = $('#song');
let musicOn = true;

// --- музыка: плавное нарастание ---
function fadeIn(target = 0.7, ms = 3000) {
  song.volume = 0; const t0 = performance.now();
  (function step(t) {
    const k = Math.max(0, Math.min(1, (t - t0) / ms)); song.volume = target * k;
    if (k < 1) requestAnimationFrame(step);
  })(t0);
}
$('#ready').onclick = () => {
  song.play().then(() => fadeIn()).catch(() => {});
  $('#gate').classList.add('hidden');
  $('#autumn').classList.remove('hidden');
  $('#music').classList.remove('hidden');
};
$('#music').onclick = () => {
  musicOn = !musicOn;
  $('#music').classList.toggle('off', !musicOn);
  if (musicOn) song.play().catch(() => {}); else song.pause();
};
// --- текст по словам: каждое слово появляется отдельно и переливается ---
document.querySelectorAll('[data-split]').forEach(el => {
  const esc = w => w.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  el.innerHTML = el.textContent.trim().split(/\s+/)
    .map((w, i) => `<span class="w" style="--i:${i}">${esc(w)}</span>`).join(' ');
});

// --- охапка листьев ---
const PILE_COLORS = ['#c94f35', '#e0833d', '#e9b04d', '#b8455a', '#d96c4a', '#a8462e', '#f0c66a', '#9c3a2c'];
const SHAPES = [['maple', 'maple-v'], ['leaf', 'leaf-v'], ['round', 'leaf-v'], ['maple', 'maple-v']];
(function buildPile() {
  const pile = $('#pile'); const rnd = (a, b) => a + Math.random() * (b - a);
  for (let i = 0; i < 24; i++) {
    const u = Math.random() + Math.random() - 1;            // ближе к центру — выше горка
    const x = 50 + u * 44, y = 92 - Math.random() * (1 - u * u) * 58;
    const [shape, veins] = SHAPES[i % SHAPES.length];
    const el = document.createElement('span');
    el.className = 'lf'; el.dataset.x = x; el.dataset.y = y;
    const r = rnd(-80, 80); el.dataset.r = r;
    el.style.cssText = `--x:${x}%;--y:${y}%;--w:${rnd(20, 32)}%;--z:${Math.round(y)};--r:${r}deg;` +
      `--c:${PILE_COLORS[i % PILE_COLORS.length]};--d:${rnd(-5, 0)}s;--sd:${rnd(4, 7)}s`;
    el.innerHTML = `<svg viewBox="0 0 100 100"><use href="#${shape}"/><use href="#${veins}"/><use href="#${shape}" fill="url(#shade)"/></svg>`;
    el.onclick = () => { el.classList.remove('rustle'); void el.offsetWidth; el.classList.add('rustle'); };
    pile.appendChild(el);
  }
})();
// нажали на свой листок: остальные разлетаются, он поднимается и раскрывается в письмо
$('#key').onclick = () => {
  const key = $('#key'); if (key.classList.contains('lift')) return;
  $('#autumn').classList.add('leaving');
  document.querySelectorAll('#pile .lf:not(.key)').forEach(l => {
    const dx = l.dataset.x - 50, dy = l.dataset.y - 75, len = Math.hypot(dx, dy) || 1, dist = 420 + Math.random() * 380;
    l.style.setProperty('--fx', `${dx / len * dist}px`);
    l.style.setProperty('--fy', `${dy / len * dist - 120 - Math.random() * 200}px`);
    l.style.setProperty('--fr', `${+l.dataset.r + (Math.random() - .5) * 540}deg`);
    l.style.setProperty('--dl', `${Math.random() * .35}s`);
    l.classList.add('fly');
  });
  setTimeout(() => {
    key.classList.add('lift');
    const r = key.getBoundingClientRect(); leafBurst(r.left + r.width / 2, r.top + r.height / 2, 40);
  }, 350);
  setTimeout(() => key.classList.add('gone'), 1700);
  setTimeout(() => {
    $('#autumn').classList.add('hidden');
    const l = $('#letter'); l.classList.remove('hidden'); l.classList.add('show');
    window.scrollTo(0, 0); observe(); autoplayVideos();
  }, 2500);
};
// --- видео: автозапуск без звука, пауза вне экрана ---
function autoplayVideos() {
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) e.target.play().catch(() => {}); else e.target.pause();
  }), { threshold: .35 });
  document.querySelectorAll('video').forEach(v => { v.muted = true; io.observe(v); });
}
// --- появление блоков при прокрутке ---
function observe() {
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}
// --- прогресс чтения ---
addEventListener('scroll', () => {
  const h = document.documentElement; const m = h.scrollHeight - innerHeight;
  $('#progress').style.width = (m > 0 ? h.scrollTop / m * 100 : 0) + '%';
}, { passive: true });
// --- ответ в Telegram ---
$('#yes').onclick = () => {
  $('#thanks').textContent = 'Спасибо ♥ Открываю Telegram…'; $('#thanks').classList.remove('hidden');
  const text = 'Ерназ, да, конечно, в силе ♥ Четверг, 19:00, Renee.';
  const url = `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(text)}`;
  setTimeout(() => { window.location.href = url; }, 700);
};

// --- падающие листья на фоне (той же формы, что и в охапке) ---
window.leafBurst = () => {};
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c = $('#leaves'), x = c.getContext('2d'); let W, H, leaves = [];
  const P = ['maple', 'leaf', 'round'].map(id => new Path2D($(`#${id} path`).getAttribute('d')));
  const cols = ['#d9894a', '#c2593a', '#e0b060', '#b8455a', '#e6a3ac', '#f0c66a', '#a8462e'];
  const BASE = 30;
  function size() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight; c.width = W * dpr; c.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function mk(top) { return { x: Math.random() * W, y: top ? -30 : Math.random() * H, s: 7 + Math.random() * 13,
    v: .35 + Math.random() * .8, d: Math.random() * 6.28, r: Math.random() * 6.28, w: (Math.random() - .5) * .04,
    f: Math.random() * 6.28, fs: .02 + Math.random() * .04, k: Math.floor(Math.random() * 3),
    c: cols[Math.floor(Math.random() * cols.length)], a: .2 + Math.random() * .35, vx: 0, vy: 0 }; }
  size(); addEventListener('resize', size);
  for (let i = 0; i < BASE; i++) leaves.push(mk(false));
  window.leafBurst = (cx, cy, n = 36) => {
    for (let i = 0; i < n; i++) {
      const l = mk(false), ang = Math.random() * 6.28, sp = 3 + Math.random() * 8;
      Object.assign(l, { x: cx, y: cy, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 3,
        a: .55 + Math.random() * .4, s: 8 + Math.random() * 12, burst: true });
      leaves.push(l);
    }
  };
  (function loop() {
    x.clearRect(0, 0, W, H);
    for (let i = leaves.length - 1; i >= 0; i--) {
      const l = leaves[i];
      l.x += l.vx + Math.sin(l.d) * .6; l.y += l.v + l.vy; l.vx *= .965; l.vy *= .965;
      l.d += .015; l.r += l.w; l.f += l.fs;
      if (l.burst && l.a > .3) l.a -= .003;
      if (l.y > H + 30 || l.x < -60 || l.x > W + 60) {
        if (leaves.length > BASE) leaves.splice(i, 1); else leaves[i] = mk(true);
        continue;
      }
      const sc = l.s / 50;
      x.save(); x.translate(l.x, l.y); x.rotate(l.r); x.scale(sc * Math.cos(l.f), sc); x.translate(-50, -50);
      x.globalAlpha = l.a; x.fillStyle = l.c; x.fill(P[l.k]); x.restore();
    }
    requestAnimationFrame(loop);
  })();
})();
