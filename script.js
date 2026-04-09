/* ===================================================
   DESIGNER PORTFOLIO — Main Script
   全屏滚动 / 自定义光标 / GSAP动效 / Three.js 3D国王棋子
   =================================================== */

gsap.registerPlugin(ScrollTrigger);

/* ---- DOM引用 ---- */
const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];

const loader       = $('#loader');
const loaderProg   = $('#loaderProgress');
const loaderCount  = $('#loaderCounter');
const cursorDot    = $('#cursorDot');
const cursorRing   = $('#cursorRing');
const sideToggle   = $('#sideNavToggle');
const sideMenu     = $('#sideNavMenu');
const navItems     = $$('.nav-item');
const scrollHint   = $('#scrollHint');
const pageIndicator= $('#pageIndicator');
const panels       = $$('.panel');
const btnExplore   = $('#btnExplore');
const heroCanvas   = $('#heroCanvas');

/* ==============================
   1. 加载动画
   ============================== */
function runLoader() {
    const tl = gsap.timeline();

    tl.to('.loader-text span', {
        y: 0, opacity: 1,
        duration: .5, stagger: .06,
        ease: 'back.out(2)'
    });

    const prog = { v: 0 };
    tl.to(prog, {
        v: 100, duration: 1.8, ease: 'power2.inOut',
        onUpdate() {
            loaderProg.style.width = prog.v + '%';
            loaderCount.textContent = Math.round(prog.v);
        }
    }, '-=.2');

    tl.to('.loader-text span', {
        y: -30, opacity: 0, duration: .3, stagger: .03, ease: 'power2.in'
    }, '+=.1');

    tl.to(loader, {
        yPercent: -100, duration: .8, ease: 'power3.inOut',
        onComplete() {
            loader.classList.add('done');
            loader.style.display = 'none';
            initPage();
        }
    });
}

/* ==============================
   2. 页面初始化
   ============================== */
function initPage() {
    initCustomCursor();
    initSideNav();
    initThreeScene();
    initFullPageScroll();
    initHeroAnim();
    initWorkAnims();
    initAboutAnim();
}

/* ==============================
   3. Three.js — 国际象棋国王 3D（巴洛克黑金风格）
   ============================== */
let kingGroup = null;
let kingPivot = null;
let threeCamera = null;
let threeRenderer = null;
let threeScene = null;

let targetRotY = 0;
let targetRotX = 0;
let targetRotZ = 0;
let smoothRotY = 0;
let smoothRotX = 0;
let smoothRotZ = 0;
let mouseNX = 0;
let mouseNY = 0;

