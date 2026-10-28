const products = [
  { id: 1, name: 'Спортивный костюм Moncler', price: 14500, img: 'images/1.jpg' },
  { id: 2, name: 'Худи Hugo + Джинсы', price: 8900, img: 'images/2.jpg' },
  { id: 3, name: 'Лонгслив Louis Vuitton', price: 7900, img: 'images/3.jpg' },
  { id: 4, name: 'Худи U.S. Polo Assn.', price: 6500, img: 'images/4.jpg' }
];

const cart = JSON.parse(localStorage.getItem('myCart')) || [];
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalContainer = document.getElementById('cart-total');
const cartCountElement = document.getElementById('cart-count');

// Обновляем счетчик в шапке
const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
if (cartCountElement) cartCountElement.textContent = totalCount;

// Отрисовываем корзину
if (cart.length === 0) {
  cartItemsContainer.innerHTML = '<p style="text-align:center; padding: 40px; font-size: 18px;">Корзина пуста. <br><br> <a href="index.html" class="btn">Вернуться в каталог</a></p>';
} else {
  let totalPrice = 0;

  cart.forEach(item => {
    const product = products.find(p => p.id === item.id); 
    if (!product) return; 

    const itemPrice = product.price * item.quantity;
    totalPrice += itemPrice;

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

  cartTotalContainer.innerHTML = `
    <h3>Итого: ${totalPrice.toLocaleString('ru-RU')} ₽</h3>
    <button class="btn" id="checkout-btn">Заказать</button>
  `;

  const checkoutBtn = document.getElementById('checkout-btn');
  const modal = document.getElementById('order-modal');
  const closeBtn = document.getElementById('close-modal');

  if (checkoutBtn) {
    // Делаем функцию асинхронной (async), чтобы подождать отправку
    checkoutBtn.addEventListener('click', async () => {
      
      // 1. Формируем красивый текст для Telegram
      let messageText = "";
      cart.forEach(item => {
        const p = products.find(x => x.id === item.id);
        if (p) {
          messageText += `▪️ ${p.name} — ${item.quantity} шт. (${(p.price * item.quantity).toLocaleString('ru-RU')} ₽)\n`;
        }
      });
      messageText += `\n💰 Итого: ${totalPrice.toLocaleString('ru-RU')} ₽`;

      // 2. Отправляем запрос на Cloudflare Worker
      try {
        checkoutBtn.textContent = 'Отправка...'; // Меняем текст кнопки
        await fetch('https://https://humble-tapir-7940.highstyle717.deno.net/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: messageText })
        });
      } catch (error) {
        console.error('Ошибка отправки в ТГ:', error);
      }

      // 3. Показываем окно с контактами и очищаем корзину
      modal.classList.add('show');
      localStorage.removeItem('myCart');
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('show');
      window.location.reload(); 
    });
  }

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('show');
      window.location.reload();
    }
  });
}