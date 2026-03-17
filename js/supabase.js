/* supabase.js — IBDA3 Platform — Supabase Auth + DB + Helpers */

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
      localStorage.setItem('ibda3_user', JSON.stringify({
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
    localStorage.setItem('ibda3_user', JSON.stringify({
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
    localStorage.removeItem('ibda3_user');
    localStorage.removeItem('ibda3_enrolled');
    localStorage.removeItem('ibda3_favs');
    localStorage.removeItem('ibda3_xp');
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
    localStorage.removeItem('ibda3_user');
    return null;
  },

  getUser() {
    const session = JSON.parse(localStorage.getItem('sb_session') || 'null');
    if (!session) return null;
    // Token انتهت صلاحيته — حاول تجددها بدل ما تمسح الجلسة فوراً
    if (session.expires_at && Date.now() / 1000 > session.expires_at) {
      this.refreshSession().catch(() => {
        // ✅ FIX: متخرجش الطالب — اتركه يكمل مع الـ session القديم
        console.log('ℹ️ محاولة تجديد الـ session...');
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

};

// ===== AUTH GUARD =====
// ✅ FIX #4: requireAuth مع تخفيف الشروط — بدل خروج فوري، نحاول تجديد الجلسة
function requireAuth() {
  const session = JSON.parse(localStorage.getItem('sb_session') || 'null');
  if (!session || !session.user) {
    window.location.replace('index.html');
    return false;
  }
  // بدل ما تخرج فوراً، جدد الـ session تلقائياً
  if (session.expires_at && Date.now() / 1000 > session.expires_at) {
    // حاول تجديد الـ session بدل الخروج الفوري
    if (typeof sb !== 'undefined' && sb.refreshSession) {
      sb.refreshSession().catch(() => {
        // فقط لو فشل التجديد فعلاً — خرّج الطالب
        localStorage.removeItem('sb_session');
        localStorage.removeItem('ibda3_user');
        window.location.replace('index.html');
      });
    }
    return true;
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
    const data = await sb.select('enrollments', `user_id=eq.${userId}`);
    if (Array.isArray(data)) {
      localStorage.setItem('ibda3_enrolled_full', JSON.stringify(data));
      return data;
    }
  } catch {
    return JSON.parse(localStorage.getItem('ibda3_enrolled_full') || '[]');
  }
  return JSON.parse(localStorage.getItem('ibda3_enrolled_full') || '[]');
}

// ===== HELPER: getNotifications =====
async function getNotifications(userId) {
  try {
    const data = await sb.select('notifications', `user_id=eq.${userId}&order=created_at.desc&limit=20`);
    return Array.isArray(data) ? data : [];
  } catch {
    return JSON.parse(localStorage.getItem('ibda3_notifs') || '[]');
  }
}

async function markNotifRead(notifId) {
  return Notifs.markRead(notifId);
}

async function markAllNotifsRead(userId) {
  return Notifs.markAllRead();
}

async function deleteNotif(notifId) {
  try {
    await sb.delete('notifications', `id=eq.${notifId}`);
  } catch {
    // fallback: مسح من localStorage
    const list = JSON.parse(localStorage.getItem('ibda3_notifs') || '[]');
    localStorage.setItem('ibda3_notifs', JSON.stringify(list.filter(n => n.id !== notifId)));
  }
}

async function deleteAllNotifs(userId) {
  try {
    await sb.delete('notifications', `user_id=eq.${userId}`);
  } catch {
    localStorage.removeItem('ibda3_notifs');
  }
}

// ===== COURSES =====
const Courses = {
  // ✅ PERF: in-memory cache للكورسات — صالح 5 دقايق
  _cache: null,
  _cacheTime: 0,
  _cacheTTL: 5 * 60 * 1000, // 5 دقايق
  _fetchPromise: null, // ✅ PERF: deduplication — لو بتجيب الكورسات، متجيبهاش تاني

  async getAll(forceRefresh = false) {
    // استخدم الـ cache لو موجود وما انتهاش
    if (!forceRefresh && this._cache && (Date.now() - this._cacheTime) < this._cacheTTL) {
      return this._cache;
    }
    // لو فيه request جارية، انتظرها بدل ما تعمل واحدة جديدة
    if (this._fetchPromise) return this._fetchPromise;

    this._fetchPromise = (async () => {
      try {
        const data = await sb.select('courses', 'order=created_at.desc');
        if (Array.isArray(data)) {
          this._cache = data; this._cacheTime = Date.now();
          localStorage.setItem('ibda3_courses', JSON.stringify(data));
          return data;
        }
      } catch(e) { console.warn('Courses.getAll error:', e); }
      const fallback = JSON.parse(localStorage.getItem('ibda3_courses') || '[]');
      this._cache = fallback; this._cacheTime = Date.now();
      return fallback;
    })();

    const result = await this._fetchPromise;
    this._fetchPromise = null;
    return result;
  },

  async getById(id) {
    // ✅ PERF: ابحث في الـ cache أولاً قبل DB call
    const cached = this._cache || JSON.parse(localStorage.getItem('ibda3_courses') || '[]');
    const found = cached.find(c => c.id === id);
    if (found) return found;
    try {
      const data = await sb.select('courses', `id=eq.${id}`);
      if (Array.isArray(data) && data.length > 0) return data[0];
    } catch(e) { console.warn('Courses.getById error:', e); }
    return null;
  },

  async enroll(courseId) {
    const user = sb.getUser();
    if (!user) return;
    try {
      await sb.upsert('enrollments', { user_id: user.id, course_id: courseId, progress: 0, completed: false });
    } catch(e) { console.warn('enroll error:', e); }
    const enrolled = JSON.parse(localStorage.getItem('ibda3_enrolled') || '[]');
    if (!enrolled.includes(courseId)) {
      enrolled.push(courseId);
      localStorage.setItem('ibda3_enrolled', JSON.stringify(enrolled));
    }
    await XP.add(10, 'تسجيل في كورس جديد 📚').catch(() => {});
  },

  async isEnrolled(courseId) {
    const user = sb.getUser();
    if (!user) return false;
    // ✅ PERF: شوف الـ localStorage أولاً — أسرع بكتير
    const localEnrolled = JSON.parse(localStorage.getItem('ibda3_enrolled') || '[]');
    if (localEnrolled.includes(courseId)) return true;
    try {
      const data = await sb.select('enrollments', `user_id=eq.${user.id}&course_id=eq.${courseId}`);
      if (Array.isArray(data) && data.length > 0) {
        // حدّث الـ localStorage
        if (!localEnrolled.includes(courseId)) {
          localEnrolled.push(courseId);
          localStorage.setItem('ibda3_enrolled', JSON.stringify(localEnrolled));
        }
        return true;
      }
    } catch {}
    return false;
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
    if (!user) return JSON.parse(localStorage.getItem('ibda3_favs') || '[]');
    try {
      const data = await sb.select('favorites', `user_id=eq.${user.id}`);
      if (Array.isArray(data)) {
        const ids = data.map(f => f.course_id);
        localStorage.setItem('ibda3_favs', JSON.stringify(ids));
        return ids;
      }
    } catch {}
    return JSON.parse(localStorage.getItem('ibda3_favs') || '[]');
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
    const local = JSON.parse(localStorage.getItem('ibda3_favs') || '[]');
    if (isFav) {
      const idx = local.indexOf(courseId);
      if (idx !== -1) local.splice(idx, 1);
    } else {
      local.push(courseId);
    }
    localStorage.setItem('ibda3_favs', JSON.stringify(local));
    return !isFav;
  },
};

// ===== NOTIFICATIONS — نظام إشعارات حقيقي متكامل =====
const Notifs = {
  _pollingInterval: null,
  _lastCount: 0,
  // ✅ PERF: in-memory cache — بيمنع 3x DB calls في نفس الـ polling cycle
  _cache: null,
  _cacheTime: 0,
  _cacheTTL: 25000, // 25 ثانية

  _invalidateCache() { this._cache = null; this._cacheTime = 0; },

  // ── جيب كل الإشعارات من Supabase (مع cache) ──
  async getAll(forceRefresh = false) {
    const user = sb.getUser();
    if (!user) return [];
    // لو الـ cache شغال وما انتهتش صلاحيته، ارجعه فوراً بدون DB call
    if (!forceRefresh && this._cache && (Date.now() - this._cacheTime) < this._cacheTTL) {
      return this._cache;
    }
    try {
      const data = await sb.select('notifications', `user_id=eq.${user.id}&order=created_at.desc&limit=30`);
      if (Array.isArray(data)) {
        this._cache = data; this._cacheTime = Date.now();
        localStorage.setItem('ibda3_notifs', JSON.stringify(data));
        return data;
      }
    } catch {}
    const fallback = JSON.parse(localStorage.getItem('ibda3_notifs') || '[]');
    this._cache = fallback; this._cacheTime = Date.now();
    return fallback;
  },

  // ── أضف إشعار جديد لمستخدم معين ──
  async add(title, body = '', targetUserId = null) {
    const user = sb.getUser();
    const uid  = targetUserId || user?.id;
    if (!uid) return;
    const notif = { user_id: uid, title, body, is_read: false };
    try {
      await sb.insert('notifications', notif);
    } catch {
      const notifs = JSON.parse(localStorage.getItem('ibda3_notifs') || '[]');
      notifs.unshift({ ...notif, id: Date.now().toString(), created_at: new Date().toISOString() });
      localStorage.setItem('ibda3_notifs', JSON.stringify(notifs.slice(0, 30)));
    }
    // لو الإشعار للمستخدم الحالي → حدّث الـ badge فوراً
    if (!targetUserId || targetUserId === user?.id) {
      await this.updateBadge();
      this._showToastNotif(title);
    }
  },

  // ── ابعت إشعار لكل المستخدمين (أدمن فقط) ──
  async broadcast(title, body = '') {
    try {
      const profiles = await sb.select('profiles', 'select=id');
      if (!Array.isArray(profiles)) return;
      for (const p of profiles) {
        await sb.insert('notifications', { user_id: p.id, title, body, is_read: false }).catch(() => {});
      }
    } catch(e) { console.warn('broadcast error:', e); }
  },

  // ── علّم إشعار كمقروء ──
  async markRead(notifId) {
    this._invalidateCache(); // ✅ PERF: امسح الـ cache قبل التعديل
    try {
      await sb.update('notifications', { is_read: true }, `id=eq.${notifId}`);
    } catch {
      const notifs = JSON.parse(localStorage.getItem('ibda3_notifs') || '[]');
      const n = notifs.find(n => n.id == notifId);
      if (n) n.is_read = true;
      localStorage.setItem('ibda3_notifs', JSON.stringify(notifs));
    }
    await this.updateBadge();
  },

  // ── علّم الكل كمقروء ──
  async markAllRead() {
    const user = sb.getUser();
    if (!user) return;
    this._invalidateCache(); // ✅ PERF: امسح الـ cache
    try {
      await sb.update('notifications', { is_read: true }, `user_id=eq.${user.id}&is_read=eq.false`);
    } catch {
      const notifs = JSON.parse(localStorage.getItem('ibda3_notifs') || '[]');
      notifs.forEach(n => n.is_read = true);
      localStorage.setItem('ibda3_notifs', JSON.stringify(notifs));
    }
    document.querySelectorAll('.notif-dot').forEach(d => d.style.display = 'none');
    document.querySelectorAll('.notif-badge').forEach(d => d.style.display = 'none');
  },

  // ── حدّث الـ badge بعدد الغير مقروء ──
  async updateBadge() {
    try {
      const notifs = await this.getAll();
      const unread = notifs.filter(n => !n.is_read).length;
      this._lastCount = unread;

      // notif-dot (نقطة صغيرة)
      document.querySelectorAll('.notif-dot').forEach(d => {
        d.style.display = unread > 0 ? 'block' : 'none';
      });
      // notif-badge (رقم)
      document.querySelectorAll('.notif-badge').forEach(d => {
        d.textContent = unread > 9 ? '9+' : unread;
        d.style.display = unread > 0 ? 'flex' : 'none';
      });
    } catch {}
  },

  // ── ارسم الـ dropdown ──
  async renderDropdown() {
    const wrap = document.getElementById('notifList');
    if (!wrap) return;

    wrap.innerHTML = '<div style="text-align:center;padding:15px;color:var(--text-dim);font-size:12px;">⏳ جاري التحميل...</div>';

    const notifs = await this.getAll();

    if (notifs.length === 0) {
      wrap.innerHTML = `
        <div style="text-align:center;padding:25px 15px;">
          <div style="font-size:32px;margin-bottom:8px;">🔔</div>
          <div style="color:var(--text-dim);font-size:13px;">مفيش إشعارات جديدة</div>
        </div>`;
      return;
    }

    wrap.innerHTML = notifs.map(n => {
      const time = this._timeAgo(n.created_at);
      const icon = this._getIcon(n.title);
      return `<div class="notif-item ${!n.is_read ? 'notif-unread' : ''}" 
                   data-id="${n.id}" 
                   onclick="Notifs.markRead('${n.id}');this.classList.remove('notif-unread');"
                   style="cursor:pointer;display:flex;gap:10px;align-items:flex-start;
                          padding:12px;border-radius:10px;margin-bottom:6px;transition:all 0.2s;
                          background:${!n.is_read ? 'rgba(0,212,170,0.06)' : 'transparent'};
                          border-right:${!n.is_read ? '3px solid var(--accent)' : '3px solid transparent'};">
        <div style="font-size:20px;min-width:28px;text-align:center;">${icon}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:13px;font-weight:${!n.is_read ? '700' : '500'};margin-bottom:3px;
                      white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${n.title}</div>
          ${n.body ? `<div style="color:var(--text-dim);font-size:11px;line-height:1.5;margin-bottom:3px;">${n.body}</div>` : ''}
          <div style="font-size:10px;color:var(--text-dim);">${time}</div>
        </div>
      </div>`;
    }).join('');

    // علّم الكل كمقروء بعد الفتح
    setTimeout(() => this.markAllRead(), 1500);
  },

  // ── Polling: تحقق من إشعارات جديدة كل 30 ثانية ──
  startPolling(intervalMs = 30000) {
    this.stopPolling();
    this.updateBadge();
    this._pollingInterval = setInterval(async () => {
      const notifs = await this.getAll().catch(() => []);
      const unread = notifs.filter(n => !n.is_read).length;
      if (unread > this._lastCount) {
        this._showToastNotif(notifs.find(n => !n.is_read)?.title || '🔔 لديك إشعارات جديدة');
      }
      this._lastCount = unread;
      document.querySelectorAll('.notif-dot').forEach(d => d.style.display = unread > 0 ? 'block' : 'none');
      document.querySelectorAll('.notif-badge').forEach(d => {
        d.textContent = unread > 9 ? '9+' : unread;
        d.style.display = unread > 0 ? 'flex' : 'none';
      });
    }, intervalMs);
  },

  stopPolling() {
    if (this._pollingInterval) { clearInterval(this._pollingInterval); this._pollingInterval = null; }
  },

  // ── Toast إشعار مرئي صغير ──
  _showToastNotif(title) {
    // مش هنزعج لو الـ dropdown مفتوح
    const drop = document.getElementById('notifDrop');
    if (drop?.classList.contains('show')) return;
    if (typeof showToast === 'function') showToast('🔔 ' + title);
  },

  // ── تحويل وقت لـ "منذ ..." ──
  _timeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60)    return 'الآن';
    if (diff < 3600)  return `منذ ${Math.floor(diff / 60)} دقيقة`;
    if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
    if (diff < 604800) return `منذ ${Math.floor(diff / 86400)} يوم`;
    return new Date(dateStr).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
  },

  // ── أيقونة حسب محتوى الإشعار ──
  _getIcon(title = '') {
    if (title.includes('XP') || title.includes('⚡')) return '⚡';
    if (title.includes('شهادة') || title.includes('🎓')) return '🎓';
    if (title.includes('كورس') || title.includes('📚')) return '📚';
    if (title.includes('دفع') || title.includes('💳') || title.includes('✅')) return '✅';
    if (title.includes('مرحب') || title.includes('🎉')) return '🎉';
    if (title.includes('دعم') || title.includes('📩')) return '📩';
    return '🔔';
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
      current = profile?.xp || parseInt(localStorage.getItem('ibda3_xp') || '0');
    } catch {
      current = parseInt(localStorage.getItem('ibda3_xp') || '0');
    }
    const newXP = current + amount;
    localStorage.setItem('ibda3_xp', newXP);
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
  start() {
    this.startTime = Date.now();
    // ✅ FIX: سجّل last_active عشان إحصائية "نشطون اليوم" تشتغل
    const user = sb.getUser();
    if (user) {
      const today = new Date().toISOString().slice(0, 10);
      const lastSaved = localStorage.getItem('ibda3_last_active_date');
      // بنكتب مرة واحدة في اليوم بس — مش كل مرة بيتنادى start()
      if (lastSaved !== today) {
        localStorage.setItem('ibda3_last_active_date', today);
        sb.upsert('profiles', { id: user.id, last_active: today }).catch(() => {});
      }
    }
  },
  stop() {
    if (!this.startTime) return;
    const mins = Math.round((Date.now() - this.startTime) / 60000);
    if (mins < 1) { this.startTime = null; return; }
    const today = new Date().toISOString().slice(0, 10);
    const log   = JSON.parse(localStorage.getItem('ibda3_studylog') || '{}');
    log[today]  = (log[today] || 0) + mins;
    localStorage.setItem('ibda3_studylog', JSON.stringify(log));
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

// ===== SESSION KEEP-ALIVE =====
// ✅ FIX: ارسل ping كل 5 دقائق عشان الجلسة متنتهيش
(function() {
  const KEEP_ALIVE_INTERVAL = 5 * 60 * 1000; // 5 دقايق
  
  function keepAlive() {
    const session = JSON.parse(localStorage.getItem('sb_session') || 'null');
    if (!session || !session.user) return;
    
    // حاول تجديد الـ token قبل انتهاء الصلاحية
    if (typeof sb !== 'undefined' && sb.refreshSession) {
      sb.refreshSession().catch(err => {
        console.log('ℹ️ لم يتمكن من تجديد الجلسة (ربما الإنترنت مقطوع):', err.message);
      });
    }
  }
  
  // شغّل keep-alive فوراً
  keepAlive();
  
  // ثم كرّر كل 5 دقائق
  setInterval(keepAlive, KEEP_ALIVE_INTERVAL);
  
  // عندما تعود للتطبيق بعد ما تخرج منه، جدد الجلسة فوراً
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      keepAlive();
    }
  });
})();
