document.addEventListener('DOMContentLoaded', () => {

    // --- Gradient Background Initialization ---
    var granimInstance = new Granim({
        element: '#gradient-canvas',
        direction: 'diagonal',
        isPausedWhenNotInView: true,
        states : {
            "default-state": {
                gradients: [
                    ['#100000', '#4d0000'],
                    ['#400000', '#100000']
                ],
                transitionSpeed: 5000
            }
        }
    });

    // --- Global Page Navigation & Lightbox Logic ---
    const appContainer = document.getElementById('app-container');
    const lightboxOverlay = document.getElementById('lightbox-overlay');
    const lightboxImage = document.getElementById('lightbox-image');
    const navbar = document.getElementById('navbar'); // Get reference to the persistent navbar

    let currentPageUrl = ''; // Track the current page URL

    // Function to load and display a new page
    async function loadPage(pageUrl) {
        if (currentPageUrl === pageUrl) return;

        // Start the exit animation for the current content
        if (appContainer.firstElementChild) {
            appContainer.firstElementChild.classList.add('is-exiting');
        }

        // Wait for the exit animation to complete
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            // Fetch the new page content
            const response = await fetch(pageUrl);
            if (!response.ok) throw new Error(`Could not load page: ${pageUrl}`);
            const html = await response.text();
            
            // Replace the content
            appContainer.innerHTML = html;
            currentPageUrl = pageUrl;
            window.scrollTo(0, 0); 
            
            // Handle navbar visibility after page load
            handleNavVisibility();

            // Re-attach scroll animations for the new content
            initializeScrollAnimations();

        } catch (error) {
            console.error("Error loading page:", error);
            appContainer.innerHTML = `<p class="text-center text-red-500">Failed to load page content.</p>`;
        }
    }

    // Initialize Scroll Animations for new content
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

    // --- Global Navigation Functions ---
    window.showRolePage = (roleId) => loadPage(`pages/${roleId}.html`);
    window.showGalleryPage = (event) => {
        if (event) event.preventDefault();
        loadPage('pages/gallery.html');
    };
    window.showHomePage = (event) => {
        if (event) event.preventDefault();
        loadPage('pages/home.html');
    };

    // --- Event Delegation for Dynamic Content ---
    appContainer.addEventListener('click', (e) => {
        // Handle home page anchor links
        const anchor = e.target.closest('a[href^="#"]');
        if (anchor && currentPageUrl === 'pages/home.html') {
            e.preventDefault();
            const targetId = anchor.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        }

        // Handle gallery image clicks
        const galleryImage = e.target.closest('#gallery-grid img');
        if (galleryImage) {
            openLightbox(galleryImage.src);
        }
    });

    // --- Lightbox Functions ---
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
    
    // --- Navbar Visibility Control ---
    function handleNavVisibility() {
        if (currentPageUrl === 'pages/home.html') {
            // Show nav on scroll down on home page
            if (window.scrollY > window.innerHeight * 0.8) {
                navbar.classList.remove('-translate-y-full');
            } else {
                navbar.classList.add('-translate-y-full');
            }
        } else {
            // Always hide nav on other pages
            navbar.classList.add('-translate-y-full');
        }
    }
    window.addEventListener('scroll', handleNavVisibility);
    
    // --- Initial Page Load ---
    loadPage('pages/home.html');
});