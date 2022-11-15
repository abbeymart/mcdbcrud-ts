/**
 * @Author: abbeymart | Abi Akindele | @Created: 2020-02-21 | @Updated: 2020-05-28
 * @Company: mConnect.biz | @License: MIT
 * @Description: crud-mongo base class, for all CRUD operations
 */

// Import required module/function(s)/types
import {getResMessage, ResponseMessage} from "@mconnect/mcresponse";
import {
    ActionParamsType,
    ActionParamType,
    CheckAccessType,
    CrudOptionsType,
    CrudParamsType,
    CrudQueryFieldType,
    OkResponse, OwnerRecordCountResultType,
    ProjectParamType,
    QueryParamsType,
    RecordCountResultType,
    RoleFuncType,
    RoleServiceResponseType,
    SelectQueryResult,
    SortParamType,
    TaskAccessType,
    TaskTypes,
    UserInfoType,
} from "./types";
import {AuditLog, newAuditLog} from "../auditlog";
import {Pool, PoolClient, QueryResult} from "pg";
import {
    computeSelectQueryAll,
    computeSelectQueryById,
    computeSelectQueryByIds,
    computeSelectQueryByParams
} from "./helpers";
import {toCamelCase} from "./utils";

export class Crud {
    protected params: CrudParamsType;
    protected readonly modelRef: ActionParamType;
    protected readonly appDb: Pool;
    protected readonly table: string;
    protected token: string;
    protected readonly userInfo: UserInfoType;
    protected recordIds: Array<string>;       // to capture string-id | ObjectId
    protected actionParams: ActionParamsType;
    protected queryParams: QueryParamsType;
    protected readonly projectParams: ProjectParamType;
    protected readonly sortParams: SortParamType;
    protected taskType: TaskTypes | string;
    protected skip: number;
    protected limit: number;
    protected readonly accessDb: Pool;
    protected readonly auditDb: Pool;
    protected readonly serviceDb: Pool;
    protected readonly auditTable: string;
    protected readonly serviceTable: string;
    protected readonly userTable: string;
    protected readonly roleTable: string;
    protected readonly accessTable: string;
    protected maxQueryLimit: number;
    protected readonly logCrud: boolean;
    protected readonly logCreate: boolean;
    protected readonly logUpdate: boolean;
    protected readonly logRead: boolean;
    protected readonly logDelete: boolean;
    protected readonly logLogin: boolean;
    protected readonly logLogout: boolean;
    protected transLog: AuditLog;
    protected cacheKey: string;
    protected getAllRecords: boolean;
    protected readonly checkAccess: boolean;
    protected userId: string;
    protected isAdmin: boolean;
    protected isActive: boolean;
    protected createItems: ActionParamsType;
    protected updateItems: ActionParamsType;
    protected currentRecs: ActionParamsType;
    protected roleServices: Array<RoleServiceResponseType>;
    protected isRecExist: boolean;
    protected actionAuthorized: boolean;
    protected usernameExistsMessage: string;
    protected emailExistsMessage: string;
    protected recExistMessage: string;
    protected unAuthorizedMessage: string;
    protected cacheExpire: number;
    protected fieldSeparator: string;
    protected queryFieldType: CrudQueryFieldType;
    protected getFromCache: boolean;
    protected cacheGetResult: boolean;

