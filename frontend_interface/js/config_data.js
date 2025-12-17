// ==========================================
// CONFIGURATION & DATA
// ==========================================

export const APP_STATE = { 
    gender: 'male', 
    category: 'home', 
    subCategory: null, 
    userProfile: null,
    settings: { hq: true }
};

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

export const ASSETS = {
    male: {
        home: './assets/body_base/human_male_full.glb',
        brain: './assets/nervous/brain_male.glb',
        skeleton: './assets/skeletal/male_human_skeleton.glb',
        heart: './assets/circulation/beating_heart.glb',
        long_bone: './assets/skeletal/long_bone.glb',
        stomach: './assets/digestive/human_digestive_stomach.glb',
        intestines: './assets/digestive/small_and_large_intestine.glb',
        dna: './assets/genetic/dna.glb',
        covid: './assets/immune/covid_19.glb',
        antibody: './assets/immune/antibody.glb',
        macrophage: './assets/immune/macrophage.glb',
        t_cell: './assets/immune/t_cell.glb',
        lymphocyte: './assets/immune/lymphocyte.glb',
        monocyte: './assets/immune/monocyte.glb',
        eosinophil: './assets/immune/eosinophil.glb',
        basophil: './assets/immune/basophil.glb'
    },
    female: {
        home: './assets/body_base/human_female_full.glb',
        brain: './assets/nervous/brain_female.glb',
        skeleton: './assets/skeletal/female_human_skeleton.glb',
        heart: './assets/circulation/beating_heart.glb',
        long_bone: './assets/skeletal/long_bone.glb',
        stomach: './assets/digestive/human_digestive_stomach.glb',
        intestines: './assets/digestive/small_and_large_intestine.glb',
        dna: './assets/genetic/dna.glb',
        covid: './assets/immune/covid_19.glb',
        antibody: './assets/immune/antibody.glb',
        macrophage: './assets/immune/macrophage.glb',
        t_cell: './assets/immune/t_cell.glb',
        lymphocyte: './assets/immune/lymphocyte.glb',
        monocyte: './assets/immune/monocyte.glb',
        eosinophil: './assets/immune/eosinophil.glb',
        basophil: './assets/immune/basophil.glb'
    }
};