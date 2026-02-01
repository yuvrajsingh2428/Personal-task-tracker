const { createClient } = require('@libsql/client');
const path = require('path');

(async () => {
    const dbPath = path.join(process.cwd(), 'tracker.db');
    const client = createClient({ url: 'file:' + dbPath });

    console.log('Recreating tables...');
    await client.execute('DROP TABLE IF EXISTS habits');
    await client.execute('DROP TABLE IF EXISTS habit_logs');

    await client.execute(`CREATE TABLE IF NOT EXISTS habits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        subtitle TEXT,
        icon TEXT,
        color TEXT DEFAULT 'purple',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    await client.execute(`CREATE TABLE IF NOT EXISTS habit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        habit_id INTEGER,
        date TEXT,
        completed INTEGER DEFAULT 0,
        time_spent INTEGER DEFAULT 0,
        note TEXT,
        FOREIGN KEY(habit_id) REFERENCES habits(id)
    )`);

    console.log('Seeding defaults...');
    await client.execute(`INSERT INTO habits (title, subtitle, icon, color) VALUES 
        ('DSA', 'Solve 1 Problem', '🧩', 'purple'),
        ('Learning', 'Dev / Playwright', '💻', 'amber'),
        ('Gym', 'Health & Fitness', '💪', 'red')`);

    console.log('Done!');
})();
