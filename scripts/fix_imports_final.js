const fs = require('fs');
const path = require('path');

const filesToFix = [
    'src/features/game/engine.ts',
    'src/features/game/entities/area.ts',
    'src/features/game/entities/vendor.ts',
    'src/features/game/mechanics/orchestrators/inventory.ts',
    'src/features/game/mechanics/systems/ai/behaviorTree/nodesSurvival.ts',
    'src/features/game/mechanics/systems/ai/types.ts',
    'src/features/game/mechanics/systems/generation/biomes.ts',
    'src/features/game/mechanics/systems/generation/loot.ts',
    'src/features/game/mechanics/systems/generation/npcs.ts'
];

filesToFix.forEach(relPath => {
    const file = path.join(__dirname, '../', relPath);
    if (!fs.existsSync(file)) return;
    
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Fix absolute alias logic
    content = content.replace(/from ['"]@\/features\/game\/generation['"]/g, "from '@/features/game/mechanics/systems/generation'");
    content = content.replace(/from ['"]@\/features\/game\/mechanics\/ai['"]/g, "from '@/features/game/mechanics/systems/ai'");

    // engine.ts
    if (file.endsWith('engine.ts')) {
        content = content.replace(/from ['"]\.\/generation['"]/g, "from './mechanics/systems/generation'");
        content = content.replace(/from ['"]\.\/generation\/loot['"]/g, "from './mechanics/systems/generation/loot'");
    }

    // entities/area.ts & vendor.ts
    if (file.endsWith('entities/area.ts') || file.endsWith('entities/vendor.ts')) {
        content = content.replace(/from ['"]\.\.\/generation['"]/g, "from '../mechanics/systems/generation'");
    }

    // mechanics/orchestrators/inventory.ts
    if (file.endsWith('inventory.ts')) {
        content = content.replace(/from ['"]\.\.\/types['"]/g, "from '../../types'");
    }

    // AI behaviorTree nodes
    if (file.endsWith('nodesSurvival.ts')) {
        content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/types['"]/g, "from '../../../../types'");
    }

    // ai/types.ts
    if (file.endsWith('ai/types.ts')) {
        content = content.replace(/from ['"]\.\.\/types['"]/g, "from '../../../types'");
    }

    // generation/biomes.ts, loot.ts, npcs.ts
    if (file.includes('generation/')) {
        content = content.replace(/from ['"]\.\.\/types['"]/g, "from '../../../types'");
        content = content.replace(/from ['"]\.\.\/mechanics['"]/g, "from '../../..'"); // They used to import from ../mechanics, which was features/game/mechanics. Now they are inside features/game/mechanics/systems/generation, so it's ../../../mechanics. Actually, what did they import from `../mechanics`?
        content = content.replace(/from ['"]\.\.\/mechanics\/dice['"]/g, "from '../../../mechanics/dice'");
    }

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated imports in ${file}`);
    }
});
