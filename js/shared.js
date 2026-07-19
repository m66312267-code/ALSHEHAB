/* shared.js — IBDA3 Platform — كود مشترك بين كل الصفحات */

// ===== TOAST =====
function showToast(msg){
  const t=document.getElementById('toast');
  if(!t) return;
  t.innerHTML=msg;
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

// ===== BOTTOM NAV HIDE ON SCROLL =====
(function() {
  let lastY = 0;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const nav = document.querySelector('.bottom-nav');
        if (!nav) { ticking = false; return; }
        const currentY = window.scrollY;
        if (currentY > lastY && currentY > 60) {
          nav.classList.add('hidden');
        } else {
          nav.classList.remove('hidden');
        }
        lastY = currentY;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

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
  if (!e.target.closest('.float-settings') && !e.target.closest('.mobile-center-fab') && !e.target.closest('#mobileCenterFab') && !e.target.closest('.settings-panel')) {
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
  // ✅ تشغيل نظام الإشعارات تلقائياً في كل الصفحات
  if (typeof Notifs !== 'undefined') {
    Notifs.updateBadge();
    Notifs.startPolling(30000);
  }

  // إخفاء cookie bar لو وافق قبل كده
  if(localStorage.getItem('ibda3_cookies') === 'accepted') {
    const bar = document.getElementById('cookie-bar');
    if(bar) bar.style.display = 'none';
  }

  // ===== SESSION KEEP-ALIVE IN SHARED.JS =====
  // ✅ FIX: جدد الجلسة كل 4 دقائق في الخلفية — محدش هلاحظ
  if (typeof window !== 'undefined') {
    const keepAliveInterval = setInterval(() => {
      const session = JSON.parse(localStorage.getItem('sb_session') || 'null');
      // اذا في جلسة نشطة — جددها
      if (session?.refresh_token && typeof sb !== 'undefined') {
        sb.refreshSession().catch(err => {
          // لو الـ refresh فشل — متقلق، الـ session ما تزال نشطة
          // console.log('Session refresh attempt');
        });
      }
    }, 4 * 60 * 1000); // كل 4 دقائق
    
    // اذا الطالب رجع بعد ما كان نائم — جدد الجلسة فوراً
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        const session = JSON.parse(localStorage.getItem('sb_session') || 'null');
        if (session?.refresh_token && typeof sb !== 'undefined') {
          sb.refreshSession().catch(() => {});
        }
      }
    });
  }

  // ===== LOGO TYPEWRITER =====
  setTimeout(() => {
    document.querySelectorAll('.logo-text').forEach(el => {
      el.classList.add('logo-ready');
    });
  }, 100);
});

