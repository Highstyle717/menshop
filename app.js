// Функция для загрузки товаров из JSON
async function loadProducts() {
  try {
    const response = await fetch('products.json');
    const products = await response.json();
    
    const grid = document.getElementById('products');
    
    products.forEach(product => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="${product.img}" alt="${product.name}">
        <div class="card-body">
          <h3 class="card-title">${product.name}</h3>
          <p class="card-price">${product.price.toLocaleString('ru-RU')} ₽</p>
          <button class="btn add-to-cart" data-id="${product.id}">В корзину</button>
        </div>
      `;
      grid.appendChild(card);
    });
  } catch (error) {
    console.error("Ошибка загрузки товаров:", error);
  }
}

// --- ЛОГИКА КОРЗИНЫ (остается почти без изменений) ---
let cart = JSON.parse(localStorage.getItem('myCart')) || [];

function updateCartCount() {
  const countElement = document.getElementById('cart-count');
  if (countElement) {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    countElement.textContent = totalCount;
  }
}

// Ждем клика по каталогу
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

// Запускаем всё при загрузке страницы
loadProducts();
updateCartCount();