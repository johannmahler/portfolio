/* ======================================================================================================================
   SELECT ELEMENTS
========================= */
const navbar = document.querySelector('.navbar');
const navHeight = navbar ? navbar.offsetHeight : 0;

const navLinks = document.querySelectorAll('.nav-links a');
const sections = Array.from(navLinks)
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

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

        // Close mobile menu
        if (navLinksContainer.classList.contains('open')) {
            navLinksContainer.classList.remove('open');
            menuToggle.classList.remove('open');
            menuToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    });
});

/* =========================
   NAVBAR SCROLL EFFECT & ACTIVE LINK
========================= */
window.addEventListener('scroll', () => {
    if (!navbar) return;

    navbar.style.backgroundColor =
        window.scrollY > 50 ? 'rgba(10, 110, 10, 0.48)' : 'rgba(10, 10, 10, 0.51)';

    const scrollPos = window.pageYOffset + navHeight + 10;
    sections.forEach(section => {
        if (!section) return;
        const top = section.offsetTop;
        const bottom = top + section.offsetHeight;
        const id = section.id;

        if (scrollPos >= top && scrollPos < bottom) {
            navLinks.forEach(link => link.classList.remove('active'));
            const activeLink = Array.from(navLinks).find(
                link => link.getAttribute('href') === `#${id}`
            );
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

/* =========================
   TYPED JS
========================= */
var typed = new Typed(".auto-type", {
    strings: ["Mediengestalter", "Creator", "Coder"],
    typeSpeed: 50,
    backSpeed: 50,
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

/* =========================
   PROJECTS CAROUSEL
========================= */
const track = document.querySelector('.carousel-track');
const cards = document.querySelectorAll('.project-card');
const prevBtn = document.querySelector('.carousel-btn.prev');
const nextBtn = document.querySelector('.carousel-btn.next');

let index = 0;

function updateCarousel() {
    if (!track || cards.length === 0) return;

    const cardWidth = cards[0].offsetWidth;
    const gap = 32;
    const carousel = document.querySelector('.projects-carousel');
    const carouselWidth = carousel.offsetWidth;

    const totalWidth = cards.length * cardWidth + (cards.length - 1) * gap;

    let offset;

    if (totalWidth <= carouselWidth) {
        // Alle Cards passen -> zentrieren
        offset = (carouselWidth - totalWidth) / 2;
    } else {
        // Mehr Cards als Container -> aktuelle Card zentrieren
        offset = (carouselWidth - cardWidth) / 2 - index * (cardWidth + gap);

        // Max/Min Offset damit nicht über Scrollbereich hinaus
        const maxOffset = 0;
        const minOffset = carouselWidth - totalWidth;
        if (offset > maxOffset) offset = maxOffset;
        if (offset < minOffset) offset = minOffset;
    }

    // Setze transform
    track.style.transform = `translateX(${offset}px)`;
}






window.addEventListener('load', updateCarousel);
window.addEventListener('resize', updateCarousel);

/* =========================
   MOBILE TAP FLIP & POPUP FIX
========================= */
const popup = document.getElementById('imgPopup');
const popupImg = popup.querySelector('img');
const popupClose = popup.querySelector('.popup-close');

cards.forEach(card => {
    card.addEventListener('click', e => {
        const btn = e.target.closest('.img-popup-btn');

        // Button klick → Popup öffnen
        if (btn) {
            e.stopPropagation();
            const imgSrc = btn.dataset.img;
            popupImg.src = imgSrc;
            popup.classList.add('active');
            if (navigator.vibrate) navigator.vibrate(15);
            return;
        }

        // Flip Karte
        cards.forEach(c => { if (c !== card) c.classList.remove('flipped'); });
        const flipped = card.classList.toggle('flipped');
        if (navigator.vibrate) navigator.vibrate(flipped ? 15 : [10, 40]);
    });
});

// Klick außerhalb flip zurücksetzen
document.addEventListener('click', e => {
    if (!e.target.closest('.project-card')) {
        cards.forEach(card => card.classList.remove('flipped'));
    }
});

// Popup schließen
popupClose.addEventListener('click', closePopup);
popup.addEventListener('click', e => {
    if (e.target === popup) closePopup();
});
function closePopup() {
    popup.classList.remove('active');
    popupImg.src = '';
}

/* =========================
   CAROUSEL SWIPE MOBILE
========================= */

