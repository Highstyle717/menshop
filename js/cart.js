async function initCart() {
  // 1. Загружаем актуальный список товаров
  const response = await fetch('products.json');
  const products = await response.json();

  const cart = JSON.parse(localStorage.getItem('myCart')) || [];
  const cartItemsContainer = document.getElementById('cart-items');
  const cartTotalContainer = document.getElementById('cart-total');
  const cartCountElement = document.getElementById('cart-count');

  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartCountElement) cartCountElement.textContent = totalCount;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p style="text-align:center; padding: 40px; font-size: 18px;">Корзина пуста. <br><br> <a href="index.html" class="btn">Вернуться в каталог</a></p>';
  } else {
    let totalPrice = 0;
    let imagesToSend = []; // Массив для всех картинок

    cart.forEach(item => {
      const product = products.find(p => p.id === item.id); 
      if (!product) return; 

      const itemPrice = product.price * item.quantity;
      totalPrice += itemPrice;

      // Собираем полные ссылки на картинки для отправки в бота
      const fullImgUrl = window.location.origin + window.location.pathname.replace('cart.html', '') + product.img;
      imagesToSend.push(fullImgUrl);

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

    // --- ЛОГИКА ОКНА И ОТПРАВКИ ---
    const checkoutBtn = document.getElementById('checkout-btn');
    const modal = document.getElementById('order-modal');
    const closeBtn = document.getElementById('close-modal');

    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', async () => {
        let messageText = "";
        cart.forEach(item => {
          const p = products.find(x => x.id === item.id);
          if (p) {
            messageText += `▪️ ${p.name} — ${item.quantity} шт. (${(p.price * item.quantity).toLocaleString('ru-RU')} ₽)\n`;
          }
        });
        messageText += `\n💰 Итого: ${totalPrice.toLocaleString('ru-RU')} ₽`;

        try {
          checkoutBtn.textContent = 'Отправка...'; 
          await fetch('https://humble-tapir-7940.highstyle717.deno.net/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // Отправляем и текст, и МАССИВ со всеми картинками
            body: JSON.stringify({ 
              message: messageText, 
              images: imagesToSend 
            })
          });
        } catch (error) {
          console.error('Ошибка отправки в ТГ:', error);
        }

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
}

// Запускаем корзину
initCart();