    constructor(params: CrudParamsType, options?: CrudOptionsType) {
        // crudParams
        this.modelRef = params.modelRef;
        this.params = params;
        this.appDb = params.appDb;
        this.table = params.table;
        this.actionParams = params && params.actionParams ? params.actionParams : [];
        this.queryParams = params && params.queryParams ? params.queryParams : {};
        this.projectParams = params && params.projectParams ? params.projectParams : {};
        this.sortParams = params && params.sortParams ? params.sortParams : {};
        this.taskType = params && params.taskType ? params.taskType : "";
        this.recordIds = params && params.recordIds ? params.recordIds : [];
        this.userInfo = params && params.userInfo ? params.userInfo :
            {
                token    : "",
                userId   : "",
                firstname: "",
                lastname : "",
                language : "",
                loginName: "",
                expire   : 0,
            };
        this.token = params && params.token ? params.token : this.userInfo.token || "";
        this.userId = this.userInfo.userId || "";
        // options
        this.skip = params.skip ? params.skip : options && options.skip ? options.skip : 0;
        this.limit = params.limit ? params.limit : options && options.limit ? options.limit : 10000;
        this.checkAccess = options && options.checkAccess ? options.checkAccess : false;
        this.auditTable = options && options.auditTable ? options.auditTable : "audits";
        this.serviceTable = options && options.serviceTable ? options.serviceTable : "services";
        this.accessTable = options && options.accessTable ? options.accessTable : "accesses";
        this.userTable = options && options.userTable ? options.userTable : "users";
        this.roleTable = options && options.roleTable ? options.roleTable : "roles";
        this.accessDb = options && options.accessDb ? options.accessDb : this.appDb;
        this.auditDb = options && options.auditDb ? options.auditDb : this.appDb;
        this.serviceDb = options && options.serviceDb ? options.serviceDb : this.appDb;
        this.maxQueryLimit = options && options.maxQueryLimit ? options.maxQueryLimit : 10000;
        this.logCrud = options && options.logCrud ? options.logCrud : false;
        this.logCreate = options && options.logCreate ? options.logCreate : false;
        this.logUpdate = options && options.logUpdate ? options.logUpdate : false;
        this.logRead = options && options.logRead ? options.logRead : false;
        this.logDelete = options && options.logDelete ? options.logDelete : false;
        this.logLogin = options && options.logLogin ? options.logLogin : false;
        this.logLogout = options && options.logLogout ? options.logLogout : false;
        this.cacheExpire = options && options.cacheExpire ? options.cacheExpire : 300;
        this.fieldSeparator = options?.fieldSeparator || "_";
        this.queryFieldType = options?.queryFieldType || CrudQueryFieldType.Underscore;
        // unique cache-key
        this.cacheKey = JSON.stringify({
            table        : this.table,
            queryParams  : this.queryParams,
            projectParams: this.projectParams,
            sortParams   : this.sortParams,
            recordIds    : this.recordIds,
            skip         : this.skip,
            limit        : this.limit,
        });
        this.getAllRecords = options?.getAllRecords || false;
        this.getFromCache = options?.getFromCache || false;
        this.cacheGetResult = options?.cacheGetResult || false;
        // auditLog constructor / instance
        this.transLog = newAuditLog(this.auditDb, this.auditTable);
        // standard defaults
        this.isAdmin = false;
        this.isActive = true;
        this.createItems = [];
        this.updateItems = [];
        this.currentRecs = [];
        this.roleServices = [];
        this.isRecExist = false;
        this.actionAuthorized = false;
        this.recExistMessage = "Save / update error or duplicate records exist. ";
        this.unAuthorizedMessage = "Action / task not authorised or permitted. ";
        this.usernameExistsMessage = options?.usernameExistsMessage ? options.usernameExistsMessage :
            "Username already exists. ";
        this.emailExistsMessage = options?.emailExistsMessage ? options.emailExistsMessage : "Email already exists. ";
    }

    // checkDb checks / validate appDb
    checkDb(dbConnect: Pool): ResponseMessage {
        if (dbConnect) {
            return getResMessage("success", {
                message: "valid database handler",
            });
        } else {
            return getResMessage("validateError", {
                message: "valid database handler is required",
            })
        }
    }

    // checkDbClient checks / validates mongo-client connection (for crud-transactional tasks)
    checkDbClient(dbc: PoolClient): ResponseMessage {
        if (dbc) {
            return getResMessage("success", {
                message: "valid database-server client connection",
            });
        } else {
            return getResMessage("validateError", {
                message: "valid database-server client connection is required",
            });
        }
    }

    // implement toString method
    protected toString = (): string => `CRUD Instance Information: ${this}`

    // ownerRecordsCount method query DB-tables and returns ownerRecords (by userId), and ok and message
    async ownerRecordsCount(): Promise<OwnerRecordCountResultType> {
        try {
            // count owner-records
            const ownerScript = `SELECT COUNT(*) AS ownerrows FROM ${this.table} WHERE created_by = $1`
            const ownerRowsRes = await this.appDb.query(ownerScript, [this.userInfo.userId])
            const ownerRows = ownerRowsRes.rows[0].ownerrows
            if (ownerRows < 1) {
                return {
                    ownerRecords: 0,
                    ok          : false,
                    message     : "Owner records count error - no records found",
                }
            }
            return {
                ownerRecords: Number(ownerRows),
                ok          : true,
                message     : "success",
            }
        } catch (e) {
            return {
                ownerRecords: 0,
                ok          : false,
                message     : `${e.message}`,
            }
        }
    }

