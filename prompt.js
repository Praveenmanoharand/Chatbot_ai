/* =====================================================
   Aura AI - Image Analyzer Logic
   ===================================================== */

'use strict';

const DOM = {
    // Layout
    menuToggleBtn: document.getElementById('menuToggleBtn'),
    sidebar: document.getElementById('sidebar'),
    sidebarOverlay: document.querySelector('.sidebar-overlay') || document.getElementById('sidebarOverlay'),
    closeSidebarBtn: document.getElementById('closeSidebarBtn'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    themeIcon: document.getElementById('themeIcon'),
    shareBtn: document.getElementById('shareBtn'),
    archiveBtn: document.getElementById('archiveBtn'),
    pinBtn: document.getElementById('pinBtn'),
    exportChatBtn: document.getElementById('exportChatBtn'),
    notificationsBtn: document.getElementById('notificationsBtn'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),
    historyList: document.getElementById('historyList'),

    // Profile Modal
    profileBtn: document.getElementById('profileBtn'),
    profileModal: document.getElementById('profileModal'),
    closeProfileModal: document.getElementById('closeProfileModal'),
    saveProfileBtn: document.getElementById('saveProfileBtn'),
    signOutBtn: document.getElementById('signOutBtn'),
    profileNameInput: document.getElementById('profileName'),
    profileEmailInput: document.getElementById('profileEmail'),
    profilePhoneInput: document.getElementById('profilePhone'),
    profileLocationInput: document.getElementById('profileLocation'),
    profileBioInput: document.getElementById('profileBio'),

    // Sections
    uploadSection: document.getElementById('uploadSection'),
    analysisSection: document.getElementById('analysisSection'),
    resultsSection: document.getElementById('resultsSection'),

    // Upload
    dropZone: document.getElementById('dropZone'),
    imageInput: document.getElementById('imageInput'),
    browseBtn: document.querySelector('.browse-btn'),

    // Analysis
    imagePreview: document.getElementById('imagePreview'),
    statusMsg: document.getElementById('statusMsg'),

    // Results
    jsonDisplay: document.getElementById('jsonDisplay').querySelector('code'),
    promptDisplay: document.getElementById('promptDisplay'),
    negativeDisplay: document.getElementById('negativeDisplay'),
    restartBtn: document.getElementById('restartBtn'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    copyBtns: document.querySelectorAll('.copy-btn'),
    toastContainer: document.getElementById('toastContainer'),

    // Expert Options
    styleChips: document.querySelectorAll('#styleChips .chip'),
    ratioSelectors: document.querySelectorAll('#ratioSelectors .ratio-btn'),
    lightingSelect: document.getElementById('lightingSelect'),
    atmosphereSelect: document.getElementById('atmosphereSelect'),
    optionsSection: document.getElementById('optionsSection')
};

let state = {
    selectedStyle: 'realistic',
    selectedRatio: '1:1',
    profile: {
        name: 'Guest User',
        email: 'guest@example.com',
        phone: '',
        location: '',
        bio: ''
    }
};

const STORAGE_KEYS = {
    PROFILE: 'nova_profile',
    SETTINGS: 'nova_settings'
};

// =====================================================
// SIMULATED DATA GENERATION
// =====================================================

const ANALYSIS_DATABASE = {
    subjects: ["Futuristic Cityscape", "Ancient Forest", "Cyberpunk Warrior", "Serene Mountain Lake", "Abstract Geometric Concept"],
    styles: ["Digital Oil Painting", "Hyper-realistic 3D", "Cyberpunk Neon", "Minimalist Concept Art", "Surrealism"],
    attributes: ["Detailed textures", "Global illumination", "Cinematic lighting", "8k resolution", "Vibrant color palette"],
    negativePrompts: {
        realistic: "blur, low quality, distorted, cartoon, anime, illustration, painting, drawing, sketches, worst quality, monochrome, grayscale",
        anime: "realistic, 3d render, photograph, real life, low quality, worst quality, normal quality, blurry, cinematic lighting",
        "cyberpunk": "nature, green, forest, peaceful, soft lighting, low quality, realistic, painting",
        "3d-render": "2d, sketch, painting, drawing, cartoon, anime, low resolution, worst quality",
        "oil-painting": "photograph, realistic, 3d, digital, sharp edges, low quality, modern"
    },
    jsonTemplate: (subject, style, attributes, ratio, lighting, atmosphere) => ({
        image_analysis: {
            metadata: {
                engine: "Power BT Vision v4.5",
                confidence: "0.99"
            },
            configuration: {
                target_style: style,
                aspect_ratio: ratio,
                lighting_profile: lighting,
                atmosphere: atmosphere
            },
            composition: {
                main_subject: subject,
                visual_style: style,
                lighting_desc: lighting.replace("-", " "),
                atmosphere_desc: atmosphere.replace("-", " ")
            },
            detected_features: attributes,
            semantic_prompt: `A professional ${style} of ${subject}, featuring ${attributes.join(", ")}, ${lighting.replace("-", " ")} lighting, ${atmosphere.replace("-", " ")} atmosphere, highly detailed, masterpiece, 8k, aspect ratio ${ratio}.`
        }
    })
};

// =====================================================
// INITIALIZATION
// =====================================================

function init() {
    loadProfile();
    initTheme();
    setupEventListeners();
}

function loadProfile() {
    const savedProfile = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILE) || '{}');
    state.profile = { ...state.profile, ...savedProfile };
}

