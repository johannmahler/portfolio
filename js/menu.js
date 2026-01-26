/* ======================================================================================================================
   SELECT ELEMENTS
========================= */
const navbar = document.querySelector('.navbar');
const navHeight = navbar ? navbar.offsetHeight : 0;

const navLinks = document.querySelectorAll('.nav-links a');
const sections = Array.from(navLinks).map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);

const menuToggle = document.querySelector('.menu-toggle');
const navLinksContainer = document.querySelector('.nav-links');

/* =========================
   SMOOTH SCROLL
========================= */
navLinks.forEach(link => {
    link.addEventListener('click', e => {
        const target = document.querySelector(link.getAttribute('href'));
        if (!target) return;

        e.preventDefault();

        const y = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

        window.scrollTo({ top: y, behavior: 'smooth' });

        // Close menu on mobile after click
        if (navLinksContainer.classList.contains('open')) {
            navLinksContainer.classList.remove('open');
            menuToggle.classList.remove('open');
            menuToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    });
});

/* =========================
   NAVBAR SCROLL EFFECT
========================= */
window.addEventListener('scroll', () => {
    if (!navbar) return;

    navbar.style.backgroundColor =
        window.scrollY > 50 ? 'rgba(10, 110, 10, 0.98)' : 'rgba(10, 10, 10, 0.95)';

    // ACTIVE LINK ON SCROLL
    const scrollPos = window.pageYOffset + navHeight + 10;
    sections.forEach(section => {
        if (!section) return;
        const top = section.offsetTop;
        const bottom = top + section.offsetHeight;
        const id = section.id;

        if (scrollPos >= top && scrollPos < bottom) {
            navLinks.forEach(link => link.classList.remove('active'));
            const activeLink = Array.from(navLinks).find(link => link.getAttribute('href') === `#${id}`);
            if (activeLink) activeLink.classList.add('active');
        }
    });
});

/* =========================
   HAMBURGER MENU TOGGLE
========================= */
if (menuToggle && navLinksContainer) {
    menuToggle.addEventListener('click', () => {
        const isOpen = navLinksContainer.classList.toggle('open');
        menuToggle.classList.toggle('open');
        menuToggle.setAttribute('aria-expanded', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });
}

/* =========================
   SCROLL REVEAL
========================= */
const revealElements = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(
    entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    },
    { rootMargin: '0px 0px -100px 0px', threshold: 0.1 }
);
revealElements.forEach(el => observer.observe(el));

// cursor typed
var typed = new Typed(".auto-type", {
    strings: ["Mediengestalter", "Creator", "Coder"],
    typeSpeed: 150,
    backSpeed: 150,
    loop: true
});
/* =========================
   CONTACT FORM (Formspree)
========================= */
const form = document.querySelector('#contactForm');
const status = document.querySelector('.form-status');

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = new FormData(form);

        try {
            const response = await fetch(form.action, {
                method: form.method,
                body: data,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                status.textContent = '✅ Nachricht erfolgreich gesendet!';
                status.style.color = '#2ecc71';
                form.reset();
            } else {
                status.textContent = '❌ Fehler beim Senden. Bitte erneut versuchen.';
                status.style.color = '#e74c3c';
            }
        } catch {
            status.textContent = '❌ Netzwerkfehler. Bitte später erneut.';
            status.style.color = '#e74c3c';
        }
    });
}