    // recordsCount method query DB-tables and returns totalRecords (by userId), and ok and message
    async recordsCount(): Promise<RecordCountResultType> {
        try {
            // totalRecordsCount from the table
            const countQuery = `SELECT COUNT(*) AS totalrows FROM ${this.table}`
            const countRowsRes = await this.appDb.query(countQuery)
            const totalRows = countRowsRes.rows[0].totalrows
            if (totalRows < 1) {
                return {
                    totalRecords: 0,
                    ok          : false,
                    message     : "Total records count error - no records found",
                }
            }
            return {
                totalRecords: totalRows,
                ok          : true,
                message     : "success",
            }
        } catch (e) {
            return {
                totalRecords: 0,
                ok          : false,
                message     : `${e.message}`,
            }
        }
    }

    // computeQueryRecords method computes, from db-result, the records of ActionParamsType (Array<object>)
    computeQueryRecords(recRes: QueryResult): ActionParamsType {
        // compute records
        let records: ActionParamsType = [];
        try {
            // record-fields
            const recFields = recRes.fields.map(field => field.name)
            // convert record-rows to array-of-records(objects)
            for (const row of recRes.rows) {
                let record: ActionParamType = {}
                for (const recField of recFields) {
                    record[toCamelCase(recField)] = row[recField]
                }
                records.push(record)
            }
            return records
        } catch (e) {
            throw e
            // return []
        }
    }

    // getCurrentRecords fetch records by recordIds, queryParams or all limited by this.limit and this.skip, if applicable
    async getCurrentRecords(by = ""): Promise<ResponseMessage> {
        try {
            // validate models
            const validDb = this.checkDb(this.appDb);
            if (validDb.code !== "success") {
                return validDb;
            }
            // totalRecordsCount from the table
            const recordsCountRes = await this.recordsCount()
            const totalRows = recordsCountRes.totalRecords
            if (totalRows < 1) {
                return getResMessage("notFound", {
                    message: recordsCountRes.message,
                })
            }
            let selectQueryResult: SelectQueryResult
            let recRes: QueryResult
            // let recFields: Array<string>

            switch (by.toLowerCase()) {
                case "id":
                    // select by id
                    if (this.recordIds.length === 1) {
                        selectQueryResult = computeSelectQueryById(this.modelRef, this.table, this.recordIds[0], {
                            skip : this.skip,
                            limit: this.limit
                        })
                    } else {
                        selectQueryResult = computeSelectQueryByIds(this.modelRef, this.table, this.recordIds, {
                            skip : this.skip,
                            limit: this.limit
                        })
                    }
                    if (!selectQueryResult.ok) {
                        return getResMessage("readError", {
                            message: selectQueryResult.message,
                            value  : {
                                selectQuery: selectQueryResult.selectQueryObject.selectQuery,
                                fieldValues: selectQueryResult.selectQueryObject.fieldValues,
                            }
                        })
                    }
                    // get records
                    recRes = await this.appDb.query(selectQueryResult.selectQueryObject.selectQuery, selectQueryResult.selectQueryObject.fieldValues)
                    break;
                case "queryparams":
                    // get records by query-params
                    selectQueryResult = computeSelectQueryByParams(this.modelRef, this.table, this.queryParams, {
                        skip : this.skip,
                        limit: this.limit
                    })
                    if (!selectQueryResult.ok) {
                        return getResMessage("readError", {
                            message: selectQueryResult.message,
                            value  : {
                                selectQuery: selectQueryResult.selectQueryObject.selectQuery,
                                fieldValues: selectQueryResult.selectQueryObject.fieldValues,
                                modelRef   : this.modelRef,
                                table      : this.table,
                                queryParams: this.queryParams,
                            }
                        })
                    }
                    // query records
                    recRes = await this.appDb.query(selectQueryResult.selectQueryObject.selectQuery, selectQueryResult.selectQueryObject.fieldValues)
                    break;
                default:
                    // get all records
                    selectQueryResult = computeSelectQueryAll(this.modelRef, this.table, {
                        skip : this.skip,
                        limit: this.limit
                    })
                    if (!selectQueryResult.ok) {
                        return getResMessage("readError", {
                            message: selectQueryResult.message,
                            value  : {
                                selectQuery: selectQueryResult.selectQueryObject.selectQuery,
                                fieldValues: selectQueryResult.selectQueryObject.fieldValues,
                            }
                        })
                    }
                    // query records
                    recRes = await this.appDb.query(selectQueryResult.selectQueryObject.selectQuery, selectQueryResult.selectQueryObject.fieldValues)
                    break;
            }
            // compute records
            const records = this.computeQueryRecords(recRes);
            // check records result
            if (records.length > 0) {
                // update crud instance current-records value
                this.currentRecs = records;
                return getResMessage("success", {
                    message: "Current document/record(s) retrieved successfully.",
                    value  : {
                        records: records,
                        stats  : {
                            skip             : this.skip,
                            limit            : this.limit,
                            recordsCount     : records.length,
                            totalRecordsCount: Number(totalRows),
                        },
                    }
                });
            } else {
                return getResMessage("notFound", {
                    message: "Current document/record(s) not found.",
                    value  : {
                        selectQuery: selectQueryResult.selectQueryObject.selectQuery,
                        fieldValues: selectQueryResult.selectQueryObject.fieldValues,
                    }
                });
            }
        } catch (e) {
            console.error(e);
            return getResMessage("notFound", {
                message: `Error retrieving current document/record(s): ${e.message}`,
                value  : {},
            });
        }
    }

