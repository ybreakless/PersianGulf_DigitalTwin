import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// --- GLOBAL STATE ---
const APP = { gender: 'male', category: 'home', subCategory: null, model: null, spin: true, darkMode: true, spotlightColor: 0xff00ff };

const DASH_TEMPLATES = {
    home: `<div class="sim-card"><h4>System Status</h4><div style="display:flex;justify-content:space-between"><div class="metric-box"><span class="metric-val" style="color:#00ff88">99.8%</span><br><small>INTEGRITY</small></div><div class="metric-box"><span class="metric-val">37°C</span><br><small>TEMP</small></div></div></div>`,
    nervous: `<div class="sim-card"><h4>Neural Net</h4><div class="metric-box"><span class="metric-val">14 Hz</span><br><small>BETA WAVES</small></div></div>`
};

const SYSTEM_TREE = {
    nervous: [ { id: 'brain', title: 'Brain (Full)' }, { id: 'spinal', title: 'Spinal Cord' } ],
    circulation: [ { id: 'heart', title: 'Heart' }, { id: 'veins', title: 'Vascular System' } ],
    immune: [ { id: 'antibody', title: 'Antibody' }, { id: 'tcell', title: 'T-Cell' }, { id: 'macrophage', title: 'Macrophage' }, { id: 'covid', title: 'Pathogen' } ],
    digestive: [ { id: 'stomach', title: 'Stomach' }, { id: 'intestines', title: 'Intestines' } ],
    genetic: [ { id: 'dna', title: 'DNA Helix' } ],
    skeletal: [ { id: 'skeleton', title: 'Full Skeleton' }, { id: 'long_bone', title: 'Femur' } ]
};

const BASE = '/frontend_interface/assets/';
const ASSETS = {
    male: { 
        home: BASE+'human_male_full.glb', brain: BASE+'brain_male.glb', heart: BASE+'beating_heart.glb', dna: BASE+'dna.glb', covid: BASE+'covid_19.glb', skeleton: BASE+'male_human_skeleton.glb', stomach: BASE+'human_digestive_stomach.glb', intestines: BASE+'small_and_large_intestine.glb', spinal: BASE+'spinal_cord.glb'
    },
    female: { 
        home: BASE+'human_female_full.glb', brain: BASE+'brain_female.glb', heart: BASE+'beating_heart.glb', dna: BASE+'dna.glb', covid: BASE+'covid_19.glb', skeleton: BASE+'female_human_skeleton.glb', stomach: BASE+'human_digestive_stomach.glb', intestines: BASE+'small_and_large_intestine.glb', spinal: BASE+'spinal_cord.glb'
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initPixelBackground();
    initLoginCat();
    initBananaCat(); 

    // Theme & Auth
    document.getElementById('login-theme-toggle').addEventListener('click', toggleTheme);
    document.getElementById('app-theme-toggle').addEventListener('click', toggleTheme);
    function toggleTheme() {
        APP.darkMode = !APP.darkMode;
        document.documentElement.setAttribute('data-theme', APP.darkMode ? 'dark' : 'light');
    }

    document.getElementById('btn-login').addEventListener('click', () => {
        if(document.getElementById('login-id').value && document.getElementById('login-pass').value) {
            document.getElementById('auth-layer').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('auth-layer').classList.add('hidden');
                document.getElementById('app-layer').classList.remove('hidden');
                init3D();
            }, 500);
        } else alert("Credentials Required");
    });

    // Registry & Gender
    document.getElementById('go-to-register').onclick = () => { document.getElementById('login-view').classList.add('hidden'); document.getElementById('register-view').classList.remove('hidden'); };
    document.getElementById('btn-back-login').onclick = () => { document.getElementById('register-view').classList.add('hidden'); document.getElementById('login-view').classList.remove('hidden'); };
    
    document.getElementById('reg-male-btn').addEventListener('click', function(e) {
        this.classList.add('active'); document.getElementById('reg-female-btn').classList.remove('active');
    });
    document.getElementById('reg-female-btn').addEventListener('click', function(e) {
        this.classList.add('active'); document.getElementById('reg-male-btn').classList.remove('active');
    });

    // SETTINGS & LOGOUT
    document.getElementById('btn-settings').addEventListener('click', openSettings);
    document.getElementById('btn-logout').addEventListener('click', () => location.reload());

    // Controls
    document.getElementById('manipulator-toggle').addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById('manipulator-panel').classList.toggle('hidden');
    });
    document.getElementById('expansion-slider').addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if(APP.model) APP.model.scale.set(val, val, val);
    });

    // Gemini
    document.getElementById('btn-gemini').addEventListener('click', () => document.getElementById('ai-modal').classList.remove('hidden'));

    // NAVIGATION (FLOATY BUBBLE SUBMENU)
    window.switchCategory = (cat) => { 
        APP.category = cat; 
        APP.subCategory = null; 
        updateNavUI(cat);
        if(cat === 'home') {
            document.getElementById('sub-menu-layer').classList.add('hidden');
            loadModel(cat);
        }
    };
    
    window.openSystemPage = (sysId, sysName) => { 
        APP.category = sysId; 
        updateNavUI(sysId);
        
        const flyout = document.getElementById('sub-menu-layer');
        const flyoutContent = document.getElementById('flyout-content');
        const flyoutTitle = document.getElementById('flyout-title');
        
        flyoutContent.innerHTML = '';
        flyoutTitle.innerText = sysName.toUpperCase();
        
        if(SYSTEM_TREE[sysId]) {
            flyout.classList.remove('hidden');
            SYSTEM_TREE[sysId].forEach(item => {
                const btn = document.createElement('div');
                btn.className = 'flyout-btn'; // Use Bubble Class
                btn.innerText = item.title;
                btn.onclick = () => { 
                    APP.subCategory = item.id; 
                    loadModel(sysId); 
                    document.querySelectorAll('.flyout-btn').forEach(b => b.style.backgroundColor = 'rgba(255,255,255,0.08)');
                    btn.style.backgroundColor = 'var(--accent-blue)';
                    btn.style.color = '#000';
                };
                flyoutContent.appendChild(btn);
            });
            loadModel(sysId);
        } else {
            flyout.classList.add('hidden');
            loadModel(sysId);
        }
    };
    
    window.closeSystemPage = () => { document.getElementById('sub-menu-layer').classList.add('hidden'); window.switchCategory('home'); };

    function updateNavUI(cat) {
        document.querySelectorAll('.nav-item').forEach(b => {
             const icon = b.querySelector('.glossy-circle');
             if(icon) icon.classList.remove('active');
        });
        const btn = document.querySelector(`button[onclick*='${cat}']`);
        if(btn) {
            const icon = btn.querySelector('.glossy-circle');
            if(icon) icon.classList.add('active');
        }
        document.getElementById('sim-control-panel').innerHTML = DASH_TEMPLATES[cat] || DASH_TEMPLATES.home;
    }
});