function initThreeScene() {
    const canvas = heroCanvas;
    if (!canvas || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    threeScene = scene;
    // canvas 设为 alpha:true，背景透传给下方 video

    const camera = new THREE.PerspectiveCamera(
        30,
        canvas.clientWidth / canvas.clientHeight,
        0.1, 1000
    );
    camera.position.set(0, 3.5, 9);
    camera.lookAt(0, 2.5, 0);
    threeCamera = camera;

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2.0;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    threeRenderer = renderer;

    // === 环境贴图：增强金属反射 ===
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    // 创建简易环境场景
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x111122);
    // 添加一些光球模拟环境光源
    const envLight1 = new THREE.Mesh(
        new THREE.SphereGeometry(1, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xfff0d0 })
    );
    envLight1.position.set(5, 8, 5);
    envScene.add(envLight1);
    const envLight2 = new THREE.Mesh(
        new THREE.SphereGeometry(0.8, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xffcc66 })
    );
    envLight2.position.set(-5, 4, -3);
    envScene.add(envLight2);
    const envLight3 = new THREE.Mesh(
        new THREE.SphereGeometry(0.6, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0x6688cc })
    );
    envLight3.position.set(0, 2, 8);
    envScene.add(envLight3);
    const envTexture = pmremGenerator.fromScene(envScene, 0.04).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    // === 灯光 — 大幅增强，让棋子更立体清晰 ===
    // 环境光：提供基础照明，不再是一片死黑
    scene.add(new THREE.AmbientLight(0x2a2040, 1.2));

    // 主光源（关键光）：从右上方打下，模拟舞台灯
    const keyLight = new THREE.DirectionalLight(0xfff0d0, 3.5);
    keyLight.position.set(4, 8, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.bias = -0.0001;
    scene.add(keyLight);

    // 正面补光：从相机方向打，确保正面可见
    const frontLight = new THREE.DirectionalLight(0xffeedd, 2.0);
    frontLight.position.set(0, 3, 8);
    scene.add(frontLight);

    // 左侧填充光：蓝调，给暗面加层次
    const fillLight = new THREE.DirectionalLight(0x6688cc, 1.2);
    fillLight.position.set(-6, 4, 2);
    scene.add(fillLight);

    // 背光/轮廓光：从背后打，勾勒轮廓
    const rimLight = new THREE.DirectionalLight(0xff6644, 1.8);
    rimLight.position.set(-2, 5, -6);
    scene.add(rimLight);

    // 顶部聚光灯：聚焦在棋子上方
    const spotLight = new THREE.SpotLight(0xffffff, 2.5, 20, Math.PI / 5, 0.4, 1);
    spotLight.position.set(0, 12, 3);
    spotLight.target.position.set(2, 2, 0);
    scene.add(spotLight);
    scene.add(spotLight.target);

    // 底部暖光上扬：打亮底座
    const bottomLight = new THREE.PointLight(0xdd8844, 1.0, 8);
    bottomLight.position.set(2, -1, 3);
    scene.add(bottomLight);

    // 金色强调光：从侧面打，让金色装饰发光
    const goldLight = new THREE.PointLight(0xffcc66, 1.5, 12);
    goldLight.position.set(5, 4, 2);
    scene.add(goldLight);

    // === 构建棋子 ===
    const eps = 0.001;

    // 外层pivot — 初始倾斜
    kingPivot = new THREE.Group();
    kingPivot.rotation.set(-0.22, 0.35, 0.1);
    scene.add(kingPivot);

    kingGroup = new THREE.Group();
    kingPivot.add(kingGroup);

    // ---- 材质 — 降低metalness提高roughness，让实体感更强 ----
    const blackMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        metalness: 0.75,
        roughness: 0.25,
    });

    const darkGoldMat = new THREE.MeshStandardMaterial({
        color: 0xaa8833,
        metalness: 0.85,
        roughness: 0.18,
    });

    const goldMat = new THREE.MeshStandardMaterial({
        color: 0xddbb44,
        metalness: 0.88,
        roughness: 0.15,
        emissive: 0x443311,
        emissiveIntensity: 0.35,
    });

    const brightGoldMat = new THREE.MeshStandardMaterial({
        color: 0xffdd55,
        metalness: 0.9,
        roughness: 0.12,
        emissive: 0x664400,
        emissiveIntensity: 0.45,
    });

    const gemBlueMat = new THREE.MeshStandardMaterial({
        color: 0x2266dd,
        metalness: 0.15,
        roughness: 0.08,
        emissive: 0x1144cc,
        emissiveIntensity: 0.6,
    });

    const gemRedMat = new THREE.MeshStandardMaterial({
        color: 0xdd2244,
        metalness: 0.15,
        roughness: 0.08,
        emissive: 0x880022,
        emissiveIntensity: 0.5,
    });

    // ============ 底座 ============
    // 最底层宽扁
    const base1 = new THREE.Mesh(
        new THREE.CylinderGeometry(eps2(1.15), eps2(1.3), eps2(0.18), 48),
        blackMat
    );
    base1.position.y = 0.09;
    base1.castShadow = true;
    kingGroup.add(base1);

    // 底座1顶部金色绳纹
    addGoldRopeRing(kingGroup, 1.22, 0.18, goldMat, 48);

    // 第二层
    const base2 = new THREE.Mesh(
        new THREE.CylinderGeometry(eps2(0.95), eps2(1.15), eps2(0.25), 48),
        blackMat
    );
    base2.position.y = 0.305;
    base2.castShadow = true;
    kingGroup.add(base2);

    // 底座2金色绳纹
    addGoldRopeRing(kingGroup, 1.05, 0.305, goldMat, 48);

    // 第三层过渡
    const base3 = new THREE.Mesh(
        new THREE.CylinderGeometry(eps2(0.72), eps2(0.95), eps2(0.18), 48),
        blackMat
    );
    base3.position.y = 0.52;
    kingGroup.add(base3);

    // 底座3金色绳纹
    addGoldRopeRing(kingGroup, 0.83, 0.52, goldMat, 48);

    // 底座颈部过渡（收窄到柱身）
    const baseNeck = new THREE.Mesh(
        new THREE.CylinderGeometry(eps2(0.55), eps2(0.72), eps2(0.12), 48),
        blackMat
    );
    baseNeck.position.y = 0.67;
    kingGroup.add(baseNeck);

    // ============ 柱身 — 修长优雅 ============
    const pts = [
        new THREE.Vector2(0.50, 0),
        new THREE.Vector2(0.49, 0.1),
        new THREE.Vector2(0.45, 0.3),
        new THREE.Vector2(0.38, 0.6),
        new THREE.Vector2(0.30, 1.0),
        new THREE.Vector2(0.24, 1.5),
        new THREE.Vector2(0.20, 2.0),
        new THREE.Vector2(0.17, 2.5),
        new THREE.Vector2(0.16, 2.9),
        new THREE.Vector2(0.17, 3.1),
        new THREE.Vector2(0.20, 3.3),
        new THREE.Vector2(0.26, 3.5),
        new THREE.Vector2(0.34, 3.65),
    ];
    const latheGeo = new THREE.LatheGeometry(pts, 64);
    const body = new THREE.Mesh(latheGeo, blackMat);
    body.position.y = 0.73;
    body.castShadow = true;
    kingGroup.add(body);

    // 柱身中间 — 宽金色装饰带（绳纹风格）
    addGoldRopeRing(kingGroup, 0.31, 2.73, brightGoldMat, 48);
    addGoldRopeRing(kingGroup, 0.28, 2.78, goldMat, 48);

    // 柱身上部装饰环
    addGoldRopeRing(kingGroup, 0.22, 3.43, goldMat, 48);

    // ============ 柱身与皇冠过渡区 ============
    // 宽颈
    const crownNeck = new THREE.Mesh(
        new THREE.CylinderGeometry(eps2(0.42), eps2(0.34), eps2(0.2), 48),
        blackMat
    );
    crownNeck.position.y = 4.18;
    crownNeck.castShadow = true;
    kingGroup.add(crownNeck);

    // 金色过渡环
    addGoldRopeRing(kingGroup, 0.42, 4.28, brightGoldMat, 48);

    // ============ 皇冠 — 巴洛克华丽风格 ============

    // 皇冠底座环
    const crownBase = new THREE.Mesh(
        new THREE.CylinderGeometry(eps2(0.48), eps2(0.42), eps2(0.15), 48),
        blackMat
    );
    crownBase.position.y = 4.4;
    kingGroup.add(crownBase);

    // 皇冠主体（宽环带）
    const crownBand = new THREE.Mesh(
        new THREE.CylinderGeometry(eps2(0.50), eps2(0.48), eps2(0.4), 48),
        blackMat
    );
    crownBand.position.y = 4.675;
    crownBand.castShadow = true;
    kingGroup.add(crownBand);

    // 皇冠上下金色边环
    addGoldRopeRing(kingGroup, 0.49, 4.475, brightGoldMat, 48);
    addGoldRopeRing(kingGroup, 0.50, 4.875, brightGoldMat, 48);

    // 皇冠中间装饰金环
    addGoldRopeRing(kingGroup, 0.495, 4.675, goldMat, 48);

    // 皇冠上蓝宝石镶嵌（6颗）
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const gem = new THREE.Mesh(
            new THREE.OctahedronGeometry(eps2(0.05), 0),
            gemBlueMat
        );
        gem.position.set(
            Math.cos(angle) * 0.51,
            4.675,
            Math.sin(angle) * 0.51
        );
        gem.rotation.set(0.3, angle, 0);
        kingGroup.add(gem);
    }

    // 皇冠上红宝石（6颗，交替）
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + 0.52;
        const gem = new THREE.Mesh(
            new THREE.OctahedronGeometry(eps2(0.035), 0),
            gemRedMat
        );
        gem.position.set(
            Math.cos(angle) * 0.52,
            4.675,
            Math.sin(angle) * 0.52
        );
        gem.rotation.set(0.2, angle + 0.5, 0);
        kingGroup.add(gem);
    }

    // === 皇冠尖角 — 参考图的华丽多层风格 ===

    // 皇冠顶部平台
    const crownTop = new THREE.Mesh(
        new THREE.CylinderGeometry(eps2(0.46), eps2(0.50), eps2(0.08), 48),
        blackMat
    );
    crownTop.position.y = 4.915;
    kingGroup.add(crownTop);

    // 6个大尖角（巴洛克风格，高低交错）
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const r = 0.42;
        const isMajor = i % 2 === 0;
        const peakH = isMajor ? 0.95 : 0.65;
        const baseW = isMajor ? 0.06 : 0.045;

        // 尖角本体
        const peak = new THREE.Mesh(
            new THREE.ConeGeometry(eps2(baseW), eps2(peakH), 8),
            darkGoldMat
        );
        peak.position.set(
            Math.cos(angle) * r,
            4.96 + peakH / 2,
            Math.sin(angle) * r
        );
        peak.rotation.z = Math.cos(angle) * 0.18;
        peak.rotation.x = -Math.sin(angle) * 0.18;
        kingGroup.add(peak);

        // 尖角底部金色环座
        const peakBase = new THREE.Mesh(
            new THREE.TorusGeometry(eps2(baseW + 0.01), eps2(0.012), 8, 16),
            brightGoldMat
        );
        peakBase.position.set(
            Math.cos(angle) * r,
            4.96,
            Math.sin(angle) * r
        );
        peakBase.rotation.x = Math.PI / 2;
        peakBase.rotation.z = Math.cos(angle) * 0.18;
        peakBase.rotation.y = angle;
        kingGroup.add(peakBase);

        // 尖顶金色球
        const tipBall = new THREE.Mesh(
            new THREE.SphereGeometry(eps2(0.045), 16, 16),
            brightGoldMat
        );
        tipBall.position.set(
            Math.cos(angle) * r * 1.01,
            4.96 + peakH + 0.04,
            Math.sin(angle) * r * 1.01
        );
        kingGroup.add(tipBall);
    }

    // 尖角之间的连接弧线（用小金色球模拟镂空花纹）
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 + 0.26;
        const r = 0.40;
        const dot = new THREE.Mesh(
            new THREE.SphereGeometry(eps2(0.02), 8, 8),
            goldMat
        );
        dot.position.set(
            Math.cos(angle) * r,
            5.25,
            Math.sin(angle) * r
        );
        kingGroup.add(dot);
    }

    // ============ 十字架 ============
    // 竖柱
    const crossV = new THREE.Mesh(
        new THREE.BoxGeometry(eps2(0.07), eps2(0.8), eps2(0.07)),
        brightGoldMat
    );
    crossV.position.y = 5.85;
    crossV.castShadow = true;
    kingGroup.add(crossV);

    // 横梁
    const crossH = new THREE.Mesh(
        new THREE.BoxGeometry(eps2(0.4), eps2(0.07), eps2(0.07)),
        brightGoldMat
    );
    crossH.position.y = 6.0;
    kingGroup.add(crossH);

    // 十字架金色小球装饰（四端）
    for (let i = 0; i < 4; i++) {
        const ball = new THREE.Mesh(
            new THREE.SphereGeometry(eps2(0.035), 12, 12),
            brightGoldMat
        );
        if (i === 0) ball.position.set(0.2, 6.0, 0);
        else if (i === 1) ball.position.set(-0.2, 6.0, 0);
        else if (i === 2) ball.position.set(0, 6.035, 0);
        else ball.position.set(0, 5.96, 0);
        kingGroup.add(ball);
    }

    // 十字架顶部 — 菱形蓝宝石
    const topGem = new THREE.Mesh(
        new THREE.OctahedronGeometry(eps2(0.08), 0),
        gemBlueMat
    );
    topGem.position.y = 6.3;
    topGem.rotation.y = Math.PI / 4;
    kingGroup.add(topGem);

    // 宝石底部金色托座
    const gemMount = new THREE.Mesh(
        new THREE.CylinderGeometry(eps2(0.05), eps2(0.07), eps2(0.04), 12),
        brightGoldMat
    );
    gemMount.position.y = 6.22;
    kingGroup.add(gemMount);

    // ============ 位置 & 缩放 ============
    kingGroup.position.set(1.8, -2.5, 0.5);
    kingGroup.scale.setScalar(1.35);

    // ============ 底部圆盘 ============
    const diskMat = new THREE.MeshStandardMaterial({
        color: 0x12121e,
        metalness: 0.85,
        roughness: 0.2,
    });
    const disk = new THREE.Mesh(
        new THREE.CylinderGeometry(eps2(2.5), eps2(2.5), eps2(0.06), 64),
        diskMat
    );
    disk.position.set(1.8, -2.25, 0.5);
    disk.receiveShadow = true;
    scene.add(disk);

    // 圆盘金色边
    const diskRing = new THREE.Mesh(
        new THREE.TorusGeometry(eps2(2.5), eps2(0.025), 16, 64),
        goldMat
    );
    diskRing.position.set(1.8, -2.22, 0.5);
    diskRing.rotation.x = Math.PI / 2;
    scene.add(diskRing);

    // 内圈金色环
    const diskInnerRing = new THREE.Mesh(
        new THREE.TorusGeometry(eps2(1.7), eps2(0.015), 12, 48),
        darkGoldMat
    );
    diskInnerRing.position.set(1.8, -2.22, 0.5);
    diskInnerRing.rotation.x = Math.PI / 2;
    scene.add(diskInnerRing);

    smoothRotY = 0.35;

    // 鼠标跟踪
    document.addEventListener('mousemove', e => {
        mouseNX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseNY = (e.clientY / window.innerHeight) * 2 - 1;
    });

    function animate() {
        requestAnimationFrame(animate);
        if (!kingGroup) return;

        targetRotX = -mouseNY * 0.35;
        targetRotZ = mouseNX * 0.2;

        smoothRotY += (targetRotY - smoothRotY) * 0.06;
        smoothRotX += (targetRotX - smoothRotX) * 0.06;
        smoothRotZ += (targetRotZ - smoothRotZ) * 0.06;

        kingGroup.rotation.y = smoothRotY;
        kingGroup.rotation.x = smoothRotX;
        kingGroup.rotation.z = smoothRotZ;

        const t = Date.now() * 0.001;
        kingPivot.position.y = Math.sin(t * 0.5) * 0.05;

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    });
}

