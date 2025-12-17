// ==========================================
// CONFIGURATION & DATA ASSETS
// ==========================================

// Global Application State
export const APP_STATE = { 
    gender: 'male', 
    category: 'home', 
    subCategory: null, 
    userProfile: null,
    settings: {
        hqRendering: true,
        debugMode: false
    }
};

// Menu Structure for Navigation (Matches HTML Buttons)
export const SYSTEM_DATA = {
    nervous: [ { id: 'brain', title: 'Brain Model', desc: 'Cerebrum & Cerebellum' } ],
    circulation: [ { id: 'heart', title: 'Beating Heart', desc: 'Real-time Cardiac Rhythm' } ],
    skeletal: [ { id: 'skeleton', title: 'Full Skeleton', desc: 'Axial & Appendicular' }, { id: 'long_bone', title: 'Long Bone', desc: 'Femur/Humerus Analysis' } ],
    digestive: [ { id: 'stomach', title: 'Stomach', desc: 'Gastric Anatomy' }, { id: 'intestines', title: 'Intestines', desc: 'Small & Large Tract' } ],
    genetic: [ { id: 'dna', title: 'DNA Helix', desc: 'Double Helix Structure' } ],
    immune: [
        { id: 'covid', title: 'SARS-CoV-2', desc: 'Pathogen Visualization' },
        { id: 'antibody', title: 'Antibody', desc: 'Y-Shaped Protein' },
        { id: 'macrophage', title: 'Macrophage', desc: 'Phagocytosis Unit' },
        { id: 't_cell', title: 'T-Cell', desc: 'Lymphocyte Killer' },
        { id: 'lymphocyte', title: 'Lymphocyte', desc: 'White Blood Cell' },
        { id: 'monocyte', title: 'Monocyte', desc: 'Immune Response' },
        { id: 'eosinophil', title: 'Eosinophil', desc: 'Disease Fighting WBC' },
        { id: 'basophil', title: 'Basophil', desc: 'Inflammatory Response' }
    ]
};

// 3D Model Paths (Pointing to ./assets/)
export const ASSETS = {
    male: {
        home: './assets/human_male_full.glb',
        brain: './assets/brain_male.glb',
        skeleton: './assets/male_human_skeleton.glb',
        heart: './assets/beating_heart.glb',
        long_bone: './assets/long_bone.glb',
        stomach: './assets/human_digestive_stomach.glb',
        intestines: './assets/small_and_large_intestine.glb',
        dna: './assets/dna.glb',
        covid: './assets/covid_19.glb',
        antibody: './assets/antibody.glb',
        macrophage: './assets/macrophage.glb',
        t_cell: './assets/t_cell.glb',
        lymphocyte: './assets/lymphocyte.glb',
        monocyte: './assets/monocyte.glb',
        eosinophil: './assets/eosinophil.glb',
        basophil: './assets/basophil.glb'
    },
    female: {
        home: './assets/human_female_full.glb',
        brain: './assets/brain_female.glb',
        skeleton: './assets/female_human_skeleton.glb',
        heart: './assets/beating_heart.glb',
        long_bone: './assets/long_bone.glb',
        stomach: './assets/human_digestive_stomach.glb',
        intestines: './assets/small_and_large_intestine.glb',
        dna: './assets/dna.glb',
        covid: './assets/covid_19.glb',
        antibody: './assets/antibody.glb',
        macrophage: './assets/macrophage.glb',
        t_cell: './assets/t_cell.glb',
        lymphocyte: './assets/lymphocyte.glb',
        monocyte: './assets/monocyte.glb',
        eosinophil: './assets/eosinophil.glb',
        basophil: './assets/basophil.glb'
    }
};