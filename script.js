
/* =====================================================
   Aura AI - Premium Chatbot Interface
   JavaScript Logic
   Author: Expert Frontend Developer
   Version: 2.4.1
   ===================================================== */

'use strict';

// =====================================================
// CONFIGURATION & CONSTANTS
// =====================================================

const CONFIG = {
    API_ENDPOINT: '/api/chat',
    MAX_MESSAGE_LENGTH: 4000,
    TYPING_DELAY_MIN: 800,
    TYPING_DELAY_MAX: 2000,
    TOAST_DURATION: 4000,
    SCROLL_THRESHOLD: 200,
    DEBOUNCE_DELAY: 300,
    STORAGE_KEYS: {
        THEME: 'nova_theme',
        HISTORY: 'nova_history',
        SETTINGS: 'nova_settings',
        STATS: 'nova_stats',
        PROFILE: 'nova_profile'
    }
};

const EMOJIS = {
    smileys: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯'],
    gestures: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏'],
    animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊'],
    food: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🫓', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🍝'],
    objects: ['⌚', '📱', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '💰', '💳', '💎', '⚖️', '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🔩', '⚙️'],
    symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '💯', '💢', '💥', '💫', '💦', '💨', '🕳️', '💣', '💬', '👁️‍🗨️', '🗨️', '🗯️', '💭', '💤', '👋', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '🟤', '⚫', '⚪', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '🟫', '⬛', '⬜', '◼️', '◻️', '◾', '◽', '▪️', '▫️', '🔶', '🔷', '🔸', '🔹', '🔺', '🔻', '💠', '🔘', '🔳', '🔲']
};

// =====================================================
// STATE MANAGEMENT
// =====================================================

const state = {
    messages: [],
    currentChatId: null,
    chatHistory: [],
    isLoading: false,
    isTyping: false,
    sidebarOpen: false,
    settings: {
        darkMode: true,
        compactMode: false,
        fontSize: 'medium',
        soundEffects: true,
        autoScroll: true,
        responseLength: 'medium',
        saveHistory: true,
        analytics: false,
        aiModel: 'power-bt-4', // Synchronizing with settings.html
        aiTemp: 70
    },
    stats: {
        messagesToday: 0,
        totalMessages: 0,
        totalChats: 0,
        lastActiveDate: null
    },
    profile: {
        name: 'Guest User',
        email: 'guest@example.com',
        phone: '',
        location: '',
        bio: ''
    },
    unreadCount: 0,
    isScrolledToBottom: true,
    attachedFiles: [],
    tempAvatar: null,
    isAborted: false,
    abortController: null,
    currentEmojiCategory: 'smileys',
    pendingFileContext: '',
    isPaused: false,
    pendingFiles: []
};

// =====================================================
// DOM ELEMENTS CACHE
// =====================================================

const DOM = {
    // Sidebar
    sidebar: document.getElementById('sidebar'),
    sidebarOverlay: document.getElementById('sidebarOverlay'),
    menuToggleBtn: document.getElementById('menuToggleBtn'),
    closeSidebarBtn: document.getElementById('closeSidebarBtn'),
    newChatBtn: document.getElementById('newChatBtn'),
    searchInput: document.getElementById('searchInput'),
    searchClearBtn: document.getElementById('searchClearBtn'),
    historyList: document.getElementById('historyList'),
    historyEmptyState: document.getElementById('historyEmptyState'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),
    
    // Header
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    headerActions: document.getElementById('headerActions'),
    botStatus: document.getElementById('botStatus'),
    statusIndicator: document.getElementById('statusIndicator'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    themeIcon: document.getElementById('themeIcon'),
    shareBtn: document.getElementById('shareBtn'),
    archiveBtn: document.getElementById('archiveBtn'),
    pinBtn: document.getElementById('pinBtn'),
    notificationsBtn: document.getElementById('notificationsBtn'),
    notificationBadge: document.getElementById('notificationBadge'),
    mobileProfileBtn: document.getElementById('mobileProfileBtn'),
    mobileProfileAvatar: document.getElementById('mobileProfileAvatar'),
    mobileProfileIcon: document.getElementById('mobileProfileIcon'),
    
    // Messages
    messagesContainer: document.getElementById('messagesContainer'),
    messagesArea: document.getElementById('messagesArea'),
    welcomeScreen: document.getElementById('welcomeScreen'),
    typingIndicator: document.getElementById('typingIndicator'),
    scrollToBottomBtn: document.getElementById('scrollToBottomBtn'),
    unreadCount: document.getElementById('unreadCount'),
    welcomeTitle: document.getElementById('welcomeTitle'),
    
    // Input
    messageInput: document.getElementById('messageInput'),
    sendBtn: document.getElementById('sendBtn'),
    stopBtn: document.getElementById('stopBtn'),
    characterCount: document.getElementById('characterCount'),
    attachFileBtn: document.getElementById('attachFileBtn'),
    emojiBtn: document.getElementById('emojiBtn'),
    voiceInputBtn: document.getElementById('voiceInputBtn'),
    emojiPicker: document.getElementById('emojiPicker'),
    emojiGrid: document.getElementById('emojiGrid'),
    emojiSearch: document.getElementById('emojiSearch'),
    pauseBtn: document.getElementById('pauseBtn'),
    
    // Modals
    settingsModal: document.getElementById('settingsModal'),
    profileModal: document.getElementById('profileModal'),
    fileUploadModal: document.getElementById('fileUploadModal'),
    confirmModal: document.getElementById('confirmModal'),
    
    // Modal buttons
    settingsBtn: document.getElementById('settingsBtn'),
    closeSettingsModal: document.getElementById('closeSettingsModal'),
    saveSettingsBtn: document.getElementById('saveSettingsBtn'),
    resetSettingsBtn: document.getElementById('resetSettingsBtn'),
    
    profileBtn: document.getElementById('profileBtn'),
    closeProfileModal: document.getElementById('closeProfileModal'),
    saveProfileBtn: document.getElementById('saveProfileBtn'),
    signOutBtn: document.getElementById('signOutBtn'),
    profileNameInput: document.getElementById('profileName'),
    profileEmailInput: document.getElementById('profileEmail'),
    profilePhoneInput: document.getElementById('profilePhone'),
    profileLocationInput: document.getElementById('profileLocation'),
    profileBioInput: document.getElementById('profileBio'),
    profileIdInput: document.getElementById('profileId'),
    
    closeFileUploadModal: document.getElementById('closeFileUploadModal'),
    fileUploadArea: document.getElementById('fileUploadArea'),
    fileInput: document.getElementById('fileInput'),
    uploadedFiles: document.getElementById('uploadedFiles'),
    confirmUploadBtn: document.getElementById('confirmUploadBtn'),
    cancelUploadBtn: document.getElementById('cancelUploadBtn'),
    
    closeConfirmModal: document.getElementById('closeConfirmModal'),
    confirmTitle: document.getElementById('confirmTitle'),
    confirmMessage: document.getElementById('confirmMessage'),
    confirmCancelBtn: document.getElementById('confirmCancelBtn'),
    confirmOkBtn: document.getElementById('confirmOkBtn'),
    
    // Settings inputs
    darkModeToggle: document.getElementById('darkModeToggle'),
    compactModeToggle: document.getElementById('compactModeToggle'),
    fontSizeSelect: document.getElementById('fontSizeSelect'),
    soundToggle: document.getElementById('soundToggle'),
    autoScrollToggle: document.getElementById('autoScrollToggle'),
    responseLengthSelect: document.getElementById('responseLengthSelect'),
    saveHistoryToggle: document.getElementById('saveHistoryToggle'),
    analyticsToggle: document.getElementById('analyticsToggle'),
    
    // Profile
    profileName: document.getElementById('profileName'),
    profileEmail: document.getElementById('profileEmail'),
    totalMessagesEl: document.getElementById('totalMessages'),
    totalChatsEl: document.getElementById('totalChats'),
    memberSinceEl: document.getElementById('memberSince'),
    
    // Emoji Picker
    emojiPicker: document.getElementById('emojiPicker'),
    emojiBtn: document.getElementById('emojiBtn'),
    emojiGrid: document.getElementById('emojiGrid'),
    emojiSearch: document.getElementById('emojiSearch'),
    emojiCategories: document.querySelectorAll('.emoji-category'),
    
    // Toast
    toastContainer: document.getElementById('toastContainer'),

    // Profile Avatar elements
    profileAvatarImg: document.getElementById('profileAvatarImg'),
    profileAvatarIcon: document.getElementById('profileAvatarIcon'),
    changeAvatarBtn: document.getElementById('changeAvatarBtn'),
    avatarInput: document.getElementById('avatarInput'),
    sidebarProfileAvatar: document.getElementById('sidebarProfileAvatar'),
    sidebarProfileIcon: document.getElementById('sidebarProfileIcon'),
    filePreviewContainer: document.getElementById('filePreviewContainer')
};

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Play a simple sound effect using Web Audio API
 */
function playSound(type = 'success') {
    if (!state.settings.soundEffects) return;

    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        if (type === 'success') {
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); 
            oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.1);
        } else if (type === 'message') {
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
            oscillator.frequency.exponentialRampToValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
            gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.15);
        } else if (type === 'error') {
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(220, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(110, audioCtx.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.2);
        }
    } catch (e) {
        console.warn('AudioContext not supported or blocked:', e);
    }
}

