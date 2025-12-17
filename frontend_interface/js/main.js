import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import GUI from 'lil-gui'; 

// ==========================================
// 1. DATA CONFIGURATION
// ==========================================
const APP_STATE = { gender: 'male', category: 'home', subCategory: null, userProfile: null };

const SYSTEM_DATA = {
    nervous: [ { id: 'brain', title: 'Brain Model', desc: 'Cerebrum & Cerebellum' } ],
    circulation: [ { id: 'heart', title: 'Beating Heart', desc: 'Real-time Cardiac Rhythm' } ],
    skeletal: [ { id: 'skeleton', title: 'Full Skeleton', desc: 'Axial & Appendicular' }, { id: 'long_bone', title: 'Long Bone', desc: 'Femur/Humerus Analysis' } ],
    digestive: [ { id: 'stomach', title: 'Stomach', desc: 'Gastric Anatomy' }, { id: 'intestines', title: 'Intestines', desc: 'Small & Large Tract' } ],
    genetic: [ { id: 'dna', title: 'DNA Helix', desc: 'Double Helix Structure' } ],
    immune: [
        { id: 'covid', title: 'SARS-CoV-2', desc: 'Pathogen Visualization' },
        { id: 'antibody', title: 'Antibody', desc: 'Y-Shaped Protein' },
        { id: 'macrophage', title: 'Macrophage', desc: 'Phagocytosis Unit' },
        { id: 't_cell', title: 'T-Cell', desc: 'Lymphocyte Killer' },
        { id: 'lymphocyte', title: 'Lymphocyte', desc: 'White Blood Cell' },
        { id: 'monocyte', title: 'Monocyte', desc: 'Immune Response' },
        { id: 'eosinophil', title: 'Eosinophil', desc: 'Disease Fighting WBC' },
        { id: 'basophil', title: 'Basophil', desc: 'Inflammatory Response' }
    ]
};

// ==========================================
// 2. ASSET MAPPING (Directly in ./assets/)
// ==========================================
const ASSETS = {
    male: {
        home: './assets/human_male_full.glb',
        brain: './assets/brain_male.glb',
        skeleton: './assets/male_human_skeleton.glb',
        heart: './assets/beating_heart.glb',
        long_bone: './assets/long_bone.glb',
        stomach: './assets/human_digestive_stomach.glb',
        intestines: './assets/small_and_large_intestine.glb',
        dna: './assets/dna.glb',
        covid: './assets/covid_19.glb',
        antibody: './assets/antibody.glb',
        macrophage: './assets/macrophage.glb',
        t_cell: './assets/t_cell.glb',
        lymphocyte: './assets/lymphocyte.glb',
        monocyte: './assets/monocyte.glb',
        eosinophil: './assets/eosinophil.glb',
        basophil: './assets/basophil.glb'
    },
    female: {
        home: './assets/human_female_full.glb',
        brain: './assets/brain_female.glb',
        skeleton: './assets/female_human_skeleton.glb',
        heart: './assets/beating_heart.glb',
        long_bone: './assets/long_bone.glb',
        stomach: './assets/human_digestive_stomach.glb',
        intestines: './assets/small_and_large_intestine.glb',
        dna: './assets/dna.glb',
        covid: './assets/covid_19.glb',
        antibody: './assets/antibody.glb',
        macrophage: './assets/macrophage.glb',
        t_cell: './assets/t_cell.glb',
        lymphocyte: './assets/lymphocyte.glb',
        monocyte: './assets/monocyte.glb',
        eosinophil: './assets/eosinophil.glb',
        basophil: './assets/basophil.glb'
    }
};

// ==========================================
// 3. AUTH & LOGIC
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
// 4. APP NAVIGATION & 3D
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

window.openSystemPage = function(systemId, systemName) {
    document.getElementById('main-nav-rail').classList.add('minimized');
    const subLayer = document.getElementById('sub-menu-layer');
    document.getElementById('sub-menu-title').innerText = systemName;
    const content = document.getElementById('sub-menu-content');
    content.innerHTML = ''; 

    const items = SYSTEM_DATA[systemId];
    if(items) {
        items.forEach((item, index) => {
            const btn = document.createElement('div');
            btn.className = 'sub-card ios-card';
            btn.style.animationDelay = `${index * 0.05}s`;
            btn.innerHTML = `<div><h4>${item.title}</h4><p>${item.desc}</p></div><i class="fa-solid fa-chevron-right" style="opacity:0.3"></i>`;
            btn.onclick = () => loadSubModel(systemId, item.id, btn);
            content.appendChild(btn);
        });
    }
    subLayer.classList.remove('hidden');
    APP_STATE.category = systemId;
    APP_STATE.subCategory = null;
    loadModel(systemId);
};

window.closeSystemPage = function() {
    document.getElementById('sub-menu-layer').classList.add('hidden');
    setTimeout(() => { document.getElementById('main-nav-rail').classList.remove('minimized'); }, 100);
    APP_STATE.category = 'home';
    loadModel('home');
    document.getElementById('info-view').innerText = "FULL BODY";
};

function loadSubModel(cat, sub, btn) {
    document.querySelectorAll('.sub-card').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    APP_STATE.subCategory = sub;
    loadModel(cat);
    document.getElementById('info-view').innerText = sub.toUpperCase();
}

let scene, camera, renderer, controls, currentModel;
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
    
    loadModel('home');
    animate();
    window.addEventListener('resize', () => { camera.aspect = window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); });
}

function loadModel(category) {
    let key = category;
    if (APP_STATE.subCategory) key = APP_STATE.subCategory;
    else if (category === 'nervous') key = 'brain';
    else if (category === 'skeletal') key = 'skeleton';
    else if (category === 'circulation') key = 'heart';
    else if (category === 'digestive') key = 'stomach';
    else if (category === 'genetic') key = 'dna';
    else if (category === 'immune') key = 'covid'; 

    // NOTICE: Using ./assets/ directly
    const path = ASSETS[APP_STATE.gender][key];
    if(!path) { console.warn("Missing asset config for:", key); return; }

    loaderUI.style.display = 'block';
    if(currentModel) scene.remove(currentModel);

    new GLTFLoader().load(path, (gltf) => {
        currentModel = gltf.scene;
        const box = new THREE.Box3().setFromObject(currentModel);
        const center = box.getCenter(new THREE.Vector3());
        currentModel.position.x -= center.x;
        currentModel.position.y -= center.y;
        currentModel.position.z -= center.z;
        
        if(category !== 'home') {
            const mat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0.2, roughness: 0.1, transmission: 0.3, opacity: 0.9, transparent: true });
            currentModel.traverse(c => { if(c.isMesh) c.material = mat; });
        }
        scene.add(currentModel);
        loaderUI.style.display = 'none';
    }, undefined, (error) => { 
        console.error("ERROR LOADING MODEL:", path);
        console.error(error); 
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
document.getElementById('btn-male').onclick = () => { APP_STATE.gender = 'male'; syncGenderToggle('male'); loadModel(APP_STATE.category); };
document.getElementById('btn-female').onclick = () => { APP_STATE.gender = 'female'; syncGenderToggle('female'); loadModel(APP_STATE.category); };

window.openModal = (id) => document.getElementById(`modal-${id}`).classList.remove('hidden');
window.closeModal = (id) => document.getElementById(`modal-${id}`).classList.add('hidden');
window.resetCam = () => controls.reset();
document.getElementById('btn-logout').onclick = () => location.reload();