/* ====================================================
   0. PRELOADER — HIDE AFTER CINEMATIC ANIMATION
   ==================================================== */
(function initPreloader() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    // Primary: fire after page fully loads + animation completes (~2.1s)
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('preloader-hidden');
        }, 2100);
    });

    // Fallback: hard limit 3.5s in case assets are slow
    setTimeout(() => {
        if (preloader && !preloader.classList.contains('preloader-hidden')) {
            preloader.classList.add('preloader-hidden');
        }
    }, 3500);
})();

/* ====================================================
   1. LOGIKA PEMUTAR MUSIK (PLAYLIST LOKAL JAY)
   ==================================================== */
const songs = [
    {
        title: "Blank Space",
        src: "assets/audio/Blank Space.mp3"
    },
    {
        title: "Bye",
        src: "assets/audio/Bye.mp3"
    }
];

let currentSong = 0;
let isPlaying = false;

const music = document.getElementById('bgMusic');
const musicBtn = document.getElementById('musicBtn');
const musicIcon = document.getElementById('musicIcon');
const songTitle = document.getElementById('songTitle');

function loadSong(index) {
    music.src = songs[index].src;
    music.load();
    songTitle.textContent = songs[index].title;
    if (isPlaying) music.play().catch(() => { });
}

function toggleMusic() {
    if (isPlaying) {
        music.pause();
        musicIcon.className = 'fas fa-play';
        isPlaying = false;
    } else {
        music.play().then(() => {
            musicIcon.className = 'fas fa-pause';
            isPlaying = true;
        }).catch(() => { });
    }
}

function nextSong() {
    currentSong = (currentSong + 1) % songs.length;
    loadSong(currentSong);
    if (isPlaying) music.play();
}

function prevSong() {
    currentSong = (currentSong - 1 + songs.length) % songs.length;
    loadSong(currentSong);
    if (isPlaying) music.play();
}

// Otomatis lagu selanjutnya jika lagu habis
music.addEventListener('ended', nextSong);

// Fitur Auto-play saat pertama kali user mengklik di mana saja pada layar
document.addEventListener('click', function startMusicOnce() {
    if (!isPlaying) {
        music.volume = 0.5; // Volume 50%
        loadSong(currentSong);
        music.play().then(() => {
            isPlaying = true;
            musicIcon.className = 'fas fa-pause';
        }).catch(() => { });
    }
    document.removeEventListener('click', startMusicOnce);
}, { once: true });

// Load lagu awal
loadSong(0);

// Toggle Menu Navigasi Mobile
function toggleNav() {
    document.getElementById('nl').classList.toggle('open');
}

// Efek Navbar saat scroll
window.addEventListener('scroll', () => {
    document.getElementById('nav').classList.toggle('sc', window.scrollY > 30);
});

/* ====================================================
   ANIMATED SLIDING PILL INDICATOR + SCROLLSPY
   Apple/Linear-style magnetic pill that glides to the
   active section link in real-time as the user scrolls.
   ==================================================== */