/**
 * Debounce function to limit execution rate
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function to limit execution rate
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Generate unique ID
 */
function generateId() {
    return `id_${ Date.now() }_${ Math.random().toString(36).substr(2, 9) } `;
}

/**
 * Format timestamp to readable string
 */
function formatTime(date) {
    return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    }).format(date);
}

/**
 * Format date to readable string
 */
function formatDate(date) {
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${ days } days ago`;
    
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric'
    }).format(date);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Parse markdown-like syntax in messages
 */
function parseMessage(text) {
    let parsed = escapeHtml(text);
    
    // Code blocks
    parsed = parsed.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    
    // Inline code
    parsed = parsed.replace(/`([^`]+)`/g, '<code>$1</code>');

// Bold
parsed = parsed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

// Italic
parsed = parsed.replace(/\*([^*]+)\*/g, '<em>$1</em>');

// Links
parsed = parsed.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');

// Line breaks
parsed = parsed.replace(/\n/g, '<br>');

return parsed;
}

/**
 * Get random number between min and max
 */
function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// =====================================================
// STORAGE FUNCTIONS
// =====================================================

/**
 * Save data to localStorage
 */
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving to storage:', error);
    }
}

/**
 * Load data from localStorage
 */
function loadFromStorage(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error('Error loading from storage:', error);
        return defaultValue;
    }
}

/**
 * Initialize state from storage/backend
 */
async function initializeFromStorage() {
    // Load settings from localStorage (UI preferences stay local for speed)
    const savedSettings = loadFromStorage(CONFIG.STORAGE_KEYS.SETTINGS, {});
    state.settings = { ...state.settings, ...savedSettings };

    // Apply saved theme immediately (Sync with head script)
    document.documentElement.setAttribute('data-theme', state.settings.darkMode ? 'dark' : 'light');
    if (DOM.themeIcon) DOM.themeIcon.className = state.settings.darkMode ? 'fas fa-moon' : 'fas fa-sun';

    // Load profile from localStorage (initial)
    const savedProfile = loadFromStorage(CONFIG.STORAGE_KEYS.PROFILE, {});
    state.profile = { ...state.profile, ...savedProfile };

    // If logged in, sync with backend
    if (state.profile.user_id) {
        await fetchConversations();
        await fetchNotifications();
    } else {
        // Fallback or redirect if needed
        state.chatHistory = loadFromStorage(CONFIG.STORAGE_KEYS.HISTORY, []);
    }

    // Load stats
    const savedStats = loadFromStorage(CONFIG.STORAGE_KEYS.STATS, {});
    state.stats = { ...state.stats, ...savedStats };

    // Personalize welcome title
    if (state.profile.name && DOM.welcomeTitle) {
        DOM.welcomeTitle.textContent = `Welcome, ${state.profile.name.split(' ')[0]}`;
    }
}

/**
 * Fetch conversations from backend
 */
async function fetchConversations() {
    try {
        const response = await fetch(`/api/conversations?user_id=${state.profile.user_id}`);
        if (response.ok) {
            const history = await response.json();
            // Map backend _id to frontend id for compatibility
            state.chatHistory = history.map(c => ({
                id: c._id,
                title: c.title,
                timestamp: c.updated_at,
                messages: c.messages,
                is_pinned: c.is_pinned,
                is_archived: c.is_archived
            }));
            renderHistory();
        }
    } catch (e) {
        console.error('Failed to fetch conversations:', e);
    }
}
/**
 * Fetch notifications from backend
 */
async function fetchNotifications() {
    if (!state.profile.user_id) return;
    try {
        const response = await fetch(`/api/notifications?user_id=${state.profile.user_id}`);
        if (response.ok) {
            const data = await response.json();
            state.unreadCount = data.length;
            updateUnreadCount();
        }
    } catch (e) {
        console.error('Failed to fetch notifications:', e);
    }
}

/**
 * Save settings to storage
 */
function saveSettings() {
    saveToStorage(CONFIG.STORAGE_KEYS.SETTINGS, state.settings);
}

/**
 * Save chat history to storage
 */
function saveHistory() {
    if (state.settings.saveHistory) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.HISTORY, JSON.stringify(state.chatHistory));
    } else {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.HISTORY);
    }
}

/**
 * Save stats to storage
 */
function saveStats() {
    saveToStorage(CONFIG.STORAGE_KEYS.STATS, state.stats);
}

/**
 * Save profile to storage
 */
function saveProfile() {
    saveToStorage(CONFIG.STORAGE_KEYS.PROFILE, state.profile);
}

/**
 * Load profile data into UI
 */
function loadProfileToUI() {
    if (!DOM.profileNameInput) return;
    DOM.profileNameInput.value = state.profile.name || '';
    DOM.profileEmailInput.value = state.profile.email || '';
    DOM.profilePhoneInput.value = state.profile.phone || '';
    DOM.profileLocationInput.value = state.profile.location || '';
    DOM.profileBioInput.value = state.profile.bio || '';
    
    const userAvatar = state.profile.avatar || state.profile.avatar_url;
    if (userAvatar) {
        DOM.profileAvatarImg.src = userAvatar;
        DOM.profileAvatarImg.style.display = 'block';
        DOM.profileAvatarIcon.style.display = 'none';
        
        // Also update sidebar avatar
        if (DOM.sidebarProfileAvatar) {
            DOM.sidebarProfileAvatar.src = userAvatar;
            DOM.sidebarProfileAvatar.style.display = 'block';
            DOM.sidebarProfileIcon.style.display = 'none';
        }
        
        // Update Mobile Top Header Avatar
        if (DOM.mobileProfileAvatar) {
            DOM.mobileProfileAvatar.src = userAvatar;
            DOM.mobileProfileAvatar.style.display = 'block';
            DOM.mobileProfileIcon.style.display = 'none';
        }
        
        state.tempAvatar = userAvatar;
    } else {
        DOM.profileAvatarImg.style.display = 'none';
        DOM.profileAvatarIcon.style.display = 'block';
        
        if (DOM.sidebarProfileAvatar) {
            DOM.sidebarProfileAvatar.style.display = 'none';
            DOM.sidebarProfileIcon.style.display = 'block';
        }

        if (DOM.mobileProfileAvatar) {
            DOM.mobileProfileAvatar.style.display = 'none';
            DOM.mobileProfileIcon.style.display = 'block';
        }
        
        state.tempAvatar = null;
    }
    if (DOM.profileIdInput) DOM.profileIdInput.value = state.profile.user_id || 'Not available';
}

/**
 * Save profile data from UI
 */
