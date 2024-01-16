/**
 * @Author: abbeymart | Abi Akindele | @Created: 2020-07-24
 * @Company: Copyright 2020 Abi Akindele  | mConnect.biz
 * @License: All Rights Reserved | LICENSE.md
 * @Description: save-record(s) (create/insert and update record(s))
 */

// Import required module/function(s)
import { getResMessage, ResponseMessage } from "@mconnect/mcresponse";
import { deleteHashCache, QueryHashCacheParamsType } from "@mconnect/mccache";
import { Crud } from "./Crud";
import {
    ActionParamsType,
    ActionParamTaskType, ActionParamType, AuditLogOptionsType,
    CrudOptionsType,
    CrudParamsType, excludeEmptyIdFields, LogRecordsType,
    ModelOptionsType,
    TaskTypes
} from "..";
import { isEmptyObject } from "./validate";
import {
    computeCreateQuery,
    computeUpdateQuery,
    computeUpdateQueryById,
    computeUpdateQueryByIds,
    computeUpdateQueryByParam
} from "./helpers";

class SaveRecord extends Crud {
    protected modelOptions: ModelOptionsType;

    constructor(params: CrudParamsType, options: CrudOptionsType = {}) {
        super(params, options);
        // Set specific instance properties
        this.modelOptions = options?.modelOptions && !isEmptyObject(options.modelOptions) ? options.modelOptions : {
            activeStamp: false,
            actorStamp : false,
            timeStamp  : false,
        }
    }

    async saveRecord(): Promise<ResponseMessage> {
        // Check/validate the databases
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

        // clean actionParams of empty-id-values
        this.actionParams = excludeEmptyIdFields(this.actionParams)

        // determine update / create (new) items from actionParams
        const {recordIds} = await this.computeItems();
        // validate createItems and updateItems
        if (this.createItems.length > 0 && this.updateItems.length > 0) {
            return getResMessage("paramsError", {
                message: "You may only create or update record(s), not both at the same time.",
                value  : {},
            });
        }
        if (this.createItems.length < 1 && this.updateItems.length < 1 && this.actionParams.length < 1) {
            return getResMessage("paramsError", {
                message: "Valid action-params required for create or update task.",
                value  : {},
            });
        }

        // check task-type:
        this.taskType = this.checkTaskType()
        if (this.taskType === TaskTypes.UNKNOWN) {
            return getResMessage("paramsError", {
                message: `Task-type[${TaskTypes.UNKNOWN}]: valid actionParams required to complete create or update tasks.`,
                value  : {},
            });
        }
        // create records/document(s)
        if (this.taskType === TaskTypes.CREATE && this.createItems.length > 0) {
            try {
                // check task-permission
                if (this.checkAccess) {
                    const accessRes = await this.checkTaskAccess(this.userInfo)
                    if (accessRes.code != "success") {
                        return accessRes
                    }
                }
                // create records
                return await this.createRecord();
            } catch (e) {
                return getResMessage("insertError", {
                    message: "Error-inserting/creating new record.",
                });
            }
        }

        // update records/document(s), batch/multiple updates
        if (this.taskType === TaskTypes.UPDATE && this.updateItems.length > 0) {
            // update the instance-recordsIds
            if (recordIds.length > 0) {
                this.recordIds = recordIds
            }
            // check task-permission
            if (this.checkAccess) {
                const accessRes = await this.taskPermissionById(this.taskType)
                if (accessRes.code != "success") {
                    return accessRes
                }
            }
            // check currentRecords
            if (this.logUpdate || this.logCrud) {
                const currentRec = await this.getCurrentRecords("id");
                if (currentRec.code !== "success") {
                    return currentRec;
                }
            }
            return await this.updateRecord()
        }

        // update existing records/document(s), by recordIds
        if (this.taskType === TaskTypes.UPDATE && this.actionParams.length === 1 && this.recordIds.length > 0) {
            try {
                // check task-permission
                if (this.checkAccess) {
                    const accessRes = await this.taskPermissionById(this.taskType)
                    if (accessRes.code != "success") {
                        return accessRes
                    }
                }
                // check currentRecords
                if (this.logUpdate || this.logCrud) {
                    const currentRec = await this.getCurrentRecords("id");
                    if (currentRec.code !== "success") {
                        return currentRec;
                    }
                }
                // update records
                return await this.updateRecordById();
            } catch (e) {
                return getResMessage("updateError", {
                    message: `Error updating record(s): ${e.message ? e.message : ""}`,
                });
            }
        }

        // update records/document(s) by queryParams: recommended for admin user only
        if (this.taskType === TaskTypes.UPDATE && this.actionParams.length === 1 && !isEmptyObject(this.queryParams)) {
            try {
                // check task-permission
                if (this.checkAccess) {
                    const accessRes = await this.taskPermissionByParams(this.taskType)
                    if (accessRes.code != "success") {
                        return accessRes
                    }
                }
                // check currentRecords
                if (this.logUpdate || this.logCrud) {
                    const currentRec = await this.getCurrentRecords("queryparams");
                    if (currentRec.code !== "success") {
                        return currentRec;
                    }
                }
                // update records
                return await this.updateRecordByParams();
            } catch (e) {
                return getResMessage("updateError", {
                    message: `Error updating record(s): ${e.message ? e.message : ""}`,
                });
            }
        }

        // return save-error message
        return getResMessage("saveError", {
            message: "Error performing the requested operation(s). Please retry",
        });
    }

