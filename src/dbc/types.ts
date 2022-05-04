import { Client, Pool } from "pg";

export interface DbSecureType {
    secureAccess: boolean;
    secureCert?: string;
    secureKey?: string;
}

export interface DbOptionsType {
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

export interface DbParamsType {
    host?: string;
    username?: string;
    password?: string;
    database?: string;
    filename?: string;
    location?: string;      // => URI
    port?: number | string;
    poolSize?: number;
    secureOption?: DbSecureType;
    uri?: string;
    timezone?: string
    max?: number;
    idleTimeoutMillis?: number;
    connectionTimeoutMillis?: number;
}

export type DbType = Pool | Client
