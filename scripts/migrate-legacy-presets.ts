import { createClient } from '@libsql/client';

type Fingerprint = {
  industry: { value: string };
  languagePrimary: { value: string };
  cms: { value: string };
  geo?: { primary?: { value: string } };
  intent?: { value: string };
};

type ProjectRecord = {
  id: string;
  rootUrl: string;
};

async function main() {
  const db = getTursoClient();
  const projects = await loadProjects(db);

  for (const p of projects) {
    try {
      const fp = await runFingerprintProbe({
        projectId: p.id,
        rootUrl: p.rootUrl,
        discover: async () => ({ htmlSamples: [] }),
      });

      await persistFingerprint(db, fp);
      await db.execute({
        sql: 'UPDATE crawl_pages SET fp_industry=?, fp_language=?, fp_cms=? WHERE project_id=?',
        args: [fp.industry.value, fp.languagePrimary.value, fp.cms.value, p.id],
      });
      await db.execute({
        sql: 'UPDATE crawl_sites SET fp_industry=?, fp_language=?, fp_cms=?, fp_geo=?, fp_intent=? WHERE project_id=?',
        args: [
          fp.industry.value,
          fp.languagePrimary.value,
          fp.cms.value,
          fp.geo?.primary?.value ?? null,
          fp.intent?.value ?? null,
          p.id,
        ],
      });
      console.log(`\u2713 ${p.id}: ${fp.industry.value}/${fp.cms.value}/${fp.languagePrimary.value}`);
    } catch (e) {
      console.warn(`\u2717 ${p.id}: ${e}`);
    }
  }
}

function getTursoClient() {
  const url = process.env.TURSO_DATABASE_URL ?? process.env.VITE_TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN ?? process.env.VITE_TURSO_AUTH_TOKEN;
  if (!url) throw new Error('TURSO_DATABASE_URL is required');
  return createClient({ url, authToken });
}

async function loadProjects(db: ReturnType<typeof createClient>): Promise<ProjectRecord[]> {
  const tables = ['projects', 'crawl_projects'];
  for (const table of tables) {
    try {
      const result = await db.execute(`SELECT id, url AS rootUrl FROM ${table}`);
      return result.rows.map((row) => ({
        id: String(row.id),
        rootUrl: String(row.rootUrl),
      }));
    } catch {
      // try next table shape
    }
    try {
      const result = await db.execute(`SELECT id, root_url AS rootUrl FROM ${table}`);
      return result.rows.map((row) => ({
        id: String(row.id),
        rootUrl: String(row.rootUrl),
      }));
    } catch {
      // try next table shape
    }
  }
  throw new Error('Could not find a projects table with url/root_url');
}

async function runFingerprintProbe(input: {
  projectId: string;
  rootUrl: string;
  discover: () => Promise<{ htmlSamples: unknown[] }>;
}): Promise<Fingerprint> {
  throw new Error(`runFingerprintProbe is not wired in this repo for ${input.projectId} (${input.rootUrl})`);
}

async function persistFingerprint(_db: ReturnType<typeof createClient>, _fp: Fingerprint): Promise<void> {
  return;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
