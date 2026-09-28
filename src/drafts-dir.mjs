// Where the private drafts repo (romanumero/damonhenry-drafts) is cloned.
// Override with DRAFTS_DIR=/path/to/drafts. Missing in CI, which is intended.
import os from 'node:os';
import path from 'node:path';

export const DRAFTS_REPO = 'git@github.com:romanumero/damonhenry-drafts.git';
export const DRAFTS_DIR = process.env.DRAFTS_DIR || path.join(os.homedir(), 'Labs', 'damonhenry-drafts');