async function saveProfileFromUI() {
    if (!DOM.profileNameInput) return;
    
    const updatedProfile = {
        user_id: state.profile.user_id,
        name: DOM.profileNameInput.value,
        phone: DOM.profilePhoneInput.value,
        location: DOM.profileLocationInput.value,
        bio: DOM.profileBioInput.value
    };

    try {
        const response = await fetch('/api/profile/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedProfile)
        });

        if (response.ok) {
            state.profile = { ...state.profile, ...updatedProfile };
            saveProfile(); // Still save to localStorage for quick boot
            
            // If avatar changed, it's already uploaded via handleAvatarUpload
            
            showToast('success', 'Profile Saved', 'Your profile details have been synchronized.');
            closeModal('profile');
        }
    } catch (e) {
        showToast('error', 'Update Error', 'Could not save profile to server.');
    }
}

// =====================================================
// SIDEBAR FUNCTIONS
// =====================================================

/**
 * Toggle sidebar visibility
 */
function toggleSidebar(show = null) {
    const shouldOpen = show !== null ? show : !state.sidebarOpen;
    state.sidebarOpen = shouldOpen;

    DOM.sidebar.classList.toggle('open', shouldOpen);
    DOM.sidebarOverlay.classList.toggle('active', shouldOpen);

    // Toggle body scroll on mobile
    if (window.innerWidth <= 768) {
        document.body.style.overflow = shouldOpen ? 'hidden' : '';
    }
}

/**
 * Create history item element
 */
function createHistoryItem(chat) {
    const item = document.createElement('div');
    item.className = `history-item ${chat.id === state.currentChatId ? 'active' : ''}`;
    item.dataset.chatId = chat.id;

    item.innerHTML = `
        <div class="history-item-icon">
            <i class="fas ${chat.is_pinned ? 'fa-thumbtack' : 'fa-comment-alt'}"></i>
        </div>
        <div class="history-item-content">
            <div class="history-item-title">${escapeHtml(chat.title)}</div>
        </div>
        <span class="history-item-time">${formatDate(new Date(chat.timestamp))}</span>
        <div class="history-item-actions">
            <button class="history-item-rename" aria-label="Rename chat">
                <i class="fas fa-pencil-alt"></i>
            </button>
            <button class="history-item-delete" aria-label="Delete chat">
                <i class="fas fa-trash-alt"></i>
            </button>
        </div>
    `;

    // Click to load chat
    item.addEventListener('click', (e) => {
        if (!e.target.closest('.history-item-actions')) {
            loadChat(chat.id);
        }
    });

    // Rename button
    const renameBtn = item.querySelector('.history-item-rename');
    renameBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const titleEl = item.querySelector('.history-item-title');
        const currentTitle = titleEl.textContent;
        
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'history-item-input';
        input.value = currentTitle;
        
        titleEl.replaceWith(input);
        input.focus();
        input.select();
        
        const saveRename = async () => {
            const newTitle = input.value.trim();
            if (newTitle && newTitle !== currentTitle) {
                try {
                    const response = await fetch(`/api/conversations/${chat.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ title: newTitle })
                    });
                    if (response.ok) {
                        chat.title = newTitle;
                        input.replaceWith(titleEl);
                        titleEl.textContent = newTitle;
                        showToast('success', 'Chat Renamed', 'Title updated successfully.');
                    }
                } catch (e) {
                    showToast('error', 'Error', 'Failed to rename chat.');
                    input.replaceWith(titleEl);
                }
            } else {
                input.replaceWith(titleEl);
            }
        };

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') saveRename();
            if (e.key === 'Escape') input.replaceWith(titleEl);
        });
        
        input.addEventListener('blur', saveRename);
    });

    // Delete button
    const deleteBtn = item.querySelector('.history-item-delete');
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteChat(chat.id);
    });

    return item;
}

/**
 * Render chat history
 */
function renderHistory() {
    DOM.historyList.innerHTML = '';

    if (state.chatHistory.length === 0) {
        DOM.historyEmptyState.classList.add('visible');
        return;
    }

    DOM.historyEmptyState.classList.remove('visible');

    // Sort: Pinned first, then by date
    const sortedHistory = [...state.chatHistory].sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        return new Date(b.timestamp) - new Date(a.timestamp);
    });

    sortedHistory.forEach(chat => {
        if (!chat.is_archived || state.showArchived) {
            DOM.historyList.appendChild(createHistoryItem(chat));
        }
    });
}

/**
 * Create new chat
 */
async function createNewChat() {
    if (!state.profile.user_id) {
        showToast('error', 'Authentication Required', 'Please log in to save chats.');
        return;
    }

    try {
        const response = await fetch('/api/conversations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: state.profile.user_id, title: 'New Chat' })
        });
        
        if (response.ok) {
            const data = await response.json();
            const chatId = data.conversation_id;
            
            const newChat = {
                id: chatId,
                title: 'New Chat',
                timestamp: new Date().toISOString(),
                messages: [],
                is_pinned: false,
                is_archived: false
            };

            state.chatHistory.unshift(newChat);
            state.currentChatId = chatId;
            state.messages = [];

            renderHistory();
            clearMessages();
            showWelcomeScreen();
            toggleSidebar(false);

            // Update stats
            state.stats.totalChats++;
            saveStats();
            updateStatsUI();
        }
    } catch (e) {
        showToast('error', 'Error', 'Could not create a new conversation.');
    }
}

/**
 * Load existing chat
 */
function loadChat(chatId) {
    const chat = state.chatHistory.find(c => c.id === chatId);
    if (!chat) return;

    state.currentChatId = chatId;
    state.messages = chat.messages || [];

    renderHistory();
    renderMessages();
    toggleSidebar(false);

    if (state.messages.length === 0) {
        showWelcomeScreen();
    } else {
        hideWelcomeScreen();
    }
}

/**
 * Delete chat
 */
function deleteChat(chatId) {
    showConfirmModal(
        'Delete Chat',
        'Are you sure you want to delete this conversation? This action cannot be undone.',
        async () => {
            try {
                const response = await fetch(`/api/conversations/${chatId}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    state.chatHistory = state.chatHistory.filter(c => c.id !== chatId);

                    if (state.currentChatId === chatId) {
                        state.currentChatId = null;
                        state.messages = [];
                        showWelcomeScreen();
                    }

                    renderHistory();
                    showToast('success', 'Chat Deleted', 'The conversation has been removed.');
                }
            } catch (e) {
                showToast('error', 'Delete Error', 'Could not delete the conversation.');
            }
        }
    );
}

/**
 * Clear all history
 */
function clearAllHistory() {
    showConfirmModal(
        'Clear All History',
        'This will delete all your conversations. Are you sure you want to continue?',
        () => {
            state.chatHistory = [];
            state.currentChatId = null;
            state.messages = [];

            saveHistory();
            renderHistory();
            showWelcomeScreen();
            showToast('success', 'History Cleared', 'All conversations have been removed.');
        }
    );
}

/**
 * Search history
 */
function searchHistory(query) {
    const items = DOM.historyList.querySelectorAll('.history-item');
    const normalizedQuery = query.toLowerCase().trim();

    items.forEach(item => {
        const title = item.querySelector('.history-item-title').textContent.toLowerCase();
        const preview = item.querySelector('.history-item-preview').textContent.toLowerCase();
        const matches = title.includes(normalizedQuery) || preview.includes(normalizedQuery);
        item.style.display = matches ? '' : 'none';
    });
}

/**
 * Update current chat in history
 */
