// ===================================
// KAWA Code - Main JavaScript
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all features
    initFadeInAnimations();
    initSmoothScroll();
    initFAQAccordion();
    initROICalculator();
    initNavbarScroll();
});

// ===================================
// Fade-in Animations on Scroll
// ===================================

function initFadeInAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Add staggered delay for multiple elements
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all elements with fade-in class
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(element => {
        observer.observe(element);
    });
}

// ===================================
// Smooth Scroll for Navigation Links
// ===================================

function initSmoothScroll() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            // Skip if it's just "#"
            if (href === '#') return;
            
            e.preventDefault();
            
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetElement.offsetTop - navbarHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===================================
// Navbar Background on Scroll
// ===================================

function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        // Add shadow when scrolled
        if (currentScroll > 50) {
            navbar.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
        } else {
            navbar.style.boxShadow = 'none';
        }

        lastScroll = currentScroll;
    });
}

// ===================================
// FAQ Accordion
// ===================================

function initFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Close other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
        });
    });
}

// ===================================
// ROI Calculator
// ===================================

function initROICalculator() {
    const calculateBtn = document.getElementById('calculateBtn');
    const employeesInput = document.getElementById('employees');
    const avgSalaryInput = document.getElementById('avgSalary');
    const reworkRateInput = document.getElementById('reworkRate');
    
    // Initialize with default values
    calculateROI();
    
    // Calculate on button click
    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateROI);
    }
    
    // Also calculate on Enter key in inputs
    [employeesInput, avgSalaryInput, reworkRateInput].forEach(input => {
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    calculateROI();
                }
            });
        }
    });
}

function calculateROI() {
    // Get input values
    const employees = parseInt(document.getElementById('employees').value) || 100;
    const avgSalary = parseInt(document.getElementById('avgSalary').value) || 800;
    const reworkRate = parseInt(document.getElementById('reworkRate').value) || 30;
    
    // Validate inputs
    if (employees < 1 || avgSalary < 100 || reworkRate < 0 || reworkRate > 100) {
        alert('入力値を確認してください。\n従業員数: 1以上\n平均年収: 100万円以上\n手戻り率: 0-100%');
        return;
    }
    
    // Calculate costs
    // Annual cost = employees × avgSalary × 10,000 (convert to yen)
    const annualCost = employees * avgSalary * 10000;
    
    // Current loss = annual cost × (rework rate / 100)
    const currentLoss = annualCost * (reworkRate / 100);
    
    // After KAWA: reduce rework rate by 50%
    const improvedRate = reworkRate / 2;
    const improvedLoss = annualCost * (improvedRate / 100);
    
    // Savings
    const savings = currentLoss - improvedLoss;
    
    // Time saved (assuming 2000 work hours per year per person)
    const totalHours = employees * 2000;
    const currentReworkHours = totalHours * (reworkRate / 100);
    const improvedReworkHours = totalHours * (improvedRate / 100);
    const timeSaved = currentReworkHours - improvedReworkHours;
    
    // Equivalent employees
    const equivEmployees = Math.round(timeSaved / 2000);
    
    // Payback period (assume KAWA cost is ~10% of annual savings)
    // Simple calculation: 1.2 months average
    const paybackMonths = Math.max(1, Math.round(12 * 0.1));
    
    // Update UI
    updateROIDisplay(
        currentLoss,
        savings,
        reworkRate,
        improvedRate,
        timeSaved,
        equivEmployees,
        paybackMonths
    );
    
    // Animate the numbers
    animateNumbers();
}

function updateROIDisplay(
    currentLoss,
    savings,
    currentRate,
    improvedRate,
    timeSaved,
    equivEmployees,
    paybackMonths
) {
    // Format currency (Japanese Yen)
    const formatCurrency = (amount) => {
        return '¥' + amount.toLocaleString('ja-JP');
    };
    
    // Format number with commas
    const formatNumber = (num) => {
        return num.toLocaleString('ja-JP');
    };
    
    // Update current loss
    document.getElementById('currentLoss').textContent = formatCurrency(currentLoss);
    document.getElementById('currentRate').textContent = currentRate + '%';
    
    // Update savings
    document.getElementById('savings').textContent = formatCurrency(savings);
    document.getElementById('improvedRate').textContent = improvedRate + '%';
    
    // Update summary
    document.getElementById('timeSaved').textContent = formatNumber(Math.round(timeSaved));
    document.getElementById('equivEmployees').textContent = equivEmployees;
    document.getElementById('paybackPeriod').textContent = paybackMonths;
}

