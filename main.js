const pageBody = document.body;
const pageName = pageBody.dataset.page;

const products = [
  {id: 1, name: 'Classic Running Shoes', price: 80000, category: 'Shoes', img: 'assets/images/product-1.jpg', sale: true},
  {id: 2, name: 'Comfort Kitchen Set', price: 73000, category: 'Kitchen', img: 'assets/images/product-2.jpg', sale: false},
  {id: 3, name: 'Modern Home Decor', price: 81000, category: 'Household', img: 'assets/images/product-3.jpg', sale: true},
  {id: 4, name: 'Premium Leather Shoes', price: 42000, category: 'blender', img: 'assets/images/product-4.jpg', sale: false},
  {id: 5, name: 'Compact Blender', price: 21000, category: 'Kitchen', img: 'assets/images/product-1.jpg', sale: false},
  {id: 6, name: 'Stylish Storage Box', price: 9500, category: 'Household', img: 'assets/images/product-2.jpg', sale: false},
  {id: 7, name: 'Weekend Slip-Ons', price: 180000, category: 'Shoes', img: 'assets/images/product-3.jpg', sale: true},
  {id: 8, name: 'Smart Kitchen Knife Set', price: 80000, category: 'Kitchen', img: 'assets/images/product-4.jpg', sale: true}
];

let cart = JSON.parse(localStorage.getItem('kettsCart')) || [];
let wishlist = JSON.parse(localStorage.getItem('kettsWishlist')) || [];

function setActiveNav() {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (window.location.pathname.endsWith(href)) {
      link.classList.add('active');
    } else if (href === 'index.html' && window.location.pathname.endsWith('/')) {
      link.classList.add('active');
    }
  });
}

function initShopPage() {
  document.getElementById('searchInput').addEventListener('input', applyFilters);
  document.getElementById('sortSelect').addEventListener('change', applyFilters);
  document.getElementById('priceRange').addEventListener('input', applyFilters);
  renderProducts(products);
  applyFilters();
}

