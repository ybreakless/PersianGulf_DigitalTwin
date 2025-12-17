import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// GLOBAL STATE
const APP = { gender: 'male', category: 'home', subCategory: null, model: null, spin: true, spinSpeed: 0.005, darkMode: true };

// DATA CONFIG (FULL IMMUNE LIST RESTORED)
const SYSTEM_DATA = {
    nervous: [{id:'brain', title:'Brain', icon:'fa-brain', color:'pink'}, {id:'nerves', title:'Spinal Cord', icon:'fa-bolt', color:'pink'}],
    circulation: [{id:'heart', title:'Heart', icon:'fa-heart-pulse', color:'red'}, {id:'veins', title:'Vascular', icon:'fa-droplet', color:'red'}],
    skeletal: [{id:'skeleton', title:'Full Skeleton', icon:'fa-bone', color:'white'}, {id:'long_bone', title:'Femur', icon:'fa-crutch', color:'white'}],
    genetic: [{id:'dna', title:'DNA Helix', icon:'fa-dna', color:'blue'}],
    digestive: [{id:'stomach', title:'Stomach', icon:'fa-hotdog', color:'orange'}, {id:'intestines', title:'Intestines', icon:'fa-worm', color:'orange'}],
    immune: [
        {id:'covid', title:'SARS-CoV-2', icon:'fa-virus', color:'cyan'},
        {id:'antibody', title:'Antibody', icon:'fa-shield-virus', color:'cyan'},
        {id:'macrophage', title:'Macrophage', icon:'fa-ghost', color:'cyan'},
        {id:'t_cell', title:'T-Cell', icon:'fa-crosshairs', color:'cyan'},
        {id:'lymphocyte', title:'Lymphocyte', icon:'fa-circle-nodes', color:'cyan'},
        {id:'monocyte', title:'Monocyte', icon:'fa-bacterium', color:'cyan'},
        {id:'eosinophil', title:'Eosinophil', icon:'fa-dots', color:'cyan'},
        {id:'basophil', title:'Basophil', icon:'fa-flask', color:'cyan'}
    ]
};

// DASHBOARD TEMPLATES
const DASH_TEMPLATES = {
    home: `<div class="sim-card"><h4>Status</h4><div class="metric-grid"><div class="metric-box">100%<br><small>INTEGRITY</small></div><div class="metric-box">37°C<br><small>TEMP</small></div></div></div><div class="sim-card"><h4>Actions</h4><div class="toggle-switch active"></div></div>`,
    immune: `<div class="sim-card"><h4>Immune Status</h4><div class="metric-grid"><div class="metric-box" style="color:#ff3b30">ALERT</div><div class="metric-box">5.4M WBC</div></div></div>`
};

// ASSETS
const ASSETS = {
    male: { 
        home: './assets/human_male_full.glb', brain: './assets/brain_male.glb', heart: './assets/beating_heart.glb', dna: './assets/dna.glb', skeleton: './assets/male_human_skeleton.glb', stomach: './assets/human_digestive_stomach.glb', long_bone: './assets/long_bone.glb',
        covid: './assets/covid_19.glb', antibody: './assets/antibody.glb', macrophage: './assets/macrophage.glb', t_cell: './assets/t_cell.glb', lymphocyte: './assets/lymphocyte.glb', monocyte: './assets/monocyte.glb', eosinophil: './assets/eosinophil.glb', basophil: './assets/basophil.glb'
    },
    female: { 
        home: './assets/human_female_full.glb', brain: './assets/brain_female.glb', heart: './assets/beating_heart.glb', dna: './assets/dna.glb', skeleton: './assets/female_human_skeleton.glb', stomach: './assets/human_digestive_stomach.glb', long_bone: './assets/long_bone.glb',
        covid: './assets/covid_19.glb', antibody: './assets/antibody.glb', macrophage: './assets/macrophage.glb', t_cell: './assets/t_cell.glb', lymphocyte: './assets/lymphocyte.glb', monocyte: './assets/monocyte.glb', eosinophil: './assets/eosinophil.glb', basophil: './assets/basophil.glb'
    }
};

// INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    // 1. AUTH LOGIC
    const loginView = document.getElementById('login-view');
    const regView = document.getElementById('register-view');
    const authLayer = document.getElementById('auth-layer');
    const appLayer = document.getElementById('app-layer');

    // Theme Toggle
    const toggleTheme = () => {
        const html = document.documentElement;
        const current = html.getAttribute('data-theme');
        html.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
    };
    document.getElementById('login-theme-toggle').onclick = toggleTheme;
    document.getElementById('app-theme-toggle').onclick = toggleTheme;

    // Login/Register Nav
    document.getElementById('go-to-register').addEventListener('click', (e) => { e.preventDefault(); loginView.classList.add('hidden'); regView.classList.remove('hidden'); });
    document.getElementById('btn-back-login').addEventListener('click', () => { regView.classList.add('hidden'); loginView.classList.remove('hidden'); });
    
    // Login Action
    document.getElementById('btn-login').addEventListener('click', () => {
        authLayer.style.opacity = 0;
        setTimeout(() => { authLayer.classList.add('hidden'); appLayer.classList.remove('hidden'); init3D(); }, 500);
    });

    // 2. MENU SWAP LOGIC (Key Feature)
    window.switchCategory = (cat) => {
        APP.category = cat; APP.subCategory = null;
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        const btn = Array.from(document.querySelectorAll('.nav-item')).find(el => el.getAttribute('onclick')?.includes(cat));
        if(btn) btn.classList.add('active');
        
        // Return to Main
        document.getElementById('sub-menu-layer').classList.remove('active');
        document.getElementById('main-nav-rail').classList.remove('slide-out');
        
        loadModel(cat); updateDash(cat);
    };

    window.openSystemPage = (sysId, sysName) => {
        APP.category = sysId;
        // Slide out Main, Slide in Sub
        document.getElementById('main-nav-rail').classList.add('slide-out');
        
        const subLayer = document.getElementById('sub-menu-layer');
        const content = document.getElementById('sub-menu-content');
        
        // Build Sub Menu Header & Items
        content.innerHTML = `<div class="sub-header"><div class="back-circle" onclick="closeSystemPage()"><i class="fa-solid fa-arrow-left"></i></div><span class="sub-title">${sysName}</span></div>`;
        
        if(SYSTEM_DATA[sysId]) {
            SYSTEM_DATA[sysId].forEach(item => {
                const btn = document.createElement('div');
                btn.className = 'nav-item ios-card'; // Reuse main nav style
                btn.innerHTML = `<div class="icon-bubble ${item.color}"><i class="fa-solid ${item.icon}"></i></div><span class="label">${item.title}</span>`;
                btn.onclick = () => { 
                    APP.subCategory = item.id; 
                    loadModel(sysId);
                    document.querySelectorAll('#sub-menu-content .nav-item').forEach(b => b.style.border='1px solid transparent');
                    btn.style.border = '1px solid var(--accent-blue)';
                };
                content.appendChild(btn);
            });
        }
        subLayer.classList.add('active');
        loadModel(sysId);
    };

    window.closeSystemPage = () => {
        document.getElementById('sub-menu-layer').classList.remove('active');
        document.getElementById('main-nav-rail').classList.remove('slide-out');
        window.switchCategory('home');
    };
});

// 3. 3D ENGINE
let scene, camera, renderer, controls;
function init3D() {
    const container = document.getElementById('canvas-container');
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 100);
    camera.position.set(0, 1.5, 5);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);
    const amb = new THREE.AmbientLight(0xffffff, 1.0); scene.add(amb);
    const spot = new THREE.SpotLight(0xffffff, 15); spot.position.set(5, 10, 5); scene.add(spot);
    controls = new OrbitControls(camera, renderer.domElement);
    loadModel('home'); updateDash('home'); animate();
    window.addEventListener('resize', () => { camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); });
}

function loadModel(cat) {
    let key = APP.subCategory ? APP.subCategory : cat;
    // Map categories to default keys
    if(cat==='nervous' && !APP.subCategory) key='brain';
    if(cat==='circulation' && !APP.subCategory) key='heart';
    if(cat==='skeletal' && !APP.subCategory) key='skeleton';
    if(cat==='genetic' && !APP.subCategory) key='dna';
    if(cat==='digestive' && !APP.subCategory) key='stomach';
    if(cat==='immune' && !APP.subCategory) key='covid';

    const path = ASSETS[APP.gender][key];
    if(!path) return console.warn("Asset missing:", key);

    const loaderUI = document.getElementById('loader');
    loaderUI.style.display='block';

    if(APP.model) {
        scene.remove(APP.model);
        APP.model.traverse(o=>{ if(o.isMesh){ o.geometry.dispose(); if(o.material){ if(Array.isArray(o.material))o.material.forEach(m=>m.dispose()); else o.material.dispose(); } } });
        APP.model = null;
    }

    new GLTFLoader().load(path, (gltf) => {
        APP.model = gltf.scene;
        const box = new THREE.Box3().setFromObject(APP.model);
        const center = box.getCenter(new THREE.Vector3());
        APP.model.position.sub(center);
        scene.add(APP.model);
        loaderUI.style.display='none';
    }, undefined, (err)=>{ console.error(err); loaderUI.style.display='none'; });
}

function updateDash(cat) { document.getElementById('sim-control-panel').innerHTML = DASH_TEMPLATES[cat] || DASH_TEMPLATES.home; }
function animate() { requestAnimationFrame(animate); controls.update(); if(APP.model && APP.spin) APP.model.rotation.y += APP.spinSpeed; renderer.render(scene, camera); }

// UTILS & EVENTS
window.selectRegGender = (sex) => {
    document.getElementById('reg-sex').value = sex;
    const btnM = document.getElementById('reg-male-btn'); const btnF = document.getElementById('reg-female-btn');
    if(sex === 'male') { btnM.classList.add('active'); btnF.classList.remove('active'); }
    else { btnF.classList.add('active'); btnM.classList.remove('active'); }
};
document.getElementById('wireframe-toggle').onclick=(e)=>{e.target.classList.toggle('active'); const w=e.target.classList.contains('active'); if(APP.model) APP.model.traverse(o=>{if(o.isMesh)o.material.wireframe=w;});};
document.getElementById('spin-toggle').onclick=(e)=>{e.target.classList.toggle('active'); APP.spin=e.target.classList.contains('active');};
document.getElementById('expansion-slider').oninput=(e)=>{const s=1+parseFloat(e.target.value); if(APP.model) APP.model.scale.set(s,s,s);};
document.getElementById('btn-male').onclick=()=>{APP.gender='male'; loadModel(APP.category); document.getElementById('btn-male').classList.add('active'); document.getElementById('btn-female').classList.remove('active');};
document.getElementById('btn-female').onclick=()=>{APP.gender='female'; loadModel(APP.category); document.getElementById('btn-female').classList.add('active'); document.getElementById('btn-male').classList.remove('active');};
window.resetCam=()=>controls.reset();
document.getElementById('btn-logout').onclick=()=>location.reload();
document.getElementById('range-zoom').oninput=(e)=>{camera.position.z=parseFloat(e.target.value);};