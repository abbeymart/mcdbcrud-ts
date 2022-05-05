import { Client, Pool } from "pg";

export interface DbSecureType {
    secureAccess?: boolean;
    secureCert?: string;
    secureKey?: string;
    sslMode?: string;
}

export interface DbConnectionOptionsType {
    checkAccess?: boolean;
    poolSize?: number;
    reconnectTries?: number;
    reconnectInterval?: number;
    useNewUrlParser?: boolean;
    useUnifiedTopology?: boolean;
    max?: number;
    idleTimeoutMillis?: number;
    connectionTimeoutMillis?: number;
}

export interface DbConfigType {
    dbType?: string;
    host?: string;
    username?: string;
    password?: string;
    database?: string;
    filename?: string;
    location?: string;      // => URI
    port?: number | string;
    poolSize?: number;
    options?: DbConnectionOptionsType;
    secureOption?: DbSecureType;
    url?: string;
    timezone?: string
    max?: number;
    idleTimeoutMillis?: number;
    connectionTimeoutMillis?: number;
}

export type DbConnectionType = Pool | Client
