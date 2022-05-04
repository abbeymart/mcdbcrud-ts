/**
 * @Author: abbeymart | Abi Akindele | @Created: 2020-08-07
 * @Company: Copyright 2020 Abi Akindele  | mConnect.biz
 * @License: All Rights Reserved | LICENSE.md
 * @Description: check-db connection / handle
 */

import { getResMessage, ResponseMessage } from "@mconnect/mcresponse";
import { DbType } from "./types";
import { PoolClient } from "pg";

export function checkDb(db: DbType): ResponseMessage {
    if (db) {
        return getResMessage("success", {
            message: "valid database",
        });
    } else {
        return getResMessage("validateError", {
            message: "valid database is required",
        });
    }
}

export function checkDbConnection(dbConnect: PoolClient): ResponseMessage {
    if (dbConnect) {
        return getResMessage("success", {
            message: "valid database connection/handler",
        });
    } else {
        return getResMessage("validateError", {
            message: "valid database connection/handler is required",
        });
    }
}
