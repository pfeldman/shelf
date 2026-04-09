// ── Configuration ──
const API_BASE = "";

// ── State ──
let categories = [];
let linksCache = {};
let allLinks = [];

// ── Icons ──
const ICONS = {
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>',
  external: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>',
  eyeOpen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
  eyeClosed: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>',
  cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
};

const CAT_ICONS = {
  'movies-shows': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="3"/><path d="M7 2v20"/><path d="M17 2v20"/><path d="M2 7h5"/><path d="M2 12h20"/><path d="M2 17h5"/><path d="M17 7h5"/><path d="M17 17h5"/></svg>',
  'peliculas': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="3"/><path d="M7 2v20"/><path d="M17 2v20"/><path d="M2 7h5"/><path d="M2 12h20"/><path d="M2 17h5"/><path d="M17 7h5"/><path d="M17 17h5"/></svg>',
  'series': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="3"/><path d="M8 20h8"/><path d="M12 20v-2"/><polygon points="10,9 10,15 15,12"/></svg>',
  'recetas': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5-1.3c1.5.8 3.2 1.3 5 1.3 5.5 0 10-4.5 10-10S17.5 2 12 2z"/><path d="M8 11c0-2.2 1.8-4 4-4"/><circle cx="12" cy="13" r="1"/><path d="M9 16s1.5 1 3 1 3-1 3-1"/></svg>',
  'recipes': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5-1.3c1.5.8 3.2 1.3 5 1.3 5.5 0 10-4.5 10-10S17.5 2 12 2z"/><path d="M8 11c0-2.2 1.8-4 4-4"/><circle cx="12" cy="13" r="1"/><path d="M9 16s1.5 1 3 1 3-1 3-1"/></svg>',
  'cooking': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4"/><path d="M9 3v3"/><path d="M15 3v3"/><path d="M4 10h16a1 1 0 011 1v1a8 8 0 01-5 7.4V21H8v-1.6A8 8 0 013 12v-1a1 1 0 011-1z"/></svg>',
  'music': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
  'articles': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 7h4v4H7z"/><path d="M13 7h4"/><path d="M13 11h4"/><path d="M7 15h10"/><path d="M7 19h7"/></svg>',
  'tech': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/><line x1="14" y1="4" x2="10" y2="20"/></svg>',
  'news': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 7h4v4H7z"/><path d="M13 7h4"/><path d="M13 11h4"/><path d="M7 15h10"/><path d="M7 19h7"/></svg>',
  'shopping': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>',
  'travel': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>',
  'fitness': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"/></svg>',
  'books': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/><path d="M8 7h8"/><path d="M8 11h5"/></svg>',
  'libros': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/><path d="M8 7h8"/><path d="M8 11h5"/></svg>',
  'documentales': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="M2 12h4"/><path d="M18 12h4"/></svg>',
  'directores': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M6 21v-2a6 6 0 0112 0v2"/><path d="M16 3l2-1"/><path d="M18 5l2-1"/></svg>',
  'podcasts': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>',
  'games': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 11h4"/><path d="M8 9v4"/><path d="M15 12h.01"/><path d="M18 10h.01"/><rect x="2" y="6" width="20" height="12" rx="4"/></svg>',
  'cortometrajes': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="14" rx="2"/><polygon points="10,8 10,14 15,11"/><line x1="2" y1="21" x2="22" y2="21"/></svg>',
  'diy': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>',
  'default': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>',
};

function getCategoryIcon(slug) {
  return CAT_ICONS[slug] || CAT_ICONS.default;
}

