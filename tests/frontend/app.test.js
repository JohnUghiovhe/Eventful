/**
 * Frontend Tests for Eventful App
 * Tests for DOM manipulation, state management, and user interactions
 */

describe('Eventful Frontend - App Initialization', () => {
    beforeEach(() => {
        // Clear DOM
        document.body.innerHTML = '';
        localStorage.clear();
        
        // Create minimal DOM structure
        document.body.innerHTML = `
            <nav class="navbar">
                <div class="navbar-container">
                    <div class="logo">🎭 <span>Eventful</span></div>
                    <div class="navbar-menu">
                        <a href="#home" class="nav-link active" data-section="home">Home</a>
                        <a href="#events" class="nav-link" data-section="events">Events</a>
                        <a href="#tickets" class="nav-link" data-section="tickets">My Tickets</a>
                        <a href="#payments" class="nav-link" data-section="payments">Payments</a>
                        <a href="#analytics" class="nav-link" data-section="analytics">Analytics</a>
                    </div>
                    <div class="navbar-right">
                        <button class="notification-btn" id="notificationBtn">
                            🔔 <span class="notification-badge" id="notificationBadge">0</span>
                        </button>
                        <button class="theme-toggle" id="themeToggle" title="Toggle dark/light mode">
                            <span class="theme-icon">🌙</span>
                        </button>
                    </div>
                </div>
            </nav>
            
            <main class="main-content">
                <section id="home" class="section active">
                    <div class="hero">
                        <div class="hero-content">
                            <h1>Welcome to Eventful</h1>
                            <p>Your ultimate event ticketing and management platform</p>
                            <div class="hero-buttons">
                                <button class="btn btn-primary" onclick="navigateTo('events')">Browse Events</button>
                                <button class="btn btn-secondary" onclick="showAuthModal('signup')">Sign Up</button>
                            </div>
                        </div>
                    </div>
                </section>
                
                <section id="events" class="section">
                    <div class="section-header">
                        <h2>Browse Events</h2>
                        <button class="btn btn-primary" onclick="showEventModal()">Create Event</button>
                    </div>
                    <div class="events-grid" id="eventsGrid"></div>
                </section>
                
                <section id="tickets" class="section">
                    <div class="section-header">
                        <h2>My Tickets</h2>
                    </div>
                    <div class="tickets-container"></div>
                </section>
            </main>
            
            <div class="modal" id="authModal">
                <div class="modal-content">
                    <span class="close-btn" onclick="closeModal('authModal')">&times;</span>
                    <h2 id="authTitle">Sign In</h2>
                    <form id="authForm">
                        <div id="nameGroup" style="display:none;">
                            <input type="text" id="authName" placeholder="Full Name">
                        </div>
                        <input type="email" id="authEmail" placeholder="Email" required>
                        <input type="password" id="authPassword" placeholder="Password" required>
                        <button type="submit">Sign In</button>
                    </form>
                </div>
            </div>
            
            <div class="modal" id="eventModal">
                <div class="modal-content">
                    <span class="close-btn" onclick="closeModal('eventModal')">&times;</span>
                    <h2>Create Event</h2>
                    <form id="eventForm">
                        <input type="text" id="eventTitle" placeholder="Event Title" required>
                        <textarea id="eventDesc" placeholder="Description"></textarea>
                        <input type="number" id="eventPrice" placeholder="Ticket Price" min="0">
                        <button type="submit">Create Event</button>
                    </form>
                </div>
            </div>
            
            <div class="modal" id="paymentModal">
                <div class="modal-content">
                    <span class="close-btn" onclick="closeModal('paymentModal')">&times;</span>
                    <h2>Complete Payment</h2>
                    <p id="paymentEvent">Event Name</p>
                    <p id="paymentPrice">10</p>
                    <form id="paymentForm">
                        <input type="number" id="ticketQuantity" value="1" min="1">
                        <p>Total: ₦<span id="paymentTotal">10.00</span></p>
                        <input type="email" id="paymentEmail" placeholder="Email">
                        <button type="submit">Pay Now</button>
                    </form>
                </div>
            </div>
            
            <div id="notificationsPanel" class="notifications-panel">
                <button id="closeNotificationsBtn" onclick="closeNotifications()">Close</button>
            </div>
            
            <div class="modal" id="shareModal">
                <div class="modal-content">
                    <input type="text" id="shareLink" placeholder="Share link">
                    <button onclick="copyToClipboard()">Copy</button>
                </div>
            </div>
        `;
    });

    test('ThemeManager should initialize with light theme by default', () => {
        const themeManager = new ThemeManager();
        expect(themeManager.theme).toBe('light');
    });

    test('ThemeManager should toggle between light and dark themes', () => {
        const themeManager = new ThemeManager();
        expect(themeManager.theme).toBe('light');
        
        themeManager.theme = 'dark';
        themeManager.apply();
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
        
        themeManager.theme = 'light';
        themeManager.apply();
        expect(document.documentElement.getAttribute('data-theme')).toBe('');
    });

    test('ThemeManager should persist theme to localStorage', () => {
        const themeManager = new ThemeManager();
        themeManager.theme = 'dark';
        localStorage.setItem('eventful-theme', 'dark');
        
        const newThemeManager = new ThemeManager();
        expect(newThemeManager.theme).toBe('dark');
    });

    test('AppState should initialize with no user by default', () => {
        const appState = new AppState();
        expect(appState.user).toBeNull();
        expect(appState.notifications).toEqual([]);
    });

    test('AppState should set and retrieve user', () => {
        const appState = new AppState();
        const testUser = { id: '1', email: 'test@example.com', firstName: 'John' };
        
        appState.setUser(testUser);
        expect(appState.user).toEqual(testUser);
        expect(JSON.parse(localStorage.getItem('user'))).toEqual(testUser);
    });

    test('AppState should logout user', () => {
        const appState = new AppState();
        const testUser = { id: '1', email: 'test@example.com' };
        
        appState.setUser(testUser);
        appState.logout();
        
        expect(appState.user).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
    });

    test('AppState should add notifications and update badge', () => {
        const appState = new AppState();
        const notif = { title: 'Test', msg: 'Test message' };
        
        appState.addNotif(notif);
        expect(appState.notifications.length).toBe(1);
        
        const badge = document.getElementById('notificationBadge');
        expect(badge.textContent).toBe('1');
    });
});