    // helper methods:
    checkTaskType(): string {
        let taskType = TaskTypes.UNKNOWN
        if (this.createItems.length > 0) {
            taskType = TaskTypes.CREATE
        } else if (this.updateItems.length > 0) {
            taskType = TaskTypes.UPDATE
        } else if (this.actionParams.length === 1) {
            const actParam = this.actionParams[0]
            if (!actParam["id"] || actParam["id"] === "") {
                if (this.recordIds?.length > 0 || !isEmptyObject(this.queryParams)) {
                    taskType = TaskTypes.UPDATE
                } else {
                    taskType = TaskTypes.CREATE
                }
            } else {
                taskType = TaskTypes.UPDATE
            }
        }
        return taskType
    }

    async computeItems(modelOptions: ModelOptionsType = this.modelOptions): Promise<ActionParamTaskType> {
        let updateItems: ActionParamsType = [],
            createItems: ActionParamsType = [],
            recordIds: Array<string> = [];

        // cases - actionParams.length === 1 OR > 1
        if (this.actionParams.length === 1) {
            let item = this.actionParams[0]
            if (!item["id"]) {
                if (this.recordIds.length > 0 || !isEmptyObject(this.queryParams)) {
                    // update existing record(s), by recordIds or queryParams
                    if (modelOptions.actorStamp) {
                        item["updatedBy"] = this.userId;
                    }
                    if (modelOptions.timeStamp) {
                        item["updatedAt"] = new Date();
                    }
                    if (modelOptions.activeStamp && item.isActive === undefined) {
                        item["isActive"] = modelOptions.activeStamp;
                    }
                } else {
                    // create new record
                    // exclude any traces/presence of id, especially without concrete value ("", null, undefined)
                    const {id, ...itemRec} = item;
                    if (modelOptions.actorStamp) {
                        itemRec["createdBy"] = this.userId;
                    }
                    if (modelOptions.timeStamp) {
                        itemRec["createdAt"] = new Date();
                    }
                    if (modelOptions.activeStamp && itemRec.isActive === undefined) {
                        itemRec["isActive"] = modelOptions.activeStamp;
                    }
                    createItems.push(itemRec);
                }
            } else {
                // update existing document/record, by recordId
                this.recordIds = [];
                this.queryParams = {};
                recordIds.push(item["id"] as string)
                if (modelOptions.actorStamp) {
                    item["updatedBy"] = this.userId;
                }
                if (modelOptions.timeStamp) {
                    item["updatedAt"] = new Date();
                }
                if (modelOptions.activeStamp && item.isActive === undefined) {
                    item["isActive"] = modelOptions.activeStamp;
                }
                updateItems.push(item);
            }
        } else if (this.actionParams.length > 1) {
            // multiple/batch creation or update of document/records
            this.recordIds = [];
            this.queryParams = {};
            for (const item of this.actionParams) {
                if (item["id"]) {
                    // update existing document/record
                    if (modelOptions.actorStamp) {
                        item["updatedBy"] = this.userId;
                    }
                    if (modelOptions.timeStamp) {
                        item["updatedAt"] = new Date();
                    }
                    if (modelOptions.activeStamp && item.isActive === undefined) {
                        item["isActive"] = modelOptions.activeStamp;
                    }
                    recordIds.push(item["id"] as string)
                    updateItems.push(item);
                } else {
                    // create new document/record
                    // exclude any traces/presence of id, especially without concrete value ("", null, undefined)
                    const {id, ...itemRec} = item;
                    if (modelOptions.actorStamp) {
                        itemRec["createdBy"] = this.userId;
                    }
                    if (modelOptions.timeStamp) {
                        itemRec["createdAt"] = new Date();
                    }
                    if (modelOptions.activeStamp && itemRec.isActive === undefined) {
                        itemRec["isActive"] = modelOptions.activeStamp;
                    }
                    createItems.push(itemRec);
                }
            }
        }
        this.createItems = createItems;
        this.updateItems = updateItems;
        return {
            createItems,
            updateItems,
            recordIds: recordIds,
        };
    }

