import {assertEquals, assertNotEquals, mcTest, postTestResult} from "@mconnect/mctest";
import {DbConfigType, newDbPg,} from "../src";
import {MyDb} from "./config";

// test-data: db-configuration settings
let myDb = MyDb
myDb.options = {}

const dbc = newDbPg(myDb, myDb.options)

const sqliteDb = {
    dbType  : "sqlite3",
    filename: "testdb.db",
} as DbConfigType

(async () => {
    await mcTest({
        name    : "should successfully connect to the PostgresDB - Client",
        testFunc: async () => {
            let pResult = false
            dbc.pgClient().connect().then(res => {
                console.log("pool-result: ", res)
                pResult = true
            }).catch(err => {
                console.log("client-error: ", err)
                pResult = false
            });
            assertEquals(pResult, true, `pool-result-connected: ${true}`);
        }
    });

    await mcTest({
        name    : "should successfully connect to the PostgresDB - Pool",
        testFunc: async () => {
            let pResult = false
            dbc.pgPool().connect().then(res => {
                console.log("pool-result: ", res)
                pResult = true
            }).catch(err => {
                console.log("client-error: ", err)
                pResult = false
            });
            assertEquals(pResult, true, `pool-result-connected: ${true}`);
        }
    });

    await postTestResult();
})();
