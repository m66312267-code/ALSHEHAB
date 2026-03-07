/* supabase.js — ALSHEHAB Platform — Supabase Auth + DB + Helpers */

const SUPABASE_URL = 'https://iijjapqvjdvagzmeaweq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_3dP43cl1nBPMCJXHyZcVbw_yPQkZVKq';

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
