let allProducts = []; 
let currentCategory = 'Все'; 
let searchQuery = ''; // Текст поиска

const clothingSizes = ['M', 'L', 'XL', '2XL', '3XL'];
const shoeSizes = ['39', '40', '41', '42', '43', '44'];

async function loadProducts() {
  try {
    const response = await fetch('products.json');
    allProducts = await response.json(); 
    
    renderCategories(); 
    renderProducts(); 
  } catch (error) {
    console.error("Ошибка загрузки товаров:", error);
  }
}

function renderCategories() {
  const container = document.getElementById('categories-container');
  if (!container) return;

  const categoriesSet = new Set(allProducts.map(p => p.category));
  const categories = ['Все', ...categoriesSet]; 
  
  container.innerHTML = ''; 

  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = `category-btn ${cat === currentCategory ? 'active' : ''}`;
    btn.textContent = cat;
    
    btn.addEventListener('click', () => {
      currentCategory = cat;
      renderCategories(); 
      renderProducts(); 
    });
    
    container.appendChild(btn);
  });
}

function renderProducts() {
  const container = document.getElementById('products');
  if (!container) return;
  
  container.innerHTML = ''; 

  // 1. Сначала фильтруем по категории
  let filteredProducts = currentCategory === 'Все' 
    ? allProducts 
    : allProducts.filter(p => p.category === currentCategory);

  // 2. Затем фильтруем по поиску
  if (searchQuery.trim() !== '') {
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Если ничего не найдено
  if (filteredProducts.length === 0) {
    container.innerHTML = '<p style="padding: 20px; font-size: 18px;">По вашему запросу ничего не найдено 😔</p>';
    return;
  }

  const grouped = {};
  filteredProducts.forEach(product => {
    if (!grouped[product.category]) grouped[product.category] = [];
    grouped[product.category].push(product);
  });

  for (const [categoryName, products] of Object.entries(grouped)) {
    const title = document.createElement('h3');
    title.className = 'category-section-title';
    title.textContent = categoryName;
    container.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'grid'; 
    
    products.forEach(product => {
      const card = document.createElement('div');
      card.className = 'card';
      const mainImg = product.images[0]; 

      const sizes = product.category === 'Обувь' ? shoeSizes : clothingSizes;
      const sizesHTML = sizes.map((size, index) => 
        `<button class="size-btn ${index === 0 ? 'active' : ''}" data-size="${size}">${size}</button>`
      ).join('');

      card.innerHTML = `
        <img src="${mainImg}" alt="${product.name}">
        <div class="card-body">
          <h3 class="card-title">${product.name}</h3>
          <p class="card-price">${product.price.toLocaleString('ru-RU')} ₽</p>
          
          <div class="size-selector">
            ${sizesHTML}
          </div>

          <div style="display: flex; gap: 10px; margin-top: auto;">
            <button class="btn add-to-cart" data-id="${product.id}" style="flex: 1;">В корзину</button>
            <button class="btn tryon-btn" data-id="${product.id}" style="background: #555; width: auto; padding: 10px 15px;" title="Посмотреть все фото">👕</button>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });

    container.appendChild(grid);
  }
}

// --- ЛОГИКА КОРЗИНЫ ---
let cart = JSON.parse(localStorage.getItem('myCart')) || [];

function updateCartCount() {
  const countElement = document.getElementById('cart-count');
  if (countElement) {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    countElement.textContent = totalCount;
  }
}

// Слушатель событий для поиска и корзины
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderProducts();
    });
  }
});

document.addEventListener('click', (event) => {
  if (event.target.classList.contains('size-btn')) {
    const selector = event.target.closest('.size-selector');
    selector.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
  }

  if (event.target.classList.contains('add-to-cart')) {
    const productId = Number(event.target.dataset.id);
    const card = event.target.closest('.card-body');
    const activeSizeBtn = card.querySelector('.size-btn.active');
    const selectedSize = activeSizeBtn ? activeSizeBtn.dataset.size : 'Стандарт';

    const existingItem = cart.find(item => item.id === productId && item.size === selectedSize);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ id: productId, size: selectedSize, quantity: 1 });
    }

    localStorage.setItem('myCart', JSON.stringify(cart));
    updateCartCount();
  }
});

// --- ЛОГИКА ГАЛЕРЕИ ---
const tryonModal = document.getElementById('tryon-modal');
const mainGalleryImg = document.getElementById('main-gallery-img');
const thumbnailsContainer = document.getElementById('thumbnails-container');
const closeTryon = document.getElementById('close-tryon');
const closeTryonBtn = document.querySelector('.close-tryon-btn');

document.addEventListener('click', (event) => {
  if (event.target.classList.contains('tryon-btn')) {
    const productId = Number(event.target.dataset.id);
    const product = allProducts.find(p => p.id === productId);
    
    if (product && product.images) {
      mainGalleryImg.src = product.images[0];
      thumbnailsContainer.innerHTML = '';
      
      product.images.forEach((imgSrc, index) => {
        const thumb = document.createElement('img');
        thumb.src = imgSrc;
        thumb.className = 'thumbnail' + (index === 0 ? ' active' : '');
        
        thumb.addEventListener('click', () => {
          mainGalleryImg.src = imgSrc;
          document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
          thumb.classList.add('active');
        });
        thumbnailsContainer.appendChild(thumb);
      });

      tryonModal.classList.add('show');
    }
  }
});

function closeModal() {
  if (tryonModal) tryonModal.classList.remove('show');
}

if (closeTryon) closeTryon.addEventListener('click', closeModal);
if (closeTryonBtn) closeTryonBtn.addEventListener('click', closeModal);

window.addEventListener('click', (e) => {
  if (e.target === tryonModal) closeModal();
});

// Запуск
loadProducts();
updateCartCount();