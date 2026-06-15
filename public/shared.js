// ========== SHARED UTILITIES ==========
const API = '/api';

function getToken() { return localStorage.getItem('vsmm_token'); }
function getUser()  { return JSON.parse(localStorage.getItem('vsmm_user') || 'null'); }
function setAuth(token, user) {
  localStorage.setItem('vsmm_token', token);
  localStorage.setItem('vsmm_user', JSON.stringify(user));
}
function clearAuth() {
  localStorage.removeItem('vsmm_token');
  localStorage.removeItem('vsmm_user');
}

async function apiFetch(path, opts = {}) {
  const token = getToken();
  const res = await fetch(API + path, {
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...opts.headers },
    ...opts
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function toast(msg, type = 'success') {
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.classList.add('show'), 10);
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 300); }, 3500);
}

function fmtKES(n) { return 'KES ' + parseFloat(n || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function fmtDate(d) { return new Date(d).toLocaleDateString('en-KE', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }); }

function statusBadge(s) {
  const colors = { Pending:'#f59e0b', Processing:'#3b82f6', 'In Progress':'#8b5cf6', Completed:'#22c55e', Partial:'#f97316', Cancelled:'#ef4444', Refunded:'#6b7280' };
  return `<span style="background:${colors[s]||'#6b7280'}22;color:${colors[s]||'#6b7280'};border:1px solid ${colors[s]||'#6b7280'}44;padding:2px 10px;border-radius:99px;font-size:0.78rem;font-weight:600">${s}</span>`;
}

function requireAuth(adminOnly = false) {
  const user = getUser();
  const token = getToken();
  if (!token || !user) { window.location.href = '/login.html'; return null; }
  if (adminOnly && user.role !== 'admin') { window.location.href = '/dashboard.html'; return null; }
  return user;
}

function renderNav(activePage) {
  const user = getUser();
  const isAdmin = user?.role === 'admin';
  return `
  <nav class="dash-nav">
    <a href="/dashboard.html" class="logo">Valley<span>SMM</span></a>
    <div class="nav-menu">
      <a href="/dashboard.html" class="${activePage==='dashboard'?'active':''}">🏠 Dashboard</a>
      <a href="/services.html" class="${activePage==='services'?'active':''}">🛒 New Order</a>
      <a href="/orders.html" class="${activePage==='orders'?'active':''}">📋 Orders</a>
      <a href="/wallet.html" class="${activePage==='wallet'?'active':''}">💰 Wallet</a>
      ${isAdmin ? `<a href="/admin.html" class="${activePage==='admin'?'active':''}">⚙️ Admin</a>` : ''}
    </div>
    <div class="nav-user">
      <div class="nav-balance">${fmtKES(user?.balance)}</div>
      <div class="nav-avatar" onclick="toggleUserMenu()">${(user?.name||'U')[0].toUpperCase()}</div>
      <div class="user-menu" id="userMenu">
        <div class="um-name">${user?.name}</div>
        <div class="um-email">${user?.email}</div>
        <hr style="border-color:var(--border);margin:8px 0">
        <a href="/wallet.html">💰 Add Funds</a>
        <a href="/profile.html">👤 Profile</a>
        <a href="#" onclick="logout()">🚪 Logout</a>
      </div>
    </div>
  </nav>`;
}

function toggleUserMenu() {
  document.getElementById('userMenu')?.classList.toggle('show');
}

function logout() {
  clearAuth();
  window.location.href = '/index.html';
}

document.addEventListener('click', e => {
  if (!e.target.closest('.nav-user')) document.getElementById('userMenu')?.classList.remove('show');
});