// ── API ──
async function api(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${API_BASE}${path}`, opts);
  if (!res.ok && res.status !== 404) throw new Error(`API ${res.status}`);
  if (res.status === 404) return null;
  return res.json();
}

async function fetchCategories() {
  categories = await api('GET', '/api/categories') || [];
  return categories;
}

async function fetchLinks(categoryId) {
  const path = categoryId ? `/api/links?category_id=${categoryId}` : '/api/links';
  const links = await api('GET', path) || [];
  return links;
}

async function deleteLink(id) {
  await api('DELETE', `/api/links/${id}`);
}

async function patchLink(id, updates) {
  return await api('PATCH', `/api/links/${id}`, updates);
}

// ── Cart API ──
async function fetchCart() {
  return await api('GET', '/api/cart') || [];
}

async function addCartItem(text) {
  return await api('POST', '/api/cart', { text });
}

async function addCartBatch(items, fromLinkId) {
  const body = { items };
  if (fromLinkId) body.from_link_id = fromLinkId;
  return await api('POST', '/api/cart/batch', body);
}

async function toggleCartItem(id) {
  return await api('PATCH', `/api/cart/${id}`);
}

async function deleteCartItem(id) {
  return await api('DELETE', `/api/cart/${id}`);
}

async function clearCompletedCart() {
  return await api('DELETE', '/api/cart');
}

// ── Routing ──
function getRoute() {
  const hash = location.hash || '#/';
  if (hash === '#/') return { screen: 'home' };
  if (hash === '#/cart') return { screen: 'cart' };
  if (hash === '#/voice') return { screen: 'voice' };
  const catMatch = hash.match(/^#\/category\/(.+)$/);
  if (catMatch) return { screen: 'category', id: catMatch[1] };
  const linkMatch = hash.match(/^#\/link\/(.+)$/);
  if (linkMatch) return { screen: 'link', id: linkMatch[1] };
  return { screen: 'home' };
}

function navigate(hash) {
  location.hash = hash;
}

// ── Rendering ──
const app = document.getElementById('app');

function render() {
  const route = getRoute();
  const fab = document.getElementById('cart-fab');
  if (fab) fab.style.display = (route.screen === 'cart' || route.screen === 'voice') ? 'none' : '';
  switch (route.screen) {
    case 'home': renderHome(); break;
    case 'category': renderCategory(route.id); break;
    case 'link': renderLink(route.id); break;
    case 'cart': renderCart(); break;
    case 'voice': renderVoice(); break;
    default: renderHome();
  }
  updateCartBadge();
}

async function refreshHome() {
  const btn = document.getElementById('refresh-btn');
  if (btn) btn.classList.add('spinning');
  try {
    const [cats, links] = await Promise.all([fetchCategories(), fetchLinks()]);
    allLinks = links;
    // Only update content area, not the whole page
    const route = getRoute();
    if (route.screen === 'home') renderHomeContent(cats, links);
  } catch {
    showToast('Could not refresh');
  }
  if (btn) btn.classList.remove('spinning');
}

async function renderHome() {
  // Show skeleton immediately
  app.innerHTML = `
    <div class="screen">
      <div class="home-header">
        <div class="home-brand"><h1>Shelf</h1><p>Your curated links</p></div>
        <div class="home-header-actions">
          <button class="refresh-btn" id="refresh-btn" onclick="refreshHome()">${ICONS.refresh}</button>
          <button class="add-link-btn" onclick="showAddLink()">${ICONS.plus}</button>
        </div>
      </div>
      <div id="home-content">
        <p class="section-label">Collections</p>
        <div class="category-grid">
          <div class="skeleton skeleton-card"></div>
          <div class="skeleton skeleton-card"></div>
          <div class="skeleton skeleton-card"></div>
          <div class="skeleton skeleton-card"></div>
        </div>
      </div>
    </div>`;

  try {
    const [cats, links] = await Promise.all([fetchCategories(), fetchLinks()]);
    allLinks = links;
    renderHomeContent(cats, links);
  } catch (e) {
    document.getElementById('home-content').innerHTML = '<div class="empty-state"><span class="empty-state-icon">⚠️</span><p class="empty-state-text">Could not load data</p></div>';
  }
}

function renderHomeContent(cats, links) {
  const pending = links.filter(l => l.status === 'pending' || l.status === 'processing');
  const countByCategory = {};
  links.filter(l => l.status === 'done' && l.category_id).forEach(l => {
    countByCategory[l.category_id] = (countByCategory[l.category_id] || 0) + 1;
  });

  let html = '';

  if (pending.length) {
    html += `
      <div class="pending-banner" onclick="this.querySelector('.pending-list').classList.toggle('expanded')">
        <div class="pending-header">
          <div class="pending-spinner"></div>
          <span class="pending-text">${pending.length} link${pending.length > 1 ? 's' : ''} processing…</span>
          <span class="pending-chevron">${ICONS.chevron}</span>
        </div>
        <div class="pending-list">
          ${pending.map(l => `<div class="pending-item"><span class="pending-url">${esc(getDomain(l.url) || l.url)}</span>${l.processing_step ? `<span class="pending-step">${esc(l.processing_step)}</span>` : ''}</div>`).join('')}
        </div>
      </div>`;
  }

  if (cats.length === 0 && pending.length === 0) {
    html += `
      <div class="empty-state">
        <span class="empty-state-icon">📭</span>
        <p class="empty-state-text">No links yet. Share something!</p>
      </div>`;
  } else if (cats.length > 0) {
    const nonEmpty = cats.filter(cat => countByCategory[cat._id] > 0);
    if (nonEmpty.length > 0) {
      html += '<p class="section-label">Collections</p><div class="category-grid stagger">';
      nonEmpty.forEach(cat => {
        const count = countByCategory[cat._id];
        html += `
          <div class="category-card" onclick="navigate('#/category/${cat._id}')">
            <span class="category-icon">${getCategoryIcon(cat.slug)}</span>
            <div class="category-name">${esc(cat.name)}</div>
            <div class="category-count">${count} link${count !== 1 ? 's' : ''}</div>
          </div>`;
      });
      html += '</div>';
    }
  }

  document.getElementById('home-content').innerHTML = html;
}

let categoryFilteredLinks = [];
let categoryExtType = 'generic';
let categoryActiveGenre = null;

function renderCategoryLinks(done, extType, query) {
  const listEl = document.getElementById('links-list');
  if (!listEl) return;

  let pool = done;

  // Apply genre filter for movies
  if (categoryActiveGenre && extType === 'movie') {
    pool = pool.filter(l => {
      const names = (l.extension_data || {}).genre_names || [];
      return names.includes(categoryActiveGenre);
    });
  }

  const filtered = query
    ? pool.filter(l => {
        const q = query.toLowerCase();
        if ((l.title || l.url).toLowerCase().includes(q)) return true;
        const ext = l.extension_data || {};
        // Movies: search actors and directors
        if (extType === 'movie') {
          const cast = ext.cast || [];
          const dirs = ext.directors || [];
          if (cast.some(a => a.name.toLowerCase().includes(q))) return true;
          if (dirs.some(d => d.name.toLowerCase().includes(q))) return true;
        }
        // Recipes: search ingredients
        if (extType === 'recipe') {
          const ings = ext.ingredients || [];
          if (ings.some(i => i.toLowerCase().includes(q))) return true;
        }
        return false;
      })
    : pool;

  if (filtered.length === 0) {
    listEl.innerHTML = query
      ? '<div class="empty-state"><span class="empty-state-icon">🔍</span><p class="empty-state-text">No matches</p></div>'
      : '<div class="empty-state"><span class="empty-state-icon">📂</span><p class="empty-state-text">No links in this collection yet</p></div>';
    listEl.className = 'poster-grid';
    return;
  }

  listEl.innerHTML = filtered.map(link => {
    const ext = link.extension_data || {};
    const hasCover = extType === 'movie' || extType === 'book' || extType === 'director';
    const thumbUrl = hasCover ? (ext.poster_url || ext.cover_url || ext.photo_url) : (ext.poster_url || ext.cover_url || ext.photo_url || link.thumbnail);
    const img = thumbUrl
      ? `<img class="poster-img" src="${esc(thumbUrl)}" alt="" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
      : '';
    const watched = ext.watched || false;
    const watchBadge = extType === 'movie'
      ? `<button class="poster-watch-btn ${watched ? 'watched' : ''}" onclick="event.stopPropagation(); toggleWatchedFromList('${link._id}', ${!watched})">${watched ? ICONS.eyeOpen : ICONS.eyeClosed}</button>`
      : '';
    const rating = ext.rating ? Number(ext.rating) : null;
    const ratingBadge = rating
      ? `<div class="poster-rating">★ ${rating.toFixed(1)}/10</div>`
      : '';
    return `
      <div class="poster-card ${watched ? 'is-watched' : ''}" onclick="navigate('#/link/${link._id}')">
        <div class="poster-frame">
          ${img}
          <div class="poster-fallback" ${thumbUrl ? 'style="display:none"' : ''}>${CAT_ICONS.default}</div>
          ${watchBadge}
          ${ratingBadge}
        </div>
        <div class="poster-title">${esc(link.title || link.url)}</div>
      </div>`;
  }).join('');
  listEl.className = query ? 'poster-grid' : 'poster-grid stagger';
}

