(() => {
    'use strict';

    /* ======================================================================================================================
    CONFIG
    ====================================================================================================================== */
    const CONFIG = {
        NAV_SCROLL_THRESHOLD: 50
    };

    /* ======================================================================================================================
    NAVBAR
    ====================================================================================================================== */
    class Navbar {

        constructor({ selector }) {

            this.navbar = document.querySelector(selector);
            this.links = document.querySelectorAll(`${selector} .nav-links a`);
            this.menuToggle = document.querySelector(`${selector} .menu-toggle`);
            this.linksContainer = document.querySelector(`${selector} .nav-links`);

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

            const scrolled = window.scrollY > CONFIG.NAV_SCROLL_THRESHOLD;
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

                    window.scrollTo({
                        top: y,
                        behavior: 'smooth'
                    });

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
    SCROLL REVEAL
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

            }, {
                rootMargin: '0px 0px -100px 0px',
                threshold: 0.1
            });

            this.elements.forEach(el => observer.observe(el));

        }

    }

    /* ======================================================================================================================
    TYPED JS
    ====================================================================================================================== */
    class AutoType {

        constructor({ selector, strings }) {

            if (!window.Typed || !document.querySelector(selector)) return;

            new Typed(selector, {
                strings,
                typeSpeed: 50,
                backSpeed: 50,
                loop: true
            });

        }

    }

    /* ======================================================================================================================
    CONTACT FORM
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

                    const res = await fetch(this.form.action, {
                        method: this.form.method,
                        body: data,
                        headers: { 'Accept': 'application/json' }
                    });

                    if (res.ok) {

                        this.status.textContent = '✅ Nachricht erfolgreich gesendet!';
                        this.status.style.color = '#2ecc71';

                        this.form.reset();

                    } else {

                        throw new Error();

                    }

                } catch {

                    this.status.textContent = '❌ Fehler beim Senden.';
                    this.status.style.color = '#e74c3c';

                }

                btn.disabled = false;

            });

        }

    }

    /* ======================================================================================================================
    PROJECT CAROUSEL
    ====================================================================================================================== */
    class ProjectCarousel {

        constructor({ trackSelector, dotSelector }) {

            this.track = document.querySelector(trackSelector);
            this.cards = this.track?.querySelectorAll('.project-card');
            this.dots = document.querySelectorAll(dotSelector);

            this.index = 0;

            this.init();

        }

        cardsPerView() {

            const w = window.innerWidth;

            if (w <= 768) return 1;
            if (w <= 1024) return 2;

            return 3;

        }

        update() {

            const card = this.cards[0];
            if (!card) return;

            const gap = 32;
            const width = card.offsetWidth + gap;

            this.track.style.transform = `translateX(-${this.index * width}px)`;

            const page = Math.floor(this.index / this.cardsPerView());

            this.dots.forEach(d => d.classList.remove('active'));
            this.dots[page]?.classList.add('active');

        }

        goTo(i) {

            const max = this.cards.length - this.cardsPerView();

            this.index = Math.max(0, Math.min(i, max));

            this.update();

        }

        initDots() {

            this.dots.forEach((dot, i) => {

                dot.addEventListener('click', () => {

                    this.goTo(i * this.cardsPerView());

                });

            });

        }

        initSwipe() {

            let startX = 0;

            this.track.addEventListener('touchstart', e => {

                startX = e.touches[0].clientX;

            });

            this.track.addEventListener('touchend', e => {

                const endX = e.changedTouches[0].clientX;
                const diff = startX - endX;

                if (Math.abs(diff) < 50) return;

                if (diff > 0) this.goTo(this.index + 1);
                else this.goTo(this.index - 1);

            });

        }

        init() {

            if (!this.track || !this.cards.length) return;

            this.initDots();
            this.initSwipe();

            window.addEventListener('resize', () => this.update());

            this.update();

        }

    }

    /* ======================================================================================================================
    POPUP + FLIPCARD
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

            if (!this.popup || !this.popupImg) return;

            this.popupImg.src = src;
            this.popup.classList.add('active');

        }

        close() {

            this.popup?.classList.remove('active');
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
    MAGNETIC BUTTONS
    ====================================================================================================================== */
    class MagneticButtons {

        constructor(selector = ".cta-button") {

            this.buttons = document.querySelectorAll(selector);

            this.buttons.forEach(btn => {

                btn.addEventListener("mousemove", e => {

                    const rect = btn.getBoundingClientRect();

                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;

                    btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;

                });

                btn.addEventListener("mouseleave", () => {

                    btn.style.transform = "translate(0,0)";

                });

            });

        }

    }
    /* ======================================================================================================================
3D HOVER TILT CARDS
====================================================================================================================== */
    class CardTilt {

        constructor(selector = ".project-card") {

            this.cards = document.querySelectorAll(selector);

            this.cards.forEach(card => {

                card.addEventListener("mousemove", e => {

                    const rect = card.getBoundingClientRect();

                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;

                    const rotateX = -(y - centerY) / 12;
                    const rotateY = (x - centerX) / 12;

                    card.style.transform = `
perspective(1000px)
rotateX(${rotateX}deg)
rotateY(${rotateY}deg)
scale(1.03)
`;

                });

                card.addEventListener("mouseleave", () => {

                    card.style.transform = `
perspective(1000px)
rotateX(0deg)
rotateY(0deg)
scale(1)
`;

                });

            });

        }

    }

    /* ======================================================================================================================
    INIT
    ====================================================================================================================== */
    document.addEventListener('DOMContentLoaded', () => {

        if (document.querySelector('.navbar'))
            new Navbar({ selector: '.navbar' });

        if (document.querySelectorAll('.reveal').length)
            new ScrollReveal({ selector: '.reveal' });

        if (document.querySelector('.auto-type'))
            new AutoType({
                selector: '.auto-type',
                strings: ["Mediengestalter", "Creator", "Coder"]
            });

        if (document.querySelector('#contactForm'))
            new ContactForm({
                formSelector: '#contactForm',
                statusSelector: '.form-status'
            });

        if (document.querySelector('.carousel-track'))
            new ProjectCarousel({
                trackSelector: '.carousel-track',
                dotSelector: '.dot'
            });

        if (document.querySelector('#imgPopup'))
            new Popup({
                popupSelector: '#imgPopup',
                popupCloseSelector: '.popup-close',
                cardSelector: '.project-card'
            });

        new MagneticButtons();
        new CardTilt();

    });

})();
