import { APP_STATE, SYSTEM_DATA } from './config_data.js';
import { loadModel, update3DLighting, resetCam } from './three_engine.js';

export function initUI() {
    // Theme
    const themeBtn = document.getElementById('theme-toggle');
    themeBtn.addEventListener('click', () => {
        const html = document.documentElement;
        const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        
        const icon = themeBtn.querySelector('i');
        icon.className = next === 'light' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
        update3DLighting(next);
    });

    // Logout
    document.getElementById('btn-logout').addEventListener('click', () => location.reload());

    // In-App Gender Toggles
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

    // Attach Global Functions for HTML
    window.openSystemPage = openSystemPage;
    window.closeSystemPage = closeSystemPage;
    window.openModal = (id) => document.getElementById(`modal-${id}`).classList.remove('hidden');
    window.closeModal = (id) => document.getElementById(`modal-${id}`).classList.add('hidden');
    window.resetCam = resetCam;
}

function openSystemPage(systemId, systemName) {
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
            btn.innerHTML = `
                <div><h4>${item.title}</h4><p>${item.desc}</p></div>
                <i class="fa-solid fa-chevron-right" style="opacity:0.3"></i>
            `;
            btn.onclick = () => handleSubClick(systemId, item.id, btn);
            content.appendChild(btn);
        });
    }
    subLayer.classList.remove('hidden');
    
    APP_STATE.category = systemId;
    APP_STATE.subCategory = null;
    loadModel(systemId);
}

function closeSystemPage() {
    document.getElementById('sub-menu-layer').classList.add('hidden');
    setTimeout(() => { document.getElementById('main-nav-rail').classList.remove('minimized'); }, 100);
    
    APP_STATE.category = 'home';
    loadModel('home');
    updateInfoPanelGeneric('Full Body', 'System Overview');
}

function handleSubClick(cat, sub, btn) {
    document.querySelectorAll('.sub-card').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    APP_STATE.subCategory = sub;
    loadModel(cat); 
    updateInfoPanelGeneric(sub, `Analyzing ${sub} details...`);
}

export function updateInfoPanelGeneric(title, desc) {
    document.getElementById('info-view').innerText = title.toUpperCase();
    document.getElementById('info-desc').innerText = desc || "Scanning...";
}

export function syncGenderToggle(sex) {
    const m = document.getElementById('btn-male');
    const f = document.getElementById('btn-female');
    if(sex === 'male') { m.classList.add('active'); f.classList.remove('active'); }
    else { f.classList.add('active'); m.classList.remove('active'); }
}