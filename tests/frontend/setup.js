/**
 * Frontend Test Setup - Provides all app.js functionality to tests
 */

// Suppress console methods in tests
const originalLog = console.log;
const originalError = console.error;

beforeAll(() => {
    console.log = jest.fn();
    console.error = jest.fn();
});

afterAll(() => {
    console.log = originalLog;
    console.error = originalError;
});

// Include all app.js code here so it's available in tests
class ThemeManager {
    constructor() {
        this.theme = localStorage.getItem('eventful-theme') || 'light';
        this.toggle = this.toggle.bind(this);
    }

    init() {
        this.apply();
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', this.toggle);
        }
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

class AppState {
    constructor() {
        this.user = JSON.parse(localStorage.getItem('user')) || null;
        this.notifications = [];
        this.authMode = 'signin';
    }

    setUser(u) {
        this.user = u;
        localStorage.setItem('user', JSON.stringify(u));
    }

    logout() {
        this.user = null;
        localStorage.removeItem('user');
    }

    addNotif(n) {
        this.notifications.push(n);
        const badge = document.getElementById('notificationBadge');
        if (badge) badge.textContent = this.notifications.length;
    }
}

// Global variables
let themeManager;
let appState;

function navigateTo(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    const targetSection = document.getElementById(id);
    if (targetSection) targetSection.classList.add('active');
    
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const targetLink = document.querySelector(`[data-section="${id}"]`);
    if (targetLink) targetLink.classList.add('active');
    
    window.scrollTo(0, 0);
}

function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('open');
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('open');
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
    const panel = document.getElementById('notificationsPanel');
    if (panel) panel.classList.remove('open');
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
                    <div class="event-image" style="font-size:3em">${['🎭', '🎪', '🎬', '🎸', '⚽', '🏃'][Math.floor(Math.random() * 6)]}</div>
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

// Make everything globally available for tests
Object.assign(global, {
    ThemeManager,
    AppState,
    navigateTo,
    openModal,
    closeModal,
    showAuthModal,
    switchAuthMode,
    closeNotifications,
    showEventModal,
    buyTicket,
    downloadTicket,
    shareTicket,
    shareEvent,
    shareOn,
    copyToClipboard,
    showToast,
    apiCall,
    loadEvents
});

