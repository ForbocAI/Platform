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

    // 1. Fix absolute imports
    content = content.replace(/@\/features\/game\/slice\/reducers/g, '@/features/game/mechanics/transformations');
    content = content.replace(/@\/features\/game\/slice\/thunks/g, '@/features/game/mechanics/orchestrators');
    content = content.replace(/@\/features\/game\/slice/g, '@/features/game/store');
    content = content.replace(/@\/features\/game\/generation/g, '@/features/game/mechanics/systems/generation');
    content = content.replace(/@\/features\/game\/mechanics\/ai/g, '@/features/game/mechanics/systems/ai');

    // 2. Fix relative imports inside the MOVED folders

    // If file is inside features/game/mechanics/transformations (formerly slice/reducers)
    if (file.includes('mechanics/transformations/')) {
        content = content.replace(/from '\.\.\/thunks'/g, "from '../orchestrators'");
        content = content.replace(/from '\.\.\/types'/g, "from '../../store/types'");
        content = content.replace(/from '\.\.\/constants'/g, "from '../../store/constants'");
        content = content.replace(/from '\.\.\/gameSlice'/g, "from '../../store/gameSlice'");
    }

    // If file is inside features/game/mechanics/orchestrators (formerly slice/thunks)
    if (file.includes('mechanics/orchestrators/')) {
        content = content.replace(/from '\.\.\/reducers'/g, "from '../transformations'");
        content = content.replace(/from '\.\.\/types'/g, "from '../../store/types'");
        content = content.replace(/from '\.\.\/constants'/g, "from '../../store/constants'");
        content = content.replace(/from '\.\.\/gameSlice'/g, "from '../../store/gameSlice'");
    }

    // If file is inside features/game/store (formerly slice)
    if (file.includes('store/')) {
        content = content.replace(/from '\.\/reducers/g, "from '../mechanics/transformations");
        content = content.replace(/from '\.\/thunks/g, "from '../mechanics/orchestrators");
        
        // gameSlice might import from generation or mechanics/ai
        content = content.replace(/from '\.\.\/generation/g, "from '../mechanics/systems/generation");
        content = content.replace(/from '\.\.\/mechanics\/ai/g, "from '../mechanics/systems/ai");
    }

    // If file is inside features/game/mechanics/systems/ai (formerly mechanics/ai)
    if (file.includes('mechanics/systems/ai/')) {
        content = content.replace(/from '\.\.\/\.\.\/slice\/types'/g, "from '../../../store/types'");
        content = content.replace(/from '\.\.\/\.\.\/slice\/gameSlice'/g, "from '../../../store/gameSlice'");
        content = content.replace(/from '\.\.\/\.\.\/slice\/constants'/g, "from '../../../store/constants'");
        content = content.replace(/from '\.\.\/\.\.\/slice\/thunks/g, "from '../../../mechanics/orchestrators");
        
        // internal references to what was mechanics/ai
        content = content.replace(/from '\.\.\/\.\.\/mechanics\/ai/g, "from '../../../mechanics/systems/ai");
    }

    // If file is inside features/game/mechanics/systems/generation (formerly generation)
    if (file.includes('mechanics/systems/generation/')) {
        content = content.replace(/from '\.\.\/slice\/types'/g, "from '../../store/types'");
        content = content.replace(/from '\.\.\/slice\/gameSlice'/g, "from '../../store/gameSlice'");
        content = content.replace(/from '\.\.\/slice\/constants'/g, "from '../../store/constants'");
        content = content.replace(/from '\.\.\/mechanics\/ai/g, "from '../../mechanics/systems/ai");
    }

    // General cleanup for anything that might have been missed with relative paths to slice
    // e.g. features/game/items.ts importing slice/reducers -> mechanics/transformations
    if (file.includes('features/game/')) {
        content = content.replace(/from '\.\/slice\/types'/g, "from './store/types'");
        content = content.replace(/from '\.\/slice\/constants'/g, "from './store/constants'");
        content = content.replace(/from '\.\/slice\/gameSlice'/g, "from './store/gameSlice'");
        content = content.replace(/from '\.\/slice\/reducers/g, "from './mechanics/transformations");
        content = content.replace(/from '\.\/slice\/thunks/g, "from './mechanics/orchestrators");
        content = content.replace(/from '\.\/generation/g, "from './mechanics/systems/generation");
        content = content.replace(/from '\.\/mechanics\/ai/g, "from './mechanics/systems/ai");
    }

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated imports in ${file}`);
    }
});

console.log('Import rewrite complete.');