    // getRoleServices method process and returns the permission to user / user-group/role for the specified service items
    async getRoleServices(roleIds: Array<string>, serviceIds: Array<string>): Promise<Array<RoleServiceResponseType>> {
        // serviceIds: for serviceCategory (record, table, function, package, solution...)
        let roleServices: Array<RoleServiceResponseType> = [];
        try {
            // validate models
            const validRoleServiceDb = await this.checkDb(this.accessDb);
            if (validRoleServiceDb.code !== "success") {
                return [];
            }
            const queryText = `SELECT service_id, role_id, service_category, can_read, can_create, can_update, can_delete, can_crud FROM ${this.roleTable}`
            // roleIds-value
            const idLen = roleIds.length
            let recIds = "("
            for (let i = 0; i < idLen; i++) {
                recIds += "'" + roleIds[i] + "'"
                if (i < idLen - 1) {
                    recIds += ", "
                }
            }
            recIds += ")"
            // serviceIds-value
            const idLen2 = serviceIds.length
            let recIds2 = "("
            for (let i = 0; i < idLen2; i++) {
                recIds2 += "'" + serviceIds[i] + "'"
                if (i < idLen2 - 1) {
                    recIds2 += ", "
                }
            }
            recIds2 += ")"
            // where-query
            const whereQuery = ` WHERE role_id IN ${recIds} AND service_id IN ${recIds2} AND is_active = $1`
            const values = [true]
            const res = await this.accessDb.query(queryText + whereQuery, values)

            if (res.rows.length > 0) {
                for (const rec of res.rows) {
                    roleServices.push({
                        serviceId      : rec.service_id,
                        roleId         : rec.role_id,
                        roleIds        : roleIds,
                        serviceCategory: rec.service_category,
                        canRead        : rec.can_read,
                        canCreate      : rec.can_create,
                        canUpdate      : rec.can_update,
                        canDelete      : rec.can_delete,
                        canCrud        : rec.can_crud,
                    });
                }
            }
            return roleServices;
        } catch (e) {
            return [];
        }
    }

