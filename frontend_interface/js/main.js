import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { AssetLoader } from './3d_engine/asset_loader.js';

// --- DATA ---
const SYSTEMS = {
    "NERVOUS": ["Brain", "Neurons", "Spine", "Synapse"],
    "CIRCULATORY": ["Heart", "Arteries", "Veins", "Red Blood Cells", "White Blood Cells", "T-Cells"],
    "RESPIRATORY": ["Lungs", "Alveoli"],
    "DIGESTIVE": ["Stomach", "Liver", "Intestine", "Pancreas"],
    "FILTRATION": ["Kidneys", "Bladder"],
    "SKELETAL": ["Bone Marrow"],
    "GENETICS": ["DNA Helix", "RNA Strand", "Protein", "Enzyme"],
    "IMMUNE": ["Antibodies", "Virus", "T-Cells", "White Blood Cells"]
};

// --- SCENE SETUP ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020202); // Start Dark

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 4);

const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#bio-canvas'), antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// --- LIGHTING ---
const ambient = new THREE.AmbientLight(0x444444);
scene.add(ambient);
const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(2, 5, 2);
scene.add(dirLight);
const rimLight = new THREE.SpotLight(0x00d2ff, 10);
rimLight.position.set(-2, 2, -2);
scene.add(rimLight);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false; 

const loader = new AssetLoader(scene);
loader.load("Human Body", "BODY");

// --- THEME LOGIC ---
window.toggleTheme = function() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);

    if (next === 'light') {
        scene.background = new THREE.Color(0xe0e5ec);
        rimLight.color.setHex(0x0066cc);
        scene.fog = new THREE.FogExp2(0xe0e5ec, 0.02);
    } else {
        scene.background = new THREE.Color(0x020202);
        rimLight.color.setHex(0x00d2ff);
        scene.fog = null;
    }
};

// --- SIMULATION LOGIC ---
window.triggerSimulation = function() {
    const mode = document.getElementById('sim-mode').value;
    const btn = document.getElementById('btn-simulate');
    btn.innerHTML = "RUNNING PROTOCOL...";
    
    // Simulate Processing Time
    setTimeout(() => {
        let health, status, color;
        
        if (mode === 'PATHOGEN') {
            health = Math.floor(Math.random() * 40 + 40); // Usually low
            status = health > 70 ? "CLEAR" : "VIRAL LOAD DETECTED";
            color = health > 70 ? "#009933" : "#cc0000";
            // Visual feedback: Flash Red if sick
            if (health <= 70 && loader.currentMesh) {
                loader.currentMesh.traverse((child) => {
                   if(child.isMesh) child.material.emissive.setHex(0xff0000);
                });
            }
        } 
        else if (mode === 'STRUCTURAL') {
            health = Math.floor(Math.random() * 20 + 80); // Usually high
            status = "INTEGRITY STABLE";
            color = "#009933";
            // Visual: Pulse fast
            loader.isPulse = true;
        }
        else { // NEURAL
            health = 95;
            status = "SYNAPTIC FIRING OPTIMAL";
            color = "#009933";
            // Visual: Spin fast
            loader.isSpin = true;
        }

        document.getElementById('val-health').innerText = health + "%";
        document.getElementById('bar-health').style.width = health + "%";
        document.getElementById('bar-health').style.background = color;
        const statusDiv = document.getElementById('disp-status');
        statusDiv.innerText = status;
        statusDiv.style.color = color;
        
        btn.innerHTML = "INITIATE PROTOCOL";
    }, 1500);
};

// --- UI GENERATION ---
setTimeout(() => { document.getElementById('system-nav').classList.add('visible'); }, 500);
const navContainer = document.getElementById('system-nav');

Object.keys(SYSTEMS).forEach(sys => {
    const bubble = document.createElement('div');
    bubble.className = 'sys-bubble';
    bubble.innerText = sys;
    bubble.onclick = () => enterSystemMode(sys, bubble);
    navContainer.appendChild(bubble);
});

function enterSystemMode(sysName, bubble) {
    document.getElementById('start-overlay').classList.add('hidden');
    document.getElementById('control-panel').classList.add('visible');
    document.querySelectorAll('.sys-bubble').forEach(b => b.classList.remove('active'));
    bubble.classList.add('active');

    const dock = document.getElementById('organ-dock');
    dock.innerHTML = '';
    dock.classList.add('visible');
    
    SYSTEMS[sysName].forEach(organ => {
        const pill = document.createElement('div');
        pill.className = 'organ-pill';
        pill.innerText = organ;
        pill.onclick = () => {
            document.querySelectorAll('.organ-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            loader.load(organ, sysName);
            document.getElementById('active-organ-title').innerText = organ;
            resetData();
        };
        dock.appendChild(pill);
    });
    if(dock.firstChild) dock.firstChild.click();
}

function resetData() {
    document.getElementById('val-health').innerText = "--";
    document.getElementById('bar-health').style.width = "0%";
    document.getElementById('disp-status').innerText = "STANDBY";
    const theme = document.documentElement.getAttribute('data-theme');
    document.getElementById('disp-status').style.color = theme === 'dark' ? '#fff' : '#000';
}

window.resetToHome = function() {
    loader.load("Human Body", "BODY");
    document.getElementById('start-overlay').classList.remove('hidden');
    document.getElementById('control-panel').classList.remove('visible');
    document.getElementById('organ-dock').classList.remove('visible');
    document.querySelectorAll('.sys-bubble').forEach(b => b.classList.remove('active'));
};

// --- GRAPH LOOP ---
const ecgCanvas = document.getElementById('ecg-canvas');
const ctx = ecgCanvas.getContext('2d');
let graphData = new Array(100).fill(40);

function drawGraph() {
    ctx.fillStyle = 'rgba(0,0,0,0.1)'; 
    ctx.fillRect(0,0,250,80);
    
    // Simple Heartbeat Math
    const t = Date.now() / 300;
    const beat = (Math.sin(t)*Math.sin(t*3)*Math.sin(t*5)); 
    let val = 40 + (beat * 30);
    
    graphData.push(val);
    graphData.shift();
    
    ctx.beginPath();
    ctx.strokeStyle = '#00ff41';
    ctx.lineWidth = 2;
    for(let i=0; i<100; i++) ctx.lineTo(i*2.5, graphData[i]);
    ctx.stroke();
}

// --- ANIMATION LOOP ---
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    loader.animate(clock.getElapsedTime());
    
    // FORCE CENTER
    controls.target.set(0, 0, 0); 
    
    drawGraph();
    controls.update();
    renderer.render(scene, camera);
}
animate();