import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';

const envFile = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8');
const env: { [key: string]: string } = {};
envFile.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.join('=').trim().replace(/^"(.*)"$/, '$1');
    }
});

const url = env.TURSO_DATABASE_URL;
const authToken = env.TURSO_AUTH_TOKEN;
const client = createClient({ url, authToken });

async function setGymStreak() {
    // Find Gym habit
    const res = await client.execute("SELECT id, title FROM habits WHERE title LIKE '%Gym%' OR title LIKE '%gym%'");
    if (res.rows.length === 0) {
        console.error("Gym habit not found!");
        return;
    }

    const gymId = res.rows[0].id;
    console.log(`Found Gym habit with ID: ${gymId}. Updating streak to 15...`);

    await client.execute({
        sql: "UPDATE habits SET streak = 15, track_streak = 1 WHERE id = ?",
        args: [gymId]
    });

    console.log("Streak updated successfully!");
}

setGymStreak().catch(console.error);
