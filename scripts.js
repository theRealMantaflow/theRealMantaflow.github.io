// ==========================================
// MAIN INITIALIZATION
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    preventScrollRestore();
    initStaticContent();
    setupBackground();
    populateDynamicContent();
    setupNavigation();
    setupImageModal();
    setupScrollArrows();
});

// ==========================================
// 1. CORE SETUP & STATIC CONTENT
// ==========================================
function preventScrollRestore() {
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
}

function initStaticContent() {
    document.getElementById("name").innerText = data.name;
    document.getElementById("about").innerHTML = data.about;
    document.getElementById("contact").innerHTML = data.contact;
    document.getElementById("copyrights").innerHTML = data.copyrights;
}

function setupBackground() {
    const isPhone = window.innerWidth <= 768;
    const bgs = isPhone ? data.phone_backgrounds : data.backgrounds;
    const randomBg = bgs[Math.floor(Math.random() * bgs.length)];
    const [bgUrl, bgCredits] = randomBg.split('|');
    
    document.body.style.backgroundSize = 'cover';
    document.getElementById("bgCredits").innerHTML = bgCredits;

    const loaderEl = document.getElementById("loading-screen");
    if (loaderEl) loaderEl.style.display = loaderEl.style.display || 'flex';

    let loaderHidden = false;
    const hideLoader = () => {
        if (loaderHidden) return;
        loaderHidden = true;
        if (!loaderEl) return;
        loaderEl.classList.add("hidden");
        setTimeout(() => { try { loaderEl.remove(); } catch (e) { } }, 600);
    };

    const bgImage = new Image();
    let bgLoaded = false;
    bgImage.src = bgUrl.trim();
    bgImage.onload = () => {
        bgLoaded = true;
        try {
            document.body.style.background = `url(${bgImage.src}) no-repeat center center fixed`;
            document.body.style.backgroundSize = 'cover';
        } catch (e) { }
        hideLoader();
    };
    bgImage.onerror = hideLoader;

    const loaderTimeout = setTimeout(() => { if (!bgLoaded) hideLoader(); }, 7000);
    window.addEventListener('load', () => {
        clearTimeout(loaderTimeout);
        hideLoader();
    });
}

// ==========================================
// 2. DOM POPULATION
// ==========================================
const wandererHTML = `
    <img src="assets/gifs_and_pics/wanderer_peek_.png" class="wanderer-body" alt="Wanderer">
    <img src="assets/gifs_and_pics/wanderer_peek_hand.png" class="wanderer-hand">
`;

function populateDynamicContent() {
    populateSkills();
    populateHighlights();
    populateExperience();
    populateProjects();
    populateEducation();
}

function populateSkills() {
    const fragment = document.createDocumentFragment();
    data.skills.forEach(skillObj => {
        for (const [category, items] of Object.entries(skillObj)) {
            const el = document.createElement("span");
            el.className = "skill";
            el.innerHTML = `<b>${category}</b>: ${items}`;
            fragment.appendChild(el);
        }
    });
    document.getElementById("skills").appendChild(fragment);
}

function populateHighlights() {
    const grid = document.getElementById("highlights-grid");
    if (!grid) return;

    const fragment = document.createDocumentFragment();
    const highlightedProjects = data.projects.filter(p =>
        p.title.includes("Mechanical Keyboard") || p.title.includes("Vinventory")
    );

    highlightedProjects.forEach(p => {
        const card = document.createElement("div");
        card.className = "highlight-card";
        const coverImg = p.images && p.images.length > 0 ? p.images[0] : '';

        card.innerHTML = `
            <div class="highlight-image-container">
                <div class="highlight-image" style="background-image: url('${coverImg}')"></div>
                <div class="featured-badge">✦ Featured</div>
            </div>
            <div class="highlight-content">
                <h3 class="highlight-title">${p.title}</h3>
                <div class="highlight-date">${p.date}</div>
                <button class="view-project-btn" data-target="tab-projects">
                    <span>Explore Project</span>
                </button>
            </div>
        `;
        fragment.appendChild(card);
    });
    grid.appendChild(fragment);

    grid.addEventListener("click", handleHighlightClick);
}