/** 辅助：eps 保底 */
function eps2(v) { return Math.max(0.001, v); }

/** 辅助：添加金色绳纹装饰环 */
function addGoldRopeRing(parent, radius, y, mat, segments) {
    const eps = 0.001;
    const ring = new THREE.Mesh(
        new THREE.TorusGeometry(Math.max(eps, radius), Math.max(eps, 0.018), 12, segments || 48),
        mat
    );
    ring.position.y = y;
    ring.rotation.x = Math.PI / 2;
    parent.add(ring);
}

/* ==============================
   4. 自定义光标
   ============================== */
function initCustomCursor() {
    if (window.innerWidth < 768) return;

    let mx = 0, my = 0, rx = 0, ry = 0;

    document.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        gsap.to(cursorDot, { x: mx, y: my, duration: .08 });
    });

    (function ringLoop() {
        rx += (mx - rx) * .12;
        ry += (my - ry) * .12;
        cursorRing.style.transform = `translate(${rx - 20}px, ${ry - 20}px)`;
        requestAnimationFrame(ringLoop);
    })();

    const hoverTargets = 'a, button, .btn-explore, .work-link, .social-btn, .nav-item, .side-nav-toggle';
    document.addEventListener('mouseover', e => {
        if (e.target.closest(hoverTargets)) {
            cursorDot.classList.add('hover');
            cursorRing.classList.add('hover');
        }
    });
    document.addEventListener('mouseout', e => {
        if (e.target.closest(hoverTargets)) {
            cursorDot.classList.remove('hover');
            cursorRing.classList.remove('hover');
        }
    });
}

