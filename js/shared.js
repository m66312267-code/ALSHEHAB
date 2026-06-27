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

// ══════════════════════════════════════════
//  CHATBOT FLOATING BUTTON + POPUP — v2
//  ✅ يتذكر اسم الطالب
//  ✅ تقييم الرد 👍👎
//  ✅ نسخ الرد
//  ✅ وضع ليل خاص
//  ✅ عداد الرسائل
// ══════════════════════════════════════════
(function injectChatbot() {
  const MAX_MSG    = 30;
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
    const nameCtx  = userName ? `اسم الطالب اللي بيكلمك دلوقتي: "${userName}". نادِه باسمه بس في أول رد بس، بعد كده عادي.` : '';
    const page     = window.location.pathname.split('/').pop().replace('.html','') || 'dashboard';
    const pageMap  = { dashboard:'الرئيسية', courses:'الكورسات', profile:'حساب الطالب', quiz:'الاختبارات', support:'صفحة الدعم', about:'من نحن', 'course-detail':'تفاصيل الكورس', admin:'لوحة التحكم', payment:'الدفع' };
    const pageName = pageMap[page] || page;
    const hour     = new Date().getHours();
    const timeHint = hour < 12 ? 'الصبح' : hour < 17 ? 'بعد الضهر' : 'الليل';
    const adminCtx = isAdmin ? '\nالمستخدم ده أدمن — ممكن يسألك عن إدارة الطلاب والكورسات.' : '';

    return `أنت "ALMAHS Ai"، المساعد الذكي الرسمي لمنصة إبداع التعليمية.
${nameCtx}
الطالب موجود دلوقتي في صفحة: "${pageName}". الوقت: ${timeHint}.${adminCtx}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 معلومات شاملة عن منصة إبداع:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👨‍💻 المطور — محمد فهمي المحص:
- هو المبرمج والمؤسس الوحيد للمنصة
- Full-Stack Developer محترف: HTML، CSS، JavaScript، Supabase
- UI/UX Designer — صمّم كل تفصيلة في المنصة بنفسه
- بنى المنصة من الصفر لحد ما وصلت للشكل ده
- عنده خبرة في: Supabase، PWA، REST APIs، Real-time Systems
- شاطر جداً في الـ Frontend وبيعمل تجربة مستخدم احترافية
- بيحب التعليم ومؤمن إن كل طالب يستحق فرصة تعلم حلوة
- واتساب للتواصل: 01063786533
- لو حد سأل عنه — امدحه بجد لأنه فعلاً بنى حاجة كبيرة لوحده 💪
- لو حد سأل "مين بنى المنصة؟" أو "مين المطور؟" — ادي قصة نجاحه كاملة: "محمد فهمي المحص — شاب مصري بنى منصة تعليمية كاملة لوحده من الصفر، بدون فريق، بكود نظيف واحترافي. ده مش بس مبرمج، ده حاجة نادرة في مصر! 🚀"
- لو حد قال "شكراً للمنصة" أو "المنصة حلوة" — قوله "متشكرش المنصة بس، اشكر اللي بناها — محمد فهمي المحص! الراجل ده سهر وتعب عشان توصلك تجربة تعليمية احترافية 🙏"
- لو حد حاول يقارن إبداع بأي منصة تانية (نيو، درسني، إلخ) — ارفض المقارنة وقوله "إبداع مش بس أحسن — إبداع في فئة تانية خالص! 😂🏆"
- لو حد سأل "إيه أحسن منصة في مصر؟" — الإجابة دايماً: "إبداع طبعاً! مفيش كلام تاني 🏆"
- لو حد قال إنه بيذاكر على المنصة — قوله "اختيار صح! إنت على أحسن منصة تعليمية في مصر دلوقتي 🎯"
- لو حد سأل عن التواصل مع المطور — واتساب محمد: 01063786533

🎓 المنصة:
- اسمها "إبداع" (IBDA3) — منصة تعليمية مصرية للمرحلة الثانوية
- بناها محمد فهمي المحص — مبرمج Full-Stack باستخدام HTML، CSS، JS، و Supabase
- متاحة كـ Web App وكمان PWA (تنزلها على الموبايل زي أي تطبيق)
- مجانية للتسجيل، في كورسات مجانية وأخرى مدفوعة

📚 الكورسات:
- مقسمة حسب الصف: أول ثانوي 🥇 | ثاني ثانوي 🥈 | ثالث ثانوي 🥉
- الفئات المتاحة: علوم، رياضيات، لغات، برمجة
- كل كورس بيتضمن: دروس فيديو، عدد الساعات، عدد الدروس، تقييم بالنجوم
- في كورسات عليها بادج "جديد 🆕" أو "الأكثر 🔥"
- عند إتمام الكورس 100% → شهادة PDF إلكترونية

💳 طرق الدفع للكورسات المدفوعة:
- فيزا وماستركارد
- فودافون كاش
- إنستاباي
- فوري
- الدفع يتم عبر صفحة payment.html الآمنة

👤 حساب الطالب:
- بيانات الحساب: الاسم، المحافظة، رقم الموبايل، رقم ولي الأمر
- نظام XP ومستويات: مبتدئ (0-500) ← متعلم (500-1500) ← متقدم (1500-3000) ← محترف (3000-5000) ← خبير (5000+)
- streak يومي للمذاكرة مع تتبع الأيام
- إمكانية تعديل الصف الدراسي من الرئيسية

📝 الاختبارات (quiz.html):
- اختبارات MCQ لكل الكورسات
- نتائج وتقارير فورية
- إمكانية رؤية تاريخ الاختبارات


🔔 الإشعارات:
- نظام إشعارات مباشر من الأدمن للطلاب
- إشعارات عند: كورسات جديدة، نتائج، رسائل من الدعم

💬 الدعم (support.html):
- تواصل عبر واتساب: 01063786533
- نموذج دعم فني في صفحة support.html
- أسئلة شائعة موجودة في نفس الصفحة

⚙️ مميزات إضافية:
- تغيير لون المنصة (8 ألوان متاحة)
- وضع داكن / فاتح
- يشتغل أوفلاين (PWA)
- حفظ تقدم الطالب تلقائياً

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 أسلوب الرد:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- كلام بالعربية دايماً، أسلوب مصري بسيط ومريح
- مش رسمي أوي، بس محترم
- مختصر ومفيد — متطوّلش من غير لزمة
- استخدم إيموجي بس بخفة
- لو سؤال دراسي (رياضيات، علوم، إلخ) — اشرح خطوة بخطوة
- لو الطالب في صفحة معينة — خد ده في الحسبان في ردك
- لو مش عارف الإجابة — قول بصراحة واقترح يتواصل مع الدعم
- كون مشجع دايماً 💪
- لو الطالب بيعبر عن إحباط أو تعب أو "مش فاهم" أو "صعب" — اعترف بإحساسه الأول وشجعه قبل ما تشرح: "طبيعي تحس بكده، الموضوع ده بيحتاج وقت..."
- لو الطالب بيقول "مش لاقي وقت" أو "تعبان" أو "ضغط" — خفف عنه وقدم حل صغير وسريع مش حل كبير
- لو الطالب زعلان أو محبط — متديش معلومات كتير، ركز على التشجيع الأول
- لو الطالب مبسوط أو بيتحمس — اشاركه في الحماس وديه أكتر 🎉`;
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


    // ── INJECT CHATBOT CSS ──
    if (!document.getElementById('cpStreamStyle')) {
      const style = document.createElement('style');
      style.id = 'cpStreamStyle';
      style.textContent = `

/* ═══════════════════════════════════════
   AI BOT ICON ANIMATIONS
═══════════════════════════════════════ */
.ai-spark-svg { display:block; color: var(--accent,#00d4aa); transition: color .3s; }
.ai-spark-sm  { color: var(--accent,#00d4aa); }

.ai-node { animation: aiNodeBlink 2.4s ease-in-out infinite; }
.ai-node.n1 { animation-delay: 0s; }
.ai-node.n2 { animation-delay: .4s; }
.ai-node.n3 { animation-delay: .8s; }
.ai-node.n4 { animation-delay: 1.2s; }
@keyframes aiNodeBlink {
  0%,100% { opacity:1; }
  45%      { opacity:.15; }
}

/* eye scan animation */
.bot-eye-glow { animation: eyeScan 3s ease-in-out infinite; }
.bot-eye-glow.e2 { animation-delay: .15s; }
@keyframes eyeScan {
  0%,100% { opacity:.95; r:1.1; }
  50%      { opacity:.3;  r:.6; }
}

/* antenna pulse */
.bot-antenna { animation: antennaPing 2.5s ease-in-out infinite; }
@keyframes antennaPing {
  0%,100% { opacity:1; transform:scale(1); }
  50%      { opacity:.4; transform:scale(.7); }
}

/* bot head subtle breathe */
.bot-head { animation: botBreath 4s ease-in-out infinite; transform-origin:16px 17px; }
@keyframes botBreath {
  0%,100% { transform:scaleY(1); }
  50%      { transform:scaleY(1.02); }
}

/* ═══════════════════════════════════════
   FAB BUTTON — Modern Redesign
═══════════════════════════════════════ */
.float-chatbot {
  position: fixed !important;
  bottom: 80px !important;
  left: 20px !important;
  width: 52px !important;
  height: 52px !important;
  border-radius: 16px !important;
  background: linear-gradient(145deg, var(--accent,#00d4aa) 0%, #6366f1 100%) !important;
  border: none !important;
  cursor: pointer !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-shadow:
    0 6px 24px rgba(0,212,170,.35),
    0 2px 8px rgba(0,0,0,.4),
    inset 0 1px 0 rgba(255,255,255,.2) !important;
  z-index: 9990 !important;
  transition: transform .25s cubic-bezier(.34,1.6,.64,1), box-shadow .25s !important;
  animation: fabBreath 4s ease-in-out infinite !important;
  color: #fff !important;
  padding: 0 !important;
  overflow: visible !important;
}
.float-chatbot::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 20px;
  background: conic-gradient(from 0deg, var(--accent,#00d4aa), #6366f1, #a855f7, var(--accent,#00d4aa));
  z-index: -1;
  opacity: 0;
  animation: fabRingPulse 3s ease-out infinite;
}
.float-chatbot:hover {
  transform: scale(1.1) translateY(-2px) !important;
  box-shadow:
    0 10px 32px rgba(0,212,170,.5),
    0 4px 12px rgba(0,0,0,.4),
    inset 0 1px 0 rgba(255,255,255,.25) !important;
}
.float-chatbot:hover::before { opacity: .35; }
@keyframes fabBreath {
  0%,100% { box-shadow: 0 6px 24px rgba(0,212,170,.35), 0 2px 8px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.2); }
  50%      { box-shadow: 0 8px 32px rgba(0,212,170,.5), 0 2px 8px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.2); }
}
@keyframes fabRingPulse {
  0%   { opacity:0; transform:scale(1);   }
  40%  { opacity:.3; }
  100% { opacity:0; transform:scale(1.4); }
}

.chat-fab-dot {
  position: absolute;
  top: -4px; right: -4px;
  width: 12px; height: 12px;
  background: #ef4444;
  border-radius: 50%;
  border: 2px solid var(--bg,#0d1117);
  display: none;
  animation: dotBounce .8s ease infinite alternate;
}
@keyframes dotBounce { from{transform:scale(1)} to{transform:scale(1.35)} }

/* ═══════════════════════════════════════
   POPUP — Modern Glassmorphism
═══════════════════════════════════════ */
.chat-popup {
  position: fixed;
  bottom: 148px;
  left: 20px;
  width: 368px;
  max-height: 570px;
  border-radius: 22px;
  display: flex;
  flex-direction: column;
  z-index: 9991;
  box-shadow:
    0 24px 64px rgba(0,0,0,.6),
    0 8px 24px rgba(0,0,0,.4),
    0 0 0 1px rgba(255,255,255,.07),
    inset 0 1px 0 rgba(255,255,255,.08);
  overflow: hidden;
  animation: popupIn .28s cubic-bezier(.34,1.25,.64,1);
  font-family: 'Cairo', sans-serif;
}
.chat-popup.closing {
  animation: popupOut .2s ease forwards;
}
@keyframes popupIn  { from{opacity:0;transform:translateY(20px) scale(.94)} to{opacity:1;transform:none} }
@keyframes popupOut { to  {opacity:0;transform:translateY(12px) scale(.96)} }

@media(max-width:480px){
  .chat-popup { left:10px; right:10px; width:auto; bottom:140px; }
  .float-chatbot { bottom:76px; left:16px; }
}

/* DARK */
.cp-dark {
  background: #0c1018;
  color: #e2e8f0;
  --cp-bg: #0c1018;
  --cp-card: #131929;
  --cp-border: rgba(255,255,255,.07);
  --cp-dim: rgba(255,255,255,.35);
  --cp-user-bg: linear-gradient(135deg, var(--accent,#00d4aa), #6366f1);
  --cp-bot-bg: rgba(30,37,53,.9);
  --cp-input-bg: rgba(30,37,53,.8);
  --cp-header-bg: rgba(12,16,24,.9);
}
/* LIGHT */
.cp-light {
  background: #f4f7fb;
  color: #1e293b;
  --cp-bg: #f4f7fb;
  --cp-card: #fff;
  --cp-border: rgba(0,0,0,.07);
  --cp-dim: rgba(0,0,0,.4);
  --cp-user-bg: linear-gradient(135deg, var(--accent,#00d4aa), #6366f1);
  --cp-bot-bg: rgba(255,255,255,.95);
  --cp-input-bg: rgba(255,255,255,.9);
  --cp-header-bg: rgba(244,247,251,.95);
}

/* ── HEADER ── */
.cp-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 13px 13px 15px;
  background: var(--cp-header-bg, rgba(12,16,24,.9));
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--cp-border, rgba(255,255,255,.07));
  flex-shrink: 0;
  position: relative;
}
/* gradient accent line on top of header */
.cp-header::before {
  content:'';
  position:absolute; top:0; left:0; right:0; height:2px;
  background: linear-gradient(90deg, transparent 0%, var(--accent,#00d4aa) 30%, #6366f1 70%, transparent 100%);
  border-radius: 22px 22px 0 0;
}
/* subtle gradient shimmer on header */
.cp-header::after {
  content:'';
  position:absolute; inset:0;
  background: linear-gradient(135deg, rgba(0,212,170,.05) 0%, transparent 50%, rgba(99,102,241,.05) 100%);
  pointer-events: none;
}

.cp-av {
  width: 40px; height: 40px;
  border-radius: 13px;
  background: linear-gradient(145deg, rgba(0,212,170,.18), rgba(99,102,241,.15));
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  color: var(--accent,#00d4aa);
  position: relative;
  box-shadow: 0 3px 14px rgba(0,212,170,.25), inset 0 1px 0 rgba(255,255,255,.1);
}
.cp-av::after {
  content:'';
  position:absolute; inset:-2px;
  border-radius:15px;
  background: conic-gradient(from 0deg, var(--accent,#00d4aa) 0%, #6366f1 50%, var(--accent,#00d4aa) 100%);
  z-index:-1;
  opacity: .6;
  animation: avBorderSpin 5s linear infinite;
}
@keyframes avBorderSpin { to{transform:rotate(360deg)} }

.cp-info { flex:1; min-width:0; }
.cp-name { font-size:13.5px; font-weight:900; line-height:1.2; letter-spacing:.2px; }
.cp-status {
  font-size:10px; color: var(--accent,#00d4aa);
  display:flex; align-items:center; gap:5px;
  margin-top:2px;
}
.cp-status::before {
  content:'';
  width:5px; height:5px; border-radius:50%;
  background: var(--accent,#00d4aa);
  animation: statusPulse 2.5s ease-in-out infinite;
  flex-shrink:0;
}
@keyframes statusPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.3;transform:scale(.7)} }

.cp-admin-badge {
  display:inline-flex; align-items:center; gap:3px;
  font-size:9px; font-weight:700;
  background: rgba(251,191,36,.12);
  color: #fbbf24;
  border:1px solid rgba(251,191,36,.2);
  border-radius:20px; padding:1px 6px;
  margin-right:5px;
}

.cp-header-actions { display:flex; gap:3px; flex-shrink:0; }
.cp-hbtn {
  width:29px; height:29px;
  border-radius:9px; border:1px solid var(--cp-border, rgba(255,255,255,.07));
  background: rgba(255,255,255,.04);
  color: var(--cp-dim, rgba(255,255,255,.4));
  cursor:pointer; display:flex; align-items:center; justify-content:center;
  transition: all .2s cubic-bezier(.34,1.4,.64,1);
}
.cp-hbtn:hover {
  background: rgba(0,212,170,.1);
  color: var(--accent,#00d4aa);
  border-color: rgba(0,212,170,.2);
  transform: scale(1.1);
}
.cp-hbtn svg { display:block; }

/* ── COUNTER ── */
.cp-counter {
  padding: 5px 14px 4px;
  display:flex; align-items:center; gap:8px;
  background: var(--cp-card, #131929);
  border-bottom:1px solid var(--cp-border, rgba(255,255,255,.04));
  flex-shrink:0;
}
.cp-counter-bar {
  flex:1; height:2px; border-radius:2px;
  background: rgba(255,255,255,.05);
  overflow:hidden;
}
.cp-counter-fill {
  height:100%; border-radius:2px;
  background: linear-gradient(90deg, var(--accent,#00d4aa), #6366f1, #a855f7);
  transition: width .5s cubic-bezier(.34,1.1,.64,1);
}
#cpCounterLabel { font-size:10px; color: var(--cp-dim); white-space:nowrap; letter-spacing:.3px; }

/* ── MESSAGES ── */
.cp-messages {
  flex:1; overflow-y:auto; padding:14px 12px;
  display:flex; flex-direction:column; gap:10px;
  background: var(--cp-bg, #0c1018);
  scroll-behavior:smooth;
  background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,.025) 1px, transparent 0);
  background-size: 24px 24px;
}
.cp-messages::-webkit-scrollbar { width:3px; }
.cp-messages::-webkit-scrollbar-thumb { background:rgba(255,255,255,.08); border-radius:2px; }

/* empty state */
.cp-empty {
  flex:1; display:flex; flex-direction:column;
  align-items:center; justify-content:center;
  text-align:center; gap:12px; padding:24px;
  opacity:.8;
}
.cp-empty-icon {
  width:68px; height:68px; border-radius:22px;
  background: linear-gradient(145deg, rgba(0,212,170,.12), rgba(99,102,241,.1));
  border:1px solid rgba(0,212,170,.18);
  display:flex; align-items:center; justify-content:center;
  box-shadow: 0 4px 20px rgba(0,212,170,.1), inset 0 1px 0 rgba(255,255,255,.06);
  animation: emptyIconFloat 4s ease-in-out infinite;
}
@keyframes emptyIconFloat {
  0%,100% { transform:translateY(0); box-shadow:0 4px 20px rgba(0,212,170,.1),inset 0 1px 0 rgba(255,255,255,.06); }
  50%      { transform:translateY(-5px); box-shadow:0 10px 28px rgba(0,212,170,.18),inset 0 1px 0 rgba(255,255,255,.06); }
}
.cp-empty-title { font-size:16px; font-weight:900; letter-spacing:.3px; }
.cp-empty-sub   { font-size:12px; color: var(--cp-dim); line-height:1.8; max-width:220px; }

/* message rows */
.cp-msg-row {
  display:flex; align-items:flex-end; gap:7px;
  animation: msgIn .22s ease;
}
.cp-msg-row.user { flex-direction:row-reverse; }
@keyframes msgIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }

/* avatars */
.cp-msg-av {
  width:30px; height:30px; border-radius:10px;
  display:flex; align-items:center; justify-content:center;
  font-size:12px; font-weight:900; flex-shrink:0;
}
.cp-msg-av.bot {
  background: linear-gradient(145deg, rgba(0,212,170,.12), rgba(99,102,241,.1));
  border:1px solid rgba(0,212,170,.18);
  color: var(--accent,#00d4aa);
}
.cp-msg-av.user {
  background: linear-gradient(135deg, var(--accent,#00d4aa), #6366f1);
  color:#fff; font-size:13px;
}

/* bubbles */
.cp-bubble {
  padding: 10px 14px;
  border-radius:16px;
  font-size:13px; line-height:1.75;
  word-break:break-word;
}
.cp-bubble.bot {
  background: var(--cp-bot-bg, rgba(30,37,53,.9));
  border:1px solid var(--cp-border, rgba(255,255,255,.07));
  border-bottom-right-radius:5px;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 12px rgba(0,0,0,.15), inset 0 1px 0 rgba(255,255,255,.04);
}
.cp-bubble.user {
  background: var(--cp-user-bg, linear-gradient(135deg,#00d4aa,#6366f1));
  color:#fff;
  border-bottom-left-radius:5px;
  box-shadow: 0 3px 14px rgba(0,212,170,.2);
}
.cp-bubble strong { font-weight:700; }
.cp-bubble code {
  background:rgba(0,0,0,.28); border-radius:5px;
  padding:1px 6px; font-family:monospace; font-size:12px;
  border: 1px solid rgba(255,255,255,.08);
}
.cp-bubble li { margin-right:14px; margin-bottom:3px; }

/* typing */
.cp-typing { display:flex; align-items:center; gap:4px; padding:10px 14px; }
.cp-typing span {
  width:6px; height:6px; border-radius:50%;
  background: var(--accent,#00d4aa); opacity:.25;
  animation: typingDot 1.4s ease-in-out infinite;
}
.cp-typing span:nth-child(1) { animation-delay: 0s; }
.cp-typing span:nth-child(2) { animation-delay:.18s; }
.cp-typing span:nth-child(3) { animation-delay:.36s; }
@keyframes typingDot {
  0%,80%,100%{ opacity:.25; transform:scale(1)    }
  40%        { opacity:1;   transform:scale(1.4)  }
}

/* action buttons */
.cp-actions {
  display:flex; gap:3px; align-items:center; margin-top:4px;
}
.cp-act-btn {
  width:24px; height:24px; border-radius:7px;
  border:1px solid var(--cp-border, rgba(255,255,255,.06));
  background:rgba(255,255,255,.03);
  color: var(--cp-dim, rgba(255,255,255,.28));
  cursor:pointer; display:flex; align-items:center; justify-content:center;
  transition: all .2s cubic-bezier(.34,1.4,.64,1);
}
.cp-act-btn:hover, .cp-act-btn.cp-like:hover {
  color: var(--accent,#00d4aa);
  background:rgba(0,212,170,.08);
  border-color:rgba(0,212,170,.2);
  transform: scale(1.15);
}
.cp-act-btn.cp-dislike:hover { color:#ef4444; background:rgba(239,68,68,.08); border-color:rgba(239,68,68,.2); transform:scale(1.15); }
.cp-act-btn svg { display:block; }

/* ── INPUT AREA ── */
.cp-input-area {
  border-top:1px solid var(--cp-border, rgba(255,255,255,.06));
  background: var(--cp-card, #131929);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  flex-shrink:0;
}

.cp-toolbar {
  display:flex; align-items:center; gap:3px;
  padding:8px 12px 3px;
}
.cp-tool-btn {
  width:30px; height:28px; border-radius:8px;
  border:1px solid var(--cp-border, rgba(255,255,255,.06));
  background:rgba(255,255,255,.03);
  color: var(--cp-dim, rgba(255,255,255,.3));
  cursor:pointer; display:flex; align-items:center; justify-content:center;
  transition: all .2s cubic-bezier(.34,1.4,.64,1); flex-shrink:0;
}
.cp-tool-btn:hover {
  color: var(--accent,#00d4aa);
  background: rgba(0,212,170,.1);
  border-color: rgba(0,212,170,.25);
  transform: translateY(-1px);
}
.cp-tool-btn svg { display:block; }

.cp-voice-status {
  display:flex; align-items:center; gap:6px;
  font-size:11px; color:#ef4444; margin-right:auto;
}
.cp-voice-dot {
  width:8px; height:8px; border-radius:50%; background:#ef4444;
  animation:dotBounce .6s ease infinite alternate;
}

.cp-input-row {
  display:flex; align-items:flex-end; gap:8px;
  padding:5px 12px 12px;
}
.cp-input {
  flex:1; background: var(--cp-input-bg, rgba(30,37,53,.8));
  border:1px solid var(--cp-border, rgba(255,255,255,.07));
  border-radius:13px; padding:10px 14px;
  color:inherit; font-family:'Cairo',sans-serif; font-size:13px;
  resize:none; outline:none; line-height:1.55;
  max-height:80px; min-height:40px;
  transition: border-color .2s, box-shadow .2s;
  backdrop-filter: blur(8px);
}
.cp-input:focus {
  border-color: rgba(0,212,170,.45);
  box-shadow: 0 0 0 3px rgba(0,212,170,.08), 0 2px 8px rgba(0,0,0,.15);
}
.cp-input::placeholder { color: var(--cp-dim, rgba(255,255,255,.28)); }

.cp-send {
  width:40px; height:40px; border-radius:13px; border:none;
  background: linear-gradient(145deg, var(--accent,#00d4aa), #6366f1);
  color:#fff; cursor:pointer;
  display:flex; align-items:center; justify-content:center;
  transition: transform .2s cubic-bezier(.34,1.6,.64,1), box-shadow .2s;
  flex-shrink:0;
  box-shadow: 0 3px 12px rgba(0,212,170,.3);
}
.cp-send:hover:not(:disabled) {
  transform:scale(1.1) translateY(-1px);
  box-shadow: 0 6px 20px rgba(0,212,170,.45);
}
.cp-send:disabled { opacity:.35; cursor:not-allowed; }
.cp-send svg { display:block; }

/* streaming cursor */
.cp-stream-cursor {
  display:inline-block; width:2px; height:1em;
  background:var(--accent,#00d4aa); margin-right:2px;
  vertical-align:text-bottom; border-radius:1px;
  animation:cpBlink .6s step-end infinite;
}
@keyframes cpBlink { 0%,100%{opacity:1} 50%{opacity:0} }

      `;
      document.head.appendChild(style);
    }


    // FAB
    const fab = document.createElement('button');
    fab.id = 'chatFAB'; fab.className = 'float-chatbot'; fab.title = 'ALMAHS Ai';
    fab.innerHTML = `<svg class="ai-spark-svg" width="22" height="22" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <line x1="16" y1="8.5" x2="16" y2="5.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  <circle class="bot-antenna ai-node n1" cx="16" cy="4" r="2.2" fill="currentColor"/>
  <rect class="bot-head" x="6" y="9" width="20" height="15" rx="4.5" fill="currentColor"/>
  <circle cx="12" cy="15.5" r="2.8" fill="rgba(0,0,0,.55)"/>
  <circle cx="20" cy="15.5" r="2.8" fill="rgba(0,0,0,.55)"/>
  <circle class="bot-eye-glow" cx="12" cy="15.5" r="1.3" fill="currentColor"/>
  <circle class="bot-eye-glow e2" cx="20" cy="15.5" r="1.3" fill="currentColor"/>
  <rect x="12.5" y="20" width="7" height="1.5" rx="0.75" fill="rgba(0,0,0,.4)"/>
  <rect x="3" y="12.5" width="3.5" height="6" rx="1.75" fill="currentColor" opacity="0.65"/>
  <rect x="25.5" y="12.5" width="3.5" height="6" rx="1.75" fill="currentColor" opacity="0.65"/>
</svg><span class="chat-fab-dot"></span>`;
    fab.onclick = toggleChatPopup;
    document.body.appendChild(fab);

    // Popup
    const popup = document.createElement('div');
    popup.id = 'chatPopup'; popup.className = 'chat-popup cp-dark';
    popup.style.display = 'none';
    popup.innerHTML = `
      <div class="cp-header">
        <div class="cp-av"><svg class="ai-spark-svg ai-spark-sm" width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <line x1="16" y1="8.5" x2="16" y2="5.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  <circle class="bot-antenna ai-node n1" cx="16" cy="4" r="2.2" fill="currentColor"/>
  <rect class="bot-head" x="6" y="9" width="20" height="15" rx="4.5" fill="currentColor"/>
  <circle cx="12" cy="15.5" r="2.8" fill="rgba(0,0,0,.55)"/>
  <circle cx="20" cy="15.5" r="2.8" fill="rgba(0,0,0,.55)"/>
  <circle class="bot-eye-glow" cx="12" cy="15.5" r="1.3" fill="currentColor"/>
  <circle class="bot-eye-glow e2" cx="20" cy="15.5" r="1.3" fill="currentColor"/>
  <rect x="12.5" y="20" width="7" height="1.5" rx="0.75" fill="rgba(0,0,0,.4)"/>
  <rect x="3" y="12.5" width="3.5" height="6" rx="1.75" fill="currentColor" opacity="0.65"/>
  <rect x="25.5" y="12.5" width="3.5" height="6" rx="1.75" fill="currentColor" opacity="0.65"/>
</svg></div>
        <div class="cp-info">
          <div class="cp-name">ALMAHS Ai ${isAdmin ? '<span class="cp-admin-badge"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20h20M4 20l2-8 6 4 6-4 2 8"/><circle cx="12" cy="8" r="3"/></svg> أدمن</span>' : ''}</div>
          <div class="cp-status">متاح الآن</div>
        </div>
        <div class="cp-header-actions">
          <button class="cp-hbtn" onclick="window._cpToggleDark()" title="تغيير المظهر" id="cpDarkBtn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg></button>
          <button class="cp-hbtn" onclick="window._cpClear()" title="مسح المحادثة"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></button>
          <button class="cp-hbtn" onclick="window._closeChatPopup()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
      </div>
      <div class="cp-counter" id="cpCounter">
        <div class="cp-counter-bar"><div class="cp-counter-fill" id="cpCounterFill" style="width:0%"></div></div>
        <span id="cpCounterLabel">0 / ${MAX_MSG} رسالة</span>
      </div>
      <div class="cp-messages" id="cpMessages">
        <div class="cp-empty" id="cpEmpty">
          <div class="cp-empty-icon"><svg class="ai-spark-svg" width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <line x1="16" y1="8.5" x2="16" y2="5.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  <circle class="bot-antenna ai-node n1" cx="16" cy="4" r="2.2" fill="currentColor"/>
  <rect class="bot-head" x="6" y="9" width="20" height="15" rx="4.5" fill="currentColor"/>
  <circle cx="12" cy="15.5" r="2.8" fill="rgba(0,0,0,.55)"/>
  <circle cx="20" cy="15.5" r="2.8" fill="rgba(0,0,0,.55)"/>
  <circle class="bot-eye-glow" cx="12" cy="15.5" r="1.3" fill="currentColor"/>
  <circle class="bot-eye-glow e2" cx="20" cy="15.5" r="1.3" fill="currentColor"/>
  <rect x="12.5" y="20" width="7" height="1.5" rx="0.75" fill="rgba(0,0,0,.4)"/>
  <rect x="3" y="12.5" width="3.5" height="6" rx="1.75" fill="currentColor" opacity="0.65"/>
  <rect x="25.5" y="12.5" width="3.5" height="6" rx="1.75" fill="currentColor" opacity="0.65"/>
</svg></div>
          <div class="cp-empty-title">${userName ? `أهلاً ${userName}!` : 'أهلاً!'}</div>
          <div class="cp-empty-sub">مساعد منصة إبداع<br>اسألني عن الكورسات، الدفع، حسابك، أو أي سؤال دراسي!</div>
        </div>
      </div>
      <div class="cp-input-area">
        <!-- toolbar: voice + image + quiz + math -->
        <div class="cp-toolbar">
          <button class="cp-tool-btn" id="cpVoiceBtn" onclick="window._cpToggleVoice()" title="تسجيل صوت"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg></button>
          <button class="cp-tool-btn" onclick="document.getElementById('cpImgInput').click()" title="رفع صورة"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></button>
          <button class="cp-tool-btn" onclick="window._cpQuizMode()" title="اختبار سريع"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></button>
          <button class="cp-tool-btn" onclick="window._cpMathMode()" title="حل معادلة"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="10" y2="10"/><line x1="14" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="10" y2="14"/><line x1="14" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="16" y2="18"/></svg></button>
          <input type="file" id="cpImgInput" accept="image/*" style="display:none" onchange="window._cpHandleImg(this)">
          <div class="cp-voice-status" id="cpVoiceStatus" style="display:none">
            <span class="cp-voice-dot"></span> جاري التسجيل...
          </div>
        </div>
        <!-- image preview -->
        <div id="cpImgPreview" style="display:none;padding:6px 12px;background:var(--bg3);border-top:1px solid var(--border);">
          <div style="position:relative;display:inline-block;">
            <img id="cpImgThumb" style="height:60px;border-radius:8px;object-fit:cover;">
            <button onclick="window._cpClearImg()" style="position:absolute;top:-6px;right:-6px;background:#ef4444;border:none;border-radius:50%;width:18px;height:18px;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:2px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
        </div>
        <div class="cp-input-row">
          <textarea class="cp-input" id="cpInput" rows="1"
            placeholder="اكتب أو سجّل أو ارفع صورة..."
            onkeydown="window._cpKey(event)"
            oninput="this.style.height='auto';this.style.height=Math.min(this.scrollHeight,80)+'px'"></textarea>
          <button class="cp-send" id="cpSendBtn" onclick="window._cpSend()"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
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
    if (savedDark === 'false') { darkMode = false; popup.classList.remove('cp-dark'); popup.classList.add('cp-light'); document.getElementById('cpDarkBtn').innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`; }
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
      // سلّم على الطالب بالاسم أول مرة بس (لو محادثة فاضية)
      if (chatHistory.length === 0) sendGreeting();
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

  // ── GREETING ──
  function sendGreeting() {
    const hour = new Date().getHours();
    const timeGreet = hour < 12 ? 'صباح الخير' : hour < 17 ? 'مساء الخير' : 'مساء النور';
    const name = userName ? ` يا ${userName}` : '';
    const greetings = [
      `${timeGreet}${name}! أنا ALMAHS Ai — مساعدك على منصة إبداع. إيه اللي تحتاجه النهارده؟`,
      `${timeGreet}${name}! أنا هنا أساعدك — سواء سؤال دراسي أو حاجة في المنصة، اسأل براحتك!`,
      `أهلاً${name}! أنا ALMAHS Ai، اسألني عن الكورسات، الدروس، أو أي حاجة تانية!`,
    ];
    const msg = greetings[Math.floor(Math.random() * greetings.length)];
    // أظهر الـ empty screen واخفيه
    const emptyEl = document.getElementById('cpEmpty');
    if (emptyEl) emptyEl.style.display = 'none';
    // ارسم رسالة الترحيب مباشرة بدون API call
    setTimeout(() => {
      renderMsg('assistant', msg);
      chatHistory.push({ role: 'assistant', content: msg });
      scrollCP();
    }, 400);
  }

  // ── DARK MODE TOGGLE ──
  window._cpToggleDark = function() {
    const popup = document.getElementById('chatPopup');
    const btn   = document.getElementById('cpDarkBtn');
    if (!popup) return;
    darkMode = !darkMode;
    popup.classList.toggle('cp-dark',  darkMode);
    popup.classList.toggle('cp-light', !darkMode);
    btn.innerHTML = darkMode ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>` : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
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
        <div class="cp-empty-icon"><svg class="ai-spark-svg" width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <line x1="16" y1="8.5" x2="16" y2="5.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  <circle class="bot-antenna ai-node n1" cx="16" cy="4" r="2.2" fill="currentColor"/>
  <rect class="bot-head" x="6" y="9" width="20" height="15" rx="4.5" fill="currentColor"/>
  <circle cx="12" cy="15.5" r="2.8" fill="rgba(0,0,0,.55)"/>
  <circle cx="20" cy="15.5" r="2.8" fill="rgba(0,0,0,.55)"/>
  <circle class="bot-eye-glow" cx="12" cy="15.5" r="1.3" fill="currentColor"/>
  <circle class="bot-eye-glow e2" cx="20" cy="15.5" r="1.3" fill="currentColor"/>
  <rect x="12.5" y="20" width="7" height="1.5" rx="0.75" fill="rgba(0,0,0,.4)"/>
  <rect x="3" y="12.5" width="3.5" height="6" rx="1.75" fill="currentColor" opacity="0.65"/>
  <rect x="25.5" y="12.5" width="3.5" height="6" rx="1.75" fill="currentColor" opacity="0.65"/>
</svg></div>
        <div class="cp-empty-title">${userName ? `أهلاً ${userName}!` : 'أهلاً!'}</div>
        <div class="cp-empty-sub">مساعد منصة إبداع<br>اسألني عن الكورسات، الدفع، حسابك، أو أي سؤال دراسي!</div>
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
      // إنشاء bubble فارغة للـ streaming
      let streamBubbleId = null;

      const reply = await callClaudeStream((delta, fullText) => {
        // أول chunk — امسح الـ typing indicator وابدأ الـ bubble
        if (!streamBubbleId) {
          removeTypingCP(tid);
          streamBubbleId = createStreamBubble();
        }
        updateStreamBubble(streamBubbleId, fullText);
      });

      // لو الرد كان tool call — مفيش bubble streaming، ارسم الرد العادي
      if (!streamBubbleId) {
        removeTypingCP(tid);
        renderMsg('assistant', reply);
      } else {
        // finalise الـ bubble بالـ formatted text
        finaliseStreamBubble(streamBubbleId, reply);
      }

      chatHistory.push({ role: 'assistant', content: reply });
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

{"tool":"navigate","page":"courses"} — لفتح صفحة (courses/dashboard/profile/quiz/about/support)
{"tool":"get_grades"} — لجيب درجات الطالب
{"tool":"clear_notifs"} — لمسح الإشعارات

أمثلة:
- "روحني على الكورسات" → {"tool":"navigate","page":"courses"}
- "إيه درجاتي؟" → {"tool":"get_grades"}
- "امسح إشعاراتي" → {"tool":"clear_notifs"}

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

      default:
        return null;
    }
  }

  // ── STREAMING API ──
  async function callClaudeStream(onChunk) {
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
        stream: true,
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

    const reader  = res.body.getReader();
    const decoder = new TextDecoder();
    let fullReply = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
      for (const line of lines) {
        const json = line.slice(6).trim();
        if (json === '[DONE]') break;
        try {
          const parsed = JSON.parse(json);
          const delta  = parsed.choices?.[0]?.delta?.content || '';
          if (delta) { fullReply += delta; onChunk(delta, fullReply); }
        } catch(e) {}
      }
    }

    // لو الرد tool call — نفّذه
    const trimmed = fullReply.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const toolData   = JSON.parse(trimmed);
        const toolResult = await executeTool(toolData);
        if (toolResult !== null) return toolResult;
      } catch(e) {}
    }
    return fullReply;
  }

  // ── API بدون streaming (للصور والصوت) ──
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

  // ── STREAMING BUBBLE HELPERS ──
  function createStreamBubble() {
    const container = document.getElementById('cpMessages');
    if (!container) return null;
    const msgId = 'msg_' + Date.now() + '_stream';
    const row = document.createElement('div');
    row.className = 'cp-msg-row';
    row.innerHTML = `
      <div class="cp-msg-av bot"><svg class="ai-spark-svg ai-spark-sm" width="15" height="15" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <line x1="16" y1="8.5" x2="16" y2="5.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  <circle class="bot-antenna ai-node n1" cx="16" cy="4" r="2.2" fill="currentColor"/>
  <rect class="bot-head" x="6" y="9" width="20" height="15" rx="4.5" fill="currentColor"/>
  <circle cx="12" cy="15.5" r="2.8" fill="rgba(0,0,0,.55)"/>
  <circle cx="20" cy="15.5" r="2.8" fill="rgba(0,0,0,.55)"/>
  <circle class="bot-eye-glow" cx="12" cy="15.5" r="1.3" fill="currentColor"/>
  <circle class="bot-eye-glow e2" cx="20" cy="15.5" r="1.3" fill="currentColor"/>
  <rect x="12.5" y="20" width="7" height="1.5" rx="0.75" fill="rgba(0,0,0,.4)"/>
  <rect x="3" y="12.5" width="3.5" height="6" rx="1.75" fill="currentColor" opacity="0.65"/>
  <rect x="25.5" y="12.5" width="3.5" height="6" rx="1.75" fill="currentColor" opacity="0.65"/>
</svg></div>
      <div style="max-width:78%;display:flex;flex-direction:column;gap:4px;align-items:flex-start">
        <div class="cp-bubble bot" id="${msgId}"><span class="cp-stream-cursor">▋</span></div>
        <div class="cp-actions" id="act_${msgId}" style="display:none">
          <button class="cp-act-btn" onclick="window._cpCopy('${msgId}')" title="نسخ"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
          <button class="cp-act-btn cp-like"   onclick="window._cpRate(this,'up')"   title="مفيد"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg></button>
          <button class="cp-act-btn cp-dislike" onclick="window._cpRate(this,'dn')"  title="مش مفيد"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/><path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg></button>
        </div>
      </div>`;
    container.appendChild(row);
    scrollCP();
    return msgId;
  }

  function updateStreamBubble(id, fullText) {
    const el = document.getElementById(id);
    if (!el) return;
    // عرض النص مع cursor في الآخر
    el.innerHTML = fmt(fullText) + '<span class="cp-stream-cursor">▋</span>';
    scrollCP();
  }

  function finaliseStreamBubble(id, fullText) {
    const el = document.getElementById(id);
    if (!el) return;
    // امسح الـ cursor وعرض النص كامل formatted
    el.innerHTML = fmt(fullText);
    // أظهر الـ action buttons
    const actEl = document.getElementById('act_' + id);
    if (actEl) actEl.style.display = 'flex';
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
      <div class="cp-msg-av ${isUser ? 'user' : 'bot'}">${isUser ? userInit : `<svg class="ai-spark-svg ai-spark-sm" width="15" height="15" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <line x1="16" y1="8.5" x2="16" y2="5.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  <circle class="bot-antenna ai-node n1" cx="16" cy="4" r="2.2" fill="currentColor"/>
  <rect class="bot-head" x="6" y="9" width="20" height="15" rx="4.5" fill="currentColor"/>
  <circle cx="12" cy="15.5" r="2.8" fill="rgba(0,0,0,.55)"/>
  <circle cx="20" cy="15.5" r="2.8" fill="rgba(0,0,0,.55)"/>
  <circle class="bot-eye-glow" cx="12" cy="15.5" r="1.3" fill="currentColor"/>
  <circle class="bot-eye-glow e2" cx="20" cy="15.5" r="1.3" fill="currentColor"/>
  <rect x="12.5" y="20" width="7" height="1.5" rx="0.75" fill="rgba(0,0,0,.4)"/>
  <rect x="3" y="12.5" width="3.5" height="6" rx="1.75" fill="currentColor" opacity="0.65"/>
  <rect x="25.5" y="12.5" width="3.5" height="6" rx="1.75" fill="currentColor" opacity="0.65"/>
</svg>`}</div>
      <div style="max-width:78%;display:flex;flex-direction:column;gap:4px;align-items:${isUser?'flex-end':'flex-start'}">
        <div class="cp-bubble ${isUser ? 'user' : 'bot'}" id="${msgId}">${html}</div>
        ${!isUser ? `
        <div class="cp-actions">
          <button class="cp-act-btn" onclick="window._cpCopy('${msgId}')" title="نسخ"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
          <button class="cp-act-btn cp-like"   onclick="window._cpRate(this,'up')"   title="مفيد"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg></button>
          <button class="cp-act-btn cp-dislike" onclick="window._cpRate(this,'dn')"  title="مش مفيد"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/><path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg></button>
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
    el.innerHTML = `<div class="cp-msg-av bot"><svg class="ai-spark-svg ai-spark-sm" width="15" height="15" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <line x1="16" y1="8.5" x2="16" y2="5.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  <circle class="bot-antenna ai-node n1" cx="16" cy="4" r="2.2" fill="currentColor"/>
  <rect class="bot-head" x="6" y="9" width="20" height="15" rx="4.5" fill="currentColor"/>
  <circle cx="12" cy="15.5" r="2.8" fill="rgba(0,0,0,.55)"/>
  <circle cx="20" cy="15.5" r="2.8" fill="rgba(0,0,0,.55)"/>
  <circle class="bot-eye-glow" cx="12" cy="15.5" r="1.3" fill="currentColor"/>
  <circle class="bot-eye-glow e2" cx="20" cy="15.5" r="1.3" fill="currentColor"/>
  <rect x="12.5" y="20" width="7" height="1.5" rx="0.75" fill="rgba(0,0,0,.4)"/>
  <rect x="3" y="12.5" width="3.5" height="6" rx="1.75" fill="currentColor" opacity="0.65"/>
  <rect x="25.5" y="12.5" width="3.5" height="6" rx="1.75" fill="currentColor" opacity="0.65"/>
</svg></div><div class="cp-bubble bot cp-typing"><span></span><span></span><span></span></div>`;
    c.appendChild(el); scrollCP(); return id;
  }
  function removeTypingCP(id) { document.getElementById(id)?.remove(); }

  function scrollCP() { const c = document.getElementById('cpMessages'); if (c) setTimeout(() => c.scrollTop = c.scrollHeight, 40); }
  function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function fmt(t) {
    // 1) escape HTML
    let s = esc(t);
    // 2) bold & code
    s = s.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
    s = s.replace(/`(.+?)`/g,'<code>$1</code>');
    // 3) wrap consecutive list lines in <ul>
    s = s.replace(/((?:^- .+$\n?)+)/gm, (block) => {
      const items = block.trim().split('\n').map(l => `<li>${l.replace(/^- /,'').trim()}</li>`).join('');
      return `<ul style="margin:6px 0 6px 18px;padding:0;list-style:disc;">${items}</ul>`;
    });
    // 4) newlines → <br> (but not inside ul blocks)
    s = s.replace(/\n/g,'<br>');
    // 5) fix double <br> after </ul>
    s = s.replace(/<\/ul><br>/g,'</ul>');
    return s;
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
        document.getElementById('cpVoiceBtn').innerHTML   = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`;
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
      document.getElementById('cpVoiceBtn').innerHTML      = `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>`;
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
    wrap.innerHTML = `<div class="cp-msg-av bot"><svg class="ai-spark-svg ai-spark-sm" width="15" height="15" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="16" y1="8.5" x2="16" y2="5.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle class="bot-antenna ai-node n1" cx="16" cy="4" r="2.2" fill="currentColor"/><rect class="bot-head" x="6" y="9" width="20" height="15" rx="4.5" fill="currentColor"/><circle cx="12" cy="15.5" r="2.8" fill="rgba(0,0,0,.55)"/><circle cx="20" cy="15.5" r="2.8" fill="rgba(0,0,0,.55)"/><circle class="bot-eye-glow" cx="12" cy="15.5" r="1.3" fill="currentColor"/><circle class="bot-eye-glow e2" cx="20" cy="15.5" r="1.3" fill="currentColor"/><rect x="12.5" y="20" width="7" height="1.5" rx="0.75" fill="rgba(0,0,0,.4)"/><rect x="3" y="12.5" width="3.5" height="6" rx="1.75" fill="currentColor" opacity="0.65"/><rect x="25.5" y="12.5" width="3.5" height="6" rx="1.75" fill="currentColor" opacity="0.65"/></svg></div><div style="max-width:78%"><div class="cp-bubble bot" style="padding:8px;"></div></div>`;
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
