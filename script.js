// ===== Настройки =====
const TELEGRAM_USERNAME = ""; // например "yernaz" — ответ откроется в Telegram с готовым текстом
// =====================
const $ = s => document.querySelector(s);
const song = $('#song');
const pick = {};

$('#ready').onclick = () => {
  song.play().catch(() => {});
  $('#gate').classList.add('hidden');
  $('#envelope').classList.remove('hidden');
};
$('#env').onclick = () => {
  $('#envelope').classList.add('hidden');
  const l = $('#letter'); l.classList.remove('hidden'); l.classList.add('show');
  window.scrollTo(0, 0);
};
document.querySelectorAll('.chips').forEach(g => g.addEventListener('click', e => {
  const c = e.target.closest('.chip'); if (!c) return;
  g.querySelectorAll('.chip').forEach(x => x.classList.remove('on'));
  c.classList.add('on'); pick[g.dataset.group] = c.textContent;
}));
function reply(text, thanks) {
  $('#thanks').textContent = thanks; $('#thanks').classList.remove('hidden');
  if (TELEGRAM_USERNAME) window.open(`https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(text)}`, '_blank');
}
$('#yes').onclick = () => {
  if (!pick.when || !pick.where) return reply('', 'Выбери, пожалуйста, когда и куда ♥');
  reply(`Да! ${pick.when}, ${pick.where.toLowerCase()}.`, 'Спасибо, это лучшая новость дня ♥');
};
$('#think').onclick = () => reply('Мне нужно подумать.', 'Конечно. Я подожду.');

// Пока играет видео — песня на паузе
let songWasPlaying = false;
document.querySelectorAll('video').forEach(v => {
  v.addEventListener('play', () => { songWasPlaying = !song.paused; song.pause(); });
  const resume = () => { if (songWasPlaying) song.play().catch(() => {}); };
  v.addEventListener('pause', resume); v.addEventListener('ended', resume);
});
