// scripts/migrate-presets.ts
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Migration script to normalize audit presets to the new foundation format.
 * Ensures enabledMetricKeys and disabledMetricKeys are populated from legacy check overrides.
 */
async function migrate() {
    const client = createClient({
        url: process.env.TURSO_DATABASE_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN!,
    });

    console.log('--- Audit Preset Migration Starting ---');

    try {
        const result = await client.execute('SELECT project_id, presets_json FROM crawl_audit_presets');
        console.log(`Found ${result.rows.length} project(s) with presets.`);

        for (const row of result.rows) {
            const projectId = String(row.project_id);
            const rawPresets = JSON.parse(String(row.presets_json || '[]'));

            if (!Array.isArray(rawPresets)) continue;

            const migratedPresets = rawPresets.map((p: any) => {
                // Map legacy check overrides to metric keys if they don't exist
                const enabledMetricKeys = p.enabledMetricKeys || p.enabledCheckOverrides || [];
                const disabledMetricKeys = p.disabledMetricKeys || p.disabledCheckOverrides || [];

                // Clean up deprecated fields
                const { enabledCheckOverrides, disabledCheckOverrides, ...rest } = p;

                return {
                    ...rest,
                    enabledMetricKeys,
                    disabledMetricKeys,
                    // Ensure modern modes/industries are used (placeholder for mapping logic if needed)
                };
            });

            await client.execute({
                sql: 'UPDATE crawl_audit_presets SET presets_json = ?, updated_at = CURRENT_TIMESTAMP WHERE project_id = ?',
                args: [JSON.stringify(migratedPresets), projectId]
            });

            console.log(`Migrated presets for project: ${projectId}`);
        }

        console.log('--- Migration Complete ---');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        client.close();
    }
}

migrate();
