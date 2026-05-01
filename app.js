document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const navIndicator = document.getElementById('navIndicator');
    const bottomNavIndicator = document.getElementById('bottomNavIndicator');
    const contentArea = document.getElementById('contentArea');

    const products = [
        { id: 1, name: 'Premium UI Kit', category: 'Design', price: '45.00', image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&h=300&fit=crop' },
        { id: 2, name: 'SaaS Dashboard', category: 'Code', price: '120.00', image: 'https://images.unsplash.com/photo-1551288049-bbbda536ad3a?w=400&h=300&fit=crop' },
        { id: 3, name: 'Mobile App Icons', category: 'Icons', price: '15.00', image: 'https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?w=400&h=300&fit=crop' },
        { id: 4, name: 'React Template', category: 'Code', price: '89.00', image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop' },
        { id: 5, name: 'Brand Identity', category: 'Design', price: '200.00', image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop' },
        { id: 6, name: '3D Character', category: '3D', price: '60.00', image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400&h=300&fit=crop' },
    ];

    const pages = {
        marketplace: () => `
            <div class="products-grid">
                ${products.map(p => `
                    <div class="product-card">
                        <div class="product-image" style="background-image: url('${p.image}')"></div>
                        <div class="product-info">
                            <span class="product-category">${p.category}</span>
                            <h3 class="product-name">${p.name}</h3>
                            <div class="product-footer">
                                <span class="product-price">$${p.price}</span>
                                <button class="buy-button">Купить</button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `,
        purchases: () => `
            <div class="empty-state">
                <div class="empty-icon">📦</div>
                <h2>У вас пока нет покупок</h2>
                <p>Купите что-нибудь интересное в нашем магазине!</p>
                <button class="primary-button" onclick="navigate('marketplace')">В магазин</button>
            </div>
        `,
        profile: () => `
            <div class="profile-container">
                <div class="profile-header">
                    <div class="profile-avatar"></div>
                    <div class="profile-meta">
                        <h2>Иван Иванов</h2>
                        <p>ivan@example.com</p>
                        <span class="badge">PRO Аккаунт</span>
                    </div>
                </div>
                <div class="profile-stats">
                    <div class="stat-card"><span>Баланс</span><strong>$1,250.00</strong></div>
                    <div class="stat-card"><span>Покупок</span><strong>12</strong></div>
                    <div class="stat-card"><span>Отзывов</span><strong>4</strong></div>
                </div>
            </div>
        `,
        cart: () => `
             <div class="empty-state">
                <div class="empty-icon">🛒</div>
                <h2>Корзина пуста</h2>
                <p>Добавьте товары, чтобы совершить покупку.</p>
            </div>
        `,
        balance: () => `
            <div class="balance-page">
                <h2>Пополнение баланса</h2>
                <div class="balance-card">
                    <p>Текущий счет</p>
                    <h1>$1,250.00</h1>
                </div>
                <div class="payment-methods">
                    <h3>Выберите способ оплаты</h3>
                    <div class="method-grid">
                        <div class="method-item active">💳 Карта</div>
                        <div class="method-item">₿ Crypto</div>
                        <div class="method-item">🏦 СБП</div>
                    </div>
                    <input type="number" class="amount-input" placeholder="Введите сумму">
                    <button class="primary-button">Пополнить</button>
                </div>
            </div>
        `,
        settings: () => `
            <div class="settings-page">
                <h2>Настройки</h2>
                <div class="settings-section">
                    <h3>Основные</h3>
                    <div class="setting-row">
                        <span>Темная тема</span>
                        <div class="toggle active"></div>
                    </div>
                    <div class="setting-row">
                        <span>Уведомления</span>
                        <div class="toggle"></div>
                    </div>
                </div>
                <div class="settings-section">
                    <h3>Аккаунт</h3>
                    <div class="setting-row">
                        <span>Сменить пароль</span>
                        <button class="secondary-button">Изменить</button>
                    </div>
                    <div class="setting-row">
                        <span>Двухфакторная аутентификация</span>
                        <div class="toggle active"></div>
                    </div>
                </div>
            </div>
        `,
        support: () => `
            <div class="support-page">
                <h2>Поддержка</h2>
                <p>Мы всегда готовы помочь вам 24/7</p>
                <div class="support-options">
                    <div class="support-card">
                        <h3>Написать в чат</h3>
                        <p>Среднее время ответа: 5 мин</p>
                        <button class="primary-button">Начать чат</button>
                    </div>
                    <div class="support-card">
                        <h3>Частые вопросы</h3>
                        <p>База знаний для быстрого решения проблем</p>
                        <button class="secondary-button">Перейти</button>
                    </div>
                </div>
            </div>
        `
    };

    function updateIndicator(item) {
        const isBottomNav = item.parentElement.id === 'bottomNav';
        const indicator = isBottomNav ? bottomNavIndicator : navIndicator;
        const otherIndicator = isBottomNav ? navIndicator : bottomNavIndicator;

        otherIndicator.style.opacity = '0';
        indicator.style.opacity = '1';

        indicator.style.top = `${item.offsetTop}px`;
    }

    function navigate(page) {
        const activeItem = document.querySelector(`.nav-item[data-page="${page}"]`);
        if (!activeItem) return;

        navItems.forEach(item => item.classList.remove('active'));
        activeItem.classList.add('active');
        
        updateIndicator(activeItem);
        
        contentArea.style.opacity = '0';
        contentArea.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            contentArea.innerHTML = pages[page]();
            contentArea.style.opacity = '1';
            contentArea.style.transform = 'translateY(0)';
        }, 200);
    }

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const page = item.getAttribute('data-page');
            navigate(page);
        });
    });

    const initialPage = 'marketplace';
    contentArea.innerHTML = pages[initialPage]();
    updateIndicator(document.querySelector(`.nav-item[data-page="${initialPage}"]`));

    window.navigate = navigate;
});
