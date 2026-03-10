/* shared.js — ALSHEHAB Platform — كود مشترك بين كل الصفحات */

// ===== TOAST =====
function showToast(msg){
  const t=document.getElementById('toast');
  if(!t) return;
  t.textContent=msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2500);
}

// ===== COOKIES =====
function acceptCookies(){
  const bar = document.getElementById('cookie-bar');
  if(bar) bar.style.display='none';
  localStorage.setItem('alshehab_cookies','accepted');
  showToast('تم قبول الكوكيز ✅');
}

// ===== THEME =====
let isDark = true;
function toggleTheme(){
  isDark=!isDark;
  document.documentElement.setAttribute('data-theme', isDark?'':'light');
  localStorage.setItem('alshehab_theme', isDark?'dark':'light');
  showToast(isDark?'وضع داكن 🌙':'وضع فاتح ☀️');
}
function setMode(m){
  document.documentElement.setAttribute('data-theme', m==='light'?'light':'');
  isDark = m!=='light';
  localStorage.setItem('alshehab_theme', m);
}

// ✅ FIX #5: setColor يستقبل event كـ parameter بدل ما يعتمد على global event
function setColor(c, el){
  // Support both: onclick="setColor('green',this)" and onclick="setColor('green')"
  const target = el || (typeof event !== 'undefined' ? event?.target : null);
  if(c==='orange'){
    document.documentElement.style.setProperty('--accent','#f97316');
    document.documentElement.style.setProperty('--glow','rgba(249,115,22,0.3)');
    document.documentElement.style.setProperty('--border','rgba(249,115,22,0.2)');
  } else if(c==='blue'){
    document.documentElement.style.setProperty('--accent','#3b82f6');
    document.documentElement.style.setProperty('--glow','rgba(59,130,246,0.3)');
    document.documentElement.style.setProperty('--border','rgba(59,130,246,0.2)');
  } else if(c==='purple'){
    document.documentElement.style.setProperty('--accent','#a855f7');
    document.documentElement.style.setProperty('--glow','rgba(168,85,247,0.3)');
    document.documentElement.style.setProperty('--border','rgba(168,85,247,0.2)');
  } else {
    // green — default
    document.documentElement.style.removeProperty('--accent');
    document.documentElement.style.removeProperty('--glow');
    document.documentElement.style.removeProperty('--border');
  }
  localStorage.setItem('alshehab_color', c);
  document.querySelectorAll('.tdot').forEach(d=>d.classList.remove('active'));
  if(target) target.classList.add('active');
  showToast('تم تغيير اللون ✅');
}

function toggleSettings(){
  document.getElementById('settingsPanel').classList.toggle('show');
}

// ===== OFFLINE DETECTION =====
window.addEventListener('offline', ()=>{
  const b = document.getElementById('offlineBadge');
  if(b) b.classList.add('show');
});
window.addEventListener('online', ()=>{
  const b = document.getElementById('offlineBadge');
  if(b) b.classList.remove('show');
  showToast('عاد الاتصال بالإنترنت ✅');
});

// ===== MODAL CLOSE =====
function closeModal(id){
  const el = document.getElementById(id);
  if(el) el.classList.remove('show');
}
document.addEventListener('click', e=>{
  ['ratingModal','certModal'].forEach(id=>{
    const modal = document.getElementById(id);
    if(modal && e.target === modal) modal.classList.remove('show');
  });
});

// ===== 2FA & TOGGLES =====
function toggleTFA(){
  const el = document.getElementById('tfaToggle');
  if(!el) return;
  el.classList.toggle('on');
  showToast(el.classList.contains('on') ? 'تم تفعيل 2FA 🔐' : 'تم إيقاف 2FA');
}
function toggleSwitch(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.classList.toggle('on');
  showToast(el.classList.contains('on') ? 'تم التفعيل ✅' : 'تم الإيقاف');
}

// ===== THEME PERSISTENCE =====
(function(){
  const savedTheme = localStorage.getItem('alshehab_theme');
  if(savedTheme === 'light') {
    document.documentElement.setAttribute('data-theme','light');
    isDark = false;
  }
  // استعادة اللون المحفوظ
  const savedColor = localStorage.getItem('alshehab_color');
  if(savedColor && savedColor !== 'green') {
    const colorMap = {
      blue:   ['--accent','#3b82f6','--glow','rgba(59,130,246,0.3)','--border','rgba(59,130,246,0.2)'],
      purple: ['--accent','#a855f7','--glow','rgba(168,85,247,0.3)','--border','rgba(168,85,247,0.2)'],
      orange: ['--accent','#f97316','--glow','rgba(249,115,22,0.3)','--border','rgba(249,115,22,0.2)'],
    };
    const vals = colorMap[savedColor];
    if(vals) {
      for(let i=0;i<vals.length;i+=2)
        document.documentElement.style.setProperty(vals[i], vals[i+1]);
    }
  }
})();

// ===== MOBILE MENU =====
document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.getElementById('menuBtn');
  if(menuBtn) menuBtn.onclick = ()=>document.getElementById('sidebar')?.classList.toggle('open');
});

// ===== SHARE URL =====
function shareURL(){
  navigator.clipboard?.writeText(window.location.href);
  showToast('تم نسخ الرابط 🔗');
}

// ===== NOTIFICATIONS TOGGLE =====
function toggleNotif() {
  const drop = document.getElementById('notifDrop');
  if (!drop) return;
  const isOpen = drop.classList.contains('show');
  // أغلق لو مفتوح
  document.querySelectorAll('.notif-dropdown').forEach(d => d.classList.remove('show'));
  if (!isOpen) {
    drop.classList.add('show');
    if (typeof Notifs !== 'undefined') {
      Notifs.renderDropdown();
    }
  }
}

// أغلق الـ dropdown لو ضغط برّه
document.addEventListener('click', e => {
  if (!e.target.closest('.icon-btn') && !e.target.closest('.notif-dropdown')) {
    document.querySelectorAll('.notif-dropdown').forEach(d => d.classList.remove('show'));
  }
  if (!e.target.closest('.float-settings') && !e.target.closest('.settings-panel')) {
    document.getElementById('settingsPanel')?.classList.remove('show');
  }
});

// ===== UPDATE AVATAR =====
document.addEventListener('DOMContentLoaded', () => {
  const userData = JSON.parse(localStorage.getItem('alshehab_user') || '{}');
  const avatarBtns = document.querySelectorAll('.avatar-btn');
  if (userData.name) {
    avatarBtns.forEach(btn => btn.textContent = userData.name.charAt(0).toUpperCase());
  }
  // Load notif badge
  if (typeof Notifs !== 'undefined') {
    Notifs.updateBadge();
  }

  // إخفاء cookie bar لو وافق قبل كده
  if(localStorage.getItem('alshehab_cookies') === 'accepted') {
    const bar = document.getElementById('cookie-bar');
    if(bar) bar.style.display = 'none';
  }
});
