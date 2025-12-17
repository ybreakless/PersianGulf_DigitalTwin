import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ==========================================
// 1. DATA CONFIGURATION
// ==========================================
const APP_STATE = { gender: 'male', category: 'home', subCategory: null, currentModel: null };

// Dynamic Dashboard Templates
const DASHBOARD_TEMPLATES = {
    home: `
        <div class="sim-card">
            <h4>System Status</h4>
            <div class="metric-grid">
                <div class="metric-box"><span class="metric-val">100%</span><span class="metric-label">INTEGRITY</span></div>
                <div class="metric-box"><span class="metric-val">37°C</span><span class="metric-label">CORE TEMP</span></div>
            </div>
        </div>
        <div class="sim-card">
            <h4>Quick Actions</h4>
            <div class="control-row"><span>Full Scan</span><div class="toggle-switch active"></div></div>
            <div class="control-row"><span>Auto-Rotate</span><div class="toggle-switch active"></div></div>
        </div>`,
    nervous: `
        <div class="sim-card">
            <h4>Brain Activity</h4>
            <div class="metric-grid">
                <div class="metric-box"><span class="metric-val">14 Hz</span><span class="metric-label">BETA WAVES</span></div>
                <div class="metric-box"><span class="metric-val">Active</span><span class="metric-label">CORTEX</span></div>
            </div>
        </div>
        <div class="sim-card">
            <h4>Neuro-Simulation</h4>
            <div style="margin-bottom:8px; font-size:12px;">Synaptic Firing Rate</div>
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
            <h4>Pumping Simulation</h4>
            <div class="control-row"><span>Adrenaline Rush</span><div class="toggle-switch"></div></div>
            <div style="margin-bottom:8px; font-size:12px;">Heart Rate Control</div>
            <input type="range" min="40" max="180" value="72" oninput="document.getElementById('bpm-disp').innerText=this.value">
        </div>`,
    genetic: `
        <div class="sim-card">
            <h4>DNA Sequencing</h4>
            <div class="metric-grid">
                <div class="metric-box"><span class="metric-val">XX/XY</span><span class="metric-label">CHROMOSOME</span></div>
                <div class="metric-box"><span class="metric-val">0.01%</span><span class="metric-label">MUTATION</span></div>
            </div>
        </div>
        <div class="sim-card">
            <h4>Helix Manipulation</h4>
            <div class="control-row"><span>Unwind Strands</span><div class="toggle-switch"></div></div>
            <div class="control-row"><span>Highlight Genes</span><div class="toggle-switch active"></div></div>
        </div>`
};

const SYSTEM_DATA = {
    nervous: [ { id: 'brain', title: 'Brain Model', desc: 'Cerebrum & Cerebellum' } ],
    circulation: [ { id: 'heart', title: 'Beating Heart', desc: 'Real-time Cardiac Rhythm' } ],
    skeletal: [ { id: 'skeleton', title: 'Full Skeleton', desc: 'Axial & Appendicular' }, { id: 'long_bone', title: 'Long Bone', desc: 'Femur/Humerus Analysis' } ],
    digestive: [ { id: 'stomach', title: 'Stomach', desc: 'Gastric Anatomy' }, { id: 'intestines', title: 'Intestines', desc: 'Small & Large Tract' } ],
    genetic: [ { id: 'dna', title: 'DNA Helix', desc: 'Double Helix Structure' } ],
    immune: [ { id: 'covid', title: 'SARS-CoV-2', desc: 'Pathogen Visualization' } ]
};

// ASSETS (Corrected Paths)
const ASSETS = {
    male: {
        home: './assets/human_male_full.glb',
        brain: './assets/brain_male.glb',
        skeleton: './assets/male_human_skeleton.glb',
        heart: './assets/beating_heart.glb',
        stomach: './assets/human_digestive_stomach.glb',
        dna: './assets/dna.glb',
        covid: './assets/covid_19.glb'
    },
    female: {
        // Fixed typo: human_femlae_full -> human_female_full
        home: './assets/human_female_full.glb',
        brain: './assets/brain_female.glb',
        skeleton: './assets/female_human_skeleton.glb',
        heart: './assets/beating_heart.glb',
        stomach: './assets/human_digestive_stomach.glb',
        dna: './assets/dna.glb',
        covid: './assets/covid_19.glb'
    }
};

// ==========================================
// 2. AUTH & LOGIC
// ==========================================
const Auth = {
    KEY: 'y314_database',
    getDB: function() { try { return JSON.parse(localStorage.getItem(this.KEY)) || []; } catch(e) { return []; } },
    saveUser: function(userProfile) {
        const db = this.getDB();
        if (db.find(u => u.id === userProfile.id)) return { success: false, msg: 'ERROR: ID EXISTS' };
        db.push(userProfile);
        localStorage.setItem(this.KEY, JSON.stringify(db));
        return { success: true, msg: 'PROFILE CREATED' };
    },
    authenticate: function(id, pass) {
        const db = this.getDB();
        const user = db.find(u => u.id === id && u.pass === pass);
        if (user) return { success: true, user: user };
        return { success: false, msg: 'INVALID CREDENTIALS' };
    }
};

