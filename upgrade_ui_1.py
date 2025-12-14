import os

# ==============================================================================
# 1. HTML (Added Theme Toggle & Simulation Selectors)
# ==============================================================================
html_code = """<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BioTwin: Pro System</title>
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/style.css">
    
    <script type="importmap">
        { "imports": { "three": "https://unpkg.com/three@0.160.0/build/three.module.js", "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/" } }
    </script>
</head>
<body>
    <div id="ui-layer">
        <header onclick="window.resetToHome()">
            <div class="brand">
                <h1>BioTwin <span>PRO</span></h1>
                <div class="subtitle">ADVANCED BIO-SIMULATION</div>
            </div>
            
            <div class="header-right">
                <button id="theme-toggle" onclick="window.toggleTheme()" title="Switch Light/Dark Mode">☀ / ☾</button>
                <div class="system-status"><span class="dot"></span> ONLINE</div>
            </div>
        </header>

        <div id="start-overlay">
            <h2>VIRTUAL PATIENT</h2>
            <p>SELECT A SYSTEM TO BEGIN ANALYSIS</p>
        </div>

        <nav id="system-nav"></nav>

        <aside id="control-panel">
            <h2 id="active-organ-title">TARGET SYSTEM</h2>
            
            <div class="panel-content">
                <div class="monitor-wrapper">
                    <div class="monitor-label">LIVE BIO-SIGNALS</div>
                    <canvas id="ecg-canvas" width="250" height="80"></canvas>
                </div>

                <div class="sim-selector">
                    <label>ANALYSIS PROTOCOL:</label>
                    <select id="sim-mode">
                        <option value="PATHOGEN">Viral Pathogen Scan</option>
                        <option value="STRUCTURAL">Structural Integrity</option>
                        <option value="NEURAL">Neural Activity</option>
                    </select>
                </div>

                <div class="data-row"><span class="label">DIAGNOSIS</span><span class="value" id="disp-status">STANDBY</span></div>
                <hr>
                <div class="data-row"><span class="label">INTEGRITY</span><span class="value" id="val-health">--</span></div>
                <div class="bar-container"><div id="bar-health" class="bar-fill" style="width: 0%"></div></div>
                
                <button id="btn-simulate" onclick="window.triggerSimulation()">INITIATE PROTOCOL</button>
                <button class="secondary" onclick="window.resetToHome()">RESET VIEW</button>
            </div>
        </aside>

        <div id="organ-dock"></div>

        <footer id="log-console">
            SYSTEM LOGS: Engine Ready. Waiting for input.
        </footer>
    </div>
    <canvas id="bio-canvas"></canvas>
    <script type="module" src="js/main.js"></script>
</body>
</html>
"""