async function updateCurrentChat() {
    if (!state.currentChatId) return;

    const chat = state.chatHistory.find(c => c.id === state.currentChatId);
    if (!chat) return;

    // Update title based on first user message if still default
    const firstUserMessage = state.messages.find(m => m.sender === 'user');
    if (firstUserMessage && (chat.title === 'New Chat' || chat.title === '')) {
        const newTitle = firstUserMessage.text.substring(0, 30) + (firstUserMessage.text.length > 30 ? '...' : '');
        chat.title = newTitle;
        
        // Sync title to backend
        try {
            await fetch(`/api/conversations/${state.currentChatId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTitle })
            });
        } catch (e) {
            console.error('Failed to sync title:', e);
        }
    }

    renderHistory();
}

// =====================================================
// MESSAGE FUNCTIONS
// =====================================================

/**
 * Show welcome screen
 */
function showWelcomeScreen() {
    DOM.welcomeScreen.classList.remove('hidden');
    DOM.messagesArea.innerHTML = '';
}

/**
 * Hide welcome screen
 */
function hideWelcomeScreen() {
    DOM.welcomeScreen.classList.add('hidden');
}

/**
 * Clear messages
 */
function clearMessages() {
    DOM.messagesArea.innerHTML = '';
    hideWelcomeScreen();
}

/**
 * Render all messages
 */
function renderMessages() {
    clearMessages();

    if (state.messages.length === 0) {
        showWelcomeScreen();
        return;
    }

    state.messages.forEach(message => {
        appendMessageToDOM(message, false);
    });

    scrollToBottom(false);
}

/**
 * Create message element
 */
function createMessageElement(message) {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${message.sender}`;
    messageEl.dataset.messageId = message.id;

    const avatarIcon = message.sender === 'user' ? 'fa-user' : 'fa-robot';
    const senderName = message.sender === 'user' ? 'You' : 'Aura AI';

    let attachmentsHtml = '';
    if (message.files && message.files.length > 0) {
        attachmentsHtml = `<div class="message-attachments">`;
        message.files.forEach(file => {
            attachmentsHtml += `
                <div class="attachment-bubble" title="${escapeHtml(file.name)}">
                    <i class="fas ${file.icon || 'fa-file-alt'}"></i>
                    <span class="attachment-name">${escapeHtml(file.name)}</span>
                </div>
            `;
        });
        attachmentsHtml += `</div>`;
    }

    messageEl.innerHTML = `
        <div class="message-avatar">
            <i class="fas ${avatarIcon}"></i>
        </div>
        <div class="message-content">
            <span class="message-sender">${senderName}</span>
            ${attachmentsHtml}
            <div class="message-bubble">
                ${message.sender === 'bot' ? parseMessage(message.text) : escapeHtml(message.text)}
            </div>
            <span class="message-time">${formatTime(new Date(message.timestamp))}</span>
            <div class="message-actions">
                <button class="message-action-btn" data-action="copy" title="Copy">
                    <i class="fas fa-copy"></i>
                </button>
                ${message.sender === 'bot' ? `
                    <button class="message-action-btn" data-action="regenerate" title="Regenerate">
                        <i class="fas fa-redo"></i>
                    </button>
                ` : ''}
                <button class="message-action-btn" data-action="delete" title="Delete">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>
    `;

    // Add event listeners for message actions
    const actions = messageEl.querySelectorAll('.message-action-btn');
    actions.forEach(btn => {
        btn.addEventListener('click', () => handleMessageAction(btn.dataset.action, message));
    });

    return messageEl;
}

/**
 * Append message to DOM
 */
function appendMessageToDOM(message, animate = true) {
    hideWelcomeScreen();

    const messageEl = createMessageElement(message);

    if (!animate) {
        messageEl.style.animation = 'none';
    }

    DOM.messagesArea.appendChild(messageEl);

    if (state.settings.autoScroll) {
        scrollToBottom(true);
    }
}

/**
 * Typewriter effect for bot messages
 */
async function typewriterEffect(message) {
    hideWelcomeScreen();

    // Build the message element with an empty bubble
    const messageEl = document.createElement('div');
    messageEl.className = 'message bot';
    messageEl.dataset.messageId = message.id;
    messageEl.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <span class="message-sender">Aura AI</span>
            <div class="message-bubble"><span class="typewriter-text"></span><span class="typewriter-cursor">|</span></div>
            <span class="message-time">${formatTime(new Date(message.timestamp))}</span>
            <div class="message-actions">
                <button class="message-action-btn" data-action="copy" title="Copy">
                    <i class="fas fa-copy"></i>
                </button>
                <button class="message-action-btn" data-action="regenerate" title="Regenerate">
                    <i class="fas fa-redo"></i>
                </button>
                <button class="message-action-btn" data-action="delete" title="Delete">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>
    `;

    // Add action listeners
    messageEl.querySelectorAll('.message-action-btn').forEach(btn => {
        btn.addEventListener('click', () => handleMessageAction(btn.dataset.action, message));
    });

    DOM.messagesArea.appendChild(messageEl);
    scrollToBottom(true);

    const textEl = messageEl.querySelector('.typewriter-text');
    const cursorEl = messageEl.querySelector('.typewriter-cursor');
    const fullText = message.text;
    const CHAR_SPEED = 18; // ms per character

    // Type out character by character
    DOM.pauseBtn.classList.remove('hidden');
    
    for (let i = 0; i <= fullText.length; i++) {
        // Handle pause
        while (state.isPaused) {
            await new Promise(resolve => setTimeout(resolve, 100));
            if (state.isAborted) break;
        }
        
        if (state.isAborted) break;
        textEl.innerHTML = parseMessage(fullText.slice(0, i));
        if (state.settings.autoScroll) scrollToBottom(false);
        await new Promise(resolve => setTimeout(resolve, CHAR_SPEED));
    }

    DOM.pauseBtn.classList.add('hidden');
    // Ensure pause state is reset if finished
    state.isPaused = false;
    updatePauseBtnUI();

    // Remove blinking cursor after typing is done
    cursorEl.remove();
}

/**
 * Handle message actions
 */
function handleMessageAction(action, message) {
    switch (action) {
        case 'copy':
            if (navigator.clipboard) {
                navigator.clipboard.writeText(message.text).then(() => {
                    showToast('success', 'Copied', 'Message copied to clipboard');
                }).catch(() => {
                    copyToClipboardFallback(message.text);
                });
            } else {
                copyToClipboardFallback(message.text);
            }
            break;
        case 'regenerate':
            regenerateResponse(message);
            break;
        case 'delete':
            deleteMessage(message.id);
            break;
    }
}

/**
 * Fallback for copying text to clipboard
 */
function copyToClipboardFallback(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Ensure it's not visible
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);
    
    // Select and copy
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showToast('success', 'Copied', 'Message copied to clipboard');
        } else {
            showToast('error', 'Copy Failed', 'Unable to copy text');
        }
    } catch (err) {
        showToast('error', 'Copy Error', 'An error occurred while copying');
    }
    
    document.body.removeChild(textArea);
}

/**
 * Delete message
 */
function deleteMessage(messageId) {
    const index = state.messages.findIndex(m => m.id === messageId);
    if (index === -1) return;

    state.messages.splice(index, 1);
    updateCurrentChat();

    const messageEl = DOM.messagesArea.querySelector(`[data-message-id="${messageId}"]`);
    if (messageEl) {
        messageEl.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => messageEl.remove(), 300);
    }

    if (state.messages.length === 0) {
        showWelcomeScreen();
    }
}

/**
 * Append message to state and DOM
 */
function appendMessage(sender, text, files = []) {
    const message = {
        id: generateId(),
        sender,
        text,
        files: files,
        timestamp: Date.now()
    };

    state.messages.push(message);
    appendMessageToDOM(message);
    updateCurrentChat();

    // Update stats
    if (sender === 'user') {
        state.stats.messagesToday++;
        state.stats.totalMessages++;
        saveStats();
        updateStatsUI();
    }

    return message;
}

// =====================================================
// TYPING INDICATOR & LOADER
// =====================================================

/**
 * Show typing indicator
 */
function showLoader() {
    state.isTyping = true;
    DOM.typingIndicator.classList.add('visible');
    DOM.statusIndicator.className = 'status-indicator busy';
    DOM.botStatus.textContent = 'Typing...';
    
    // Switch Send -> Stop
    DOM.sendBtn.classList.add('hidden');
    DOM.stopBtn.classList.remove('hidden');
    
    scrollToBottom(true);
}

/**
 * Hide typing indicator
 */
function hideLoader() {
    state.isTyping = false;
    DOM.typingIndicator.classList.remove('visible');
    DOM.statusIndicator.className = 'status-indicator online';
    DOM.botStatus.textContent = 'Online - Ready to help';
    
    // Switch Stop -> Send
    DOM.sendBtn.classList.remove('hidden');
    DOM.stopBtn.classList.add('hidden');
}

// =====================================================
// SCROLL FUNCTIONS
// =====================================================

/**
 * Scroll to bottom of messages
 */
function scrollToBottom(smooth = true) {
    if (smooth) {
        DOM.messagesArea.scrollTo({
            top: DOM.messagesArea.scrollHeight,
            behavior: 'smooth'
        });
    } else {
        DOM.messagesArea.scrollTop = DOM.messagesArea.scrollHeight;
    }
}

/**
 * Handle scroll events
 */
function handleScroll() {
    const { scrollTop, scrollHeight, clientHeight } = DOM.messagesContainer;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < CONFIG.SCROLL_THRESHOLD;

    state.isScrolledToBottom = isAtBottom;

    // Show/hide scroll to bottom button
    DOM.scrollToBottomBtn.classList.toggle('visible', !isAtBottom && state.messages.length > 0);

    // Update unread count if not at bottom
    if (!isAtBottom && !state.isScrolledToBottom) {
        state.unreadCount++;
        updateUnreadCount();
    }
}

/**
 * Update unread count display
 */
function updateUnreadCount() {
    DOM.unreadCount.textContent = state.unreadCount > 0 ? state.unreadCount : '';
    DOM.unreadCount.dataset.count = state.unreadCount;
    if (DOM.notificationBadge) {
        DOM.notificationBadge.textContent = state.unreadCount > 0 ? state.unreadCount : '';
        DOM.notificationBadge.style.display = state.unreadCount > 0 ? 'flex' : 'none';
    }
}

/**
 * Reset unread count
 */
function resetUnreadCount() {
    state.unreadCount = 0;
    updateUnreadCount();
}

// =====================================================
// INPUT HANDLING
// =====================================================

/**
 * Handle input changes
 */
function handleInputChange() {
    const text = DOM.messageInput.value;
    const length = text.length;

    // Update character count
    DOM.characterCount.textContent = length;

    // Update character count styling
    const countContainer = DOM.characterCount.parentElement;
    countContainer.classList.toggle('warning', length > CONFIG.MAX_MESSAGE_LENGTH * 0.8);
    countContainer.classList.toggle('error', length > CONFIG.MAX_MESSAGE_LENGTH);

    // Update send button state
    DOM.sendBtn.disabled = length === 0 || length > CONFIG.MAX_MESSAGE_LENGTH;

    // Auto-resize textarea
    DOM.messageInput.style.height = 'auto';
    DOM.messageInput.style.height = Math.min(DOM.messageInput.scrollHeight, 150) + 'px';
}

/**
 * Send message
 */
async function sendMessage() {
    const text = DOM.messageInput.value.trim();

    if (!text || state.isTyping || text.length > CONFIG.MAX_MESSAGE_LENGTH) return;


    // Capture file context before clearing
    const fileContext = state.pendingFileContext;
    const messageFiles = [...state.pendingFiles];
    
    // Clear input and files immediately for UI feedback
    DOM.messageInput.value = '';
    handleInputChange();
    
    state.pendingFileContext = '';
    state.pendingFiles = [];
    renderFilePreview();

    // Append user message with files
    appendMessage('user', text, messageFiles);

    // Show loading state
    showLoader();
    playSound('message');

    try {
        // Create AbortController for this message
        state.abortController = new AbortController();
        state.isAborted = false;

        // Make API call with captured file context
        const response = await makeApiCall(text, fileContext, state.abortController.signal);

        // Simulate typing delay
        if (!state.isAborted) {
            await new Promise(resolve =>
                setTimeout(resolve, randomBetween(CONFIG.TYPING_DELAY_MIN, CONFIG.TYPING_DELAY_MAX))
            );
        }

        if (state.isAborted) return;

        hideLoader();

        // Append bot response with typewriter animation
        const botMessage = {
            id: generateId(),
            sender: 'bot',
            text: response,
            timestamp: Date.now()
        };
        state.messages.push(botMessage);
        updateCurrentChat();
        
        await typewriterEffect(botMessage);

    } catch (error) {
        hideLoader();
        // Ignore errors if manually aborted
        if (state.isAborted || error.name === 'AbortError') return;
        appendError(error.message);
    }
}

/**
 * Make API call
 */
async function makeApiCall(message, fileContext, signal) {
    try {
        const response = await fetch(CONFIG.API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            signal: signal,
            body: JSON.stringify({
                message: message,
                conversation_id: state.currentChatId,
                user_id: state.profile.user_id,
                settings: {
                    responseLength: state.settings.responseLength
                },
                file_context: fileContext
            })
        });

        if (!response.ok) {
            let errorText = `Server error: ${response.status}`;
            try {
                const errorData = await response.json();
                if (errorData && errorData.error) {
                    errorText = errorData.error;
                }
            } catch (e) {
                // Ignore parsing errors, keep default message
            }
            throw new Error(errorText);
        }

        const data = await response.json();
        return data.response || data.message || 'I received your message but could not generate a response.';

    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            // Simulate response for demo when server is not available
            return generateSimulatedResponse(message);
        }
        throw error;
    }
}

/**
 * Generate simulated response for demo
 */
function generateSimulatedResponse(message) {
    const responses = [
        `That's an interesting point about "${message.substring(0, 30)}...". Let me share my thoughts on this topic.`,
        `I understand your question. Here's what I can tell you about that...`,
        `Great question! Based on my knowledge, I'd say the answer involves several key factors.`,
        `I've processed your message. Here's my response with some relevant information.`,
        `Thank you for sharing that. Let me provide a thoughtful response to your query.`
    ];

    return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Append error message
 */
function appendError(errorText) {
    const message = {
        id: generateId(),
        sender: 'error',
        text: `Sorry, I encountered an error: ${errorText}. Please try again.`,
        timestamp: Date.now()
    };

    const messageEl = document.createElement('div');
    messageEl.className = 'message error';
    messageEl.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="message-content">
            <div class="message-bubble">${escapeHtml(message.text)}</div>
            <span class="message-time">${formatTime(new Date())}</span>
        </div>
    `;

    hideWelcomeScreen();
    DOM.messagesArea.appendChild(messageEl);
    scrollToBottom(true);
}

/**
 * Regenerate response
 */
async function regenerateResponse(originalMessage) {
    // Find the user message before this bot message
    const messageIndex = state.messages.findIndex(m => m.id === originalMessage.id);
    if (messageIndex <= 0) return;

    const userMessage = state.messages[messageIndex - 1];
    if (userMessage.sender !== 'user') return;

    // Remove the bot message
    state.messages.splice(messageIndex, 1);
    const messageEl = DOM.messagesArea.querySelector(`[data-message-id="${originalMessage.id}"]`);
    if (messageEl) messageEl.remove();

    // Generate new response
    showLoader();

    try {
        const response = await makeApiCall(userMessage.text, null, state.abortController.signal);
        await new Promise(resolve =>
            setTimeout(resolve, randomBetween(CONFIG.TYPING_DELAY_MIN, CONFIG.TYPING_DELAY_MAX))
        );

        hideLoader();
        appendMessage('bot', response);

    } catch (error) {
        hideLoader();
        appendError(error.message);
    }
}

// =====================================================
// EMOJI PICKER
// =====================================================

/**
 * Initialize emoji picker
 */
function initEmojiPicker() {
    renderEmojis(state.currentEmojiCategory);

    // Category buttons
    const categories = DOM.emojiPicker.querySelectorAll('.emoji-category');
    categories.forEach(btn => {
        btn.addEventListener('click', () => {
            categories.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.currentEmojiCategory = btn.dataset.category;
            renderEmojis(btn.dataset.category);
        });
    });

    // Search emojis
    DOM.emojiSearch.addEventListener('input', debounce((e) => {
        const query = e.target.value.toLowerCase();
        if (query) {
            searchEmojis(query);
        } else {
            renderEmojis(state.currentEmojiCategory);
        }
    }, 200));
}

/**
 * Render emojis by category
 */
function renderEmojis(category) {
    const emojis = EMOJIS[category] || [];
    DOM.emojiGrid.innerHTML = '';

    emojis.forEach(emoji => {
        const item = document.createElement('div');
        item.className = 'emoji-item';
        item.textContent = emoji;
        item.addEventListener('click', () => insertEmoji(emoji));
        DOM.emojiGrid.appendChild(item);
    });
}

/**
 * Search emojis
 */
function searchEmojis(query) {
    DOM.emojiGrid.innerHTML = '';

    Object.values(EMOJIS).flat().forEach(emoji => {
        // Simple search - in production you'd have emoji names
        const item = document.createElement('div');
        item.className = 'emoji-item';
        item.textContent = emoji;
        item.addEventListener('click', () => insertEmoji(emoji));
        DOM.emojiGrid.appendChild(item);
    });
}

/**
 * Insert emoji into input
 */
function insertEmoji(emoji) {
    const input = DOM.messageInput;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = input.value;

    input.value = text.substring(0, start) + emoji + text.substring(end);
    input.focus();
    input.selectionStart = input.selectionEnd = start + emoji.length;

    handleInputChange();
    toggleEmojiPicker(false);
}

/**
 * Toggle emoji picker visibility
 */
function toggleEmojiPicker(show = null) {
    const isVisible = DOM.emojiPicker.classList.contains('visible');
    const shouldShow = show !== null ? show : !isVisible;

    DOM.emojiPicker.classList.toggle('visible', shouldShow);
    DOM.emojiBtn.classList.toggle('active', shouldShow);
    
    if (shouldShow) {
        showToast('info', 'Emoji Picker', 'Opening emojis...');
        renderEmojis();
        setTimeout(() => DOM.emojiSearch.focus(), 100);
    }
}

/**
 * Render emojis in the grid
 */
function renderEmojis(filter = '') {
    DOM.emojiGrid.innerHTML = '';
    
    let emojisToRender = [];
    if (filter) {
        // Simple search across all categories
        Object.values(EMOJIS).forEach(cat => {
            emojisToRender = emojisToRender.concat(cat);
        });
        // This is a dummy filter, since we don't have names for emojis here
        // In a real app we'd have {char: '😀', name: 'grinning face'}
        // For now, let's just show first 50 if searching
        emojisToRender = emojisToRender.slice(0, 50);
    } else {
        emojisToRender = EMOJIS[state.currentEmojiCategory] || EMOJIS.smileys;
    }

    emojisToRender.forEach(emoji => {
        const btn = document.createElement('button');
        btn.className = 'emoji-item';
        btn.textContent = emoji;
        btn.addEventListener('click', () => {
            const start = DOM.messageInput.selectionStart;
            const end = DOM.messageInput.selectionEnd;
            const text = DOM.messageInput.value;
            DOM.messageInput.value = text.substring(0, start) + emoji + text.substring(end);
            DOM.messageInput.selectionStart = DOM.messageInput.selectionEnd = start + emoji.length;
            DOM.messageInput.focus();
            handleInputChange();
        });
        DOM.emojiGrid.appendChild(btn);
    });
}

/**
 * Initialize Emoji Picker events
 */
function initEmojiPicker() {
    DOM.emojiSearch.addEventListener('input', (e) => {
        renderEmojis(e.target.value);
    });

    DOM.emojiCategories.forEach(btn => {
        btn.addEventListener('click', () => {
            DOM.emojiCategories.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.currentEmojiCategory = btn.dataset.category;
            DOM.emojiSearch.value = '';
            renderEmojis();
        });
    });
}

// =====================================================
// FILE UPLOAD
// =====================================================

/**
 * Initialize file upload
 */
function initFileUpload() {
    // Click to upload
    DOM.fileUploadArea.addEventListener('click', () => DOM.fileInput.click());

    // Drag and drop
    DOM.fileUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        DOM.fileUploadArea.classList.add('dragover');
    });

    DOM.fileUploadArea.addEventListener('dragleave', () => {
        DOM.fileUploadArea.classList.remove('dragover');
    });

    DOM.fileUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        DOM.fileUploadArea.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });

    // File input change
    DOM.fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
}

/**
 * Handle file selection
 */
function handleFiles(files) {
    Array.from(files).forEach(file => {
        if (file.size > 10 * 1024 * 1024) {
            showToast('error', 'File Too Large', `${file.name} exceeds the 10MB limit.`);
            return;
        }

        state.attachedFiles.push({
            id: generateId(),
            name: file.name,
            size: file.size,
            type: file.type,
            file: file
        });
    });

    renderUploadedFiles();
}

/**
 * Render uploaded files
 */
function renderUploadedFiles() {
    DOM.uploadedFiles.innerHTML = '';

    state.attachedFiles.forEach(file => {
        const el = document.createElement('div');
        el.className = 'uploaded-file';
        el.innerHTML = `
            <div class="uploaded-file-icon">
                <i class="fas fa-file"></i>
            </div>
            <div class="uploaded-file-info">
                <div class="uploaded-file-name">${escapeHtml(file.name)}</div>
                <div class="uploaded-file-size">${formatFileSize(file.size)}</div>
            </div>
            <button class="uploaded-file-remove" data-file-id="${file.id}">
                <i class="fas fa-times"></i>
            </button>
        `;

        el.querySelector('.uploaded-file-remove').addEventListener('click', () => {
            state.attachedFiles = state.attachedFiles.filter(f => f.id !== file.id);
            renderUploadedFiles();
        });

        DOM.uploadedFiles.appendChild(el);
    });

    DOM.confirmUploadBtn.disabled = state.attachedFiles.length === 0;
}

/**
 * Format file size
 */
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * Confirm file upload
 */
async function confirmFileUpload() {
    if (state.attachedFiles.length === 0) return;

    showToast('info', 'Uploading Files', 'Analyzing your documents...');
    let consolidatedText = "";

    try {
        const newlyUploadedFiles = [];
        for (const fileObj of state.attachedFiles) {
            const formData = new FormData();
            formData.append('file', fileObj.file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                consolidatedText += `\n\n--- CONTENT FROM ${fileObj.name} ---\n${data.content}`;
                newlyUploadedFiles.push({
                    id: fileObj.id,
                    name: fileObj.name,
                    icon: 'fa-file-alt'
                });
            }
        }

        state.pendingFileContext += consolidatedText;
        state.pendingFiles = [...state.pendingFiles, ...newlyUploadedFiles];
        
        state.attachedFiles = [];
        renderUploadedFiles();
        closeModal('fileUpload');
        
        renderFilePreview();
        showToast('success', 'Files Ready', 'You can now ask questions about these files.');
    } catch (e) {
        showToast('error', 'Upload Error', 'Failed to process files.');
    }
}

/**
 * Render file preview chips in input area
 */
function renderFilePreview() {
    if (!DOM.filePreviewContainer) return;

    DOM.filePreviewContainer.innerHTML = '';
    
    if (state.pendingFiles.length === 0) {
        DOM.filePreviewContainer.style.display = 'none';
        return;
    }

    DOM.filePreviewContainer.style.display = 'flex';

    state.pendingFiles.forEach(file => {
        const card = document.createElement('div');
        card.className = 'file-preview-card';
        card.innerHTML = `
            <div class="file-preview-icon">
                <i class="fas ${file.icon}"></i>
            </div>
            <div class="file-preview-name">${escapeHtml(file.name)}</div>
            <button class="file-preview-remove" title="Remove file">
                <i class="fas fa-times"></i>
            </button>
        `;

        card.querySelector('.file-preview-remove').addEventListener('click', () => {
            state.pendingFiles = state.pendingFiles.filter(f => f.id !== file.id);
            // In a real app, you'd also need to subtract its text from pendingFileContext
            // For simplicity in this demo, we'll just clear the context if all files removed
            if (state.pendingFiles.length === 0) {
                state.pendingFileContext = '';
            }
            renderFilePreview();
        });

        DOM.filePreviewContainer.appendChild(card);
    });
}

// =====================================================
// MODALS
// =====================================================

/**
 * Open modal
 */
function openModal(modalName) {
    const modal = document.getElementById(`${modalName}Modal`);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Close modal
 */
function closeModal(modalName) {
    const modal = document.getElementById(`${modalName}Modal`);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/**
 * Show confirm modal
 */
function showConfirmModal(title, message, onConfirm) {
    DOM.confirmTitle.textContent = title;
    DOM.confirmMessage.textContent = message;

    // Remove old listeners
    const newConfirmBtn = DOM.confirmOkBtn.cloneNode(true);
    DOM.confirmOkBtn.parentNode.replaceChild(newConfirmBtn, DOM.confirmOkBtn);
    DOM.confirmOkBtn = newConfirmBtn;

    DOM.confirmOkBtn.addEventListener('click', () => {
        onConfirm();
        closeModal('confirm');
    });

    openModal('confirm');
}

// =====================================================
// SETTINGS
// =====================================================

/**
 * Load settings to UI
 */
function loadSettingsToUI() {
    DOM.darkModeToggle.checked = state.settings.darkMode;
    DOM.compactModeToggle.checked = state.settings.compactMode;
    DOM.fontSizeSelect.value = state.settings.fontSize;
    DOM.soundToggle.checked = state.settings.soundEffects;
    DOM.autoScrollToggle.checked = state.settings.autoScroll;
    DOM.responseLengthSelect.value = state.settings.responseLength;
    DOM.saveHistoryToggle.checked = state.settings.saveHistory;
    DOM.analyticsToggle.checked = state.settings.analytics;
}

/**
 * Save settings from UI
 */
function saveSettingsFromUI() {
    state.settings.darkMode = DOM.darkModeToggle.checked;
    state.settings.compactMode = DOM.compactModeToggle.checked;
    state.settings.fontSize = DOM.fontSizeSelect.value;
    state.settings.soundEffects = DOM.soundToggle.checked;
    state.settings.autoScroll = DOM.autoScrollToggle.checked;
    state.settings.responseLength = DOM.responseLengthSelect.value;
    state.settings.saveHistory = DOM.saveHistoryToggle.checked;
    state.settings.analytics = DOM.analyticsToggle.checked;

    saveSettings();
    applySettings();
    closeModal('settings');
    showToast('success', 'Settings Saved', 'Your preferences have been updated.');
}

/**
 * Reset settings to defaults
 */
function resetSettings() {
    state.settings = {
        darkMode: true,
        compactMode: false,
        fontSize: 'medium',
        soundEffects: true,
        autoScroll: true,
        responseLength: 'medium',
        saveHistory: true,
        analytics: false
    };

    loadSettingsToUI();
    applySettings();
    showToast('info', 'Settings Reset', 'Default settings have been restored.');
}

/**
 * Apply settings
 */
function applySettings() {
    // Theme
    document.documentElement.setAttribute('data-theme', state.settings.darkMode ? 'dark' : 'light');
    DOM.themeIcon.className = state.settings.darkMode ? 'fas fa-moon' : 'fas fa-sun';

    // Font size
    document.documentElement.setAttribute('data-font-size', state.settings.fontSize);

    // Compact mode
    document.documentElement.classList.toggle('compact', state.settings.compactMode);

    // Save and Sync
    saveSettings();
}

/**
 * Toggle theme
 */
function toggleTheme() {
    state.settings.darkMode = !state.settings.darkMode;
    applySettings();
    saveSettings();
}

// =====================================================
// TOAST NOTIFICATIONS
// =====================================================

/**
 * Show toast notification
 */
function showToast(type, title, message) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };

    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${icons[type]}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${escapeHtml(title)}</div>
            <div class="toast-message">${escapeHtml(message)}</div>
        </div>
        <button class="toast-close" aria-label="Close">
            <i class="fas fa-times"></i>
        </button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => removeToast(toast));

    DOM.toastContainer.appendChild(toast);

    // Play sound based on type
    if (type === 'success') playSound('success');
    if (type === 'error') playSound('error');

    // Auto remove
    setTimeout(() => removeToast(toast), CONFIG.TOAST_DURATION);
}

/**
 * Remove toast
 */
function removeToast(toast) {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
}

// =====================================================
// STATS UPDATE
// =====================================================

/**
 * Update stats UI
 */
function updateStatsUI() {
    DOM.totalMessagesEl.textContent = state.stats.totalMessages;
    DOM.totalChatsEl.textContent = state.stats.totalChats;

    // Update member since date
    if (state.stats.lastActiveDate) {
        DOM.memberSinceEl.textContent = formatDate(new Date(state.stats.lastActiveDate));
    }
}

// =====================================================
// EXPORT FUNCTIONALITY
// =====================================================

/**
 * Export chat
 */
function exportChat() {
    if (state.messages.length === 0) {
        showToast('warning', 'No Messages', 'There are no messages to export.');
        return;
    }

    const exportData = {
        title: state.chatHistory.find(c => c.id === state.currentChatId)?.title || 'Chat Export',
        exportDate: new Date().toISOString(),
        messages: state.messages
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `nova-chat-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('success', 'Export Complete', 'Your chat has been downloaded.');
}

// =====================================================
// KEYBOARD SHORTCUTS
// =====================================================

/**
 * Handle keyboard shortcuts
 */
function handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + N: New Chat
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        createNewChat();
    }

    // Ctrl/Cmd + S: Save/Export
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        exportChat();
    }

    // Ctrl/Cmd + ,: Settings
    if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        openModal('settings');
    }

    // Escape: Close modals/sidebar
    if (e.key === 'Escape') {
        if (DOM.settingsModal.classList.contains('active')) {
            closeModal('settings');
        } else if (DOM.profileModal.classList.contains('active')) {
            closeModal('profile');
        } else if (DOM.fileUploadModal.classList.contains('active')) {
            closeModal('fileUpload');
        } else if (DOM.confirmModal.classList.contains('active')) {
            closeModal('confirm');
        } else if (DOM.emojiPicker.classList.contains('visible')) {
            toggleEmojiPicker(false);
        } else if (state.sidebarOpen) {
            toggleSidebar(false);
        }
    }
}