/* ==============================
   5. 侧边导航
   ============================== */
let menuOpen = false;

function openMenu() {
    menuOpen = true;
    sideMenu.classList.add('open');
    sideToggle.classList.add('active');
    navItems.forEach((item, i) => {
        gsap.to(item, { x: 0, opacity: 1, delay: .15 + i * .08, duration: .5, ease: 'power3.out' });
    });
}

function closeMenu() {
    menuOpen = false;
    sideMenu.classList.remove('open');
    sideToggle.classList.remove('active');
    navItems.forEach(n => gsap.to(n, { x: -20, opacity: 0, duration: .2 }));
}

function initSideNav() {
    sideToggle.addEventListener('click', () => {
        if (menuOpen) closeMenu();
        else openMenu();
    });

    navItems.forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();
            const section = item.dataset.section;
            closeMenu();
            if (section === 'works') {
                /* "作品"直接跳转到详情页 */
                const href = item.getAttribute('href');
                if (href && href !== '#') {
                    setTimeout(() => { window.location.href = href; }, 200);
                    return;
                }
                setTimeout(() => { goToPanel(1); }, 150);
            } else {
                setTimeout(() => {
                    if (section === 'hero') goToPanel(0);
                    else if (section === 'about' || section === 'contact') goToPanel(panels.length - 1);
                }, 150);
            }
        });
    });
}

