const products = [
  { 
    id: 1, 
    name: 'Спортивный костюм Moncler', 
    price: 14500, 
    img: 'images/1.jpg' 
  },
  { 
    id: 2, 
    name: 'Худи Hugo + Джинсы', 
    price: 8900, 
    img: 'images/2.jpg' 
  },
  { 
    id: 3, 
    name: 'Лонгслив Louis Vuitton', 
    price: 7900, 
    img: 'images/3.jpg' 
  },
  { 
    id: 4, 
    name: 'Худи U.S. Polo Assn.', 
    price: 6500, 
    img: 'images/4.jpg' 
  }
];

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
});// --- ЛОГИКА КОРЗИНЫ ---

// 1. Загружаем корзину из памяти браузера (если она там есть), иначе создаем пустую
let cart = JSON.parse(localStorage.getItem('myCart')) || [];

// 2. Функция обновления счетчика в шапке
function updateCartCount() {
  const countElement = document.getElementById('cart-count');
  // Считаем общее количество всех товаров
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  countElement.textContent = totalCount;
}

// 3. Слушаем клики по всему каталогу
grid.addEventListener('click', (event) => {
  // Если кликнули именно по кнопке "В корзину"
  if (event.target.classList.contains('add-to-cart')) {
    // Берем id товара из атрибута data-id
    const productId = Number(event.target.dataset.id);
    
    // Ищем, есть ли уже этот товар в корзине
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
      existingItem.quantity += 1; // Если есть, увеличиваем количество
    } else {
      cart.push({ id: productId, quantity: 1 }); // Если нет, добавляем
    }

    // Сохраняем в память браузера
    localStorage.setItem('myCart', JSON.stringify(cart));
    
    // Обновляем цифру в шапке
    updateCartCount();
  }
});

// 4. При загрузке страницы сразу показываем правильное число
updateCartCount();