    // checkAccess validate if current CRUD task is permitted based on defined/assigned roles
    async checkTaskAccess(userInfo: UserInfoType, recordIds: Array<string> = []): Promise<ResponseMessage> {
        try {
            // validate models
            const validAccessDb = await this.checkDb(this.accessDb);
            if (validAccessDb.code !== "success") {
                return validAccessDb;
            }
            const validServiceDb = await this.checkDb(this.appDb);
            if (validServiceDb.code !== "success") {
                return validServiceDb;
            }
            // perform crud-operation
            // check logged-in user access status and record
            const accessRes = await this.checkLoginStatus();
            if (accessRes.code !== "success") {
                return accessRes;
            }
            const userRec = accessRes.value as CheckAccessType;
            // determine records ownership permission
            let ownerPermitted = false;
            const idLen = recordIds.length
            if (userRec.userId && userRec.isActive) {
                if (idLen > 0) {
                    const queryText = `SELECT COUNT(*) AS totalrows FROM ${this.table}`
                    // ids-value
                    let recIds = "("
                    for (let i = 0; i < idLen; i++) {
                        recIds += "'" + recordIds[i] + "'"
                        if (i < idLen - 1) {
                            recIds += ", "
                        }
                    }
                    recIds += ")"
                    // where-query
                    const whereQuery = ` WHERE id IN ${recIds} AND created_by = $1`
                    const values = [userRec.userId]
                    const res = await this.accessDb.query(queryText + whereQuery, values)
                    // check if the current-user owned all the current-records (recordIds)
                    if (Number(res.rows[0].totalrows) === this.recordIds.length) {
                        ownerPermitted = true;
                    }
                } else {
                    const queryText = `SELECT COUNT(*) AS recordscount FROM ${this.table} WHERE created_by=$1`
                    const values = [userRec.userId]
                    const res = await this.accessDb.query(queryText, values)
                    if (Number(res.rows[0].recordscount) > 0 && this.taskType === TaskTypes.READ) {
                        ownerPermitted = true;
                    }
                }
            }
            // TODO: create-task, ownerPermission
            const excludedTables = ["users", "apps", "groups", "roles"]
            if (this.taskType === TaskTypes.CREATE && !excludedTables.includes(this.table)) {
                ownerPermitted = true
            }
            // if all the above checks passed, check for role-services access by taskType
            // obtain crudTable/tableId (id) from serviceTable (repo for all resources)
            // const serviceCats = ["table", "Table", "collection", "Collection",]
            const queryText = `SELECT id, category FROM ${this.serviceTable}`
            const whereQuery = ` WHERE category IN ('table', 'Table', 'collection', 'Collection') AND name = $1`
            const values = [this.table]
            const res = await this.accessDb.query(queryText + whereQuery, values)

            // if permitted, include tableId and recordIds in serviceIds
            let tableId = "";
            let serviceIds = recordIds;
            if (res && res.rows.length > 0 && (res.rows[0].category.toLowerCase() === "table" || "collection")) {
                tableId = res.rows[0].id;
                serviceIds.push(res.rows[0].id);
            }

            let roleServices: Array<RoleServiceResponseType> = [];
            if (serviceIds.length > 0) {
                roleServices = await this.getRoleServices(userRec.roleIds, serviceIds)
            }

            let permittedRes: TaskAccessType = {
                userId        : userRec.userId,
                roleId        : userRec.roleId,
                roleIds       : userRec.roleIds,
                isActive      : userRec.isActive,
                isAdmin       : userRec.isAdmin || false,
                roleServices  : roleServices,
                tableId       : tableId,
                ownerPermitted: ownerPermitted,
            }
            if (permittedRes.isActive && (permittedRes.isAdmin || ownerPermitted)) {
                return getResMessage("success", {value: permittedRes});
            }
            const recLen = permittedRes.roleServices?.length || 0;
            if (permittedRes.isActive && recLen > 0 && recLen >= recordIds.length) {
                return getResMessage("success", {value: permittedRes});
            }
            return getResMessage("unAuthorized",
                {
                    message: `Access permitted for ${recordIds.length} of ${recLen} service-items/records`,
                    value  : permittedRes
                }
            );
        } catch (e) {
            console.error("check-access-error: ", e);
            return getResMessage("unAuthorized", {message: e.message});
        }
    }