// --- PIXEL BG ---
function initPixelBackground() {
    const c = document.getElementById('pixel-canvas'); const ctx = c.getContext('2d');
    let w, h, p = [];
    function r() { w = window.innerWidth; h = window.innerHeight; c.width = w; c.height = h; p = []; for(let x=0;x<w;x+=40) for(let y=0;y<h;y+=40) p.push({x,y}); }
    function d() {
        ctx.clearRect(0,0,w,h); const t = Date.now()*0.001;
        const c1 = APP.darkMode ? [0, 243, 255] : [0, 200, 100];
        const c2 = APP.darkMode ? [255, 0, 255] : [255, 200, 0];
        p.forEach(pt => {
            const i = (Math.sin(pt.x*0.01+t)+Math.cos(pt.y*0.01+t))*0.5+0.5;
            ctx.fillStyle = `rgba(${c1[0]+(c2[0]-c1[0])*i},${c1[1]+(c2[1]-c1[1])*i},${c1[2]+(c2[2]-c1[2])*i},${0.1+i*0.2})`;
            ctx.fillRect(pt.x, pt.y, 38, 38);
        });
        requestAnimationFrame(d);
    }
    window.addEventListener('resize', r); r(); d();
}

// --- 3D ENGINE ---
let scene, camera, renderer, controls, rimLight;
function init3D() {
    const cont = document.getElementById('canvas-container'); if(!cont) return;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 100);
    camera.position.set(0, 1.2, 5);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    cont.appendChild(renderer.domElement);
    const amb = new THREE.AmbientLight(0xffffff, 0.5); scene.add(amb);
    const key = new THREE.SpotLight(0xffffff, 10); key.position.set(5, 10, 7); scene.add(key);
    rimLight = new THREE.DirectionalLight(APP.spotlightColor, 3); rimLight.position.set(-5, 2, -5); scene.add(rimLight);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    loadModel('home'); animate();
    window.addEventListener('resize', () => { camera.aspect = window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); });
}

function cleanScene() { for(let i=scene.children.length-1; i>=0; i--) { const o = scene.children[i]; if(o.isMesh || o.isGroup) { scene.remove(o); if(o.geometry) o.geometry.dispose(); } } APP.model = null; }

