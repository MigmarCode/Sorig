/**
 * Component Loader
 * Loads HTML components into the page
 */
async function loadComponent(elementId, componentPath) {
    try {
        const response = await fetch(componentPath);
        if (!response.ok) throw new Error(`Failed to load ${componentPath}`);
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;

        // Initialize icons for this component immediately with a small delay for DOM stability
        setTimeout(() => {
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }, 100);
    } catch (error) {
        console.error('Error loading component:', error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Load Components (sequential to ensure DOM is ready)
    await loadComponent('navbar-placeholder', './components/navbar.html');
    await loadComponent('footer-placeholder', './components/footer.html');

    // 2. Highlight Active Nav Link
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('#navbar-placeholder a');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
            // Clean up href for comparison (remove # or extra paths)
            const cleanHref = href.split('#')[0];
            const cleanCurrent = currentPath.split('#')[0];

            if (cleanHref === cleanCurrent || (cleanCurrent === 'index.html' && cleanHref === '')) {
                link.classList.remove('text-slate-700');
                link.classList.add('text-blue-600', 'font-bold');
            }
        }
    });

    // 3. Fallback initialization for the whole document
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 2. Hero Slider Logic
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

    // 5. Dynamic Blog Slider
    initBlogSlider();

    // 4. Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            if (!targetId) return;

            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100, // Offset for fixed navbar
                    behavior: 'smooth'
                });
            }
        });
    });

    // 5. FAQ Accordion Logic
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const trigger = item.querySelector('.faq-trigger');
        const content = item.querySelector('.faq-content');
        const iconContainer = item.querySelector('.w-8.h-8');

        trigger.addEventListener('click', () => {
            const currentIcon = iconContainer ? iconContainer.querySelector('i, svg') : null;
            const isOpen = !content.classList.contains('hidden');

            // Close all other items
            faqItems.forEach(otherItem => {
                otherItem.querySelector('.faq-content').classList.add('hidden');
                const otherIconContainer = otherItem.querySelector('.w-8.h-8');
                const otherIcon = otherIconContainer ? otherIconContainer.querySelector('i, svg') : null;
                if (otherIcon) {
                    otherIcon.style.transform = 'rotate(0deg)';
                    otherIcon.style.transformOrigin = 'center';
                }
                if (otherIconContainer) {
                    otherIconContainer.classList.remove('bg-blue-600');
                    otherIconContainer.classList.add('bg-white');
                }
                otherItem.classList.remove('bg-blue-50/50', 'border-blue-100');
            });

            if (!isOpen) {
                content.classList.remove('hidden');
                if (currentIcon) {
                    currentIcon.style.transform = 'rotate(180deg)';
                    currentIcon.style.transformOrigin = 'center';
                }
                if (iconContainer) {
                    iconContainer.classList.remove('bg-white');
                    iconContainer.classList.add('bg-blue-600');
                }
                item.classList.add('bg-blue-50/50', 'border-blue-100');
            }
        });
    });

    // 6. Vertical Tabs Logic (for Packing Checklist)
    const tabTriggers = document.querySelectorAll('.tab-trigger');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const targetId = trigger.getAttribute('data-tab-target');

            // Update Trigger States
            tabTriggers.forEach(btn => {
                btn.classList.remove('active', 'text-blue-600', 'bg-blue-50');
                btn.classList.add('text-slate-500');
            });
            trigger.classList.add('active', 'text-blue-600', 'bg-blue-50');
            trigger.classList.remove('text-slate-500');

            // Update Panel Visibility
            tabPanels.forEach(panel => {
                panel.classList.add('hidden');
            });
            const activePanel = document.getElementById(targetId);
            if (activePanel) {
                activePanel.classList.remove('hidden');
            }
        });
    });
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

        // Re-initialize icons for the newly added cards
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Initialize Swiper
        new Swiper('.news-slider', {
            slidesPerView: 1,
            spaceBetween: 30,
            loop: true,
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.news-next',
                prevEl: '.news-prev',
            },
            breakpoints: {
                640: {
                    slidesPerView: 2,
                },
                1024: {
                    slidesPerView: 3,
                },
            },
        });

    } catch (error) {
        console.error('Error loading blog posts:', error);
    }
}
