import mysql from 'mysql2/promise';
declare const pool: mysql.Pool;
export declare const testConnection: () => Promise<void>;
export declare const query: <T = any>(sql: string, params?: any[]) => Promise<T[]>;
export declare const queryOne: <T = any>(sql: string, params?: any[]) => Promise<T | null>;
export declare const transaction: <T>(callback: (connection: mysql.PoolConnection) => Promise<T>) => Promise<T>;
export default pool;
//# sourceMappingURL=database.d.ts.map