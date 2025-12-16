
export const BIO_SYSTEMS = {
    'root': {
        type: 'category',
        name: 'Human',
        children: ['nervous', 'circulatory', 'skeletal', 'digestive']
    },
    'nervous': {
        type: 'model',
        name: 'Nervous',
        icon: '🧠',
        file: 'human_male.glb' // The procedural engine handles this name
    },
    'circulatory': {
        type: 'model',
        name: 'Circulatory',
        icon: '🫀',
        file: 'human_male.glb'
    },
    'skeletal': {
        type: 'model',
        name: 'Skeletal',
        icon: '💀',
        file: 'human_male.glb'
    },
    'digestive': {
        type: 'model',
        name: 'Digestive',
        icon: '🌭', // Placeholder icon
        file: 'human_male.glb'
    }
};