function handleCategoryFilter(e) {
  renderCategoryLinks(categoryFilteredLinks, categoryExtType, e.target.value);
}

function filterByGenre(genre) {
  categoryActiveGenre = genre;
  // Update chip active states
  document.querySelectorAll('.genre-chip').forEach(btn => {
    const isAll = btn.textContent === 'All';
    btn.classList.toggle('active', genre === null ? isAll : btn.textContent === genre);
  });
  const query = (document.getElementById('category-search') || {}).value || '';
  renderCategoryLinks(categoryFilteredLinks, categoryExtType, query);
}

function clearCategoryFilter() {
  const input = document.getElementById('category-search');
  if (input) {
    input.value = '';
    renderCategoryLinks(categoryFilteredLinks, categoryExtType, '');
    input.focus();
  }
}

async function renderCategory(categoryId) {
  const cat = categories.find(c => c._id === categoryId);
  const catName = cat ? cat.name : 'Links';

  app.innerHTML = `
    <div class="screen">
      <div class="header">
        <button class="back-btn" onclick="navigate('#/')">${ICONS.back}</button>
        <div>
          <div class="header-subtitle">Collection</div>
          <div class="header-title">${esc(catName)}</div>
        </div>
      </div>
      <div class="category-search-wrap" id="category-search-wrap" style="display:none">
        <input type="text" id="category-search" class="category-search" placeholder="Search ${esc(catName).toLowerCase()}…" autocomplete="off" oninput="handleCategoryFilter(event)">
        <button class="category-search-clear" id="category-search-clear" onclick="clearCategoryFilter()">${ICONS.close}</button>
      </div>
      <div class="genre-filter-wrap" id="genre-filter-wrap" style="display:none"></div>
      <div class="poster-grid stagger" id="links-list">
        <div class="skeleton skeleton-poster"></div>
        <div class="skeleton skeleton-poster"></div>
        <div class="skeleton skeleton-poster"></div>
        <div class="skeleton skeleton-poster"></div>
      </div>
    </div>`;

  try {
    const links = await fetchLinks(categoryId);
    linksCache = {};
    links.forEach(l => linksCache[l._id] = l);

    const done = links.filter(l => l.status === 'done');

    if (done.length === 0) {
      document.getElementById('links-list').innerHTML = '<div class="empty-state"><span class="empty-state-icon">📂</span><p class="empty-state-text">No links in this collection yet</p></div>';
      return;
    }

    categoryExtType = cat ? cat.extension_type : 'generic';
    if (categoryExtType === 'movie') {
      done.sort((a, b) => {
        const aw = (a.extension_data || {}).watched ? 1 : 0;
        const bw = (b.extension_data || {}).watched ? 1 : 0;
        if (aw !== bw) return aw - bw;
        const ar = Number((a.extension_data || {}).rating) || 0;
        const br = Number((b.extension_data || {}).rating) || 0;
        return br - ar;
      });
    }

    categoryFilteredLinks = done;
    categoryActiveGenre = null;
    document.getElementById('category-search-wrap').style.display = '';

    // Build genre filter for movie categories
    if (categoryExtType === 'movie') {
      const genreSet = new Set();
      done.forEach(l => {
        const names = (l.extension_data || {}).genre_names || [];
        names.forEach(g => genreSet.add(g));
      });
      const genres = [...genreSet].sort();
      if (genres.length) {
        const wrap = document.getElementById('genre-filter-wrap');
        wrap.style.display = '';
        wrap.innerHTML = `<button class="genre-chip active" onclick="filterByGenre(null)">All</button>` +
          genres.map(g => `<button class="genre-chip" onclick="filterByGenre('${esc(g)}')">${esc(g)}</button>`).join('');
      }
      // Update placeholder to hint about people search
      const searchInput = document.getElementById('category-search');
      if (searchInput) searchInput.placeholder = `Search by title, actor, director…`;
    } else if (categoryExtType === 'recipe') {
      const searchInput = document.getElementById('category-search');
      if (searchInput) searchInput.placeholder = `Search by title or ingredient…`;
    }

    renderCategoryLinks(done, categoryExtType, '');
  } catch (e) {
    document.getElementById('links-list').innerHTML = '<div class="empty-state"><span class="empty-state-icon">⚠️</span><p class="empty-state-text">Could not load links</p></div>';
  }
}

