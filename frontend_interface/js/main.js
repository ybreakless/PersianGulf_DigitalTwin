import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ==========================================
// 1. DATA & STATE
// ==========================================
const APP = { 
    gender: 'male', 
    category: 'home', 
    subCategory: null, 
    model: null, 
    spin: true 
};

// DYNAMIC DASHBOARD TEMPLATES (The Right Panel Content)
const DASH_TEMPLATES = {
    home: `
        <div class="sim-card">
            <h4>System Status</h4>
            <div class="metric-grid">
                <div class="metric-box"><span class="metric-val">100%</span><span class="metric-label">INTEGRITY</span></div>
                <div class="metric-box"><span class="metric-val">37°C</span><span class="metric-label">CORE TEMP</span></div>
            </div>
        </div>
        <div class="sim-card">
            <h4>Actions</h4>
            <div style="font-size:12px; margin-bottom:5px;">Full System Scan</div>
            <div class="toggle-switch active"></div>
        </div>`,
    
    nervous: `
        <div class="sim-card">
            <h4>Neural Activity</h4>
            <div class="metric-grid">
                <div class="metric-box"><span class="metric-val">14 Hz</span><span class="metric-label">BETA WAVES</span></div>
                <div class="metric-box"><span class="metric-val">Active</span><span class="metric-label">CORTEX</span></div>
            </div>
        </div>
        <div class="sim-card">
            <h4>Simulation</h4>
            <div style="font-size:12px; margin-bottom:5px;">Synaptic Firing Rate</div>
            <input type="range" min="0" max="100" value="50">
        </div>`,
    
    circulation: `
        <div class="sim-card">
            <h4>Cardiac Metrics</h4>
            <div class="metric-grid">
                <div class="metric-box"><span class="metric-val" id="bpm-disp">72</span><span class="metric-label">BPM</span></div>
                <div class="metric-box"><span class="metric-val">120/80</span><span class="metric-label">BP</span></div>
            </div>
        </div>
        <div class="sim-card">
            <h4>Stress Test</h4>
            <div style="font-size:12px; margin-bottom:5px;">Heart Rate Control</div>
            <input type="range" min="40" max="180" value="72" oninput="document.getElementById('bpm-disp').innerText=this.value">
        </div>`,
        
    genetic: `
        <div class="sim-card">
            <h4>DNA Sequencing</h4>
            <div class="metric-grid">
                <div class="metric-box"><span class="metric-val">XY</span><span class="metric-label">TYPE</span></div>
                <div class="metric-box"><span class="metric-val">0.02%</span><span class="metric-label">MUTATION</span></div>
            </div>
        </div>`
};

// SUB-MENU DATA
const SYSTEM_DATA = {
    nervous: [{id:'brain', title:'Brain', desc:'Cerebrum & Cerebellum'}],
    circulation: [{id:'heart', title:'Heart', desc:'Cardiac Pump'}],
    skeletal: [{id:'skeleton', title:'Skeleton', desc:'Bones Structure'}, {id:'long_bone', title:'Femur', desc:'Long Bone Analysis'}],
    genetic: [{id:'dna', title:'DNA Helix', desc:'Genetic Code'}],
    immune: [{id:'covid', title:'SARS-CoV-2', desc:'Pathogen Model'}],
    digestive: [{id:'stomach', title:'Stomach', desc:'Gastric Anatomy'}]
};

// ASSETS MAP (Must match your folder structure exactly)
const ASSETS = {
    male: { 
        home: './assets/human_male_full.glb', 
        brain: './assets/brain_male.glb', 
        heart: './assets/beating_heart.glb', 
        dna: './assets/dna.glb', 
        covid: './assets/covid_19.glb', 
        skeleton: './assets/male_human_skeleton.glb', 
        stomach: './assets/human_digestive_stomach.glb',
        long_bone: './assets/long_bone.glb'
    },
    female: { 
        home: './assets/human_female_full.glb', 
        brain: './assets/brain_female.glb', 
        heart: './assets/beating_heart.glb', 
        dna: './assets/dna.glb', 
        covid: './assets/covid_19.glb', 
        skeleton: './assets/female_human_skeleton.glb', 
        stomach: './assets/human_digestive_stomach.glb',
        long_bone: './assets/long_bone.glb'
    }
};

// ==========================================
// 2. AUTHENTICATION LOGIC
// ==========================================
const loginView = document.getElementById('login-view');
const regView = document.getElementById('register-view');

// Interactive Registry Button
document.getElementById('go-to-register').addEventListener('click', (e) => {
    e.preventDefault();
    loginView.classList.add('hidden');
    regView.classList.remove('hidden');
});

document.getElementById('btn-cancel').addEventListener('click', () => {
    regView.classList.add('hidden');
    loginView.classList.remove('hidden');
});

document.getElementById('btn-login').addEventListener('click', () => {
    // Fade out auth layer
    document.getElementById('auth-layer').style.opacity = 0;
    setTimeout(() => {
        document.getElementById('auth-layer').classList.add('hidden');
        document.getElementById('app-layer').classList.remove('hidden');
        init3D();
    }, 500);
});

// ==========================================
// 3. UI & NAVIGATION
// ==========================================
window.switchCategory = (cat) => {
    APP.category = cat; 
    APP.subCategory = null;
    
    // UI Updates
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    // Find button by onclick content
    const btn = Array.from(document.querySelectorAll('.nav-item')).find(el => el.getAttribute('onclick')?.includes(cat));
    if(btn) btn.classList.add('active');

    // Close Submenu
    document.getElementById('sub-menu-layer').classList.add('hidden');
    document.getElementById('main-nav-rail').classList.remove('hidden');
    
    loadModel(cat); 
    updateDash(cat);
};

