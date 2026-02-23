

/* ======================================================================================================================
   CONFIG
====================================================================================================================== */
const CONFIG = {
    NAV_SCROLL_THRESHOLD: 50,
    CAROUSEL_AUTO_INTERVAL: 5000
};

/* ======================================================================================================================
   UTILITIES
====================================================================================================================== */
const Util = {
    getTranslateX(el) {
        const matrix = new DOMMatrixReadOnly(getComputedStyle(el).transform);
        return matrix.m41;
    },
    clamp(num, min, max) {
        return Math.min(Math.max(num, min), max);
    },
    on(el, event, handler) {
        el?.addEventListener(event, handler);
    }
};

/* ======================================================================================================================
   NAVBAR COMPONENT
====================================================================================================================== */
class Navbar {
    constructor({ selector }) {
        this.navbar = document.querySelector(selector);
        this.links = document.querySelectorAll(`${selector} .nav-links a`);
        this.menuToggle = document.querySelector(`${selector} .menu-toggle`);
        this.linksContainer = document.querySelector(`${selector} .nav-links`);
        this.scrollThreshold = CONFIG.NAV_SCROLL_THRESHOLD;
        this.sections = Array.from(this.links)
            .map(link => document.querySelector(link.getAttribute('href')))
            .filter(Boolean);

        this.init();
    }

    getHeight() {
        return this.navbar ? this.navbar.offsetHeight : 0;
    }

    handleScroll() {
        if (!this.navbar) return;

        const scrolled = window.scrollY > this.scrollThreshold;
        this.navbar.classList.toggle('scrolled', scrolled);

        const scrollPos = window.pageYOffset + this.getHeight() + 10;

        this.sections.forEach(section => {
            const top = section.offsetTop;
            const bottom = top + section.offsetHeight;
            if (scrollPos >= top && scrollPos < bottom) {
                this.links.forEach(link => link.classList.remove('active'));
                const activeLink = [...this.links]
                    .find(link => link.getAttribute('href') === `#${section.id}`);
                activeLink?.classList.add('active');
            }
        });
    }

    init() {
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });

        this.links.forEach(link => {
            link.addEventListener('click', e => {
                const target = document.querySelector(link.getAttribute('href'));
                if (!target) return;
                e.preventDefault();
                const y = target.getBoundingClientRect().top + window.pageYOffset - this.getHeight();
                window.scrollTo({ top: y, behavior: 'smooth' });

                if (this.linksContainer?.classList.contains('open')) {
                    this.linksContainer.classList.remove('open');
                    this.menuToggle?.classList.remove('open');
                    this.menuToggle?.setAttribute('aria-expanded', 'false');
                    document.body.style.overflow = '';
                }
            });
        });

        this.menuToggle?.addEventListener('click', () => {
            const isOpen = this.linksContainer?.classList.toggle('open');
            this.menuToggle.classList.toggle('open');
            this.menuToggle.setAttribute('aria-expanded', !!isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });
    }
}

/* ======================================================================================================================
   SCROLL REVEAL COMPONENT
====================================================================================================================== */
class ScrollReveal {
    constructor({ selector }) {
        this.elements = document.querySelectorAll(selector);
        this.init();
    }

    init() {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -100px 0px', threshold: 0.1 });

        this.elements.forEach(el => observer.observe(el));
    }
}

/* ======================================================================================================================
   TYPED JS COMPONENT
====================================================================================================================== */
class AutoType {
    constructor({ selector, strings, typeSpeed = 50, backSpeed = 50, loop = true }) {
        if (!window.Typed) return;
        new Typed(selector, { strings, typeSpeed, backSpeed, loop });
    }
}

/* ======================================================================================================================
   CONTACT FORM COMPONENT
====================================================================================================================== */
class ContactForm {
    constructor({ formSelector, statusSelector }) {
        this.form = document.querySelector(formSelector);
        this.status = document.querySelector(statusSelector);
        this.init();
    }

    init() {
        this.form?.addEventListener('submit', async e => {
            e.preventDefault();
            const data = new FormData(this.form);
            const btn = this.form.querySelector('button[type="submit"]');
            btn.disabled = true;

            try {
                const response = await fetch(this.form.action, {
                    method: this.form.method,
                    body: data,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    this.status.textContent = '✅ Nachricht erfolgreich gesendet!';
                    this.status.style.color = '#2ecc71';
                    this.form.reset();
                } else throw new Error();
            } catch {
                this.status.textContent = '❌ Fehler beim Senden.';
                this.status.style.color = '#e74c3c';
            }
            btn.disabled = false;
        });
    }
}

/* ======================================================================================================================
   CAROUSEL COMPONENT
====================================================================================================================== */
class Carousel {
    constructor({ carouselSelector, trackSelector, cardSelector, autoInterval = CONFIG.CAROUSEL_AUTO_INTERVAL }) {
        this.carousel = document.querySelector(carouselSelector);
        this.track = document.querySelector(trackSelector);
        this.cards = document.querySelectorAll(cardSelector);
        this.index = 0;
        this.autoInterval = autoInterval;
        this.autoSlide = null;
        this.startX = 0;
        this.isDragging = false;

        this.init();
    }

