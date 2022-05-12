import {assertEquals, mcTest, postTestResult} from '@mconnect/mctest';
import {MyDb} from "./config";
import {
    CrudParamsType, CrudResultType, newDbPg, newDeleteRecord, newSaveRecord
} from "../src";
import {
    AuditCreateActionParams,
    AuditModel, AuditTable, AuditUpdateActionParams, AuditUpdateRecordById, AuditUpdateRecordByParam, CrudParamOptions,
    TestUserInfo, UpdateAuditById, UpdateAuditByIds, UpdateAuditByParams, UpdateTable
} from "./testData";

let myDb = MyDb
myDb.options = {}

const dbc = newDbPg(myDb, myDb.options);

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
            const resValue = res.value as CrudResultType
            assertEquals(res.code, "success", `create-task should return code: success`);
            assertEquals(resValue.recordIds.length, recLen, `response-value-records-length should be: ${recLen}`);
            assertEquals(resValue.recordsCount, recLen, `response-value-recordsCount should be: ${recLen}`);
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
            assertEquals(res.code, "success", `update-task should return code: success`);
            assertEquals(resValue.recordIds.length, recLen, `response-value-records-length should be: ${recLen}`);
            assertEquals(resValue.recordsCount, recLen, `response-value-recordsCount should be: ${recLen}`);
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
            assertEquals(res.code, "success", `update-by-id-task should return code: success`);
            assertEquals(resValue.recordIds.length, recLen, `response-value-records-length should be: ${recLen}`);
            assertEquals(resValue.recordsCount, recLen, `response-value-recordsCount should be: ${recLen}`);
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
            assertEquals(res.code, "success", `update-by-id-task should return code: success`);
            assertEquals(resValue.recordIds.length, recLen, `response-value-records-length should be: ${recLen}`);
            assertEquals(resValue.recordsCount, recLen, `response-value-recordsCount should be: ${recLen}`);
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
            const crud = newDeleteRecord(crudParams, CrudParamOptions);
            const res = await crud.deleteRecord()
            const resValue = res.value as CrudResultType
            assertEquals(res.code, "success", `create-task should return code: success`);
            assertEquals(resValue.recordIds.length > recLen, true, `response-value-records-length should be >: ${recLen}`);
            assertEquals(resValue.recordsCount > recLen, true, `response-value-recordsCount should be >: ${recLen}`);
        }
    });

    await postTestResult();

})();
