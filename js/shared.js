/* shared.js — ALSHHAB Platform — كود مشترك بين كل الصفحات */

// ===== TOAST =====
function showToast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2500);
}

// ===== COOKIES =====
function acceptCookies(){
  document.getElementById('cookie-bar').style.display='none';
  showToast('تم قبول  ✅');
}

// ===== THEME =====
let isDark = true;
function toggleTheme(){
  isDark=!isDark;
  document.documentElement.setAttribute('data-theme', isDark?'':'light');
  localStorage.setItem('alshhab_theme', isDark?'dark':'light');
  showToast(isDark?'وضع داكن 🌙':'وضع فاتح ☀️');
}
function setMode(m){
  document.documentElement.setAttribute('data-theme', m==='light'?'light':'');
  isDark = m!=='light';
}
function setColor(c){
  const themes = {green:'',blue:'blue',purple:'purple',orange:''};
  if(c==='orange'){
    document.documentElement.style.setProperty('--accent','#f97316');
    document.documentElement.style.setProperty('--glow','rgba(249,115,22,0.3)');
    document.documentElement.style.setProperty('--border','rgba(249,115,22,0.2)');
  } else {
    document.documentElement.removeAttribute('style');
    if(themes[c]) document.documentElement.setAttribute('data-theme',themes[c]);
    else document.documentElement.removeAttribute('data-theme');
  }
  document.querySelectorAll('.tdot').forEach(d=>d.classList.remove('active'));
  event.target.classList.add('active');
  showToast('تم تغيير اللون ✅');
}
function toggleSettings(){
  document.getElementById('settingsPanel').classList.toggle('show');
}

// ===== NOTIFICATIONS =====
function toggleNotif(){
  document.getElementById('notifDrop').classList.toggle('show');
}
document.addEventListener('click', e=>{
  if(!e.target.closest('.icon-btn')) {
    const d = document.getElementById('notifDrop');
    if(d) d.classList.remove('show');
  }
});

// ===== OFFLINE DETECTION =====
window.addEventListener('offline', ()=>{
  document.getElementById('offlineBadge').classList.add('show');
});
window.addEventListener('online', ()=>{
  document.getElementById('offlineBadge').classList.remove('show');
  showToast('عاد الاتصال بالإنترنت ✅');
});

// ===== MODAL CLOSE =====
function closeModal(id){
  document.getElementById(id).classList.remove('show');
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
  const saved = localStorage.getItem('alshhab_theme');
  if(saved === 'light') {
    document.documentElement.setAttribute('data-theme','light');
    isDark = false;
  }
})();

// ===== MOBILE MENU =====
const menuBtn = document.getElementById('menuBtn');
if(menuBtn) menuBtn.onclick = ()=>document.getElementById('sidebar').classList.toggle('open');

// ===== BOTTOM NAV =====
function setBottomNav(el) {
  document.querySelectorAll('.bottom-nav-item').forEach(i=>i.classList.remove('active'));
  el.classList.add('active');
}



// ===== SHARE URL =====
function shareURL(){
  navigator.clipboard?.writeText(window.location.href);
  showToast('تم نسخ الرابط 🔗');
}

// ===== AUTO LOAD NOTIFICATIONS =====
// بيشتغل في كل صفحة فيها notifDrop
function toggleNotif() {
  const drop = document.getElementById('notifDrop');
  if (!drop) return;
  const isOpen = drop.classList.contains('show');
  drop.classList.toggle('show');
  if (!isOpen && typeof Notifs !== 'undefined') {
    Notifs.renderDropdown();
  }
}

// Update avatar with real user name
document.addEventListener('DOMContentLoaded', () => {
  const userData = JSON.parse(localStorage.getItem('alshhab_user') || '{}');
  const avatarBtn = document.getElementById('avatarBtn');
  if (avatarBtn && userData.name) {
    avatarBtn.textContent = userData.name.charAt(0).toUpperCase();
  }
  // Load notif badge
  if (typeof Notifs !== 'undefined') {
    Notifs.updateBadge();
  }
});
