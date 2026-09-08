/* ====================================================
   0. PRELOADER — CINEMATIC AUDIO & SMOOTH EXIT
   ==================================================== */
(function initPreloader() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    // ── Synthetic Cinematic Intro Audio via Web Audio API ──
    function playCinematicIntroSound() {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();

            const now = ctx.currentTime;

            // 1. SUB-BASS RISING SWELL (Harmonized with line trace 0.0s - 1.2s)
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(80, now);
            osc.frequency.exponentialRampToValueAtTime(320, now + 1.1);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(350, now);
            filter.frequency.linearRampToValueAtTime(800, now + 1.1);

            gain.gain.setValueAtTime(0.001, now);
            gain.gain.exponentialRampToValueAtTime(0.35, now + 0.6);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 1.25);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 1.3);

            // 2. CRYSTALLINE GLOSS CHIME (Harmonized with gloss sweep 1.0s - 2.0s)
            const chimeTimes = [now + 0.95, now + 1.1];
            const chimeFreqs = [1046.5, 1318.5]; // C6 and E6 harmonics

            chimeTimes.forEach((startTime, idx) => {
                const cOsc = ctx.createOscillator();
                const cGain = ctx.createGain();

                cOsc.type = 'sine';
                cOsc.frequency.setValueAtTime(chimeFreqs[idx], startTime);
                cOsc.frequency.exponentialRampToValueAtTime(chimeFreqs[idx] * 1.5, startTime + 0.8);

                cGain.gain.setValueAtTime(0.001, startTime);
                cGain.gain.exponentialRampToValueAtTime(0.2, startTime + 0.08);
                cGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.9);

                cOsc.connect(cGain);
                cGain.connect(ctx.destination);

                cOsc.start(startTime);
                cOsc.stop(startTime + 0.95);
            });

            // 3. AIR SHIMMER WOOSH (Gentle high-frequency texture)
            const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.8, ctx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            for (let i = 0; i < noiseBuffer.length; i++) {
                output[i] = Math.random() * 2 - 1;
            }
            const noise = ctx.createBufferSource();
            noise.buffer = noiseBuffer;

            const noiseFilter = ctx.createBiquadFilter();
            noiseFilter.type = 'bandpass';
            noiseFilter.frequency.setValueAtTime(3200, now + 0.9);
            noiseFilter.Q.setValueAtTime(3, now + 0.9);

            const noiseGain = ctx.createGain();
            noiseGain.gain.setValueAtTime(0.001, now + 0.9);
            noiseGain.gain.exponentialRampToValueAtTime(0.08, now + 1.15);
            noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.7);

            noise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(ctx.destination);

            noise.start(now + 0.9);
            noise.stop(now + 1.75);

        } catch (_) {
            // Graceful fallback for strict autoplay restrictions
        }
    }

    // Trigger sound as early as possible
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        playCinematicIntroSound();
    } else {
        document.addEventListener('DOMContentLoaded', playCinematicIntroSound, { once: true });
    }

    // Hide preloader after animation sequence completes (~2.1s)
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('preloader-hidden');
        }, 2100);
    });

    // Fallback timer: hard limit 3.5s
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

    // â”€â”€ Element refs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const nlinks = document.getElementById('nl');
    const pill = document.getElementById('navIndicator');
    const navLinks = nlinks ? Array.from(nlinks.querySelectorAll('a[href^="#"]')) : [];

    if (!pill || navLinks.length === 0) return;

    // â”€â”€ Section IDs derived from the nav links â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const sectionIds = navLinks.map(a => a.getAttribute('href').slice(1));

    // â”€â”€ State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    let activeSection = sectionIds[0];   // currently tracked section
    let isHovering = false;           // true while mouse is inside nlinks

    // â”€â”€ Pill position calculator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

    // â”€â”€ Active link class toggler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    function setActiveLink(id) {
        navLinks.forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === '#' + id);
        });
    }

    // â”€â”€ Apply active section (pill + classes) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    function applyActive(id) {
        activeSection = id;
        setActiveLink(id);
        if (!isHovering) {
            movePillToLink(getLinkBySection(id));
        }
    }

    // â”€â”€ Scrollspy via IntersectionObserver â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
            // distance from nav bottom â€” prefer the one just below nav
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

    // â”€â”€ Hover micro-interactions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

    // â”€â”€ Click: instantly snap active section to avoid lag â”€â”€
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const id = link.getAttribute('href').slice(1);
            // Optimistically set active; scrollspy will confirm
            applyActive(id);
            // Close mobile drawer if open
            nlinks.classList.remove('open');
        });
    });

    // â”€â”€ Resize: recalculate pill position â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            movePillToLink(getLinkBySection(activeSection));
        }, 80);
    });

    // â”€â”€ Initial render (after fonts/layout settle) â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
   3. LOGIKA GAME: NOKIA 3310 RETRO SNAKE
   ==================================================== */
