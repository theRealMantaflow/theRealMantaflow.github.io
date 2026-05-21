// Prevent browser from restoring previous scroll position on reload
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

document.getElementById("name").innerText = data.name;
document.getElementById("about").innerHTML = data.about;
document.getElementById("contact").innerHTML = data.contact;
document.getElementById("copyrights").innerHTML = data.copyrights;
// Helper variable containing the HTML for the peeking effect
const wandererHTML = `
    <img src="assets/gifs_and_pics/wanderer_peek_.png" class="wanderer-body" alt="Wanderer">
    <img src="assets/gifs_and_pics/wanderer_peek_hand.png" class="wanderer-hand">
`;

// Random background selection
const isPhone = window.innerWidth <= 768;
const bgs = isPhone ? data.phone_backgrounds : data.backgrounds;
const randomBg = bgs[Math.floor(Math.random() * bgs.length)];
const [bgUrl, bgCredits] = randomBg.split('|');
document.body.style.background = `url(${bgUrl.trim()}) no-repeat center center fixed`;
document.body.style.backgroundSize = 'cover';

// Decorate the about section
// const aboutEl = document.getElementById("about");
// aboutEl.className = "about-card";

document.getElementById("bgCredits").innerHTML = bgCredits

// Tab Switching Logic
function openTab(evt, tabId) {
    const tabContents = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove("active");
    }

    const tabButtons = document.getElementsByClassName("tab-button");
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove("active");
    }

    document.getElementById(tabId).classList.add("active");
    evt.currentTarget.classList.add("active");
    // window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Dynamic Scroll Detection for Tab Container
const navContainer = document.getElementById("nav-container");
const mainContent = document.querySelector(".content-wrapper");

window.addEventListener("scroll", () => {
    // Get the exact distance from the top of the viewport to the top of the content
    const contentTop = mainContent.getBoundingClientRect().top;
    
    // The floating nav bar takes up roughly the first 85 pixels of the screen.
    // If the content moves higher than 85px, it's crossing paths with the nav.
    if (contentTop < 85) {
        navContainer.classList.add("scrolled");
    } else {
        navContainer.classList.remove("scrolled");
    }
});

// Modal logic
const modal = document.getElementById("imageModal");
const modalImg = document.getElementById("modalImg");
const modalClose = document.querySelector(".modal-close");
const zoomSlider = document.getElementById("zoomSlider");

let scale = 1; let panX = 0; let panY = 0; let dragging = false;
let dragStartX = 0; let dragStartY = 0; let dragStartPanX = 0; let dragStartPanY = 0;

function updateImageTransform() {
    modalImg.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
    modalImg.style.cursor = scale > 1 ? (dragging ? 'grabbing' : 'grab') : 'zoom-in';
}

function resetImageTransform() {
    scale = 1; panX = 0; panY = 0; zoomSlider.value = '1';
    updateImageTransform();
}

function openImageModal(src, alt) {
    modalImg.src = src; modalImg.alt = alt; resetImageTransform();
    modal.classList.add("visible"); modal.setAttribute("aria-hidden", "false");
}

function closeImageModal() {
    modal.classList.remove("visible"); modal.setAttribute("aria-hidden", "true");
    modalImg.src = ""; resetImageTransform();
}

modalClose.addEventListener("click", closeImageModal);
modal.addEventListener("click", event => {
    if (event.target === modal) closeImageModal();
});

zoomSlider.addEventListener("input", event => {
    scale = parseFloat(event.target.value);
    if (scale <= 1) { panX = 0; panY = 0; }
    updateImageTransform();
});

let activePointerId = null;

modalImg.addEventListener("pointerdown", event => {
    if (scale <= 1) return;
    event.preventDefault(); dragging = true; activePointerId = event.pointerId;
    dragStartX = event.clientX; dragStartY = event.clientY;
    dragStartPanX = panX; dragStartPanY = panY;
    modalImg.setPointerCapture(activePointerId); updateImageTransform();
});

modalImg.addEventListener("pointermove", event => {
    if (!dragging) return;
    panX = dragStartPanX + event.clientX - dragStartX;
    panY = dragStartPanY + event.clientY - dragStartY;
    updateImageTransform();
});

const stopDragging = event => {
    if (!dragging) return;
    if (activePointerId !== null) { modalImg.releasePointerCapture(activePointerId); activePointerId = null; }
    dragging = false; updateImageTransform();
};

modalImg.addEventListener("pointerup", stopDragging);
modalImg.addEventListener("pointercancel", stopDragging);
modal.addEventListener("pointerup", stopDragging);
modal.addEventListener("pointercancel", stopDragging);
modalImg.addEventListener("dragstart", event => event.preventDefault());

// Skills
const skillsDiv = document.getElementById("skills");
data.skills.forEach(skillObj => {
    for (const [category, items] of Object.entries(skillObj)) {
        const el = document.createElement("span");
        el.className = "skill";
        el.innerHTML = `<b>${category}</b>: ${items}`;
        skillsDiv.appendChild(el);
    }
});

// --- Work Experience ---
    const expDiv = document.getElementById("work_experience");
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
        
        // Inject Wanderer into the CONTAINER, not the card
        if (index === 0) container.innerHTML = wandererHTML;
        container.appendChild(card);
        expDiv.appendChild(container);
    });

    // --- Projects with gallery ---
    const projDiv = document.getElementById("projects");
    data.projects.forEach((p, index) => {
        const container = document.createElement("div");
        container.className = "card-container";

        const card = document.createElement("div");
        card.className = "card";
        
        const gallery = document.createElement("div");
        gallery.className = "gallery";

        p.images.forEach(img => {
            const image = document.createElement("img");
            image.src = img; 
            image.alt = p.title; 
            image.className = "project-image";
            image.addEventListener("click", () => openImageModal(img, p.title));
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
        
        // Inject Wanderer into the CONTAINER, not the card
        if (index === 0) container.innerHTML = wandererHTML;
        container.appendChild(card);
        projDiv.appendChild(container);
    });

    // --- Education Section ---
    const educationDiv = document.getElementById("education");
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
        
        // Inject Wanderer into the CONTAINER, not the card
        if (index === 0) container.innerHTML = wandererHTML;
        container.appendChild(card);
        educationDiv.appendChild(container);
    });