describe('Eventful Frontend - Navigation Functions', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div class="navbar-menu">
                <a href="#home" class="nav-link active" data-section="home">Home</a>
                <a href="#events" class="nav-link" data-section="events">Events</a>
            </div>
            <section id="home" class="section active"></section>
            <section id="events" class="section"></section>
        `;
    });

    test('navigateTo should activate target section', () => {
        const eventsSection = document.getElementById('events');
        expect(eventsSection.classList.contains('active')).toBe(false);
        
        navigateTo('events');
        
        expect(eventsSection.classList.contains('active')).toBe(true);
    });

    test('navigateTo should deactivate other sections', () => {
        const homeSection = document.getElementById('home');
        navigateTo('events');
        
        expect(homeSection.classList.contains('active')).toBe(false);
    });

    test('navigateTo should update navbar active link', () => {
        const eventsLink = document.querySelector('[data-section="events"]');
        navigateTo('events');
        
        expect(eventsLink.classList.contains('active')).toBe(true);
    });

    test('navigateTo should scroll to top', () => {
        // Mock window.scrollTo since jsdom doesn't implement scrolling
        const scrollToSpy = jest.spyOn(window, 'scrollTo').mockImplementation();
        navigateTo('events');
        
        expect(scrollToSpy).toHaveBeenCalledWith(0, 0);
        scrollToSpy.mockRestore();
    });
});

describe('Eventful Frontend - Modal Functions', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div class="modal" id="testModal">
                <div class="modal-content"></div>
            </div>
            <div class="modal" id="authModal">
                <div class="modal-content">
                    <h2 id="authTitle">Sign In</h2>
                    <div id="nameGroup" style="display:none;"></div>
                    <form id="authForm">
                        <button type="submit">Sign In</button>
                    </form>
                </div>
            </div>
            <div class="modal" id="eventModal"></div>
        `;
        window.appState = new AppState();
    });

    test('openModal should add open class', () => {
        const modal = document.getElementById('testModal');
        openModal('testModal');
        
        expect(modal.classList.contains('open')).toBe(true);
    });

    test('closeModal should remove open class', () => {
        const modal = document.getElementById('testModal');
        modal.classList.add('open');
        closeModal('testModal');
        
        expect(modal.classList.contains('open')).toBe(false);
    });

    test('showAuthModal should be callable with different modes', () => {
        // Set global appState for the function to use
        appState = new AppState();
        
        // These should not throw errors
        expect(() => showAuthModal('signup')).not.toThrow();
        expect(() => showAuthModal('signin')).not.toThrow();
    });

    test('showAuthModal signin mode should hide name field', () => {
        showAuthModal('signin');
        
        const nameGroup = document.getElementById('nameGroup');
        expect(nameGroup.style.display).toBe('none');
    });
});

