document.addEventListener('DOMContentLoaded', () => {

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

    // --- PAGE NAVIGATION LOGIC ---
    const pages = document.querySelectorAll('.page');
    let currentPage = document.getElementById('home-page');
    const galleryPage = document.getElementById('gallery-page');
    const videoIframes = {
        'role-1': document.getElementById('video-1'),
        'role-2': document.getElementById('video-2'),
        'role-3': document.getElementById('video-3')
    };
    const videoSources = {
        'role-1': 'https://www.youtube.com/embed/dQw4w9WgXcQ?start=43&end=103&autoplay=1&rel=0&modestbranding=1&controls=0&iv_load_policy=3',
        'role-2': 'https://www.youtube.com/embed/9GgxinPwAGc?start=50&end=110&autoplay=1&rel=0&modestbranding=1&controls=0&iv_load_policy=3',
        'role-3': 'https://www.youtube.com/embed/2zToGikoP2E?start=15&end=75&autoplay=1&rel=0&modestbranding=1&controls=0&iv_load_policy=3'
    };

    const stopAllVideos = () => {
        Object.values(videoIframes).forEach(iframe => {
            if (iframe) iframe.src = '';
        });
    };

    const transitionToPage = (newPageId) => {
        const newPage = document.getElementById(newPageId);
        if (!newPage || newPage === currentPage) return;

        if (currentPage) {
            currentPage.classList.add('opacity-0');
        }

        setTimeout(() => {
            if (currentPage) {
                currentPage.classList.add('hidden');
            }
            
            newPage.classList.remove('hidden');
            setTimeout(() => {
                 newPage.classList.remove('opacity-0');
            }, 20);

            currentPage = newPage;
            window.scrollTo(0, 0);

        }, 500); // Match CSS transition duration
    };

    window.showRolePage = (roleId) => {
        transitionToPage(roleId);
        setTimeout(() => {
             if (videoIframes[roleId]) {
                videoIframes[roleId].src = videoSources[roleId];
            }
        }, 520); // Start video after fade-in
    };

    window.showGalleryPage = (event) => {
        if (event) event.preventDefault();
        transitionToPage('gallery-page');
        stopAllVideos();
    };
    
    window.showHomePage = (event) => {
        if (event) event.preventDefault();
        transitionToPage('home-page');
        stopAllVideos();
    };

    // --- Navbar Visibility on Scroll ---
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        const homePage = document.getElementById('home-page');
        if(homePage.classList.contains('hidden')) {
            navbar.classList.add('-translate-y-full');
            return;
        }
        if (window.scrollY > window.innerHeight * 0.8) {
            navbar.classList.remove('-translate-y-full');
        } else {
            navbar.classList.add('-translate-y-full');
        }
    });

    // --- SMOOTH SCROLL ANIMATION FOR NAV LINKS ---
    document.querySelectorAll('nav a[href^="#"], a[href^="#portfolio"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // --- General Scroll Animations ---
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
    
});