// =====================================================
// ✅ COMPLETE PROFILE GUARD
// يشتغل في كل صفحة بعد الـ login
// لو الطالب ناقص رقم أو محافظة — modal إجباري
// =====================================================
(function() {
  // الصفحات اللي مش محتاج نشيل فيها الـ modal (صفحة الدخول نفسها)
  const SKIP_PAGES = ['index.html', '/', ''];
  const currentPage = window.location.pathname.split('/').pop();
  if (SKIP_PAGES.includes(currentPage)) return;

  // بعد تحميل الـ supabase.js
  window.addEventListener('load', async () => {
    // انتظر supabase يكون جاهز
    if (typeof sb === 'undefined') return;
    const session = JSON.parse(localStorage.getItem('sb_session') || 'null');
    if (!session?.user) return; // مش logged in أصلاً

    const uid = session.user.id;

    try {
      const rows = await sb.select('profiles', `id=eq.${uid}&select=phone,parent_phone,governorate`);
      const p = rows?.[0];
      const missing = !p?.phone || !p?.parent_phone || !p?.governorate;
      if (!missing) return; // البيانات كاملة — متفعلش حاجة

      // ── إنشاء الـ Modal ──
      _showCompleteProfileModal(uid, p);
    } catch(e) {
      // لو فيه خطأ في الاتصال — متوقفش الطالب
    }
  });

  function _showCompleteProfileModal(uid, existingProfile) {
    // إزالة أي modal قديم
    document.getElementById('cpModal')?.remove();

    const govOptions = ['القاهرة','الجيزة','الإسكندرية','الدقهلية','البحيرة','الفيوم',
      'الغربية','الإسماعيلية','المنوفية','المنيا','القليوبية','الوادي الجديد',
      'السويس','أسوان','أسيوط','بني سويف','بورسعيد','دمياط','جنوب سيناء',
      'شمال سيناء','سوهاج','قنا','كفر الشيخ','مطروح','الأقصر','البحر الأحمر','الشرقية']
      .map(g=>`<option value="${g}" ${existingProfile?.governorate===g?'selected':''}>${g}</option>`)
      .join('');

    const modal = document.createElement('div');
    modal.id = 'cpModal';
    modal.innerHTML = `
      <div id="cpOverlay" style="
        position:fixed;inset:0;z-index:99999;
        background:rgba(4,2,10,.92);backdrop-filter:blur(8px);
        display:flex;align-items:center;justify-content:center;
        padding:20px;animation:cpFadeIn .3s ease;
      ">
        <div style="
          background:#08040f;border:1px solid rgba(124,58,237,.25);
          border-radius:20px;padding:32px 28px;width:100%;max-width:400px;
          position:relative;box-shadow:0 0 60px rgba(124,58,237,.15),0 30px 80px rgba(0,0,0,.7);
        ">
          <!-- خط علوي متوهج -->
          <div style="position:absolute;top:0;left:15%;right:15%;height:1px;background:linear-gradient(90deg,transparent,rgba(124,58,237,.9),rgba(236,72,153,.6),transparent);border-radius:99px;"></div>

          <div style="text-align:center;margin-bottom:24px;">
            <div style="font-size:48px;margin-bottom:12px;">📋</div>
            <h3 style="font-family:'Cairo',sans-serif;font-size:18px;font-weight:900;color:#f5e6ff;margin-bottom:8px;">أكمل بياناتك أولاً</h3>
            <p style="font-family:'Cairo',sans-serif;font-size:12px;color:rgba(245,230,255,.4);line-height:1.8;">
              المنصة اتطورت وبقى لازم تكمّل بياناتك<br>عشان تقدر تستخدم كل المميزات
            </p>
          </div>

          <div id="cpError" style="display:none;background:rgba(244,114,182,.08);border:1px solid rgba(244,114,182,.25);color:#f9a8d4;padding:10px 14px;border-radius:10px;font-size:12px;font-family:'Cairo',sans-serif;margin-bottom:14px;"></div>

          <!-- رقم الطالب -->
          <div style="margin-bottom:12px;">
            <label style="font-family:'Cairo',sans-serif;font-size:10px;font-weight:700;color:rgba(168,85,247,.6);letter-spacing:1px;display:block;margin-bottom:6px;">
              📱 رقم موبايلك <span style="color:#ec4899">*</span>
            </label>
            <div style="position:relative;">
              <input id="cpPhone" type="tel" maxlength="11" placeholder="01xxxxxxxxx"
                     value="${existingProfile?.phone||''}"
                     oninput="cpLivePhone(this,'cpPhSt')"
                     style="width:100%;box-sizing:border-box;background:rgba(124,58,237,.05);border:1px solid rgba(124,58,237,.18);border-radius:10px;color:#f5e6ff;font-family:'Cairo',sans-serif;font-size:14px;padding:12px 16px 12px 40px;outline:none;">
              <span id="cpPhSt" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:15px;display:none;"></span>
            </div>
          </div>

          <!-- رقم ولي الأمر -->
          <div style="margin-bottom:12px;">
            <label style="font-family:'Cairo',sans-serif;font-size:10px;font-weight:700;color:rgba(168,85,247,.6);letter-spacing:1px;display:block;margin-bottom:6px;">
              📞 رقم موبايل ولي الأمر <span style="color:#ec4899">*</span>
            </label>
            <div style="position:relative;">
              <input id="cpPPhone" type="tel" maxlength="11" placeholder="01xxxxxxxxx"
                     value="${existingProfile?.parent_phone||''}"
                     oninput="cpLivePhone(this,'cpPPhSt')"
                     style="width:100%;box-sizing:border-box;background:rgba(124,58,237,.05);border:1px solid rgba(124,58,237,.18);border-radius:10px;color:#f5e6ff;font-family:'Cairo',sans-serif;font-size:14px;padding:12px 16px 12px 40px;outline:none;">
              <span id="cpPPhSt" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:15px;display:none;"></span>
            </div>
            <div id="cpDiffWarn" style="display:none;font-size:11px;color:#f9a8d4;margin-top:5px;font-family:'Cairo',sans-serif;">⚠️ الرقمين لازم يكونوا مختلفين</div>
          </div>

          <!-- المحافظة -->
          <div style="margin-bottom:22px;">
            <label style="font-family:'Cairo',sans-serif;font-size:10px;font-weight:700;color:rgba(168,85,247,.6);letter-spacing:1px;display:block;margin-bottom:6px;">
              📍 المحافظة <span style="color:#ec4899">*</span>
            </label>
            <select id="cpGov" style="width:100%;box-sizing:border-box;background:rgba(124,58,237,.05);border:1px solid rgba(124,58,237,.18);border-radius:10px;color:#f5e6ff;font-family:'Cairo',sans-serif;font-size:14px;padding:12px 16px;outline:none;cursor:pointer;appearance:none;">
              <option value="">— اختر محافظتك —</option>
              ${govOptions}
            </select>
          </div>

          <button id="cpSaveBtn" onclick="cpSave('${uid}')" style="
            width:100%;padding:14px;border:none;border-radius:12px;
            background:linear-gradient(135deg,#7c3aed,#a855f7);
            color:#fff;font-family:'Cairo',sans-serif;font-size:15px;font-weight:900;
            cursor:pointer;box-shadow:0 0 30px rgba(124,58,237,.4);transition:all .3s;
          ">💾 حفظ البيانات والمتابعة</button>

          <p style="text-align:center;margin-top:14px;font-size:11px;color:rgba(168,85,247,.25);font-family:'Cairo',sans-serif;">
            🔒 بياناتك محمية ولن تُشارك مع أي طرف ثالث
          </p>
        </div>
      </div>
      <style>
        @keyframes cpFadeIn{from{opacity:0;transform:scale(.95);}to{opacity:1;transform:scale(1);}}
        #cpPhone:focus,#cpPPhone:focus,#cpGov:focus{border-color:rgba(168,85,247,.6)!important;background:rgba(124,58,237,.1)!important;box-shadow:0 0 0 3px rgba(124,58,237,.12);}
      </style>
    `;
    document.body.appendChild(modal);
  }

  // ── Real-time phone validation inside modal ──
  window.cpLivePhone = function(el, stId) {
    const v = el.value.trim();
    const rx = /^01[0-9]{9}$/;
    const st = document.getElementById(stId);
    if (v.length===11 && rx.test(v)) { st.textContent='✅'; st.style.display='block'; }
    else if (v.length>0)             { st.textContent='❌'; st.style.display='block'; }
    else                               st.style.display='none';
    // تحذير الاختلاف
    const p  = document.getElementById('cpPhone')?.value.trim();
    const pp = document.getElementById('cpPPhone')?.value.trim();
    const dw = document.getElementById('cpDiffWarn');
    if (dw) dw.style.display = (p && pp && p===pp) ? 'block' : 'none';
  };

  // ── Save ──
  window.cpSave = async function(uid) {
    const phone = document.getElementById('cpPhone').value.trim();
    const pphone = document.getElementById('cpPPhone').value.trim();
    const gov = document.getElementById('cpGov').value;
    const rx = /^01[0-9]{9}$/;
    const errEl = document.getElementById('cpError');

    function cpErr(msg) {
      errEl.textContent = '⚠️ ' + msg;
      errEl.style.display = 'block';
    }

    if (!phone)              { cpErr('أدخل رقم موبايلك'); return; }
    if (!rx.test(phone))     { cpErr('رقم موبايلك غلط — 11 رقم يبدأ بـ 01'); return; }
    if (!pphone)             { cpErr('أدخل رقم ولي الأمر'); return; }
    if (!rx.test(pphone))    { cpErr('رقم ولي الأمر غلط — 11 رقم يبدأ بـ 01'); return; }
    if (phone === pphone)    { cpErr('الرقمين لازم يكونوا مختلفين ⚠️'); return; }
    if (!gov)                { cpErr('اختر محافظتك 📍'); return; }

    const btn = document.getElementById('cpSaveBtn');
    btn.disabled = true; btn.textContent = '⏳ جاري الحفظ...';

    try {
      await sb.upsert('profiles', {
        id:           uid,
        phone,
        parent_phone: pphone,
        governorate:  gov,
      });
      localStorage.setItem('ibda3_governorate', gov);
      // أغلق الـ modal بـ animation
      const overlay = document.getElementById('cpOverlay');
      overlay.style.animation = 'cpFadeIn .25s ease reverse forwards';
      setTimeout(() => document.getElementById('cpModal')?.remove(), 280);
      if (typeof showToast === 'function') showToast('تم حفظ البيانات ✅');
    } catch(e) {
      cpErr('حدث خطأ في الحفظ، حاول تاني');
      btn.disabled = false;
      btn.textContent = '💾 حفظ البيانات والمتابعة';
    }
  };
})();