(function initSnakeGame() {
    const cv = document.getElementById('gameCanvas');
    if (!cv) return;
    const ctx = cv.getContext('2d');

    // â”€â”€ Grid config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const CELL = 10;             // pixel size of one grid cell
    const COLS = cv.width / CELL;   // 28 cols
    const ROWS = cv.height / CELL;   // 20 rows

    // â”€â”€ Game State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    let state = 'idle';        // 'idle' | 'playing' | 'paused' | 'dead'
    let snake = [];
    let dir = 'RIGHT';
    let nextDir = 'RIGHT';
    let food = { x: 0, y: 0 };
    let bonus = null;          // occasional bonus food
    let score = 0;
    let hiScore = 0;
    let level = 1;
    let frame = 0;
    let raf = null;
    let lastTick = 0;
    let bonusTimer = 0;

    // DOM refs
    const scEl = document.getElementById('sc');
    const hiEl = document.getElementById('hisc');
    const lvEl = document.getElementById('lv');

    // â”€â”€ Speed per level (ms between ticks) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    function tickInterval() {
        return Math.max(80, 200 - (level - 1) * 18);
    }

    // â”€â”€ HUD update â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    function updateHUD() {
        if (scEl) scEl.textContent = score;
        if (hiEl) hiEl.textContent = hiScore;
        if (lvEl) lvEl.textContent = level;
    }

    // â”€â”€ Spawn food at random empty cell â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    function spawnFood(isBonus = false) {
        let pos;
        do {
            pos = {
                x: Math.floor(Math.random() * COLS),
                y: Math.floor(Math.random() * ROWS)
            };
        } while (snake.some(s => s.x === pos.x && s.y === pos.y));

        if (isBonus) {
            bonus = pos;
            bonusTimer = 60; // lives for ~60 ticks
        } else {
            food = pos;
        }
    }

    // â”€â”€ Init / reset game â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    function reset() {
        snake = [
            { x: 6, y: 10 },
            { x: 5, y: 10 },
            { x: 4, y: 10 }
        ];
        dir = 'RIGHT';
        nextDir = 'RIGHT';
        score = 0;
        level = 1;
        frame = 0;
        bonus = null;
        bonusTimer = 0;
        spawnFood();
        updateHUD();
    }

    // â”€â”€ Collision helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    function headHitsWall(head) {
        return head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS;
    }
    function headHitsSelf(head) {
        return snake.some(s => s.x === head.x && s.y === head.y);
    }

    // â”€â”€ One logic tick â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    function tick() {
        dir = nextDir;

        const head = { ...snake[0] };
        if (dir === 'UP') head.y--;
        if (dir === 'DOWN') head.y++;
        if (dir === 'LEFT') head.x--;
        if (dir === 'RIGHT') head.x++;

        if (headHitsWall(head) || headHitsSelf(head)) {
            state = 'dead';
            if (score > hiScore) hiScore = score;
            updateHUD();
            return;
        }

        snake.unshift(head);

        // Eat normal food
        if (head.x === food.x && head.y === food.y) {
            score += 10 * level;
            if (score >= level * 80) level = Math.min(10, level + 1);
            spawnFood();
            // 20% chance spawn bonus
            if (!bonus && Math.random() < 0.2) spawnFood(true);
            updateHUD();
        } else if (bonus && head.x === bonus.x && head.y === bonus.y) {
            // Eat bonus food
            score += 30 * level;
            bonus = null;
            updateHUD();
        } else {
            snake.pop();
        }

        if (bonus) {
            bonusTimer--;
            if (bonusTimer <= 0) bonus = null;
        }
    }

    // â”€â”€ Nokia-style pixel art renderer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const BG_COLOR = '#8ba87a';   // classic greenish LCD
    const GRID_COLOR = 'rgba(0,0,0,0.06)';
    const SNAKE_COLOR = '#1a1a1a';
    const FOOD_COLOR = '#0f0f0f';
    const BONUS_COLOR = '#10b981';
    const DEAD_COLOR = '#ef4444';

    function drawCell(x, y, color, shrink = 1) {
        ctx.fillStyle = color;
        ctx.fillRect(
            x * CELL + shrink,
            y * CELL + shrink,
            CELL - shrink * 2,
            CELL - shrink * 2
        );
    }

    function render() {
        // LCD background
        ctx.fillStyle = BG_COLOR;
        ctx.fillRect(0, 0, cv.width, cv.height);

        // Subtle pixel grid
        ctx.strokeStyle = GRID_COLOR;
        ctx.lineWidth = 0.5;
        for (let x = 0; x <= COLS; x++) {
            ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, cv.height); ctx.stroke();
        }
        for (let y = 0; y <= ROWS; y++) {
            ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(cv.width, y * CELL); ctx.stroke();
        }

        // Snake
        snake.forEach((seg, i) => {
            const alpha = i === 0 ? 1 : 0.85 - (i / snake.length) * 0.2;
            ctx.globalAlpha = alpha;
            drawCell(seg.x, seg.y, SNAKE_COLOR, i === 0 ? 0.5 : 1);
        });
        ctx.globalAlpha = 1;

        // Head eyes
        if (snake.length > 0 && state !== 'dead') {
            const h = snake[0];
            ctx.fillStyle = BG_COLOR;
            const ex = h.x * CELL, ey = h.y * CELL;
            if (dir === 'RIGHT' || dir === 'LEFT') {
                const ox = dir === 'RIGHT' ? 6 : 2;
                ctx.fillRect(ex + ox, ey + 2, 2, 2);
                ctx.fillRect(ex + ox, ey + 6, 2, 2);
            } else {
                const oy = dir === 'DOWN' ? 6 : 2;
                ctx.fillRect(ex + 2, ey + oy, 2, 2);
                ctx.fillRect(ex + 6, ey + oy, 2, 2);
            }
        }

        // Food â€” blinking star shape
        const blink = (Math.floor(Date.now() / 300) % 2 === 0);
        if (blink) {
            ctx.fillStyle = FOOD_COLOR;
            // cross/plus shape
            ctx.fillRect(food.x * CELL + 3, food.y * CELL + 1, 4, 8);
            ctx.fillRect(food.x * CELL + 1, food.y * CELL + 3, 8, 4);
        }

        // Bonus food
        if (bonus) {
            const bb = Math.floor(Date.now() / 150) % 2 === 0;
            if (bb) {
                ctx.fillStyle = BONUS_COLOR;
                ctx.beginPath();
                ctx.arc(bonus.x * CELL + 5, bonus.y * CELL + 5, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Overlays
        if (state === 'idle') {
            drawOverlay('SNAKE', 'Press START or Enter', '#1a1a1a');
        } else if (state === 'paused') {
            drawOverlay('PAUSED', 'Press START to resume', '#1a1a1a');
        } else if (state === 'dead') {
            drawOverlay('GAME OVER', `Score: ${score}  â€¢  Press START`, DEAD_COLOR);
        }
    }

    function drawOverlay(title, sub, color) {
        ctx.fillStyle = 'rgba(139, 168, 122, 0.82)';
        ctx.fillRect(0, cv.height / 2 - 28, cv.width, 56);

        ctx.font = 'bold 14px monospace';
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(title, cv.width / 2, cv.height / 2 - 8);

        ctx.font = '9px monospace';
        ctx.fillStyle = '#1a1a1a';
        ctx.fillText(sub, cv.width / 2, cv.height / 2 + 10);

        ctx.textAlign = 'left';
    }

    // â”€â”€ Main loop â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    function loop(ts) {
        raf = requestAnimationFrame(loop);
        if (state === 'playing') {
            if (ts - lastTick >= tickInterval()) {
                lastTick = ts;
                tick();
            }
        }
        render();
    }

    // â”€â”€ Public API (called from HTML buttons / keyboard) â”€â”€
    window.startSnakeGame = function () {
        reset();
        state = 'playing';
        lastTick = performance.now();
        if (!raf) loop(lastTick);
    };

    window.pauseSnakeGame = function () {
        if (state === 'playing') state = 'paused';
        else if (state === 'paused') { state = 'playing'; lastTick = performance.now(); }
    };

    window.onDpadCenter = function () {
        if (state === 'idle' || state === 'dead') {
            window.startSnakeGame();
        } else {
            window.pauseSnakeGame();
        }
    };

    window.setSnakeDir = function (d) {
        if (state !== 'playing') {
            if (state === 'idle' || state === 'dead') window.startSnakeGame();
            return;
        }
        const opposites = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
        if (opposites[d] !== dir) nextDir = d;
    };

    // â”€â”€ Keyboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    document.addEventListener('keydown', (e) => {
        const map = {
            ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT',
            w: 'UP', W: 'UP', s: 'DOWN', S: 'DOWN', a: 'LEFT', A: 'LEFT', d: 'RIGHT', D: 'RIGHT'
        };
        if (map[e.key]) {
            e.preventDefault();
            window.setSnakeDir(map[e.key]);
        }
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            window.onDpadCenter();
        }
        if (e.key === 'Escape') window.pauseSnakeGame();
    });

    // â”€â”€ Swipe gestures on canvas â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    let touchStartX = 0, touchStartY = 0;
    cv.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        e.preventDefault();
    }, { passive: false });

    cv.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        const absDx = Math.abs(dx), absDy = Math.abs(dy);
        if (absDx < 8 && absDy < 8) {
            // tap â†’ toggle start/pause
            window.onDpadCenter();
            return;
        }
        if (absDx > absDy) {
            window.setSnakeDir(dx > 0 ? 'RIGHT' : 'LEFT');
        } else {
            window.setSnakeDir(dy > 0 ? 'DOWN' : 'UP');
        }
        e.preventDefault();
    }, { passive: false });

    // â”€â”€ Boot idle loop â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    reset();
    loop(performance.now());
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
 *   'all'  â†’ shows everything
 *   'tech' â†’ shows only the UNSIA flagship card
 *   'lead' â†’ shows only the 3-card leadership grid
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
            statBox.textContent = "âœ“ Pesan berhasil terkirim! Terima kasih, saya akan segera menghubungi Anda dalam < 24 jam.";
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
   COPY EMAIL TO CLIPBOARD â€” Interactive Email Card
   ==================================================== */
