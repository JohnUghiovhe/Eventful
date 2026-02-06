class AppState {
    constructor() {
        this.user = JSON.parse(localStorage.getItem('user')) || null;
        this.notifications = [];
        this.authMode = 'signin';
    }
    setUser(u) { this.user = u; localStorage.setItem('user', JSON.stringify(u)); }
    logout() { this.user = null; localStorage.removeItem('user'); }
    addNotif(n) { 
        this.notifications.push(n); 
        const badge = document.getElementById('notificationBadge');
        if (badge) badge.textContent = this.notifications.length;
    }
    clearNotifs() { 
        this.notifications = []; 
        const badge = document.getElementById('notificationBadge');
        if (badge) badge.textContent = '';
    }
}



class ThemeManager {
    constructor() {
        this.theme = localStorage.getItem('eventful-theme') || 'light';
        this.toggle = this.toggle.bind(this);
    }

    init() {
        this.apply();
        document.getElementById('themeToggle')?.addEventListener('click', this.toggle);
    }

    apply() {
        const isDark = this.theme === 'dark';
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : '');
        const themeBtn = document.getElementById('themeToggle');
        if (themeBtn) themeBtn.textContent = isDark ? '☀️' : '🌙';
    }

    toggle() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('eventful-theme', this.theme);
        this.apply();
    }
}

// Global variables
let themeManager;
let appState;

function navigateTo(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(id)?.classList.add('active');
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelector(`[data-section="${id}"]`)?.classList.add('active');
    window.scrollTo(0, 0);
}

function openModal(id) { 
    document.getElementById(id)?.classList.add('open'); 
}

function closeModal(id) { 
    document.getElementById(id)?.classList.remove('open'); 
}

function showAuthModal(mode = 'signin') {
    if (!appState) return;
    appState.authMode = mode;
    const isSignUp = mode === 'signup';
    const title = document.getElementById('authTitle');
    const nameGroup = document.getElementById('nameGroup');
    const form = document.getElementById('authForm');
    
    if (title) title.textContent = isSignUp ? 'Sign Up' : 'Sign In';
    if (nameGroup) nameGroup.style.display = isSignUp ? 'block' : 'none';
    if (form) {
        const btn = form.querySelector('button[type="submit"]');
        if (btn) btn.textContent = isSignUp ? 'Sign Up' : 'Sign In';
    }
    openModal('authModal');
}

function switchAuthMode(m) { 
    showAuthModal(m); 
}

function closeNotifications() { 
    document.getElementById('notificationsPanel')?.classList.remove('open'); 
}

function showEventModal() {
    if (!appState?.user) { 
        alert('Sign in first'); 
        showAuthModal('signin'); 
        return; 
    }
    openModal('eventModal');
}

function buyTicket(id) {
    if (!appState?.user) { 
        alert('Sign in first'); 
        showAuthModal('signin'); 
        return; 
    }
    const cards = document.querySelectorAll('.event-card');
    let eventTitle = 'Event';
    cards.forEach(card => {
        const btn = card.querySelector(`button[onclick*="buyTicket"]`);
        if (btn && btn.getAttribute('onclick').includes(id)) {
            const h3 = card.querySelector('h3');
            if (h3) eventTitle = h3.textContent;
        }
    });
    const paymentEvent = document.getElementById('paymentEvent');
    if (paymentEvent) paymentEvent.textContent = eventTitle;
    openModal('paymentModal');
}

function downloadTicket(id) { 
    showToast('Downloading...'); 
}

function shareTicket(id) { 
    openModal('shareModal'); 
}

function shareEvent(id) {
    const shareLink = document.getElementById('shareLink');
    if (shareLink) shareLink.value = `https://eventful.app/event/${id}`;
    openModal('shareModal');
}

function shareOn(p) { 
    showToast(`Opening ${p}...`); 
}

function copyToClipboard() { 
    const shareLink = document.getElementById('shareLink');
    if (shareLink) {
        shareLink.select(); 
        document.execCommand('copy'); 
        showToast('Copied!');
    }
}

function showToast(msg) {
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;bottom:20px;left:20px;background:var(--accent-color);color:#fff;padding:1rem 1.5rem;border-radius:8px;font-weight:600;z-index:9999;max-width:300px;transition:opacity 0.3s';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => { 
        toast.style.opacity = '0'; 
        setTimeout(() => toast.remove(), 300); 
    }, 2500);
}