// =====================================================
// FEATURE CARDS
// =====================================================

/**
 * Initialize feature cards
 */
function initFeatureCards() {
    const cards = document.querySelectorAll('.feature-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const prompt = card.dataset.prompt;
            if (prompt) {
                DOM.messageInput.value = prompt;
                handleInputChange();
                DOM.messageInput.focus();
            }
        });
    });
}

/**
 * Initialize quick actions
 */
function initQuickActions() {
    const actions = document.querySelectorAll('.quick-action-btn');
    actions.forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            switch (action) {
                case 'clear':
                    showConfirmModal(
                        'Clear Chat',
                        'Are you sure you want to clear all messages in this conversation?',
                        () => {
                            state.messages = [];
                            updateCurrentChat();
                            renderMessages();
                            showToast('success', 'Chat Cleared', 'All messages have been removed.');
                        }
                    );
                    break;
                case 'export':
                    exportChat();
                    break;
            }
        });
    });
}

// =====================================================
// EVENT LISTENERS
// =====================================================

function initEventListeners() {
    // Sidebar toggle
    DOM.menuToggleBtn.addEventListener('click', () => toggleSidebar(true));
    DOM.closeSidebarBtn.addEventListener('click', () => toggleSidebar(false));
    DOM.sidebarOverlay.addEventListener('click', () => toggleSidebar(false));

    // New chat
    DOM.newChatBtn.addEventListener('click', () => createNewChat());

    // Search history
    DOM.searchInput.addEventListener('input', (e) => searchHistory(e.target.value));
    DOM.searchClearBtn.addEventListener('click', () => {
        DOM.searchInput.value = '';
        searchHistory('');
    });

    // Clear all history
    DOM.clearHistoryBtn.addEventListener('click', () => clearAllHistory());

    // Theme toggle
    DOM.themeToggleBtn.addEventListener('click', () => toggleTheme());

    // Mobile header menu
    if (DOM.mobileMenuBtn && DOM.headerActions) {
        DOM.mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            DOM.headerActions.classList.toggle('show');
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (DOM.headerActions.classList.contains('show') && 
                !DOM.headerActions.contains(e.target) && 
                e.target !== DOM.mobileMenuBtn) {
                DOM.headerActions.classList.remove('show');
            }
        });
    }

    // Share chat
    DOM.shareBtn.addEventListener('click', async () => {
        if (!state.currentChatId) return;
        const shareLink = window.location.origin + '/shared/' + state.currentChatId;
        try {
            await navigator.clipboard.writeText(shareLink);
            showToast('success', 'Link Copied', 'Shareable link copied to clipboard.');
        } catch (e) {
            showToast('error', 'Error', 'Could not copy data.');
        }
    });

    // Archive chat
    DOM.archiveBtn.addEventListener('click', async () => {
        if (!state.currentChatId) return;
        const chat = state.chatHistory.find(c => c.id === state.currentChatId);
        if (!chat) return;
        
        const newStatus = !chat.is_archived;
        try {
            const response = await fetch(`/api/conversations/${state.currentChatId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_archived: newStatus })
            });
            if (response.ok) {
                chat.is_archived = newStatus;
                showToast('success', newStatus ? 'Chat Archived' : 'Chat Unarchived', 'Status updated successfully.');
                renderHistory();
            }
        } catch (e) {
            showToast('error', 'Error', 'Failed to update status.');
        }
    });

    // Pin chat
    DOM.pinBtn.addEventListener('click', async () => {
        if (!state.currentChatId) return;
        const chat = state.chatHistory.find(c => c.id === state.currentChatId);
        if (!chat) return;
        
        const newStatus = !chat.is_pinned;
        try {
            const response = await fetch(`/api/conversations/${state.currentChatId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_pinned: newStatus })
            });
            if (response.ok) {
                chat.is_pinned = newStatus;
                showToast('success', newStatus ? 'Chat Pinned' : 'Chat Unpinned', 'Status updated successfully.');
                renderHistory();
            }
        } catch (e) {
            showToast('error', 'Error', 'Failed to update status.');
        }
    });

    // Notifications
    DOM.notificationsBtn.addEventListener('click', async () => {
        await fetchNotifications();
        showToast('info', 'Notifications', 'Checking for new alerts...');
    });

    // Scroll to bottom
    DOM.messagesContainer.addEventListener('scroll', throttle(handleScroll, 100));
    DOM.scrollToBottomBtn.addEventListener('click', () => {
        scrollToBottom(true);
        resetUnreadCount();
    });

    // Message input
    DOM.messageInput.addEventListener('input', handleInputChange);
    DOM.messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Send button
    DOM.sendBtn.addEventListener('click', () => sendMessage());

    // Stop button
    DOM.stopBtn.addEventListener('click', () => stopGeneration());

    // Pause button
    DOM.pauseBtn.addEventListener('click', () => togglePause());

    // Attachment & Emoji actions
    DOM.attachFileBtn.addEventListener('click', () => openModal('fileUpload'));
    DOM.emojiBtn.addEventListener('click', () => toggleEmojiPicker());

    // Voice input (just a placeholder)
    DOM.voiceInputBtn.addEventListener('click', () => {
        showToast('info', 'Voice Input', 'Voice recognition is not available in your browser.');
    });

    // Settings Modal
    DOM.settingsBtn.addEventListener('click', () => {
        loadSettingsToUI();
        openModal('settings');
    });

    // Mobile Profile Button in Header
    if (DOM.mobileProfileBtn) {
        DOM.mobileProfileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loadProfileToUI();
            updateStatsUI();
            openModal('profile');
        });
    }

    DOM.closeSettingsModal.addEventListener('click', () => closeModal('settings'));
    DOM.saveSettingsBtn.addEventListener('click', () => saveSettingsFromUI());
    DOM.resetSettingsBtn.addEventListener('click', () => resetSettings());

    // Profile Modal
    DOM.profileBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loadProfileToUI();
        updateStatsUI();
        openModal('profile');
    });
    DOM.closeProfileModal.addEventListener('click', () => closeModal('profile'));
    DOM.saveProfileBtn.addEventListener('click', () => saveProfileFromUI());
    
    // Avatar Upload
    DOM.changeAvatarBtn.addEventListener('click', () => DOM.avatarInput.click());
    DOM.avatarInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Preview
            const reader = new FileReader();
            reader.onload = (event) => {
                DOM.profileAvatarImg.src = event.target.result;
                DOM.profileAvatarImg.style.display = 'block';
                DOM.profileAvatarIcon.style.display = 'none';
            };
            reader.readAsDataURL(file);

            // Upload to backend
            const formData = new FormData();
            formData.append('avatar', file);
            formData.append('user_id', state.profile.user_id);

            try {
                showToast('info', 'Uploading...', 'Uploading your profile picture.');
                const response = await fetch('/api/profile/avatar', {
                    method: 'POST',
                    body: formData
                });
                if (response.ok) {
                    const data = await response.json();
                    state.profile.avatar = data.avatar_url;
                    saveProfile();
                    
                    // Update UI immediately
                    loadProfileToUI();
                    
                    showToast('success', 'Avatar Updated', 'Your profile picture has been saved.');
                }
            } catch (e) {
                showToast('error', 'Upload Error', 'Failed to upload image.');
            }
        }
    });

    DOM.signOutBtn.addEventListener('click', () => {
        showConfirmModal('Sign Out', 'Are you sure you want to sign out?', () => {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('nova_profile');
            window.location.href = 'index.html';
        });
    });

    // File Upload Modal
    DOM.closeFileUploadModal.addEventListener('click', () => closeModal('fileUpload'));
    DOM.confirmUploadBtn.addEventListener('click', () => confirmFileUpload());
    DOM.cancelUploadBtn.addEventListener('click', () => {
        state.attachedFiles = [];
        renderUploadedFiles();
        closeModal('fileUpload');
    });

    // Confirm Modal
    DOM.closeConfirmModal.addEventListener('click', () => closeModal('confirm'));
    DOM.confirmCancelBtn.addEventListener('click', () => closeModal('confirm'));

    // Global keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);

    // Global click listener to close emoji picker
    document.addEventListener('click', (e) => {
        if (DOM.emojiPicker && DOM.emojiBtn && !DOM.emojiPicker.contains(e.target) && !DOM.emojiBtn.contains(e.target)) {
            toggleEmojiPicker(false);
        }
    });
}

