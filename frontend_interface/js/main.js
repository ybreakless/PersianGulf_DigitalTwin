import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/**
 * ==========================================================================
 * BIOTWIN ULTIMATE SYSTEM CONTROLLER (WOOFWOOF EDITION)
 * ==========================================================================
 */

// 1. GLOBAL STATE & CONFIGURATION
const APP = { 
    gender: 'male', 
    category: 'home', 
    subCategory: null, 
    model: null, 
    spin: true,
    spinSpeed: 0.005,
    darkMode: true
};

// 2. DASHBOARD TEMPLATES (Injectable HTML)
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
            <h4>Quick Actions</h4>
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
            <h4>Simulation Controls</h4>
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
            <h4>Pumping Stress Test</h4>
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
        </div>`,
        
    immune: `
        <div class="sim-card">
            <h4>Pathogen Detection</h4>
            <div class="metric-grid">
                <div class="metric-box"><span class="metric-val" style="color:#ff3b30">High</span><span class="metric-label">THREAT</span></div>
                <div class="metric-box"><span class="metric-val">5.4M</span><span class="metric-label">WBC COUNT</span></div>
            </div>
        </div>`
};

// 3. SYSTEM CATEGORY DATA
const SYSTEM_DATA = {
    nervous: [
        {id:'brain', title:'Brain', desc:'Cerebrum & Cerebellum Analysis'},
        {id:'nerves', title:'Spinal Cord', desc:'Central Nervous System Pathway'}
    ],
    circulation: [
        {id:'heart', title:'Heart', desc:'Cardiac Pump & Valves'},
        {id:'veins', title:'Vascular', desc:'Arteries and Veins Network'}
    ],
    skeletal: [
        {id:'skeleton', title:'Full Skeleton', desc:'Axial & Appendicular Structure'}, 
        {id:'long_bone', title:'Femur', desc:'Long Bone Marrow Analysis'}
    ],
    genetic: [
        {id:'dna', title:'DNA Helix', desc:'Genetic Code Visualization'}
    ],
    immune: [
        {id:'covid', title:'SARS-CoV-2', desc:'Pathogen Model Interface'},
        {id:'antibody', title:'Antibody', desc:'Immune Response Unit'}
    ],
    digestive: [
        {id:'stomach', title:'Stomach', desc:'Gastric Anatomy & Acid Levels'},
        {id:'intestines', title:'Intestines', desc:'Small & Large Tract'}
    ]
};

// 4. ASSET MAPPING
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

/**
 * ==========================================================================
 * INITIALIZATION & EVENT LISTENERS
 * ==========================================================================
 */
document.addEventListener('DOMContentLoaded', () => {
    
    // --- ELEMENT REFERENCES ---
    const loginView = document.getElementById('login-view');
    const regView = document.getElementById('register-view');
    const authLayer = document.getElementById('auth-layer');
    const appLayer = document.getElementById('app-layer');
    const btnLogin = document.getElementById('btn-login');
    const btnRegister = document.getElementById('btn-register');
    const btnGoToReg = document.getElementById('go-to-register');
    const btnBackLogin = document.getElementById('btn-back-login');
    const toggleLoginTheme = document.getElementById('login-theme-toggle');
    const toggleAppTheme = document.getElementById('app-theme-toggle');

    // --- 1. THEME TOGGLE LOGIC ---
    function toggleTheme() {
        const html = document.documentElement;
        const current = html.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        APP.darkMode = (next === 'dark');
        console.log("Theme switched to:", next);
    }
    
    if(toggleLoginTheme) toggleLoginTheme.addEventListener('click', toggleTheme);
    if(toggleAppTheme) toggleAppTheme.addEventListener('click', toggleTheme);

    // --- 2. AUTH NAVIGATION ---
    if(btnGoToReg) {
        btnGoToReg.addEventListener('click', (e) => {
            e.preventDefault();
            loginView.classList.add('hidden');
            regView.classList.remove('hidden');
        });
    }

    if(btnBackLogin) {
        btnBackLogin.addEventListener('click', () => {
            regView.classList.add('hidden');
            loginView.classList.remove('hidden');
        });
    }

    if(document.getElementById('btn-cancel')) {
        document.getElementById('btn-cancel').addEventListener('click', () => {
            regView.classList.add('hidden');
            loginView.classList.remove('hidden');
        });
    }

    // --- 3. LOGIN EXECUTION ---
    if(btnLogin) {
        btnLogin.addEventListener('click', () => {
            console.log("Login Initialized...");
            
            // Simple validation simulation
            const idVal = document.getElementById('login-id').value;
            if(idVal.length === 0) {
                // Shake effect or error could go here
                console.warn("Empty ID");
            }

            // Visual Transition
            authLayer.style.opacity = '0';
            authLayer.style.pointerEvents = 'none'; // Prevent clicks during fade
            
            setTimeout(() => {
                authLayer.classList.add('hidden');
                appLayer.classList.remove('hidden');
                
                // Initialize 3D Engine ONLY when visible to save memory
                init3D();
            }, 600); // Wait for transition
        });
    }

    // --- 4. GENDER SELECTION (REGISTRATION) ---
    // We attach this to window so onclick in HTML can find it, or use listeners here
    window.selectRegGender = function(sex) {
        document.getElementById('reg-sex').value = sex;
        const btnM = document.getElementById('reg-male-btn');
        const btnF = document.getElementById('reg-female-btn');
        
        if(sex === 'male') {
            btnM.classList.add('active');
            btnF.classList.remove('active');
        } else {
            btnF.classList.add('active');
            btnM.classList.remove('active');
        }
    };
    
    // Bind clicks
    const regMale = document.getElementById('reg-male-btn');
    const regFemale = document.getElementById('reg-female-btn');
    if(regMale) regMale.onclick = () => window.selectRegGender('male');
    if(regFemale) regFemale.onclick = () => window.selectRegGender('female');

    // --- 5. APP NAVIGATION ---
    window.switchCategory = (cat) => {
        APP.category = cat; 
        APP.subCategory = null;
        
        // Update Sidebar UI
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        // Find the button that was clicked
        const clickedBtn = document.querySelector(`button[onclick="switchCategory('${cat}')"]`);
        if(clickedBtn) clickedBtn.classList.add('active');

        // Close Submenu
        document.getElementById('sub-menu-layer').classList.add('hidden');
        document.getElementById('main-nav-rail').classList.remove('hidden');
        
        loadModel(cat); 
        updateDash(cat);
    };

    window.openSystemPage = (sysId, sysName) => {
        APP.category = sysId;
        
        // Hide Main Rail, Show Sub Menu
        document.getElementById('main-nav-rail').classList.add('hidden');
        const subLayer = document.getElementById('sub-menu-layer');
        subLayer.classList.remove('hidden');
        document.getElementById('sub-menu-title').innerText = sysName;
        
        // Populate Sub-menu
        const content = document.getElementById('sub-menu-content');
        content.innerHTML = '';
        
        if(SYSTEM_DATA[sysId]) {
            SYSTEM_DATA[sysId].forEach((item, i) => {
                const el = document.createElement('div');
                el.className = 'sim-card'; 
                el.style.cursor = 'pointer'; 
                el.style.animationDelay = (i * 0.1) + 's';
                el.innerHTML = `<strong>${item.title}</strong><br><small style="color:var(--text-dim)">${item.desc}</small>`;
                
                el.onclick = () => { 
                    APP.subCategory = item.id; 
                    loadModel(sysId); 
                    // Highlight logic
                    Array.from(content.children).forEach(c => c.style.border = '1px solid rgba(255,255,255,0.05)');
                    el.style.border = '1px solid var(--accent-blue)';
                };
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

}); // End DOMContentLoaded

// HELPER: Dashboard Updater
function updateDash(cat) { 
    const panel = document.getElementById('sim-control-panel');
    if(panel) panel.innerHTML = DASH_TEMPLATES[cat] || DASH_TEMPLATES.home; 
}

/**
 * ==========================================================================
 * THREE.JS ENGINE LOGIC
 * ==========================================================================
 */
let scene, camera, renderer, controls;

function init3D() {
    const container = document.getElementById('canvas-container');
    if(!container) return;

    // SCENE
    scene = new THREE.Scene();
    
    // CAMERA
    camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 100);
    camera.position.set(0, 1.5, 5);
    
    // RENDERER
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // LIGHTING
    const amb = new THREE.AmbientLight(0xffffff, 1.0); scene.add(amb);
    const spot = new THREE.SpotLight(0xffffff, 10); spot.position.set(5, 10, 5); scene.add(spot);
    const fill = new THREE.DirectionalLight(0xffffff, 2); fill.position.set(-5, 2, -5); scene.add(fill);
    
    // CONTROLS
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // INIT LOAD
    loadModel('home');
    updateDash('home');
    animate();

    // RESIZE HANDLER
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function loadModel(cat) {
    // Determine key (Subcategory takes precedence, else map category)
    let key = APP.subCategory ? APP.subCategory : cat;
    
    // Robust Fallback Mapping
    if(cat==='nervous' && !APP.subCategory) key='brain';
    if(cat==='circulation' && !APP.subCategory) key='heart';
    if(cat==='genetic' && !APP.subCategory) key='dna';
    if(cat==='skeletal' && !APP.subCategory) key='skeleton';
    if(cat==='immune' && !APP.subCategory) key='covid';
    if(cat==='digestive' && !APP.subCategory) key='stomach';

    const path = ASSETS[APP.gender][key];
    
    if(!path) {
        console.warn("Asset path missing for:", key);
        return;
    }

    const loaderUI = document.getElementById('loader');
    if(loaderUI) loaderUI.style.display = 'block';

    // REMOVE OLD MODEL
    if(APP.model) {
        scene.remove(APP.model);
        // Deep Clean to free memory
        APP.model.traverse(o => {
            if(o.isMesh) {
                o.geometry.dispose();
                if(o.material) {
                    if(Array.isArray(o.material)) o.material.forEach(m=>m.dispose());
                    else o.material.dispose();
                }
            }
        });
        APP.model = null;
    }

    // LOAD NEW MODEL
    new GLTFLoader().load(path, (gltf) => {
        APP.model = gltf.scene;
        
        // Center the geometry
        const box = new THREE.Box3().setFromObject(APP.model);
        const center = box.getCenter(new THREE.Vector3());
        APP.model.position.sub(center);

        // Keep original materials (No Glass Override)
        // If you want glass on specific organs, uncomment below:
        /*
        if(cat !== 'home') {
             const mat = new THREE.MeshPhysicalMaterial({
                color: 0xffffff, metalness: 0.2, roughness: 0.2, transmission: 0.5, transparent: true
            });
            APP.model.traverse(o => { if(o.isMesh) o.material = mat; });
        }
        */
        
        scene.add(APP.model);
        if(loaderUI) loaderUI.style.display = 'none';
        
        // Reset Sliders
        const expSlider = document.getElementById('expansion-slider');
        if(expSlider) expSlider.value = 0;
        
    }, undefined, (err) => { 
        console.error("3D Load Error:", err); 
        if(loaderUI) loaderUI.style.display = 'none'; 
    });
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    
    // Auto-Spin Logic
    if(APP.model && APP.spin) {
        APP.model.rotation.y += APP.spinSpeed;
    }
    
    renderer.render(scene, camera);
}

// ==========================================================================
// 5. MANIPULATOR & SETTINGS LOGIC
// ==========================================================================

// MANIPULATOR
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

// SETTINGS MODAL
document.getElementById('set-speed').oninput = (e) => {
    APP.spinSpeed = parseFloat(e.target.value) * 0.002;
};

document.getElementById('set-quality').onclick = (e) => {
    e.target.classList.toggle('active');
    const high = e.target.classList.contains('active');
    renderer.setPixelRatio(high ? window.devicePixelRatio : 1);
};

// GENDER TOGGLES (APP DOCK)
document.getElementById('btn-male').onclick = () => { 
    APP.gender='male'; 
    loadModel(APP.category); 
    document.getElementById('btn-male').classList.add('active'); 
    document.getElementById('btn-female').classList.remove('active'); 
};

document.getElementById('btn-female').onclick = () => { 
    APP.gender='female'; 
    loadModel(APP.category); 
    document.getElementById('btn-female').classList.add('active'); 
    document.getElementById('btn-male').classList.remove('active'); 
};

// GLOBAL UTILS
window.resetCam = () => controls.reset();
document.getElementById('btn-logout').onclick = () => location.reload();

document.getElementById('range-zoom').oninput = (e) => { 
    camera.position.z = parseFloat(e.target.value); 
};

document.getElementById('global-opacity').addEventListener('input', (e) => {
    if(APP.model) {
        APP.model.traverse((child) => { 
            if(child.isMesh) { 
                child.material.transparent = true; 
                child.material.opacity = e.target.value; 
            } 
        });
    }
});