    getMetrics() {
        const cardWidth = this.cards[0].offsetWidth;
        const gap = parseInt(getComputedStyle(this.track).gap) || 0;
        const carouselWidth = this.carousel.offsetWidth;
        const totalWidth = this.cards.length * cardWidth + (this.cards.length - 1) * gap;
        return { cardWidth, gap, carouselWidth, totalWidth };
    }

    update() {
        if (!this.track || this.cards.length === 0) return;
        const { cardWidth, gap, carouselWidth, totalWidth } = this.getMetrics();

        if (totalWidth <= carouselWidth) {
            const offset = (carouselWidth - totalWidth) / 2;
            this.track.style.transform = `translateX(${offset}px)`;
            return;
        }

        const offset = (carouselWidth - cardWidth) / 2 - this.index * (cardWidth + gap);
        this.track.style.transform = `translateX(${offset}px)`;
    }

    next() {
        this.index = (this.index + 1) % this.cards.length;
        this.update();
    }

    startAuto() {
        if (this.autoSlide !== null) return;
        this.autoSlide = setInterval(() => this.next(), this.autoInterval);
    }

    stopAuto() {
        if (this.autoSlide === null) return;
        clearInterval(this.autoSlide);
        this.autoSlide = null;
    }

    init() {
        window.addEventListener('load', () => {
            this.update();
            this.startAuto();
        });
        window.addEventListener('resize', () => this.update());

        Util.on(this.carousel, 'mouseenter', () => this.stopAuto());
        Util.on(this.carousel, 'mouseleave', () => this.startAuto());

        /* SWIPE */
        Util.on(this.carousel, 'touchstart', e => {
            this.startX = e.touches[0].clientX;
            this.isDragging = true;
            this.stopAuto();
        });
        Util.on(this.carousel, 'touchend', e => {
            if (!this.isDragging) return;
            const deltaX = e.changedTouches[0].clientX - this.startX;
            this.isDragging = false;

            if (Math.abs(deltaX) > 50) {
                if (deltaX < 0 && this.index < this.cards.length - 1) this.index++;
                if (deltaX > 0 && this.index > 0) this.index--;
            }
            this.update();
            this.startAuto();
        });

        /* KEYBOARD */
        document.addEventListener('keydown', e => {
            if (e.key === 'ArrowRight') this.next();
            if (e.key === 'ArrowLeft' && this.index > 0) {
                this.index--;
                this.update();
            }
        });
    }
}

/* ======================================================================================================================
   POPUP COMPONENT
====================================================================================================================== */
class Popup {
    constructor({ popupSelector, popupCloseSelector, cardSelector }) {
        this.popup = document.querySelector(popupSelector);
        this.popupImg = this.popup?.querySelector('img');
        this.popupClose = document.querySelector(popupCloseSelector);
        this.cards = document.querySelectorAll(cardSelector);

        this.init();
    }

    open(src) {
        if (this.popup && this.popupImg) {
            this.popupImg.src = src;
            this.popup.classList.add('active');
        }
    }

    close() {
        if (this.popup) this.popup.classList.remove('active');
        if (this.popupImg) this.popupImg.src = '';
    }

    init() {
        this.cards.forEach(card => {
            card.setAttribute('tabindex', '0');

            card.addEventListener('click', e => {
                const btn = e.target.closest('.img-popup-btn');
                if (btn) {
                    e.stopPropagation();
                    this.open(btn.dataset.img);
                    return;
                }

                this.cards.forEach(c => c !== card && c.classList.remove('flipped'));
                card.classList.toggle('flipped');
            });

            card.addEventListener('keydown', e => {
                if (e.key === 'Enter') card.click();
            });
        });

        document.addEventListener('click', e => {
            if (!e.target.closest('.project-card')) {
                this.cards.forEach(c => c.classList.remove('flipped'));
            }
        });

        this.popupClose?.addEventListener('click', () => this.close());
        this.popup?.addEventListener('click', e => {
            if (e.target === this.popup) this.close();
        });

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') this.close();
        });
    }
}

/* ======================================================================================================================
   INIT ALL COMPONENTS
====================================================================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    // Navbar
    if (document.querySelector('.navbar')) new Navbar({ selector: '.navbar' });

    // Scroll Reveal
    if (document.querySelectorAll('.reveal').length) new ScrollReveal({ selector: '.reveal' });

    // TypedJS
    if (document.querySelector('.auto-type'))
        new AutoType({ selector: '.auto-type', strings: ["Mediengestalter", "Creator", "Coder"] });

    // ContactForm
    if (document.querySelector('#contactForm'))
        new ContactForm({ formSelector: '#contactForm', statusSelector: '.form-status' });

    // Carousel
    if (document.querySelector('.projects-carousel') && document.querySelector('.carousel-track') && document.querySelectorAll('.project-card').length)
        new Carousel({ carouselSelector: '.projects-carousel', trackSelector: '.carousel-track', cardSelector: '.project-card' });

    // Popup
    if (document.querySelector('#imgPopup') && document.querySelectorAll('.project-card').length)
        new Popup({ popupSelector: '#imgPopup', popupCloseSelector: '.popup-close', cardSelector: '.project-card' });
});