'use strict';

const PRODUCTS = [
  { id:1,  name:'Wireless Noise-Cancelling Headphones', cat:'Electronics', price:149, rating:4.8, reviews:2341, emoji:'🎧', badge:'sale', oldPrice:199, isNew:false },
  { id:2,  name:'Mechanical Keyboard RGB',              cat:'Electronics', price:89,  rating:4.6, reviews:1203, emoji:'⌨️', badge:'',     oldPrice:null, isNew:false },
  { id:3,  name:'Ultra-Wide Curved Monitor 34"',        cat:'Electronics', price:499, rating:4.7, reviews:876,  emoji:'🖥️', badge:'',     oldPrice:null, isNew:false },
  { id:4,  name:'USB-C Hub 7-in-1',                    cat:'Electronics', price:45,  rating:4.4, reviews:3210, emoji:'🔌', badge:'',     oldPrice:null, isNew:false },
  { id:5,  name:'Webcam 4K Pro',                       cat:'Electronics', price:129, rating:4.5, reviews:654,  emoji:'📷', badge:'new',  oldPrice:null, isNew:true  },
  { id:6,  name:'Portable SSD 1TB',                    cat:'Electronics', price:79,  rating:4.9, reviews:4501, emoji:'💾', badge:'',     oldPrice:null, isNew:false },
  { id:7,  name:'Smart Watch Series X',                cat:'Wearables',   price:299, rating:4.7, reviews:1876, emoji:'⌚', badge:'',     oldPrice:null, isNew:false },
  { id:8,  name:'Fitness Band Pro',                    cat:'Wearables',   price:79,  rating:4.3, reviews:987,  emoji:'💪', badge:'sale', oldPrice:99,   isNew:false },
  { id:9,  name:'Wireless Earbuds ANC',                cat:'Wearables',   price:119, rating:4.6, reviews:2134, emoji:'🎵', badge:'new',  oldPrice:null, isNew:true  },
  { id:10, name:'Smart Ring Health Monitor',           cat:'Wearables',   price:249, rating:4.2, reviews:432,  emoji:'💍', badge:'new',  oldPrice:null, isNew:true  },
  { id:11, name:'Smart LED Desk Lamp',                 cat:'Home',        price:59,  rating:4.5, reviews:1120, emoji:'💡', badge:'',     oldPrice:null, isNew:false },
  { id:12, name:'Air Purifier HEPA 360°',             cat:'Home',        price:189, rating:4.8, reviews:765,  emoji:'🌬️', badge:'',     oldPrice:null, isNew:false },
  { id:13, name:'Pour-Over Coffee Maker',              cat:'Home',        price:45,  rating:4.6, reviews:2098, emoji:'☕', badge:'',     oldPrice:null, isNew:false },
  { id:14, name:'Robot Vacuum Cleaner',                cat:'Home',        price:349, rating:4.4, reviews:1543, emoji:'🤖', badge:'sale', oldPrice:429,  isNew:false },
  { id:15, name:'Yoga Mat Premium',                    cat:'Sports',      price:39,  rating:4.5, reviews:3421, emoji:'🧘', badge:'',     oldPrice:null, isNew:false },
  { id:16, name:'Adjustable Dumbbell Set',             cat:'Sports',      price:199, rating:4.8, reviews:876,  emoji:'🏋️', badge:'',     oldPrice:null, isNew:false },
  { id:17, name:'Trail Running Shoes',                 cat:'Sports',      price:129, rating:4.6, reviews:654,  emoji:'👟', badge:'new',  oldPrice:null, isNew:true  },
  { id:18, name:'Clean Code (Book)',                   cat:'Books',       price:35,  rating:4.9, reviews:8732, emoji:'📚', badge:'',     oldPrice:null, isNew:false },
  { id:19, name:'The Design of Everyday Things',       cat:'Books',       price:28,  rating:4.7, reviews:5421, emoji:'📖', badge:'',     oldPrice:null, isNew:false },
  { id:20, name:'Atomic Habits',                       cat:'Books',       price:22,  rating:4.9, reviews:12340,emoji:'🧠', badge:'',     oldPrice:null, isNew:false },
];

const CAT_COLORS = {
  Electronics:'#eef2ff', Wearables:'#fdf4ff',
  Home:'#fff7ed', Sports:'#f0fdf4', Books:'#fffbeb'
};

let cart = JSON.parse(localStorage.getItem('shopverse_cart') || '[]');
let wishlist = new Set(JSON.parse(localStorage.getItem('shopverse_wishlist') || '[]'));
let activeCategory = 'all';
let currentView = 'grid';
let visibleCount = 8;
let filteredProducts = [...PRODUCTS];

