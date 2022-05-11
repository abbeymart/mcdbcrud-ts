import {assertEquals, assertNotEquals, mcTest, postTestResult} from '@mconnect/mctest';
import {Status, getResMessage} from '@mconnect/mcresponse';
import {MyDb} from "./config";
import {CrudParamsType, newDbPg, newGetRecord} from "../src";
import {CrudParamOptions, GetTable, TestUserInfo, AuditModel} from "./testData";

let msgType = 'success',
    options = {
        value  : ['a', 'b', 'c'],
        code   : '',
        message: '',
    },
    res = {
        code      : 'success',
        resCode   : Status.OK,
        resMessage: 'OK',
        value     : '',
        message   : 'Request completed successfully',
    };

let myDb = MyDb
myDb.options = {}

const dbc = newDbPg(myDb, myDb.options);

const crudParams: CrudParamsType = {
    appDb      : dbc.pgPool(),
    modelRef   : AuditModel,
    table      : GetTable,
    userInfo   : TestUserInfo,
    recordIds  : [],
    queryParams: {},
}
const crud = newGetRecord(crudParams, CrudParamOptions);

(async () => {
    await mcTest({
        name    : 'should return success code for success-message',
        testFunc: () => {
            const req = getResMessage(msgType, options);
            assertEquals(res.code, req.code, `response-code should be: ${res.code}`);
            assertNotEquals(req.code, 'unAuthorized');
        }
    });

    await mcTest({
        name    : 'should return ok/200 resCode for success-message',
        testFunc: () => {
            const req = getResMessage(msgType);
            assertEquals(res.resCode, req.resCode, `resCode should be: ${res.resCode}`);
            assertEquals(res.resMessage, req.resMessage, `resCode should be: ${res.resMessage}`);
        }
    });

    await postTestResult();

})();