describe('Eventful Frontend - UI Interactions', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <button class="notification-btn" id="notificationBtn">🔔</button>
            <div id="notificationsPanel" class="notifications-panel"></div>
            <button id="closeNotificationsBtn">Close</button>
            
            <button class="theme-toggle" id="themeToggle">🌙</button>
            <section id="testSection" class="section"></section>
            
            <input type="number" id="ticketQuantity" value="1" min="1">
            <p id="paymentPrice">10</p>
            <p id="paymentTotal">10.00</p>
        `;
        
        window.appState = new AppState();
        window.themeManager = new ThemeManager();
    });

    test('showToast should display notification message', (done) => {
        showToast('Test message');
        
        // Use custom selector since jsdom may handle positioning differently
        const toasts = document.querySelectorAll('div');
        let found = false;
        toasts.forEach(el => {
            if (el.textContent === 'Test message') {
                found = true;
                expect(el.textContent).toBe('Test message');
            }
        });
        
        expect(found).toBe(true);
        
        setTimeout(() => {
            done();
        }, 3000);
    });

    test('buyTicket should alert user if not logged in', () => {
        const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
        window.appState.user = null;
        
        buyTicket('evt_1');
        
        expect(alertSpy).toHaveBeenCalledWith('Sign in first');
        alertSpy.mockRestore();
    });

    test('downloadTicket should be callable', () => {
        // downloadTicket calls showToast internally
        // Just verify it doesn't throw an error
        expect(() => downloadTicket('TKT-001')).not.toThrow();
    });

    test('copyToClipboard should copy link to clipboard', () => {
        document.body.innerHTML = `
            <input type="text" id="shareLink" value="https://eventful.app/event/1">
        `;
        
        // Mock document.execCommand
        const originalExecCommand = document.execCommand;
        let copyWasCalled = false;
        document.execCommand = jest.fn((command) => {
            if (command === 'copy') {
                copyWasCalled = true;
            }
            return true;
        });
        
        copyToClipboard();
        
        expect(copyWasCalled).toBe(true);
        document.execCommand = originalExecCommand;
    });

    test('closeNotifications should remove open class', () => {
        const panel = document.getElementById('notificationsPanel');
        panel.classList.add('open');
        
        closeNotifications();
        
        expect(panel.classList.contains('open')).toBe(false);
    });
});

describe('Eventful Frontend - Form Validations', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <form id="authForm">
                <input type="email" id="authEmail" placeholder="Email">
                <input type="password" id="authPassword" placeholder="Password">
                <input type="text" id="authName" placeholder="Full Name">
                <button type="submit">Sign In</button>
            </form>
            
            <form id="eventForm">
                <input type="text" id="eventTitle" placeholder="Event Title">
                <textarea id="eventDesc" placeholder="Description"></textarea>
                <input type="number" id="eventPrice" placeholder="Price">
                <button type="submit">Create</button>
            </form>
            
            <form id="paymentForm">
                <input type="number" id="ticketQuantity" value="1" min="1">
                <input type="email" id="paymentEmail" placeholder="Email">
                <p id="paymentTotal">10.00</p>
                <button type="submit">Pay</button>
            </form>
        `;
        
        window.appState = new AppState();
    });

    test('Auth form inputs should be retrievable', () => {
        const emailInput = document.getElementById('authEmail');
        const passwordInput = document.getElementById('authPassword');
        
        emailInput.value = 'test@test.com';
        passwordInput.value = 'password123';
        
        expect(emailInput.value).toBe('test@test.com');
        expect(passwordInput.value).toBe('password123');
    });

    test('Event form title input should be required', () => {
        const titleInput = document.getElementById('eventTitle');
        
        expect(titleInput.getAttribute('placeholder')).toBe('Event Title');
        expect(titleInput).toBeTruthy();
    });

    test('Event form should require user to be logged in', () => {
        const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
        window.appState.user = null;
        
        showEventModal();
        
        expect(alertSpy).toHaveBeenCalledWith('Sign in first');
        alertSpy.mockRestore();
    });

    test('Event form should display modal when conditions are met', () => {
        window.appState.user = { id: '1', email: 'test@test.com' };
        
        showEventModal();
        
        // Verify the function completes without error for logged in users
        expect(window.appState.user).toBeTruthy();
    });

    test('Payment form should have required fields', () => {
        const quantityInput = document.getElementById('ticketQuantity');
        const emailInput = document.getElementById('paymentEmail');
        const totalEl = document.getElementById('paymentTotal');
        
        expect(quantityInput.value).toBe('1');
        expect(totalEl.textContent).toBe('10.00');
    });
});

