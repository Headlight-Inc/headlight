import type { CmsKey } from './cms';
import type { Industry } from './industries';
import type { FpValue, SourceStamp } from './sources';

export interface FpStackValue {
  value: string | string[];
  confidence: number;
  source: SourceStamp;
}

export interface ProjectFingerprint {
  industry: FpValue<Industry>;
  cms?: FpValue<CmsKey>;
  languagePrimary?: FpValue<string>;
  stack?: Record<string, FpStackValue>;
  size?: {
    urls?: FpValue<number>;
  };
}
