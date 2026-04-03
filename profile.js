/* =====================================================
   Aura AI - Profile Page Logic
   ===================================================== */

'use strict';

const CONFIG = {
    STORAGE_KEYS: {
        SETTINGS: 'nova_settings',
        STATS: 'nova_stats'
    }
};

const DOM = {
    // Layout
    menuToggleBtn: document.getElementById('menuToggleBtn'),
    sidebar: document.getElementById('sidebar'),
    sidebarOverlay: document.getElementById('sidebarOverlay'),
    closeSidebarBtn: document.getElementById('closeSidebarBtn'),

    // Profile Data
    userNameDisplay: document.getElementById('userNameDisplay'),
    userEmailDisplay: document.getElementById('userEmailDisplay'),
    totalMessagesStat: document.getElementById('totalMessagesStat'),
    totalChatsStat: document.getElementById('totalChatsStat'),
    daysActiveStat: document.getElementById('daysActiveStat'),

    // Settings
    darkModeToggle: document.getElementById('darkModeToggle'),
    compactModeToggle: document.getElementById('compactModeToggle'),
    
    // Actions
    editProfileBtn: document.getElementById('editProfileBtn'),
    signOutBtn: document.getElementById('signOutBtn'),
    toastContainer: document.getElementById('toastContainer')
};

let state = {
    settings: {
        darkMode: true,
        compactMode: false
    },
    stats: {
        totalMessages: 0,
        totalChats: 0,
        lastActiveDate: null
    }
};

// =====================================================
// INITIALIZATION
// =====================================================

function init() {
    loadData();
    setupEventListeners();
}

function loadData() {
    // Load Settings
    const savedSettings = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.SETTINGS) || '{}');
    state.settings = { ...state.settings, ...savedSettings };

    // Load Profile from localStorage cache
    const savedProfile = JSON.parse(localStorage.getItem('nova_profile') || '{}');
    state.profile = savedProfile;

    applySettings();
    updateUI();
}

function applySettings() {
    // Theme
    document.documentElement.setAttribute('data-theme', state.settings.darkMode ? 'dark' : 'light');
    DOM.darkModeToggle.checked = state.settings.darkMode;

    // Compact Mode
    document.body.classList.toggle('compact-mode', state.settings.compactMode);
    DOM.compactModeToggle.checked = state.settings.compactMode;
}

function updateUI() {
    if (state.profile) {
        DOM.userNameDisplay.textContent = state.profile.name || 'Aura User';
        DOM.userEmailDisplay.textContent = state.profile.email || '';
        
        if (state.profile.stats) {
            if (DOM.totalMessagesStat) DOM.totalMessagesStat.textContent = state.profile.stats.total_messages || 0;
            if (DOM.totalChatsStat) DOM.totalChatsStat.textContent = state.profile.stats.total_chats || 0;
            if (DOM.daysActiveStat) DOM.daysActiveStat.textContent = state.profile.stats.member_since || 'Mar 2024';
        }
    }
}

// =====================================================
// EVENT LISTENERS
// =====================================================

function setupEventListeners() {
    // Sidebar Toggles
    DOM.menuToggleBtn.addEventListener('click', () => toggleSidebar(true));
    DOM.closeSidebarBtn.addEventListener('click', () => toggleSidebar(false));
    DOM.sidebarOverlay.addEventListener('click', () => toggleSidebar(false));

    // Settings Toggles
    DOM.darkModeToggle.addEventListener('change', (e) => {
        state.settings.darkMode = e.target.checked;
        saveSettings();
        applySettings();
        showToast('info', 'Theme Updated', `Switched to ${state.settings.darkMode ? 'Dark' : 'Light'} mode.`);
    });

    // Compact Mode Toggle
    DOM.compactModeToggle.addEventListener('change', (e) => {
        state.settings.compactMode = e.target.checked;
        saveSettings();
        applySettings();
        showToast('info', 'Layout Updated', `Compact mode ${state.settings.compactMode ? 'enabled' : 'disabled'}.`);
    });

    // Profile Actions
    DOM.editProfileBtn.addEventListener('click', () => {
        const newName = prompt("Enter your new name:", DOM.userNameDisplay.textContent);
        if (newName) {
            DOM.userNameDisplay.textContent = newName;
            showToast('success', 'Profile Updated', 'Your name has been updated locally.');
        }
    });

    DOM.signOutBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to sign out?")) {
            showToast('info', 'Signed Out', 'This is a demo, so no actual sign-out occurred.');
        }
    });
}

// =====================================================
// UTILITIES
// =====================================================

function toggleSidebar(open) {
    DOM.sidebar.classList.toggle('open', open);
    DOM.sidebarOverlay.classList.toggle('active', open);
}

function saveSettings() {
    // Load current full settings object
    const currentSettings = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.SETTINGS) || '{}');
    // Merge only the keys this page manages
    const updatedSettings = { ...currentSettings, ...state.settings };
    localStorage.setItem(CONFIG.STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
}

function showToast(type, title, message) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <div class="toast-details">
                <p class="toast-title">${title}</p>
                <p class="toast-message">${message}</p>
            </div>
        </div>
    `;
    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Start
init();