    async createRecord(): Promise<ResponseMessage> {
        // validate actionParams
        if (this.createItems.length < 1) {
            return getResMessage("insertError", {
                message: "Unable to create new record(s), due to incomplete/incorrect input-parameters. ",
            });
        }
        // create a transaction session
        const client = await this.appDb.connect()
        try {
            // insert/create multiple records and audit-log
            let recordsCount = 0
            let recordIds: Array<string> = []
            const {createQueryObject, ok, message} = computeCreateQuery(this.table, this.createItems)
            if (!ok) {
                return getResMessage("saveError", {
                    message: message,
                    value  : {
                        createQuery : createQueryObject.createQuery,
                        fieldValues1: [...createQueryObject.fieldValues[0]],
                    }
                })
            }
            // trx starts | include returning id for each insert
            await client.query("BEGIN")
            for await (const values of createQueryObject.fieldValues) {
                const res = await client.query(createQueryObject.createQuery, values)
                if (res.rowCount && res.rowCount > 0 && res.rows[0].id) {
                    recordIds.push(res.rows[0].id)
                } else {
                    throw new Error("Unable to create new record(s), database error.")
                }
                recordsCount += res.rowCount
            }
            // trx ends
            if (recordsCount > 0 && recordsCount === this.createItems.length) {
                // delete cache
                const cacheParams: QueryHashCacheParamsType = {
                    key : this.cacheKey,
                    hash: this.table,
                    by  : "hash",
                }
                deleteHashCache(cacheParams);
                // check the audit-log settings - to perform audit-log
                let logRes = {code: "noLog", message: "noLog", value: {}} as ResponseMessage;
                if (this.logCreate || this.logCrud) {
                    const logRecs: LogRecordsType = {logRecords: this.createItems}
                    const logParams: AuditLogOptionsType = {
                        tableName : this.table,
                        logRecords: logRecs,
                    }
                    logRes = await this.transLog.createLog(this.userId, logParams);
                }
                await client.query("COMMIT")
                return getResMessage("success", {
                    message: "Record(s) created successfully.",
                    value  : {
                        recordsCount: recordsCount,
                        recordIds   : recordIds,
                        logRes,
                    },
                });
            } else {
                throw new Error("Unable to create new record(s), database error.")
            }
        } catch (e) {
            await client.query("ROLLBACK")
            return getResMessage("insertError", {
                message: `Error inserting/creating new record(s): ${e.message ? e.message : ""}`,
            });
        } finally {
            client?.release();
        }
    }

