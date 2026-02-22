const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(srcDir);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // engine.ts
    if (file.endsWith('src/features/game/engine.ts')) {
        content = content.replace(/from '\.\/generation/g, "from './mechanics/systems/generation");
    }

    // entities/area.ts
    if (file.endsWith('entities/area.ts')) {
        content = content.replace(/from '\.\.\/generation/g, "from '../mechanics/systems/generation");
    }

    // entities/vendor.ts
    if (file.endsWith('entities/vendor.ts')) {
        content = content.replace(/from '\.\.\/generation/g, "from '../mechanics/systems/generation");
    }

    // mechanics/orchestrators/inventory.ts
    if (file.endsWith('mechanics/orchestrators/inventory.ts')) {
        content = content.replace(/from '\.\.\/types'/g, "from '../../types'");
    }

    // mechanics/systems/ai/awareness.ts
    if (file.endsWith('mechanics/systems/ai/awareness.ts')) {
        content = content.replace(/from '\.\.\/\.\.\/types'/g, "from '../../../types'");
    }
    
    // mechanics/systems/ai/types.ts
    if (file.endsWith('mechanics/systems/ai/types.ts')) {
        content = content.replace(/from '\.\.\/types'/g, "from '../../../types'");
    }

    // behaviorTree files
    if (file.includes('mechanics/systems/ai/behaviorTree/')) {
        content = content.replace(/from '\.\.\/\.\.\/\.\.\/slice\/types'/g, "from '../../../../store/types'");
        content = content.replace(/from '\.\.\/\.\.\/\.\.\/types'/g, "from '../../../../types'");
    }

    // generation files
    if (file.includes('mechanics/systems/generation/')) {
        content = content.replace(/from '\.\.\/types'/g, "from '../../../types'");
        content = content.replace(/from '\.\.\/mechanics/g, "from '../..");
    }

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated secondary imports in ${file}`);
    }
});

console.log('Secondary import rewrite complete.');
