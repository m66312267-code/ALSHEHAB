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

// ══════════════════════════════════════════
//  CHATBOT FLOATING BUTTON + POPUP — v2
//  ✅ يتذكر اسم الطالب
//  ✅ تقييم الرد 👍👎
//  ✅ نسخ الرد
//  ✅ وضع ليل خاص
//  ✅ عداد الرسائل
// ══════════════════════════════════════════
(function injectChatbot() {
  const MAX_MSG    = 20;
  const OR_KEY     = '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';

  let chatHistory  = [];
  let isLoading    = false;
  let userName     = '';
  let userInit     = 'ط';
  let popupOpen    = false;
  let darkMode     = true;
  let mediaRecorder = null;
  let audioChunks   = [];
  let isRecording   = false;
  let pendingImage  = null;
  let isAdmin       = false;  // ✅ Admin Mode

  function getSystemPrompt() {
    const greeting = userName ? `اسم الطالب اللي بيكلمك هو "${userName}" — نادِه باسمه دايماً.` : '';
    return `أنت مساعد ذكي اسمك "ALMAHS BOT" تابع لمنصة إبداع التعليمية.
${greeting}
المنصة دي بناها محمد فهمي المحص — مبرمج Full-Stack مش مدرس.
لو حد سألك مين بناك، قول: "المنصة دي بناها محمد فهمي المحص — مبرمج Full-Stack".
لو حد سألك مين أنت، قول: "أنا ALMAHS BOT — مساعد منصة إبداع".
قواعد:
- رد دايماً بالعربية
- اشرح بطريقة بسيطة مع أمثلة
- لو سؤال علمي أو رياضيات، اشرح خطوة بخطوة
- استخدم إيموجي بشكل خفيف
- كون مشجع وإيجابي دايماً`;
  }

  // ── INJECT HTML ──
  function inject() {
    if (document.getElementById('chatFAB')) return;

    // جيب اسم الطالب + تحقق من الـ role
    try {
      const u = JSON.parse(localStorage.getItem('ibda3_user') || '{}');
      if (u.name) { userName = u.name; userInit = u.name.charAt(0).toUpperCase(); }
      const profile = JSON.parse(localStorage.getItem('ibda3_profile') || '{}');
      isAdmin = profile.role === 'admin';
    } catch(e) {}

    // FAB
    const fab = document.createElement('button');
    fab.id = 'chatFAB'; fab.className = 'float-chatbot'; fab.title = 'ALMAHS BOT';
    fab.innerHTML = `🤖<span class="chat-fab-dot"></span>`;
    fab.onclick = toggleChatPopup;
    document.body.appendChild(fab);

    // Popup
    const popup = document.createElement('div');
    popup.id = 'chatPopup'; popup.className = 'chat-popup cp-dark';
    popup.style.display = 'none';
    popup.innerHTML = `
      <div class="cp-header">
        <div class="cp-av">👨‍💻</div>
        <div class="cp-info">
          <div class="cp-name">ALMAHS BOT ${isAdmin ? '<span class="cp-admin-badge">👑 أدمن</span>' : ''}</div>
          <div class="cp-status">متاح الآن</div>
        </div>
        <div class="cp-header-actions">
          <button class="cp-hbtn" onclick="window._cpToggleDark()" title="تغيير المظهر" id="cpDarkBtn">🌙</button>
          <button class="cp-hbtn" onclick="window._cpClear()" title="مسح المحادثة">🗑</button>
          <button class="cp-hbtn" onclick="window._closeChatPopup()">✕</button>
        </div>
      </div>
      <div class="cp-counter" id="cpCounter">
        <div class="cp-counter-bar"><div class="cp-counter-fill" id="cpCounterFill" style="width:0%"></div></div>
        <span id="cpCounterLabel">0 / ${MAX_MSG} رسالة</span>
      </div>
      <div class="cp-messages" id="cpMessages">
        <div class="cp-empty" id="cpEmpty">
          <div class="cp-empty-icon">👨‍💻</div>
          <div class="cp-empty-title">${userName ? `أهلاً ${userName}! 👋` : 'أهلاً من محمد فهمي المحص'}</div>
          <div class="cp-empty-sub">مبرمج المنصة — اسألني أي سؤال وأنا هساعدك 🚀</div>
        </div>
      </div>
      <div class="cp-input-area">
        <!-- toolbar: voice + image + quiz + math -->
        <div class="cp-toolbar">
          <button class="cp-tool-btn" id="cpVoiceBtn" onclick="window._cpToggleVoice()" title="تسجيل صوت">🎙️</button>
          <button class="cp-tool-btn" onclick="document.getElementById('cpImgInput').click()" title="رفع صورة">📸</button>
          <button class="cp-tool-btn" onclick="window._cpQuizMode()" title="اختبار سريع">📝</button>
          <button class="cp-tool-btn" onclick="window._cpMathMode()" title="حل معادلة">🧮</button>
          <input type="file" id="cpImgInput" accept="image/*" style="display:none" onchange="window._cpHandleImg(this)">
          <div class="cp-voice-status" id="cpVoiceStatus" style="display:none">
            <span class="cp-voice-dot"></span> جاري التسجيل...
          </div>
        </div>
        <!-- image preview -->
        <div id="cpImgPreview" style="display:none;padding:6px 12px;background:var(--bg3);border-top:1px solid var(--border);">
          <div style="position:relative;display:inline-block;">
            <img id="cpImgThumb" style="height:60px;border-radius:8px;object-fit:cover;">
            <button onclick="window._cpClearImg()" style="position:absolute;top:-6px;right:-6px;background:#ef4444;border:none;border-radius:50%;width:18px;height:18px;color:#fff;font-size:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;">✕</button>
          </div>
        </div>
        <div class="cp-input-row">
          <textarea class="cp-input" id="cpInput" rows="1"
            placeholder="اكتب أو سجّل أو ارفع صورة..."
            onkeydown="window._cpKey(event)"
            oninput="this.style.height='auto';this.style.height=Math.min(this.scrollHeight,80)+'px'"></textarea>
          <button class="cp-send" id="cpSendBtn" onclick="window._cpSend()">➤</button>
        </div>
      </div>`;
    document.body.appendChild(popup);

    // استرجع المحادثة المحفوظة
    try {
      const saved = JSON.parse(localStorage.getItem('ibda3_chat_history') || '[]');
      if (saved.length) {
        chatHistory = saved;
        document.getElementById('cpEmpty').style.display = 'none';
        saved.forEach(m => renderMsg(m.role, m.content, false));
        updateCounter();
      }
    } catch(e) {}

    // استرجع الـ dark mode setting
    const savedDark = localStorage.getItem('ibda3_bot_dark');
    if (savedDark === 'false') { darkMode = false; popup.classList.remove('cp-dark'); popup.classList.add('cp-light'); document.getElementById('cpDarkBtn').textContent = '☀️'; }
  }

  // ── TOGGLE POPUP ──
  function toggleChatPopup() {
    const popup = document.getElementById('chatPopup');
    if (!popup) return;
    if (!popupOpen) {
      popup.style.display = 'flex';
      popup.style.flexDirection = 'column';
      popup.classList.remove('closing');
      popupOpen = true;
      setTimeout(() => document.getElementById('cpInput')?.focus(), 100);
      scrollCP();
    } else { closeChatPopup(); }
  }
  window._closeChatPopup = function() { closeChatPopup(); };
  function closeChatPopup() {
    const popup = document.getElementById('chatPopup');
    if (!popup) return;
    popup.classList.add('closing');
    setTimeout(() => { popup.style.display = 'none'; popup.classList.remove('closing'); }, 200);
    popupOpen = false;
  }

  // ── DARK MODE TOGGLE ──
  window._cpToggleDark = function() {
    const popup = document.getElementById('chatPopup');
    const btn   = document.getElementById('cpDarkBtn');
    if (!popup) return;
    darkMode = !darkMode;
    popup.classList.toggle('cp-dark',  darkMode);
    popup.classList.toggle('cp-light', !darkMode);
    btn.textContent = darkMode ? '🌙' : '☀️';
    localStorage.setItem('ibda3_bot_dark', darkMode);
  };

  // ── CLEAR ──
  window._cpClear = function() {
    if (!chatHistory.length) return;
    if (!confirm('هتمسح المحادثة كلها؟')) return;
    chatHistory = [];
    localStorage.removeItem('ibda3_chat_history');
    const c = document.getElementById('cpMessages');
    if (!c) return;
    c.innerHTML = `
      <div class="cp-empty" id="cpEmpty">
        <div class="cp-empty-icon">👨‍💻</div>
        <div class="cp-empty-title">${userName ? `أهلاً ${userName}! 👋` : 'أهلاً من محمد فهمي المحص'}</div>
        <div class="cp-empty-sub">مبرمج المنصة — اسألني أي سؤال وأنا هساعدك 🚀</div>
      </div>`;
    updateCounter();
    if (typeof showToast === 'function') showToast('تم مسح المحادثة 🗑');
  };

  // ── SEND ──
  window._cpSend = async function() {
    const input = document.getElementById('cpInput');
    const msg   = input?.value.trim();
    if ((!msg && !pendingImage) || isLoading) return;
    if (Math.floor(chatHistory.length / 2) >= MAX_MSG) {
      if (typeof showToast === 'function') showToast('⚠️ وصلت لحد الرسائل — امسح وابدأ من جديد');
      return;
    }
    input.value = ''; input.style.height = 'auto';
    const emptyEl = document.getElementById('cpEmpty');
    if (emptyEl) emptyEl.style.display = 'none';

    // لو فيه صورة pending — ابعت مع صورة
    if (pendingImage) {
      const imgData = pendingImage;
      pendingImage  = null;
      window._cpClearImg();
      const displayText = msg || '📸 اشرح الصورة دي';
      const contentArray = [
        { type: 'image_url', image_url: { url: `data:${imgData.mimeType};base64,${imgData.base64}` } },
        { type: 'text', text: msg || 'اشرح الصورة دي بالتفصيل بالعربي' }
      ];
      await sendWithContent(contentArray, displayText);
      return;
    }

    chatHistory.push({ role: 'user', content: msg });
    renderMsg('user', msg);
    updateCounter();
    scrollCP();

    isLoading = true;
    document.getElementById('cpSendBtn').disabled = true;
    const tid = showTypingCP();

    try {
      const reply = await callClaude();
      removeTypingCP(tid);
      chatHistory.push({ role: 'assistant', content: reply });
      renderMsg('assistant', reply);
      // رسم جراف لو طلب رياضيات
      if (reply.includes('y =') || reply.includes('f(x)')) setTimeout(() => renderMathGraph(reply), 200);
      localStorage.setItem('ibda3_chat_history', JSON.stringify(chatHistory.slice(-40)));
      updateCounter();
    } catch(e) {
      removeTypingCP(tid);
      renderMsg('assistant', '⚠️ حصل خطأ — حاول تاني');
    } finally {
      isLoading = false;
      document.getElementById('cpSendBtn').disabled = false;
      scrollCP();
    }
  };

  window._cpKey = function(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); window._cpSend(); }
  };

  // ── COUNTER ──
  function updateCounter() {
    const used  = Math.floor(chatHistory.length / 2);
    const pct   = Math.min(100, Math.round((used / MAX_MSG) * 100));
    const fill  = document.getElementById('cpCounterFill');
    const label = document.getElementById('cpCounterLabel');
    if (fill)  { fill.style.width = pct + '%'; fill.style.background = pct > 75 ? 'linear-gradient(90deg,#f59e0b,#ef4444)' : 'linear-gradient(90deg,#6366f1,#a855f7)'; }
    if (label) label.textContent = `${used} / ${MAX_MSG} رسالة`;
  }

  // ══════════════════════════════════════════
  //  TOOLS SYSTEM — الأدوات المتاحة للبوت
  // ══════════════════════════════════════════
  const TOOLS_PROMPT = `
بالإضافة لردودك العادية، تقدر تنفذ مهام حقيقية على المنصة.
لو الطالب طلب حاجة من دي، رد بـ JSON فقط بالشكل ده (من غير أي نص تاني):

{"tool":"navigate","page":"courses"} — لفتح صفحة (courses/dashboard/favorites/planner/profile/quiz/about/support)
{"tool":"get_grades"} — لجيب درجات الطالب
{"tool":"clear_notifs"} — لمسح الإشعارات
{"tool":"add_planner","title":"عنوان المهمة","subject":"المادة","date":"YYYY-MM-DD"} — لإضافة في خطة المذاكرة
{"tool":"toggle_fav","action":"add/remove","course_id":"id","course_title":"عنوان الكورس"} — للمفضلة

أمثلة:
- "روحني على الكورسات" → {"tool":"navigate","page":"courses"}
- "إيه درجاتي؟" → {"tool":"get_grades"}
- "امسح إشعاراتي" → {"tool":"clear_notifs"}
- "ضيف مذاكرة رياضيات بكرة" → {"tool":"add_planner","title":"مذاكرة رياضيات","subject":"رياضيات","date":"YYYY-MM-DD"}

لو الطلب مش واحد من دول، رد عادي بالعربي.`;

  const ADMIN_TOOLS_PROMPT = `
أنت في وضع الأدمن — عندك صلاحيات إضافية:

{"tool":"get_student","name":"اسم الطالب"} — لجيب بيانات طالب باسمه
{"tool":"suspend_student","name":"اسم الطالب","reason":"السبب"} — لحظر طالب
{"tool":"unsuspend_student","name":"اسم الطالب"} — لفك حظر طالب

أمثلة:
- "جيبلي بيانات محمد علي" → {"tool":"get_student","name":"محمد علي"}
- "احظر أحمد بسبب الغش" → {"tool":"suspend_student","name":"أحمد","reason":"محاولة غش"}
- "افك حظر سارة" → {"tool":"unsuspend_student","name":"سارة"}

دي أوامر خطيرة — تأكد من الاسم قبل التنفيذ.`;

  // ── EXECUTE TOOL ──
  async function executeTool(toolData) {
    const user = (typeof sb !== 'undefined') ? sb.getUser() : null;

    switch(toolData.tool) {

      case 'navigate': {
        const pages = {
          courses:'courses.html', dashboard:'dashboard.html',
          favorites:'favorites.html', planner:'planner.html',
          profile:'profile.html', quiz:'quiz.html',
          about:'about.html', support:'support.html'
        };
        const page = pages[toolData.page];
        if (!page) return `مش عارف أفتح الصفحة دي ⚠️`;
        setTimeout(() => window.location.href = page, 800);
        return `✅ هروحك على **${toolData.page}** دلوقتي...`;
      }

      case 'get_grades': {
        if (!user) return `⚠️ لازم تكون مسجّل دخول`;
        try {
          const results = await sb.select('quiz_results',
            `user_id=eq.${user.id}&select=score,total,submitted_at&order=submitted_at.desc&limit=5`
          );
          if (!results?.length) return `مفيش نتائج اختبارات لحد دلوقتي 📭`;
          const rows = results.map((r,i) => {
            const pct   = r.total > 0 ? Math.round((r.score/r.total)*100) : 0;
            const emoji = pct >= 75 ? '🏆' : pct >= 50 ? '✅' : '❌';
            const date  = r.submitted_at ? new Date(r.submitted_at).toLocaleDateString('ar-EG') : '';
            return `${emoji} **${r.score}/${r.total}** (${pct}%) — ${date}`;
          }).join('\n');
          return `📊 **آخر نتائجك:**\n${rows}`;
        } catch(e) { return `⚠️ حصل خطأ في جيب الدرجات`; }
      }

      case 'clear_notifs': {
        if (!user) return `⚠️ لازم تكون مسجّل دخول`;
        try {
          await sb.delete('notifications', `user_id=eq.${user.id}`);
          // حدّث الـ badge لو موجود
          if (typeof Notifs !== 'undefined') Notifs.updateBadge().catch(()=>{});
          return `✅ تم مسح كل إشعاراتك!`;
        } catch(e) { return `⚠️ حصل خطأ في مسح الإشعارات`; }
      }

      case 'add_planner': {
        try {
          const tasks = JSON.parse(localStorage.getItem('ibda3_plnv3') || '[]');
          const today = new Date().toISOString().slice(0,10);
          const newTask = {
            id:      't_' + Date.now(),
            title:   toolData.title   || 'مهمة جديدة',
            subject: toolData.subject || 'عام',
            date:    toolData.date    || today,
            done:    false,
            priority: 'medium',
            color:   '#00d4aa',
          };
          tasks.push(newTask);
          localStorage.setItem('ibda3_plnv3', JSON.stringify(tasks));
          return `✅ تم إضافة **"${newTask.title}"** في خطة المذاكرة!\n📅 التاريخ: ${newTask.date}`;
        } catch(e) { return `⚠️ حصل خطأ في إضافة المهمة`; }
      }

      case 'toggle_fav': {
        if (!user) return `⚠️ لازم تكون مسجّل دخول`;
        try {
          if (typeof Courses !== 'undefined') {
            await Courses.toggleFavorite(toolData.course_id || '');
            const action = toolData.action === 'remove' ? 'شيل من' : 'إضافة في';
            return `✅ تم ${action} المفضلة! ❤️`;
          }
          // fallback localStorage
          const favs = JSON.parse(localStorage.getItem('ibda3_favorites') || '[]');
          const idx  = favs.indexOf(toolData.course_id);
          if (idx > -1) favs.splice(idx, 1); else favs.push(toolData.course_id);
          localStorage.setItem('ibda3_favorites', JSON.stringify(favs));
          return `✅ تم تحديث المفضلة! ❤️`;
        } catch(e) { return `⚠️ حصل خطأ في المفضلة`; }
      }

      default:
        return null;

      // ══ ADMIN TOOLS ══
      case 'get_student': {
        if (!isAdmin) return `⚠️ الأمر ده للأدمن بس`;
        const name = toolData.name?.trim();
        if (!name) return `⚠️ اكتب اسم الطالب`;
        try {
          const profiles = await sb.select('profiles',
            `select=id,name,grade,xp,suspended,created_at,phone,role&name=ilike.*${name}*&limit=3`
          );
          if (!profiles?.length) return `❌ مفيش طالب باسم "${name}"`;
          const gradeMap = { grade1:'🥇 أول ثانوي', grade2:'🥈 ثاني ثانوي', grade3:'🥉 ثالث ثانوي' };
          return profiles.map(p => {
            const status = p.suspended ? '🚫 موقوف' : '✅ نشط';
            const grade  = gradeMap[p.grade] || 'غير محدد';
            const joined = p.created_at ? new Date(p.created_at).toLocaleDateString('ar-EG') : '—';
            return `👤 **${p.name}**\n` +
              `🎓 الصف: ${grade}\n` +
              `⚡ XP: ${p.xp || 0}\n` +
              `📱 موبايل: ${p.phone || '—'}\n` +
              `🔖 الحالة: ${status}\n` +
              `📅 تاريخ التسجيل: ${joined}`;
          }).join('\n\n---\n\n');
        } catch(e) { return `⚠️ خطأ في جيب بيانات الطالب`; }
      }

      case 'suspend_student': {
        if (!isAdmin) return `⚠️ الأمر ده للأدمن بس`;
        const name   = toolData.name?.trim();
        const reason = toolData.reason?.trim() || 'بدون سبب محدد';
        if (!name) return `⚠️ اكتب اسم الطالب`;
        try {
          const profiles = await sb.select('profiles', `select=id,name&name=ilike.*${name}*&limit=3`);
          if (!profiles?.length) return `❌ مفيش طالب باسم "${name}"`;
          if (profiles.length > 1) {
            const names = profiles.map(p => `• ${p.name}`).join('\n');
            return `⚠️ لقيت أكتر من طالب بالاسم ده:\n${names}\n\nبقّ الاسم أكتر دقة`;
          }
          const p = profiles[0];
          await sb.update('profiles', { suspended: true, suspend_reason: reason }, `id=eq.${p.id}`);
          await sb.insert('notifications', {
            user_id: p.id,
            title: '🚫 تم إيقاف حسابك',
            body: `السبب: ${reason}`,
            is_read: false
          }).catch(() => {});
          return `✅ تم حظر **${p.name}**\n📝 السبب: ${reason}\n\nتم إرسال إشعار للطالب تلقائياً.`;
        } catch(e) { return `⚠️ خطأ في تنفيذ الحظر`; }
      }

      case 'unsuspend_student': {
        if (!isAdmin) return `⚠️ الأمر ده للأدمن بس`;
        const name = toolData.name?.trim();
        if (!name) return `⚠️ اكتب اسم الطالب`;
        try {
          const profiles = await sb.select('profiles', `select=id,name&name=ilike.*${name}*&limit=3`);
          if (!profiles?.length) return `❌ مفيش طالب باسم "${name}"`;
          if (profiles.length > 1) {
            const names = profiles.map(p => `• ${p.name}`).join('\n');
            return `⚠️ لقيت أكتر من طالب:\n${names}\n\nبقّ الاسم أكتر دقة`;
          }
          const p = profiles[0];
          await sb.update('profiles', { suspended: false, suspend_reason: null }, `id=eq.${p.id}`);
          await sb.insert('notifications', {
            user_id: p.id,
            title: '✅ تم استعادة حسابك',
            body: 'تم رفع الحظر عن حسابك — يمكنك الدخول مجدداً.',
            is_read: false
          }).catch(() => {});
          return `✅ تم فك حظر **${p.name}** وأُرسل له إشعار 🎉`;
        } catch(e) { return `⚠️ خطأ في فك الحظر`; }
      }
    }
  }

  // ── API ──
  async function callClaude() {
    const messages = chatHistory.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content
    }));
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OR_KEY}`,
        'HTTP-Referer': 'https://ibda3.vercel.app',
        'X-Title': 'IBDA3 Platform',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        max_tokens: 800,
        messages: [
          { role: 'system', content: getSystemPrompt() + TOOLS_PROMPT + (isAdmin ? ADMIN_TOOLS_PROMPT : '') },
          ...messages
        ]
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || 'خطأ ' + res.status);
    }
    const data  = await res.json();
    const reply = data.choices?.[0]?.message?.content || '...';

    // ── هل الرد tool call؟ ──
    const trimmed = reply.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const toolData   = JSON.parse(trimmed);
        const toolResult = await executeTool(toolData);
        if (toolResult !== null) return toolResult;
      } catch(e) {}
    }
    return reply;
  }

  // ── RENDER ──
  function renderMsg(role, content, animate = true) {
    const container = document.getElementById('cpMessages');
    if (!container) return;
    const isUser = role === 'user';
    const msgId  = 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2,6);
    const row = document.createElement('div');
    row.className = `cp-msg-row ${isUser ? 'user' : ''}`;
    if (!animate) row.style.animation = 'none';
    const html = isUser ? esc(content) : fmt(content);

    row.innerHTML = `
      <div class="cp-msg-av ${isUser ? 'user' : 'bot'}">${isUser ? userInit : '🤖'}</div>
      <div style="max-width:78%;display:flex;flex-direction:column;gap:4px;align-items:${isUser?'flex-end':'flex-start'}">
        <div class="cp-bubble ${isUser ? 'user' : 'bot'}" id="${msgId}">${html}</div>
        ${!isUser ? `
        <div class="cp-actions">
          <button class="cp-act-btn" onclick="window._cpCopy('${msgId}')" title="نسخ">📋</button>
          <button class="cp-act-btn cp-like"   onclick="window._cpRate(this,'up')"   title="مفيد">👍</button>
          <button class="cp-act-btn cp-dislike" onclick="window._cpRate(this,'dn')"  title="مش مفيد">👎</button>
        </div>` : ''}
      </div>`;
    container.appendChild(row);
  }

  // ── COPY ──
  window._cpCopy = function(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const text = el.innerText || el.textContent;
    navigator.clipboard?.writeText(text).then(() => {
      if (typeof showToast === 'function') showToast('تم النسخ 📋');
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
      if (typeof showToast === 'function') showToast('تم النسخ 📋');
    });
  };

  // ── RATE ──
  window._cpRate = function(btn, type) {
    const row = btn.closest('.cp-actions');
    if (!row || row.dataset.rated) return;
    row.dataset.rated = '1';
    row.querySelectorAll('.cp-act-btn').forEach(b => b.style.opacity = '.3');
    btn.style.opacity = '1';
    btn.style.transform = 'scale(1.3)';
    setTimeout(() => btn.style.transform = '', 300);
    if (typeof showToast === 'function') showToast(type === 'up' ? '😊 شكراً على تقييمك!' : '📝 هنحاول نتحسن!');
  };

  // ── TYPING ──
  function showTypingCP() {
    const id = 'cpt_' + Date.now();
    const c  = document.getElementById('cpMessages');
    if (!c) return id;
    const el = document.createElement('div');
    el.id = id; el.className = 'cp-msg-row';
    el.innerHTML = `<div class="cp-msg-av bot">🤖</div><div class="cp-bubble bot cp-typing"><span></span><span></span><span></span></div>`;
    c.appendChild(el); scrollCP(); return id;
  }
  function removeTypingCP(id) { document.getElementById(id)?.remove(); }

  function scrollCP() { const c = document.getElementById('cpMessages'); if (c) setTimeout(() => c.scrollTop = c.scrollHeight, 40); }
  function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function fmt(t) {
    return esc(t)
      .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
      .replace(/`(.+?)`/g,'<code>$1</code>')
      .replace(/^- (.+)$/gm,'<li>$1</li>')
      .replace(/\n/g,'<br>');
  }

  // ══════════════════════════════════════════
  //  🎙️ VOICE INPUT
  // ══════════════════════════════════════════
  window._cpToggleVoice = async function() {
    if (isRecording) {
      // وقّف التسجيل
      mediaRecorder?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunks  = [];
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        isRecording = false;
        document.getElementById('cpVoiceBtn').textContent   = '🎙️';
        document.getElementById('cpVoiceStatus').style.display = 'none';
        // حوّل لـ base64 وابعت للـ API
        const blob   = new Blob(audioChunks, { type: 'audio/webm' });
        const b64    = await blobToBase64(blob);
        const input  = document.getElementById('cpInput');
        const text   = input?.value.trim();
        // اكتب placeholder
        if (input) { input.value = ''; input.placeholder = '⏳ جاري تحليل الصوت...'; }
        // ابعت للبوت مع الصوت كـ base64 في الـ system
        await sendWithContent([
          { type: 'text', text: text || 'افهم الصوت ده وأجب عليه بالعربي' },
          { type: 'text', text: `[AUDIO_BASE64: ${b64.slice(0,100)}...]` }
        ], '🎙️ رسالة صوتية');
        if (input) input.placeholder = 'اكتب أو سجّل أو ارفع صورة...';
      };
      mediaRecorder.start();
      isRecording = true;
      document.getElementById('cpVoiceBtn').textContent      = '⏹️';
      document.getElementById('cpVoiceStatus').style.display = 'flex';
      if (typeof showToast === 'function') showToast('🎙️ جاري التسجيل — اضغط تاني لوقف');
    } catch(e) {
      if (typeof showToast === 'function') showToast('⚠️ الميكروفون مش متاح');
    }
  };

  // ══════════════════════════════════════════
  //  📸 IMAGE UPLOAD
  // ══════════════════════════════════════════
  window._cpHandleImg = async function(input) {
    const file = input.files[0];
    if (!file) return;
    const b64      = await blobToBase64(file);
    const mimeType = file.type || 'image/jpeg';
    pendingImage   = { base64: b64.split(',')[1], mimeType };
    // Preview
    const thumb = document.getElementById('cpImgThumb');
    const prev  = document.getElementById('cpImgPreview');
    if (thumb) thumb.src = b64;
    if (prev)  prev.style.display = 'block';
    document.getElementById('cpInput')?.focus();
    if (typeof showToast === 'function') showToast('📸 الصورة جاهزة — اكتب سؤالك عنها');
    input.value = '';
  };

  window._cpClearImg = function() {
    pendingImage = null;
    const prev = document.getElementById('cpImgPreview');
    if (prev) prev.style.display = 'none';
  };

  // ══════════════════════════════════════════
  //  🧮 MATH MODE — حل معادلة + رسم الجراف
  // ══════════════════════════════════════════
  window._cpMathMode = function() {
    const input = document.getElementById('cpInput');
    if (input) {
      input.value = 'ارسم جراف المعادلة: ';
      input.focus();
      input.selectionStart = input.selectionEnd = input.value.length;
    }
  };

  // ══════════════════════════════════════════
  //  📝 QUIZ GENERATOR
  // ══════════════════════════════════════════
  window._cpQuizMode = function() {
    const input = document.getElementById('cpInput');
    if (input) {
      input.value = 'ولّدلي اختبار 5 أسئلة MCQ في موضوع: ';
      input.focus();
      input.selectionStart = input.selectionEnd = input.value.length;
    }
  };

  // ══════════════════════════════════════════
  //  SEND WITH CONTENT (image / voice)
  // ══════════════════════════════════════════
  async function sendWithContent(contentArray, displayText) {
    const emptyEl = document.getElementById('cpEmpty');
    if (emptyEl) emptyEl.style.display = 'none';

    // عرض رسالة المستخدم
    chatHistory.push({ role: 'user', content: displayText });
    renderMsg('user', displayText);
    updateCounter();
    scrollCP();

    isLoading = true;
    document.getElementById('cpSendBtn').disabled = true;
    const tid = showTypingCP();

    try {
      const reply = await callClaudeWithContent(contentArray);
      removeTypingCP(tid);
      chatHistory.push({ role: 'assistant', content: reply });
      renderMsg('assistant', reply);
      localStorage.setItem('ibda3_chat_history', JSON.stringify(chatHistory.slice(-40)));
      updateCounter();
    } catch(e) {
      removeTypingCP(tid);
      renderMsg('assistant', '⚠️ حصل خطأ — حاول تاني');
    } finally {
      isLoading = false;
      document.getElementById('cpSendBtn').disabled = false;
      scrollCP();
    }
  }

  // API call مع صورة
  async function callClaudeWithContent(contentArray) {
    const prevMessages = chatHistory.slice(0,-1).map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content
    }));
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OR_KEY}`,
        'HTTP-Referer': 'https://ibda3.vercel.app',
        'X-Title': 'IBDA3 Platform',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        max_tokens: 1000,
        messages: [
          { role: 'system', content: getSystemPrompt() + TOOLS_PROMPT },
          ...prevMessages,
          { role: 'user', content: contentArray }
        ]
      })
    });
    if (!res.ok) throw new Error('API ' + res.status);
    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || '...';
    // لو رياضيات وفيها معادلة — ارسم الجراف
    if (reply.includes('f(x)') || reply.includes('y =') || reply.includes('رسم')) {
      setTimeout(() => renderMathGraph(reply), 300);
    }
    return reply;
  }

  // ══════════════════════════════════════════
  //  📊 MATH GRAPH RENDERER
  // ══════════════════════════════════════════
  function renderMathGraph(text) {
    // استخرج المعادلة من الرد
    const match = text.match(/y\s*=\s*([^\n،.]+)/i) || text.match(/f\(x\)\s*=\s*([^\n،.]+)/i);
    if (!match) return;
    const expr = match[1].trim();
    const container = document.getElementById('cpMessages');
    if (!container) return;

    const wrap = document.createElement('div');
    wrap.className = 'cp-msg-row';
    wrap.style.animation = 'msgIn .2s ease';
    const canvas = document.createElement('canvas');
    canvas.width  = 260; canvas.height = 180;
    canvas.style.cssText = 'border-radius:10px;background:#0f1117;display:block;';
    wrap.innerHTML = `<div class="cp-msg-av bot">📊</div><div style="max-width:78%"><div class="cp-bubble bot" style="padding:8px;"></div></div>`;
    wrap.querySelector('.cp-bubble').appendChild(canvas);
    container.appendChild(wrap);

    try {
      const ctx = canvas.getContext('2d');
      const W = canvas.width, H = canvas.height;
      const cx = W/2, cy = H/2, scale = 25;
      ctx.clearRect(0,0,W,H);
      // Grid
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 0.5;
      for(let x=0;x<W;x+=scale){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
      for(let y=0;y<H;y+=scale){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
      // Axes
      ctx.strokeStyle='rgba(255,255,255,0.3)';ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(0,cy);ctx.lineTo(W,cy);ctx.stroke();
      ctx.beginPath();ctx.moveTo(cx,0);ctx.lineTo(cx,H);ctx.stroke();
      // Curve
      ctx.strokeStyle='#00d4aa';ctx.lineWidth=2;ctx.beginPath();
      let started=false;
      const safeExpr = expr.replace(/\^/g,'**').replace(/x/g,'(_x)');
      for(let px=0;px<W;px++){
        const _x=(px-cx)/scale;
        let y;
        try { y = Function('_x','return '+safeExpr)(_x); } catch(e){ continue; }
        if(!isFinite(y)||Math.abs(y)>1e6)continue;
        const py=cy-y*scale;
        started?ctx.lineTo(px,py):ctx.moveTo(px,py);
        started=true;
      }
      ctx.stroke();
      // Label
      ctx.fillStyle='rgba(0,212,170,0.8)';ctx.font='10px Cairo,sans-serif';
      ctx.fillText('y = '+expr, 6, 14);
    } catch(e){}
    scrollCP();
  }

  // ── UTILS ──
  function blobToBase64(blob) {
    return new Promise(resolve => {
      const r = new FileReader();
      r.onload  = () => resolve(r.result);
      r.readAsDataURL(blob);
    });
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', inject); } else { inject(); }
})();
