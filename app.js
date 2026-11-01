let allProducts = []; 
let currentCategory = 'Все'; // Категория по умолчанию

// 1. Загрузка товаров
async function loadProducts() {
  try {
    const response = await fetch('products.json');
    allProducts = await response.json(); 
    
    renderCategories(); // Рисуем кнопки фильтров
    renderProducts(currentCategory); // Рисуем товары с группировкой
  } catch (error) {
    console.error("Ошибка загрузки товаров:", error);
  }
}

// 2. Отрисовка кнопок категорий (фильтров)
function renderCategories() {
  const container = document.getElementById('categories-container');
  if (!container) return;

  // Собираем уникальные категории из массива товаров
  const categoriesSet = new Set(allProducts.map(p => p.category));
  const categories = ['Все', ...categoriesSet]; 
  
  container.innerHTML = ''; // Очищаем старое

  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = `category-btn ${cat === currentCategory ? 'active' : ''}`;
    btn.textContent = cat;
    
    // При клике меняем категорию и перерисовываем
    btn.addEventListener('click', () => {
      currentCategory = cat;
      renderCategories(); // Обновляем активную кнопку
      renderProducts(currentCategory); // Обновляем список товаров
    });
    
    container.appendChild(btn);
  });
}

// 3. Отрисовка товаров (с разделением на блоки по категориям)
function renderProducts(categoryFilter) {
  const container = document.getElementById('products');
  if (!container) return;
  
  container.innerHTML = ''; // Очищаем всё

  // Фильтруем товары
  const filteredProducts = categoryFilter === 'Все' 
    ? allProducts 
    : allProducts.filter(p => p.category === categoryFilter);

  // Группируем товары по категориям
  const grouped = {};
  filteredProducts.forEach(product => {
    if (!grouped[product.category]) {
      grouped[product.category] = [];
    }
    grouped[product.category].push(product);
  });

  // Проходимся по каждой группе (категории) и создаем для нее отдельный блок
  for (const [categoryName, products] of Object.entries(grouped)) {
    
    // Создаем большой заголовок (например, "Обувь")
    const title = document.createElement('h3');
    title.className = 'category-section-title';
    title.textContent = categoryName;
    container.appendChild(title);

    // Создаем сетку для этой категории
    const grid = document.createElement('div');
    grid.className = 'grid'; 
    
    // Добавляем карточки в эту сетку
    products.forEach(product => {
      const card = document.createElement('div');
      card.className = 'card';
      const mainImg = product.images[0]; 

      card.innerHTML = `
        <img src="${mainImg}" alt="${product.name}">
        <div class="card-body">
          <h3 class="card-title">${product.name}</h3>
          <p class="card-price">${product.price.toLocaleString('ru-RU')} ₽</p>
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

document.addEventListener('click', (event) => {
  if (event.target.classList.contains('add-to-cart')) {
    const productId = Number(event.target.dataset.id);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ id: productId, quantity: 1 });
    }

    localStorage.setItem('myCart', JSON.stringify(cart));
    updateCartCount();
  }
});

// --- ЛОГИКА ГАЛЕРЕИ (Кнопка 👕) ---
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

// Запуск при загрузке страницы
loadProducts();
updateCartCount();