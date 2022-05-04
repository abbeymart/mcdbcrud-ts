/**
 * @Author: abbeymart | Abi Akindele | @Created: 2020-07-11
 * @Company: Copyright 2020 Abi Akindele  | mConnect.biz
 * @License: All Rights Reserved | LICENSE.md
 * @Description: mc: check-error testing
 */

// import mctest from "@mconnect/mctest";
import { assertEquals, assertNotEquals, mcTest, postTestResult } from "@mconnect/mctest";
import { Status, getResMessage } from "../src";

let msgType = 'checkError',
    options = {
        value  : '',
        code   : '',
        message: '',
    },
    res = {
        code      : 'paramsError',
        resCode   : Status.NotAcceptable,
        resMessage: 'Not Acceptable',
        value     : '',
        message   : 'Parameters checking error',
    };

(async () => {
    await mcTest({
        name    : 'should return paramsError code for checkError-message',
        testFunc: () => {
            const req = getResMessage(msgType, options);
            assertEquals(res.code, req.code, `response-code should be: ${res.code}`);
            assertNotEquals(req.code, 'unAuthorized');
        }
    });

    await mcTest({
        name    : 'should return NOT_ACCEPTABLE/406 resCode',
        testFunc: () => {
            const req = getResMessage(msgType, {});
            assertEquals(res.resCode, req.resCode, `resCode should be: ${res.resCode}`);
            assertEquals(res.resMessage, req.resMessage, `resCode should be: ${res.resMessage}`);
        }
    });

    await mcTest({
        name    : 'should return Parameters checking error message',
        testFunc: () => {
            const req = getResMessage(msgType, options);
            assertEquals(res.message, req.message, `message should be: ${res.message}`);
        }
    });

    await postTestResult();
})();
