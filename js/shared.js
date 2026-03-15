/* shared.js — IBDA3 Platform — كود مشترك بين كل الصفحات */

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
  localStorage.setItem('ibda3_cookies','accepted');
  showToast('تم قبول الكوكيز ✅');
}

// ===== THEME =====
let isDark = true;
function toggleTheme(){
  isDark=!isDark;
  document.documentElement.setAttribute('data-theme', isDark?'':'light');
  localStorage.setItem('ibda3_theme', isDark?'dark':'light');
  showToast(isDark?'وضع داكن 🌙':'وضع فاتح ☀️');
}
function setMode(m){
  document.documentElement.setAttribute('data-theme', m==='light'?'light':'');
  isDark = m!=='light';
  localStorage.setItem('ibda3_theme', m);
}

// خريطة كاملة لكل الألوان
const IBDA3_COLORS = {
  green:  { accent:'#00d4aa', glow:'rgba(0,212,170,0.3)',   border:'rgba(0,212,170,0.15)'  },
  blue:   { accent:'#3b82f6', glow:'rgba(59,130,246,0.3)',  border:'rgba(59,130,246,0.2)'  },
  purple: { accent:'#a855f7', glow:'rgba(168,85,247,0.3)',  border:'rgba(168,85,247,0.2)'  },
  orange: { accent:'#f97316', glow:'rgba(249,115,22,0.3)',  border:'rgba(249,115,22,0.2)'  },
  red:    { accent:'#ef4444', glow:'rgba(239,68,68,0.3)',   border:'rgba(239,68,68,0.2)'   },
  pink:   { accent:'#ec4899', glow:'rgba(236,72,153,0.3)',  border:'rgba(236,72,153,0.2)'  },
  gold:   { accent:'#eab308', glow:'rgba(234,179,8,0.3)',   border:'rgba(234,179,8,0.2)'   },
  olive:  { accent:'#84cc16', glow:'rgba(132,204,22,0.3)',  border:'rgba(132,204,22,0.2)'  },
};

function setColor(c) {
  const clr = IBDA3_COLORS[c] || IBDA3_COLORS.green;
  if (c === 'green') {
    document.documentElement.style.removeProperty('--accent');
    document.documentElement.style.removeProperty('--glow');
    document.documentElement.style.removeProperty('--border');
  } else {
    document.documentElement.style.setProperty('--accent', clr.accent);
    document.documentElement.style.setProperty('--glow',   clr.glow);
    document.documentElement.style.setProperty('--border', clr.border);
  }
  localStorage.setItem('ibda3_color', c);
  // تحديث الـ dots في الـ settings panel
  document.querySelectorAll('.tdot').forEach(d => {
    const bg = d.style.background || '';
    d.classList.toggle('active', bg === clr.accent || (c==='green' && bg==='#00d4aa'));
  });
  // تحديث كروت الألوان في الأدمن
  document.querySelectorAll('.stg-color-card').forEach(el => {
    el.classList.toggle('active', el.id === 'clr-' + c);
  });
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
  ['ratingModal'].forEach(id=>{
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
  const savedTheme = localStorage.getItem('ibda3_theme');
  if(savedTheme === 'light') {
    document.documentElement.setAttribute('data-theme','light');
    isDark = false;
  }
  // استعادة اللون المحفوظ
  const savedColor = localStorage.getItem('ibda3_color');
  if(savedColor && savedColor !== 'green' && typeof IBDA3_COLORS !== 'undefined') {
    const clr = IBDA3_COLORS[savedColor];
    if(clr) {
      document.documentElement.style.setProperty('--accent', clr.accent);
      document.documentElement.style.setProperty('--glow',   clr.glow);
      document.documentElement.style.setProperty('--border', clr.border);
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
  const userData = JSON.parse(localStorage.getItem('ibda3_user') || '{}');
  const avatarBtns = document.querySelectorAll('.avatar-btn');
  if (userData.name) {
    avatarBtns.forEach(btn => btn.textContent = userData.name.charAt(0).toUpperCase());
  }
  // Load notif badge
  if (typeof Notifs !== 'undefined') {
    Notifs.updateBadge();
  }

  // إخفاء cookie bar لو وافق قبل كده
  if(localStorage.getItem('ibda3_cookies') === 'accepted') {
    const bar = document.getElementById('cookie-bar');
    if(bar) bar.style.display = 'none';
  }
});
