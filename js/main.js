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
    const navbar = document.getElementById('navbar');

    let currentPageUrl = '';

    // Function to load and display a new page
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

    // NEW: Function to go to home and then scroll
    window.goHomeAndScroll = async (targetId) => {
        // Only load home if we aren't already there
        if (currentPageUrl !== 'pages/home.html') {
            await loadPage('pages/home.html');
        }
        
        // Now that the homepage is loaded, find the target element and scroll
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
        }
    };

    // --- Event Delegation for Dynamic Content ---
    appContainer.addEventListener('click', (e) => {
        // This now specifically handles ONLY the nav clicks on the home page itself
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
            if (window.scrollY > window.innerHeight * 0.8) {
                navbar.classList.remove('-translate-y-full');
            } else {
                navbar.classList.add('-translate-y-full');
            }
        } else {
            // Make the navbar visible but not sticky on other pages
            navbar.classList.add('-translate-y-full'); // This keeps it hidden unless logic changes
        }
    }
    window.addEventListener('scroll', handleNavVisibility);
    
    // --- Initial Page Load ---
    loadPage('pages/home.html');
});