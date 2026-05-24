/* ==========================================================================
   TYPING EFFECT
   ========================================================================== */
   const texts = [
    "Web Developer",
    "Django Developer",
    "React Developer",
    "IT Tutor"
];

let speed = 100;
let textIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeEffect() {
    const typingElement = document.getElementById("typing");
    if (!typingElement) return; 

    const currentText = texts[textIndex];

    if (!isDeleting) {
        typingElement.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;

        if (charIndex === currentText.length) {
            isDeleting = true;
            setTimeout(typeEffect, 1200);
            return;
        }
    } else {
        typingElement.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;

        if (charIndex === 0) {
            isDeleting = false;
            textIndex++;

            if (textIndex === texts.length) {
                textIndex = 0;
            }
        }
    }

    setTimeout(typeEffect, isDeleting ? 50 : speed);
}

/* ==========================================================================
   PAGE SWITCHING SYSTEM
   ========================================================================== */
function showPage(pageId) {
    const pages = document.querySelectorAll(".page");
    pages.forEach(page => {
        page.classList.remove("active");
    });

    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add("active");
    }
}

/* ==========================================================================
   MAIN APPLICATION ARCHITECTURE (Runs on DOM Load)
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    
    // Start typing animation safely
    typeEffect();

    // 1. ACTIVE NAV LINK HIGHLIGHT
    const navLinks = document.querySelectorAll(".nav-links li a");
    navLinks.forEach(link => {
        link.addEventListener("click", function () {
            navLinks.forEach(nav => nav.classList.remove("active"));
            this.classList.add("active");
        });
    });

    // 2. GALLERY FILTERING LOGIC
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            galleryItems.forEach(item => {
                if (filterValue === 'all' || item.classList.contains(filterValue)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // 3. MODAL ELEMENT TARGETS (Matched precisely to your HTML)
    const modal = document.getElementById("galleryModal");
    const modalImg = document.getElementById("modalImg");
    const modalVideo = document.getElementById("modalVideo");
    const modalTitle = document.getElementById("modalTitle");
    const modalDesc = document.getElementById("modalDesc");
    const closeBtn = document.querySelector(".close-modal");

    const zoomInBtn = document.getElementById("modalZoomIn");
    const zoomOutBtn = document.getElementById("modalZoomOut");
    const zoomResetBtn = document.getElementById("modalZoomReset");

    let currentScale = 1;
    let activeMediaElement = null; 

    // Zoom Matrix Mutators
    function applyZoom() {
        if (activeMediaElement) {
            activeMediaElement.style.transform = `scale(${currentScale})`;
        }
    }

    function resetZoom() {
        currentScale = 1;
        applyZoom();
    }

    // 4. EXPANSION ON GALLERY ITEM CLICK
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            if (!modal) return;

            const img = item.querySelector('img');
            const video = item.querySelector('video');
            const h3Element = item.querySelector('.gallery-overlay h3') || item.querySelector('h3');
            const pElement = item.querySelector('.gallery-overlay p') || item.querySelector('p');
            
            const h3Text = h3Element ? h3Element.innerText : "Gallery Item";
            const pText = pElement ? pElement.innerText : "";

            // Clear previous states
            resetZoom();
            if (modalImg) modalImg.style.display = "none";
            if (modalVideo) {
                modalVideo.style.display = "none";
                modalVideo.pause();
            }

            // Bind image or video streams
            if (img && modalImg) {
                modalImg.src = img.src;
                modalImg.style.display = "block";
                activeMediaElement = modalImg;
            } else if (video && modalVideo) {
                const source = video.querySelector('source');
                if (source) {
                    modalVideo.querySelector('source').src = source.src;
                    modalVideo.load();
                    modalVideo.style.display = "block";
                    modalVideo.play();
                    activeMediaElement = modalVideo;
                }
            }

            // Assign captions
            if (modalTitle) modalTitle.innerText = h3Text;
            if (modalDesc) {
                modalDesc.innerHTML = `<strong>${pText}</strong><br><br>Our approach focuses on transforming theoretical concepts into practical reality, ensuring every participant achieves mastery in their respective tech path. This expanded view provides a detailed look into our process of turning technical education into career-ready skills.`;
            }

            // Open popup wrapper smoothly
            modal.style.display = "flex";
            document.body.style.overflow = "hidden"; // Stop page background scrolling
            modal.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: 'forwards' });
        });
    });

    // 5. ZOOM BUTTONS CLICK EVENT LISTENERS
    if (zoomInBtn && zoomOutBtn && zoomResetBtn) {
        zoomInBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Stop click event from hitting the background backdrop
            if (currentScale < 4.0) { 
                currentScale += 0.25;
                applyZoom();
            }
        });

        zoomOutBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentScale > 0.5) { 
                currentScale -= 0.25;
                applyZoom();
            }
        });

        zoomResetBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            resetZoom();
        });
    }

    // 6. CLOSING UTILITIES
    const closeModal = () => {
        if (!modal || modal.style.display === "none") return;
        
        const fadeOut = modal.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200 });
        fadeOut.onfinish = () => {
            modal.style.display = "none";
            document.body.style.overflow = ""; // Re-enable window scrolling
            if (modalVideo) {
                modalVideo.pause();
                const vSource = modalVideo.querySelector('source');
                if (vSource) vSource.src = "";
            }
            if (modalImg) modalImg.src = "";
            activeMediaElement = null;
        };
    };

    if (closeBtn) closeBtn.onclick = closeModal;

    // Close when clicking directly on background wrapper overlays
    window.onclick = (e) => { 
        if (e.target === modal || e.target.classList.contains('modal-wrapper') || e.target.classList.contains('modal-media-container')) { 
            closeModal(); 
        } 
    };

    // Close when pressing Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === "flex") {
            closeModal();
        }
    });
});