    // taskPermissionById method determines the access permission by owner, role/group (on table/table or doc/record(s)) or admin
    // for various task-types: "create", "update", "delete"/"remove", "read"
    async taskPermissionById(taskType: TaskTypes | string): Promise<ResponseMessage> {
        try {
            // # validation access variables
            let taskPermitted = false,
                ownerPermitted = false,
                recPermitted = false,
                tablePermitted = false,
                isAdmin = false,
                isActive = false,
                userId = "",
                roleId = "",
                roleIds: Array<string> = [],
                tableId = "",
                recordIds: Array<string> = [],
                roleServices: Array<RoleServiceResponseType> = [];

            // validate and set recordIds
            if (this.recordIds.length < 1) {
                return getResMessage("unAuthorized", {message: "Document Ids not specified."});
            }
            recordIds = this.recordIds;

            // check role-based access
            const accessRes = await this.checkTaskAccess(this.userInfo, recordIds);
            if (accessRes.code !== "success") {
                return accessRes;
            }
            // capture roleServices value | get access info value
            let accessInfo = accessRes.value as TaskAccessType;
            // set records ownership permission
            ownerPermitted = accessInfo.ownerPermitted || false
            isAdmin = accessInfo.isAdmin;
            isActive = accessInfo.isActive;
            roleServices = accessInfo.roleServices;
            userId = accessInfo.userId;
            roleId = accessInfo.roleId;
            roleIds = accessInfo.roleIds;
            tableId = accessInfo.tableId || "";

            // validate active status
            if (!isActive) {
                return getResMessage("unAuthorized", {message: "Account is not active. Validate active status"});
            }
            // validate roleServices permission, for non-admin/non-owner users
            if (!isAdmin && !ownerPermitted && roleServices.length < 1) {
                return getResMessage("unAuthorized", {message: "You are not authorized to perform the requested action/task"});
            }

            // filter the roleServices by categories ("table" and "document"/"record")
            const tableAccessFunc = (item: RoleServiceResponseType): boolean => {
                return (item.serviceId === tableId);
            }
            const recordAccessFunc = (item: RoleServiceResponseType): boolean => {
                return (recordIds.includes(item.serviceId));
            }

            let roleTables: Array<RoleServiceResponseType> = [];
            let roleRecords: Array<RoleServiceResponseType> = [];
            if (roleServices.length > 0) {
                roleTables = roleServices.filter(tableAccessFunc);
                roleRecords = roleServices.filter(recordAccessFunc);
            }

            // helper functions
            const canCreateFunc = (item: RoleServiceResponseType): boolean => {
                return item.canCreate
            }

            const canUpdateFunc = (item: RoleServiceResponseType): boolean => {
                return item.canUpdate;
            }

            const canDeleteFunc = (item: RoleServiceResponseType): boolean => {
                return item.canDelete;
            }

            const canReadFunc = (item: RoleServiceResponseType): boolean => {
                return item.canRead;
            }

            const updateRoleFunc = (it1: string, it2: RoleServiceResponseType): boolean => {
                return (it2.serviceId === it1 && it2.canUpdate);
            }

            const deleteRoleFunc = (it1: string, it2: RoleServiceResponseType): boolean => {
                return (it2.serviceId === it1 && it2.canDelete);
            }

            const readRoleFunc = (it1: string, it2: RoleServiceResponseType): boolean => {
                return (it2.serviceId === it1 && it2.canRead);
            }

            // wrapper function for the role<Type>Func | check if record-id(it1) is permitted
            const recordFunc = (it1: string, roleFunc: RoleFuncType): boolean => {
                return roleRecords.some((it2: RoleServiceResponseType) => roleFunc(it1, it2));
            }

            // taskType specific permission(s) - for non-admin users
            switch (taskType) {
                case TaskTypes.CREATE:
                    // table level access | crudTable-Id was included in serviceIds
                    if (roleTables.length > 0) {
                        tablePermitted = roleTables.every(canCreateFunc);
                    }
                    break;
                case TaskTypes.INSERT:
                    // table level access | crudTable-Id was included in serviceIds
                    if (roleTables.length > 0) {
                        tablePermitted = roleTables.every(canCreateFunc);
                    }
                    break;
                case TaskTypes.UPDATE:
                    // table level access
                    if (roleTables.length > 0) {
                        tablePermitted = roleTables.every(canUpdateFunc);
                    }
                    // docs/records level access: every recordIds must have at least a match in the roleRecords
                    recPermitted = recordIds.every(it1 => recordFunc(it1, updateRoleFunc));
                    break;
                case TaskTypes.DELETE:
                    // table level access
                    if (roleTables.length > 0) {
                        tablePermitted = roleTables.every(canDeleteFunc);
                    }
                    // docs/records level access: every recordIds must have at least a match in the roleRecords
                    recPermitted = recordIds.every(it1 => recordFunc(it1, deleteRoleFunc));
                    break;
                case TaskTypes.REMOVE:
                    // table level access
                    if (roleTables.length > 0) {
                        tablePermitted = roleTables.every(canDeleteFunc);
                    }
                    // docs/records level access: every recordIds must have at least a match in the roleRecords
                    recPermitted = recordIds.every(it1 => recordFunc(it1, deleteRoleFunc));
                    break;
                case TaskTypes.READ:
                    // table level access
                    if (roleTables.length > 0) {
                        tablePermitted = roleTables.every(canReadFunc);
                    }
                    // docs/records level access: every recordIds must have at least a match in the roleRecords
                    recPermitted = recordIds.every(it1 => recordFunc(it1, readRoleFunc));
                    break;
                default:
                    return getResMessage("unAuthorized", {message: `Unknown/unsupported task-type (${taskType}`});
            }

            // overall access permission
            taskPermitted = recPermitted || tablePermitted || ownerPermitted || isAdmin;
            const ok: OkResponse = {ok: taskPermitted};
            const value = {...ok, ...{isAdmin, isActive, userId, roleId, roleIds}};
            if (taskPermitted) {
                return getResMessage("success", {
                    value  : value,
                    message: "action authorised / permitted"
                });
            } else {
                return getResMessage("unAuthorized", {
                    value  : value,
                    message: "You are not authorized to perform the requested action/task"
                });
            }
        } catch (e) {
            const ok: OkResponse = {ok: false};
            return getResMessage("unAuthorized", {value: ok, message: e.message});
        }
    }

