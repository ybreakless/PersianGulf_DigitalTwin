import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import GUI from 'lil-gui'; 

// ==========================================
// 1. DATA CONFIGURATION & STATE
// ==========================================
const APP_STATE = { 
    gender: 'male', 
    category: 'home',
    subCategory: null,
    userProfile: null
};

// Sub-Menus Data
const SYSTEM_DATA = {
    nervous: [
        { id: 'brain', title: 'Brain Model', desc: 'Cerebrum & Cerebellum' },
        { id: 'nerves', title: 'Nerve Network', desc: 'Peripheral CNS' }
    ],
    circulation: [
        { id: 'heart', title: 'Heart', desc: '4-Chamber View' },
        { id: 'veins', title: 'Vascular System', desc: 'Arteries & Veins' }
    ],
    skeletal: [
        { id: 'skull', title: 'Skull', desc: 'Cranial Structure' },
        { id: 'spine', title: 'Spine', desc: 'Vertebral Column' }
    ],
    digestive: [
        { id: 'stomach', title: 'Stomach', desc: 'Gastric Anatomy' },
        { id: 'intestines', title: 'Intestines', desc: 'Small & Large' }
    ],
    genetic: [
        { id: 'dna', title: 'DNA Helix', desc: 'Double Helix Structure' },
        { id: 'rna', title: 'RNA Strand', desc: 'Single Strand Messenger' },
        { id: 'chromosome', title: 'Chromosome', desc: 'X/Y Structure Analysis' },
        { id: 'sequence', title: 'Gene Sequencing', desc: 'Base Pair Map' }
    ],
    immune: [
        { id: 'wbc', title: 'White Blood Cells', desc: 'Leukocytes' },
        { id: 'pathogen', title: 'Pathogen Map', desc: 'Viral Agents' }
    ]
};

// ==========================================
// 2. AUTHENTICATION SYSTEM
// ==========================================
const Auth = {
    KEY: 'y314_database',
    getDB: function() {
        try { return JSON.parse(localStorage.getItem(this.KEY)) || []; } 
        catch(e) { return []; }
    },
    saveUser: function(userProfile) {
        const db = this.getDB();
        if (db.find(u => u.id === userProfile.id)) {
            return { success: false, msg: 'ERROR: OPERATOR ID EXISTS' };
        }
        db.push(userProfile);
        localStorage.setItem(this.KEY, JSON.stringify(db));
        return { success: true, msg: 'PROFILE CREATED. REDIRECTING...' };
    },
    authenticate: function(id, pass) {
        const db = this.getDB();
        const user = db.find(u => u.id === id && u.pass === pass);
        if (user) return { success: true, user: user };
        return { success: false, msg: 'ACCESS DENIED: INVALID CREDENTIALS' };
    }
};

// UI Handlers
const loginView = document.getElementById('login-view');
const regView = document.getElementById('register-view');
const authMsg = document.getElementById('auth-msg');

document.getElementById('go-to-register').addEventListener('click', () => {
    loginView.classList.add('hidden');
    regView.classList.remove('hidden');
    authMsg.innerText = '';
});

document.getElementById('btn-cancel').addEventListener('click', () => {
    regView.classList.add('hidden');
    loginView.classList.remove('hidden');
    authMsg.innerText = '';
});

// GENDER SELECTION LOGIC
window.selectRegGender = function(gender) {
    document.getElementById('reg-sex').value = gender;
    const maleBtn = document.getElementById('reg-male-btn');
    const femaleBtn = document.getElementById('reg-female-btn');
    
    if (gender === 'male') {
        maleBtn.classList.add('active');
        femaleBtn.classList.remove('active');
    } else {
        femaleBtn.classList.add('active');
        maleBtn.classList.remove('active');
    }
};

