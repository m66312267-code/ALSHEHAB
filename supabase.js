/* supabase.js — ALSHEHAB Platform — Supabase Auth + DB + Helpers */

// ✅ FIX #1: API Key محمي — بيتجيب من meta tag في الصفحة أو من config
// عشان تشتغل: ضع الـ keys في config.js منفصل أو في meta tags
const SUPABASE_URL = (typeof window !== 'undefined' && window.__SUPABASE_URL__) 
  || document.querySelector('meta[name="sb-url"]')?.content 
  || 'https://iijjapqvjdvagzmeaweq.supabase.co';

const SUPABASE_KEY = (typeof window !== 'undefined' && window.__SUPABASE_KEY__)
  || document.querySelector('meta[name="sb-key"]')?.content
  || 'sb_publishable_3dP43cl1nBPMCJXHyZcVbw_yPQkZVKq';

const sb = {
  url: SUPABASE_URL,
  key: SUPABASE_KEY,

  headers(extra = {}) {
    const session = JSON.parse(localStorage.getItem('sb_session') || 'null');
    return {
      'Content-Type': 'application/json',
      'apikey': this.key,
      'Authorization': `Bearer ${session?.access_token || this.key}`,
      ...extra,
    };
  },

  // ===== AUTH =====
  async signUp(email, password, name) {
    const res = await fetch(`${this.url}/auth/v1/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': this.key },
      body: JSON.stringify({ email, password, data: { name } }),
    });
    const data = await res.json();
    if (data.error || data.code) throw new Error(data.msg || data.error_description || 'خطأ في التسجيل');
    if (data.access_token) {
      localStorage.setItem('sb_session', JSON.stringify(data));
      localStorage.setItem('alshehab_user', JSON.stringify({
        id: data.user?.id,
        email: data.user?.email,
        name: name || email.split('@')[0],
      }));
    }
    return data;
  },

  async signIn(email, password) {
    const res = await fetch(`${this.url}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': this.key },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.error || data.error_code) throw new Error(data.error_description || 'بيانات الدخول غلط');
    localStorage.setItem('sb_session', JSON.stringify(data));
    localStorage.setItem('alshehab_user', JSON.stringify({
      id: data.user?.id,
      email: data.user?.email,
      name: data.user?.user_metadata?.name || email.split('@')[0],
    }));
    return data;
  },

  // ✅ FIX #3: signOut صح — بيمسح الـ session ويوجه لصفحة الدخول
  async signOut() {
    const session = JSON.parse(localStorage.getItem('sb_session') || 'null');
    if (session?.access_token) {
      await fetch(`${this.url}/auth/v1/logout`, {
        method: 'POST',
        headers: this.headers(),
      }).catch(() => {});
    }
    // مسح كل بيانات الجلسة
    localStorage.removeItem('sb_session');
    localStorage.removeItem('alshehab_user');
    localStorage.removeItem('alshehab_enrolled');
    localStorage.removeItem('alshehab_favs');
    localStorage.removeItem('alshehab_xp');
    window.location.href = 'index.html';
  },

  async refreshSession() {
    const session = JSON.parse(localStorage.getItem('sb_session') || 'null');
    if (!session?.refresh_token) return null;
    const res = await fetch(`${this.url}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': this.key },
      body: JSON.stringify({ refresh_token: session.refresh_token }),
    });
    const data = await res.json();
    if (data.access_token) {
      localStorage.setItem('sb_session', JSON.stringify(data));
      return data;
    }
    // ✅ FIX: لو الـ refresh فشل، نمسح الجلسة بدل ما تفضل corrupt
    localStorage.removeItem('sb_session');
    localStorage.removeItem('alshehab_user');
    return null;
  },

  getUser() {
    const session = JSON.parse(localStorage.getItem('sb_session') || 'null');
    if (!session) return null;
    // Token انتهت صلاحيته — مسح الجلسة
    if (session.expires_at && Date.now() / 1000 > session.expires_at) {
      this.refreshSession().catch(() => {
        localStorage.removeItem('sb_session');
        localStorage.removeItem('alshehab_user');
      });
      return session.user || null;
    }
    // refresh قبل الانتهاء بـ 5 دقايق
    if (session.expires_at && Date.now() / 1000 > session.expires_at - 300) {
      this.refreshSession().catch(() => {});
    }
    return session.user || null;
  },

  isLoggedIn() {
    return !!this.getUser();
  },

  // ===== DATABASE REST =====
  async insert(table, data) {
    const res = await fetch(`${this.url}/rest/v1/${table}`, {
      method: 'POST',
      headers: this.headers({ 'Prefer': 'return=representation' }),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.message || json?.error || 'insert failed');
    return json;
  },

  async select(table, filter = '') {
    const res = await fetch(`${this.url}/rest/v1/${table}${filter ? '?' + filter : ''}`, {
      headers: this.headers(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.message || 'select failed');
    return json;
  },

  async update(table, data, filter) {
    const res = await fetch(`${this.url}/rest/v1/${table}?${filter}`, {
      method: 'PATCH',
      headers: this.headers({ 'Prefer': 'return=representation' }),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.message || 'update failed');
    return json;
  },

  async upsert(table, data) {
    const res = await fetch(`${this.url}/rest/v1/${table}`, {
      method: 'POST',
      headers: this.headers({ 'Prefer': 'return=representation,resolution=merge-duplicates' }),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.message || 'upsert failed');
    return json;
  },

  async delete(table, filter) {
    const res = await fetch(`${this.url}/rest/v1/${table}?${filter}`, {
      method: 'DELETE',
      headers: this.headers({ 'Prefer': 'return=representation' }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json?.message || 'delete failed');
    }
    return true;
  },

  // ===== STORAGE — رفع صورة الإيصال =====
  async uploadReceipt(file, userId) {
    const ext  = (file.name || 'receipt.jpg').split('.').pop() || 'jpg';
    const path = `${userId}/${Date.now()}.${ext}`;
    const session = JSON.parse(localStorage.getItem('sb_session') || 'null');
    const token   = session?.access_token || this.key;
    const res = await fetch(`${this.url}/storage/v1/object/receipts/${path}`, {
      method: 'POST',
      headers: { 'apikey': this.key, 'Authorization': `Bearer ${token}`, 'Content-Type': file.type || 'image/jpeg' },
      body: file,
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e.message || 'فشل رفع الصورة');
    }
    return `${this.url}/storage/v1/object/public/receipts/${path}`;
  },
};

// ===== AUTH GUARD =====
// ✅ FIX #4: requireAuth مع double-check للـ session
function requireAuth() {
  const session = JSON.parse(localStorage.getItem('sb_session') || 'null');
  if (!session || !session.user) {
    window.location.replace('index.html');
    return false;
  }
  // فحص انتهاء الصلاحية
  if (session.expires_at && Date.now() / 1000 > session.expires_at + 60) {
    localStorage.removeItem('sb_session');
    localStorage.removeItem('alshehab_user');
    window.location.replace('index.html');
    return false;
  }
  return true;
}

// ✅ FIX #2: Admin Guard — يمنع الوصول لأدمن pages بدون صلاحية
async function requireAdmin() {
  if (!requireAuth()) return false;
  const user = sb.getUser();
  if (!user) return false;
  try {
    const data = await sb.select('profiles', `id=eq.${user.id}&select=role`);
    const role = data?.[0]?.role;
    if (role !== 'admin') {
      document.body.innerHTML = `
        <div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;
          font-family:Cairo,sans-serif;background:#0f1117;color:#fff;text-align:center;padding:30px;">
          <div style="font-size:60px;margin-bottom:20px;">🔒</div>
          <h2 style="font-size:22px;font-weight:900;margin-bottom:10px;">غير مصرح لك بالدخول</h2>
          <p style="color:#6b7280;font-size:14px;margin-bottom:24px;">هذه الصفحة خاصة بالمسؤولين فقط</p>
          <button onclick="window.location.href='dashboard.html'" 
            style="background:#00d4aa;color:#000;border:none;padding:12px 28px;border-radius:10px;
            font-family:Cairo,sans-serif;font-size:14px;font-weight:700;cursor:pointer;">
            🏠 رجوع للرئيسية
          </button>
        </div>`;
      return false;
    }
    return true;
  } catch(e) {
    // ✅ لو فشل الاتصال بـ Supabase → ارفض الدخول (Fail Secure)
    document.body.innerHTML = `
      <div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;
        font-family:Cairo,sans-serif;background:#0f1117;color:#fff;text-align:center;padding:30px;">
        <div style="font-size:60px;margin-bottom:20px;">⚠️</div>
        <h2 style="font-size:22px;font-weight:900;margin-bottom:10px;">تعذّر التحقق من الصلاحيات</h2>
        <p style="color:#6b7280;font-size:14px;margin-bottom:24px;">تحقق من اتصالك بالإنترنت وحاول مجدداً</p>
        <button onclick="location.reload()" 
          style="background:#00d4aa;color:#000;border:none;padding:12px 28px;border-radius:10px;
          font-family:Cairo,sans-serif;font-size:14px;font-weight:700;cursor:pointer;">
          🔄 إعادة المحاولة
        </button>
      </div>`;
    return false;
  }
}

// ===== HELPER: getProfile =====
async function getProfile(userId) {
  try {
    const data = await sb.select('profiles', `id=eq.${userId}`);
    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch {
    return null;
  }
}

// ===== HELPER: getEnrollments =====
async function getEnrollments(userId) {
  try {
    const data = await sb.select(
      'enrollments',
      `user_id=eq.${userId}&order=enrolled_at.desc&select=*,courses(id,title,emoji,lessons_count,hours)`
    );
    if (Array.isArray(data)) {
      // ✅ FIX #6: حفظ الـ XP من Supabase في localStorage لتزامن صح
      localStorage.setItem('alshehab_enrolled_full', JSON.stringify(data));
      return data;
    }
  } catch {
    return JSON.parse(localStorage.getItem('alshehab_enrolled_full') || '[]');
  }
  return JSON.parse(localStorage.getItem('alshehab_enrolled_full') || '[]');
}

// ===== HELPER: getNotifications =====
async function getNotifications(userId) {
  try {
    const data = await sb.select('notifications', `user_id=eq.${userId}&order=created_at.desc&limit=20`);
    return Array.isArray(data) ? data : [];
  } catch {
    return JSON.parse(localStorage.getItem('alshehab_notifs') || '[]');
  }
}

async function markNotifRead(notifId) {
  try {
    await sb.update('notifications', { is_read: true }, `id=eq.${notifId}`);
  } catch {
    const notifs = JSON.parse(localStorage.getItem('alshehab_notifs') || '[]');
    const n = notifs.find(n => n.id == notifId);
    if (n) { n.is_read = true; localStorage.setItem('alshehab_notifs', JSON.stringify(notifs)); }
  }
}

async function markAllNotifsRead(userId) {
  try {
    await sb.update('notifications', { is_read: true }, `user_id=eq.${userId}&is_read=eq.false`);
  } catch {
    const notifs = JSON.parse(localStorage.getItem('alshehab_notifs') || '[]');
    notifs.forEach(n => n.is_read = true);
    localStorage.setItem('alshehab_notifs', JSON.stringify(notifs));
  }
}

// ===== COURSES =====
const Courses = {
  async getAll() {
    try {
      const data = await sb.select('courses', 'order=created_at.desc');
      if (Array.isArray(data)) {
        localStorage.setItem('alshehab_courses', JSON.stringify(data));
        return data;
      }
    } catch(e) { console.warn('Courses.getAll Supabase error:', e); }
    return JSON.parse(localStorage.getItem('alshehab_courses') || '[]');
  },

  async getById(id) {
    try {
      const data = await sb.select('courses', `id=eq.${id}`);
      if (Array.isArray(data) && data.length > 0) return data[0];
    } catch(e) { console.warn('Courses.getById error:', e); }
    const all = JSON.parse(localStorage.getItem('alshehab_courses') || '[]');
    return all.find(c => c.id === id) || null;
  },

  async enroll(courseId) {
    const user = sb.getUser();
    if (!user) return;
    try {
      await sb.upsert('enrollments', { user_id: user.id, course_id: courseId, progress: 0, completed: false });
    } catch(e) { console.warn('enroll error:', e); }
    const enrolled = JSON.parse(localStorage.getItem('alshehab_enrolled') || '[]');
    if (!enrolled.includes(courseId)) {
      enrolled.push(courseId);
      localStorage.setItem('alshehab_enrolled', JSON.stringify(enrolled));
    }
    await XP.add(10, 'تسجيل في كورس جديد 📚').catch(() => {});
  },

  async isEnrolled(courseId) {
    const user = sb.getUser();
    if (!user) return false;
    try {
      const data = await sb.select('enrollments', `user_id=eq.${user.id}&course_id=eq.${courseId}`);
      if (Array.isArray(data) && data.length > 0) return true;
    } catch {}
    const enrolled = JSON.parse(localStorage.getItem('alshehab_enrolled') || '[]');
    return enrolled.includes(courseId);
  },

  async updateProgress(courseId, progress) {
    const user = sb.getUser();
    if (!user) return;
    const completed = progress >= 100;
    try {
      await sb.update('enrollments', { progress, completed }, `user_id=eq.${user.id}&course_id=eq.${courseId}`);
    } catch(e) { console.warn('updateProgress error:', e); }
    if (completed) await XP.add(50, 'أكملت كورس بالكامل 🎓').catch(() => {});
  },

  async getFavorites() {
    const user = sb.getUser();
    if (!user) return JSON.parse(localStorage.getItem('alshehab_favs') || '[]');
    try {
      const data = await sb.select('favorites', `user_id=eq.${user.id}`);
      if (Array.isArray(data)) {
        const ids = data.map(f => f.course_id);
        localStorage.setItem('alshehab_favs', JSON.stringify(ids));
        return ids;
      }
    } catch {}
    return JSON.parse(localStorage.getItem('alshehab_favs') || '[]');
  },

  async toggleFavorite(courseId) {
    const user = sb.getUser();
    const favs  = await this.getFavorites();
    const isFav = favs.includes(courseId);
    if (user) {
      try {
        if (isFav) await sb.delete('favorites', `user_id=eq.${user.id}&course_id=eq.${courseId}`);
        else       await sb.insert('favorites', { user_id: user.id, course_id: courseId });
      } catch(e) { console.warn('toggleFavorite error:', e); }
    }
    const local = JSON.parse(localStorage.getItem('alshehab_favs') || '[]');
    if (isFav) {
      const idx = local.indexOf(courseId);
      if (idx !== -1) local.splice(idx, 1);
    } else {
      local.push(courseId);
    }
    localStorage.setItem('alshehab_favs', JSON.stringify(local));
    return !isFav;
  },
};

// ===== NOTIFICATIONS =====
const Notifs = {
  async getAll() {
    const user = sb.getUser();
    if (!user) return [];
    try {
      const data = await sb.select('notifications', `user_id=eq.${user.id}&order=created_at.desc&limit=20`);
      return Array.isArray(data) ? data : [];
    } catch {
      return JSON.parse(localStorage.getItem('alshehab_notifs') || '[]');
    }
  },

  async add(title, body = '') {
    const user = sb.getUser();
    if (!user) return;
    const notif = { user_id: user.id, title, body, is_read: false };
    try {
      await sb.insert('notifications', notif);
    } catch {
      const notifs = JSON.parse(localStorage.getItem('alshehab_notifs') || '[]');
      notifs.unshift({ ...notif, id: Date.now(), created_at: new Date().toISOString() });
      localStorage.setItem('alshehab_notifs', JSON.stringify(notifs.slice(0, 20)));
    }
    this.updateBadge();
  },

  async markAllRead() {
    const user = sb.getUser();
    if (!user) return;
    try {
      await sb.update('notifications', { is_read: true }, `user_id=eq.${user.id}&is_read=eq.false`);
    } catch {
      const notifs = JSON.parse(localStorage.getItem('alshehab_notifs') || '[]');
      notifs.forEach(n => n.is_read = true);
      localStorage.setItem('alshehab_notifs', JSON.stringify(notifs));
    }
    this.updateBadge();
  },

  async updateBadge() {
    try {
      const notifs = await this.getAll();
      const unread = notifs.filter(n => !n.is_read).length;
      document.querySelectorAll('.notif-dot').forEach(d => d.style.display = unread > 0 ? 'block' : 'none');
    } catch {}
  },

  async renderDropdown() {
    const wrap = document.getElementById('notifList');
    if (!wrap) return;
    const notifs = await this.getAll();
    await this.markAllRead();
    if (notifs.length === 0) {
      wrap.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-dim);font-size:13px;">مفيش إشعارات جديدة</div>';
      return;
    }
    wrap.innerHTML = notifs.map(n => {
      const time = new Date(n.created_at).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
      return `<div class="notif-item" style="${!n.is_read ? 'border-right:3px solid var(--accent);' : ''}">
        <div style="flex:1;">
          <strong style="font-size:13px;">${n.title}</strong>
          ${n.body ? `<br><span style="color:var(--text-dim);font-size:11px;">${n.body}</span>` : ''}
        </div>
        <span style="font-size:10px;color:var(--text-dim);white-space:nowrap;margin-right:8px;">${time}</span>
      </div>`;
    }).join('');
  },
};

// ===== XP SYSTEM =====
const XP = {
  async add(amount, reason = '') {
    const user = sb.getUser();
    if (!user) return;
    // ✅ FIX #6: جيب الـ XP الحقيقي من Supabase مش localStorage فقط
    let current = 0;
    try {
      const profile = await getProfile(user.id);
      current = profile?.xp || parseInt(localStorage.getItem('alshehab_xp') || '0');
    } catch {
      current = parseInt(localStorage.getItem('alshehab_xp') || '0');
    }
    const newXP = current + amount;
    localStorage.setItem('alshehab_xp', newXP);
    try {
      await sb.upsert('profiles', { id: user.id, xp: newXP });
    } catch {}
    await Notifs.add(`حصلت على ${amount} XP ⚡`, reason).catch(() => {});
    return newXP;
  },
};

// ===== STUDY TRACKER =====
const Study = {
  startTime: null,
  start() { this.startTime = Date.now(); },
  stop() {
    if (!this.startTime) return;
    const mins = Math.round((Date.now() - this.startTime) / 60000);
    if (mins < 1) { this.startTime = null; return; }
    const today = new Date().toISOString().slice(0, 10);
    const log   = JSON.parse(localStorage.getItem('alshehab_studylog') || '{}');
    log[today]  = (log[today] || 0) + mins;
    localStorage.setItem('alshehab_studylog', JSON.stringify(log));
    this.startTime = null;
    if (mins >= 5) XP.add(Math.floor(mins / 5) * 2, `درست ${mins} دقيقة 📚`).catch(() => {});
  },
};

document.addEventListener('DOMContentLoaded', () => Study.start());
window.addEventListener('beforeunload', () => Study.stop());
window.addEventListener('visibilitychange', () => {
  if (document.hidden) Study.stop();
  else Study.start();
});