function copyEmail(cardEl) {
    const email = 'abdulziyadalhadi@gmail.com';
    const metaEl = document.getElementById('emailMetaText');

    const onSuccess = () => {
        // Visual feedback on the card
        cardEl.classList.add('copied');
        if (metaEl) metaEl.textContent = 'âœ“ Berhasil disalin ke clipboard!';

        // Reset after 2.5 s
        setTimeout(() => {
            cardEl.classList.remove('copied');
            if (metaEl) metaEl.textContent = 'Klik untuk salin Â· Surat formal & Dokumen brief';
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
        if (copyTxt) copyTxt.textContent = "Tersalin! âœ“";
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

/* ====================================================
   FOOTER ENHANCEMENTS: LIVE JAKARTA TIME & SCROLL TOP
   ==================================================== */
function updateJakartaClock() {
    const clockEl = document.getElementById('liveJakartaTime');
    if (!clockEl) return;

    try {
        const now = new Date();
        const options = {
            timeZone: 'Asia/Jakarta',
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        };
        const formatter = new Intl.DateTimeFormat('id-ID', options);
        clockEl.textContent = formatter.format(now) + ' WIB';
    } catch (_) {
        // Fallback calculation
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const wib = new Date(utc + (3600000 * 7));
        const pad = (n) => String(n).padStart(2, '0');
        clockEl.textContent = `${pad(wib.getHours())}:${pad(wib.getMinutes())}:${pad(wib.getSeconds())} WIB`;
    }
}

// Update clock every second
setInterval(updateJakartaClock, 1000);
updateJakartaClock();

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}
window.scrollToTop = scrollToTop;