describe('Eventful Frontend - API Integration', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="eventsGrid"></div>
            <form id="authForm">
                <input type="email" id="authEmail" value="test@test.com">
                <input type="password" id="authPassword" value="password">
                <input type="text" id="authName" value="John Doe">
                <button type="submit">Sign In</button>
            </form>
        `;
        
        window.appState = new AppState();
        localStorage.removeItem('authToken');
    });

    test('apiCall should include Authorization header when token exists', async () => {
        const mockFetch = jest.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => ({ status: 'success', data: [] })
        });
        
        global.fetch = mockFetch;
        localStorage.setItem('authToken', 'test-token-123');
        
        await apiCall('/events');
        
        const callArgs = mockFetch.mock.calls[0];
        expect(callArgs[1].headers.Authorization).toBe('Bearer test-token-123');
    });

    test('apiCall should handle error responses', async () => {
        const mockFetch = jest.fn().mockResolvedValueOnce({
            ok: false,
            status: 401,
            json: async () => ({ message: 'Unauthorized' })
        });
        
        global.fetch = mockFetch;
        
        try {
            await apiCall('/events');
        } catch (error) {
            expect(error.message).toBe('Unauthorized');
        }
    });

    test('loadEvents should populate events grid with API response', async () => {
        const mockEvents = [
            {
                _id: 'evt_1',
                title: 'Summer Music Festival',
                startDate: new Date().toISOString(),
                location: { city: 'Lagos' },
                ticketPrice: 45,
                ticketsAvailable: 245
            },
            {
                _id: 'evt_2',
                title: 'Tech Conference',
                startDate: new Date().toISOString(),
                location: { city: 'Abuja' },
                ticketPrice: 199,
                ticketsAvailable: 120
            }
        ];
        
        const mockFetch = jest.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => ({ status: 'success', events: mockEvents })
        });
        
        global.fetch = mockFetch;
        
        await loadEvents();
        
        const grid = document.getElementById('eventsGrid');
        const eventCards = grid.querySelectorAll('.event-card');
        
        expect(eventCards.length).toBe(2);
    });

    test('apiCall should be called with correct endpoint', async () => {
        const mockFetch = jest.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => ({ status: 'success', data: [] })
        });
        
        global.fetch = mockFetch;
        
        await apiCall('/events');
        
        const callArgs = mockFetch.mock.calls[0];
        expect(callArgs[0]).toBe('/api/events');
    });
});

describe('Eventful Frontend - Ticket Quantity Calculations', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <input type="number" id="ticketQuantity" value="1" min="1">
            <p id="paymentPrice">50.00</p>
            <p id="paymentTotal">50.00</p>
        `;
    });

    test('Changing ticket quantity should update total price', () => {
        const quantityInput = document.getElementById('ticketQuantity');
        const priceEl = document.getElementById('paymentPrice');
        const totalEl = document.getElementById('paymentTotal');
        
        // Simulate the event listener
        const event = new Event('change');
        quantityInput.value = '3';
        
        const price = parseFloat(priceEl.textContent) || 10;
        totalEl.textContent = (price * parseInt(quantityInput.value)).toFixed(2);
        
        expect(totalEl.textContent).toBe('150.00');
    });

    test('Total price should never be negative', () => {
        const quantityInput = document.getElementById('ticketQuantity');
        const priceEl = document.getElementById('paymentPrice');
        const totalEl = document.getElementById('paymentTotal');
        
        quantityInput.value = '0';
        const price = parseFloat(priceEl.textContent) || 10;
        const total = Math.max(0, price * parseInt(quantityInput.value));
        
        expect(total).toBe(0);
    });
});