function animateNumbers() {
    // Add animation class to result cards
    const resultCards = document.querySelectorAll('.result-card');
    resultCards.forEach(card => {
        card.style.transform = 'scale(0.95)';
        card.style.opacity = '0.8';
        
        setTimeout(() => {
            card.style.transform = 'scale(1)';
            card.style.opacity = '1';
            card.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        }, 100);
    });
    
    // Pulse the savings amount
    const savingsElement = document.getElementById('savings');
    savingsElement.style.animation = 'none';
    setTimeout(() => {
        savingsElement.style.animation = 'pulse-once 0.6s ease-out';
    }, 10);
}

// Add pulse animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse-once {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
            color: var(--color-kawa-green-light);
        }
        100% {
            transform: scale(1);
        }
    }
`;
document.head.appendChild(style);

// ===================================
// Code Split View Interaction (Future Enhancement)
// ===================================

// This could be expanded to allow switching between languages
// or showing/hiding different code examples

function initCodeSplitView() {
    // Future: Add interactive controls for code examples
    // e.g., toggle between different programming languages
    // or animate the transformation from Japanese to English
}

// ===================================
// Stats Counter Animation
// ===================================

function animateStatsOnScroll() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const finalValue = target.textContent;
                const numericValue = parseInt(finalValue);
                
                if (!isNaN(numericValue)) {
                    animateValue(target, 0, numericValue, 1500);
                }
                
                observer.unobserve(target);
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(stat => {
        observer.observe(stat);
    });
}

function animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            element.textContent = end + '%';
            clearInterval(timer);
        } else {
            element.textContent = Math.round(current) + '%';
        }
    }, 16);
}

// ===================================
// Parallax Effect for Hero Section (Subtle)
// ===================================

function initParallaxEffect() {
    const hero = document.querySelector('.hero');
    
    if (hero) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * 0.3;
            
            hero.style.transform = `translateY(${rate}px)`;
            hero.style.opacity = 1 - (scrolled / 600);
        });
    }
}

// ===================================
// Mobile Menu Toggle (Future Enhancement)
// ===================================

function initMobileMenu() {
    // Future: Add hamburger menu for mobile devices
    // This would show/hide the navigation links
}

// ===================================
// Scroll to Top Button (Future Enhancement)
// ===================================

function initScrollToTop() {
    // Future: Add a "scroll to top" button that appears
    // when user scrolls down the page
}

// ===================================
// Track User Engagement (Analytics)
// ===================================

function trackEngagement() {
    // Track button clicks
    const downloadButtons = document.querySelectorAll('.btn-primary');
    downloadButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            console.log('Download button clicked:', e.target.textContent);
            // Future: Send to analytics service
        });
    });
    
    // Track section views
    const sections = document.querySelectorAll('section');
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                console.log('Section viewed:', entry.target.id);
                // Future: Send to analytics service
            }
        });
    }, { threshold: 0.5 });
    
    sections.forEach(section => {
        sectionObserver.observe(section);
    });
}

// ===================================
// Easter Egg: Konami Code
// ===================================

function initKonamiCode() {
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;
    
    document.addEventListener('keydown', (e) => {
        if (e.key === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                activateEasterEgg();
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    });
}

function activateEasterEgg() {
    // Fun easter egg animation
    document.body.style.animation = 'rainbow 2s linear infinite';
    
    const rainbowStyle = document.createElement('style');
    rainbowStyle.textContent = `
        @keyframes rainbow {
            0% { filter: hue-rotate(0deg); }
            100% { filter: hue-rotate(360deg); }
        }
    `;
    document.head.appendChild(rainbowStyle);
    
    setTimeout(() => {
        document.body.style.animation = '';
        alert('🎉 KAWA Code パワーアップ！ユニバーサル・プログラミングで世界を変えよう！');
    }, 2000);
}

// Initialize easter egg
initKonamiCode();

// ===================================
// Performance Optimization
// ===================================

// Debounce function for scroll events
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

// Lazy load images (if needed in future)
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// ===================================
// Console Message
// ===================================

console.log('%c🚀 KAWA Code', 'font-size: 24px; font-weight: bold; color: #2F81F7;');
console.log('%cAI時代の開発を、ただの生成から『意図の管理』へ。', 'font-size: 14px; color: #8B949E;');
console.log('%c世界のエンジニア人口を、200万人から2億人へ。', 'font-size: 14px; color: #3FB950;');
console.log('\n開発者の方へ: KAWA Codeに興味がありますか？');
console.log('公式サイト: https://codeawareness.com');
console.log('GitHub: https://github.com/CodeAwareness/kawa.vscode');