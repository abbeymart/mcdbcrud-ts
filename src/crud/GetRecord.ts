/**
 * @Author: abbeymart | Abi Akindele | @Created: 2020-04-05 | @Updated: 2020-05-16
 * @Company: mConnect.biz | @License: MIT
 * @Description: get records, by recordIds, queryParams, all | cache-in-memory
 */

// Import required module(s)
import { getHashCache, setHashCache } from "@mconnect/mccache";
import { getResMessage, ResponseMessage } from "@mconnect/mcresponse";
import { Crud } from "./Crud";
import { CheckAccessType, CrudOptionsType, CrudParamsType, GetResultType, LogRecordsType, TaskTypes } from "./types";
import { isEmptyObject } from "./utils";

class GetRecord extends Crud {
    constructor(params: CrudParamsType, options: CrudOptionsType = {}) {
        super(params, options);
        // Set specific instance properties
    }

    async getRecord(): Promise<ResponseMessage> {
        // Check/validate the attributes / parameters
        const dbCheck = this.checkDb(this.appDb);
        if (dbCheck.code !== "success") {
            return dbCheck;
        }
        const auditDbCheck = this.checkDb(this.auditDb);
        if (auditDbCheck.code !== "success") {
            return auditDbCheck;
        }
        const accessDbCheck = this.checkDb(this.accessDb);
        if (accessDbCheck.code !== "success") {
            return accessDbCheck;
        }

        // set maximum limit and default values per query
        if (this.limit < 1) {
            this.limit = 1;
        } else if (this.limit > this.maxQueryLimit) {
            this.limit = this.maxQueryLimit;
        }
        if (this.skip < 0) {
            this.skip = 0;
        }

        // check read permission
        // let roleServices: RoleServiceResponseType;

        // check the audit-log settings - to perform audit-log (read/search info - params, keywords etc.)
        let logRes: ResponseMessage;
        if ((this.logRead || this.logCrud) && this.queryParams && !isEmptyObject(this.queryParams)) {
            const logRecs: LogRecordsType = {logRecords: this.queryParams}
            logRes = await this.transLog.readLog(this.table, logRecs, this.userId);
        } else if ((this.logRead || this.logCrud) && this.recordIds && this.recordIds.length > 0) {
            const logRecs: LogRecordsType = {logRecords: this.recordIds}
            logRes = await this.transLog.readLog(this.table, logRecs, this.userId);
        } else {
            const logRecs: LogRecordsType = {logRecords: "all"}
            logRes = await this.transLog.readLog(this.table, logRecs, this.userId);
        }

        // check cache for matching record(s), and return if exist
        try {
            const cacheRes = await getHashCache(this.cacheKey, this.table);
            if (cacheRes && cacheRes.value) {
                console.log("cache-items-before-query: ", cacheRes.value.records[0]);
                return getResMessage("success", {
                    value  : cacheRes.value,
                    message: "from cache",
                });
            }
        } catch (e) {
            console.error("error from the cache: ", e.stack);
        }

        // Get the item(s) by recordId(s), queryParams or all items
        if (this.recordIds && this.recordIds.length > 0) {
            try {
                // check task-permission
                if (this.checkAccess) {
                    const accessRes = await this.taskPermissionById(TaskTypes.READ)
                    if (accessRes.code != "success") {
                        return accessRes
                    }
                }
                const res = await this.getCurrentRecords("id")
                if (res.code === "success") {
                    // save copy in the cache
                    const resultValue: GetResultType = {
                        records: res.value.records,
                        stats  : res.value.stats,
                        logRes,
                    }
                    setHashCache(this.cacheKey, this.table, resultValue, this.cacheExpire);
                    return getResMessage("success", {
                        value: resultValue,
                    });
                }
                return getResMessage("notFound", {
                    message: res.message,
                    value  : res,
                });
            } catch (error) {
                return getResMessage("notFound", {
                    value  : error,
                    message: error.message,
                });
            }
        }
        if (this.queryParams && Object.keys(this.queryParams).length > 0) {
            try {
                // check task-permission
                if (this.checkAccess) {
                    const accessRes = await this.taskPermissionByParams(TaskTypes.READ)
                    if (accessRes.code != "success") {
                        return accessRes
                    }
                }
                const res = await this.getCurrentRecords("queryParams")
                if (res.code === "success") {
                    // save copy in the cache
                    const resultValue: GetResultType = {
                        records: res.value.records,
                        stats  : res.value.stats,
                        logRes,
                    }
                    setHashCache(this.cacheKey, this.table, resultValue, this.cacheExpire);
                    return getResMessage("success", {
                        value: resultValue,
                    });
                }
                return getResMessage("notFound", {
                    message: res.message,
                    value  : res,
                });
            } catch (error) {
                return getResMessage("notFound", {
                    value: error,
                });
            }
        }
        // check login-status
        if (this.checkAccess) {
            const accessRes = await this.checkLoginStatus()
            const userRec: CheckAccessType = accessRes.value;
            // get all records, up to the permissible limit - admin-user only
            if (userRec.isAdmin && userRec.isActive) {
                try {
                    const res = await this.getCurrentRecords()
                    if (res.code === "success") {
                        // save copy in the cache
                        const resultValue: GetResultType = {
                            records: res.value.records,
                            stats  : res.value.stats,
                            logRes,
                        }
                        setHashCache(this.cacheKey, this.table, resultValue, this.cacheExpire);
                        return getResMessage("success", {
                            value: resultValue,
                        });
                    }
                    return getResMessage("notFound", {
                        message: res.message,
                        value  : res,
                    });
                } catch (error) {
                    return getResMessage("notFound", {
                        value: error,
                    });
                }
            }
            // get records by ownership, createdBy
            if (userRec.userId && userRec.isActive) {
                try {
                    this.queryParams = {
                        "createdBy": userRec.userId,
                    }
                    const res = await this.getCurrentRecords("queryParams")
                    if (res.code === "success") {
                        // save copy in the cache
                        const resultValue: GetResultType = {
                            records: res.value.records,
                            stats  : res.value.stats,
                            logRes,
                        }
                        setHashCache(this.cacheKey, this.table, resultValue, this.cacheExpire);
                        return getResMessage("success", {
                            value: resultValue,
                        });
                    }
                    return getResMessage("notFound", {
                        message: res.message,
                        value  : res,
                    });
                } catch (error) {
                    return getResMessage("notFound", {
                        value: error,
                    });
                }
            }
        }
        if (this.getAllRecords) {
            try {
                const res = await this.getCurrentRecords()
                if (res.code === "success") {
                    // save copy in the cache
                    const resultValue: GetResultType = {
                        records: res.value.records,
                        stats  : res.value.stats,
                        logRes,
                    }
                    // setHashCache(this.cacheKey, this.table, resultValue, this.cacheExpire);
                    return getResMessage("success", {
                        value: resultValue,
                    });
                }
                return getResMessage("notFound", {
                    message: res.message,
                    value  : res,
                });
            } catch (error) {
                return getResMessage("notFound", {
                    value: error,
                });
            }
        }
        return getResMessage("notFound", {
            value: {},
        });
    }
}

// factory function/constructor
function newGetRecord(params: CrudParamsType, options: CrudOptionsType = {}) {
    return new GetRecord(params, options);
}

export { GetRecord, newGetRecord };
