
import * as THREE from 'three';

export class ProceduralHuman {
    constructor(gender = 'male') {
        this.gender = gender;
        this.mesh = new THREE.Group();
        this.generate();
    }

    generate() {
        // --- MATERIALS ---
        const skinMaterial = new THREE.MeshPhysicalMaterial({
            color: this.gender === 'male' ? 0x00f3ff : 0xff00aa, 
            metalness: 0.8,
            roughness: 0.2,
            transmission: 0.4,
            opacity: 0.9,
            transparent: true,
            side: THREE.DoubleSide
        });

        // --- GEOMETRY (Standard Height ~1.8m) ---
        // Feet at Y=0, Head top at Y=1.75
        
        // 1. HEAD
        const headGeo = new THREE.IcosahedronGeometry(0.12, 1);
        const head = new THREE.Mesh(headGeo, skinMaterial);
        head.position.y = 1.65;
        this.mesh.add(head);

        // 2. TORSO
        let torsoGeo;
        if (this.gender === 'male') {
            torsoGeo = new THREE.CylinderGeometry(0.28, 0.18, 0.65, 8);
        } else {
            // Female torso: slightly narrower shoulders, wider hips
            torsoGeo = new THREE.CylinderGeometry(0.20, 0.24, 0.60, 8);
        }
        const torso = new THREE.Mesh(torsoGeo, skinMaterial);
        torso.position.y = 1.2;
        this.mesh.add(torso);

        // 3. HIPS
        const hipGeo = new THREE.CylinderGeometry(0.18, 0.15, 0.2, 8);
        const hips = new THREE.Mesh(hipGeo, skinMaterial);
        hips.position.y = 0.8;
        this.mesh.add(hips);

        // 4. LIMBS Helper
        const createLimb = (x, y, z, width, length, angleZ) => {
            const geo = new THREE.CylinderGeometry(width, width*0.7, length, 6);
            const limb = new THREE.Mesh(geo, skinMaterial);
            limb.position.set(x, y, z);
            limb.rotation.z = angleZ;
            return limb;
        };

        // Arms
        this.mesh.add(createLimb(-0.35, 1.35, 0, 0.06, 0.7, 0.2));  // Left
        this.mesh.add(createLimb(0.35, 1.35, 0, 0.06, 0.7, -0.2)); // Right

        // Legs
        this.mesh.add(createLimb(-0.15, 0.4, 0, 0.08, 0.8, 0));   
        this.mesh.add(createLimb(0.15, 0.4, 0, 0.08, 0.8, 0));    

        // --- PARTICLES ---
        this.addParticles();
    }

    addParticles() {
        const particleCount = 40;
        const geo = new THREE.BufferGeometry();
        const positions = [];
        for(let i=0; i<particleCount; i++) {
            positions.push(
                (Math.random()-0.5)*1.2, 
                Math.random()*1.8,       
                (Math.random()-0.5)*1.2
            );
        }
        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        const mat = new THREE.PointsMaterial({
            color: this.gender === 'male' ? 0x00f3ff : 0xff00aa,
            size: 0.04, transparent: true, opacity: 0.6
        });
        this.particles = new THREE.Points(geo, mat);
        this.mesh.add(this.particles);
    }

    animate() {
        if (this.particles) {
            this.particles.rotation.y -= 0.002;
        }
    }
}