// REGISTER
document.getElementById('btn-register').addEventListener('click', async () => {
    const name = document.getElementById('reg-name').value;
    const id = document.getElementById('reg-id').value;
    const pass = document.getElementById('reg-pass').value;
    const gender = document.getElementById('reg-sex').value;
    
    if (!id || !pass || !name) {
        authMsg.innerText = "CRITICAL: ALL FIELDS REQUIRED";
        authMsg.className = "msg-box msg-error";
        return;
    }
    
    if (!gender) {
        authMsg.innerText = "CRITICAL: BIOLOGICAL PROFILE REQUIRED";
        authMsg.className = "msg-box msg-error";
        return;
    }

    authMsg.innerText = "PROCESSING BIOMETRIC STREAMS...";
    authMsg.className = "msg-box";

    let userData = {
        name: name, id: id, pass: pass, gender: gender,
        height: document.getElementById('reg-height').value,
        weight: document.getElementById('reg-weight').value,
        fat: document.getElementById('reg-fat').value,
        hr: document.getElementById('reg-hr').value,
        spo2: document.getElementById('reg-spo2').value,
        bp: document.getElementById('reg-bp').value,
        profilePic: null
    };

    setTimeout(async () => {
        const result = Auth.saveUser(userData);
        if (result.success) {
            authMsg.innerText = result.msg;
            authMsg.className = "msg-box msg-success";
            setTimeout(() => document.getElementById('btn-cancel').click(), 1500);
        } else {
            authMsg.innerText = result.msg;
            authMsg.className = "msg-box msg-error";
        }
    }, 1000);
});

// LOGIN
document.getElementById('btn-login').addEventListener('click', () => {
    const id = document.getElementById('login-id').value;
    const pass = document.getElementById('login-pass').value;
    const btn = document.getElementById('btn-login');
    const originalText = btn.innerHTML;
    btn.innerHTML = 'AUTHENTICATING...';
    
    setTimeout(() => {
        const res = Auth.authenticate(id, pass);
        if (res.success) {
            APP_STATE.userProfile = res.user;
            APP_STATE.gender = res.user.gender;
            
            document.getElementById('user-display').innerText = res.user.id.toUpperCase();
            syncGenderToggle(res.user.gender);

            const authLayer = document.getElementById('auth-layer');
            authLayer.style.opacity = '0';
            authLayer.style.transition = 'opacity 0.8s ease';
            
            setTimeout(() => {
                authLayer.style.display = 'none';
                document.getElementById('app-layer').classList.remove('hidden');
                init3D();
            }, 800);
        } else {
            authMsg.innerText = res.msg;
            authMsg.className = "msg-box msg-error";
            btn.innerHTML = originalText;
        }
    }, 1000);
});

// ==========================================
// 3. APP LOGIC
// ==========================================

// THEME TOGGLE
const themeBtn = document.getElementById('theme-toggle');
const htmlEl = document.documentElement;

themeBtn.addEventListener('click', () => {
    const current = htmlEl.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    htmlEl.setAttribute('data-theme', next);
    
    const icon = themeBtn.querySelector('i');
    if (next === 'light') {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
        update3DLighting('light');
    } else {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
        update3DLighting('dark');
    }
});

// NEW PAGE LOGIC
window.openSystemPage = function(systemId, systemName) {
    const mainNav = document.getElementById('main-nav-rail');
    mainNav.classList.add('minimized');

    const subLayer = document.getElementById('sub-menu-layer');
    const title = document.getElementById('sub-menu-title');
    const content = document.getElementById('sub-menu-content');
    
    title.innerText = systemName;
    content.innerHTML = ''; 

    const items = SYSTEM_DATA[systemId];
    if(items) {
        items.forEach((item, index) => {
            const btn = document.createElement('div');
            btn.className = 'sub-card ios-card';
            btn.style.animationDelay = `${index * 0.05}s`;
            btn.innerHTML = `
                <div>
                    <h4>${item.title}</h4>
                    <p>${item.desc}</p>
                </div>
                <i class="fa-solid fa-chevron-right" style="opacity:0.3"></i>
            `;
            btn.onclick = () => loadSubModel(systemId, item.id, btn);
            content.appendChild(btn);
        });
    }
    subLayer.classList.remove('hidden');
    APP_STATE.category = systemId;
    loadModel(systemId);
};

window.closeSystemPage = function() {
    const mainNav = document.getElementById('main-nav-rail');
    const subLayer = document.getElementById('sub-menu-layer');
    subLayer.classList.add('hidden');
    setTimeout(() => { mainNav.classList.remove('minimized'); }, 100);
    APP_STATE.category = 'home';
    loadModel('home');
    updateInfoPanelGeneric('Full Body', 'System Overview');
};

function loadSubModel(cat, sub, btnElement) {
    document.querySelectorAll('.sub-card').forEach(b => b.classList.remove('active'));
    btnElement.classList.add('active');
    updateInfoPanelGeneric(sub, `Focusing on ${sub} structure details.`);
}