(function initNavPill() {
    'use strict';

    // ── Element refs ──────────────────────────────────────
    const nlinks = document.getElementById('nl');
    const pill = document.getElementById('navIndicator');
    const navLinks = nlinks ? Array.from(nlinks.querySelectorAll('a[href^="#"]')) : [];

    if (!pill || navLinks.length === 0) return;

    // ── Section IDs derived from the nav links ─────────────
    const sectionIds = navLinks.map(a => a.getAttribute('href').slice(1));

    // ── State ──────────────────────────────────────────────
    let activeSection = sectionIds[0];   // currently tracked section
    let isHovering = false;           // true while mouse is inside nlinks

    // ── Pill position calculator ───────────────────────────
    /**
     * Moves the pill behind `targetLink`.
     * Uses offsetLeft/offsetWidth relative to the <ul> parent
     * so it works perfectly regardless of viewport width.
     */
    function movePillToLink(linkEl) {
        if (!linkEl) return;

        // offsetLeft is relative to offsetParent (<li>), we need it
        // relative to the <ul>. The <li> itself is offset from the <ul>.
        const li = linkEl.parentElement;
        const pillLeft = li.offsetLeft;
        const pillWidth = li.offsetWidth;

        pill.style.width = pillWidth + 'px';
        pill.style.transform = `translateY(-50%) translateX(${pillLeft}px)`;
        pill.style.opacity = '1';
    }

    /**
     * Returns the link element for the given section id.
     */
    function getLinkBySection(id) {
        return navLinks.find(a => a.getAttribute('href') === '#' + id) || null;
    }

    // ── Active link class toggler ──────────────────────────
    function setActiveLink(id) {
        navLinks.forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === '#' + id);
        });
    }

    // ── Apply active section (pill + classes) ──────────────
    function applyActive(id) {
        activeSection = id;
        setActiveLink(id);
        if (!isHovering) {
            movePillToLink(getLinkBySection(id));
        }
    }

    // ── Scrollspy via IntersectionObserver ─────────────────
    // Uses a two-pass strategy:
    //   1. IntersectionObserver with a tall rootMargin so we know
    //      which sections are "near" the viewport.
    //   2. Among intersecting sections, picks the one whose top
    //      edge is closest to the navbar bottom.
    const NAV_HEIGHT = 70;
    const intersecting = new Set();

    function pickBestSection() {
        if (intersecting.size === 0) return;

        let best = null;
        let bestTop = Infinity;

        intersecting.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            const rect = el.getBoundingClientRect();
            // distance from nav bottom — prefer the one just below nav
            const dist = Math.abs(rect.top - NAV_HEIGHT);
            if (dist < bestTop) {
                bestTop = dist;
                best = id;
            }
        });

        if (best && best !== activeSection) {
            applyActive(best);
        }
    }

    const sectionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    intersecting.add(entry.target.id);
                } else {
                    intersecting.delete(entry.target.id);
                }
            });
            pickBestSection();
        },
        {
            // Large top/bottom margins so sections are "seen" early
            rootMargin: `-${NAV_HEIGHT}px 0px -30% 0px`,
            threshold: 0
        }
    );

    sectionIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) sectionObserver.observe(el);
    });

    // ── Hover micro-interactions ───────────────────────────
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            isHovering = true;
            movePillToLink(link);
        });
    });

    nlinks.addEventListener('mouseleave', () => {
        isHovering = false;
        // Glide back to the currently active section
        movePillToLink(getLinkBySection(activeSection));
    });

    // ── Click: instantly snap active section to avoid lag ──
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const id = link.getAttribute('href').slice(1);
            // Optimistically set active; scrollspy will confirm
            applyActive(id);
            // Close mobile drawer if open
            nlinks.classList.remove('open');
        });
    });

    // ── Resize: recalculate pill position ──────────────────
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            movePillToLink(getLinkBySection(activeSection));
        }, 80);
    });

    // ── Initial render (after fonts/layout settle) ─────────
    // rAF + small delay ensures all offsetWidths are accurate.
    requestAnimationFrame(() => {
        setTimeout(() => {
            applyActive(activeSection);
        }, 120);
    });
})();

/* ====================================================
   2. THREE.JS: ALGORITHMIC DATA GRAPH / NEURAL NETWORK
   ==================================================== */
