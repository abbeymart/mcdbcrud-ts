import {assertEquals, assertNotEquals, mcTest, postTestResult} from '@mconnect/mctest';
import {AuditDb, MyDb} from "./config";
import { CrudParamsType, GetResultType, newDbPg, newGetRecord, newGetRecordStream } from "../src";
import {
    CrudParamOptions, GetTable, TestUserInfo, AuditModel, GetAuditById, GetAuditByIds, GetAuditByParams
} from "./testData";
import { QueryResult } from "pg";

let myDb = MyDb
myDb.options = {}

let aDb = AuditDb
aDb.options = {}

const dbc = newDbPg(myDb, myDb.options);
const auditDbc = newDbPg(aDb, aDb.options)
CrudParamOptions.auditDb = auditDbc.pgPool()

const crudParams: CrudParamsType = {
    appDb      : dbc.pgPool(),
    modelRef   : AuditModel,
    table      : GetTable,
    userInfo   : TestUserInfo,
    recordIds  : [],
    queryParams: {},
};

(async () => {
    await mcTest({
        name    : 'should get 20 records via cursor/stream and return success:',
        testFunc: async () => {
            crudParams.table = GetTable
            crudParams.recordIds = []
            crudParams.queryParams = {}
            crudParams.limit = 20
            CrudParamOptions.getAllRecords = true
            const crud = newGetRecordStream(crudParams, CrudParamOptions);
            const res = await crud.getRecord()
            console.log("res: ", res)
            if (res.ok) {
                assertEquals(res.message, "success", `response-message should be: success`);
                assertEquals(res.ok, true, `response confirmation: true`);
                await res.cursor?.read(20, (err, rows) => {
                    console.log("error: ", err)
                    assertEquals(rows.length > 20, true, `response-value-records-length should be: > 20`);
                })
            } else {
                assertEquals(res.message, "success", `response-message should be: success`);
                assertEquals(res.ok, true, `response confirmation: true`);
            }
        }
    })

    await postTestResult();
    await dbc.closePgPool();
    await auditDbc.closePgPool();
    process.exit(0);

})();
