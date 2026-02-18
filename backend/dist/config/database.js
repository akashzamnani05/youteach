"use strict";
// src/config/database.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transaction = exports.queryOne = exports.query = exports.testConnection = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Create connection pool
const pool = promise_1.default.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'teaching_platform',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    // Return DATE / DATETIME / TIMESTAMP columns as plain strings ("YYYY-MM-DD")
    // instead of JS Date objects, which get serialised to UTC ISO strings and
    // shift the date backward in UTC+5:30 timezones.
    dateStrings: true,
});
// Test connection
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully');
        connection.release();
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    }
};
exports.testConnection = testConnection;
// Query helper with automatic connection management
const query = async (sql, params) => {
    try {
        const [rows] = await pool.execute(sql, params);
        return rows;
    }
    catch (error) {
        console.error('Query error:', error);
        throw error;
    }
};
exports.query = query;
// Single row query helper
const queryOne = async (sql, params) => {
    const rows = await (0, exports.query)(sql, params);
    return rows.length > 0 ? rows[0] : null;
};
exports.queryOne = queryOne;
// Transaction helper
const transaction = async (callback) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const result = await callback(connection);
        await connection.commit();
        return result;
    }
    catch (error) {
        await connection.rollback();
        throw error;
    }
    finally {
        connection.release();
    }
};
exports.transaction = transaction;
exports.default = pool;
//# sourceMappingURL=database.js.map