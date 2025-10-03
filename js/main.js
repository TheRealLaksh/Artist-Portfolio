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

    // --- Global Page Navigation Logic ---
    const appContainer = document.getElementById('app-container');

    // Function to load and display a new page
    async function loadPage(pageUrl) {
        // Start the exit animation for the current content
        if (appContainer.firstElementChild) {
            appContainer.firstElementChild.classList.add('is-exiting');
        }

        // Wait for the exit animation to complete
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            // Fetch the new page content
            const response = await fetch(pageUrl);
            if (!response.ok) {
                throw new Error(`Could not load page: ${pageUrl}`);
            }
            const html = await response.text();
            
            // Replace the content
            appContainer.innerHTML = html;
            window.scrollTo(0, 0); // Scroll to top of new page

            // Re-attach all necessary event listeners and animations for the new content
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
    // These are attached to the window object so they can be called from the inline onclick attributes in your HTML files.
    window.showRolePage = (roleId) => {
        loadPage(`pages/${roleId}.html`);
    };

    window.showGalleryPage = (event) => {
        if (event) event.preventDefault();
        loadPage('pages/gallery.html');
    };
    
    window.showHomePage = (event) => {
        if (event) event.preventDefault();
        loadPage('pages/home.html');
    };

    // --- SMOOTH SCROLL FOR HOME PAGE ANCHOR LINKS ---
    // Using event delegation on the app container
    appContainer.addEventListener('click', (e) => {
        // Check if the clicked element is a nav link on the home page
        const anchor = e.target.closest('nav a[href^="#"]');
        if (anchor && appContainer.querySelector('#home-page-content')) {
            e.preventDefault();
            const targetId = anchor.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        }
    });
    
    // --- Initial Page Load ---
    loadPage('pages/home.html');
});