function handleHighlightClick(e) {
    const targetBtn = e.target.closest('.highlight-card')?.querySelector('.view-project-btn');
    if (!targetBtn) return;

    const targetId = targetBtn.getAttribute("data-target");
    const targetTabBtn = document.querySelector(`.tab-button[data-target="${targetId}"]`);

    if (targetTabBtn) {
        targetTabBtn.click();
        const projectTitleText = targetBtn.closest('.highlight-content').querySelector('.highlight-title').innerText;
        const projectCards = document.querySelectorAll('#tab-projects .card');

        for (let card of projectCards) {
            const titleEl = card.querySelector('h3');
            if (titleEl && titleEl.innerText === projectTitleText) {
                setTimeout(() => {
                    const rect = card.getBoundingClientRect();
                    window.scrollTo({ top: rect.top + window.scrollY - 120, behavior: 'smooth' });

                    const originalShadow = card.style.boxShadow;
                    card.style.transition = 'box-shadow 0.4s ease, transform 0.2s';
                    card.style.boxShadow = '0 0 25px 10px rgba(211, 188, 142, 0.7)';
                    card.style.transform = 'scale(1.02)';

                    setTimeout(() => {
                        card.style.boxShadow = originalShadow;
                        card.style.transform = 'scale(1)';
                    }, 1200);
                }, 300);
                break;
            }
        }
    }
}

function populateExperience() {
    const fragment = document.createDocumentFragment();
    data.work_experience.forEach((exp, index) => {
        const container = document.createElement("div");
        container.className = "card-container";
        container.innerHTML = `
            ${index === 0 ? wandererHTML : ''}
            <div class="card">
                <div class="card-header">
                    <h3>${exp.title}</h3>
                    <span class="date">${exp.duration}</span>
                </div>
                <h4>${exp.company}</h4>
                <div class="description">${exp.description}</div>
            </div>
        `;
        fragment.appendChild(container);
    });
    document.getElementById("work_experience").appendChild(fragment);
}