async function renderLink(linkId) {
  let link = linksCache[linkId];
  if (!link) {
    // Fetch all links to find this one
    const all = allLinks.length ? allLinks : await fetchLinks();
    link = all.find(l => l._id === linkId);
  }
  if (!link) {
    app.innerHTML = '<div class="screen"><div class="empty-state"><span class="empty-state-icon">🔍</span><p class="empty-state-text">Link not found</p></div></div>';
    return;
  }

  const cat = categories.find(c => c._id === link.category_id);
  const ext = link.extension_data || {};
  const extType = cat ? cat.extension_type : 'generic';

  let html = `<div class="screen"><div class="header"><button class="back-btn" onclick="navigate('#/category/${link.category_id}')">${ICONS.back}</button><div><div class="header-subtitle">${esc(cat ? cat.name : 'Link')}</div><div class="header-title">Details</div></div></div>`;

  if (extType === 'movie') {
    html += renderMovieDetail(link, ext);
  } else if (extType === 'recipe') {
    html += renderRecipeDetail(link, ext);
  } else if (extType === 'book') {
    html += renderBookDetail(link, ext);
  } else if (extType === 'director') {
    html += renderDirectorDetail(link, ext);
  } else {
    html += renderGenericDetail(link);
  }

  html += `
    <div class="actions">
      <a href="${esc(link.url)}" target="_blank" rel="noopener" class="btn btn-primary">${ICONS.external} Open original</a>
      <button class="btn btn-secondary" onclick="showRecategorize('${link._id}')">${ICONS.refresh} Recategorize</button>
      <button class="btn btn-danger" onclick="confirmDelete('${link._id}')">${ICONS.trash} Delete link</button>
    </div>
  </div>`;

  app.innerHTML = html;
}

function renderMovieDetail(link, ext) {
  let html = '';
  if (ext.poster_url) {
    html += `<img class="detail-poster" src="${esc(ext.poster_url)}" alt="${esc(link.title)}">`;
  } else if (link.thumbnail) {
    html += `<img class="detail-hero" src="${esc(link.thumbnail)}" alt="">`;
  }
  html += `<h2 class="detail-title">${esc(link.title || '')}</h2>`;
  html += '<div class="detail-meta">';
  if (ext.year) html += `<span class="detail-tag">${esc(String(ext.year))}</span>`;
  if (ext.media_type) html += `<span class="detail-tag accent">${ext.media_type === 'tv' ? 'TV Show' : 'Movie'}</span>`;
  if (ext.genre_names && ext.genre_names.length) {
    ext.genre_names.forEach(g => html += `<span class="detail-tag">${esc(g)}</span>`);
  }
  html += '</div>';
  if (ext.rating) {
    html += `<div class="detail-rating"><span class="detail-rating-value">★ ${Number(ext.rating).toFixed(1)}/10</span><span class="detail-rating-label">TMDB</span></div>`;
  }
  // Watch status toggle
  const watched = ext.watched || false;
  html += `
    <button class="watch-toggle ${watched ? 'watched' : ''}" onclick="toggleWatched('${link._id}', ${!watched})">
      <span class="watch-icon">${watched ? ICONS.eyeOpen : ICONS.eyeClosed}</span>
      <span>${watched ? 'Watched' : 'Not watched'}</span>
    </button>`;
  const summary = ext.overview || link.summary || '';
  if (summary) html += `<p class="detail-summary">${esc(summary)}</p>`;

  // Directors
  if (ext.directors && ext.directors.length) {
    html += `<h3 class="detail-section-title">${ext.directors.length === 1 ? 'Director' : 'Directors'}</h3>`;
    html += '<div class="people-row">';
    ext.directors.forEach(d => {
      const photo = d.photo_url
        ? `<img class="person-photo" src="${esc(d.photo_url)}" alt="${esc(d.name)}" loading="lazy">`
        : `<div class="person-photo person-photo-placeholder">${esc(d.name[0])}</div>`;
      html += `<div class="person-chip">${photo}<span class="person-name">${esc(d.name)}</span></div>`;
    });
    html += '</div>';
  }

  // Cast
  if (ext.cast && ext.cast.length) {
    html += '<h3 class="detail-section-title">Cast</h3>';
    html += '<div class="people-row">';
    ext.cast.forEach(a => {
      const photo = a.photo_url
        ? `<img class="person-photo" src="${esc(a.photo_url)}" alt="${esc(a.name)}" loading="lazy">`
        : `<div class="person-photo person-photo-placeholder">${esc(a.name[0])}</div>`;
      html += `<div class="person-chip">${photo}<div class="person-info"><span class="person-name">${esc(a.name)}</span>${a.character ? `<span class="person-role">${esc(a.character)}</span>` : ''}</div></div>`;
    });
    html += '</div>';
  }

  // Streaming providers
  if (ext.watch_providers && ext.watch_providers.length) {
    html += '<h3 class="detail-section-title">Where to watch</h3>';
    html += '<div class="providers-grid">';
    ext.watch_providers.forEach((p, i) => {
      const logo = p.logo_url
        ? `<img class="provider-logo" src="${esc(p.logo_url)}" alt="${esc(p.name)}">`
        : `<span class="provider-logo-placeholder">${esc(p.name[0])}</span>`;
      html += `
        <div class="provider-chip" onclick="toggleProviderCountries(${i})">
          ${logo}
          <span class="provider-name">${esc(p.name)}</span>
          <span class="provider-count">${p.countries.length}</span>
        </div>
        <div class="provider-countries" id="provider-countries-${i}">
          ${p.countries.map(c => `<span class="country-flag" onclick="event.stopPropagation(); showCountryName('${esc(c)}', this)">${countryFlag(c)}</span>`).join('')}
        </div>`;
    });
    html += '</div>';
  }

  return html;
}

function toggleProviderCountries(index) {
  const el = document.getElementById(`provider-countries-${index}`);
  if (el) el.classList.toggle('expanded');
}

function countryFlag(code) {
  return String.fromCodePoint(...[...code.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65));
}

const countryNames = new Intl.DisplayNames(['en'], { type: 'region' });

function showCountryName(code, el) {
  // Remove any existing tooltip
  document.querySelectorAll('.country-tooltip').forEach(t => t.remove());
  const name = countryNames.of(code.toUpperCase()) || code;
  const tip = document.createElement('div');
  tip.className = 'country-tooltip';
  tip.textContent = name;
  el.style.position = 'relative';
  el.appendChild(tip);
  setTimeout(() => tip.remove(), 2000);
}

