const { createClient } = require('@libsql/client');
const path = require('path');

(async () => {
    const dbPath = path.join(process.cwd(), 'tracker.db');
    const client = createClient({ url: 'file:' + dbPath });

    console.log('Seeding sections...');
    const sections = ['Revolt', 'TLE', 'Personal', 'Work'];
    
    for (const title of sections) {
        // Check if exists
        const res = await client.execute({ sql: 'SELECT id FROM sections WHERE title = ?', args: [title] });
        if (res.rows.length === 0) {
            console.log(`Adding section: ${title}`);
            await client.execute({ sql: 'INSERT INTO sections (title) VALUES (?)', args: [title] });
        } else {
            console.log(`Section exists: ${title}`);
        }
    }
    console.log('Done!');
})();
