// @Description: test-cases data: for get, delete and save record(s)


import {
    UserInfoType, CrudOptionsType, ActionParamType,
    ActionParamsType, TaskTypes, QueryParamsType, LogRecordsType,
} from "../src"

// Models

export interface AuditType {
    id: string;
    tableName: string;
    logRecords: LogRecordsType;
    newLogRecords: LogRecordsType;
    logType: string;
    logBy: string;
    logAt: Date;
}

export const AuditModel: AuditType = {
    id           : "",
    tableName    : "",
    logRecords   : {},
    newLogRecords: {},
    logType      : "",
    logBy        : "",
    logAt        : new Date(),
}

export const AuditTable = "audits"
export const GetTable = "audits"
export const DeleteTable = "audits_delete"
export const DeleteAllTable = "audits_delete_all"
export const UpdateTable = "audits_update"

export const UserId = "c85509ac-7373-464d-b667-425bb59b5738"

export const TestUserInfo: UserInfoType = {
    userId   : "c85509ac-7373-464d-b667-425bb59b5738",
    loginName: "abbeymart",
    email    : "abbeya1@yahoo.com",
    language : "en-US",
    firstname: "Abi",
    lastname : "Akindele",
    token    : "",
    expire   : 0,
}

export const CrudParamOptions: CrudOptionsType = {
    checkAccess   : false,
    auditTable    : "audits",
    userTable     : "users",
    profileTable  : "profiles",
    serviceTable  : "services",
    accessTable   : "accesses",
    verifyTable   : "verify_users",
    roleTable     : "roles",
    logCrud       : true,
    logCreate     : true,
    logUpdate     : true,
    logDelete     : true,
    logRead       : true,
    logLogin      : true,
    logLogout     : true,
    maxQueryLimit : 10000,
    msgFrom       : "support@mconnect.biz",
    cacheGetResult: false,
    getFromCache  : false,
}

export const LogRecords: ActionParamType = {
    "name"    : "Abi",
    "desc"    : "Testing only",
    "url"     : "localhost:9000",
    "priority": 100,
    "cost"    : 1000.00,
}

export const NewLogRecords: ActionParamType = {
    "name"    : "Abi Akindele",
    "desc"    : "Testing only - updated",
    "url"     : "localhost:9900",
    "priority": 1,
    "cost"    : 2000.00,
}

export const LogRecords2: ActionParamType = {
    "name"    : "Ola",
    "desc"    : "Testing only - 2",
    "url"     : "localhost:9000",
    "priority": 1,
    "cost"    : 10000.00,
}

export const NewLogRecords2: ActionParamType = {
    "name"    : "Ola",
    "desc"    : "Testing only - 2 - updated",
    "url"     : "localhost:9000",
    "priority": 1,
    "cost"    : 20000.00,
}

// create record(s)

export const AuditCreateRec1: ActionParamType = {
    "tableName" : "audits",
    "logAt"     : new Date(),
    "logBy"     : UserId,
    "logRecords": LogRecords,
    "logType"   : TaskTypes.CREATE,
}

export const AuditCreateRec2: ActionParamType = {
    "tableName" : "audits",
    "logAt"     : new Date(),
    "logBy"     : UserId,
    "logRecords": LogRecords2,
    "logType"   : TaskTypes.CREATE,
}

export const AuditUpdateRec1: ActionParamType = {
    "id"           : "c1c3f614-b10d-40a4-9269-4e03f5fcf55e",
    "tableName"    : "todos",
    "logAt"        : new Date(),
    "logBy"        : UserId,
    "logRecords"   : LogRecords,
    "newLogRecords": NewLogRecords,
    "logType"      : TaskTypes.UPDATE,
}

export const AuditUpdateRec2: ActionParamType = {
    "id"           : "003c1422-c7cb-476f-b96f-9c8028e04a14",
    "tableName"    : "todos",
    "logAt"        : new Date(),
    "logBy"        : UserId,
    "logRecords"   : LogRecords2,
    "newLogRecords": NewLogRecords2,
    "logType"      : TaskTypes.UPDATE,
}

export const AuditCreateActionParams: ActionParamsType = [
    AuditCreateRec1,
    AuditCreateRec2,
]

export const AuditUpdateActionParams: ActionParamsType = [
    AuditUpdateRec1,
    AuditUpdateRec2,
]

// TODO: update and delete params, by ids / queryParams

export const AuditUpdateRecordById: ActionParamType = {
    "id"           : "a345c33f-d9bf-47a4-aab5-3979528a0972",
    "tableName"    : "groups",
    "logAt"        : new Date(),
    "logBy"        : UserId,
    "logRecords"   : LogRecords,
    "newLogRecords": NewLogRecords,
    "logType"      : TaskTypes.DELETE,
}

export const AuditUpdateRecordByParam: ActionParamType = {
    "id"           : "d9cb7344-2c37-4492-9bf1-d6fa5ccc9634",
    "tableName"    : "contacts",
    "logAt"        : new Date(),
    "logBy"        : UserId,
    "logRecords"   : LogRecords,
    "newLogRecords": NewLogRecords,
    "logType"      : TaskTypes.UPDATE,
}

// GetIds: for get-records by ids & params

export const GetAuditById = "40afeaf8-abbb-43be-9c44-1642f393f0e9"
export const GetAuditByIds = ["40afeaf8-abbb-43be-9c44-1642f393f0e9",
    "5cd69f14-1945-400a-91fd-8ea6ca51cd64"] as Array<string>
export const GetAuditByParams: QueryParamsType = {
    "logType": "create",
}

export const DeleteAuditById = "d9cb7344-2c37-4492-9bf1-d6fa5ccc9634"
export const DeleteAuditByIds: Array<string> = [
    "40afeaf8-abbb-43be-9c44-1642f393f0e9",
    "5cd69f14-1945-400a-91fd-8ea6ca51cd64",
    "3e56eb70-9fa1-4881-b8b4-11a114cb5673",
    "91b3c435-fce7-4d28-9e05-cc9feafb5b48",
]

export const DeleteAuditByParams: QueryParamsType = {
    "logType": "read",
}

export const UpdateAuditById = "d9cb7344-2c37-4492-9bf1-d6fa5ccc9634"
export const UpdateAuditByIds:Array<string>  = [
    "d9cb7344-2c37-4492-9bf1-d6fa5ccc9634",
    "40afeaf8-abbb-43be-9c44-1642f393f0e9",
    "5cd69f14-1945-400a-91fd-8ea6ca51cd64",
]

export const UpdateAuditByParams:QueryParamsType = {
    "logType": "read",
}