// API helper
async function apiCall(endpoint, options = {}) {
    const token = localStorage.getItem('authToken');
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
    };
    try {
        const response = await fetch(`/api${endpoint}`, {
            ...options,
            headers
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || `API error: ${response.status}`);
        }
        return data;
    } catch (error) {
        console.error('API Error:', error);
        showToast(error.message || 'API request failed');
        throw error;
    }
}

// Load events from backend
async function loadEvents() {
    try {
        const result = await apiCall('/events');
        if (result.events && result.events.length > 0) {
            const eventsGrid = document.getElementById('eventsGrid');
            if (!eventsGrid) return;
            
            eventsGrid.innerHTML = result.events.map(e => `
                <div class="event-card">
                    <div class="event-image" style="font-size:3em">${['🎭', '🎪', '🎬', '🎸', '⚽', '🏃'][Math.random() * 6 | 0]}</div>
                    <div class="event-info">
                        <h3>${e.title}</h3>
                        <p class="event-date">📅 ${new Date(e.startDate).toLocaleDateString()}</p>
                        <p class="event-location">📍 ${e.location?.city || 'TBD'}</p>
                        <p class="event-price">💰 ₦${e.ticketPrice || 0}</p>
                        <p class="event-status">Available: ${e.ticketsAvailable || 'N/A'}</p>
                        <div class="event-buttons">
                            <button class="btn btn-small btn-primary" onclick="buyTicket('${e._id}')">Buy Ticket</button>
                            <button class="btn btn-small btn-outline" onclick="shareEvent('${e._id}')">Share</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Failed to load events:', error);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize state
    themeManager = new ThemeManager();
    appState = new AppState();
    
    // Initialize theme
    themeManager.init();
    
    // Load events on startup
    loadEvents();
    
    // Navigation
    document.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', e => {
        e.preventDefault();
        navigateTo(l.getAttribute('data-section'));
    }));
    
    // Modal backdrop close
    document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', e => {
        if (e.target === m) closeModal(m.id);
    }));
    
    // Auth form - REAL API CALL
    document.getElementById('authForm')?.addEventListener('submit', async e => {
        e.preventDefault();
        const emailInput = document.getElementById('authEmail');
        const passwordInput = document.getElementById('authPassword');
        const nameInput = document.getElementById('authName');
        
        if (!emailInput?.value || !passwordInput?.value) {
            showToast('Email and password required');
            return;
        }
        
        try {
            const isSignUp = appState.authMode === 'signup';
            
            if (isSignUp && !nameInput?.value) {
                showToast('Full name required for signup');
                return;
            }
            
            const endpoint = isSignUp ? '/auth/signup' : '/auth/signin';
            const payload = {
                email: emailInput.value,
                password: passwordInput.value,
                ...(isSignUp && { 
                    firstName: nameInput.value.split(' ')[0] || 'User',
                    lastName: nameInput.value.split(' ').slice(1).join(' ') || '',
                    phone: '0000000000',
                    role: 'eventee'
                })
            };
            
            const result = await apiCall(endpoint, {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            
            if (result.status === 'success' && result.data?.token) {
                localStorage.setItem('authToken', result.data.token);
                appState.setUser(result.data.user);
                closeModal('authModal');
                document.getElementById('authForm').reset();
                showToast(result.message || (isSignUp ? '✅ Signed up successfully!' : '✅ Logged in successfully!'));
                appState.addNotif({ 
                    title: isSignUp ? 'Account Created!' : 'Logged In!', 
                    msg: `Welcome, ${result.data.user.firstName}!` 
                });
                navigateTo('events');
            } else {
                showToast(result.message || 'Authentication failed');
            }
        } catch (error) {
            console.error('Auth error:', error);
        }
    });
    
    // Notifications
    document.getElementById('notificationBtn')?.addEventListener('click', () => {
        document.getElementById('notificationsPanel')?.classList.add('open');
    });
    
    document.getElementById('closeNotificationsBtn')?.addEventListener('click', closeNotifications);
    
    // Event form - API CALL
    document.getElementById('eventForm')?.addEventListener('submit', async e => {
        e.preventDefault();
        if (!appState?.user) {
            showToast('❌ Sign in first');
            showAuthModal('signin');
            return;
        }
        
        try {
            const titleInput = document.getElementById('eventTitle');
            const descInput = document.getElementById('eventDesc');
            const priceInput = document.getElementById('eventPrice');
            
            if (!titleInput?.value) {
                showToast('❌ Event title required');
                return;
            }
            
            const eventData = {
                title: titleInput.value,
                description: descInput?.value || 'Exciting event coming up!',
                eventType: 'meetup',
                category: 'other',
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 86400000).toISOString(),
                location: {
                    address: '123 Main St',
                    city: 'Lagos',
                    state: 'State',
                    zipCode: '00000',
                    country: 'Nigeria'
                },
                capacity: 100,
                ticketPrice: parseFloat(priceInput?.value) || 10
            };
            
            const result = await apiCall('/events', {
                method: 'POST',
                body: JSON.stringify(eventData)
            });
            
            if (result.status === 'success') {
                showToast(`✅ Event "${titleInput.value}" created! 🎉`);
                closeModal('eventModal');
                e.target.reset();
                await loadEvents(); // Reload events list
                appState.addNotif({
                    title: 'Event Created!',
                    msg: titleInput.value
                });
            } else {
                showToast(result.message || '❌ Failed to create event');
            }
        } catch (error) {
            console.error('Event creation error:', error);
        }
    });
    
    // Ticket quantity
    document.getElementById('ticketQuantity')?.addEventListener('change', e => {
        const priceEl = document.getElementById('paymentPrice');
        const totalEl = document.getElementById('paymentTotal');
        if (priceEl && totalEl) {
            const price = parseFloat(priceEl.textContent) || 10;
            totalEl.textContent = (price * parseInt(e.target.value)).toFixed(2);
        }
    });
    
    // Payment form - API CALL
    document.getElementById('paymentForm')?.addEventListener('submit', async e => {
        e.preventDefault();
        if (!appState?.user) {
            showToast('❌ Sign in first');
            showAuthModal('signin');
            return;
        }
        
        try {
            const quantityInput = document.getElementById('ticketQuantity');
            const emailInput = document.getElementById('paymentEmail') || document.getElementById('authEmail');
            const quantity = parseInt(quantityInput?.value) || 1;
            const totalEl = document.getElementById('paymentTotal');
            const amount = parseFloat(totalEl?.textContent) || 0;
            
            if (amount <= 0) {
                showToast('❌ Invalid payment amount');
                return;
            }
            
            const paymentData = {
                email: emailInput?.value || appState.user.email,
                amount: Math.round(amount * 100),
                eventId: 'event-id-placeholder',
                ticketId: 'ticket-id-placeholder'
            };
            
            const result = await apiCall('/payments/initialize', {
                method: 'POST',
                body: JSON.stringify(paymentData)
            });
            
            if (result.status === 'success') {
                showToast('✅ Ticket purchased! 🎫');
                closeModal('paymentModal');
                document.getElementById('paymentForm').reset();
                appState.addNotif({ 
                    title: 'Payment Confirmed!', 
                    msg: 'Tickets sent to email' 
                });
            } else {
                showToast(result.message || '❌ Payment failed');
            }
        } catch (error) {
            console.error('Payment error:', error);
        }
    });
    
    // Search
    document.getElementById('eventSearch')?.addEventListener('input', e => {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll('.event-card').forEach(card => {
            const h3 = card.querySelector('h3');
            const text = h3 ? h3.textContent.toLowerCase() : '';
            card.style.display = text.includes(term) ? '' : 'none';
        });
    });
    
    // Filters
    document.getElementById('categoryFilter')?.addEventListener('change', e => {
        showToast(`Filtering: ${e.target.value || 'all'}`);
    });
    
    document.getElementById('dateFilter')?.addEventListener('change', e => {
        if (e.target.value) showToast(`Events on ${e.target.value}`);
    });
    
    // Navbar scroll
    let lastScrollTop = 0;
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        navbar.style.transition = 'transform 0.3s ease';
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            navbar.style.transform = scrollTop > lastScrollTop && scrollTop > 100 ? 'translateY(-100%)' : 'translateY(0)';
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        });
    }
    
    // Welcome notification
    setTimeout(() => {
        appState.addNotif({ 
            title: 'Welcome to Eventful! 👋', 
            msg: 'Explore events & buy tickets.' 
        });
    }, 500);
    
    // Real-time updates: Refresh events every 5 seconds
    setInterval(loadEvents, 5000);
    
    // Button mousedown prevention
    document.querySelectorAll('.btn').forEach(b => {
        b.addEventListener('mousedown', e => e.preventDefault());
    });
    
    console.log('✅ Eventful App Ready | Theme:', themeManager.theme);
    console.log('✅ API Base URL:', window.location.origin + '/api');
    console.log('✅ User Auth:', appState.user ? 'Logged in' : 'Not logged in');
});