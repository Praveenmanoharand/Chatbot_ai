/* =====================================================
   Aura AI - Unified Settings Logic
   ===================================================== */

'use strict';

const STORAGE_KEYS = {
    SETTINGS: 'nova_settings',
    HISTORY: 'nova_history'
};

const DOM = {
    modelSelect: document.getElementById('modelSelect'),
    tempRange: document.getElementById('tempRange'),
    themeToggle: document.getElementById('themeToggle'),
    compactToggle: document.getElementById('compactToggle'),
    soundToggle: document.getElementById('soundToggle'),
    autosaveToggle: document.getElementById('autosaveToggle'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),
    exportDataBtn: document.getElementById('exportDataBtn'),
    toastContainer: document.getElementById('toastContainer'),
    autoSendVoiceToggle: document.getElementById('autoSendVoiceToggle'),
    ttsToggle: document.getElementById('ttsToggle'),
    voiceLangSelect: document.getElementById('voiceLangSelect')
};

let settings = {
    darkMode: true,
    compactMode: false,
    fontSize: 'medium',
    soundEffects: true,
    autoScroll: true,
    responseLength: 'medium',
    saveHistory: true,
    analytics: false,
    aiModel: 'power-bt-4',
    aiTemp: 70,
    autoSendVoice: false,
    readResponses: false,
    voiceLanguage: 'en-US'
};

// =====================================================
// INITIALIZATION
// =====================================================

function init() {
    loadSettings();
    setupEventListeners();
    applySettings();
}

function loadSettings() {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
        try {
            settings = { ...settings, ...JSON.parse(saved) };
        } catch (e) {
            console.error('Error parsing settings:', e);
        }
    }
    
    // UI Sync
    if (DOM.modelSelect) DOM.modelSelect.value = settings.aiModel;
    if (DOM.tempRange) DOM.tempRange.value = settings.aiTemp;
    if (DOM.themeToggle) DOM.themeToggle.checked = settings.darkMode;
    if (DOM.compactToggle) DOM.compactToggle.checked = settings.compactMode;
    if (DOM.soundToggle) DOM.soundToggle.checked = settings.soundEffects;
    if (DOM.autosaveToggle) DOM.autosaveToggle.checked = settings.saveHistory;
    if (DOM.autoSendVoiceToggle) DOM.autoSendVoiceToggle.checked = settings.autoSendVoice;
    if (DOM.ttsToggle) DOM.ttsToggle.checked = settings.readResponses;
    if (DOM.voiceLangSelect) DOM.voiceLangSelect.value = settings.voiceLanguage;
}

function saveSettings() {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

function applySettings() {
    document.documentElement.setAttribute('data-theme', settings.darkMode ? 'dark' : 'light');
    document.documentElement.setAttribute('data-font-size', settings.fontSize);
    document.documentElement.classList.toggle('compact', settings.compactMode);
}

function setupEventListeners() {
    // AI Settings
    DOM.modelSelect?.addEventListener('change', (e) => {
        settings.aiModel = e.target.value;
        saveSettings();
        showToast('success', 'Setting Saved', 'AI Model updated successfully.');
    });

    DOM.tempRange?.addEventListener('input', (e) => {
        settings.aiTemp = parseInt(e.target.value);
    });

    DOM.tempRange?.addEventListener('change', () => {
        saveSettings();
        showToast('success', 'Setting Saved', 'Creativity level updated.');
    });

    // Theme Toggle
    DOM.themeToggle?.addEventListener('change', (e) => {
        settings.darkMode = e.target.checked;
        saveSettings();
        applySettings();
        showToast('info', 'Theme Updated', `Switched to ${settings.darkMode ? 'dark' : 'light'} mode.`);
    });

    // UI Toggles
    DOM.compactToggle?.addEventListener('change', (e) => {
        settings.compactMode = e.target.checked;
        saveSettings();
        applySettings();
        showToast('info', 'UI Updated', 'Compact mode preference saved.');
    });

    DOM.soundToggle?.addEventListener('change', (e) => {
        settings.soundEffects = e.target.checked;
        saveSettings();
        if (settings.soundEffects) playSound('success');
        showToast('info', 'Sound Settings', `Sound effects ${settings.soundEffects ? 'enabled' : 'disabled'}.`);
    });

    DOM.autosaveToggle?.addEventListener('change', (e) => {
        settings.saveHistory = e.target.checked;
        saveSettings();
        showToast('info', 'Privacy Setting', 'Auto-save preference updated.');
    });

    // Voice & Speech Actions
    DOM.autoSendVoiceToggle?.addEventListener('change', (e) => {
        settings.autoSendVoice = e.target.checked;
        saveSettings();
        showToast('info', 'Voice Settings', `Auto-send speech ${settings.autoSendVoice ? 'enabled' : 'disabled'}.`);
    });

    DOM.ttsToggle?.addEventListener('change', (e) => {
        settings.readResponses = e.target.checked;
        saveSettings();
        showToast('info', 'Voice Settings', `Read responses aloud ${settings.readResponses ? 'enabled' : 'disabled'}.`);
    });

    DOM.voiceLangSelect?.addEventListener('change', (e) => {
        settings.voiceLanguage = e.target.value;
        saveSettings();
        showToast('info', 'Voice Settings', 'Voice recognition language updated.');
    });

    // Data Actions
    DOM.clearHistoryBtn?.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all chat history? This cannot be undone.')) {
            localStorage.removeItem(STORAGE_KEYS.HISTORY);
            showToast('success', 'Data Cleared', 'All local history has been wiped.');
        }
    });

    DOM.exportDataBtn?.addEventListener('click', () => {
        showToast('info', 'Exporting...', 'Preparing your account data for download.');
        setTimeout(() => {
            showToast('success', 'Ready', 'Data export is ready for download.');
        }, 1500);
    });
}

// =====================================================
// UTILITIES
// =====================================================

function playSound(type = 'success') {
    if (!settings.soundEffects) return;
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(type === 'success' ? 880 : 440, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.15);
    } catch (e) { console.warn(e); }
}

function showToast(type, title, message) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
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

init();