// UI Handlers
const loginView = document.getElementById('login-view');
const regView = document.getElementById('register-view');
const authMsg = document.getElementById('auth-msg');

document.getElementById('go-to-register').addEventListener('click', () => { loginView.classList.add('hidden'); regView.classList.remove('hidden'); authMsg.innerText = ''; });
document.getElementById('btn-cancel').addEventListener('click', () => { regView.classList.add('hidden'); loginView.classList.remove('hidden'); authMsg.innerText = ''; });

window.selectRegGender = function(gender) {
    document.getElementById('reg-sex').value = gender;
    document.getElementById('reg-male-btn').classList.toggle('active', gender === 'male');
    document.getElementById('reg-female-btn').classList.toggle('active', gender === 'female');
};

document.getElementById('btn-register').addEventListener('click', () => {
    const id = document.getElementById('reg-id').value;
    const pass = document.getElementById('reg-pass').value;
    const name = document.getElementById('reg-name').value;
    const gender = document.getElementById('reg-sex').value;
    
    if (!id || !pass || !name) { authMsg.innerText = "ALL FIELDS REQUIRED"; authMsg.className = "msg-box msg-error"; return; }
    if (!gender) { authMsg.innerText = "SELECT BIOLOGICAL PROFILE"; authMsg.className = "msg-box msg-error"; return; }

    authMsg.innerText = "PROCESSING...";
    setTimeout(() => {
        const result = Auth.saveUser({ id, pass, name, gender });
        if (result.success) {
            authMsg.className = "msg-box msg-success"; authMsg.innerText = result.msg;
            setTimeout(() => document.getElementById('btn-cancel').click(), 1000);
        } else { authMsg.className = "msg-box msg-error"; authMsg.innerText = result.msg; }
    }, 800);
});

document.getElementById('btn-login').addEventListener('click', () => {
    const id = document.getElementById('login-id').value;
    const pass = document.getElementById('login-pass').value;
    const btn = document.getElementById('btn-login');
    btn.innerHTML = 'AUTHENTICATING...';
    
    setTimeout(() => {
        const res = Auth.authenticate(id, pass);
        if (res.success) {
            APP_STATE.gender = res.user.gender;
            document.getElementById('user-display').innerText = res.user.id.toUpperCase();
            syncGenderToggle(res.user.gender);
            
            document.getElementById('auth-layer').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('auth-layer').style.display = 'none';
                document.getElementById('app-layer').classList.remove('hidden');
                init3D();
            }, 800);
        } else {
            authMsg.innerText = res.msg; authMsg.className = "msg-box msg-error"; btn.innerHTML = 'INITIALIZE SESSION';
        }
    }, 1000);
});

// ==========================================
// 3. APP NAVIGATION & DASHBOARD
// ==========================================
const themeBtn = document.getElementById('theme-toggle');
const htmlEl = document.documentElement;
themeBtn.addEventListener('click', () => {
    const next = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    htmlEl.setAttribute('data-theme', next);
    const icon = themeBtn.querySelector('i');
    icon.className = next === 'light' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
    update3DLighting(next);
});

// Switch Main Categories (Home vs Systems)
window.switchCategory = function(cat) {
    APP_STATE.category = cat;
    APP_STATE.subCategory = null;
    
    // UI Updates
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.querySelector(`button[onclick="switchCategory('${cat}')"]`)?.classList.add('active');
    
    // Close Submenu if going Home
    if (cat === 'home') {
        document.getElementById('sub-menu-layer').classList.add('hidden');
        document.getElementById('main-nav-rail').classList.remove('hidden');
    }

    loadModel(cat);
    updateDashboard(cat);
};

window.openSystemPage = function(systemId, systemName) {
    document.getElementById('main-nav-rail').classList.add('minimized'); // Hide rail
    const subLayer = document.getElementById('sub-menu-layer');
    document.getElementById('sub-menu-title').innerText = systemName;
    const content = document.getElementById('sub-menu-content');
    content.innerHTML = ''; 

    const items = SYSTEM_DATA[systemId];
    if(items) {
        items.forEach((item, index) => {
            const btn = document.createElement('div');
            btn.className = 'sim-card'; // Reuse sim-card style for sub-menu
            btn.style.cursor = 'pointer'; btn.style.marginBottom = '10px';
            btn.style.animationDelay = `${index * 0.05}s`;
            btn.innerHTML = `<div><h4>${item.title}</h4><p style="font-size:12px;color:#888">${item.desc}</p></div>`;
            btn.onclick = () => loadSubModel(systemId, item.id, btn);
            content.appendChild(btn);
        });
    }
    subLayer.classList.remove('hidden');
    
    // Load default model for this system immediately
    APP_STATE.category = systemId;
    loadModel(systemId); 
    updateDashboard(systemId);
};

window.closeSystemPage = function() {
    document.getElementById('sub-menu-layer').classList.add('hidden');
    setTimeout(() => { document.getElementById('main-nav-rail').classList.remove('minimized'); }, 100);
    window.switchCategory('home');
};

