"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const db_1 = require("../config/db");
async function migrate() {
    console.log('🚀 Running database migrations for Neon...');
    try {
        const schemaPath = path_1.default.join(__dirname, 'schema.sql');
        const sql = fs_1.default.readFileSync(schemaPath, 'utf8');
        await db_1.pool.query(sql);
        console.log('✅ Migrations executed successfully!');
    }
    catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
    finally {
        await db_1.pool.end();
    }
}
migrate();