    async updateRecord(): Promise<ResponseMessage> {
        if (this.updateItems.length < 1) {
            return getResMessage("insertError", {
                message: "Unable to update record(s), due to incomplete/incorrect input-parameters. ",
            });
        }
        // updated record(s)
        // create a transaction session
        const client = await this.appDb.connect()
        try {
            // check/validate update/upsert command for multiple records
            let recordsCount = 0
            let recordIds: Array<string> = []
            const {updateQueryObjects, ok, message} = computeUpdateQuery(this.table, this.updateItems)
            if (!ok) {
                return getResMessage("saveError", {
                    message: message,
                    value  : {
                        updatedQueryObjects: updateQueryObjects,
                        updateQuery1       : updateQueryObjects[0].updateQuery,
                        fieldValues1       : [...updateQueryObjects[0].fieldValues]
                    }
                })
            }
            // trx starts | include returning id for each insert
            await client.query("BEGIN")
            for await (const updateQueryObject of updateQueryObjects) {
                const res = await client.query(updateQueryObject.updateQuery, updateQueryObject.fieldValues)
                if (res.rowCount && res.rowCount > 0 && res.rows[0].id) {
                    recordIds.push(res.rows[0].id)
                } else {
                    throw new Error("Unable to create new record(s), database error.")
                }
                recordsCount += res.rowCount
            }
            if (recordsCount > 0 && recordsCount === recordIds.length) {
                // delete cache
                const cacheParams: QueryHashCacheParamsType = {
                    key : this.cacheKey,
                    hash: this.table,
                    by  : "hash",
                }
                deleteHashCache(cacheParams);
                // check the audit-log settings - to perform audit-log
                let logRes = {code: "noLog", message: "noLog", value: {}} as ResponseMessage;
                if (this.logUpdate || this.logCrud) {
                    const logRecs: LogRecordsType = {logRecords: this.currentRecs}
                    const newLogRecs: LogRecordsType = {logRecords: this.updateItems}
                    const logParams: AuditLogOptionsType = {
                        tableName    : this.table,
                        logRecords   : logRecs,
                        newLogRecords: newLogRecs,
                    }
                    logRes = await this.transLog.updateLog(this.userId, logParams);
                }
                await client.query("COMMIT")
                return getResMessage("success", {
                    message: "Record(s) updated successfully.",
                    value  : {
                        recordsCount: recordsCount,
                        recordIds   : recordIds,
                        logRes,
                    },
                });
            } else {
                throw new Error(`${recordIds.length} of ${this.updateItems.length} could be updated, but rolled-back. Please retry.`)
            }
        } catch (e) {
            await client.query("ROLLBACK")
            return getResMessage("updateError", {
                message: `Error updating record(s): ${e.message ? e.message : ""}`,
                value  : e,
            });
        } finally {
            client?.release();
        }
    }

    async updateRecordById(): Promise<ResponseMessage> {
        if (this.actionParams.length < 1) {
            return getResMessage("insertError", {
                message: "Unable to update record(s), due to incomplete/incorrect input-parameters. ",
            });
        }
        // updated record(s)
        // create a transaction session
        const client = await this.appDb.connect()
        try {
            // check/validate update/upsert command for multiple records
            let recordsCount = 0
            let recordIds: Array<string> = []
            // update one record
            if (this.recordIds.length === 1) {
                // destruct id /other attributes
                let recordItem = this.actionParams[0]
                if (recordItem["id"]) {
                    const {id, ...oParams} = recordItem;
                    recordItem = oParams
                }
                const {updateQueryObject, ok, message} = computeUpdateQueryById(this.table, recordItem, this.recordIds[0])
                if (!ok) {
                    return getResMessage("saveError", {
                        message: message,
                        value  : {
                            updateQuery: updateQueryObject.updateQuery,
                            fieldValues: updateQueryObject.fieldValues,
                        }
                    })
                }
                // trx starts | include returning id for each update
                await client.query('BEGIN')
                const res = await client.query(updateQueryObject.updateQuery, updateQueryObject.fieldValues)
                if (res.rowCount && res.rowCount > 0 && res.rows[0].id) {
                    recordIds.push(res.rows[0].id)
                } else {
                    throw new Error("Unable to update record(s), database error.")
                }
                recordsCount += res.rowCount
                // trx ends
            }
            // update multiple records
            if (this.recordIds.length > 1) {
                // destruct id /other attributes
                let recordItem = this.actionParams[0]
                if (recordItem["id"]) {
                    const {id, ...oParams} = recordItem;
                    recordItem = oParams
                }
                const {
                    updateQueryObject,
                    ok,
                    message
                } = computeUpdateQueryByIds(this.table, recordItem, this.recordIds)
                if (!ok) {
                    return getResMessage("saveError", {
                        message: message,
                        value  : {
                            updateQuery: updateQueryObject.updateQuery,
                            fieldValues: updateQueryObject.fieldValues,
                        }
                    })
                }
                // trx starts
                await client.query('BEGIN')
                const res = await client.query(updateQueryObject.updateQuery, updateQueryObject.fieldValues)
                // for multiple record updates, rows.length === 0
                if (res.rowCount && res.rowCount > 0) {
                    recordsCount = res.rowCount
                } else {
                    throw new Error("Unable to update record(s), database error.")
                }
                // trx ends
            }
            if (recordsCount > 0) {
                // delete cache
                const cacheParams: QueryHashCacheParamsType = {
                    key : this.cacheKey,
                    hash: this.table,
                    by  : "hash",
                }
                deleteHashCache(cacheParams);
                // check the audit-log settings - to perform audit-log
                let logRes = {code: "noLog", message: "noLog", value: {}} as ResponseMessage;
                if (this.logUpdate || this.logCrud) {
                    // include query-params for audit-log
                    const logRecs: LogRecordsType = {logRecords: this.currentRecs}
                    const newLogRecs: LogRecordsType = {logRecords: this.actionParams, recordIds: this.recordIds}
                    const logParams: AuditLogOptionsType = {
                        tableName    : this.table,
                        logRecords   : logRecs,
                        newLogRecords: newLogRecs,
                    }
                    logRes = await this.transLog.updateLog(this.userId, logParams);
                }
                await client.query("COMMIT")
                return getResMessage("success", {
                    message: "Record(s) updated successfully.",
                    value  : {
                        recordsCount: recordsCount,
                        recordIds   : recordIds,
                        logRes,
                    },
                });
            } else {
                throw new Error(`${recordIds.length} of ${this.recordIds.length} could be updated, but rolled-back. Please retry.`)
            }
        } catch (e) {
            await client.query("ROLLBACK")
            return getResMessage("updateError", {
                message: `Error updating record(s): ${e.message ? e.message : ""}`,
                value  : e,
            });
        } finally {
            client?.release();
        }
    }

