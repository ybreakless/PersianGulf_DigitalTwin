import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { APP_STATE, ASSETS } from './config_data.js';
import { updateInfoPanelGeneric } from './ui_manager.js';

let scene, camera, renderer, controls, currentModel;
let keyLight, amb;
const loader = new GLTFLoader();

export function init3D() {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    scene = new THREE.Scene();
    scene.background = null; // Transparent

    camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 100);
    camera.position.set(0, 1.5, 4.5);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    // Lights
    amb = new THREE.AmbientLight(0xffffff, 0.6); 
    scene.add(amb);
    
    keyLight = new THREE.SpotLight(0x0a84ff, 25); 
    keyLight.position.set(5, 8, 5); 
    keyLight.castShadow = true;
    scene.add(keyLight);
    
    const rimLight = new THREE.SpotLight(0xffffff, 15);
    rimLight.position.set(-5, 5, -5);
    scene.add(rimLight);
    
    const fillLight = new THREE.DirectionalLight(0xffffff, 1.5);
    fillLight.position.set(0, 2, 5);
    scene.add(fillLight);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Start
    loadModel('home');
    animate();
    window.addEventListener('resize', onWindowResize);
}

export function loadModel(category) {
    let key = category;
    
    if (APP_STATE.subCategory) {
        key = APP_STATE.subCategory;
    } else if (category === 'nervous') key = 'brain';
    else if (category === 'skeletal') key = 'skeleton';
    else if (category === 'circulation') key = 'heart';
    else if (category === 'digestive') key = 'stomach';
    else if (category === 'genetic') key = 'dna';
    else if (category === 'immune') key = 'covid'; 

    const gender = APP_STATE.gender || 'male';
    const path = ASSETS[gender][key];
    const loaderUI = document.getElementById('loader');

    if(!path) { 
        console.warn(`[BioTwin] Missing asset for key: ${key}`);
        return; 
    }

    if(loaderUI) loaderUI.style.display = 'block';
    
    if(currentModel) {
        scene.remove(currentModel);
        currentModel.traverse(c => { 
            if(c.isMesh) { c.geometry.dispose(); if(c.material) c.material.dispose(); }
        });
    }

    loader.load(path, (gltf) => {
        currentModel = gltf.scene;
        
        // Auto-Center
        const box = new THREE.Box3().setFromObject(currentModel);
        const center = box.getCenter(new THREE.Vector3());
        currentModel.position.x -= center.x;
        currentModel.position.y -= center.y;
        currentModel.position.z -= center.z;
        
        // Apply Glassy Material (except home)
        if(category !== 'home') {
            const mat = new THREE.MeshPhysicalMaterial({ 
                color: 0xffffff, metalness: 0.2, roughness: 0.1, 
                transmission: 0.3, opacity: 0.9, transparent: true, clearcoat: 1.0 
            });
            currentModel.traverse(c => { if(c.isMesh) c.material = mat; });
        }
        
        scene.add(currentModel);
        if(loaderUI) loaderUI.style.display = 'none';
        
    }, undefined, (e) => { 
        console.error("Error loading:", path, e); 
        if(loaderUI) loaderUI.style.display = 'none'; 
    });
}

export function update3DLighting(theme) {
    if(!keyLight) return;
    if(theme === 'light') { keyLight.color.setHex(0x007aff); amb.intensity = 1.0; }
    else { keyLight.color.setHex(0x0a84ff); amb.intensity = 0.6; }
}

export function resetCam() {
    if(controls) controls.reset();
}

function onWindowResize() {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    if(controls) controls.update();
    if(renderer && scene && camera) renderer.render(scene, camera);
}