(function initThreeJS() {
    const cv = document.getElementById("three-canvas");
    if (!cv) return;

    const ren = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
    ren.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    ren.setClearColor(0, 0);

    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
    cam.position.z = 18;

    function resize() {
        const p = cv.parentElement;
        if (!p) return;
        ren.setSize(p.clientWidth, p.clientHeight);
        cam.aspect = p.clientWidth / p.clientHeight;
        cam.updateProjectionMatrix();
    }
    resize();
    window.addEventListener("resize", resize);

    // Konfigurasi Node Algoritmik Data Graph
    const NODE_COUNT = 75;
    const MAX_DISTANCE = 4.6;
    const BOUNDS = { x: 14, y: 9, z: 6 };

    const nodeGeometry = new THREE.SphereGeometry(0.08, 12, 12); // sedikit diperkecil dari 0.1
    const emeraldMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.4 });
    const greenMaterial = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.35 });
    const whiteMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });

    const materials = [emeraldMaterial, greenMaterial, emeraldMaterial, whiteMaterial];

    const nodes = [];
    const nodeGroup = new THREE.Group();
    scene.add(nodeGroup);

    for (let i = 0; i < NODE_COUNT; i++) {
        const mat = materials[i % materials.length];
        const mesh = new THREE.Mesh(nodeGeometry, mat);
        mesh.position.set(
            (Math.random() - 0.5) * BOUNDS.x * 2,
            (Math.random() - 0.5) * BOUNDS.y * 2,
            (Math.random() - 0.5) * BOUNDS.z * 2
        );
        mesh.userData = {
            vx: (Math.random() - 0.5) * 0.035,
            vy: (Math.random() - 0.5) * 0.035,
            vz: (Math.random() - 0.5) * 0.02,
            baseScale: 0.8 + Math.random() * 0.8
        };
        mesh.scale.setScalar(mesh.userData.baseScale);
        nodeGroup.add(mesh);
        nodes.push(mesh);
    }

    // Dynamic Line Segments connecting nearby nodes
    const maxConnections = (NODE_COUNT * (NODE_COUNT - 1)) / 2;
    const linePositions = new Float32Array(maxConnections * 6);
    const lineColors = new Float32Array(maxConnections * 6);

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

    const lineMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.22,
        blending: THREE.AdditiveBlending
    });

    const linesMesh = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(linesMesh);

    let mx = 0, my = 0;
    let targetRotX = 0, targetRotY = 0;

    document.addEventListener("mousemove", (e) => {
        mx = (e.clientX / window.innerWidth - 0.5) * 2;
        my = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // Mobile touch parallax
    document.addEventListener("touchmove", (e) => {
        if (e.touches.length > 0) {
            mx = (e.touches[0].clientX / window.innerWidth - 0.5) * 1.5;
            my = (e.touches[0].clientY / window.innerHeight - 0.5) * 1.5;
        }
    }, { passive: true });

    let clock = 0;

    function loop() {
        requestAnimationFrame(loop);
        clock += 0.015;

        // Smooth camera parallax + gentle organic oscillation
        targetRotX = my * 0.35 + Math.sin(clock * 0.5) * 0.08;
        targetRotY = mx * 0.45 + Math.cos(clock * 0.4) * 0.08;

        cam.position.x += (targetRotY * 3 - cam.position.x) * 0.04;
        cam.position.y += (-targetRotX * 3 - cam.position.y) * 0.04;
        cam.lookAt(0, 0, 0);

        // Update node positions & bounce
        for (let i = 0; i < NODE_COUNT; i++) {
            const node = nodes[i];
            const p = node.position;
            const u = node.userData;

            p.x += u.vx;
            p.y += u.vy;
            p.z += u.vz;

            if (Math.abs(p.x) > BOUNDS.x) { u.vx *= -1; p.x = Math.sign(p.x) * BOUNDS.x; }
            if (Math.abs(p.y) > BOUNDS.y) { u.vy *= -1; p.y = Math.sign(p.y) * BOUNDS.y; }
            if (Math.abs(p.z) > BOUNDS.z) { u.vz *= -1; p.z = Math.sign(p.z) * BOUNDS.z; }

            const pulse = u.baseScale * (1 + 0.15 * Math.sin(clock * 2 + i));
            node.scale.setScalar(pulse);
        }

        // Dynamically compute graph edges
        let lineIdx = 0;
        let colorIdx = 0;
        let connections = 0;

        for (let i = 0; i < NODE_COUNT; i++) {
            const p1 = nodes[i].position;
            for (let j = i + 1; j < NODE_COUNT; j++) {
                const p2 = nodes[j].position;
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dz = p1.z - p2.z;
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist < MAX_DISTANCE) {
                    linePositions[lineIdx++] = p1.x;
                    linePositions[lineIdx++] = p1.y;
                    linePositions[lineIdx++] = p1.z;
                    linePositions[lineIdx++] = p2.x;
                    linePositions[lineIdx++] = p2.y;
                    linePositions[lineIdx++] = p2.z;

                    const factor = 1 - (dist / MAX_DISTANCE);
                    const r = 0.06 * factor;
                    const g = (0.7 + 0.3 * factor) * factor;
                    const b = (0.4 + 0.4 * factor) * factor;

                    lineColors[colorIdx++] = r;
                    lineColors[colorIdx++] = g;
                    lineColors[colorIdx++] = b;

                    lineColors[colorIdx++] = r;
                    lineColors[colorIdx++] = g;
                    lineColors[colorIdx++] = b;

                    connections++;
                }
            }
        }

        lineGeo.setDrawRange(0, connections * 2);
        lineGeo.attributes.position.needsUpdate = true;
        lineGeo.attributes.color.needsUpdate = true;

        nodeGroup.rotation.y = clock * 0.05;
        linesMesh.rotation.y = clock * 0.05;

        ren.render(scene, cam);
    }
    loop();
})();

/* ====================================================
   3. LOGIKA MINI GAME: QA BUG BUSTER (SYSTEM DEBUGGER)
   ==================================================== */
