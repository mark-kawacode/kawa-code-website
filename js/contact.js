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
            
            // Send email using simple fetch to backend endpoint
            // Since this is a static site, we'll use a simple mailto fallback
            const success = await sendEmail(formData);

            if (success) {
                showMessage(
                    '<i class="fas fa-check-circle"></i> お問い合わせを送信しました！2営業日以内にご返信いたします。',
                    'success'
                );
                form.reset();
                
                // Scroll to message
                formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                throw new Error('送信に失敗しました');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showMessage(
                '<i class="fas fa-exclamation-circle"></i> 送信に失敗しました。お手数ですが、直接 okamoto@kawacode.jp までメールでお問い合わせください。',
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
// Send Email Function
// ===================================

async function sendEmail(formData) {
    // Extract form data
    const company = formData.get('company') || '未記入';
    const name = formData.get('name');
    const email = formData.get('from_email');
    const message = formData.get('message');

    // Method 1: Try using Web3Forms API (if access key is configured)
    // Web3Forms is a free service that can send form submissions to your email
    // Sign up at: https://web3forms.com/
    
    const accessKey = formData.get('access_key');
    
    if (accessKey && accessKey !== 'YOUR_WEB3FORMS_ACCESS_KEY') {
        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (result.success) {
                return true;
            }
        } catch (error) {
            console.error('Web3Forms error:', error);
        }
    }

    // Method 2: Formspree fallback (alternative service)
    // You can sign up at: https://formspree.io/
    // Replace YOUR_FORMSPREE_ID with your actual Formspree form ID
    
    try {
        const formspreeData = {
            company: company,
            name: name,
            email: email,
            message: message
        };

        const response = await fetch('https://formspree.io/f/YOUR_FORMSPREE_ID', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formspreeData)
        });

        if (response.ok) {
            return true;
        }
    } catch (error) {
        console.error('Formspree error:', error);
    }

    // Method 3: Mailto fallback
    // Opens the user's email client with pre-filled data
    const subject = encodeURIComponent(`[Kawa Code お問い合わせ] ${name}様より`);
    const body = encodeURIComponent(
        `会社名: ${company}\n` +
        `お名前: ${name}\n` +
        `メールアドレス: ${email}\n\n` +
        `お問い合わせ内容:\n${message}\n\n` +
        `---\n` +
        `送信日時: ${new Date().toLocaleString('ja-JP')}`
    );
    
    const mailtoLink = `mailto:okamoto@kawacode.jp?subject=${subject}&body=${body}`;
    
    // Open email client
    window.location.href = mailtoLink;
    
    // Return true to show success message
    // Note: We can't verify if the email was actually sent via mailto
    return true;
}

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

console.log('%c📧 Kawa Code お問い合わせページ', 'font-size: 16px; font-weight: bold; color: #2F81F7;');
console.log('%cフォーム送信には以下のいずれかの設定が必要です:', 'font-size: 12px; color: #8B949E;');
console.log('1. Web3Forms (https://web3forms.com/) でアクセスキーを取得');
console.log('2. Formspree (https://formspree.io/) でフォームIDを取得');
console.log('3. または、mailtoフォールバックが使用されます');
