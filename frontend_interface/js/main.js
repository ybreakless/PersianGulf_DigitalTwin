
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ProceduralHuman } from './models/ProceduralHuman.js';

let scene, camera, renderer, controls;
let currentModel = null;
let isRotating = false;
let isLightMode = false;

export function initEngine() {
    const container = document.getElementById('canvas-container');
    
    // 1. SCENE
    scene = new THREE.Scene();
    // Default background matches dark CSS
    scene.background = new THREE.Color(0x020205); 

    // 2. CAMERA - FIX (Standard Scale)
    // Positioned at Y=0.9 (Waist/Torso level), Z=2.8 (Good full-body view)
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0.9, 2.8); 

    // 3. RENDERER
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // 4. LIGHTS
    setupLights();

    // 5. CONTROLS
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0.9, 0); // Rotate around center of body
    
    window.addEventListener('resize', onWindowResize);
    animate();
}

function setupLights() {
    // Clear old lights (but keep meshes)
    scene.children.forEach(c => {
        if(c.isLight) scene.remove(c);
    });

    const ambientLight = new THREE.AmbientLight(isLightMode ? 0xffffff : 0x404040, 2);
    scene.add(ambientLight);

    // Dynamic Main Light Color
    const mainLightColor = isLightMode ? 0x0088cc : 0x00f3ff;
    const mainLight = new THREE.DirectionalLight(mainLightColor, 1.5);
    mainLight.position.set(5, 5, 5);
    scene.add(mainLight);

    const fillLight = new THREE.PointLight(0xff0055, 1.0);
    fillLight.position.set(-5, 2, 5);
    scene.add(fillLight);
    
    // Background update
    scene.background = new THREE.Color(isLightMode ? 0xe0e5ec : 0x020205);
}

export function toggleThemeMode(isLight) {
    isLightMode = isLight;
    setupLights(); // Refresh lights and background color
}

export function loadModel(modelName) {
    if (currentModel) scene.remove(currentModel.mesh);

    const gender = modelName.includes('female') ? 'female' : 'male';
    
    // Create new procedural model
    currentModel = new ProceduralHuman(gender);
    currentModel.mesh.position.set(0, 0, 0);
    scene.add(currentModel.mesh);
}

export function setRotation(bool) {
    isRotating = bool;
}

export function setZoom(val) {
    // Slider 10-1000 maps to Distance ~1.5 to ~6.0
    // Inverted logic: High slider value = Close zoom (small distance)
    const norm = val / 1000; 
    const dist = 6.0 - (norm * 4.5); 
    
    const dir = camera.position.clone().sub(controls.target).normalize();
    camera.position.copy(controls.target).add(dir.multiplyScalar(dist));
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    
    if(isRotating && currentModel) {
        currentModel.mesh.rotation.y += 0.005;
    }
    
    if(currentModel) currentModel.animate();
    
    renderer.render(scene, camera);
}
