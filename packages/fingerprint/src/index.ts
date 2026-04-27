export * from './FingerprintProbe';
export * from './cascades';
export * from './detectors/types';

import { runFingerprint } from './FingerprintProbe';
export const FingerprintProbe = {
    run: (data: any) => runFingerprint({ 
        ctx: { 
            projectId: data.projectId || 'unknown',
            hostname: data.baseHostname || '',
            htmlSamples: [],
            headers: {},
            now: new Date(),
            connections: {}
        } 
    })
};