function saveProfile() {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(state.profile));
}

function initTheme() {
    const savedSettings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');
    const darkMode = savedSettings.darkMode !== undefined ? savedSettings.darkMode : true;
    const fontSize = savedSettings.fontSize || 'medium';
    
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    document.documentElement.setAttribute('data-font-size', fontSize);
    updateThemeIcon(darkMode ? 'dark' : 'light');
}

function toggleTheme() {
    const savedSettings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');
    const newDarkMode = !(savedSettings.darkMode !== undefined ? savedSettings.darkMode : true);
    
    savedSettings.darkMode = newDarkMode;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(savedSettings));
    
    document.documentElement.setAttribute('data-theme', newDarkMode ? 'dark' : 'light');
    updateThemeIcon(newDarkMode ? 'dark' : 'light');
    showToast('info', 'Theme Updated', `Switched to ${newDarkMode ? 'dark' : 'light'} mode.`);
}

function updateThemeIcon(theme) {
    if (DOM.themeIcon) {
        DOM.themeIcon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    }
}

function setupEventListeners() {
    // Sidebar Toggles
    DOM.menuToggleBtn.addEventListener('click', () => toggleSidebar(true));
    DOM.closeSidebarBtn.addEventListener('click', () => toggleSidebar(false));
    DOM.sidebarOverlay.addEventListener('click', () => toggleSidebar(false));

    // Theme Toggles
    if (DOM.themeToggleBtn) {
        DOM.themeToggleBtn.addEventListener('click', toggleTheme);
    }

    // Header Actions
    if (DOM.shareBtn) {
        DOM.shareBtn.addEventListener('click', () => showToast('info', 'Share Results', 'Opening share options...'));
    }
    if (DOM.archiveBtn) {
        DOM.archiveBtn.addEventListener('click', () => showToast('success', 'Analysis Archived', 'Saved to your archives.'));
    }
    if (DOM.pinBtn) {
        DOM.pinBtn.addEventListener('click', () => showToast('success', 'Analysis Pinned', 'Pinned to the top of your history.'));
    }
    if (DOM.exportChatBtn) {
        DOM.exportChatBtn.addEventListener('click', () => showToast('info', 'Export Data', 'Downloading JSON analysis...'));
    }
    if (DOM.notificationsBtn) {
        DOM.notificationsBtn.addEventListener('click', () => showToast('info', 'Notifications', 'You have 3 new notifications.'));
    }

    // Clear History
    if (DOM.clearHistoryBtn) {
        DOM.clearHistoryBtn.addEventListener('click', () => {
            DOM.historyList.innerHTML = '<div class="history-empty">No recent analysis</div>';
            showToast('info', 'History Cleared', 'Your recent analysis history has been reset.');
        });
    }

    // Upload interactions
    DOM.browseBtn.addEventListener('click', () => DOM.imageInput.click());
    DOM.imageInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

    // Drag and drop
    DOM.dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        DOM.dropZone.classList.add('drag-over');
    });

    DOM.dropZone.addEventListener('dragleave', () => {
        DOM.dropZone.classList.remove('drag-over');
    });

    DOM.dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        DOM.dropZone.classList.remove('drag-over');
        handleFile(e.dataTransfer.files[0]);
    });

    // Result tabs
    DOM.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Copying
    DOM.copyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.target;
            const text = document.getElementById(targetId).textContent || document.getElementById(targetId).value;
            copyToClipboard(text);
        });
    });

    // Expert Options - Style Chips
    DOM.styleChips.forEach(chip => {
        chip.addEventListener('click', () => {
            DOM.styleChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            state.selectedStyle = chip.dataset.value;
        });
    });

    // Expert Options - Ratio Selectors
    DOM.ratioSelectors.forEach(btn => {
        btn.addEventListener('click', () => {
            DOM.ratioSelectors.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.selectedRatio = btn.dataset.value;
        });
    });

    // Restart
    DOM.restartBtn.addEventListener('click', resetAnalyzer);

    // Profile Actions
    if (DOM.profileBtn) {
        DOM.profileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loadProfileToUI();
            openModal('profile');
        });
    }

    if (DOM.closeProfileModal) {
        DOM.closeProfileModal.addEventListener('click', () => closeModal('profile'));
    }

    if (DOM.saveProfileBtn) {
        DOM.saveProfileBtn.addEventListener('click', () => saveProfileFromUI());
    }

    if (DOM.signOutBtn) {
        DOM.signOutBtn.addEventListener('click', () => {
            showToast('info', 'Sign Out', 'Signing out of your account...');
        });
    }
}