/* ==============================
   6. 全屏滚动
   ============================== */
let currentPanel = 0;
let isScrolling  = false;
const totalPanels = panels.length;

function goToPanel(index) {
    if (index < 0 || index >= totalPanels || isScrolling) return;
    isScrolling = true;
    currentPanel = index;

    const targetY = index * window.innerHeight;
    const startY = window.pageYOffset;
    const diff = targetY - startY;
    const duration = 1000;
    const startTime = performance.now();

    function scrollStep(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        window.scrollTo(0, startY + diff * ease);
        if (progress < 1) {
            requestAnimationFrame(scrollStep);
        } else {
            isScrolling = false;
        }
    }
    requestAnimationFrame(scrollStep);

    updateIndicator();
    updateScrollHint();
    triggerPanelAnim(index);
}

function updateIndicator() {
    const cur = $('.indicator-current');
    const tot = $('.indicator-total');
    cur.textContent = String(currentPanel + 1).padStart(2, '0');
    tot.textContent = String(totalPanels).padStart(2, '0');
}

function updateScrollHint() {
    scrollHint.classList.toggle('hidden', currentPanel > 0);
}

function initFullPageScroll() {
    let wheelAccum = 0;
    const threshold = 80;

    window.addEventListener('wheel', e => {
        if (menuOpen) return;

        if (currentPanel === 0 && !isScrolling) {
            targetRotY += e.deltaY * 0.004;
            wheelAccum += e.deltaY;
            if (Math.abs(wheelAccum) >= threshold * 1.8) {
                const dir = wheelAccum > 0 ? 1 : -1;
                wheelAccum = 0;
                goToPanel(currentPanel + dir);
            }
            clearTimeout(window._wheelTimer);
            window._wheelTimer = setTimeout(() => { wheelAccum = 0; }, 300);
            return;
        }

        wheelAccum += e.deltaY;
        if (Math.abs(wheelAccum) >= threshold && !isScrolling) {
            const dir = wheelAccum > 0 ? 1 : -1;
            wheelAccum = 0;
            goToPanel(currentPanel + dir);
        }
        clearTimeout(window._wheelTimer);
        window._wheelTimer = setTimeout(() => { wheelAccum = 0; }, 200);
    }, { passive: true });

    let touchStartY = 0;
    window.addEventListener('touchstart', e => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    window.addEventListener('touchend', e => {
        if (menuOpen) return;
        const diff = touchStartY - e.changedTouches[0].clientY;
        if (Math.abs(diff) > 60 && !isScrolling) {
            goToPanel(currentPanel + (diff > 0 ? 1 : -1));
        }
    }, { passive: true });

    window.addEventListener('keydown', e => {
        if (menuOpen) return;
        if (isScrolling) return;
        if (currentPanel === 0) {
            if (e.key === 'ArrowLeft')  { targetRotY -= 0.2;  e.preventDefault(); return; }
            if (e.key === 'ArrowRight') { targetRotY += 0.2;  e.preventDefault(); return; }
            if (e.key === 'ArrowUp')    { targetRotX = Math.max(-0.6, targetRotX - 0.1); e.preventDefault(); return; }
            if (e.key === 'ArrowDown')  { targetRotX = Math.min(0.6, targetRotX + 0.1);  e.preventDefault(); return; }
        }
        if (e.key === 'PageDown') { e.preventDefault(); goToPanel(currentPanel + 1); }
        if (e.key === 'PageUp')   { e.preventDefault(); goToPanel(currentPanel - 1); }
        if (e.key === 'Home') { e.preventDefault(); goToPanel(0); }
        if (e.key === 'End')  { e.preventDefault(); goToPanel(totalPanels - 1); }
        if (e.key === 'Escape' && menuOpen) closeMenu();
    });

    updateIndicator();
}

/* ==============================
   7. Hero 动画
   ============================== */
function initHeroAnim() {
    const tl = gsap.timeline({ delay: .2 });
    tl.to('.title-line', { y: 0, duration: 1.2, ease: 'power3.out', stagger: .15 });
    tl.to('.hero-label', { opacity: 1, duration: .8, ease: 'power2.out' }, '-=.6');
    tl.to('.hero-desc',  { opacity: 1, y: 0, duration: .8, ease: 'power2.out' }, '-=.5');
    tl.to('.hero-cta',   { opacity: 1, y: 0, duration: .8, ease: 'power2.out' }, '-=.4');
    tl.to('.hero-hint',  { opacity: 1, y: 0, duration: .8, delay: .2, ease: 'power2.out' }, '-=.3');
    triggerPanelAnim(0);
    if (btnExplore) {
        btnExplore.addEventListener('click', e => {
            e.preventDefault();
            goToPanel(1);
        });
    }

    /* ---- 强制 work-link 跳转（防止全屏滚动拦截） ---- */
    $$('.work-link').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            const href = link.getAttribute('href');
            if (href) window.location.href = href;
        });
    });
}

