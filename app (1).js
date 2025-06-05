// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();

// Данные меню (в реальном приложении это может быть запрос к API)
const menuData = {
    hot: [
        {
            id: 1,
            name: "Стейк Рибай",
            description: "Сочный стейк из мраморной говядины",
            price: 2500,
            image: "https://via.placeholder.com/150",
            category: "hot"
        },
        {
            id: 2,
            name: "Паста Карбонара",
            description: "Классическая итальянская паста с беконом",
            price: 850,
            image: "https://via.placeholder.com/150",
            category: "hot"
        }
    ],
    cold: [
        {
            id: 3,
            name: "Цезарь с курицей",
            description: "Свежий салат с куриным филе",
            price: 650,
            image: "https://via.placeholder.com/150",
            category: "cold"
        }
    ],
    desserts: [
        {
            id: 4,
            name: "Тирамису",
            description: "Классический итальянский десерт",
            price: 450,
            image: "https://via.placeholder.com/150",
            category: "desserts"
        }
    ],
    drinks: [
        {
            id: 5,
            name: "Мохито",
            description: "Освежающий коктейль с мятой",
            price: 550,
            image: "https://via.placeholder.com/150",
            category: "drinks"
        }
    ]
};

// Состояние корзины
let cart = [];

// Элементы DOM
const menuItemsContainer = document.getElementById('menuItems');
const cartItemsContainer = document.getElementById('cartItems');
const totalPriceElement = document.getElementById('totalPrice');
const categoryButtons = document.querySelectorAll('.category-btn');
const orderButton = document.getElementById('orderButton');

// Инициализация приложения
function init() {
    if (!tg.initData) {
        console.error("Telegram WebApp не инициализировано. Откройте приложение через Telegram.");
        return;
    }
    renderMenu('all');
    setupEventListeners();
}

// Отрисовка меню
function renderMenu(category) {
    menuItemsContainer.innerHTML = '';
    
    let items = [];
    if (category === 'all') {
        Object.values(menuData).forEach(categoryItems => {
            items = items.concat(categoryItems);
        });
    } else {
        items = menuData[category] || [];
    }

    items.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        menuItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <div class="price">${item.price} ₽</div>
            <button class="add-to-cart" data-id="${item.id}">Добавить в корзину</button>
        `;
        menuItemsContainer.appendChild(menuItem);
    });
}

// Настройка слушателей событий
function setupEventListeners() {
    // Кнопки категорий
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            renderMenu(button.dataset.category);
        });
    });

    // Кнопки "Добавить в корзину"
    menuItemsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart')) {
            const itemId = parseInt(e.target.dataset.id);
            addToCart(itemId);
        }
    });

    // Кнопка оформления заказа
    orderButton.addEventListener('click', submitOrder);
}

// Добавление товара в корзину
function addToCart(itemId) {
    const item = findItemById(itemId);
    if (!item) return;

    const existingItem = cart.find(cartItem => cartItem.id === itemId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...item,
            quantity: 1
        });
    }

    updateCart();
}

// Удаление товара из корзины
function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    updateCart();
}

// Обновление количества товара в корзине
function updateItemQuantity(itemId, delta) {
    const item = cart.find(item => item.id === itemId);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            removeFromCart(itemId);
        } else {
            updateCart();
        }
    }
}

// Обновление отображения корзины
function updateCart() {
    cartItemsContainer.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const cartItem = document.createElement('div');
        cartItem.className = 'menu-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <div>${item.price} ₽ × ${item.quantity}</div>
            </div>
            <div class="cart-item-controls">
                <button onclick="updateItemQuantity(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateItemQuantity(${item.id}, 1)">+</button>
            </div>
        `;
        cartItemsContainer.appendChild(cartItem);
    });

    totalPriceElement.textContent = `${total} ₽`;
}

// Поиск товара по ID
function findItemById(id) {
    for (const category of Object.values(menuData)) {
        const item = category.find(item => item.id === id);
        if (item) return item;
    }
    return null;
}

// Отправка заказа
function submitOrder() {
    if (cart.length === 0) {
        tg.showAlert('Добавьте товары в корзину');
        return;
    }

    const order = {
        items: cart,
        total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    };

    // Логи для отладки
    console.log("Заказ отправляется:", order);
    console.log("Сериализованный заказ:", JSON.stringify(order));

    // Подтверждение заказа
    tg.showPopup({
        title: "Подтверждение заказа",
        message: `Итоговая сумма: ${order.total} ₽. Подтвердить заказ?`,
        buttons: [
            { id: "cancel", type: "cancel", text: "Отмена" },
            { id: "confirm", type: "default", text: "Подтвердить" }
        ]
    }, (buttonId) => {
        if (buttonId === "confirm") {
            try {
                tg.sendData(JSON.stringify(order));
                console.log("Данные успешно отправлены");
                tg.showAlert("Заказ отправлен!");
            } catch (error) {
                console.error("Ошибка отправки данных:", error);
                tg.showAlert("Ошибка при отправке заказа: " + error.message);
            }
        } else {
            console.log("Заказ отменён пользователем");
            tg.showAlert("Заказ отменён.");
        }
        tg.close();
    });
}

// Инициализация приложения
init();