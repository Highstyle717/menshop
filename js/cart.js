// 1. Список товаров (скопирован из app.js, чтобы корзина знала цены и картинки)
const products = [
  { id: 1, name: 'Спортивный костюм Moncler', price: 14500, img: 'images/1.jpg' },
  { id: 2, name: 'Худи Hugo + Джинсы', price: 8900, img: 'images/2.jpg' },
  { id: 3, name: 'Лонгслив Louis Vuitton', price: 7900, img: 'images/3.jpg' },
  { id: 4, name: 'Худи U.S. Polo Assn.', price: 6500, img: 'images/4.jpg' }
];

// 2. Получаем корзину из памяти браузера (если пусто, то создаем пустой массив)
const cart = JSON.parse(localStorage.getItem('myCart')) || [];

// 3. Находим элементы на странице
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalContainer = document.getElementById('cart-total');
const cartCountElement = document.getElementById('cart-count');

// 4. Обновляем счетчик товаров в шапке
const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
if (cartCountElement) cartCountElement.textContent = totalCount;

// 5. Отрисовываем корзину
if (cart.length === 0) {
  cartItemsContainer.innerHTML = '<p style="text-align:center; padding: 40px; font-size: 18px;">Корзина пуста. <br><br> <a href="index.html" class="btn">Вернуться в каталог</a></p>';
} else {
  let totalPrice = 0;

  cart.forEach(item => {
    const product = products.find(p => p.id === item.id); 
    if (!product) return; // Если товар не найден, пропускаем

    const itemPrice = product.price * item.quantity;
    totalPrice += itemPrice;

    // Создаем HTML для одного товара
    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';
    itemDiv.innerHTML = `
      <img src="${product.img}" alt="${product.name}">
      <div class="cart-item-info">
        <h3>${product.name}</h3>
        <p>${product.price.toLocaleString('ru-RU')} ₽ × ${item.quantity} шт.</p>
      </div>
      <div class="cart-item-total">${itemPrice.toLocaleString('ru-RU')} ₽</div>
    `;
    cartItemsContainer.appendChild(itemDiv);
  });

  // Выводим итоговую сумму и кнопку
  cartTotalContainer.innerHTML = `
    <h3>Итого: ${totalPrice.toLocaleString('ru-RU')} ₽</h3>
    <button class="btn" id="checkout-btn">Заказать</button>
  `;

  // --- ЛОГИКА ВСПЛЫВАЮЩЕГО ОКНА ---
  const checkoutBtn = document.getElementById('checkout-btn');
  const modal = document.getElementById('order-modal');
  const closeBtn = document.getElementById('close-modal');

  // Открытие окна при клике на "Заказать"
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      modal.classList.add('show'); // Показываем окно
      
      // Очищаем корзину в памяти, так как заказ оформлен
      localStorage.removeItem('myCart');
    });
  }

  // Закрытие окна по крестику
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('show');
      window.location.reload(); // Перезагружаем страницу, чтобы корзина стала пустой
    });
  }

  // Закрытие окна по клику на темный фон вокруг него
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('show');
      window.location.reload();
    }
  });
}