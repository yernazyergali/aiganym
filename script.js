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
  $('#envelope').classList.remove('hidden');
  $('#music').classList.remove('hidden');
};
$('#music').onclick = () => {
  musicOn = !musicOn;
  $('#music').classList.toggle('off', !musicOn);
  if (musicOn) song.play().catch(() => {}); else song.pause();
};
// --- конверт ---
$('#env').onclick = () => {
  $('#env').classList.add('open');
  setTimeout(() => {
    $('#envelope').classList.add('hidden');
    const l = $('#letter'); l.classList.remove('hidden'); l.classList.add('show');
    window.scrollTo(0, 0); observe();
  }, 1000);
};
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

// --- пока играет видео, песня на паузе ---
let songWasPlaying = false;
document.querySelectorAll('video').forEach(v => {
  v.addEventListener('play', () => { songWasPlaying = !song.paused; song.pause(); });
  const resume = () => { if (songWasPlaying && musicOn) song.play().catch(() => {}); };
  v.addEventListener('pause', resume); v.addEventListener('ended', resume);
});

// --- падающие листья ---
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c = $('#leaves'), x = c.getContext('2d'); let W, H, leaves = [];
  const cols = ['#d9894a', '#c2593a', '#e0b060', '#b8455a', '#e6a3ac'];
  function size() { W = c.width = innerWidth; H = c.height = innerHeight; }
  function mk(top) { return { x: Math.random() * W, y: top ? -20 : Math.random() * H, s: 6 + Math.random() * 9,
    v: .3 + Math.random() * .7, d: Math.random() * 6.28, r: Math.random() * 6.28, w: .01 + Math.random() * .02,
    c: cols[Math.floor(Math.random() * cols.length)], a: .25 + Math.random() * .4 }; }
  size(); addEventListener('resize', size);
  for (let i = 0; i < 22; i++) leaves.push(mk(false));
  (function loop() {
    x.clearRect(0, 0, W, H);
    leaves.forEach((l, i) => {
      l.y += l.v; l.d += .015; l.x += Math.sin(l.d) * .6; l.r += l.w;
      if (l.y > H + 20) leaves[i] = mk(true);
      x.save(); x.translate(l.x, l.y); x.rotate(l.r); x.globalAlpha = l.a; x.fillStyle = l.c;
      x.beginPath(); x.ellipse(0, 0, l.s, l.s * .5, 0, 0, 6.28); x.fill(); x.restore();
    });
    requestAnimationFrame(loop);
  })();
})();