function populateProjects() {
    const fragment = document.createDocumentFragment();
    data.projects.forEach((p, index) => {
        const container = document.createElement("div");
        container.className = "card-container";
        if (index === 0) container.innerHTML = wandererHTML;

        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <div class="card-header">
                <h3>${p.title}</h3>
                <span class="date">${p.date}</span>
            </div>
            <div class="description">${p.description}</div>
        `;

        if (p.images) {
            const gallery = document.createElement("div");
            gallery.className = "gallery";
            p.images.forEach(img => {
                const image = document.createElement("img");
                image.src = img; image.alt = p.title;
                image.className = "project-image"; image.loading = "lazy";
                gallery.appendChild(image);
            });
            card.appendChild(gallery);
        }

        if (p.stls && p.stls.length > 0) {
            const stlRow = document.createElement("div");
            stlRow.className = "stl-row";
            p.stls.forEach(stlUrl => {
                const btn = document.createElement("button");
                btn.className = "view-stl-btn";
                btn.innerHTML = `<span>✦ Interactive 3D: ${stlUrl.split('/').pop()}</span>`;
                btn.addEventListener("click", () => openStlModal(stlUrl));
                stlRow.appendChild(btn);
            });
            card.appendChild(stlRow);
        }

        container.appendChild(card);
        fragment.appendChild(container);
    });
    document.getElementById("projects").appendChild(fragment);
}

function populateEducation() {
    const fragment = document.createDocumentFragment();
    data.education.forEach((edu, index) => {
        const container = document.createElement("div");
        container.className = "card-container";
        container.innerHTML = `
            ${index === 0 ? wandererHTML : ''}
            <div class="card">
                <div class="card-header">
                    <h3>${edu.degree}</h3>
                    <span class="date">${edu.duration}</span>
                </div>
                <h4>Institution: ${edu.institution}</h4>
                <div class="description">${edu.description}</div>
            </div>
        `;
        fragment.appendChild(container);
    });
    document.getElementById("education").appendChild(fragment);
}

// ==========================================
// 3. UI INTERACTIONS & NAVIGATION
// ==========================================
function setupNavigation() {
    const tabControls = document.getElementById("tab-controls");
    const tabContents = document.querySelectorAll(".tab-content");
    const tabButtons = document.querySelectorAll(".tab-button");
    const navContainer = document.getElementById("nav-container");
    const mainContent = document.querySelector(".content-wrapper");

    // Tab Switching
    tabControls.addEventListener("click", (e) => {
        if (e.target.classList.contains("tab-button")) {
            tabButtons.forEach(btn => btn.classList.remove("active"));
            tabContents.forEach(content => content.classList.remove("active"));
            e.target.classList.add("active");
            document.getElementById(e.target.getAttribute("data-target")).classList.add("active");
        }
    });

    // Scroll Detection
    let isTicking = false;
    window.addEventListener("scroll", () => {
        if (!isTicking) {
            window.requestAnimationFrame(() => {
                navContainer.classList.toggle("scrolled", mainContent.getBoundingClientRect().top < 85);
                isTicking = false;
            });
            isTicking = true;
        }
    });
}

function setupScrollArrows() {
    const tabsScroll = document.getElementById("tab-controls");
    const leftArrow = document.getElementById("scroll-left");
    const rightArrow = document.getElementById("scroll-right");

    if (!leftArrow || !rightArrow) return;

    const updateVisibility = () => {
        if (window.innerWidth > 768) return;
        if (tabsScroll.scrollWidth <= tabsScroll.clientWidth) {
            leftArrow.classList.add("hidden"); rightArrow.classList.add("hidden");
            return;
        }
        leftArrow.classList.toggle("hidden", tabsScroll.scrollLeft <= 5);
        rightArrow.classList.toggle("hidden", Math.ceil(tabsScroll.scrollLeft + tabsScroll.clientWidth) >= tabsScroll.scrollWidth - 5);
    };

    leftArrow.addEventListener("click", () => tabsScroll.scrollBy({ left: -150, behavior: 'smooth' }));
    rightArrow.addEventListener("click", () => tabsScroll.scrollBy({ left: 150, behavior: 'smooth' }));
    
    tabsScroll.addEventListener("scroll", updateVisibility);
    window.addEventListener("resize", updateVisibility);
    setTimeout(updateVisibility, 150);
}

// ==========================================
// 4. IMAGE MODAL LOGIC
// ==========================================
function setupImageModal() {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImg");
    const zoomSlider = document.getElementById("zoomSlider");
    let scale = 1, panX = 0, panY = 0, dragging = false, activePointerId = null;
    let dragStartX = 0, dragStartY = 0, dragStartPanX = 0, dragStartPanY = 0;

    const updateTransform = () => {
        modalImg.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${scale})`;
        modalImg.style.cursor = scale > 1 ? (dragging ? 'grabbing' : 'grab') : 'zoom-in';
    };

    const resetTransform = () => {
        scale = 1; panX = 0; panY = 0; zoomSlider.value = '1';
        updateTransform();
    };

    const closeImageModal = () => {
        modal.classList.remove("visible");
        modal.setAttribute("aria-hidden", "true");
        setTimeout(() => { modalImg.src = ""; }, 200);
        resetTransform();
    };

    document.getElementById("projects").addEventListener("click", (e) => {
        if (e.target.classList.contains("project-image")) {
            modalImg.src = e.target.src; modalImg.alt = e.target.alt;
            resetTransform();
            modal.classList.add("visible"); modal.setAttribute("aria-hidden", "false");
        }
    });

    document.querySelector(".modal-close").addEventListener("click", closeImageModal);
    modal.addEventListener("click", e => { if (e.target === modal || e.target.classList.contains("modal-viewer")) closeImageModal(); });
    
    zoomSlider.addEventListener("input", e => {
        scale = parseFloat(e.target.value);
        if (scale <= 1) { panX = 0; panY = 0; }
        updateTransform();
    });

    modalImg.addEventListener("pointerdown", e => {
        if (scale <= 1) return;
        e.preventDefault(); dragging = true; activePointerId = e.pointerId;
        dragStartX = e.clientX; dragStartY = e.clientY;
        dragStartPanX = panX; dragStartPanY = panY;
        modalImg.setPointerCapture(activePointerId); updateTransform();
    });

    modalImg.addEventListener("pointermove", e => {
        if (!dragging) return;
        panX = dragStartPanX + e.clientX - dragStartX; panY = dragStartPanY + e.clientY - dragStartY;
        updateTransform();
    });

    const stopDragging = () => {
        if (!dragging) return;
        if (activePointerId !== null) { try { modalImg.releasePointerCapture(activePointerId); } catch (e) { } }
        dragging = false; activePointerId = null; updateTransform();
    };

    window.addEventListener("pointerup", stopDragging);
    window.addEventListener("pointercancel", stopDragging);
    modalImg.addEventListener("dragstart", e => e.preventDefault());
}

// ==========================================
// 5. 3D STL VIEWER (THREE.JS)
// ==========================================
let stlAnimationId, stlRenderer, stlScene;

function openStlModal(stlUrl) {
    const stlModal = document.getElementById("stlModal");
    const stlContainer = document.getElementById("stlViewerContainer");
    
    stlModal.classList.add("visible");
    stlModal.setAttribute("aria-hidden", "false");
    stlContainer.innerHTML = '<div class="stl-loading-text">Loading 3D Model...</div>';
    
    setTimeout(() => initStlScene(stlUrl), 50);
}

function initStlScene(url) {
    const stlContainer = document.getElementById("stlViewerContainer");
    stlContainer.innerHTML = '';
    
    const width = stlContainer.clientWidth;
    const height = stlContainer.clientHeight;
    
    stlScene = new THREE.Scene();
    stlScene.background = null;
    
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.001, 1000);
    stlRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, logarithmicDepthBuffer: true });
    stlRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    stlRenderer.setSize(width, height);
    stlRenderer.shadowMap.enabled = true;
    stlRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    stlContainer.appendChild(stlRenderer.domElement);
    
    const controls = new THREE.OrbitControls(camera, stlRenderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lighting
    stlScene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.4));
    
    const createDirLight = (x) => {
        const light = new THREE.DirectionalLight(0xffffff, 1.5);
        light.position.set(x, 0.5, 2);
        light.castShadow = true;
        light.shadow.mapSize.width = light.shadow.mapSize.height = 2048;
        light.shadow.camera.left = light.shadow.camera.bottom = -0.3;
        light.shadow.camera.right = light.shadow.camera.top = 0.3;
        light.shadow.camera.near = 0.01; light.shadow.camera.far = 10;
        light.shadow.bias = -0.00005; light.shadow.normalBias = 0.0005;
        return light;
    };
    
    const dirLightTopR = createDirLight(0.5);
    const dirLightTopL = createDirLight(-0.5);
    camera.add(dirLightTopR); camera.add(dirLightTopL);
    stlScene.add(camera);

    // Load Model
    new THREE.GLTFLoader().load(url, (gltf) => {
        const model = gltf.scene;
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = child.receiveShadow = true;
                child.shadowSide = child.material.side = THREE.DoubleSide;
            }
        });
        
        dirLightTopR.target = dirLightTopL.target = model;
        
        const box = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3(); box.getCenter(center);
        
        model.position.sub(center); // Center model to origin
        
        const size = box.getSize(new THREE.Vector3()).length();
        camera.position.set(0, size * 0.5, 0.01);
        camera.lookAt(0, 0, 0);
        
        stlScene.add(model);
    }, undefined, () => {
        stlContainer.innerHTML = '<div class="stl-loading-text" style="color: #ff6b6b;">Failed to load model.</div>';
    });

    const animate = () => {
        stlAnimationId = requestAnimationFrame(animate);
        controls.update();
        if (stlRenderer && stlScene) stlRenderer.render(stlScene, camera);
    };
    animate();

    new ResizeObserver(() => {
        if (!stlContainer || !stlRenderer || !camera) return;
        const newWidth = stlContainer.clientWidth, newHeight = stlContainer.clientHeight;
        if (newWidth > 0 && newHeight > 0) {
            camera.aspect = newWidth / newHeight; camera.updateProjectionMatrix();
            stlRenderer.setSize(newWidth, newHeight, false);
        }
    }).observe(stlContainer);
}

// Global STL Close Handlers
document.addEventListener("DOMContentLoaded", () => {
    const stlModal = document.getElementById("stlModal");
    const closeStlModal = () => {
        stlModal.classList.remove("visible");
        stlModal.setAttribute("aria-hidden", "true");
        if (stlAnimationId) cancelAnimationFrame(stlAnimationId);
        if (stlRenderer) { stlRenderer.dispose(); stlRenderer.forceContextLoss(); document.getElementById("stlViewerContainer").innerHTML = ''; }
        stlScene = null;
    };

    document.getElementById("stlModalClose")?.addEventListener("click", closeStlModal);
    stlModal?.addEventListener("click", e => { if (e.target === stlModal) closeStlModal(); });
});