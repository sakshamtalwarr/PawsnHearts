import fs from 'fs';
import path from 'path';
import { pool } from '../config/db';

async function migrate() {
  console.log('🚀 Running database migrations for Neon...');
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    await pool.query(sql);
    console.log('✅ Migrations executed successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
