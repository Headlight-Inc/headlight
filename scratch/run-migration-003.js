import dotenv from 'dotenv';
import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const db = createClient({
    url: process.env.VITE_TURSO_DATABASE_URL,
    authToken: process.env.VITE_TURSO_AUTH_TOKEN
});

const sqlFile = path.resolve(__dirname, '../scripts/migrations/003_foundation_tables.sql');
const sql = fs.readFileSync(sqlFile, 'utf8');

(async () => {
    console.log('Starting migration 003...');
    const statements = sql.split(';').filter(s => s.trim());
    for (const statement of statements) {
        await db.execute(statement);
    }
    console.log('Migration 003 complete');
})();
