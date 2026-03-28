'use strict';

const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const authTitle = document.getElementById('authTitle');
const authSubtitle = document.getElementById('authSubtitle');
const authMessage = document.getElementById('authMessage');

const authWrapper = document.querySelector('.auth-wrapper');

// Tab Switching
loginTab.addEventListener('click', () => {
    authWrapper.style.maxWidth = '520px';
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    
    loginForm.classList.add('active', 'slide-in-left');
    registerForm.classList.remove('active', 'slide-in-right');
    
    authTitle.textContent = 'Welcome Back';
    authSubtitle.textContent = 'Please enter your details to continue';
    authMessage.textContent = '';
    
    // Clean up animation class after it finishes
    setTimeout(() => loginForm.classList.remove('slide-in-left'), 500);
});

registerTab.addEventListener('click', () => {
    authWrapper.style.maxWidth = '650px';
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    
    registerForm.classList.add('active', 'slide-in-right');
    loginForm.classList.remove('active', 'slide-in-left');
    
    authTitle.textContent = 'Create Account';
    authSubtitle.textContent = 'Join Aura AI today';
    authMessage.textContent = '';
    
    // Clean up animation class after it finishes
    setTimeout(() => registerForm.classList.remove('slide-in-right'), 500);
});

// Password Toggle
document.querySelectorAll('.password-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
        const input = btn.previousElementSibling;
        const type = input.type === 'password' ? 'text' : 'password';
        input.type = type;
        btn.innerHTML = `<i class="fas fa-eye${type === 'password' ? '' : '-slash'}"></i>`;
    });
});

// Show Message Utility
function showMsg(text, type) {
    authMessage.textContent = text;
    authMessage.className = `auth-message ${type}`;
}

// Handle Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    showMsg('Checking credentials...', 'info');
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMsg('Login successful! Redirecting...', 'success');
            // Store profile data in localStorage
            localStorage.setItem('nova_profile', JSON.stringify(data.profile));
            localStorage.setItem('isLoggedIn', 'true');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            showMsg(data.error || 'Login failed', 'error');
        }
    } catch (error) {
        showMsg('Server connection failed', 'error');
    }
});

// Handle Register
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const dob = document.getElementById('regDob').value;
    const mobile = document.getElementById('regMobile').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    
    if (password !== confirmPassword) {
        showMsg('Passwords do not match', 'error');
        return;
    }
    
    showMsg('Creating account...', 'info');
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, dob, mobile, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMsg('Registration successful! Redirecting to login...', 'success');
            setTimeout(() => {
                loginTab.click();
            }, 1500);
        } else {
            showMsg(data.error || 'Registration failed', 'error');
        }
    } catch (error) {
        showMsg('Server connection failed', 'error');
    }
});