function renderRecipeDetail(link, ext) {
  let html = '';
  if (link.thumbnail) {
    html += `<img class="detail-hero" src="${esc(link.thumbnail)}" alt="">`;
  }
  html += `<h2 class="detail-title">${esc(link.title || '')}</h2>`;

  if (ext.prep_time || ext.cook_time || ext.servings) {
    html += '<div class="recipe-stats">';
    if (ext.prep_time) html += `<div class="recipe-stat"><span class="recipe-stat-value">${esc(ext.prep_time)}</span><span class="recipe-stat-label">Prep</span></div>`;
    if (ext.cook_time) html += `<div class="recipe-stat"><span class="recipe-stat-value">${esc(ext.cook_time)}</span><span class="recipe-stat-label">Cook</span></div>`;
    if (ext.servings) html += `<div class="recipe-stat"><span class="recipe-stat-value">${esc(ext.servings)}</span><span class="recipe-stat-label">Servings</span></div>`;
    html += '</div>';
  }

  if (ext.ingredients && ext.ingredients.length) {
    html += '<h3 class="detail-section-title">Ingredients</h3><ul class="ingredient-list">';
    ext.ingredients.forEach(i => html += `<li>${esc(i)}</li>`);
    html += '</ul>';
    const ingId = '_ing_' + link._id;
    window[ingId] = ext.ingredients;
    html += `<button class="btn btn-secondary cart-ingredients-btn" onclick="addIngredientsToCart('${link._id}', window['${ingId}'])">${ICONS.cart} Add ingredients to cart</button>`;
  }

  if (ext.steps && ext.steps.length) {
    html += '<h3 class="detail-section-title">Instructions</h3><ol class="step-list">';
    ext.steps.forEach(s => html += `<li>${esc(s)}</li>`);
    html += '</ol>';
  }

  if (link.summary) html += `<p class="detail-summary">${esc(link.summary)}</p>`;
  return html;
}

function renderBookDetail(link, ext) {
  let html = '';
  if (ext.cover_url) {
    html += `<img class="detail-poster" src="${esc(ext.cover_url)}" alt="${esc(link.title)}">`;
  } else if (link.thumbnail) {
    html += `<img class="detail-hero" src="${esc(link.thumbnail)}" alt="">`;
  }
  html += `<h2 class="detail-title">${esc(ext.ol_title || link.title || '')}</h2>`;
  if (ext.author) html += `<p class="book-author">${esc(ext.author)}</p>`;
  html += '<div class="detail-meta">';
  if (ext.year) html += `<span class="detail-tag">${esc(String(ext.year))}</span>`;
  if (ext.pages) html += `<span class="detail-tag">${ext.pages} pages</span>`;
  html += '</div>';
  if (ext.rating) {
    html += `<div class="detail-rating"><span class="detail-rating-value">★ ${Number(ext.rating).toFixed(1)}/5</span><span class="detail-rating-label">Open Library</span></div>`;
  }
  if (ext.subjects && ext.subjects.length) {
    html += '<div class="book-subjects">';
    ext.subjects.forEach(s => html += `<span class="detail-tag">${esc(s)}</span>`);
    html += '</div>';
  }
  const summary = link.summary || '';
  if (summary) html += `<p class="detail-summary">${esc(summary)}</p>`;
  return html;
}

