/**
 * @Author: abbeymart | Abi Akindele | @Created: 2020-07-24
 * @Company: Copyright 2020 Abi Akindele  | mConnect.biz
 * @License: All Rights Reserved | LICENSE.md
 * @Description: save-record(s) (create/insert and update record(s))
 */

// Import required module/function(s)
import { getResMessage, ResponseMessage } from "@mconnect/mcresponse";
import { deleteHashCache } from "@mconnect/mccache";
import { Crud } from "./Crud";
import {
    ActionParamsType,
    ActionParamTaskType,
    CrudOptionsType,
    CrudParamsType, LogRecordsType,
    ModelOptionsType,
    TaskTypes
} from "..";
import { isEmptyObject } from "./validate";
import { computeCreateQuery } from "./helpers/computeCreateQuery";
import {
    computeUpdateQuery,
    computeUpdateQueryById,
    computeUpdateQueryByIds,
    computeUpdateQueryByParam
} from "./helpers/computeUpdateQuery";

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

        // determine update / create (new) items from actionParams
        const {recordIds} = await this.computeItems();
        // validate createItems and updateItems
        if (this.createItems.length > 0 && this.updateItems.length > 0) {
            return getResMessage("paramsError", {
                message: "You may only create or update record(s), not both at the same time.",
                value  : {},
            });
        }
        // task-type:
        if (this.createItems.length > 0) {
            this.taskType = TaskTypes.CREATE
        } else if (this.updateItems.length > 0) {
            this.taskType = TaskTypes.UPDATE
        } else {
            return getResMessage("paramsError", {
                message: "Inputs errors (actionParams required) to complete create or update tasks.",
                value  : {},
            });
        }
        // create records/documents
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
                console.error(e);
                return getResMessage("insertError", {
                    message: "Error-inserting/creating new record.",
                });
            }
        }

        // update existing records/documents
        if (this.taskType === TaskTypes.UPDATE && this.updateItems.length === 1 && this.recordIds.length > 0) {
            try {
                // check task-permission
                if (this.checkAccess) {
                    const accessRes = await this.taskPermissionById(this.taskType)
                    if (accessRes.code != "success") {
                        return accessRes
                    }
                }
                if (this.logUpdate) {
                    const currentRec = await this.getCurrentRecords("id");
                    if (currentRec.code !== "success") {
                        return currentRec;
                    }
                }
                // update records
                return await this.updateRecordById();
            } catch (e) {
                console.error(e);
                return getResMessage("updateError", {
                    message: `Error updating record(s): ${e.message ? e.message : ""}`,
                });
            }
        }

        // update records/documents by queryParams: permitted for admin user only
        if (this.taskType === TaskTypes.UPDATE && !isEmptyObject(this.queryParams) && this.updateItems.length === 1) {
            try {
                // check task-permission
                if (this.checkAccess) {
                    const accessRes = await this.taskPermissionByParams(this.taskType)
                    if (accessRes.code != "success") {
                        return accessRes
                    }
                }
                // get current records update and audit log
                if (this.logUpdate) {
                    const currentRec = await this.getCurrentRecords("queryparams");
                    if (currentRec.code !== "success") {
                        return currentRec;
                    }
                }
                // update records
                return await this.updateRecordByParams();
            } catch (e) {
                console.error(e);
                return getResMessage("updateError", {
                    message: `Error updating record(s): ${e.message ? e.message : ""}`,
                });
            }
        }

        if (this.taskType === TaskTypes.UPDATE && this.updateItems.length > 0) {
            // check task-permission
            this.recordIds = recordIds
            if (this.checkAccess) {
                const accessRes = await this.taskPermissionById(this.taskType)
                if (accessRes.code != "success") {
                    return accessRes
                }
            }
            return await this.updateRecord()
        }

        // return save-error message
        return getResMessage("saveError", {
            message: "Error performing the requested operation(s). Please retry",
        });
    }

    // helper methods:
    async computeItems(modelOptions: ModelOptionsType = this.modelOptions): Promise<ActionParamTaskType> {
        let updateItems: ActionParamsType = [],
            recordIds: Array<string> = [],
            createItems: ActionParamsType = [];
        // cases - actionParams.length === 1 OR > 1
        if (this.actionParams.length === 1) {
            let item = this.actionParams[0]
            if (this.recordIds.length > 0 || !isEmptyObject(this.queryParams)) {
                // update/existing document
                if (modelOptions.actorStamp) {
                    item["updatedBy"] = this.userId;
                }
                if (modelOptions.timeStamp) {
                    item["updatedAt"] = new Date();
                }
                if (modelOptions.activeStamp && item.isActive === undefined) {
                    item["isActive"] = true;
                }
                updateItems.push(item);
            } else if (item["id"]) {
                this.recordIds = [];
                this.queryParams = {};
                // update/existing document
                if (modelOptions.actorStamp) {
                    item["updatedBy"] = this.userId;
                }
                if (modelOptions.timeStamp) {
                    item["updatedAt"] = new Date();
                }
                if (modelOptions.activeStamp && item.isActive === undefined) {
                    item["isActive"] = true;
                }
                updateItems.push(item);
                recordIds.push(item["id"]);
            } else {
                this.recordIds = [];
                this.queryParams = {};
                // exclude any traces of id, especially without concrete value ("", null, undefined), if present
                const {id, ...saveParams} = item;
                item = saveParams;
                // create/new document
                if (modelOptions.actorStamp) {
                    item["createdBy"] = this.userId;
                }
                if (modelOptions.timeStamp) {
                    item["createdAt"] = new Date();
                }
                if (modelOptions.activeStamp && item.isActive === undefined) {
                    item["isActive"] = true;
                }
                createItems.push(item);
            }
            this.createItems = createItems;
            this.updateItems = updateItems;
            // this.recordIds = recordIds;
        } else if (this.actionParams.length > 1) {
            this.recordIds = [];
            this.queryParams = {};
            this.actionParams.forEach((item) => {
                if (item["id"]) {
                    // update/existing document
                    if (modelOptions.actorStamp) {
                        item["updatedBy"] = this.userId;
                    }
                    if (modelOptions.timeStamp) {
                        item["updatedAt"] = new Date();
                    }
                    if (modelOptions.activeStamp && item.isActive === undefined) {
                        item["isActive"] = true;
                    }
                    updateItems.push(item);
                    recordIds.push(item["id"]);
                } else {
                    // exclude any traces of id, especially without concrete value ("", null, undefined), if present
                    const {id, ...saveParams} = item;
                    item = saveParams;
                    // create/new document
                    if (modelOptions.actorStamp) {
                        item["createdBy"] = this.userId;
                    }
                    if (modelOptions.timeStamp) {
                        item["createdAt"] = new Date();
                    }
                    if (modelOptions.activeStamp && item.isActive === undefined) {
                        item["isActive"] = true;
                    }
                    createItems.push(item);
                }
            });
            this.createItems = createItems;
            this.updateItems = updateItems;
        }
        return {
            createItems,
            updateItems,
            recordIds,
        };
    }

    async createRecord(): Promise<ResponseMessage> {
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
                recordsCount += res.rowCount
                if (res.rowCount && res.rows[0].id) {
                    recordIds.push(res.rows[0].id)
                }
            }
            // trx ends
            if (recordsCount > 0 && recordsCount === recordIds.length) {
                // delete cache
                deleteHashCache(this.cacheKey, this.table, "key");
                // check the audit-log settings - to perform audit-log
                let logRes = {code: "noLog", message: "noLog", value: {}} as ResponseMessage;
                if (this.logCreate || this.logCrud) {
                    const logRecs: LogRecordsType = {logRecords: this.createItems}
                    logRes = await this.transLog.createLog(this.table, logRecs, this.userId);
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
            // console.log("crud-error: ", e)
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
                recordsCount += res.rowCount
                if (res.rowCount && res.rows[0].id) {
                    recordIds.push(res.rows[0].id)
                }
            }
            if (recordsCount > 0 && recordsCount === recordIds.length) {
                // delete cache
                await deleteHashCache(this.cacheKey, this.table, "key");
                // check the audit-log settings - to perform audit-log
                let logRes = {code: "noLog", message: "noLog", value: {}} as ResponseMessage;
                if (this.logUpdate || this.logCrud) {
                    const logRecs: LogRecordsType = {logRecords: this.currentRecs}
                    const newLogRecs: LogRecordsType = {logRecords: this.updateItems}
                    logRes = await this.transLog.updateLog(this.table, logRecs, newLogRecs, this.userId);
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
            // update one record
            if (this.recordIds.length === 1) {
                // destruct id /other attributes
                const {id, ...otherParams} = this.updateItems[0];

                const {updateQueryObject, ok, message} = computeUpdateQueryById(this.table, otherParams, id)
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
                recordsCount += res.rowCount
                if (res.rowCount && res.rows[0].id) {
                    recordIds.push(res.rows[0].id)
                }
                // trx ends
            }
            // update multiple records
            if (this.recordIds.length > 1) {
                // destruct id /other attributes
                const {id, ...otherParams} = this.updateItems[0];
                const {
                    updateQueryObject,
                    ok,
                    message
                } = computeUpdateQueryByIds(this.table, otherParams, this.recordIds)
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
                recordsCount += res.rowCount
                recordIds = this.recordIds
                // trx ends
            }
            if (recordsCount > 0 && recordsCount === this.recordIds.length) {
                // delete cache
                await deleteHashCache(this.cacheKey, this.table, "key");
                // check the audit-log settings - to perform audit-log
                let logRes = {};
                if (this.logUpdate || this.logCrud) {
                    // include query-params for audit-log
                    const logRecs: LogRecordsType = {logRecords: this.currentRecs}
                    const newLogRecs: LogRecordsType = {logRecords: this.updateItems}
                    const updateParams: LogRecordsType = {...newLogRecs, ...{recordIds: this.recordIds}};
                    logRes = await this.transLog.updateLog(this.table, logRecs, updateParams, this.userId);
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
            const {id, ...otherParams} = this.updateItems[0];
            // include item stamps: userId and date
            otherParams.updatedBy = this.userId;
            otherParams.updatedAt = new Date();
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
            recordsCount += res.rowCount
            // trx ends
            if (recordsCount > 0) {
                // delete cache
                await deleteHashCache(this.cacheKey, this.table, "key");
                // check the audit-log settings - to perform audit-log
                let logRes = {};
                if (this.logUpdate) {
                    // include query-params for audit-log
                    const logRecs: LogRecordsType = {logRecords: this.currentRecs}
                    const newLogRecs: LogRecordsType = {logRecords: this.updateItems}
                    const updateParams: LogRecordsType = {...newLogRecs, ...{queryParams: this.queryParams}};
                    logRes = await this.transLog.updateLog(this.table, logRecs, updateParams, this.userId);
                }
                await client.query("COMMIT")
                return getResMessage("success", {
                    message: "Requested action(s) performed successfully.",
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
