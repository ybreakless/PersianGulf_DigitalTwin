import { initAuth } from './auth_manager.js';
import { initUI } from './ui_manager.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("Y-314 OS Initializing...");
    
    // Initialize Managers
    initAuth();
    initUI();
    
    console.log("System Ready.");
});