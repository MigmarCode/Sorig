/**
 * Component Loader
 * Loads HTML components into the page
 */
async function loadComponent(elementId, componentPath) {
    try {
        const cacheBuster = `?v=${new Date().getTime()}`;
        const response = await fetch(componentPath + cacheBuster);
        
        if (!response.ok) throw new Error(`Failed to load ${componentPath}`);
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    } catch (error) {
        console.error('Error loading component:', error);
    }
}

/**
 * Main Initialization
 */
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Load Navbar and Footer
    await loadComponent('navbar-placeholder', './components/navbar.html');
    await loadComponent('footer-placeholder', './components/footer.html');

    // 2. Hero Slider Logic
    const slides = document.querySelectorAll('.hero-slide');
    let currentSlide = 0;
    if (slides.length > 0) {
        setInterval(() => {
            slides[currentSlide].classList.remove('opacity-100');
            slides[currentSlide].classList.add('opacity-0');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.remove('opacity-0');
            slides[currentSlide].classList.add('opacity-100');
        }, 4000);
    }

    // 3. Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.getElementById(href.substring(1));
                if (target) {
                    window.scrollTo({
                        top: target.offsetTop - 100,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // 4. FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const trigger = item.querySelector('.faq-trigger');
        const content = item.querySelector('.faq-content');
        if (trigger && content) {
            trigger.addEventListener('click', () => {
                const isOpen = !content.classList.contains('hidden');
                faqItems.forEach(other => {
                    other.querySelector('.faq-content').classList.add('hidden');
                    const icon = other.querySelector('i[data-lucide="chevron-down"]');
                    if (icon) icon.style.transform = 'rotate(0deg)';
                });
                if (!isOpen) {
                    content.classList.remove('hidden');
                    const icon = trigger.querySelector('i[data-lucide="chevron-down"]');
                    if (icon) icon.style.transform = 'rotate(180deg)';
                }
            });
        }
    });

    // 5. Tabs
    const triggers = document.querySelectorAll('.tab-trigger');
    const panels = document.querySelectorAll('.tab-panel');
    triggers.forEach(t => {
        t.addEventListener('click', () => {
            const target = t.getAttribute('data-tab-target');
            triggers.forEach(btn => btn.classList.remove('active', 'text-blue-600', 'bg-blue-50'));
            t.classList.add('active', 'text-blue-600', 'bg-blue-50');
            panels.forEach(p => p.classList.add('hidden'));
            const active = document.getElementById(target);
            if (active) active.classList.remove('hidden');
        });
    });

    // 6. Blog Slider
    initBlogSlider();
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
                        <img src="${blog.image}" alt="${blog.title}" class="w-full h-full object-cover">
                    </div>
                    <div class="p-8 flex flex-col flex-grow">
                        <h3 class="text-lg font-bold text-blue-950 mb-4 leading-snug">${blog.title}</h3>
                        <p class="text-slate-500 text-base leading-relaxed mb-6 flex-grow">${blog.excerpt}</p>
                    </div>
                </article>
            </div>
        `).join('');

        new Swiper('.news-slider', {
            slidesPerView: 1,
            spaceBetween: 30,
            loop: true,
            breakpoints: { 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }
        });
        if (typeof lucide !== 'undefined') lucide.createIcons();
    } catch (e) { console.error(e); }
}