    // taskPermissionByParams method determines the access permission by owner, role/group (on table/table or doc/record(s)) or admin
    // for various task-types: "create", "update", "delete"/"remove", "read"
    async taskPermissionByParams(taskType: TaskTypes | string): Promise<ResponseMessage> {
        try {
            // ids of records, from queryParams
            let recordIds: Array<string> = [];          // reset recordIds instance value
            if (this.currentRecs.length < 1) {
                const currentRecRes = await this.getCurrentRecords("queryParams");
                if (currentRecRes.code !== "success") {
                    return getResMessage("notFound", {message: "missing records, required to process permission"});
                }
                this.currentRecs = currentRecRes.value.records;
            }
            for (const rec of this.currentRecs) {
                recordIds.push(rec["id"]);
            }
            this.recordIds = recordIds;
            return await this.taskPermissionById(taskType);
        } catch (e) {
            // console.error("task-permission-error: ", e);
            return getResMessage("unAuthorized", {message: e.message});
        }
    }

    // checkLoginStatus method checks if the user exists and has active login status/token
    async checkLoginStatus(): Promise<ResponseMessage> {
        try {
            // validate models
            const validDb = await this.checkDb(this.appDb)
            if (validDb.code !== "success") {
                return validDb;
            }
            const validAccessDb = await this.checkDb(this.accessDb)
            if (validAccessDb.code !== "success") {
                return validAccessDb;
            }
            // check loginName, userId and token validity... from access table
            const queryText = `SELECT expire FROM ${this.accessTable}`
            const whereQuery = ` WHERE user_id=$1 AND login_name=$2 AND token=$3`
            const values = [this.userInfo.userId, this.userInfo.loginName, this.userInfo.token]
            const accessRes = await this.accessDb.query(queryText + whereQuery, values)

            // validate login status
            if (accessRes.rows.length > 0) {
                if (Date.now() > Number(accessRes.rows[0].expire)) {
                    return getResMessage("tokenExpired", {
                        message: "Access expired: please login to continue",
                    });
                }
            } else {
                return getResMessage("notFound", {
                    message: `Access information for ${this.userInfo.loginName} not found. Login first, or contact system administrator`,
                });
            }

            // check if user exists
            const queryText2 = `SELECT id, role_ids, is_active, is_admin, profile FROM ${this.userTable}`
            const whereQuery2 = ` WHERE id=$1 AND is_active=$2 AND (email=$3 OR username=$4)`
            const values2 = [this.userInfo.userId, true, this.userInfo.loginName, this.userInfo.loginName]
            const userRes = await this.accessDb.query(queryText2 + whereQuery2, values2)

            if (userRes.rows.length < 1) {
                return getResMessage("notFound", {
                    message: `User-profile information not found or inactive for ${this.userInfo.loginName}. Register a new account or contact system administrator. `,
                });
            }

            const checkAccessValue: CheckAccessType = {
                userId  : userRes.rows[0].id,
                roleId  : userRes.rows[0].profile.role_id,
                roleIds : userRes.rows[0].role_ids,
                isActive: userRes.rows[0].is_active,
                isAdmin : userRes.rows[0].is_admin || false,
                profile : userRes.rows[0].profile,
            }

            return getResMessage("success", {
                message: "Access Permitted: ",
                value  : checkAccessValue,
            });
        } catch (e) {
            console.error("check-login-status-error:", e);
            return getResMessage("unAuthorized", {
                message: "Unable to verify access information: " + e.message,
            });
        }
    }

}