/* ==============================
   8. 作品面板入场动画
   ============================== */
function triggerPanelAnim(index) {
    const panel = panels[index];
    if (!panel) return;
    const info = panel.querySelector('.work-info');
    if (info) {
        gsap.to(info, { opacity: 1, y: 0, duration: .8, delay: .4, ease: 'power3.out' });
    }
}

function initWorkAnims() {
    panels.forEach((panel, i) => {
        if (i === 0 || i === panels.length - 1) return;
        ScrollTrigger.create({
            trigger: panel, start: 'top center',
            onEnter: () => triggerPanelAnim(i),
            onEnterBack: () => triggerPanelAnim(i)
        });
    });
}

/* ==============================
   9. About 面板动画
   ============================== */
function initAboutAnim() {
    const aboutPanel = $('.panel-about');
    if (!aboutPanel) return;
    ScrollTrigger.create({
        trigger: aboutPanel, start: 'top center',
        onEnter: () => {
            gsap.to('.about-heading span', { y: 0, duration: 1, stagger: .15, ease: 'power3.out' });
            gsap.to('.about-text p', { opacity: 1, y: 0, duration: .8, delay: .3, ease: 'power2.out' });
            gsap.to('.experience-block', { opacity: 1, y: 0, duration: .8, delay: .5, ease: 'power3.out' });
            gsap.to('.contact-card', { opacity: 1, y: 0, duration: .8, delay: .6, ease: 'power3.out' });
        }
    });
}

/* ==============================
   启动
   ============================== */
window.addEventListener('load', () => { runLoader(); });
window.addEventListener('resize', () => { ScrollTrigger.refresh(); });