    async updateRecordByParams(): Promise<ResponseMessage> {
        // updated record(s)
        const client = await this.appDb.connect()
        let recordsCount = 0
        try {
            // destruct id /other attributes
            let otherParams: ActionParamType = {}
            const recordItem = this.actionParams[0]
            if (recordItem["id"]) {
                const {id, ...oParams} = recordItem;
                otherParams = oParams
            }
            // include item stamps: userId and date
            if (this.modelOptions.actorStamp) {
                otherParams.updatedBy = this.userId;
            }
            if (this.modelOptions.timeStamp) {
                otherParams.updatedAt = new Date();
            }
            const {
                updateQueryObject,
                ok,
                message
            } = computeUpdateQueryByParam(this.table, otherParams, this.queryParams)
            if (!ok) {
                return getResMessage("saveError", {
                    message: message,
                    value  : {
                        updateQuery: updateQueryObject.updateQuery,
                        fieldValues: updateQueryObject.fieldValues,
                    }
                })
            }
            // trx starts
            await client.query('BEGIN')
            const res = await client.query(updateQueryObject.updateQuery, updateQueryObject.fieldValues)
            if (res.rowCount && res.rowCount > 0) {
                recordsCount = res.rowCount
            } else {
                throw new Error("Unable to create new record(s), database error.")
            }
            // trx ends
            if (recordsCount > 0) {
                // delete cache
                const cacheParams: QueryHashCacheParamsType = {
                    key : this.cacheKey,
                    hash: this.table,
                    by  : "hash",
                }
                deleteHashCache(cacheParams);
                // check the audit-log settings - to perform audit-log
                let logRes = {code: "noLog", message: "noLog", value: {}} as ResponseMessage;
                if (this.logUpdate || this.logCrud) {
                    // include query-params for audit-log
                    const logRecs: LogRecordsType = {logRecords: this.currentRecs}
                    const newLogRecs: LogRecordsType = {logRecords: this.updateItems}
                    const updateParams: LogRecordsType = {...newLogRecs, ...{queryParams: this.queryParams}};
                    const logParams: AuditLogOptionsType = {
                        tableName    : this.table,
                        logRecords   : logRecs,
                        newLogRecords: updateParams,
                    }
                    logRes = await this.transLog.updateLog(this.userId, logParams);
                }
                await client.query("COMMIT")
                return getResMessage("success", {
                    message: "Record(s) updated successfully.",
                    value  : {
                        recordsCount: recordsCount,
                        logRes,
                    },
                });
            } else {
                throw new Error(`${recordsCount} of ${this.recordIds.length} could be updated, but rolled-back. Please retry.`)
            }
        } catch (e) {
            await client.query("ROLLBACK")
            return getResMessage("updateError", {
                message: `Error updating record(s): ${e.message ? e.message : ""}`,
                value  : e,
            });
        } finally {
            client?.release();
        }
    }
}

// factory function/constructor
function newSaveRecord(params: CrudParamsType, options: CrudOptionsType = {}) {
    return new SaveRecord(params, options);
}

export { SaveRecord, newSaveRecord };