(function initGame() {
    const cv = document.getElementById("gameCanvas");
    if (!cv) return;

    const ctx = cv.getContext("2d");
    const W = cv.width, H = cv.height;
    const scEl = document.getElementById("sc");
    const lvEl = document.getElementById("lv");

    let state = "idle"; // "idle", "playing", "dead"
    let score = 0;
    let lives = 3;
    let wave = 1;
    let paddle, bugs = [], lasers = [], particles = [], texts = [];
    let keys = {};
    let frame = 0;
    let lastShot = 0;
    let aid;

    const BUG_TYPES = [
        { label: "404", color: "#f87171", border: "#ef4444", pts: 20, speed: 1.1 },
        { label: "Syntax Error", color: "#facc15", border: "#eab308", pts: 25, speed: 1.2 },
        { label: "NullPointer", color: "#fb923c", border: "#f97316", pts: 30, speed: 1.3 },
        { label: "Bug", color: "#38bdf8", border: "#0284c7", pts: 15, speed: 1.0 },
        { label: "Memory Leak", color: "#c084fc", border: "#a855f7", pts: 35, speed: 1.4 }
    ];

    function initPaddle() {
        paddle = {
            x: W / 2,
            y: H - 32,
            w: 80,
            h: 12,
            vx: 0,
            targetX: W / 2
        };
    }

    function spawnBug() {
        const type = BUG_TYPES[Math.floor(Math.random() * BUG_TYPES.length)];
        ctx.font = "bold 10px 'Plus Jakarta Sans', sans-serif";
        const width = ctx.measureText ? Math.max(66, ctx.measureText("[" + type.label + "]").width + 18) : 75;
        const x = width / 2 + Math.random() * (W - width);
        const vy = (type.speed + wave * 0.2 + Math.random() * 0.4) * 0.85;
        const vx = (Math.random() - 0.5) * 0.5;

        bugs.push({
            x,
            y: -18,
            w: width,
            h: 20,
            vx,
            vy,
            label: "[" + type.label + "]",
            color: type.color,
            border: type.border,
            pts: type.pts
        });
    }

    function spawnBurst(x, y, color, count = 12) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3.5 + 0.8;
            particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                color,
                size: Math.random() * 2.8 + 1.2
            });
        }
    }

    function addFloatingText(str, x, y, color) {
        texts.push({
            text: str,
            x,
            y,
            life: 1.0,
            color
        });
    }

    function updateHud() {
        if (scEl) scEl.textContent = score;
        if (lvEl) {
            lvEl.textContent = `${lives}/3`;
        }
    }

    window.startGame = function () {
        if (aid) cancelAnimationFrame(aid);
        score = 0;
        lives = 3;
        wave = 1;
        bugs = [];
        lasers = [];
        particles = [];
        texts = [];
        frame = 0;
        initPaddle();
        updateHud();
        state = "playing";
        for (let i = 0; i < 2; i++) spawnBug();
        loop();
    };

    function shootLaser() {
        const now = Date.now();
        if (now - lastShot > 160) {
            lasers.push({
                x: paddle.x,
                y: paddle.y - 8,
                vy: -9
            });
            lasers.push({
                x: paddle.x - paddle.w * 0.35,
                y: paddle.y - 4,
                vy: -8.5
            });
            lasers.push({
                x: paddle.x + paddle.w * 0.35,
                y: paddle.y - 4,
                vy: -8.5
            });
            lastShot = now;
        }
    }

    function handleCanvasInteraction(e) {
        const rect = cv.getBoundingClientRect();
        const scaleX = cv.width / rect.width;
        const scaleY = cv.height / rect.height;
        const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : null);
        const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : null);

        if (clientX === null) return;
        const tapX = (clientX - rect.left) * scaleX;
        const tapY = (clientY - rect.top) * scaleY;

        if (state !== "playing") {
            window.startGame();
            return;
        }

        paddle.targetX = tapX;

        let squashedAny = false;
        bugs = bugs.filter((bug) => {
            const hit = Math.abs(tapX - bug.x) < bug.w / 2 + 10 && Math.abs(tapY - bug.y) < bug.h + 10;
            if (hit) {
                squashedAny = true;
                score += bug.pts;
                spawnBurst(bug.x, bug.y, "#00ff88", 16);
                addFloatingText("+" + bug.pts, bug.x, bug.y, "#00ff88");
                updateHud();
                return false;
            }
            return true;
        });

        if (!squashedAny) {
            shootLaser();
        }
    }

    cv.addEventListener("mousedown", handleCanvasInteraction);
    cv.addEventListener("touchstart", (e) => {
        handleCanvasInteraction(e);
        e.preventDefault();
    }, { passive: false });

    cv.addEventListener("mousemove", (e) => {
        if (state !== "playing") return;
        const rect = cv.getBoundingClientRect();
        const scaleX = cv.width / rect.width;
        paddle.targetX = (e.clientX - rect.left) * scaleX;
    });

    function loop() {
        aid = requestAnimationFrame(loop);
        frame++;

        ctx.fillStyle = "#040a07";
        ctx.fillRect(0, 0, W, H);

        // Subtle Grid Lines
        ctx.strokeStyle = "rgba(16, 185, 129, 0.04)";
        ctx.lineWidth = 1;
        for (let x = 0; x < W; x += 28) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
        }
        for (let y = 0; y < H; y += 28) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        }

        // Clean Defense Boundary Line (no fake terminal text)
        const baseY = H - 18;
        ctx.strokeStyle = "rgba(16, 185, 129, 0.25)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, baseY);
        ctx.lineTo(W, baseY);
        ctx.stroke();

        if (state === "playing") update();
        draw();

        if (state === "idle") {
            renderGameOverlay("BUG BUSTER", "Tembak bug yang jatuh sebelum menyentuh batas bawah. Klik Mulai Main!", "#00ff88");
        } else if (state === "dead") {
            renderGameOverlay("GAME OVER", `Skor Akhir: ${score} · Klik untuk main lagi`, "#f87171");
        }
    }

    function update() {
        const speed = 4.8;
        if (keys["ArrowLeft"] || keys["a"] || keys["A"]) {
            paddle.vx = -speed;
            paddle.targetX = paddle.x - speed * 4;
        } else if (keys["ArrowRight"] || keys["d"] || keys["D"]) {
            paddle.vx = speed;
            paddle.targetX = paddle.x + speed * 4;
        } else {
            paddle.vx = (paddle.targetX - paddle.x) * 0.2;
        }

        paddle.x += paddle.vx;
        paddle.x = Math.max(paddle.w / 2, Math.min(W - paddle.w / 2, paddle.x));

        if (keys["ArrowUp"] || keys[" "] || keys["w"] || keys["W"]) {
            shootLaser();
        }

        const spawnInterval = Math.max(35, 75 - wave * 6);
        if (frame % spawnInterval === 0) {
            spawnBug();
        }

        lasers.forEach(l => { l.y += l.vy; });
        lasers = lasers.filter(l => l.y > 0);

        bugs.forEach(b => {
            b.x += b.vx;
            b.y += b.vy;
            if (b.x < b.w / 2 || b.x > W - b.w / 2) b.vx *= -1;
        });

        // Laser vs Bug Collision
        bugs = bugs.filter(b => {
            for (let i = 0; i < lasers.length; i++) {
                const l = lasers[i];
                if (Math.abs(l.x - b.x) < b.w / 2 && Math.abs(l.y - b.y) < b.h / 2 + 5) {
                    lasers.splice(i, 1);
                    score += b.pts;
                    spawnBurst(b.x, b.y, "#00ff88", 12);
                    addFloatingText("+" + b.pts, b.x, b.y, "#00ff88");
                    updateHud();
                    if (score >= wave * 150) wave++;
                    return false;
                }
            }
            return true;
        });

        // Paddle vs Bug Collision (Catch bug with shield)
        bugs = bugs.filter(b => {
            const hitPaddle = (
                Math.abs(paddle.x - b.x) < (paddle.w + b.w) / 2 &&
                Math.abs(paddle.y - b.y) < (paddle.h + b.h) / 2 + 3
            );

            if (hitPaddle) {
                score += b.pts + 15;
                spawnBurst(b.x, b.y, "#00ff88", 18);
                addFloatingText("+" + (b.pts + 15), b.x, b.y, "#00ff88");
                updateHud();
                if (score >= wave * 150) wave++;
                return false;
            }
            return true;
        });

        // Bug reaches bottom baseline
        const baseY = H - 20;
        bugs = bugs.filter(b => {
            if (b.y + b.h / 2 >= baseY) {
                lives--;
                spawnBurst(b.x, baseY, "#ef4444", 20);
                addFloatingText("-1 NYAWA", b.x, baseY - 15, "#ef4444");
                updateHud();
                if (lives <= 0) {
                    lives = 0;
                    state = "dead";
                    updateHud();
                }
                return false;
            }
            return true;
        });

        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.038;
            p.vx *= 0.94;
            p.vy *= 0.94;
        });
        particles = particles.filter(p => p.life > 0);

        texts.forEach(t => {
            t.y -= 0.8;
            t.life -= 0.03;
        });
        texts = texts.filter(t => t.life > 0);
    }

    function draw() {
        lasers.forEach(l => {
            ctx.save();
            ctx.shadowColor = "#00ff88";
            ctx.shadowBlur = 8;
            ctx.fillStyle = "#00ff88";
            ctx.fillRect(l.x - 1.5, l.y, 3, 10);
            ctx.restore();
        });

        bugs.forEach(b => {
            ctx.save();
            ctx.translate(b.x, b.y);

            ctx.fillStyle = "rgba(10, 20, 15, 0.92)";
            ctx.strokeStyle = b.border;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            const bw = b.w, bh = b.h;
            if (ctx.roundRect) {
                ctx.roundRect(-bw / 2, -bh / 2, bw, bh, 5);
            } else {
                ctx.rect(-bw / 2, -bh / 2, bw, bh);
            }
            ctx.fill();
            ctx.stroke();

            ctx.shadowColor = b.border;
            ctx.shadowBlur = 6;
            ctx.fillStyle = b.border;
            ctx.fillRect(-bw / 2 + 3, -bh / 2 + 1, bw - 6, 2);

            ctx.shadowBlur = 0;
            ctx.font = "bold 9.5px 'Plus Jakarta Sans', sans-serif";
            ctx.fillStyle = b.color;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(b.label, 0, 1);

            ctx.restore();
        });

        // Sleek modern glowing geometric shield (no text clutter)
        if ((state === "playing" || state === "idle") && paddle) {
            ctx.save();
            ctx.translate(paddle.x, paddle.y);

            ctx.shadowColor = "#00ff88";
            ctx.shadowBlur = 16;

            ctx.fillStyle = "rgba(16, 185, 129, 0.35)";
            ctx.strokeStyle = "#00ff88";
            ctx.lineWidth = 2;
            ctx.beginPath();
            const pw = paddle.w, ph = paddle.h;
            if (ctx.roundRect) {
                ctx.roundRect(-pw / 2, -ph / 2, pw, ph, 8);
            } else {
                ctx.rect(-pw / 2, -ph / 2, pw, ph);
            }
            ctx.fill();
            ctx.stroke();

            // Polished glowing energy core
            ctx.shadowBlur = 8;
            ctx.shadowColor = "#ffffff";
            ctx.fillStyle = "#ffffff";
            if (ctx.roundRect) {
                ctx.beginPath();
                ctx.roundRect(-14, -2, 28, 4, 2);
                ctx.fill();
            } else {
                ctx.fillRect(-14, -2, 28, 4);
            }

            ctx.restore();
        }

        particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 5;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        texts.forEach(t => {
            ctx.save();
            ctx.globalAlpha = t.life;
            ctx.font = "bold 10px 'Plus Jakarta Sans', sans-serif";
            ctx.fillStyle = t.color;
            ctx.textAlign = "center";
            ctx.shadowColor = t.color;
            ctx.shadowBlur = 4;
            ctx.fillText(t.text, t.x, t.y);
            ctx.restore();
        });
    }

    function renderGameOverlay(title, subtitle, color) {
        ctx.save();
        ctx.fillStyle = "rgba(5, 11, 8, 0.88)";
        ctx.fillRect(0, 0, W, H);

        ctx.font = "700 20px 'Plus Jakarta Sans', sans-serif";
        ctx.fillStyle = color;
        ctx.textAlign = "center";
        ctx.shadowColor = color;
        ctx.shadowBlur = 14;
        ctx.fillText(title, W / 2, H / 2 - 12);

        ctx.shadowBlur = 0;
        ctx.font = "500 12px 'Plus Jakarta Sans', sans-serif";
        ctx.fillStyle = "#94a3b8";
        ctx.fillText(subtitle, W / 2, H / 2 + 16);

        ctx.restore();
    }

    document.addEventListener("keydown", (e) => {
        keys[e.key] = true;
        if (e.key === " " && state === "playing") {
            e.preventDefault();
        }
    });

    document.addEventListener("keyup", (e) => {
        keys[e.key] = false;
    });

    window.mobileKey = function (k, isDown) {
        keys[k] = isDown;
        if (isDown && k === " ") {
            shootLaser();
        }
    };

    initPaddle();
    updateHud();
    loop();
})();