/* ============================================
   UTILS
============================================ */
function saveCart() { localStorage.setItem('shopverse_cart', JSON.stringify(cart)); }
function saveWishlist() { localStorage.setItem('shopverse_wishlist', JSON.stringify([...wishlist])); }

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2500);
}

function starsHtml(rating) {
  let s = '';
  for (let i = 1; i <= 5; i++) s += i <= Math.round(rating) ? '★' : '☆';
  return s;
}

function scrollToProducts() {
  document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

/* ============================================
   CART
============================================ */
function updateCartUI() {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);

  document.getElementById('cartBadge').textContent = count;
  document.getElementById('cartItemCount').textContent = `(${count})`;
  document.getElementById('cartTotal').textContent = '$' + total.toFixed(2);

  const itemsEl = document.getElementById('cartItems');
  const footerEl = document.getElementById('cartFooter');

  if (!cart.length) {
    itemsEl.innerHTML = `<div class="cart-empty"><span>🛒</span><p>Your cart is empty</p></div>`;
    footerEl.style.display = 'none';
    return;
  }

  footerEl.style.display = 'flex';
  itemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-emoji">${item.emoji}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
        </div>
      </div>
      <button class="cart-item-del" onclick="removeFromCart(${item.id})" title="Remove">✕</button>
    </div>
  `).join('');

  saveCart();
}

function addToCart(id, btnEl) {
  const product = PRODUCTS.find(p => p.id === id);
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  updateCartUI();
  showToast('🛒 ' + product.name + ' added!');
  if (btnEl) {
    btnEl.textContent = '✓ Added';
    btnEl.classList.add('added');
    setTimeout(() => { btnEl.textContent = '+ Cart'; btnEl.classList.remove('added'); }, 1500);
  }
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  updateCartUI();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else updateCartUI();
}

function clearCart() {
  cart = [];
  updateCartUI();
  showToast('Cart cleared');
}

function checkout() {
  showToast('🎉 Order placed! Thank you for shopping with ShopVerse.');
  cart = [];
  updateCartUI();
  document.getElementById('cartSidebar').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
}

/* ============================================
   WISHLIST
============================================ */
function toggleWishlist(id, btn) {
  if (wishlist.has(id)) {
    wishlist.delete(id);
    btn.textContent = '♡';
    showToast('Removed from wishlist');
  } else {
    wishlist.add(id);
    btn.textContent = '❤️';
    showToast('❤️ Added to wishlist');
  }
  saveWishlist();
}

/* ============================================
   PRODUCTS RENDER
============================================ */
function getFilteredProducts() {
  const sort = document.getElementById('sortSelect').value;
  const search = document.getElementById('globalSearch') ?
    document.getElementById('globalSearch').value.toLowerCase() : '';

  let result = PRODUCTS.filter(p => {
    if (activeCategory !== 'all' && p.cat !== activeCategory) return false;
    if (search && !p.name.toLowerCase().includes(search)) return false;
    return true;
  });

  if (sort === 'price-asc')   result.sort((a,b) => a.price - b.price);
  if (sort === 'price-desc')  result.sort((a,b) => b.price - a.price);
  if (sort === 'rating-desc') result.sort((a,b) => b.rating - a.rating);
  if (sort === 'name-asc')    result.sort((a,b) => a.name.localeCompare(b.name));

  return result;
}

function cardHtml(p) {
  const bg = CAT_COLORS[p.cat] || '#f4f6f9';
  const badgeHtml = p.badge === 'sale' ? `<span class="card-badge badge-sale">Sale</span>`
    : p.badge === 'new' ? `<span class="card-badge badge-new">New</span>` : '';
  const oldPriceHtml = p.oldPrice ? `<span class="card-old-price">$${p.oldPrice}</span>` : '';
  const wishedHtml = wishlist.has(p.id) ? '❤️' : '♡';

  if (currentView === 'list') {
    return `
      <div class="product-card">
        <div class="card-img-wrap" style="background:${bg}">
          ${badgeHtml}${p.emoji}
          <button class="wish-btn" onclick="toggleWishlist(${p.id},this)">${wishedHtml}</button>
        </div>
        <div class="card-body">
          <div class="card-info">
            <div class="card-cat">${p.cat}</div>
            <div class="card-name">${p.name}</div>
            <div class="card-stars">${starsHtml(p.rating)} <span>${p.rating} (${p.reviews.toLocaleString()})</span></div>
          </div>
          <div class="card-footer-row">
            <div class="card-price">$${p.price}${oldPriceHtml}</div>
            <button class="atc-btn" onclick="addToCart(${p.id},this)">+ Cart</button>
          </div>
        </div>
      </div>`;
  }

  return `
    <div class="product-card">
      <div class="card-img-wrap" style="background:${bg}">
        ${badgeHtml}${p.emoji}
        <button class="wish-btn" onclick="toggleWishlist(${p.id},this)">${wishedHtml}</button>
      </div>
      <div class="card-body">
        <div class="card-cat">${p.cat}</div>
        <div class="card-name">${p.name}</div>
        <div class="card-stars">${starsHtml(p.rating)} <span>${p.rating} (${p.reviews.toLocaleString()})</span></div>
        <div class="card-footer-row">
          <div class="card-price">$${p.price}${oldPriceHtml}</div>
          <button class="atc-btn" onclick="addToCart(${p.id},this)">+ Cart</button>
        </div>
      </div>
    </div>`;
}

function renderProducts() {
  filteredProducts = getFilteredProducts();
  const visible = filteredProducts.slice(0, visibleCount);
  const grid = document.getElementById('productsGrid');

  grid.className = currentView === 'list' ? 'products-list' : 'products-grid';

  document.getElementById('resultInfo').innerHTML =
    `Showing <strong>${Math.min(visibleCount, filteredProducts.length)}</strong> of <strong>${filteredProducts.length}</strong> products`;

  if (!filteredProducts.length) {
    grid.innerHTML = `<div class="no-results"><span>🔍</span><p>No products found.</p></div>`;
  } else {
    grid.innerHTML = visible.map(cardHtml).join('');
  }

  const loadBtn = document.getElementById('loadMoreBtn');
  if (visibleCount >= filteredProducts.length) {
    loadBtn.disabled = true;
    loadBtn.textContent = 'All products loaded';
  } else {
    loadBtn.disabled = false;
    loadBtn.textContent = 'Load More Products';
  }
}

/* ============================================
   EVENT LISTENERS
============================================ */
// Hamburger
document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('mobileNav').classList.toggle('open');
});
function closeMobileNav() {
  document.getElementById('mobileNav').classList.remove('open');
}

// Search toggle
document.getElementById('searchToggle').addEventListener('click', () => {
  document.getElementById('searchBarWrap').classList.toggle('open');
  if (document.getElementById('searchBarWrap').classList.contains('open')) {
    document.getElementById('globalSearch').focus();
  }
});
document.getElementById('globalSearch').addEventListener('input', () => {
  visibleCount = 8;
  renderProducts();
  scrollToProducts();
});

// Cart open/close
document.getElementById('cartToggle').addEventListener('click', () => {
  document.getElementById('cartSidebar').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
});
document.getElementById('closeCart').addEventListener('click', () => {
  document.getElementById('cartSidebar').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
});
document.getElementById('cartOverlay').addEventListener('click', () => {
  document.getElementById('cartSidebar').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
});

// Category buttons
document.querySelectorAll('.cat-card').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.cat-card').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeCategory = btn.dataset.cat;
    visibleCount = 8;
    renderProducts();
    scrollToProducts();
  });
});

// Sort
document.getElementById('sortSelect').addEventListener('change', renderProducts);

// View toggle
document.getElementById('gridViewBtn').addEventListener('click', () => {
  currentView = 'grid';
  document.getElementById('gridViewBtn').classList.add('active');
  document.getElementById('listViewBtn').classList.remove('active');
  renderProducts();
});
document.getElementById('listViewBtn').addEventListener('click', () => {
  currentView = 'list';
  document.getElementById('listViewBtn').classList.add('active');
  document.getElementById('gridViewBtn').classList.remove('active');
  renderProducts();
});

// Load more
document.getElementById('loadMoreBtn').addEventListener('click', () => {
  visibleCount += 4;
  renderProducts();
});

// Newsletter
function subscribeNewsletter() {
  const email = document.getElementById('nlEmail').value.trim();
  if (!email || !email.includes('@')) { showToast('Please enter a valid email.'); return; }
  document.getElementById('nlBtn').textContent = 'Subscribed!';
  document.getElementById('nlBtn').disabled = true;
  document.getElementById('nlSuccess').style.display = 'block';
  document.getElementById('nlEmail').value = '';
}

// Header scroll effect
window.addEventListener('scroll', () => {
  document.getElementById('header').classList.toggle('scrolled', window.scrollY > 20);
  document.getElementById('backToTop').classList.toggle('visible', window.scrollY > 400);
}, { passive: true });

// Back to top
document.getElementById('backToTop').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Scroll fade-in observer
const fadeObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); fadeObserver.unobserve(e.target); }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));

// Keyboard accessibility — close cart on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.getElementById('cartSidebar').classList.remove('open');
    document.getElementById('cartOverlay').classList.remove('open');
    document.getElementById('mobileNav').classList.remove('open');
    document.getElementById('searchBarWrap').classList.remove('open');
  }
});


if ('IntersectionObserver' in window) {
  const lazyObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.add('loaded');
        lazyObserver.unobserve(img);
      }
    });
  });
  document.querySelectorAll('img[data-src]').forEach(img => lazyObserver.observe(img));
}

renderProducts();
updateCartUI();