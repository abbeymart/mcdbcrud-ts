import { Pool, Client } from "pg";
import { DbConnectionOptionsType, DbConfigType } from "./types";

export class DbPg {
    private readonly host: string;
    private readonly username: string;
    private readonly password: string;
    private readonly database: string;
    private readonly port: number;
    private readonly poolSize: number;
    private readonly options: DbConnectionOptionsType;
    private readonly dbUrl: string;
    private readonly isDev: boolean;

    constructor(dbConfig: DbConfigType, options?: DbConnectionOptionsType) {
        this.host = dbConfig?.host || "";
        this.username = dbConfig?.username || "";
        this.password = dbConfig?.password || "";
        this.database = dbConfig?.database || "";
        this.port = Number(dbConfig?.port) || 5432;
        this.poolSize = dbConfig?.poolSize || 20;
        this.isDev = dbConfig.isDev !== undefined ? dbConfig.isDev : true;
        this.dbUrl = `postgresql://${this.username}:${this.password}@${this.host}:${this.port}/${this.database}`
        this.options = {
            ssl                    : options?.ssl ? options.ssl : this.isDev ? false : {rejectUnauthorized: false},
            max                    : options?.max || this.poolSize,
            idleTimeoutMillis      : options?.idleTimeoutMillis || 30000,
            connectionTimeoutMillis: options?.connectionTimeoutMillis || 5000,
        };
    }

    pgPool() {
        const configPool = {
            ...this.options,
            host    : this.host,
            port    : this.port,
            database: this.database,
            user    : this.username,
            password: this.password,
        }
        return new Pool(configPool)
    }

    pgClient() {
        const configClient = {
            host    : this.host,
            port    : this.port,
            database: this.database,
            user    : this.username,
            password: this.password,
        }
        return new Client(configClient)
    }

    async closePgPool() {
        return await this.pgPool().end()
    }

    async closePgClient() {
        return await this.pgClient().end()
    }

    get dbUri(): string {
        return this.dbUrl;
    }

}

export function newDbPg(dbConfig: DbConfigType, options?: DbConnectionOptionsType) {
    return new DbPg(dbConfig, options);
}