function loadModel(cat) {
    document.getElementById('loader').style.display = 'block';
    cleanScene();
    let key = APP.subCategory ? APP.subCategory : cat;
    if(cat==='nervous' && !APP.subCategory) key='brain';
    const path = (ASSETS[APP.gender] && ASSETS[APP.gender][key]) ? ASSETS[APP.gender][key] : null;

    if(APP.gender === 'female') { document.documentElement.style.setProperty('--accent-blue', '#ff00ff'); } 
    else { document.documentElement.style.setProperty('--accent-blue', '#00f3ff'); }

    if(path) {
        new GLTFLoader().load(path, (gltf) => {
            APP.model = gltf.scene;
            const box = new THREE.Box3().setFromObject(APP.model);
            APP.model.position.sub(box.getCenter(new THREE.Vector3()));
            if(APP.gender === 'female') APP.model.scale.multiplyScalar(0.9);
            scene.add(APP.model);
            document.getElementById('loader').style.display = 'none';
        }, undefined, () => { createProcedural(); document.getElementById('loader').style.display = 'none'; });
    } else { createProcedural(); document.getElementById('loader').style.display = 'none'; }
}

function createProcedural() {
    const geo = new THREE.IcosahedronGeometry(1, 1);
    const mat = new THREE.MeshStandardMaterial({color: APP.gender==='female'?0xff00ff:0x00f3ff, wireframe: true});
    APP.model = new THREE.Mesh(geo, mat); scene.add(APP.model);
}

function animate() { requestAnimationFrame(animate); controls.update(); if(APP.model && APP.spin) APP.model.rotation.y += 0.003; renderer.render(scene, camera); }

// --- MEOWMEOW (CENTER LEFT) ---
function initLoginCat() {
    const cont = document.getElementById('cat-canvas-container'); if(!cont) return;
    const sc = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(50, cont.clientWidth/cont.clientHeight, 0.1, 100);
    cam.position.set(0, 0.5, 4.5); 
    const ren = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    ren.setSize(cont.clientWidth, cont.clientHeight);
    cont.appendChild(ren.domElement);
    const l1 = new THREE.DirectionalLight(0xffffff, 2); l1.position.set(2,2,5); sc.add(l1);
    
    let mixer;
    new GLTFLoader().load(BASE+'MEOWMEOW.glb', (gltf) => {
        const cat = gltf.scene;
        cat.position.set(-1.5, -1, 0); // MOVED LEFT TO CENTER
        cat.scale.set(1.4, 1.4, 1.4); 
        cat.lookAt(-5, 0, 5); 
        sc.add(cat);
        if(gltf.animations.length) { mixer = new THREE.AnimationMixer(cat); mixer.clipAction(gltf.animations[0]).play(); }
    }, undefined, () => {
        sc.add(new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshBasicMaterial({color:0x00f3ff, wireframe:true})));
    });
    
    const clk = new THREE.Clock();
    function anim() { requestAnimationFrame(anim); if(mixer) mixer.update(clk.getDelta()); ren.render(sc, cam); }
    anim();
}

// --- BANANA CAT ---
function initBananaCat() {
    const cont = document.getElementById('banana-cat-container'); if(!cont) return;
    const sc = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(50, cont.clientWidth/cont.clientHeight, 0.1, 100);
    cam.position.set(0, 0, 3);
    const ren = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    ren.setSize(cont.clientWidth, cont.clientHeight);
    cont.appendChild(ren.domElement);
    const l1 = new THREE.AmbientLight(0xffffff, 0.8); sc.add(l1);
    const l2 = new THREE.DirectionalLight(0xffffff, 1.5); l2.position.set(0, 2, 2); sc.add(l2);
    
    let bananaMesh;
    new GLTFLoader().load(BASE+'banana_cat.glb', (gltf) => {
        bananaMesh = gltf.scene;
        const box = new THREE.Box3().setFromObject(bananaMesh);
        bananaMesh.position.sub(box.getCenter(new THREE.Vector3()));
        bananaMesh.scale.set(1.5, 1.5, 1.5); 
        sc.add(bananaMesh);
    }, undefined, () => {});
    
    function anim() { requestAnimationFrame(anim); if(bananaMesh) bananaMesh.rotation.y += 0.01; ren.render(sc, cam); }
    anim();
}

// --- BUTTONS ---
document.getElementById('wireframe-toggle').onclick = (e) => { e.target.classList.toggle('active'); if(APP.model) APP.model.traverse(o => { if(o.isMesh) o.material.wireframe = !o.material.wireframe; }); };
document.getElementById('spin-toggle').onclick = (e) => { e.target.classList.toggle('active'); APP.spin = !APP.spin; };
document.getElementById('btn-male').onclick = function() { APP.gender='male'; loadModel(APP.category); this.classList.add('active'); document.getElementById('btn-female').classList.remove('active'); };
document.getElementById('btn-female').onclick = function() { APP.gender='female'; loadModel(APP.category); this.classList.add('active'); document.getElementById('btn-male').classList.remove('active'); };
window.resetCam = () => controls.reset();