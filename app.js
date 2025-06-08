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
            image: "steak.jpg",
            category: "hot"
        },
        {
            id: 2,
            name: "Паста Карбонара",
            description: "Классическая итальянская паста с беконом",
            price: 850,
            image: "pasta.jpg",
            category: "hot"
        }
    ],
    cold: [
        {
            id: 3,
            name: "Цезарь с курицей",
            description: "Свежий салат с куриным филе",
            price: 650,
            image: "caesar.jpg",
            category: "cold"
        }
    ],
    desserts: [
        {
            id: 4,
            name: "Тирамису",
            description: "Классический итальянский десерт",
            price: 450,
            image: "tiramisu.jpg",
            category: "desserts"
        }
    ],
    drinks: [
        {
            id: 5,
            name: "Мохито",
            description: "Освежающий коктейль с мятой",
            price: 550,
            image: "mojito.webp",
            category: "drinks"
        }
    ]
};

// Элементы DOM
const menuItemsContainer = document.getElementById('menuItems');
const categoryButtons = document.querySelectorAll('.category-btn');
const closeButton = document.getElementById('closeButton');

// Инициализация приложения
function init() {
    try {
        if (window.Telegram && window.Telegram.WebApp) {
            tg.expand();
            renderMenu('all');
            setupEventListeners();
        } else {
            console.warn("Telegram WebApp не обнаружен, запуск в режиме отладки");
            renderMenu('all');
            setupEventListeners();
        }
    } catch (error) {
        console.error("Ошибка инициализации:", error);
        renderMenu('all');
        setupEventListeners();
    }
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

    // Кнопка закрытия
    closeButton.addEventListener('click', () => {
        if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.close();
        }
    });
}

// Инициализация приложения
init();