/**
 * Stop AI generation
 */
function stopGeneration() {
    if (state.isTyping && state.abortController) {
        state.isAborted = true;
        state.abortController.abort();
        
        // Find the last bot message and update its content
        const messageEls = DOM.messagesArea.querySelectorAll('.message.bot');
        const lastMessageEl = messageEls[messageEls.length - 1];
        if (lastMessageEl) {
            const textEl = lastMessageEl.querySelector('.typewriter-text');
            if (textEl) {
                textEl.innerHTML = '<span style="color: var(--text-tertiary); font-style: italic;">Conversation Paused</span>';
            }
            const cursorEl = lastMessageEl.querySelector('.typewriter-cursor');
            if (cursorEl) cursorEl.remove();
        }
        
        hideLoader();
        showToast('info', 'Stopped', 'Conversation paused.');
    }
}

/**
 * Toggle Pause/Resume for typewriter
 */
function togglePause() {
    state.isPaused = !state.isPaused;
    updatePauseBtnUI();
    
    if (state.isPaused) {
        showToast('info', 'Paused', 'Bot response paused.');
    } else {
        showToast('success', 'Resumed', 'Bot continuing to type.');
    }
}

/**
 * Update Pause button UI based on state
 */
function updatePauseBtnUI() {
    if (!DOM.pauseBtn) return;
    
    const icon = DOM.pauseBtn.querySelector('i');
    const span = DOM.pauseBtn.querySelector('span');
    
    if (state.isPaused) {
        icon.className = 'fas fa-play';
        span.textContent = 'Resume';
        DOM.pauseBtn.classList.add('active');
    } else {
        icon.className = 'fas fa-pause';
        span.textContent = 'Pause';
        DOM.pauseBtn.classList.remove('active');
    }
}

async function init() {
    await initializeFromStorage();
    loadProfileToUI();
    renderHistory();
    renderMessages();
    updateStatsUI();
    initFileUpload();
    initEmojiPicker();
    
    
    initFeatureCards();
    initQuickActions();
    initEventListeners();
    
    console.log('Aura AI Initialized');
}

// Start the application
document.addEventListener('DOMContentLoaded', init);