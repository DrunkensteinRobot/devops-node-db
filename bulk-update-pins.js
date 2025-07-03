require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

(async () => {
  try {
    await client.connect();
    console.log("✅ Connected to database");

    // Step 1: Get all users with empty or null passwords
    const result = await client.query("SELECT id, email FROM users WHERE password IS NULL OR password = ''");

    if (result.rows.length === 0) {
      console.log("🎉 All users already have passwords.");
      return;
    }

    console.log(`🔄 Updating ${result.rows.length} users...\n`);

    for (const user of result.rows) {
      const pin = crypto.randomInt(100000, 999999).toString();
      const hashedPin = await bcrypt.hash(pin, 10);

      await client.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPin, user.id]);

      console.log(`✅ ${user.email} - new PIN: ${pin}`);
    }

    console.log("\n✅ Bulk update completed.");
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await client.end();
    console.log("🔌 Disconnected from database.");
  }
})();
