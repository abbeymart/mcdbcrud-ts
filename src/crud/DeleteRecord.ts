/**
 * @Author: abbeymart | Abi Akindele | @Created: 2020-04-05 | @Updated: 2020-05-16
 * Updated 2018-04-08, prototype-to-class
 * @Company: mConnect.biz | @License: MIT
 * @Description: delete one or more records / documents by recordIds or queryParams
 */

// Import required module/function(s)
import { getResMessage, ResponseMessage } from "@mconnect/mcresponse";
import { deleteHashCache } from "@mconnect/mccache";
import { Crud } from "./Crud";
import { CrudOptionsType, CrudParamsType, LogRecordsType, TaskTypes } from "./types";
import { isEmptyObject } from "./utils";
import {
    computeDeleteQueryById,
    computeDeleteQueryByIds,
    computeDeleteQueryByParam
} from "./helpers/computeDeleteQuery";

class DeleteRecord extends Crud {
    constructor(params: CrudParamsType, options: CrudOptionsType = {}) {
        super(params, options);
        // Set specific instance properties
        this.currentRecs = [];
    }

    async deleteRecord(): Promise<ResponseMessage> {
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

        // delete / remove item(s) by recordId(s)
        if (this.recordIds && this.recordIds.length > 0) {
            try {
                // check task-permission
                if (this.checkAccess) {
                    const accessRes = await this.taskPermissionById(TaskTypes.DELETE)
                    if (accessRes.code != "success") {
                        return accessRes
                    }
                }
                // check if records exist, for delete and audit-log
                if (this.logUpdate) {
                    const recExist = await this.getCurrentRecords("id");
                    if (recExist.code !== "success") {
                        return recExist;
                    }
                }
                // delete/remove records
                if (this.recordIds.length === 1) {
                    return await this.removeRecordById();
                }
                return await this.removeRecordByIds();
            } catch (error) {
                return getResMessage("removeError", {
                    message: error.message ? error.message : "Error removing record(s)",
                    value  : {
                        queryParams: this.queryParams,
                        recordIds  : this.recordIds,
                    },
                });
            }
        }

        // delete / remove item(s) by queryParams
        if (this.queryParams && !isEmptyObject(this.queryParams)) {
            try {
                // check task-permission
                if (this.checkAccess) {
                    const accessRes = await this.taskPermissionByParams(TaskTypes.DELETE)
                    if (accessRes.code != "success") {
                        return accessRes
                    }
                }
                if (this.logUpdate) {
                    const recExist = await this.getCurrentRecords("queryParams");
                    if (recExist.code !== "success") {
                        return recExist;
                    }
                }
                // delete/remove records
                return await this.removeRecordByParams();
            } catch (error) {
                return getResMessage("removeError", {
                    message: error.message,
                    value  : {
                        queryParams: this.queryParams,
                        recordIds  : this.recordIds,
                    },
                });
            }
        }

        // could not remove document
        return getResMessage("removeError", {
            value  : {
                queryParams: this.queryParams,
                recordIds  : this.recordIds,
            },
            message: "Unable to perform the requested action(s), due to incomplete/incorrect delete conditions - by recordIds or queryParams only. ",
        });
    }

    async removeRecordById(): Promise<ResponseMessage> {
        // create a transaction session
        const client = await this.appDb.connect()
        try {
            // trx starts
            const {deleteQueryObject, ok, message} = computeDeleteQueryById(this.table, this.recordIds[0])
            if (!ok) {
                return getResMessage("removeError", {
                    message: message,
                    value  : {
                        queryParams: this.queryParams,
                        recordIds  : this.recordIds,
                        deleteQuery: deleteQueryObject.deleteQuery,
                        fieldValues: deleteQueryObject.fieldValues,
                    },
                })
            }
            const res = await client.query(deleteQueryObject.deleteQuery, deleteQueryObject.fieldValues)
            // trx ends
            if (res.rowCount > 0) {
                // delete cache
                deleteHashCache(this.cacheKey, this.table);
                // check the audit-log settings - to perform audit-log
                let logRes = {};
                if (this.logDelete) {
                    const logRecs: LogRecordsType = {logRecords: this.currentRecs}
                    logRes = await this.transLog.deleteLog(this.table, logRecs, this.userId);
                }
                return getResMessage("success", {
                    message: "Document/record deleted successfully",
                    value  : {
                        recordCount: res.rowCount,
                        logRes,
                    }
                });
            } else {
                return getResMessage("removeError", {
                    message: "No record(s) deleted",
                    value  : {
                        queryParams: this.queryParams,
                        recordIds  : this.recordIds,
                        deleteQuery: deleteQueryObject.deleteQuery,
                        fieldValues: deleteQueryObject.fieldValues,
                    },
                });
            }
        } catch (e) {
            // await client.query("ROLLBACK")
            return getResMessage("removeError", {
                message: `Error removing/deleting record(s): ${e.message ? e.message : ""}`,
                value  : {
                    queryParams: this.queryParams,
                    recordIds  : this.recordIds,
                },
            });
        } finally {
            client?.release();
        }
    }