function renderProducts(list) {
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  grid.innerHTML = list.map(product => {
    const displayPrice = product.sale ? Math.floor(product.price * 0.88) : product.price;
    return `
      <article class="product-card card overflow-hidden rounded-3xl bg-white">
        <img src="${product.img}" alt="${product.name}" class="h-60 w-full object-cover">
        <div class="p-6">
          <div class="mb-3 flex items-center justify-between gap-3">
            <span class="badge rounded-full px-3 py-1 text-sm font-semibold">${product.category}</span>
            ${product.sale ? '<span class="text-sm font-semibold text-emerald-600">Sale</span>' : ''}
          </div>
          <h3 class="text-xl font-semibold mb-3">${product.name}</h3>
          <p class="text-lg font-bold text-emerald-700 mb-5">₦${displayPrice.toLocaleString()}</p>
          <div class="flex items-center gap-3">
            <button class="btn-primary w-full rounded-2xl px-5 py-3 text-sm font-semibold" onclick="addToCart(${product.id})">Add to Cart</button>
            <button class="border rounded-2xl p-3 text-xl text-gray-500 hover:text-emerald-600" onclick="event.stopPropagation(); toggleWishlistItem(${product.id})">❤️</button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function filterCategory(category) {
  document.querySelectorAll('.category-pill').forEach(btn => {
    const selected = btn.dataset.category === category;
    btn.classList.toggle('active', selected);
  });
  document.getElementById('selectedCategory').textContent = category;
  applyFilters();
}

function applyFilters() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const category = document.querySelector('.category-pill.active')?.dataset.category || 'All';
  const maxPrice = Number(document.getElementById('priceRange').value);
  const sort = document.getElementById('sortSelect').value;

  let filtered = products.filter(product => {
    const matchesCategory = category === 'All' || product.category === category;
    const matchesSearch = product.name.toLowerCase().includes(search);
    const matchesPrice = product.price <= maxPrice;
    return matchesCategory && matchesSearch && matchesPrice;
  });

  if (sort === 'low') filtered.sort((a, b) => a.price - b.price);
  if (sort === 'high') filtered.sort((a, b) => b.price - a.price);
  if (sort === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));

  renderProducts(filtered);
  document.getElementById('priceValue').textContent = maxPrice.toLocaleString();
}

function addToCart(id) {
  const product = products.find(item => item.id === id);
  const existing = cart.find(item => item.id === id);
  if (existing) existing.qty += 1;
  else cart.push({ ...product, qty: 1 });
  saveCart();
  updateCartCount();
  showToast(`${product.name} added to cart`);
}

function saveCart() {
  localStorage.setItem('kettsCart', JSON.stringify(cart));
}

function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const counter = document.getElementById('cart-count');
  if (counter) counter.textContent = count;
}

function toggleWishlistItem(id) {
  const existingIndex = wishlist.findIndex(item => item.id === id);
  if (existingIndex > -1) wishlist.splice(existingIndex, 1);
  else wishlist.push(products.find(item => item.id === id));
  localStorage.setItem('kettsWishlist', JSON.stringify(wishlist));
  updateWishlistCount();
  showToast(existingIndex > -1 ? 'Removed from wishlist' : 'Added to wishlist');
}

function updateWishlistCount() {
  const counter = document.getElementById('wishlist-count');
  if (counter) counter.textContent = wishlist.length;
}

function openCart() {
  document.getElementById('cart-modal').classList.remove('hidden');
  renderCart();
}

function closeCart() {
  document.getElementById('cart-modal').classList.add('hidden');
}

function renderCart() {
  const container = document.getElementById('cart-items');
  const totalDisplay = document.getElementById('cart-total');
  if (!container) return;
  if (!cart.length) {
    container.innerHTML = '<p class="text-center text-gray-500 py-14">Your cart is empty.</p>';
    totalDisplay.textContent = '0';
    return;
  }

  let total = 0;
  container.innerHTML = cart.map((item, index) => {
    total += item.price * item.qty;
    return `
      <div class="flex items-center gap-4 py-4 border-b">
        <img src="${item.img}" alt="${item.name}" class="h-20 w-20 rounded-3xl object-cover">
        <div class="flex-1">
          <p class="font-semibold">${item.name}</p>
          <p class="text-green-600">₦${(item.price * item.qty).toLocaleString()}</p>
          <div class="mt-2 flex items-center gap-2 text-sm text-gray-600">
            <button onclick="changeQty(${index}, -1)" class="h-8 w-8 rounded-xl border">-</button>
            <span>${item.qty}</span>
            <button onclick="changeQty(${index}, 1)" class="h-8 w-8 rounded-xl border">+</button>
          </div>
        </div>
        <button onclick="removeFromCart(${index})" class="text-red-500 text-xl">×</button>
      </div>`;
  }).join('');

  totalDisplay.textContent = total.toLocaleString();
}

function changeQty(index, delta) {
  cart[index].qty = Math.max(1, cart[index].qty + delta);
  saveCart();
  renderCart();
  updateCartCount();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  renderCart();
  updateCartCount();
}

function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

function openCheckout() {
  if (!cart.length) return showToast('Your cart is empty.');
  closeCart();
  document.getElementById('checkout-modal').classList.remove('hidden');
}

function submitOrder() {
  const name = document.getElementById('customer-name').value.trim();
  const phone = document.getElementById('customer-phone').value.trim();
  const address = document.getElementById('customer-address').value.trim();
  if (!name || !phone || !address) {
    return showToast('Please complete your delivery details.');
  }

  let message = `*Ketts Stores Order*%0A`;
  message += `Name: ${name}%0APhone: ${phone}%0AAddress: ${address}%0A%0A`;
  const email = document.getElementById('customer-email').value.trim();
  const city = document.getElementById('customer-city').value.trim();
  const landmark = document.getElementById('customer-landmark').value.trim();
  const notes = document.getElementById('customer-notes').value.trim();

  let total = 0;
  cart.forEach(item => {
    total += item.price * item.qty;
    message += `${item.qty}x ${item.name} - ₦${(item.price * item.qty).toLocaleString()}%0A`;
  });
  message += `%0A*Delivery details*%0A`;
  message += `Email: ${email || 'N/A'}%0A`;
  message += `City/Area: ${city || 'N/A'}%0A`;
  message += `Landmark: ${landmark || 'N/A'}%0A`;
  if (notes) message += `Notes: ${notes}%0A`;
  message += `%0ATotal: ₦${total.toLocaleString()}`;
  const whatsAppNumber = '2349056412305';
  window.open(`https://wa.me/${whatsAppNumber}?text=${message}`, '_blank');
  cart = [];
  saveCart();
  updateCartCount();
  closeModal('checkout-modal');
}

function showToast(text) {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-6 right-6 z-50 rounded-3xl bg-slate-900 px-5 py-3 text-sm text-white shadow-2xl';
  toast.textContent = text;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2400);
}

window.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
  updateCartCount();
  updateWishlistCount();
  const activePage = document.querySelector('.page-title');
  if (activePage) activePage.textContent = pageName === 'shop' ? 'Shop' : activePage.textContent;
  if (pageName === 'shop') initShopPage();
});