/* ====================================================
   4. SCROLL REVEAL OBSERVER (MENGGERAKKAN ELEMEN .r)
   ==================================================== */
const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('v');
            }
        });
    },
    { threshold: 0.1 }
);

document.querySelectorAll('.r').forEach((element) => {
    revealObserver.observe(element);
});

/* ====================================================
   5. LOGIKA FILTER EXPERIENCE (DUAL-STREAM CAREER LOG)
   ==================================================== */
/**
 * filterExperience(category, buttonElement)
 * Filters the experience section by category:
 *   'all'  → shows everything
 *   'tech' → shows only the UNSIA flagship card
 *   'lead' → shows only the 3-card leadership grid
 */
function filterExperience(category, buttonElement) {
    // 1. Update active pill state
    document.querySelectorAll('.exp-filter-btn').forEach(function (btn) {
        btn.classList.remove('active');
    });
    buttonElement.classList.add('active');

    const flagship = document.getElementById('expCardUnsia');
    const leadGrid = document.getElementById('expLeadGrid');

    if (!flagship || !leadGrid) return;

    // 2. Determine visibility based on category
    function showEl(el) {
        el.style.transition = 'opacity 0.32s ease, transform 0.32s ease';
        el.classList.remove('exp-hidden');
        // Trigger reflow for animation
        void el.offsetWidth;
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
    }

    function hideEl(el) {
        el.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
        el.style.opacity = '0';
        el.style.transform = 'translateY(10px)';
        setTimeout(function () {
            el.classList.add('exp-hidden');
        }, 260);
    }

    if (category === 'all') {
        showEl(flagship);
        showEl(leadGrid);
    } else if (category === 'tech') {
        showEl(flagship);
        hideEl(leadGrid);
    } else if (category === 'lead') {
        hideEl(flagship);
        showEl(leadGrid);
    }
}

