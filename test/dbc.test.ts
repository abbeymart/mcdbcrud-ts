import {assertEquals, mcTest, postTestResult} from "@mconnect/mctest";
import {newDbPg,} from "../src";
import {MyDb} from "./config";
import {PoolClient} from "pg";

// test-data: db-configuration settings
let myDb = MyDb
myDb.options = {}

const dbc = newDbPg(myDb, myDb.options);

// const sqliteDb = {
//     dbType  : "sqlite3",
//     filename: "testdb.db",
// } as DbConfigType;

(async () => {
    await mcTest({
        name    : "should successfully connect to the PostgresDB - Client",
        testFunc: async () => {
            let pResult = false
            try {
                await dbc.pgClient().connect()
                console.log("dbc-client-connected: ")
                pResult = true
            } catch (e) {
                console.log("dbc-client-connection-error: ", e)
                pResult = false
            } finally {
                await dbc.closePgClient()
            }
            assertEquals(pResult, true, `client-result-connected: ${true}`);
        }
    });

    await mcTest({
        name    : "should successfully connect to the PostgresDB - Pool",
        testFunc: async () => {
            let pResult = false
            let dbcPool: PoolClient
            try {
                dbcPool = await dbc.pgPool().connect()
                console.log("pool-client--connected: ", dbcPool)
                pResult = true
            } catch (e) {
                console.log("pool-client-connect-error: ", e)
                pResult = false
            } finally {
                await dbc.closePgPool()
            }
            assertEquals(pResult, true, `pool-result-connected: ${true}`);
        }
    });

    await postTestResult();

})();