function loadSubModel(cat, sub, btn) {
    document.querySelectorAll('.sim-card').forEach(b => b.style.borderColor = 'transparent');
    btn.style.borderColor = '#00f3ff';
    APP_STATE.subCategory = sub;
    loadModel(cat);
}

function updateDashboard(category) {
    const panel = document.getElementById('sim-control-panel');
    const template = DASHBOARD_TEMPLATES[category] || DASHBOARD_TEMPLATES['home'];
    panel.innerHTML = template;
}

// ==========================================
// 4. 3D ENGINE
// ==========================================
let scene, camera, renderer, controls;
const loaderUI = document.getElementById('loader');
let keyLight, amb;

function init3D() {
    const container = document.getElementById('canvas-container');
    scene = new THREE.Scene();
    
    camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 100);
    camera.position.set(0, 1.5, 4.5);
    
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    amb = new THREE.AmbientLight(0xffffff, 0.6); scene.add(amb);
    keyLight = new THREE.SpotLight(0x0a84ff, 25); keyLight.position.set(5, 8, 5); scene.add(keyLight);
    
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    
    // Initial Load
    loadModel('home');
    updateDashboard('home');
    animate();
    
    window.addEventListener('resize', () => { 
        camera.aspect = window.innerWidth/window.innerHeight; 
        camera.updateProjectionMatrix(); 
        renderer.setSize(window.innerWidth, window.innerHeight); 
    });
}

function loadModel(category) {
    // 1. Determine Key
    let key = category;
    if (APP_STATE.subCategory) key = APP_STATE.subCategory;
    
    // Mapping Fallbacks if simple key doesn't match
    if (category === 'nervous' && !APP_STATE.subCategory) key = 'brain';
    if (category === 'skeletal' && !APP_STATE.subCategory) key = 'skeleton';
    if (category === 'circulation' && !APP_STATE.subCategory) key = 'heart';
    if (category === 'genetic' && !APP_STATE.subCategory) key = 'dna';
    if (category === 'immune' && !APP_STATE.subCategory) key = 'covid';
    if (category === 'digestive' && !APP_STATE.subCategory) key = 'stomach';

    // 2. Get Path from Gender Asset Map
    const path = ASSETS[APP_STATE.gender][key];
    
    if(!path) { 
        console.warn("Missing asset config for:", key); 
        return; 
    }

    loaderUI.style.display = 'block';

    // 3. REMOVE PREVIOUS MODEL (Crucial Fix)
    if(APP_STATE.currentModel) {
        scene.remove(APP_STATE.currentModel);
        
        // Clean up memory
        APP_STATE.currentModel.traverse((child) => {
            if (child.isMesh) {
                child.geometry.dispose();
                if (child.material) child.material.dispose();
            }
        });
        APP_STATE.currentModel = null;
    }

    // 4. Load New
    new GLTFLoader().load(path, (gltf) => {
        APP_STATE.currentModel = gltf.scene;
        
        const box = new THREE.Box3().setFromObject(APP_STATE.currentModel);
        const center = box.getCenter(new THREE.Vector3());
        APP_STATE.currentModel.position.x -= center.x;
        APP_STATE.currentModel.position.y -= center.y;
        APP_STATE.currentModel.position.z -= center.z;
        
        // Apply Glass Material if organ
        if(category !== 'home') {
            const mat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0.2, roughness: 0.1, transmission: 0.3, opacity: 0.9, transparent: true });
            APP_STATE.currentModel.traverse(c => { if(c.isMesh) c.material = mat; });
        }
        
        scene.add(APP_STATE.currentModel);
        loaderUI.style.display = 'none';
    }, undefined, (error) => { 
        console.error("ERROR LOADING MODEL:", path);
        loaderUI.style.display = 'none'; 
    });
}

function update3DLighting(theme) {
    if(theme === 'light') { keyLight.color.setHex(0x007aff); amb.intensity = 1.0; }
    else { keyLight.color.setHex(0x0a84ff); amb.intensity = 0.6; }
}

function animate() { requestAnimationFrame(animate); controls.update(); renderer.render(scene, camera); }

function syncGenderToggle(sex) {
    const m = document.getElementById('btn-male'), f = document.getElementById('btn-female');
    if(sex === 'male') { m.classList.add('active'); f.classList.remove('active'); }
    else { f.classList.add('active'); m.classList.remove('active'); }
}

document.getElementById('btn-male').onclick = () => { 
    APP_STATE.gender = 'male'; 
    syncGenderToggle('male'); 
    loadModel(APP_STATE.category); 
};

document.getElementById('btn-female').onclick = () => { 
    APP_STATE.gender = 'female'; 
    syncGenderToggle('female'); 
    loadModel(APP_STATE.category); 
};

window.openModal = (id) => console.log("Open Modal", id);
window.resetCam = () => controls.reset();
document.getElementById('btn-logout').onclick = () => location.reload();

// Global Opacity Slider Logic
document.getElementById('global-opacity').addEventListener('input', (e) => {
    if(APP_STATE.currentModel) {
        APP_STATE.currentModel.traverse((child) => {
            if(child.isMesh) {
                child.material.transparent = true;
                child.material.opacity = e.target.value;
            }
        });
    }
});