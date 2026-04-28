
const modes = [
    { id: 'wqa', varName: 'wqa' },
    { id: 'technical', varName: 'technical' },
    { id: 'content', varName: 'content' },
    { id: 'linksAuthority', varName: 'links' },
    { id: 'uxConversion', varName: 'ux' },
    { id: 'paid', varName: 'paid' },
    { id: 'commerce', varName: 'commerce' },
    { id: 'socialBrand', varName: 'social' },
    { id: 'ai', varName: 'ai' },
    { id: 'competitors', varName: 'competitors' },
    { id: 'local', varName: 'local' }
];

const fs = require('fs');
const path = require('path');

modes.forEach(mode => {
    const content = `import { RsModeBundle } from './types';

export const ${mode.varName}Bundle: RsModeBundle<any> = {
	modeId: '${mode.id}',
	computeStats: () => ({}),
	tabs: {},
};
`;
    fs.writeFileSync(path.join(process.cwd(), `services/right-sidebar/${mode.varName}.ts`), content);
});