/* ====================================================
   6. LOGIKA FILTER KATEGORI PROYEK (ENGINEERING DECK)
   ==================================================== */
/**
 * filterProjects(category, buttonElement)
 * Filters the project case studies by category ('all', 'web', 'qa', 'design')
 * using fluid CSS transitions and updates active pill states.
 */
function filterProjects(category, buttonElement) {
    // 1. Update active pill state
    document.querySelectorAll('.proj-flt').forEach((btn) => {
        btn.classList.remove('active');
    });
    if (buttonElement) {
        buttonElement.classList.add('active');
    }

    // 2. Select flagship project card and secondary cards
    const cards = document.querySelectorAll('#projStream [data-proj-cat]');

    cards.forEach((card) => {
        const rawCat = card.getAttribute('data-proj-cat') || '';
        const cats = rawCat.split(' ');
        const isMatch = (category === 'all' || cats.includes(category));

        if (isMatch) {
            // Animate entrance
            card.classList.remove('proj-hidden');
            // Force browser reflow to guarantee CSS transition plays
            void card.offsetWidth;
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
            card.style.pointerEvents = 'auto';
        } else {
            // Animate exit
            card.style.opacity = '0';
            card.style.transform = 'translateY(12px) scale(0.98)';
            card.style.pointerEvents = 'none';

            // Wait for transition to complete before hiding from layout
            setTimeout(() => {
                // Check if card is still meant to be hidden
                if (card.style.opacity === '0') {
                    card.classList.add('proj-hidden');
                }
            }, 260);
        }
    });
}

