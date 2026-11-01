let currentProducts = [];
let currentCart = [];

async function initCart() {
  const response = await fetch('products.json');
  currentProducts = await response.json();
  currentCart = JSON.parse(localStorage.getItem('myCart')) || [];
  
  renderCart();
}

function renderCart() {
  const cartItemsContainer = document.getElementById('cart-items');
  const cartTotalContainer = document.getElementById('cart-total');
  const cartCountElement = document.getElementById('cart-count');

  if (!cartItemsContainer) return;

  const totalCount = currentCart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartCountElement) cartCountElement.textContent = totalCount;

  if (currentCart.length === 0) {
    cartItemsContainer.innerHTML = '<p style="text-align:center; padding: 40px; font-size: 18px;">Корзина пуста. <br><br> <a href="index.html" class="btn">Вернуться в каталог</a></p>';
    cartTotalContainer.innerHTML = '';
    return;
  }

  cartItemsContainer.innerHTML = '';
  let totalPrice = 0;
  let imagesToSend = [];

  currentCart.forEach((item, index) => {
    const product = currentProducts.find(p => p.id === item.id); 
    if (!product) return; 

    const itemPrice = product.price * item.quantity;
    totalPrice += itemPrice;

    const fullImgUrl = window.location.origin + window.location.pathname.replace('cart.html', '') + product.images[0];
    imagesToSend.push(fullImgUrl);

    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';
    
    // Блок с кнопками +, - и Удалить
    itemDiv.innerHTML = `
      <img src="${product.images[0]}" alt="${product.name}">
      <div class="cart-item-info">
        <h3>${product.name}</h3>
        <p style="color: #111; font-weight: 600;">Размер: ${item.size}</p>
        <p>${product.price.toLocaleString('ru-RU')} ₽</p>
        
        <div class="cart-item-controls">
          <div class="qty-control">
            <button class="qty-btn" onclick="changeQty(${index}, -1)">−</button>
            <span class="qty-number">${item.quantity}</span>
            <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
          </div>
          <button class="remove-item-btn" onclick="removeItem(${index})">Удалить</button>
        </div>
      </div>
      <div class="cart-item-total">${itemPrice.toLocaleString('ru-RU')} ₽</div>
    `;
    cartItemsContainer.appendChild(itemDiv);
  });

  cartTotalContainer.innerHTML = `
    <h3>Итого: ${totalPrice.toLocaleString('ru-RU')} ₽</h3>
    <button class="btn" id="checkout-btn">Заказать</button>
  `;

  attachCheckoutLogic(imagesToSend, totalPrice);
}

// Глобальные функции для кнопок в HTML
window.changeQty = function(index, delta) {
  currentCart[index].quantity += delta;
  if (currentCart[index].quantity <= 0) {
    currentCart.splice(index, 1); // Если стало 0, удаляем
  }
  localStorage.setItem('myCart', JSON.stringify(currentCart));
  renderCart(); // Перерисовываем
};

window.removeItem = function(index) {
  currentCart.splice(index, 1);
  localStorage.setItem('myCart', JSON.stringify(currentCart));
  renderCart();
};

// Логика оформления заказа
function attachCheckoutLogic(imagesToSend, totalPrice) {
  const checkoutBtn = document.getElementById('checkout-btn');
  const modal = document.getElementById('order-modal');
  const closeBtn = document.getElementById('close-modal');

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', async () => {
      let messageText = "";
      
      currentCart.forEach(item => {
        const p = currentProducts.find(x => x.id === item.id);
        if (p) {
          messageText += `▪️ ${p.name} (Размер: ${item.size}) — ${item.quantity} шт. (${(p.price * item.quantity).toLocaleString('ru-RU')} ₽)\n`;
        }
      });
      messageText += `\n💰 Итого: ${totalPrice.toLocaleString('ru-RU')} ₽`;

      try {
        checkoutBtn.textContent = 'Отправка...'; 
        await fetch('https://humble-tapir-7940.highstyle717.deno.net/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
      currentCart = []; // Очищаем локально
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

// Запуск
initCart();