/**
 * Component Loader
 * Loads HTML components into the page
 */
async function loadComponent(elementId, componentPath) {
    try {
        // Add a timestamp to the URL to prevent browser caching
        const cacheBuster = `?v=${new Date().getTime()}`;
        const response = await fetch(componentPath + cacheBuster);
        
        if (!response.ok) throw new Error(`Failed to load ${componentPath}`);
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;

        // Initialize icons for this component
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    } catch (error) {
        console.error('Error loading component:', error);
    }
}

/**
 * Features that depend on the Navbar being in the DOM
 */
function initializeNavbar() {
    // A. Highlight Active Nav Link
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('#navbar-placeholder a');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
            const cleanHref = href.split('#')[0];
            const cleanCurrent = currentPath.split('#')[0];
            if (cleanHref === cleanCurrent || (cleanCurrent === 'index.html' && cleanHref === '')) {
                link.classList.remove('text-slate-700');
                link.classList.add('text-blue-600', 'font-bold');
            }
        }
    });

    // B. Mobile Menu Toggle Logic
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.querySelector('.menu-icon');
    const closeIcon = document.querySelector('.close-icon');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            const isOpen = !mobileMenu.classList.contains('translate-x-full');
            if (isOpen) {
                mobileMenu.classList.add('translate-x-full');
                if (menuIcon) menuIcon.classList.remove('hidden');
                if (closeIcon) closeIcon.classList.add('hidden');
                document.body.classList.remove('overflow-hidden');
            } else {
                mobileMenu.classList.remove('translate-x-full');
                if (menuIcon) menuIcon.classList.add('hidden');
                if (closeIcon) closeIcon.classList.remove('hidden');
                document.body.classList.add('overflow-hidden');
            }
        });

        // Close menu when clicking a link
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('translate-x-full');
                if (menuIcon) menuIcon.classList.remove('hidden');
                if (closeIcon) closeIcon.classList.add('hidden');
                document.body.classList.remove('overflow-hidden');
            });
        });
    }

    // C. Refresh icons inside the navbar
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Main Initialization
 */
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Load Components (sequential)
    await loadComponent('navbar-placeholder', './components/navbar.html');
    await loadComponent('footer-placeholder', './components/footer.html');

    // 2. Initialize Navbar features
    initializeNavbar();

    // 3. Hero Slider Logic
    const slides = document.querySelectorAll('.hero-slide');
    let currentSlide = 0;

    function nextSlide() {
        if (slides.length === 0) return;
        slides[currentSlide].classList.remove('opacity-100');
        slides[currentSlide].classList.add('opacity-0');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.remove('opacity-0');
        slides[currentSlide].classList.add('opacity-100');
    }

    if (slides.length > 0) {
        setInterval(nextSlide, 4000);
    }

    // 4. Dynamic Blog Slider
    initBlogSlider();

    // 5. Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 6. FAQ Accordion Logic
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const trigger = item.querySelector('.faq-trigger');
        const content = item.querySelector('.faq-content');

        if (trigger && content) {
            trigger.addEventListener('click', () => {
                const isOpen = !content.classList.contains('hidden');

                // Close all other items
                faqItems.forEach(otherItem => {
                    const otherContent = otherItem.querySelector('.faq-content');
                    if (otherContent) otherContent.classList.add('hidden');
                    const otherIcon = otherItem.querySelector('i[data-lucide="chevron-down"]');
                    if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
                });

                if (!isOpen) {
                    content.classList.remove('hidden');
                    const currentIcon = trigger.querySelector('i[data-lucide="chevron-down"]');
                    if (currentIcon) currentIcon.style.transform = 'rotate(180deg)';
                }
            });
        }
    });

    // 7. Tab Switching Logic (for Resources page)
    const tabTriggers = document.querySelectorAll('.tab-trigger');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const targetId = trigger.getAttribute('data-tab-target');
            if (!targetId) return;

            // Update Trigger States
            tabTriggers.forEach(btn => {
                btn.classList.remove('active', 'text-blue-600', 'bg-blue-50');
                btn.classList.add('text-slate-500');
            });
            trigger.classList.add('active', 'text-blue-600', 'bg-blue-50');
            trigger.classList.remove('text-slate-500');

            // Update Panel Visibility
            tabPanels.forEach(panel => panel.classList.add('hidden'));
            const activePanel = document.getElementById(targetId);
            if (activePanel) activePanel.classList.remove('hidden');
        });
    });

    // 8. Global Icon Refresh
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

/**
 * News & Blog Slider Logic
 */
async function initBlogSlider() {
    const container = document.getElementById('blog-container');
    if (!container) return;

    try {
        const response = await fetch('./data/blogs.json');
        const blogs = await response.json();

        container.innerHTML = blogs.map(blog => `
            <div class="swiper-slide h-auto">
                <article class="group bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 h-full flex flex-col">
                    <div class="relative overflow-hidden aspect-[16/10]">
                        <img src="${blog.image}" alt="${blog.title}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                        <div class="absolute top-4 left-4">
                            <span class="bg-white/90 backdrop-blur-md text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
                                ${blog.category}
                            </span>
                        </div>
                    </div>
                    <div class="p-8 flex flex-col flex-grow">
                        <time class="text-slate-400 text-xs font-medium mb-3 block">${blog.date}</time>
                        <h3 class="text-lg font-bold font-roboto text-blue-950 mb-4 leading-snug group-hover:text-blue-600 transition-colors">
                            ${blog.title}
                        </h3>
                        <p class="text-slate-500 text-base leading-relaxed mb-6 flex-grow">
                            ${blog.excerpt}
                        </p>
                        <a href="${blog.link}" class="inline-flex items-center gap-2 text-blue-600 font-bold text-sm group/link">
                            Read Article
                            <i data-lucide="arrow-right" class="w-4 h-4 transition-transform group-hover/link:translate-x-1"></i>
                        </a>
                    </div>
                </article>
            </div>
        `).join('');

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        new Swiper('.news-slider', {
            slidesPerView: 1,
            spaceBetween: 30,
            loop: true,
            autoplay: { delay: 5000, disableOnInteraction: false },
            pagination: { el: '.swiper-pagination', clickable: true },
            navigation: { nextEl: '.news-next', prevEl: '.news-prev' },
            breakpoints: {
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
            },
        });
    } catch (error) {
        console.error('Error loading blog posts:', error);
    }
}
