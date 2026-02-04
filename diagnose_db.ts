
import { createClient } from '@libsql/client';
import path from 'path';

import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf-8');
const env: any = {};
envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.join('=').trim().replace(/"/g, '');
    }
});

const url = env.TURSO_DATABASE_URL || `file:${path.join(process.cwd(), 'tracker_v2.db')}`;
const authToken = env.TURSO_AUTH_TOKEN;

const client = createClient({ url, authToken });

async function diagnose() {
    try {
        const res = await client.execute("PRAGMA table_info(daily_logs)");
        console.log("daily_logs columns:", res.rows.map(r => r.name));

        const res2 = await client.execute("PRAGMA table_info(habit_logs)");
        console.log("habit_logs columns:", res2.rows.map(r => r.name));

        const res3 = await client.execute("SELECT * FROM habit_logs LIMIT 1");
        console.log("Sample habit log:", res3.rows[0]);
    } catch (e) {
        console.error("DIAGNOSE ERROR:", e);
    }
}

diagnose();
