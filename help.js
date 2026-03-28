document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const menuToggleBtn = document.getElementById('menuToggleBtn');
    const sidebar = document.querySelector('.sidebar');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    const historyItems = document.querySelectorAll('.history-item');
    const helpSections = document.querySelectorAll('.help-section');
    const faqItems = document.querySelectorAll('.faq-item');
    const faqSearch = document.getElementById('faqSearch');
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');

    // Mobile Sidebar Toggle
    menuToggleBtn.addEventListener('click', () => {
        sidebar.classList.add('active');
    });

    closeSidebarBtn.addEventListener('click', () => {
        sidebar.classList.remove('active');
    });

    // Section Switching
    historyItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.getAttribute('data-target');
            
            // Update Sidebar UI
            historyItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            // Update Section UI
            helpSections.forEach(section => section.classList.remove('active'));
            document.getElementById(target + 'Section').classList.add('active');
            
            // Close mobile sidebar on selection
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
            }
        });
    });

    // FAQ Accordion
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            faqItems.forEach(i => i.classList.remove('active'));
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // FAQ Search
    faqSearch.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question span').textContent.toLowerCase();
            const answer = item.querySelector('.faq-answer p').textContent.toLowerCase();
            if (question.includes(term) || answer.includes(term)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });

    // Contact Form Submission
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const userId = localStorage.getItem('aura_user_id') || 'anonymous';
        const formData = {
            user_id: userId,
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };

        // UI Loading State
        const submitBtn = contactForm.querySelector('button');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Sending...</span><i class="fas fa-spinner fa-spin" style="margin-left: 10px;"></i>';

        try {
            const response = await fetch('/api/help/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                formStatus.textContent = 'Message sent successfully! We will get back to you soon.';
                formStatus.className = 'form-status success';
                contactForm.reset();
            } else {
                throw new Error(result.error || 'Failed to send message');
            }
        } catch (error) {
            formStatus.textContent = error.message;
            formStatus.className = 'form-status error';
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            
            // Scroll to status
            formStatus.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });

    // Handle initial state and URL parameters if any
    const urlParams = new URLSearchParams(window.location.search);
    const sectionParam = urlParams.get('section');
    if (sectionParam) {
        const targetItem = document.querySelector(`.history-item[data-target="${sectionParam}"]`);
        if (targetItem) targetItem.click();
    }
});