// Backward compatibility alias for any existing handlers
window.fp = filterProjects;

/* ====================================================
   7. LOGIKA TERMINAL MESSAGE DISPATCHER & FORM KONTAK
   ==================================================== */
/**
 * setContactTopic(topic, btnElement)
 * Updates the selected topic in the Cyber Command Console dispatcher
 * and synchronizes the hidden form input for Formspree.
 */
function setContactTopic(topic, btnElement) {
    document.querySelectorAll('.topic-pill').forEach((btn) => {
        btn.classList.remove('active');
    });
    if (btnElement) {
        btnElement.classList.add('active');
    }
    const hiddenInput = document.getElementById('fKeperluan');
    if (hiddenInput) {
        hiddenInput.value = topic;
    }
}

/**
 * submitForm(event)
 * Asynchronously dispatches the contact message via Web3Forms API
 * with live loading states and direct email delivery to Gmail.
 */
async function submitForm(event) {
    event.preventDefault();

    const form = event.target;
    const submitBtn = document.getElementById('submitBtn');
    const statBox = document.getElementById('fstat');

    // 1. Ubah tombol menjadi status Loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin" style="margin-right:8px"></i> Mengirim Pesan...';

    // 2. Kumpulkan data dari formulir
    const formData = new FormData(form);

    // Web3Forms Access Key Resmi Milik Anda
    formData.append("access_key", "7101dde9-0fbc-498c-9bcd-f3491a246b7a");

    try {
        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            statBox.className = "term-status-box ok";
            statBox.style.display = "block";
            statBox.textContent = "✓ Pesan berhasil terkirim! Terima kasih, saya akan segera menghubungi Anda dalam < 24 jam.";
            form.reset();

            // Kembalikan tombol topik ke default
            const defaultPill = document.querySelector('.topic-pill');
            if (defaultPill) setContactTopic('Jasa Website', defaultPill);
        } else {
            statBox.className = "term-status-box err";
            statBox.style.display = "block";
            statBox.textContent = "Gagal: " + (result.message || "Terjadi kesalahan saat mengirim.");
        }
    } catch (error) {
        statBox.className = "term-status-box err";
        statBox.style.display = "block";
        statBox.textContent = "Terjadi gangguan jaringan. Silakan hubungi via WhatsApp langsung.";
    } finally {
        // 3. Kembalikan tombol ke keadaan semula
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane" style="margin-right:8px"></i> Kirim Pesan (Dispatch Message)';

        // 4. Hilangkan notifikasi status setelah 7 detik
        setTimeout(() => {
            statBox.style.display = 'none';
            statBox.className = 'term-status-box';
        }, 7000);
    }
}

/* ====================================================
   COPY EMAIL TO CLIPBOARD — Interactive Email Card
   ==================================================== */
function copyEmail(cardEl) {
    const email = 'abdulziyadalhadi@gmail.com';
    const metaEl = document.getElementById('emailMetaText');

    const onSuccess = () => {
        // Visual feedback on the card
        cardEl.classList.add('copied');
        if (metaEl) metaEl.textContent = '✓ Berhasil disalin ke clipboard!';

        // Reset after 2.5 s
        setTimeout(() => {
            cardEl.classList.remove('copied');
            if (metaEl) metaEl.textContent = 'Klik untuk salin · Surat formal & Dokumen brief';
        }, 2500);
    };

    // Modern Clipboard API (requires HTTPS or localhost)
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(email).then(onSuccess).catch(() => fallbackCopy(email, onSuccess));
    } else {
        fallbackCopy(email, onSuccess);
    }
}

function fallbackCopy(text, callback) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
        document.execCommand('copy');
        callback();
    } catch (_) {
        // Last resort: open mailto
        window.location.href = 'mailto:' + text;
    }
    document.body.removeChild(ta);
}

/* ====================================================
   CREDENTIALS & OFFICIAL CERTIFICATES MODAL CONTROLLER
   ==================================================== */
const certModalData = [
    {
        name: 'BNSP Junior Programmer',
        frontImg: 'assets/sertif-bnsp.jpg',
        backImg: 'assets/sertif-bnsp-unit.jpg',
        currentView: 'front'
    },
    {
        name: 'Magang Industri UNSIA',
        frontImg: 'assets/sertif-unsia.jpg',
        backImg: 'assets/sertif-unsia-nilai.jpg',
        currentView: 'front'
    },
    {
        name: 'Bisa AI Academy',
        frontImg: 'assets/sertif-bisaai.jpg',
        backImg: 'assets/sertif-bisaai.jpg',
        currentView: 'front'
    }
];

let activeCertTab = 0;

function openCertModal(initialTabIndex = 0) {
    const modal = document.getElementById('certModal');
    if (!modal) return;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    switchCertTab(initialTabIndex);
}