// =====================================================
// CORE LOGIC
// =====================================================

function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) {
        showToast('error', 'Invalid File', 'Please upload a valid image file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        DOM.imagePreview.src = e.target.result;
        startAnalysis();
    };
    reader.readAsDataURL(file);
}

function toggleSidebar(open) {
    DOM.sidebar.classList.toggle('open', open);
    if (DOM.sidebarOverlay) DOM.sidebarOverlay.classList.toggle('active', open);
}

function openModal(type) {
    if (type === 'profile' && DOM.profileModal) {
        DOM.profileModal.classList.add('active');
    }
}

function closeModal(type) {
    if (type === 'profile' && DOM.profileModal) {
        DOM.profileModal.classList.remove('active');
    }
}

function loadProfileToUI() {
    if (!DOM.profileNameInput) return;
    DOM.profileNameInput.value = state.profile.name || '';
    DOM.profileEmailInput.value = state.profile.email || '';
    DOM.profilePhoneInput.value = state.profile.phone || '';
    DOM.profileLocationInput.value = state.profile.location || '';
    DOM.profileBioInput.value = state.profile.bio || '';
}

function saveProfileFromUI() {
    if (!DOM.profileNameInput) return;
    state.profile.name = DOM.profileNameInput.value;
    state.profile.email = DOM.profileEmailInput.value;
    state.profile.phone = DOM.profilePhoneInput.value;
    state.profile.location = DOM.profileLocationInput.value;
    state.profile.bio = DOM.profileBioInput.value;
    
    saveProfile();
    showToast('success', 'Profile Saved', 'Your profile details have been updated.');
    closeModal('profile');
}

async function startAnalysis() {
    // Transition UI
    DOM.uploadSection.classList.add('hidden');
    DOM.optionsSection.classList.add('hidden'); // Also hide options
    DOM.analysisSection.classList.remove('hidden');

    const steps = [
        "Analyzing user preferences...",
        "Scanning visual patterns...",
        "Applying ${state.selectedStyle} style mapping...",
        "Ajusting for ${state.selectedRatio} aspect ratio...",
        "Mapping color spectrum...",
        "Synthesizing final prompt data..."
    ];

    for (let i = 0; i < steps.length; i++) {
        const text = steps[i].replace("${state.selectedStyle}", state.selectedStyle).replace("${state.selectedRatio}", state.selectedRatio);
        DOM.statusMsg.textContent = text;
        await sleep(800);
    }

    showResults();
}

function showResults() {
    const lighting = DOM.lightingSelect.value;
    const atmosphere = DOM.atmosphereSelect.value;
    
    // Generate random but "relevant" looking data
    const subject = ANALYSIS_DATABASE.subjects[Math.floor(Math.random() * ANALYSIS_DATABASE.subjects.length)];
    const attributes = ANALYSIS_DATABASE.attributes.sort(() => 0.5 - Math.random()).slice(0, 3);
    
    const data = ANALYSIS_DATABASE.jsonTemplate(
        subject, 
        state.selectedStyle, 
        attributes, 
        state.selectedRatio, 
        lighting, 
        atmosphere
    );

    // Render JSON
    DOM.jsonDisplay.textContent = JSON.stringify(data, null, 2);
    
    // Render Prompt
    DOM.promptDisplay.value = data.image_analysis.semantic_prompt;

    // Render Negative Prompt
    DOM.negativeDisplay.value = ANALYSIS_DATABASE.negativePrompts[state.selectedStyle] || ANALYSIS_DATABASE.negativePrompts.realistic;

    // Transition UI
    DOM.analysisSection.classList.add('hidden');
    DOM.resultsSection.classList.remove('hidden');
    showToast('success', 'Analysis Complete', 'All prompt variations and JSON data are ready.');
}

function resetAnalyzer() {
    DOM.resultsSection.classList.add('hidden');
    DOM.uploadSection.classList.remove('hidden');
    DOM.optionsSection.classList.remove('hidden'); // Show options again
    DOM.imageInput.value = '';
    DOM.imagePreview.src = '';
    switchTab('json');
}

// =====================================================
// UI UTILITIES
// =====================================================

function switchTab(tabName) {
    DOM.tabBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    document.getElementById('jsonTab').classList.toggle('hidden', tabName !== 'json');
    document.getElementById('promptTab').classList.toggle('hidden', tabName !== 'prompt');
    document.getElementById('negativeTab').classList.toggle('hidden', tabName !== 'negative');
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('success', 'Copied!', 'Content copied to clipboard.');
    }).catch(() => {
        showToast('error', 'Copy Failed', 'Please try again.');
    });
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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Start
init();