function renderDirectorDetail(link, ext) {
  let html = '';
  if (ext.photo_url) {
    html += `<img class="detail-poster" src="${esc(ext.photo_url)}" alt="${esc(link.title)}">`;
  }
  html += `<h2 class="detail-title">${esc(ext.tmdb_name || link.title || '')}</h2>`;
  html += '<div class="detail-meta">';
  if (ext.birthday) html += `<span class="detail-tag">${esc(ext.birthday)}</span>`;
  if (ext.place_of_birth) html += `<span class="detail-tag">${esc(ext.place_of_birth)}</span>`;
  html += '</div>';
  if (ext.biography) html += `<p class="detail-summary">${esc(ext.biography)}</p>`;
  if (ext.tmdb_url) {
    html += `<a href="${esc(ext.tmdb_url)}" target="_blank" rel="noopener" class="btn btn-secondary" style="margin:12px 0">${ICONS.external} TMDB profile</a>`;
  }
  if (ext.filmography && ext.filmography.length) {
    html += '<h3 class="detail-section-title">Filmography</h3>';
    html += '<div class="director-filmography">';
    ext.filmography.forEach(f => {
      const poster = f.poster_url
        ? `<img src="${esc(f.poster_url)}" alt="" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
        : '';
      const ratingStr = f.rating ? `★ ${Number(f.rating).toFixed(1)}` : '';
      html += `
        <div class="film-card">
          <div class="film-poster">
            ${poster}
            <div class="poster-fallback" ${f.poster_url ? 'style="display:none"' : ''}>${CAT_ICONS.peliculas}</div>
          </div>
          <div class="film-title">${esc(f.title || '')}</div>
          <div class="film-meta">${esc(f.year || '')} ${ratingStr}</div>
        </div>`;
    });
    html += '</div>';
  }
  return html;
}

function renderGenericDetail(link) {
  let html = '';
  if (link.thumbnail) {
    html += `<img class="detail-hero" src="${esc(link.thumbnail)}" alt="">`;
  }
  html += `<h2 class="detail-title">${esc(link.title || '')}</h2>`;
  if (link.summary) html += `<p class="detail-summary">${esc(link.summary)}</p>`;
  return html;
}

// ── Cart screen ──
async function renderCart() {
  app.innerHTML = `
    <div class="screen">
      <div class="header">
        <button class="back-btn" onclick="navigate('#/')">${ICONS.back}</button>
        <div>
          <div class="header-subtitle">Grocery</div>
          <div class="header-title">Cart</div>
        </div>
      </div>
      <form class="cart-add-form" onsubmit="handleAddCartItem(event)">
        <input type="text" id="cart-input" class="cart-input" placeholder="Add an item..." autocomplete="off">
        <button type="submit" class="cart-add-btn">${ICONS.plus}</button>
        <button type="button" class="cart-add-btn cart-mic-btn" onclick="navigate('#/voice')">${ICONS.mic}</button>
      </form>
      <div id="cart-list" class="cart-list">
        <div class="skeleton skeleton-link" style="height:48px;margin-bottom:8px"></div>
        <div class="skeleton skeleton-link" style="height:48px;margin-bottom:8px"></div>
        <div class="skeleton skeleton-link" style="height:48px"></div>
      </div>
    </div>`;

  try {
    const items = await fetchCart();
    renderCartItems(items);
  } catch {
    document.getElementById('cart-list').innerHTML = '<div class="empty-state"><span class="empty-state-icon">⚠️</span><p class="empty-state-text">Could not load cart</p></div>';
  }
}

function renderCartItems(items) {
  const el = document.getElementById('cart-list');
  if (!el) return;

  if (items.length === 0) {
    el.innerHTML = `<div class="empty-state"><span class="empty-state-icon">${ICONS.cart}</span><p class="empty-state-text">Your cart is empty</p></div>`;
    return;
  }

  const uncompleted = items.filter(i => !i.completed);
  const completed = items.filter(i => i.completed);

  let html = '';
  uncompleted.forEach(item => {
    html += `
      <div class="cart-item" data-id="${item._id}">
        <button class="cart-check" onclick="handleToggleCart('${item._id}')" aria-label="Mark complete"></button>
        <span class="cart-text">${esc(item.text)}</span>
        <button class="cart-delete" onclick="handleDeleteCart('${item._id}')" aria-label="Delete">${ICONS.trash}</button>
      </div>`;
  });

  if (completed.length) {
    html += `<div class="cart-section-label">Completed</div>`;
    completed.forEach(item => {
      html += `
        <div class="cart-item completed" data-id="${item._id}">
          <button class="cart-check checked" onclick="handleToggleCart('${item._id}')" aria-label="Mark incomplete">${ICONS.check}</button>
          <span class="cart-text">${esc(item.text)}</span>
          <button class="cart-delete" onclick="handleDeleteCart('${item._id}')" aria-label="Delete">${ICONS.trash}</button>
        </div>`;
    });
    html += `<button class="btn btn-secondary cart-clear-btn" onclick="handleClearCompleted()">Clear ${completed.length} completed</button>`;
  }

  el.innerHTML = html;
}

async function handleAddCartItem(e) {
  e.preventDefault();
  const input = document.getElementById('cart-input');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  try {
    await addCartItem(text);
    const items = await fetchCart();
    renderCartItems(items);
    updateCartBadge();
  } catch {
    showToast('Failed to add item');
  }
}

async function handleToggleCart(id) {
  try {
    await toggleCartItem(id);
    const items = await fetchCart();
    renderCartItems(items);
    updateCartBadge();
  } catch {
    showToast('Failed to update item');
  }
}

async function handleDeleteCart(id) {
  try {
    await deleteCartItem(id);
    const items = await fetchCart();
    renderCartItems(items);
    updateCartBadge();
  } catch {
    showToast('Failed to delete item');
  }
}

async function handleClearCompleted() {
  try {
    const result = await clearCompletedCart();
    const items = await fetchCart();
    renderCartItems(items);
    updateCartBadge();
    showToast(`Cleared ${result.deleted} item${result.deleted !== 1 ? 's' : ''}`);
  } catch {
    showToast('Failed to clear items');
  }
}

async function addIngredientsToCart(linkId, ingredients) {
  try {
    const result = await addCartBatch(ingredients, linkId);
    updateCartBadge();
    showToast(`${result.length} ingredient${result.length !== 1 ? 's' : ''} added to cart`);
  } catch {
    showToast('Failed to add ingredients');
  }
}

async function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  try {
    const items = await fetchCart();
    const count = items.filter(i => !i.completed).length;
    badge.textContent = count;
    badge.style.display = count > 0 ? '' : 'none';
  } catch {
    // silent
  }
}

// ── Voice screen ──
let voiceRecognition = null;
let voiceListening = false;
let voicePendingItems = [];
let voiceSilenceTimer = null;

function parseCartItems(text) {
  return text
    .split(/,|\by\b/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

function renderVoice() {
  voicePendingItems = [];
  voiceListening = false;
  if (voiceRecognition) {
    try { voiceRecognition.stop(); } catch {}
    voiceRecognition = null;
  }

  app.innerHTML = `
    <div class="screen">
      <div class="header">
        <button class="back-btn" onclick="navigate('#/cart')">${ICONS.back}</button>
        <div>
          <div class="header-subtitle">Grocery</div>
          <div class="header-title">Voice</div>
        </div>
      </div>
      <div class="voice-container">
        <button class="voice-mic-btn" id="voice-mic-btn" onclick="toggleVoice()">
          ${ICONS.mic}
        </button>
        <p class="voice-hint" id="voice-hint">Tap to start listening</p>
        <div class="voice-transcript" id="voice-transcript"></div>
        <div class="voice-items" id="voice-items"></div>
        <button class="btn btn-primary voice-add-btn" id="voice-add-btn" style="display:none" onclick="addVoiceItems()">
          ${ICONS.cart} Add to cart
        </button>
      </div>
    </div>`;

  // Auto-start listening
  setTimeout(() => startVoice(), 300);
}

function toggleVoice() {
  if (voiceListening) {
    stopVoice();
  } else {
    startVoice();
  }
}

function startVoice() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showToast('Speech recognition not supported');
    return;
  }

  voiceRecognition = new SpeechRecognition();
  voiceRecognition.lang = 'es-ES';
  voiceRecognition.continuous = true;
  voiceRecognition.interimResults = true;

  const btn = document.getElementById('voice-mic-btn');
  const hint = document.getElementById('voice-hint');
  const transcript = document.getElementById('voice-transcript');

  voiceRecognition.onstart = () => {
    voiceListening = true;
    if (btn) btn.classList.add('listening');
    if (hint) hint.textContent = 'Separate items with "y" or pause between them';
  };

  voiceRecognition.onresult = (event) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const text = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        const items = parseCartItems(text);
        items.forEach(item => {
          if (!voicePendingItems.includes(item.toLowerCase())) {
            voicePendingItems.push(item.toLowerCase());
          }
        });
        renderVoiceItems();
        // Reset silence timer — auto-stop after 3s of silence
        resetSilenceTimer();
      } else {
        interim = text;
        // User is actively speaking, clear any pending stop
        clearSilenceTimer();
      }
    }
    if (transcript) {
      transcript.textContent = interim;
      transcript.style.display = interim ? '' : 'none';
    }
  };

  voiceRecognition.onerror = (event) => {
    if (event.error === 'no-speech') return;
    if (event.error === 'aborted') return;
    showToast('Mic error: ' + event.error);
    stopVoice();
  };

  voiceRecognition.onend = () => {
    // Auto-restart if still in listening mode (browser can stop after silence)
    if (voiceListening) {
      try { voiceRecognition.start(); } catch {}
    }
  };

  try {
    voiceRecognition.start();
  } catch {
    showToast('Could not start microphone');
  }
}

function resetSilenceTimer() {
  clearSilenceTimer();
  voiceSilenceTimer = setTimeout(() => {
    if (voiceListening && voicePendingItems.length > 0) {
      addVoiceItems();
    }
  }, 3000);
}

function clearSilenceTimer() {
  if (voiceSilenceTimer) {
    clearTimeout(voiceSilenceTimer);
    voiceSilenceTimer = null;
  }
}

function stopVoice() {
  voiceListening = false;
  clearSilenceTimer();
  if (voiceRecognition) {
    try { voiceRecognition.stop(); } catch {}
  }
  const btn = document.getElementById('voice-mic-btn');
  const hint = document.getElementById('voice-hint');
  const transcript = document.getElementById('voice-transcript');
  if (btn) btn.classList.remove('listening');
  if (hint) hint.textContent = voicePendingItems.length ? 'Tap to listen again' : 'Tap to start listening';
  if (transcript) { transcript.textContent = ''; transcript.style.display = 'none'; }
}

function renderVoiceItems() {
  const el = document.getElementById('voice-items');
  const addBtn = document.getElementById('voice-add-btn');
  if (!el) return;

  if (voicePendingItems.length === 0) {
    el.innerHTML = '';
    if (addBtn) addBtn.style.display = 'none';
    return;
  }

  el.innerHTML = voicePendingItems.map((item, i) => `
    <div class="voice-chip">
      <span>${esc(item)}</span>
      <button class="voice-chip-remove" onclick="removeVoiceItem(${i})">${ICONS.close}</button>
    </div>
  `).join('');

  if (addBtn) {
    addBtn.style.display = '';
    addBtn.innerHTML = `${ICONS.cart} Add ${voicePendingItems.length} item${voicePendingItems.length !== 1 ? 's' : ''} to cart`;
  }
}

function removeVoiceItem(index) {
  voicePendingItems.splice(index, 1);
  renderVoiceItems();
}

async function addVoiceItems() {
  if (voicePendingItems.length === 0) return;
  stopVoice();
  const items = [...voicePendingItems];
  try {
    await addCartBatch(items);
    updateCartBadge();
    showToast(`${items.length} item${items.length !== 1 ? 's' : ''} added to cart`);
    voicePendingItems = [];
    navigate('#/cart');
  } catch {
    showToast('Failed to add items');
  }
}

// ── Add link ──
function showAddLink() {
  const overlay = document.createElement('div');
  overlay.className = 'confirm-overlay';
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  overlay.innerHTML = `
    <div class="confirm-sheet">
      <h3 class="confirm-title">Add to Shelf</h3>
      <p class="confirm-text">Paste a URL, type a movie name, a recipe, or anything you want to save.</p>
      <textarea class="add-link-textarea" id="add-link-input" rows="4" placeholder="e.g. Parasite 2019, https://example.com, or paste a full recipe…"></textarea>
      <div class="confirm-actions">
        <button class="btn btn-danger" onclick="this.closest('.confirm-overlay').remove()">Cancel</button>
        <button class="btn btn-primary" id="add-link-submit" onclick="submitAddLink()">Submit</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  document.getElementById('add-link-input').focus();
}

async function submitAddLink() {
  const input = document.getElementById('add-link-input');
  const btn = document.getElementById('add-link-submit');
  const text = input.value.trim();
  if (!text) return;
  btn.textContent = 'Submitting…';
  btn.disabled = true;
  try {
    await api('POST', '/api/links', { text });
    document.querySelector('.confirm-overlay').remove();
    showToast('Added! Processing…');
    refreshHome();
  } catch {
    showToast('Failed to add');
    btn.textContent = 'Submit';
    btn.disabled = false;
  }
}

// ── Recategorize ──
function showRecategorize(linkId) {
  const overlay = document.createElement('div');
  overlay.className = 'confirm-overlay';
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  overlay.innerHTML = `
    <div class="confirm-sheet">
      <h3 class="confirm-title">Recategorize as...</h3>
      <input type="text" class="recat-hint-input" id="recat-hint" placeholder="Optional: add details to help AI (e.g. &quot;it's a Korean movie from 2019&quot;)">
      <div class="recat-options">
        <button class="recat-btn" onclick="doRecategorize('${linkId}', 'movie', this)">${CAT_ICONS.peliculas} Movie</button>
        <button class="recat-btn" onclick="doRecategorize('${linkId}', 'tv', this)">${CAT_ICONS.series} TV Show</button>
        <button class="recat-btn" onclick="doRecategorize('${linkId}', 'short', this)">${CAT_ICONS.cortometrajes} Short Film</button>
        <button class="recat-btn" onclick="doRecategorize('${linkId}', 'recipe', this)">${CAT_ICONS.recetas} Recipe</button>
        <button class="recat-btn" onclick="doRecategorize('${linkId}', 'documentary', this)">${CAT_ICONS.documentales} Documentary</button>
        <button class="recat-btn" onclick="doRecategorize('${linkId}', 'book', this)">${CAT_ICONS.libros} Book</button>
        <button class="recat-btn" onclick="doRecategorize('${linkId}', 'director', this)">${CAT_ICONS.directores} Director</button>
        <button class="recat-btn" onclick="doRecategorize('${linkId}', 'generic', this)">${CAT_ICONS.default} Generic</button>
      </div>
      <button class="recat-btn recat-retry" onclick="doRecategorize('${linkId}', null, this)">${ICONS.refresh} Retry (auto-detect)</button>
      <button class="btn btn-danger" style="width:100%;margin-top:10px" onclick="this.closest('.confirm-overlay').remove()">Cancel</button>
    </div>`;
  document.body.appendChild(overlay);
}

async function doRecategorize(linkId, type, btn) {
  const overlay = btn.closest('.confirm-overlay');
  const hint = document.getElementById('recat-hint')?.value?.trim() || '';
  btn.textContent = 'Processing...';
  btn.disabled = true;
  try {
    const extData = {};
    if (type) extData.recategorize_as = type;
    if (hint) extData.user_hint = hint;
    await patchLink(linkId, {
      status: 'pending',
      extension_data: extData,
    });
    overlay.remove();
    showToast('Reprocessing...');
    navigate('#/');
  } catch {
    showToast('Failed to recategorize');
    overlay.remove();
  }
}

// ── Delete confirmation ──
function confirmDelete(linkId) {
  const overlay = document.createElement('div');
  overlay.className = 'confirm-overlay';
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  overlay.innerHTML = `
    <div class="confirm-sheet">
      <h3 class="confirm-title">Delete this link?</h3>
      <p class="confirm-text">This action cannot be undone.</p>
      <div class="confirm-actions">
        <button class="btn btn-danger" onclick="this.closest('.confirm-overlay').remove()">Cancel</button>
        <button class="btn btn-primary" id="confirm-delete-btn">Delete</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  document.getElementById('confirm-delete-btn').onclick = async () => {
    overlay.remove();
    try {
      await deleteLink(linkId);
      showToast('Link deleted');
      navigate('#/');
    } catch {
      showToast('Failed to delete');
    }
  };
}

// ── Watch status toggle ──
async function toggleWatched(linkId, watched) {
  try {
    const link = linksCache[linkId] || allLinks.find(l => l._id === linkId);
    if (!link) return;
    const ext = { ...(link.extension_data || {}), watched };
    await patchLink(linkId, { extension_data: ext });
    link.extension_data = ext;
    linksCache[linkId] = link;
    renderLink(linkId);
    showToast(watched ? 'Marked as watched' : 'Marked as not watched');
  } catch {
    showToast('Failed to update');
  }
}

async function toggleWatchedFromList(linkId, watched) {
  const btn = document.querySelector(`.poster-card [onclick*="${linkId}"]`);
  if (btn) btn.classList.add('updating');
  try {
    const link = linksCache[linkId] || allLinks.find(l => l._id === linkId);
    if (!link) return;
    const ext = { ...(link.extension_data || {}), watched };
    await patchLink(linkId, { extension_data: ext });
    link.extension_data = ext;
    linksCache[linkId] = link;
    // Update button in-place
    if (btn) {
      btn.classList.toggle('watched', watched);
      btn.innerHTML = watched ? ICONS.eyeOpen : ICONS.eyeClosed;
      btn.setAttribute('onclick', `event.stopPropagation(); toggleWatchedFromList('${linkId}', ${!watched})`);
      btn.classList.remove('updating');
    }
    showToast(watched ? 'Marked as watched' : 'Marked as not watched');
  } catch {
    if (btn) btn.classList.remove('updating');
    showToast('Failed to update');
  }
}


// ── Helpers ──
function esc(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function getDomain(url) {
  try { return new URL(url).hostname.replace('www.', ''); } catch { return ''; }
}

function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('visible');
  setTimeout(() => el.classList.remove('visible'), 2500);
}

// ── Init ──
window.addEventListener('hashchange', render);
window.addEventListener('load', () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(reg => {
      // Check for updates every 60 seconds
      setInterval(() => reg.update(), 60000);

      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateBanner();
          }
        });
      });
    });

    // When new SW takes over, reload
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }
  render();
});

function showUpdateBanner() {
  const banner = document.createElement('div');
  banner.className = 'update-banner';
  banner.innerHTML = '<span>Update available</span><button onclick="applyUpdate()">Refresh</button>';
  document.body.appendChild(banner);
}

function applyUpdate() {
  navigator.serviceWorker.getRegistration().then(reg => {
    if (reg && reg.waiting) {
      reg.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  });
}

// Expose for inline onclick handlers
window.navigate = navigate;
window.confirmDelete = confirmDelete;
window.toggleWatched = toggleWatched;
window.toggleWatchedFromList = toggleWatchedFromList;
window.applyUpdate = applyUpdate;
window.showRecategorize = showRecategorize;
window.doRecategorize = doRecategorize;
window.toggleProviderCountries = toggleProviderCountries;
window.showCountryName = showCountryName;
window.refreshHome = refreshHome;
window.handleAddCartItem = handleAddCartItem;
window.handleToggleCart = handleToggleCart;
window.handleDeleteCart = handleDeleteCart;
window.handleClearCompleted = handleClearCompleted;
window.addIngredientsToCart = addIngredientsToCart;
window.showAddLink = showAddLink;
window.submitAddLink = submitAddLink;
window.handleCategoryFilter = handleCategoryFilter;
window.clearCategoryFilter = clearCategoryFilter;
window.filterByGenre = filterByGenre;
window.toggleVoice = toggleVoice;
window.addVoiceItems = addVoiceItems;
window.removeVoiceItem = removeVoiceItem;