window.openSystemPage = (sysId, sysName) => {
    APP.category = sysId;
    document.getElementById('main-nav-rail').classList.add('hidden');
    
    const subLayer = document.getElementById('sub-menu-layer');
    subLayer.classList.remove('hidden');
    document.getElementById('sub-menu-title').innerText = sysName;
    
    const content = document.getElementById('sub-menu-content');
    content.innerHTML = '';
    
    if(SYSTEM_DATA[sysId]) {
        SYSTEM_DATA[sysId].forEach((item, i) => {
            const el = document.createElement('div');
            el.className = 'sim-card'; 
            el.style.cursor = 'pointer'; 
            el.style.animationDelay = (i * 0.1) + 's';
            el.innerHTML = `<strong>${item.title}</strong><br><small style="color:#888">${item.desc}</small>`;
            el.onclick = () => { APP.subCategory = item.id; loadModel(sysId); };
            content.appendChild(el);
        });
    }
    
    loadModel(sysId);
    updateDash(sysId);
};

window.closeSystemPage = () => {
    document.getElementById('sub-menu-layer').classList.add('hidden');
    document.getElementById('main-nav-rail').classList.remove('hidden');
    window.switchCategory('home');
};

function updateDash(cat) {
    document.getElementById('sim-control-panel').innerHTML = DASH_TEMPLATES[cat] || DASH_TEMPLATES.home;
}

// ==========================================
// 4. THREE.JS ENGINE & MANIPULATOR
// ==========================================
let scene, camera, renderer, controls;

function init3D() {
    const container = document.getElementById('canvas-container');
    scene = new THREE.Scene();
    
    camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 100);
    camera.position.set(0, 1.5, 5);
    
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    const amb = new THREE.AmbientLight(0xffffff, 0.6); scene.add(amb);
    const spot = new THREE.SpotLight(0x0a84ff, 15); spot.position.set(5, 10, 5); scene.add(spot);
    
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    loadModel('home');
    updateDash('home');
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function loadModel(cat) {
    // 1. Resolve Key
    let key = APP.subCategory ? APP.subCategory : cat;
    
    // Fallback mappings
    if(cat==='nervous' && !APP.subCategory) key='brain';
    if(cat==='circulation' && !APP.subCategory) key='heart';
    if(cat==='genetic' && !APP.subCategory) key='dna';
    if(cat==='skeletal' && !APP.subCategory) key='skeleton';
    if(cat==='immune' && !APP.subCategory) key='covid';
    if(cat==='digestive' && !APP.subCategory) key='stomach';

    const path = ASSETS[APP.gender][key];
    if(!path) return console.warn("Asset not found:", key);

    // 2. Clear Old Model (Ghost Fix)
    const loaderUI = document.getElementById('loader');
    loaderUI.style.display = 'block';

    if(APP.model) {
        scene.remove(APP.model);
        APP.model.traverse(o=>{ if(o.isMesh){ o.geometry.dispose(); if(o.material)o.material.dispose(); } });
        APP.model = null;
    }

    // 3. Load New
    new GLTFLoader().load(path, (gltf) => {
        APP.model = gltf.scene;
        
        // Center
        const box = new THREE.Box3().setFromObject(APP.model);
        const center = box.getCenter(new THREE.Vector3());
        APP.model.position.sub(center);

        // Glass Material for Organs
        if(cat !== 'home') {
             const mat = new THREE.MeshPhysicalMaterial({
                color: 0xffffff, metalness: 0.2, roughness: 0.2, transmission: 0.5, transparent: true
            });
            APP.model.traverse(o => { if(o.isMesh) o.material = mat; });
        }
        
        scene.add(APP.model);
        loaderUI.style.display = 'none';
        
        // Reset Manipulators
        document.getElementById('expansion-slider').value = 0;
        
    }, undefined, (err) => { 
        console.error(err); 
        loaderUI.style.display = 'none'; 
    });
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    if(APP.model && APP.spin) APP.model.rotation.y += 0.005;
    renderer.render(scene, camera);
}

// --- MANIPULATOR LOGIC (WOOFWOOF) ---
document.getElementById('wireframe-toggle').onclick = (e) => {
    e.target.classList.toggle('active');
    const isWire = e.target.classList.contains('active');
    if(APP.model) APP.model.traverse(o => { if(o.isMesh && o.material) o.material.wireframe = isWire; });
};

document.getElementById('spin-toggle').onclick = (e) => {
    e.target.classList.toggle('active');
    APP.spin = e.target.classList.contains('active');
};

document.getElementById('expansion-slider').oninput = (e) => {
    const s = 1 + parseFloat(e.target.value);
    if(APP.model) APP.model.scale.set(s,s,s);
};

document.getElementById('roughness-slider').oninput = (e) => {
    const val = parseFloat(e.target.value);
    if(APP.model) APP.model.traverse(o => { if(o.isMesh && o.material) o.material.roughness = val; });
};

// Gender Logic
document.getElementById('btn-male').onclick = () => { APP.gender='male'; loadModel(APP.category); document.getElementById('btn-male').classList.add('active'); document.getElementById('btn-female').classList.remove('active'); };
document.getElementById('btn-female').onclick = () => { APP.gender='female'; loadModel(APP.category); document.getElementById('btn-female').classList.add('active'); document.getElementById('btn-male').classList.remove('active'); };

// Reset Camera
window.resetCam = () => controls.reset();