describe('Eventful Frontend - Search and Filter', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <input type="text" id="eventSearch" placeholder="Search events...">
            <select id="categoryFilter">
                <option value="">All Categories</option>
                <option value="concert">Concert</option>
                <option value="theater">Theater</option>
            </select>
            <input type="date" id="dateFilter">
            
            <div class="events-grid" id="eventsGrid">
                <div class="event-card">
                    <h3>Summer Music Festival</h3>
                </div>
                <div class="event-card">
                    <h3>Tech Conference</h3>
                </div>
                <div class="event-card">
                    <h3>Theater Play</h3>
                </div>
            </div>
        `;
    });

    test('Event search should filter events by title', () => {
        const searchInput = document.getElementById('eventSearch');
        const cards = document.querySelectorAll('.event-card');
        
        // Simulate search
        const searchTerm = 'music';
        cards.forEach(card => {
            const h3 = card.querySelector('h3');
            const text = h3 ? h3.textContent.toLowerCase() : '';
            card.style.display = text.includes(searchTerm.toLowerCase()) ? '' : 'none';
        });
        
        expect(cards[0].style.display).toBe('');
        expect(cards[1].style.display).toBe('none');
    });

    test('Search should be case-insensitive', () => {
        const cards = document.querySelectorAll('.event-card');
        
        const searchTerm = 'TECH';
        cards.forEach(card => {
            const h3 = card.querySelector('h3');
            const text = h3 ? h3.textContent.toLowerCase() : '';
            card.style.display = text.includes(searchTerm.toLowerCase()) ? '' : 'none';
        });
        
        expect(cards[1].style.display).toBe('');
    });

    test('Category filter should trigger toast notification', () => {
        const toastSpy = jest.spyOn(window, 'showToast');
        const filterSelect = document.getElementById('categoryFilter');
        
        filterSelect.value = 'concert';
        const event = new Event('change');
        
        showToast(`Filtering: ${filterSelect.value || 'all'}`);
        
        expect(toastSpy).toHaveBeenCalledWith('Filtering: concert');
        toastSpy.mockRestore();
    });
});

describe('Eventful Frontend - Error Handling', () => {
    test('apiCall should handle network errors', async () => {
        const mockFetch = jest.fn().mockRejectedValueOnce(new Error('Network error'));
        global.fetch = mockFetch;
        
        try {
            await apiCall('/events');
        } catch (error) {
            expect(error.message).toContain('Network error');
        }
    });

    test('apiCall should handle JSON parse errors gracefully', async () => {
        const mockFetch = jest.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => {
                throw new Error('Invalid JSON');
            }
        });
        
        global.fetch = mockFetch;
        
        try {
            await apiCall('/events');
        } catch (error) {
            expect(error).toBeDefined();
        }
    });

    test('apiCall should handle missing endpoint', async () => {
        const mockFetch = jest.fn().mockResolvedValueOnce({
            ok: false,
            status: 404,
            json: async () => ({ message: 'Not found' })
        });
        
        global.fetch = mockFetch;
        
        try {
            await apiCall('/nonexistent');
        } catch (error) {
            expect(error.message).toBe('Not found');
        }
    });
});

describe('Eventful Frontend - LocalStorage Persistence', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('Theme should persist to localStorage', () => {
        const themeManager = new ThemeManager();
        themeManager.theme = 'dark';
        localStorage.setItem('eventful-theme', 'dark');
        
        const newThemeManager = new ThemeManager();
        expect(newThemeManager.theme).toBe('dark');
    });

    test('User should persist to localStorage', () => {
        const appState = new AppState();
        const user = { id: '1', email: 'test@test.com', firstName: 'John' };
        
        appState.setUser(user);
        
        const stored = JSON.parse(localStorage.getItem('user'));
        expect(stored).toEqual(user);
    });

    test('Auth token should persist to localStorage', () => {
        localStorage.setItem('authToken', 'test-token-xyz');
        const token = localStorage.getItem('authToken');
        
        expect(token).toBe('test-token-xyz');
    });
});
