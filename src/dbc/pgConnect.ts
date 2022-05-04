import { Pool, Client } from "pg";
import { DbSecureType, DbOptionsType, DbParamsType } from "./types";

export class DbPg {
    private readonly host: string;
    private readonly username: string;
    private readonly password: string;
    private readonly database: string;
    private readonly location: string;
    private readonly port: number;
    private readonly poolSize: number;
    private readonly secureOption: DbSecureType;
    private readonly options: DbOptionsType;
    private readonly checkAccess: boolean;
    private readonly dbUrl: string;

    constructor(dbConfig: DbParamsType, options?: DbOptionsType) {
        this.host = dbConfig?.host || "";
        this.username = dbConfig?.username || "";
        this.password = dbConfig?.password || "";
        this.database = dbConfig?.database || "";
        this.location = dbConfig?.location || "";
        this.port = Number(dbConfig?.port) || 5432;
        this.poolSize = dbConfig?.poolSize || 20;
        this.secureOption = dbConfig?.secureOption || {secureAccess: false, secureCert: "", secureKey: ""};
        this.checkAccess = options?.checkAccess !== false;
        this.dbUrl = `postgresql://${this.username}:${this.password}@${this.host}:${this.port}/${this.database}`
        this.options = {
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

    pgClientTest() {
        // try / check pgDB connection, usually for multiple queries / transaction
        (async () => {
            const client = await this.pgPool().connect();
            try {
                console.log(`PostgresDB connected: ${this.host}:${this.port}/${this.database}`);
                const res = await client.query('SELECT NOW() as now');
                console.log('pgSQL-test-pgPoolClient-query-result: ', res.rows[0]);
            } finally {
                if (client) await client.release();
                console.log('pgSQL-test-pgPoolClient-query connection released');
            }
        })().catch(error => {
            // catches all errors within the async function, client and try-block
            console.error('Postgres-DB connect/query error:' + error.stack);
        });
    }

    pgPoolTest() {
        // try / check pgDB connection, preferably for single query operation, removes the risk of leaking a client
        (async () => {
            try {
                console.log(`PostgresDB connected: ${this.host}:${this.port}/${this.database}`);
                const res = await this.pgPool().query('SELECT NOW() as now');
                console.log('pgSQL-test-pgPool-query(1)-result: ', res.rows[0]);
            } finally {
                console.log('pgSQL-test-pgPool-query(1) connection released');
            }
        })().catch(error => {
            // catches all errors within the async function, client and try-block
            console.error('Postgres-DB, pgPool, connect/query error:' + error.stack);
        });
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

export function newDbPg(dbConfig: DbParamsType, options?: DbOptionsType) {
    return new DbPg(dbConfig, options);
}
