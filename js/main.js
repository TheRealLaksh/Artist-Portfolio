document.addEventListener('DOMContentLoaded', () => {

    particlesJS("particles-js", {
        "particles": {
            "number": {
                "value": 80,
                "density": {
                    "enable": true,
                    "value_area": 800
                }
            },
            "color": {
                "value": "#d4af37"
            },
            "shape": {
                "type": "circle"
            },
            "opacity": {
                "value": 0.5,
                "random": false
            },
            "size": {
                "value": 3,
                "random": true
            },
            "line_linked": {
                "enable": true,
                "distance": 150,
                "color": "#d4af37",
                "opacity": 0.4,
                "width": 1
            },
            "move": {
                "enable": true,
                "speed": 2,
                "direction": "none",
                "random": false,
                "straight": false,
                "out_mode": "out",
                "bounce": false
            }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": {
                "onhover": {
                    "enable": true,
                    "mode": "repulse"
                },
                "onclick": {
                    "enable": true,
                    "mode": "push"
                },
                "resize": true
            },
            "modes": {
                "repulse": {
                    "distance": 100,
                    "duration": 0.4
                },
                "push": {
                    "particles_nb": 4
                }
            }
        },
        "retina_detect": true
    });

    const appContainer = document.getElementById('app-container');
    const lightboxOverlay = document.getElementById('lightbox-overlay');
    const lightboxImage = document.getElementById('lightbox-image');
    const navbar = document.getElementById('navbar');

    let currentPageUrl = '';

    async function loadPage(pageUrl) {
        if (currentPageUrl === pageUrl) return;

        if (appContainer.firstElementChild) {
            appContainer.firstElementChild.classList.add('is-exiting');
        }
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            const response = await fetch(pageUrl);
            if (!response.ok) throw new Error(`Could not load page: ${pageUrl}`);
            const html = await response.text();
            
            appContainer.innerHTML = html;
            currentPageUrl = pageUrl;
            window.scrollTo(0, 0); 
            
            handleNavVisibility();
            initializeScrollAnimations();

        } catch (error) {
            console.error("Error loading page:", error);
            appContainer.innerHTML = `<p class="text-center text-red-500">Failed to load page content.</p>`;
        }
    }

    function initializeScrollAnimations() {
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = parseInt(entry.target.dataset.delay) || 0;
                    setTimeout(() => {
                       entry.target.classList.add('visible');
                    }, delay);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        animatedElements.forEach(el => observer.observe(el));
    }

    window.showRolePage = (roleId) => loadPage(`pages/${roleId}.html`);
    window.showGalleryPage = (event) => {
        if (event) event.preventDefault();
        loadPage('pages/gallery.html');
    };
    window.showHomePage = (event) => {
        if (event) event.preventDefault();
        loadPage('pages/home.html');
    };

    window.goHomeAndScroll = async (targetId) => {
        if (currentPageUrl !== 'pages/home.html') {
            await loadPage('pages/home.html');
        }
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
        }
    };

    appContainer.addEventListener('click', (e) => {
        const anchor = e.target.closest('nav a[href^="#"]');
        if (anchor && currentPageUrl === 'pages/home.html') {
            e.preventDefault();
            const targetId = anchor.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        }

        const galleryImage = e.target.closest('#gallery-grid img');
        if (galleryImage) {
            openLightbox(galleryImage.src);
        }

        const copyButton = e.target.closest('.copy-btn');
        if (copyButton) {
            const textToCopy = copyButton.dataset.copy;
            const tooltip = copyButton.nextElementSibling; 

            const textArea = document.createElement("textarea");
            textArea.value = textToCopy;
            textArea.style.position = "fixed";
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);

            if (tooltip) {
                tooltip.classList.add('visible');
                setTimeout(() => {
                    tooltip.classList.remove('visible');
                }, 1500);
            }
        }
    });

    function openLightbox(src) {
        lightboxImage.src = src;
        lightboxOverlay.classList.remove('hidden');
        setTimeout(() => lightboxOverlay.classList.add('visible'), 20);
    }

    function closeLightbox() {
        lightboxOverlay.classList.remove('visible');
        setTimeout(() => {
            lightboxOverlay.classList.add('hidden');
            lightboxImage.src = "";
        }, 300);
    }
    lightboxOverlay.addEventListener('click', closeLightbox);
    
    function handleNavVisibility() {
        if (currentPageUrl === 'pages/home.html') {
            if (window.scrollY > window.innerHeight * 0.8) {
                navbar.classList.remove('-translate-y-full');
            } else {
                navbar.classList.add('-translate-y-full');
            }
        } else {
            navbar.classList.add('-translate-y-full');
        }
    }
    window.addEventListener('scroll', handleNavVisibility);
    
    loadPage('pages/home.html');
});