    async removeRecordByIds(): Promise<ResponseMessage> {
        // create a transaction session
        const client = await this.appDb.connect()
        try {
            // trx starts
            const {deleteQueryObject, ok, message} = computeDeleteQueryByIds(this.table, this.recordIds)
            if (!ok) {
                return getResMessage("removeError", {
                    message: message,
                    value  : {
                        queryParams: this.queryParams,
                        recordIds  : this.recordIds,
                        deleteQuery: deleteQueryObject.deleteQuery,
                        fieldValues: deleteQueryObject.fieldValues,
                    },
                })
            }
            const res = await client.query(deleteQueryObject.deleteQuery, deleteQueryObject.fieldValues)
            // trx ends
            if (res.rowCount > 0) {
                // delete cache
                deleteHashCache(this.cacheKey, this.table);
                // check the audit-log settings - to perform audit-log
                let logRes = {};
                if (this.logDelete) {
                    const logRecs: LogRecordsType = {logRecords: this.currentRecs}
                    logRes = await this.transLog.deleteLog(this.table, logRecs, this.userId);
                }
                return getResMessage("success", {
                    message: "Document/record deleted successfully",
                    value  : {
                        recordCount: res.rowCount,
                        logRes,
                    }
                });
            } else {
                return getResMessage("removeError", {
                    message: "No record(s) deleted",
                    value  : {
                        queryParams: this.queryParams,
                        recordIds  : this.recordIds,
                        deleteQuery: deleteQueryObject.deleteQuery,
                        fieldValues: deleteQueryObject.fieldValues,
                    },
                });
            }
        } catch (e) {
            // await client.query("ROLLBACK")
            return getResMessage("removeError", {
                message: `Error removing/deleting record(s): ${e.message ? e.message : ""}`,
                value  : {
                    queryParams: this.queryParams,
                    recordIds  : this.recordIds,
                },
            });
        } finally {
            client?.release();
        }
    }

    async removeRecordByParams(): Promise<ResponseMessage> {
        // create a transaction session
        const client = await this.appDb.connect()
        try {
            if (this.queryParams && !isEmptyObject(this.queryParams)) {
                // trx starts
                const {deleteQueryObject, ok, message} = computeDeleteQueryByParam(this.table, this.queryParams)
                if (!ok) {
                    return getResMessage("removeError", {
                        message: message,
                        value  : {
                            queryParams      : this.queryParams,
                            recordIds        : this.recordIds,
                            deleteQueryObject: deleteQueryObject,
                            fieldValues      : deleteQueryObject.fieldValues,
                        },
                    })
                }
                const res = await client.query(deleteQueryObject.deleteQuery, deleteQueryObject.fieldValues)
                // trx ends
                if (res.rowCount > 0) {
                    // delete cache
                    deleteHashCache(this.cacheKey, this.table);
                    // check the audit-log settings - to perform audit-log
                    let logRes = {};
                    if (this.logDelete) {
                        const logRecs: LogRecordsType = {logRecords: this.currentRecs}
                        logRes = await this.transLog.deleteLog(this.table, logRecs, this.userId);
                    }
                    return getResMessage("success", {
                        message: "Document/record deleted successfully",
                        value  : {
                            recordCount: res.rowCount,
                            logRes,
                        }
                    });
                } else {
                    return getResMessage("removeError", {
                        message: "No record(s) deleted",
                        value  : {
                            queryParams: this.queryParams,
                            recordIds  : this.recordIds,
                            deleteQuery: deleteQueryObject.deleteQuery,
                            fieldValues: deleteQueryObject.fieldValues,
                            res        : res,
                        },
                    });
                }
            } else {
                return getResMessage("removeError", {
                    message: "Unable to delete record(s), due to missing queryParams",
                    value  : {
                        queryParams: this.queryParams,
                        recordIds  : this.recordIds,
                    },
                });
            }
        } catch (e) {
            // await client.query("ROLLBACK")
            return getResMessage("removeError", {
                message: `Error removing/deleting record(s): ${e.message ? e.message : ""}`,
                value  : {
                    queryParams: this.queryParams,
                    recordIds  : this.recordIds,
                },
            });
        } finally {
            client?.release();
        }
    }
}

// factory function/constructor
function newDeleteRecord(params: CrudParamsType, options: CrudOptionsType = {}) {
    return new DeleteRecord(params, options);
}

export { DeleteRecord, newDeleteRecord };