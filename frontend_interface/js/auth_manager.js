import { APP_STATE } from './config_data.js';
import { init3D } from './three_engine.js';
import { syncGenderToggle } from './ui_manager.js';

const Auth = {
    KEY: 'y314_database',
    getDB: function() { 
        try { return JSON.parse(localStorage.getItem(this.KEY)) || []; } 
        catch(e) { return []; } 
    },
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

export function initAuth() {
    const loginView = document.getElementById('login-view');
    const regView = document.getElementById('register-view');
    const authLayer = document.getElementById('auth-layer');
    const appLayer = document.getElementById('app-layer');
    const authMsg = document.getElementById('auth-msg');

    // Navigation
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

    // Login Action
    document.getElementById('btn-login').addEventListener('click', () => {
        const id = document.getElementById('login-id').value;
        const pass = document.getElementById('login-pass').value;
        const btn = document.getElementById('btn-login');
        const originalText = btn.innerHTML;
        
        btn.innerText = 'AUTHENTICATING...';
        
        setTimeout(() => {
            const res = Auth.authenticate(id, pass);
            if (res.success) {
                APP_STATE.userProfile = res.user;
                APP_STATE.gender = res.user.gender;
                
                document.getElementById('user-display').innerText = res.user.id.toUpperCase();
                syncGenderToggle(res.user.gender);
                
                authLayer.style.opacity = '0';
                setTimeout(() => {
                    authLayer.style.display = 'none';
                    appLayer.classList.remove('hidden');
                    init3D();
                }, 800);
            } else {
                authMsg.innerText = res.msg; 
                authMsg.className = "msg-box msg-error"; 
                btn.innerHTML = originalText;
            }
        }, 1000);
    });

    // Register Action
    document.getElementById('btn-register').addEventListener('click', () => {
        const id = document.getElementById('reg-id').value;
        const pass = document.getElementById('reg-pass').value;
        const name = document.getElementById('reg-name').value;
        const gender = document.getElementById('reg-sex').value;
        
        if (!id || !pass || !name) { 
            authMsg.innerText = "ALL FIELDS REQUIRED"; 
            authMsg.className = "msg-box msg-error"; 
            return; 
        }
        if (!gender) { 
            authMsg.innerText = "SELECT BIOLOGICAL PROFILE"; 
            authMsg.className = "msg-box msg-error"; 
            return; 
        }

        authMsg.innerText = "PROCESSING...";
        setTimeout(() => {
            const result = Auth.saveUser({ id, pass, name, gender });
            if (result.success) {
                authMsg.className = "msg-box msg-success"; 
                authMsg.innerText = result.msg;
                setTimeout(() => document.getElementById('btn-cancel').click(), 1000);
            } else { 
                authMsg.className = "msg-box msg-error"; 
                authMsg.innerText = result.msg; 
            }
        }, 800);
    });

    // Expose these to window for HTML onclick events
    window.selectRegGender = function(gender) {
        document.getElementById('reg-sex').value = gender;
        const m = document.getElementById('reg-male-btn');
        const f = document.getElementById('reg-female-btn');
        if (gender === 'male') { m.classList.add('active'); f.classList.remove('active'); }
        else { f.classList.add('active'); m.classList.remove('active'); }
    };
    
    window.togglePass = function(id, btn) {
        const x = document.getElementById(id); 
        const i = btn.querySelector('i');
        if (x.type === "password") { x.type = "text"; i.classList.replace('fa-eye', 'fa-eye-slash'); }
        else { x.type = "password"; i.classList.replace('fa-eye-slash', 'fa-eye'); }
    };
}