function updateInfoPanelGeneric(title, desc) {
    document.getElementById('info-view').innerText = title.toUpperCase();
    document.getElementById('info-desc').innerText = desc || "Scanning...";
}

// 3D ENGINE
const ASSETS = {
    male: { home: './assets/human_male.glb', skeletal: './assets/human_male.glb', nervous: './assets/brain.glb', circulation: './assets/heart.glb', genetic: './assets/dna.glb', digestive: './assets/human_male.glb', immune: './assets/hemoglobin.glb' },
    female: { home: './assets/human_female.glb', skeletal: './assets/human_female.glb', nervous: './assets/brain.glb', circulation: './assets/heart.glb', genetic: './assets/dna.glb', digestive: './assets/human_female.glb', immune: './assets/hemoglobin.glb' }
};

let scene, camera, renderer, controls, currentModel;
const loaderUI = document.getElementById('loader');
let keyLight, rimLight, fillLight, amb;

function init3D() {
    const container = document.getElementById('canvas-container');
    scene = new THREE.Scene();
    scene.background = null; 

    camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 100);
    camera.position.set(0, 1.5, 4.5);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    amb = new THREE.AmbientLight(0xffffff, 0.6); 
    scene.add(amb);
    keyLight = new THREE.SpotLight(0x0a84ff, 25);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);
    rimLight = new THREE.SpotLight(0xffffff, 15);
    rimLight.position.set(-5, 5, -5);
    scene.add(rimLight);
    fillLight = new THREE.DirectionalLight(0xffffff, 1.5);
    fillLight.position.set(0, 2, 5);
    scene.add(fillLight);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    loadModel('home');
    animate();
    window.addEventListener('resize', onWindowResize);
}

const loader = new GLTFLoader();

function loadModel(category) {
    const path = ASSETS[APP_STATE.gender][category];
    if(!path) return;
    loaderUI.style.display = 'block';
    
    if(currentModel) {
        scene.remove(currentModel);
        currentModel.traverse(c => { if(c.isMesh) { c.geometry.dispose(); if(c.material) c.material.dispose(); }});
    }

    loader.load(path, (gltf) => {
        currentModel = gltf.scene;
        const box = new THREE.Box3().setFromObject(currentModel);
        const center = box.getCenter(new THREE.Vector3());
        currentModel.position.x -= center.x;
        currentModel.position.y -= center.y;
        currentModel.position.z -= center.z;
        
        if(category !== 'home') applyGlassMaterial(currentModel, category);
        
        scene.add(currentModel);
        loaderUI.style.display = 'none';
    }, undefined, (e) => { console.error(e); loaderUI.style.display = 'none'; });
}

function applyGlassMaterial(model, cat) {
    let color = 0xffffff;
    if(cat === 'circulation') color = 0xff3b30;
    if(cat === 'genetic') color = 0x0a84ff;
    if(cat === 'nervous') color = 0xff2d55;
    if(cat === 'digestive') color = 0xff9500;
    if(cat === 'immune') color = 0x30b0c7;

    const mat = new THREE.MeshPhysicalMaterial({
        color: color, metalness: 0.2, roughness: 0.1, transmission: 0.3, 
        opacity: 0.8, transparent: true, clearcoat: 1.0
    });
    
    model.traverse((child) => { if(child.isMesh) child.material = mat; });
}

function update3DLighting(theme) {
    if (!scene) return;
    if (theme === 'light') {
        keyLight.color.setHex(0x007aff);
        amb.intensity = 1.0;
    } else {
        keyLight.color.setHex(0x0a84ff);
        amb.intensity = 0.6;
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Gender Toggle Sync
function syncGenderToggle(sex) {
    if(sex === 'male') {
        document.getElementById('btn-male').classList.add('active');
        document.getElementById('btn-female').classList.remove('active');
    } else {
        document.getElementById('btn-female').classList.add('active');
        document.getElementById('btn-male').classList.remove('active');
    }
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

window.openModal = function(id) { document.getElementById(`modal-${id}`).classList.remove('hidden'); };
window.closeModal = function(id) { document.getElementById(`modal-${id}`).classList.add('hidden'); };
window.resetCam = function() { controls.reset(); };
document.getElementById('btn-logout').addEventListener('click', () => location.reload());