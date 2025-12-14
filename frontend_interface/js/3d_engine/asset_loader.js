import * as THREE from 'three';

export class AssetLoader {
    constructor(scene) {
        this.scene = scene;
        this.currentMesh = null;
        this.bloodSystem = null; 
        this.isPulse = false;
        this.isSpin = true;
    }

    load(name, category) {
        // 1. CLEANUP
        if (this.currentMesh) {
            this.scene.remove(this.currentMesh);
            this.currentMesh = null;
        }
        if (this.bloodSystem) {
            this.scene.remove(this.bloodSystem);
            this.bloodSystem = null;
        }

        console.log(`[ENGINE] Building Realistic Model: ${name}`);

        this.currentMesh = new THREE.Group();
        this.isPulse = false;
        this.isSpin = true;
        
        // --- MATERIAL FACTORY ---
        const getMat = (color, opacity = 0.9, rough = 0.3) => {
            return new THREE.MeshPhysicalMaterial({
                color: color, metalness: 0.1, roughness: rough,
                transmission: 0.1, opacity: opacity, transparent: true,
                emissive: color, emissiveIntensity: 0.2, side: THREE.DoubleSide
            });
        };

        // ===============================================
        // PROCEDURAL GENERATION LOGIC
        // ===============================================

        // --- 1. GENETICS ---
        if (name === "DNA Helix") {
            this.buildHelix(true); 
        } 
        else if (name === "RNA Strand") {
            this.buildHelix(false); 
        }
        else if (name === "Protein") {
            // Complex knotted structure
            this.currentMesh.add(new THREE.Mesh(new THREE.TorusKnotGeometry(0.7, 0.2, 64, 8, 3, 5), getMat(0x0088FF)));
        }
        else if (name === "Enzyme") {
            // Pacman shape
            this.currentMesh.add(new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32, 0, Math.PI * 1.7), getMat(0x0088FF)));
        }

        // --- 2. NERVOUS SYSTEM ---
        else if (name === "Brain") {
            // High-Fidelity Bi-Lobed Brain
            const mat = getMat(0xFF00D2); 
            const left = new THREE.Mesh(new THREE.SphereGeometry(0.8, 32, 32), mat);
            left.scale.set(0.8, 1, 1.2); left.position.x = -0.65; left.rotation.z = 0.1;
            const right = new THREE.Mesh(new THREE.SphereGeometry(0.8, 32, 32), mat);
            right.scale.set(0.8, 1, 1.2); right.position.x = 0.65; right.rotation.z = -0.1;
            const cereb = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), mat);
            cereb.position.set(0, -0.6, -0.5); cereb.scale.set(1.5, 0.8, 0.8);
            this.currentMesh.add(left, right, cereb);
        }
        else if (name === "Neurons") {
            // Star shape soma
            const body = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 0), getMat(0xFF00D2));
            // Dendrites (Spikes)
            const spikes = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 0), getMat(0xFF00D2, 0.3));
            this.currentMesh.add(body, spikes);
        }
        else if (name === "Spine") {
            // Segmented Column (Vertebrae)
            const mat = getMat(0xEEEEEE);
            for(let i=0; i<5; i++) {
                const vert = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16), mat);
                vert.position.y = (i - 2) * 0.5;
                // Add disc
                const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.1, 16), getMat(0x888888));
                disc.position.y = (i - 2) * 0.5 + 0.2;
                this.currentMesh.add(vert, disc);
            }
        }
        else if (name === "Synapse") {
            // Gap junction
            const m1 = new THREE.Mesh(new THREE.SphereGeometry(0.6), getMat(0xFF00D2)); m1.position.x = -0.8;
            const m2 = new THREE.Mesh(new THREE.SphereGeometry(0.6), getMat(0xFF00D2)); m2.position.x = 0.8;
            // Sparks
            const spark = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3), getMat(0xFFFFFF));
            this.currentMesh.add(m1, m2, spark);
        }

        // --- 3. CIRCULATORY SYSTEM ---
        else if (name === "Heart") {
            // High-Fidelity Heart
            this.isPulse = true; this.isSpin = false;
            const muscleMat = getMat(0xCC0000, 1.0, 0.4); 
            const veinMat = getMat(0x0055FF, 1.0, 0.2);   
            const main = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), muscleMat);
            main.scale.set(1, 1.3, 0.8); main.rotation.z = 0.3;
            const leftAtrium = new THREE.Mesh(new THREE.SphereGeometry(0.6), muscleMat);
            leftAtrium.position.set(-0.6, 0.8, 0);
            const rightAtrium = new THREE.Mesh(new THREE.SphereGeometry(0.6), muscleMat);
            rightAtrium.position.set(0.4, 0.9, 0.2);
            const aorta = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1, 16), veinMat);
            aorta.position.set(0.2, 1.2, 0); aorta.rotation.z = -0.3;
            this.currentMesh.add(main, leftAtrium, rightAtrium, aorta);
            this.currentMesh.rotation.y = -Math.PI / 2; 
            this.createBloodFlow(0xFF0000); 
        }
        else if (name === "Arteries") {
            const geo = new THREE.TorusGeometry(1, 0.2, 16, 50, Math.PI * 1.5);
            this.currentMesh.add(new THREE.Mesh(geo, getMat(0xFF0000)));
        }
        else if (name === "Veins") {
            const geo = new THREE.TorusGeometry(1, 0.2, 16, 50, Math.PI * 1.5);
            this.currentMesh.add(new THREE.Mesh(geo, getMat(0x0033FF)));
        }
        else if (name === "Red Blood Cells") {
            // Flattened Donut (Biconcave disc)
            const cell = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.35, 16, 50), getMat(0xFF0000));
            cell.scale.set(1, 1, 0.3);
            this.currentMesh.add(cell);
        }

        // --- 4. STRUCTURAL ---
        else if (name === "Bone Marrow") {
            // Cross-section
            const boneMat = getMat(0xFFFFFF, 1.0, 0.8); 
            const shell = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 3, 32, 1, true), boneMat);
            const marrowMat = getMat(0xAA0000, 1.0, 0.9); 
            const marrow = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 2.9, 32), marrowMat);
            const ringGeo = new THREE.RingGeometry(0.9, 1, 32);
            const topCap = new THREE.Mesh(ringGeo, boneMat); topCap.rotation.x = -Math.PI / 2; topCap.position.y = 1.5;
            const botCap = new THREE.Mesh(ringGeo, boneMat); botCap.rotation.x = Math.PI / 2; botCap.position.y = -1.5;
            this.currentMesh.add(shell, marrow, topCap, botCap);
            this.currentMesh.rotation.z = Math.PI / 4; 
        }

        // --- 5. RESPIRATORY ---
        else if (name === "Lungs") {
            // High-Fidelity Lungs
            const tissueMat = getMat(0xFF8888, 0.9); 
            const right = new THREE.Mesh(new THREE.CapsuleGeometry(0.7, 1.4, 4, 16), tissueMat);
            right.position.x = 0.75; right.scale.set(1, 1, 1.2);
            const left = new THREE.Mesh(new THREE.CapsuleGeometry(0.65, 1.3, 4, 16), tissueMat);
            left.position.x = -0.75;
            const trachea = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.5, 16), getMat(0xEEEEEE));
            trachea.position.y = 1.2;
            this.currentMesh.add(right, left, trachea);
        }
        else if (name === "Alveoli") {
            // Grape-like Cluster
            const mat = getMat(0xFF8888);
            for(let i=0; i<8; i++) {
                const sac = new THREE.Mesh(new THREE.SphereGeometry(0.4), mat);
                sac.position.set(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5);
                this.currentMesh.add(sac);
            }
        }

        // --- 6. DIGESTIVE ---
        else if (name === "Stomach") {
             // J-Shape (Torus segment)
             const stomach = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.45, 16, 20, 3.5), getMat(0xFF8800));
             stomach.rotation.z = 2;
             this.currentMesh.add(stomach);
        }
        else if (name === "Liver") {
            // Wedge Shape
            const liv = new THREE.Mesh(new THREE.ConeGeometry(1.2, 2, 4), getMat(0x8B0000)); // Dark Red/Brown
            liv.rotation.x = Math.PI/2;
            liv.scale.set(1, 1, 0.6);
            this.currentMesh.add(liv);
        }
        else if (name === "Pancreas") {
            // Tapered Capsule
            const pan = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 2, 4, 16), getMat(0xFFDD00));
            pan.rotation.z = Math.PI/2;
            this.currentMesh.add(pan);
        }
        else if (name === "Intestine") {
            // Complex Coil
            this.currentMesh.add(new THREE.Mesh(new THREE.TorusKnotGeometry(0.7, 0.25, 100, 16, 3, 4), getMat(0xFF8800)));
        }

        // --- 7. FILTRATION ---
        else if (name === "Kidneys") {
            // Bean shapes
            const kGeo = new THREE.SphereGeometry(0.6, 32, 32); 
            kGeo.scale(1, 1.5, 0.8);
            const k1 = new THREE.Mesh(kGeo, getMat(0x8B4513)); k1.position.x = -0.8; k1.rotation.z = 0.2;
            const k2 = new THREE.Mesh(kGeo, getMat(0x8B4513)); k2.position.x = 0.8; k2.rotation.z = -0.2;
            this.currentMesh.add(k1, k2);
        }
        else if (name === "Bladder") {
            this.currentMesh.add(new THREE.Mesh(new THREE.SphereGeometry(0.9, 32, 32), getMat(0xFFFF00)));
        }

        // --- 8. IMMUNE ---
        else if (name === "T-Cells") {
            // Spiky (Green)
            const mat = getMat(0x00FF41, 0.9);
            const body = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), mat); 
            const spikeGeo = new THREE.ConeGeometry(0.1, 0.5, 8);
            for(let i=0; i<20; i++) {
                const spike = new THREE.Mesh(spikeGeo, mat);
                spike.position.set((Math.random()-0.5)*2, (Math.random()-0.5)*2, (Math.random()-0.5)*2).normalize().multiplyScalar(1);
                spike.lookAt(0,0,0);
                body.add(spike);
            }
            this.currentMesh.add(body);
        }
        else if (name === "White Blood Cells") {
            // SOLID WHITE & Amorphous
            const mat = getMat(0xFFFFFF, 1.0, 0.4); 
            const geo = new THREE.SphereGeometry(1, 48, 48); 
            const pos = geo.attributes.position;
            for(let i=0; i<pos.count; i++) {
                const x = pos.getX(i);
                const y = pos.getY(i);
                const z = pos.getZ(i);
                const noise = 1 + Math.sin(x*4)*Math.sin(y*4)*0.1;
                pos.setXYZ(i, x*noise, y*noise, z*noise);
            }
            geo.computeVertexNormals();
            this.currentMesh.add(new THREE.Mesh(geo, mat));
        }
        else if (name === "Antibodies") {
            // Y-Shape Protein
            const mat = getMat(0x00FF41);
            const geo = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);
            const base = new THREE.Mesh(geo, mat); base.position.y = -0.5;
            const arm1 = new THREE.Mesh(geo, mat); arm1.position.set(-0.5, 0.5, 0); arm1.rotation.z = -0.8;
            const arm2 = new THREE.Mesh(geo, mat); arm2.position.set(0.5, 0.5, 0); arm2.rotation.z = 0.8;
            this.currentMesh.add(base, arm1, arm2);
        }
        else if (name === "Virus") {
            // Icosahedron (Geometric Virus)
            this.currentMesh.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.8, 0), getMat(0xFF0000)));
        }

        // --- 9. FALLBACK ---
        else {
            this.currentMesh.add(new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), getMat(0x00D2FF)));
        }

        this.scene.add(this.currentMesh);
        this.currentMesh.scale.set(0,0,0);
        this.targetScale = 1;
    }

    // --- HELPER: DNA/RNA ---
    buildHelix(isDouble) {
        const dnaGroup = new THREE.Group();
        const matBackbone = new THREE.MeshPhysicalMaterial({ color: 0x0088FF, metalness: 0.5 });
        const matRung = new THREE.MeshPhysicalMaterial({ color: 0x00FF41, metalness: 0.5 });
        const segmentCount = 40; const radius = 0.6; const height = 4; const step = height / segmentCount;

        for (let i = 0; i < segmentCount; i++) {
            const angle = i * 0.5;
            const y = (i * step) - (height / 2);
            const s1 = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), matBackbone);
            s1.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
            dnaGroup.add(s1);

            if (isDouble) {
                const s2 = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), matBackbone);
                s2.position.set(Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius);
                dnaGroup.add(s2);
                const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, radius * 2, 4), matRung);
                rung.position.set(0, y, 0);
                rung.rotation.y = -angle; rung.rotation.z = Math.PI / 2;
                dnaGroup.add(rung);
            }
        }
        this.currentMesh.add(dnaGroup);
        this.isSpin = true;
    }

    createBloodFlow(color) {
        const count = 200;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        const velocity = [];
        for(let i=0; i<count; i++) {
            pos[i*3] = (Math.random() - 0.5) * 4;
            pos[i*3+1] = (Math.random() - 0.5) * 4;
            pos[i*3+2] = (Math.random() - 0.5) * 4;
            velocity.push((Math.random() * 0.02) + 0.01);
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({ color: color, size: 0.05, transparent: true, opacity: 0.6 });
        this.bloodSystem = new THREE.Points(geo, mat);
        this.bloodSystem.userData = { velocity: velocity };
        this.scene.add(this.bloodSystem);
    }

    animate(time) {
        if (this.currentMesh) {
            if (this.isSpin) this.currentMesh.rotation.y = time * 0.2;
            if (this.isPulse) {
                const s = 1 + Math.pow(Math.sin(time * 5), 2) * 0.1;
                this.currentMesh.scale.set(s, s, s);
            } else {
                const s = this.currentMesh.scale.x;
                if (s < 0.99) this.currentMesh.scale.setScalar(s + (1 - s) * 0.1);
            }
        }
        if (this.bloodSystem) {
            const positions = this.bloodSystem.geometry.attributes.position.array;
            for(let i=0; i<200; i++) {
                positions[i*3+1] -= this.bloodSystem.userData.velocity[i];
                if(positions[i*3+1] < -2) positions[i*3+1] = 2;
            }
            this.bloodSystem.geometry.attributes.position.needsUpdate = true;
        }
    }
}