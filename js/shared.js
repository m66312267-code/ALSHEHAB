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