# ==============================================================================
# 2. CSS (CSS Variables for Light/Dark Mode)
# ==============================================================================
css_code = """
/* --- THEME VARIABLES --- */
:root {
    --bg-color: #020202;
    --text-color: #ffffff;
    --accent-color: #00d2ff;
    --accent-glow: rgba(0, 210, 255, 0.4);
    --panel-bg: rgba(5, 12, 18, 0.9);
    --border-color: rgba(0, 210, 255, 0.3);
    --bubble-bg: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.1), rgba(0, 0, 0, 0.4));
    --status-ok: #00ff41;
    --status-bad: #ff0000;
}

[data-theme="light"] {
    --bg-color: #e0e5ec;
    --text-color: #1a1a1a;
    --accent-color: #0066cc;
    --accent-glow: rgba(0, 102, 204, 0.3);
    --panel-bg: rgba(255, 255, 255, 0.9);
    --border-color: rgba(0, 0, 0, 0.1);
    --bubble-bg: radial-gradient(circle at 30% 30%, #ffffff, #d1d9e6);
    --status-ok: #009933;
    --status-bad: #cc0000;
}

/* BASE FONTS */
body { 
    margin: 0; overflow: hidden; background: var(--bg-color); 
    font-family: 'Rajdhani', sans-serif; 
    color: var(--text-color); 
    transition: background 0.5s ease;
}
h1, h2, button, .sys-bubble, .organ-pill {
    font-family: 'Orbitron', sans-serif; 
}

#bio-canvas { position: absolute; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 0; }
#ui-layer { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 10; pointer-events: none; }

/* HEADER */
header { 
    display: flex; justify-content: space-between; align-items: center; padding: 15px 40px; 
    background: linear-gradient(to bottom, var(--panel-bg), transparent); 
    pointer-events: auto; cursor: pointer; z-index: 20;
}
h1 { margin: 0; font-weight: 400; font-size: 26px; letter-spacing: 3px; color: var(--text-color); }
h1 span { font-weight: 900; color: var(--accent-color); }
.subtitle { font-family: 'Rajdhani', sans-serif; font-size: 12px; color: #888; letter-spacing: 6px; margin-top: 5px;}

.header-right { display: flex; gap: 20px; align-items: center; }
.system-status { font-size: 12px; font-weight: bold; color: var(--status-ok); display: flex; align-items: center; }
.dot { width: 8px; height: 8px; background: var(--status-ok); border-radius: 50%; margin-right: 5px; box-shadow: 0 0 10px var(--status-ok); }

#theme-toggle {
    background: transparent; border: 1px solid var(--border-color); color: var(--text-color);
    width: auto; padding: 5px 12px; font-size: 14px; margin: 0;
}

/* SYSTEM NAV (Bubbles) */
#system-nav {
    position: absolute; left: 50px; top: 18%; bottom: 10%; width: 90px;
    display: flex; flex-direction: column; gap: 25px; 
    overflow-y: auto; pointer-events: auto; padding: 10px;
    scrollbar-width: none;
    transform: translateX(-150px); transition: transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
}
#system-nav.visible { transform: translateX(0); }

.sys-bubble {
    min-height: 75px; width: 75px; border-radius: 50%; 
    background: var(--bubble-bg);
    backdrop-filter: blur(8px);
    border: 1px solid var(--border-color);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; 
    font-size: 9px; font-weight: 700; color: var(--text-color); 
    text-align: center; letter-spacing: 1px;
    transition: all 0.3s ease;
}
.sys-bubble:hover { transform: scale(1.15); border-color: var(--accent-color); color: var(--accent-color); }
.sys-bubble.active { background: var(--accent-color); color: var(--bg-color); border-color: var(--accent-color); transform: scale(1.1); }

/* CONTROL PANEL */
#control-panel { 
    position: absolute; top: 100px; right: 50px; width: 300px; 
    background: var(--panel-bg); backdrop-filter: blur(15px); 
    border: 1px solid var(--border-color); padding: 25px; border-radius: 12px; 
    pointer-events: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    transform: translateX(450px); transition: transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
}
#control-panel.visible { transform: translateX(0); }

/* PRO CONTROLS */
.sim-selector { margin-bottom: 15px; }
.sim-selector label { display: block; font-size: 10px; color: #888; margin-bottom: 5px; letter-spacing: 1px; }
select { 
    width: 100%; padding: 8px; background: rgba(0,0,0,0.2); border: 1px solid var(--border-color); 
    color: var(--text-color); font-family: 'Rajdhani', sans-serif; font-weight: bold; outline: none;
}
[data-theme="light"] select { background: rgba(255,255,255,0.5); }

/* MONITOR */
.monitor-wrapper { margin-bottom: 20px; border: 1px solid var(--border-color); background: #000; border-radius: 4px; position: relative; }
.monitor-label { position: absolute; top: 2px; left: 5px; font-size: 8px; color: #555; }
#ecg-canvas { width: 100%; height: 80px; display: block; }

/* UTILS */
h2 { color: var(--accent-color); border-bottom: 1px solid var(--border-color); padding-bottom: 10px; margin-top: 0; font-size: 16px; letter-spacing: 2px; }
.data-row { display: flex; justify-content: space-between; margin: 15px 0; font-size: 14px; }
.value { font-family: 'Rajdhani', monospace; font-weight: 700; font-size: 16px; color: var(--text-color); }
.bar-container { width: 100%; height: 8px; background: rgba(0,0,0,0.3); margin-bottom: 20px; border-radius: 4px; overflow: hidden; border: 1px solid var(--border-color); }
.bar-fill { height: 100%; background: var(--accent-color); width: 0%; transition: width 0.6s; }

button { width: 100%; padding: 14px; background: var(--accent-color); border: none; color: var(--bg-color); font-weight: 800; cursor: pointer; border-radius: 4px; margin-bottom: 10px; letter-spacing: 1px; }
button:hover { filter: brightness(1.2); }
button.secondary { background: transparent; border: 1px solid #666; color: #888; }
button.secondary:hover { border-color: var(--text-color); color: var(--text-color); }

/* DOCK */
#organ-dock {
    position: absolute; bottom: 50px; left: 50%; transform: translateX(-50%) translateY(100px);
    display: flex; gap: 10px; padding: 15px 30px;
    background: var(--panel-bg); border: 1px solid var(--border-color);
    border-radius: 50px; backdrop-filter: blur(20px);
    pointer-events: auto; opacity: 0; transition: all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
}
#organ-dock.visible { opacity: 1; transform: translateX(-50%) translateY(0); }
.organ-pill {
    padding: 8px 20px; border-radius: 30px; background: rgba(125,125,125,0.1);
    border: 1px solid transparent; color: var(--text-color); font-size: 11px; cursor: pointer; transition: all 0.2s; white-space: nowrap;
}
.organ-pill:hover { background: rgba(125,125,125,0.3); }
.organ-pill.active { background: var(--accent-color); color: var(--bg-color); font-weight: 900; }

#start-overlay { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; pointer-events: none; transition: opacity 0.5s; }
#start-overlay.hidden { opacity: 0; }
#start-overlay h2 { color: var(--text-color); text-shadow: none; font-size: 40px; }
#start-overlay p { color: var(--accent-color); }
"""

# ==============================================================================
# 3. MAIN JS (Theme Logic + New Simulations + Centering)
# ==============================================================================
main_js = """
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
"""

# ==============================================================================
# 4. DEPLOYMENT
# ==============================================================================
def upgrade_ui_pro():
    base_dir = "frontend_interface"
    files = {
        f"{base_dir}/index.html": html_code,
        f"{base_dir}/css/style.css": css_code,
        f"{base_dir}/js/main.js": main_js
    }
    print("--- UPGRADING TO PRO UI ---")
    for path, content in files.items():
        try:
            with open(path, "w", encoding="utf-8") as f:
                f.write(content.strip())
            print(f"✅ Upgraded: {path}")
        except Exception as e:
            print(f"❌ Error: {e}")
    print("\n--- COMPLETE ---")

if __name__ == "__main__":
    upgrade_ui_pro()