function closeCertModal() {
    const modal = document.getElementById('certModal');
    if (!modal) return;

    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function handleCertBackdropClick(event) {
    if (event.target && event.target.id === 'certModal') {
        closeCertModal();
    }
}

function switchCertTab(tabIndex) {
    activeCertTab = tabIndex;

    // Tabs
    const tabs = document.querySelectorAll('.cert-tab');
    tabs.forEach((tab, idx) => {
        const isActive = idx === tabIndex;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    // Auto-scroll active tab into view on mobile touch devices
    const activeTabEl = document.getElementById(`certTab${tabIndex}`);
    if (activeTabEl && typeof activeTabEl.scrollIntoView === 'function') {
        activeTabEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    // Panes
    const panes = document.querySelectorAll('.cert-pane');
    panes.forEach((pane, idx) => {
        pane.classList.toggle('active', idx === tabIndex);
    });

    // Update Download / Full resolution button
    updateCertDownloadLink();
}

function switchCertSubView(paneIndex, viewType) {
    if (!certModalData[paneIndex]) return;
    certModalData[paneIndex].currentView = viewType;

    const imgEl = document.getElementById(`certImg_${paneIndex}`);
    const btnFront = document.getElementById(`subviewBtn_${paneIndex}_front`);
    const btnBack = document.getElementById(`subviewBtn_${paneIndex}_back`);

    if (imgEl) {
        imgEl.style.opacity = '0.35';
        imgEl.src = viewType === 'front' ? certModalData[paneIndex].frontImg : certModalData[paneIndex].backImg;
        setTimeout(() => {
            imgEl.style.opacity = '1';
        }, 150);
    }

    if (btnFront && btnBack) {
        btnFront.classList.toggle('active', viewType === 'front');
        btnBack.classList.toggle('active', viewType === 'back');
    }

    updateCertDownloadLink();
}

function updateCertDownloadLink() {
    const downloadBtn = document.getElementById('certDownloadBtn');
    if (!downloadBtn || !certModalData[activeCertTab]) return;

    const currentCert = certModalData[activeCertTab];
    const targetSrc = currentCert.currentView === 'back' ? currentCert.backImg : currentCert.frontImg;
    downloadBtn.setAttribute('href', targetSrc);
    const fileName = targetSrc.split('/').pop();
    downloadBtn.setAttribute('download', fileName);
}

// Global ESC key listener for modals
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const certModal = document.getElementById('certModal');
        if (certModal && certModal.classList.contains('active')) {
            closeCertModal();
        }
        const tipModal = document.getElementById('tipModal');
        if (tipModal && tipModal.classList.contains('active')) {
            closeTipModal();
        }
    }
});

// Expose cert modal functions globally to window
window.openCertModal = openCertModal;
window.closeCertModal = closeCertModal;
window.switchCertTab = switchCertTab;
window.switchCertSubView = switchCertSubView;
window.handleCertBackdropClick = handleCertBackdropClick;

/* ====================================================
   BUY ME A COFFEE / TIP JAR MODAL CONTROLLER
   ==================================================== */
function openTipModal() {
    const modal = document.getElementById('tipModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeTipModal() {
    const modal = document.getElementById('tipModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function handleTipBackdropClick(e) {
    if (e.target && e.target.id === 'tipModal') {
        closeTipModal();
    }
}

function switchTipQr(walletType) {
    const qrImg = document.getElementById('tipQrImg');
    const tabGopay = document.getElementById('tipTabGopay');
    const tabDana = document.getElementById('tipTabDana');

    if (qrImg) {
        qrImg.style.opacity = '0.35';
        if (walletType === 'dana') {
            qrImg.src = 'assets/qrdana.jpeg';
            qrImg.alt = 'QRIS DANA - Abdul Ziyad Al Hadi';
            if (tabDana) tabDana.classList.add('active');
            if (tabGopay) tabGopay.classList.remove('active');
        } else {
            qrImg.src = 'assets/qrgopay.jpeg';
            qrImg.alt = 'QRIS GoPay - Abdul Ziyad Al Hadi';
            if (tabGopay) tabGopay.classList.add('active');
            if (tabDana) tabDana.classList.remove('active');
        }
        setTimeout(() => {
            qrImg.style.opacity = '1';
        }, 150);
    }
}

function copyTipNumber(boxEl) {
    const number = "089538669356";
    const copyTxt = boxEl.querySelector('.tip-copy-txt');

    const showSuccess = () => {
        boxEl.classList.add('copied');
        if (copyTxt) copyTxt.textContent = "Tersalin! ✓";
        setTimeout(() => {
            boxEl.classList.remove('copied');
            if (copyTxt) copyTxt.textContent = "Salin";
        }, 2500);
    };

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(number).then(showSuccess).catch(() => {
            fallbackCopy(number, showSuccess);
        });
    } else {
        fallbackCopy(number, showSuccess);
    }
}

// Expose tip modal functions globally to window
window.openTipModal = openTipModal;
window.closeTipModal = closeTipModal;
window.handleTipBackdropClick = handleTipBackdropClick;
window.switchTipQr = switchTipQr;
window.copyTipNumber = copyTipNumber;