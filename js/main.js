/**
 * Main application script for the interactive portfolio.
 * Handles SPA navigation, animations, and all interactive elements.
 *
 * @version 1.0.0
 * @author Your Name
 */
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. GLOBAL VARIABLES & INITIALIZATIONS --- //

    const appContainer = document.getElementById('app-container');
    const lightboxOverlay = document.getElementById('lightbox-overlay');
    const lightboxImage = document.getElementById('lightbox-image');
    const navbar = document.getElementById('navbar');
    let currentPageUrl = ''; // Tracks the current page to prevent redundant loads

    /**
     * Initializes the Particles.js background animation with a custom configuration.
     * This creates the interactive, floating particle effect.
     */
    particlesJS("particles-js", {
        "particles": {
            "number": { "value": 80, "density": { "enable": true, "value_area": 800 } },
            "color": { "value": "#d4af37" },
            "shape": { "type": "circle" },
            "opacity": { "value": 0.5, "random": false },
            "size": { "value": 3, "random": true },
            "line_linked": { "enable": true, "distance": 150, "color": "#d4af37", "opacity": 0.4, "width": 1 },
            "move": { "enable": true, "speed": 2, "direction": "none", "random": false, "straight": false, "out_mode": "out", "bounce": false }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": {
                "onhover": { "enable": true, "mode": "repulse" },
                "onclick": { "enable": true, "mode": "push" },
                "resize": true
            },
            "modes": {
                "repulse": { "distance": 100, "duration": 0.4 },
                "push": { "particles_nb": 4 }
            }
        },
        "retina_detect": true
    });

    // --- 2. CORE SPA (SINGLE-PAGE APPLICATION) LOGIC --- //

    /**
     * Asynchronously fetches and loads page content into the main app container.
     * Manages page transitions and initializes animations for new content.
     * @param {string} pageUrl - The URL of the HTML page to load.
     */
    async function loadPage(pageUrl) {
        if (currentPageUrl === pageUrl) return; // Don't reload the same page

        // Animate out the current content
        if (appContainer.firstElementChild) {
            appContainer.firstElementChild.classList.add('is-exiting');
        }
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait for animation

        try {
            const response = await fetch(pageUrl);
            if (!response.ok) throw new Error(`Could not load page: ${pageUrl}`);
            const html = await response.text();

            appContainer.innerHTML = html;
            currentPageUrl = pageUrl;
            window.scrollTo(0, 0); // Scroll to top on new page

            // Initialize scripts for the newly loaded content
            handleNavVisibility();
            initializeScrollAnimations();

        } catch (error) {
            console.error("Error loading page:", error);
            appContainer.innerHTML = `<p class="text-center text-red-500">Failed to load page content.</p>`;
        }
    }

    /**
     * Sets up global navigation functions to be called from the HTML (e.g., via onclick).
     */
    window.showRolePage = (roleId) => loadPage(`pages/${roleId}.html`);
    window.showGalleryPage = (event) => {
        if (event) event.preventDefault();
        loadPage('pages/gallery.html');
    };
    window.showHomePage = (event) => {
        if (event) event.preventDefault();
        loadPage('pages/home.html');
    };

    /**
     * Special navigation function to return to the home page and then scroll to a specific section.
     * @param {string} targetId - The ID of the element to scroll to (e.g., '#about').
     */
    window.goHomeAndScroll = async (targetId) => {
        if (currentPageUrl !== 'pages/home.html') {
            await loadPage('pages/home.html');
        }
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // --- 3. EVENT LISTENERS & HANDLERS --- //

    /**
     * Main event listener for the app container. Uses event delegation to handle clicks
     * on dynamically loaded content like gallery images and copy buttons.
     */
    appContainer.addEventListener('click', (e) => {
        // Handle smooth scrolling for on-page anchor links on the home page
        const anchor = e.target.closest('nav a[href^="#"]');
        if (anchor && currentPageUrl === 'pages/home.html') {
            e.preventDefault();
            const targetId = anchor.getAttribute('href');
            document.querySelector(targetId)?.scrollIntoView({ behavior: 'smooth' });
        }

        // Handle gallery image clicks to open the lightbox
        const galleryImage = e.target.closest('#gallery-grid img');
        if (galleryImage) {
            openLightbox(galleryImage.src);
        }

        // Handle clicks on copy-to-clipboard buttons
        const copyButton = e.target.closest('.copy-btn');
        if (copyButton) {
            handleCopy(copyButton);
        }
    });

    /**
     * Handles clicks on the lightbox overlay to close it.
     */
    lightboxOverlay.addEventListener('click', closeLightbox);

    /**
     * Handles the window scroll event to control the main navbar's visibility.
     */
    window.addEventListener('scroll', handleNavVisibility);

    // --- 4. COMPONENT-SPECIFIC FUNCTIONS --- //

    /**
     * Initializes IntersectionObserver to trigger 'visible' class on elements as they scroll into view.
     */
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

    /**
     * Copies text from a data attribute to the clipboard and shows a confirmation tooltip.
     * @param {HTMLElement} button - The button element that was clicked.
     */
    function handleCopy(button) {
        const textToCopy = button.dataset.copy;
        const tooltip = button.nextElementSibling;

        navigator.clipboard.writeText(textToCopy).then(() => {
            if (tooltip) {
                tooltip.classList.add('visible');
                setTimeout(() => {
                    tooltip.classList.remove('visible');
                }, 1500);
            }
        }).catch(err => console.error('Failed to copy text: ', err));
    }

    /**
     * Opens the lightbox with a specified image source.
     * @param {string} src - The URL of the image to display.
     */
    function openLightbox(src) {
        lightboxImage.src = src;
        lightboxOverlay.classList.remove('hidden');
        setTimeout(() => lightboxOverlay.classList.add('visible'), 20); // Delay for transition
    }

    /**
     * Closes the lightbox and clears the image source.
     */
    function closeLightbox() {
        lightboxOverlay.classList.remove('visible');
        setTimeout(() => {
            lightboxOverlay.classList.add('hidden');
            lightboxImage.src = "";
        }, 300); // Wait for transition
    }

    /**
     * Shows or hides the main navigation bar based on the scroll position and current page.
     * The navbar is hidden on the top section of the home page.
     */
    function handleNavVisibility() {
        if (currentPageUrl === 'pages/home.html') {
            if (window.scrollY > window.innerHeight * 0.8) {
                navbar.classList.remove('-translate-y-full');
            } else {
                navbar.classList.add('-translate-y-full');
            }
        } else {
            // For all other pages, the nav is not used, so we ensure it's hidden.
            navbar.classList.add('-translate-y-full');
        }
    }

    // --- 5. INITIAL APPLICATION LOAD --- //

    /**
     * Kicks off the application by loading the home page by default.
     */
    loadPage('pages/home.html');
});