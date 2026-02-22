// ===================================
// Contact Form JavaScript
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    initContactForm();
});

// ===================================
// Contact Form Initialization
// ===================================

function initContactForm() {
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const formMessage = document.getElementById('formMessage');

    if (!form) return;

    // Form submission handler
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate form
        if (!validateForm(form)) {
            showMessage('すべての必須項目をご入力ください。', 'error');
            return;
        }

        // Disable submit button and show loading state
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');

        try {
            // Get form data
            const formData = new FormData(form);
            
            // Send to Formspree
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                showMessage(
                    '<i class="fas fa-check-circle"></i> お問い合わせを送信しました！2営業日以内にご返信いたします。',
                    'success'
                );
                form.reset();
                
                // Scroll to message
                formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                const data = await response.json();
                if (data.errors) {
                    throw new Error(data.errors.map(error => error.message).join(', '));
                } else {
                    throw new Error('送信に失敗しました');
                }
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showMessage(
                '<i class="fas fa-exclamation-circle"></i> 送信に失敗しました。お手数ですが、直接 <a href="mailto:okamoto@kawacode.jp" style="color: inherit; text-decoration: underline;">okamoto@kawacode.jp</a> までメールでお問い合わせください。',
                'error'
            );
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
        }
    });
}

// ===================================
// Form Validation
// ===================================

function validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.style.borderColor = 'var(--color-accent-danger)';
            
            // Remove error highlight after input
            field.addEventListener('input', () => {
                field.style.borderColor = '';
            }, { once: true });
        }
    });

    // Validate email format
    const emailInput = form.querySelector('#emailInput');
    if (emailInput && emailInput.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value)) {
            isValid = false;
            emailInput.style.borderColor = 'var(--color-accent-danger)';
            showMessage(
                '<i class="fas fa-exclamation-circle"></i> 正しいメールアドレスを入力してください。',
                'error'
            );
        }
    }

    return isValid;
}

// ===================================
// Send Email Function (Now handled by Formspree)
// ===================================
// Formspree (https://formspree.io/f/xqedlbpg) handles the email sending
// Form data is automatically sent to okamoto@kawacode.jp

// ===================================
// Show Message Function
// ===================================

function showMessage(message, type) {
    const formMessage = document.getElementById('formMessage');
    
    if (!formMessage) return;

    formMessage.innerHTML = message;
    formMessage.className = 'form-message show ' + type;

    // Auto-hide after 10 seconds for success messages
    if (type === 'success') {
        setTimeout(() => {
            formMessage.classList.remove('show');
        }, 10000);
    }
}

// ===================================
// Input Character Counter (Optional Enhancement)
// ===================================

function addCharacterCounter() {
    const textarea = document.getElementById('message');
    const maxLength = 1000; // Optional max length

    if (textarea) {
        const counter = document.createElement('small');
        counter.className = 'form-help character-counter';
        counter.style.float = 'right';
        
        textarea.parentElement.appendChild(counter);

        const updateCounter = () => {
            const length = textarea.value.length;
            counter.textContent = `${length} / ${maxLength} 文字`;
            
            if (length > maxLength * 0.9) {
                counter.style.color = 'var(--color-accent-warning)';
            } else {
                counter.style.color = 'var(--color-text-tertiary)';
            }
        };

        textarea.addEventListener('input', updateCounter);
        updateCounter();
    }
}

// Optional: Initialize character counter
// addCharacterCounter();

// ===================================
// Real-time Email Validation
// ===================================

function initEmailValidation() {
    const emailInput = document.getElementById('emailInput');
    
    if (emailInput) {
        let validationTimeout;
        
        emailInput.addEventListener('input', () => {
            clearTimeout(validationTimeout);
            
            validationTimeout = setTimeout(() => {
                const email = emailInput.value;
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                
                if (email && !emailRegex.test(email)) {
                    emailInput.style.borderColor = 'var(--color-accent-warning)';
                } else if (email) {
                    emailInput.style.borderColor = 'var(--color-kawa-green)';
                } else {
                    emailInput.style.borderColor = '';
                }
            }, 500);
        });
    }
}

// Initialize email validation
initEmailValidation();

// ===================================
// Auto-save to LocalStorage (Optional)
// ===================================

function initAutoSave() {
    const form = document.getElementById('contactForm');
    const STORAGE_KEY = 'kawa_contact_form_draft';

    if (!form) return;

    // Load saved draft
    const savedDraft = localStorage.getItem(STORAGE_KEY);
    if (savedDraft) {
        try {
            const draft = JSON.parse(savedDraft);
            Object.keys(draft).forEach(key => {
                const field = form.querySelector(`[name="${key}"]`);
                if (field) {
                    field.value = draft[key];
                }
            });
            
            showMessage(
                '<i class="fas fa-info-circle"></i> 前回入力途中の内容を復元しました。',
                'info'
            );
        } catch (error) {
            console.error('Failed to load draft:', error);
        }
    }

    // Save draft on input
    const saveableFields = form.querySelectorAll('input[type="text"], input[type="email"], textarea');
    saveableFields.forEach(field => {
        field.addEventListener('input', debounce(() => {
            const formData = new FormData(form);
            const draft = {};
            
            formData.forEach((value, key) => {
                if (key !== 'access_key' && key !== 'botcheck') {
                    draft[key] = value;
                }
            });
            
            localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
        }, 1000));
    });

    // Clear draft on successful submission
    form.addEventListener('submit', () => {
        setTimeout(() => {
            localStorage.removeItem(STORAGE_KEY);
        }, 2000);
    });
}

// Debounce helper function
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

// Optional: Initialize auto-save
// initAutoSave();

// ===================================
// Console Message
// ===================================

console.log('%c📧 KawaCode お問い合わせページ', 'font-size: 16px; font-weight: bold; color: #2F81F7;');
console.log('%cFormspree経由でokamoto@kawacode.jpへ送信されます', 'font-size: 12px; color: #8B949E;');
console.log('フォームID: xqedlbpg');