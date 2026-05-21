document.addEventListener("DOMContentLoaded", () => {
    // Prevent browser from restoring previous scroll position on reload
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    // --- 1. INITIALIZATION & DATA INJECTION ---
    document.getElementById("name").innerText = data.name;
    document.getElementById("about").innerHTML = data.about;
    document.getElementById("contact").innerHTML = data.contact;
    document.getElementById("copyrights").innerHTML = data.copyrights;

    const wandererHTML = `
        <img src="assets/gifs_and_pics/wanderer_peek_.png" class="wanderer-body" alt="Wanderer">
        <img src="assets/gifs_and_pics/wanderer_peek_hand.png" class="wanderer-hand">
    `;

    // Background Selection
    const isPhone = window.innerWidth <= 768;
    const bgs = isPhone ? data.phone_backgrounds : data.backgrounds;
    const randomBg = bgs[Math.floor(Math.random() * bgs.length)];
    const [bgUrl, bgCredits] = randomBg.split('|');

    document.body.style.background = `url(${bgUrl.trim()}) no-repeat center center fixed`;
    document.body.style.backgroundSize = 'cover';
    document.getElementById("bgCredits").innerHTML = bgCredits;

    // Create an image object to preload the background
    const bgImage = new Image();
    bgImage.src = bgUrl.trim();
    
    // Once the image is fully downloaded, apply it and hide the loader
    bgImage.onload = () => {
        document.body.style.background = `url(${bgImage.src}) no-repeat center center fixed`;
        document.body.style.backgroundSize = 'cover';
        document.getElementById("bgCredits").innerHTML = bgCredits;
        
        // Hide the loading screen
        document.getElementById("loading-screen").classList.add("hidden");
        // Destroy the loading screen after the fade-out transition to free up memory
        setTimeout(() => {
            const loader = document.getElementById("loading-screen");
            if (loader) {
                loader.remove();
            }
        }, 500);
    };

    // --- 2. DOM POPULATION (Using Document Fragments for Performance) ---

    // Skills
    const skillsFragment = document.createDocumentFragment();
    data.skills.forEach(skillObj => {
        for (const [category, items] of Object.entries(skillObj)) {
            const el = document.createElement("span");
            el.className = "skill";
            el.innerHTML = `<b>${category}</b>: ${items}`;
            skillsFragment.appendChild(el);
        }
    });
    document.getElementById("skills").appendChild(skillsFragment);

    // Work Experience
    const expFragment = document.createDocumentFragment();
    data.work_experience.forEach((exp, index) => {
        const container = document.createElement("div");
        container.className = "card-container";

        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <div class="card-header">
                <h3>${exp.title}</h3>
                <span class="date">${exp.duration}</span>
            </div>
            <h4>${exp.company}</h4>
            <div class="description">${exp.description}</div>
        `;

        if (index === 0) container.innerHTML = wandererHTML;
        container.appendChild(card);
        expFragment.appendChild(container);
    });
    document.getElementById("work_experience").appendChild(expFragment);

    // Projects
    const projFragment = document.createDocumentFragment();
    data.projects.forEach((p, index) => {
        const container = document.createElement("div");
        container.className = "card-container";

        const card = document.createElement("div");
        card.className = "card";

        const gallery = document.createElement("div");
        gallery.className = "gallery";

        // Create images (no inline event listeners)
        p.images.forEach(img => {
            const image = document.createElement("img");
            image.src = img;
            image.alt = p.title;
            image.className = "project-image";
            image.loading = "lazy";
            gallery.appendChild(image);
        });

        card.innerHTML = `
            <div class="card-header">
                <h3>${p.title}</h3>
                <span class="date">${p.date}</span>
            </div>
            <div class="description">${p.description}</div>
        `;

        card.appendChild(gallery);
        if (index === 0) container.innerHTML = wandererHTML;
        container.appendChild(card);
        projFragment.appendChild(container);
    });
    document.getElementById("projects").appendChild(projFragment);

    // Education
    const eduFragment = document.createDocumentFragment();
    data.education.forEach((edu, index) => {
        const container = document.createElement("div");
        container.className = "card-container";

        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <div class="card-header">
                <h3>${edu.degree}</h3>
                <span class="date">${edu.duration}</span>
            </div>
            <h4>Institution: ${edu.institution}</h4>
            <div class="description">${edu.description}</div>
        `;

        if (index === 0) container.innerHTML = wandererHTML;
        container.appendChild(card);
        eduFragment.appendChild(container);
    });
    document.getElementById("education").appendChild(eduFragment);

    // --- 3. UI INTERACTION LOGIC ---

    // Tab Switching (Event Delegation)
    const tabControls = document.getElementById("tab-controls");
    const tabContents = document.querySelectorAll(".tab-content");
    const tabButtons = document.querySelectorAll(".tab-button");

    tabControls.addEventListener("click", (e) => {
        if (e.target.classList.contains("tab-button")) {
            const targetId = e.target.getAttribute("data-target");

            tabButtons.forEach(btn => btn.classList.remove("active"));
            tabContents.forEach(content => content.classList.remove("active"));

            e.target.classList.add("active");
            document.getElementById(targetId).classList.add("active");
        }
    });

    // Scroll Detection (Throttled with requestAnimationFrame)
    const navContainer = document.getElementById("nav-container");
    const mainContent = document.querySelector(".content-wrapper");
    let isTicking = false;

    window.addEventListener("scroll", () => {
        if (!isTicking) {
            window.requestAnimationFrame(() => {
                const contentTop = mainContent.getBoundingClientRect().top;
                if (contentTop < 85) {
                    navContainer.classList.add("scrolled");
                } else {
                    navContainer.classList.remove("scrolled");
                }
                isTicking = false;
            });
            isTicking = true;
        }
    });

    // --- 4. MODAL LOGIC & EVENT DELEGATION ---
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImg");
    const modalClose = document.querySelector(".modal-close");
    const zoomSlider = document.getElementById("zoomSlider");

    // Project Gallery Event Delegation
    document.getElementById("projects").addEventListener("click", (e) => {
        if (e.target.classList.contains("project-image")) {
            openImageModal(e.target.src, e.target.alt);
        }
    });

    let scale = 1, panX = 0, panY = 0;
    let dragging = false, activePointerId = null;
    let dragStartX = 0, dragStartY = 0, dragStartPanX = 0, dragStartPanY = 0;

    function updateImageTransform() {
        // Use translate3d for GPU hardware acceleration
        modalImg.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${scale})`;
        modalImg.style.cursor = scale > 1 ? (dragging ? 'grabbing' : 'grab') : 'zoom-in';
    }

    function resetImageTransform() {
        scale = 1; panX = 0; panY = 0; zoomSlider.value = '1';
        updateImageTransform();
    }

    function openImageModal(src, alt) {
        modalImg.src = src;
        modalImg.alt = alt;
        resetImageTransform();
        modal.classList.add("visible");
        modal.setAttribute("aria-hidden", "false");
    }

    function closeImageModal() {
        modal.classList.remove("visible");
        modal.setAttribute("aria-hidden", "true");
        // Clear src slightly after animation to prevent layout pop
        setTimeout(() => { modalImg.src = ""; }, 200);
        resetImageTransform();
    }

    modalClose.addEventListener("click", closeImageModal);
    modal.addEventListener("click", event => {
        if (event.target === modal || event.target.classList.contains("modal-viewer")) {
            closeImageModal();
        }
    });

    zoomSlider.addEventListener("input", event => {
        scale = parseFloat(event.target.value);
        if (scale <= 1) { panX = 0; panY = 0; }
        updateImageTransform();
    });

    // Pointer Events for Modal Image
    modalImg.addEventListener("pointerdown", event => {
        if (scale <= 1) return;
        event.preventDefault();
        dragging = true;
        activePointerId = event.pointerId;
        dragStartX = event.clientX;
        dragStartY = event.clientY;
        dragStartPanX = panX;
        dragStartPanY = panY;
        modalImg.setPointerCapture(activePointerId);
        updateImageTransform();
    });

    modalImg.addEventListener("pointermove", event => {
        if (!dragging) return;
        panX = dragStartPanX + event.clientX - dragStartX;
        panY = dragStartPanY + event.clientY - dragStartY;
        // Optimization: requestAnimationFrame could be used here too if stuttering occurs
        updateImageTransform();
    });

    const stopDragging = () => {
        if (!dragging) return;
        if (activePointerId !== null) {
            try { modalImg.releasePointerCapture(activePointerId); } catch (e) { }
            activePointerId = null;
        }
        dragging = false;
        updateImageTransform();
    };

    // --- 5. MOBILE SCROLL ARROWS LOGIC ---
    const tabsScroll = document.getElementById("tab-controls");
    const leftArrow = document.getElementById("scroll-left");
    const rightArrow = document.getElementById("scroll-right");

    function updateArrowVisibility() {
        if (!leftArrow || !rightArrow || window.innerWidth > 768) return;

        // If the container's content is smaller than the viewport, hide both arrows
        if (tabsScroll.scrollWidth <= tabsScroll.clientWidth) {
            leftArrow.classList.add("hidden");
            rightArrow.classList.add("hidden");
            return;
        }

        // Hide left arrow if scrolled all the way to the left
        if (tabsScroll.scrollLeft <= 5) {
            leftArrow.classList.add("hidden");
        } else {
            leftArrow.classList.remove("hidden");
        }

        // Hide right arrow if scrolled all the way to the right
        if (Math.ceil(tabsScroll.scrollLeft + tabsScroll.clientWidth) >= tabsScroll.scrollWidth - 5) {
            rightArrow.classList.add("hidden");
        } else {
            rightArrow.classList.remove("hidden");
        }
    }

    if (leftArrow && rightArrow) {
        leftArrow.addEventListener("click", () => {
            tabsScroll.scrollBy({ left: -150, behavior: 'smooth' });
        });

        rightArrow.addEventListener("click", () => {
            tabsScroll.scrollBy({ left: 150, behavior: 'smooth' });
        });

        // Listen for scrolling and resizing to update arrow states
        tabsScroll.addEventListener("scroll", updateArrowVisibility);
        window.addEventListener("resize", updateArrowVisibility);

        // Run once on load to establish initial visibility 
        // (Timeout ensures fonts/padding have fully rendered before calculating width)
        setTimeout(updateArrowVisibility, 150);
    }

    // Binding to window ensures we don't drop the event if cursor leaves the browser window
    window.addEventListener("pointerup", stopDragging);
    window.addEventListener("pointercancel", stopDragging);
    modalImg.addEventListener("dragstart", event => event.preventDefault());
});