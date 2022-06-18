import {assertEquals, mcTest, postTestResult} from '@mconnect/mctest';
import {AuditDb, MyDb} from "./config";
import {
    CrudParamsType, CrudResultType, newDbPg, newSaveRecord
} from "../src";
import {
    AuditCreateActionParams,
    AuditModel, AuditTable, AuditUpdateActionParams, AuditUpdateRecordById, AuditUpdateRecordByParam, CrudParamOptions,
    TestUserInfo, UpdateAuditById, UpdateAuditByIds, UpdateAuditByParams, UpdateTable
} from "./testData";

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
    table      : AuditTable,
    userInfo   : TestUserInfo,
    recordIds  : [],
    queryParams: {},
};


(async () => {
    await mcTest({
        name    : 'should create two new records and return success:',
        testFunc: async () => {
            crudParams.table = UpdateTable
            crudParams.actionParams = AuditCreateActionParams
            crudParams.recordIds = []
            crudParams.queryParams = {}
            const recLen = crudParams.actionParams.length
            const crud = newSaveRecord(crudParams, CrudParamOptions);
            const res = await crud.saveRecord()
            // console.log("create-result: ", res, res.code, res.value.recordIds, res.value.recordCount)
            const resValue = res.value as CrudResultType
            const idLen = resValue.recordIds?.length || 0
            const recCount = resValue.recordsCount || 0
            assertEquals(res.code, "success", `create-task should return code: success`);
            assertEquals(idLen, recLen, `response-value-records-length should be: ${recLen}`);
            assertEquals(recCount, recLen, `response-value-recordsCount should be: ${recLen}`);
        }
    });

    await mcTest({
        name    : 'should update two existing records and return success:',
        testFunc: async () => {
            crudParams.table = UpdateTable
            crudParams.actionParams = AuditUpdateActionParams
            crudParams.recordIds = []
            crudParams.queryParams = {}
            const recLen = crudParams.actionParams.length
            const crud = newSaveRecord(crudParams, CrudParamOptions);
            const res = await crud.saveRecord()
            const resValue = res.value as CrudResultType
            const idLen = resValue.recordIds?.length || 0
            const recCount = resValue.recordsCount || 0
            assertEquals(res.code, "success", `update-task should return code: success`);
            assertEquals(idLen, recLen, `response-value-records-length should be: ${recLen}`);
            assertEquals(recCount, recLen, `response-value-recordsCount should be: ${recLen}`);
        }
    });

    await mcTest({
        name    : 'should update a record by Id and return success:',
        testFunc: async () => {
            crudParams.table = UpdateTable
            crudParams.actionParams = [AuditUpdateRecordById]
            crudParams.recordIds = [UpdateAuditById]
            crudParams.queryParams = {}
            const recLen = crudParams.recordIds.length
            const crud = newSaveRecord(crudParams, CrudParamOptions);
            const res = await crud.saveRecord()
            const resValue = res.value as CrudResultType
            const idLen = resValue.recordIds?.length || 0
            const recCount = resValue.recordsCount || 0
            assertEquals(res.code, "success", `update-by-id-task should return code: success`);
            assertEquals(idLen, recLen, `response-value-records-length should be: ${recLen}`);
            assertEquals(recCount, recLen, `response-value-recordsCount should be: ${recLen}`);
        }
    });

    await mcTest({
        name    : 'should update records by Ids and return success:',
        testFunc: async () => {
            crudParams.table = UpdateTable
            crudParams.actionParams = [AuditUpdateRecordById]
            crudParams.recordIds = UpdateAuditByIds
            crudParams.queryParams = {}
            const recLen = crudParams.recordIds.length
            const crud = newSaveRecord(crudParams, CrudParamOptions);
            const res = await crud.saveRecord()
            const resValue = res.value as CrudResultType
            const idLen = resValue.recordIds?.length || 0
            const recCount = resValue.recordsCount || 0
            assertEquals(res.code, "success", `update-by-id-task should return code: success`);
            assertEquals(idLen, recLen, `response-value-records-length should be: ${recLen}`);
            assertEquals(recCount, recLen, `response-value-recordsCount should be: ${recLen}`);
        }
    });

    await mcTest({
        name    : 'should update records by query-params and return success:',
        testFunc: async () => {
            crudParams.table = UpdateTable
            crudParams.actionParams = [AuditUpdateRecordByParam]
            crudParams.recordIds = []
            crudParams.queryParams = UpdateAuditByParams
            const recLen = 0
            const crud = newSaveRecord(crudParams, CrudParamOptions);
            const res = await crud.saveRecord()
            const resValue = res.value as CrudResultType
            const recCount = resValue.recordsCount || 0
            assertEquals(res.code, "success", `create-task should return code: success`);
            assertEquals(recCount > recLen, true, `response-value-recordsCount should be >: ${recLen}`);
        }
    });

    await postTestResult();
    await dbc.closePgPool()

})();
