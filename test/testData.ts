// @Description: test-cases data: for get, delete and save record(s)


import {
    UserInfoType, CrudOptionsType, ActionParamType,
    ActionParamsType, TaskTypes, QueryParamType,
} from "../src"

// Models

export interface AuditType {
    id: string;
    tableName: string;
    logRecords: any;
    newLogRecords: any;
    logType: string;
    logBy: string;
    logAt: Date;
}

export const AuditModel = {
    id           : "",
    tableName    : "",
    logRecords   : null,
    newLogRecords: null,
    logType      : "",
    logBy        : "",
    logAt        : new Date(),
} as AuditType

export const AuditTable = "audits"
export const GetTable = "audits"
export const DeleteTable = "audits_delete"
export const DeleteAllTable = "audits_delete_all"
export const UpdateTable = "audits_update"

export const UserId = "c85509ac-7373-464d-b667-425bb59b5738" // TODO: review/update

export const TestUserInfo = {
    userId   : "c85509ac-7373-464d-b667-425bb59b5738",
    loginName: "abbeymart",
    email    : "abbeya1@yahoo.com",
    language : "en-US",
    firstname: "Abi",
    lastname : "Akindele",
    token    : "",
    expire   : 0,
    roleId   : "",
} as UserInfoType

export const CrudParamOptions = {
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
    logLogin      : false,
    logLogout     : false,
    maxQueryLimit : 10000,
    msgFrom       : "support@mconnect.biz",
    cacheGetResult: false,
    getFromCache  : false,
} as CrudOptionsType

// TODO: create/update, get & delete records for groups & categories tables

export const LogRecords = {
    "name"    : "Abi",
    "desc"    : "Testing only",
    "url"     : "localhost:9000",
    "priority": 100,
    "cost"    : 1000.00,
} as ActionParamType

export const NewLogRecords = {
    "name"    : "Abi Akindele",
    "desc"    : "Testing only - updated",
    "url"     : "localhost:9900",
    "priority": 1,
    "cost"    : 2000.00,
} as ActionParamType

export const LogRecords2 = {
    "name"    : "Ola",
    "desc"    : "Testing only - 2",
    "url"     : "localhost:9000",
    "priority": 1,
    "cost"    : 10000.00,
} as ActionParamType

export const NewLogRecords2 = {
    "name"    : "Ola",
    "desc"    : "Testing only - 2 - updated",
    "url"     : "localhost:9000",
    "priority": 1,
    "cost"    : 20000.00,
} as ActionParamType

// create record(s)

export const AuditCreateRec1 = {
    "tableName" : "audits",
    "logAt"     : new Date(),
    "logBy"     : UserId,
    "logRecords": LogRecords,
    "logType"   : TaskTypes.CREATE,
} as ActionParamType

export const AuditCreateRec2 = {
    "tableName" : "audits",
    "logAt"     : new Date(),
    "logBy"     : UserId,
    "logRecords": LogRecords2,
    "logType"   : TaskTypes.CREATE,
} as ActionParamType

export const AuditUpdateRec1 = {
    "id"           : "c1c3f614-b10d-40a4-9269-4e03f5fcf55e",
    "tableName"    : "todos",
    "logAt"        : new Date(),
    "logBy"        : UserId,
    "logRecords"   : LogRecords,
    "newLogRecords": NewLogRecords,
    "logType"      : TaskTypes.UPDATE,
} as ActionParamType

export const AuditUpdateRec2 = {
    "id"           : "003c1422-c7cb-476f-b96f-9c8028e04a14",
    "tableName"    : "todos",
    "logAt"        : new Date(),
    "logBy"        : UserId,
    "logRecords"   : LogRecords2,
    "newLogRecords": NewLogRecords2,
    "logType"      : TaskTypes.UPDATE,
} as ActionParamType

export const AuditCreateActionParams = [
    AuditCreateRec1,
    AuditCreateRec2,
] as ActionParamsType

export const AuditUpdateActionParams = [
    AuditUpdateRec1,
    AuditUpdateRec2,
] as ActionParamsType

// TODO: update and delete params, by ids / queryParams

export const AuditUpdateRecordById = {
    "id"           : "a345c33f-d9bf-47a4-aab5-3979528a0972",
    "tableName"    : "groups",
    "logAt"        : new Date(),
    "logBy"        : UserId,
    "logRecords"   : LogRecords,
    "newLogRecords": NewLogRecords,
    "logType"      : TaskTypes.DELETE,
} as ActionParamType

export const AuditUpdateRecordByParam = {
    "id"           : "d9cb7344-2c37-4492-9bf1-d6fa5ccc9634",
    "tableName"    : "contacts",
    "logAt"        : new Date(),
    "logBy"        : UserId,
    "logRecords"   : LogRecords,
    "newLogRecords": NewLogRecords,
    "logType"      : TaskTypes.UPDATE,
} as ActionParamType

// GetIds: for get-records by ids & params | TODO: update ids after create

export const GetAuditById = "40afeaf8-abbb-43be-9c44-1642f393f0e9"
export const GetAuditByIds = ["40afeaf8-abbb-43be-9c44-1642f393f0e9",
    "5cd69f14-1945-400a-91fd-8ea6ca51cd64"] as Array<string>
export const GetAuditByParams = {
    "logType": "create",
} as QueryParamType

// 91b3c435-fce7-4d28-9e05-cc9feafb5b48
// 708713f2-ea16-404a-959c-2cb5762c394a
// 05a85b66-d68a-4f46-834d-b1c4f9c58a6c
// 03a24b50-9cf2-40b4-9375-1ad6b9831310
// 19209e24-d8cc-45a1-a7e9-4d7646b886f6
export const DeleteAuditById = "d9cb7344-2c37-4492-9bf1-d6fa5ccc9634"
export const DeleteAuditByIds = [
    "40afeaf8-abbb-43be-9c44-1642f393f0e9",
    "3e56eb70-9fa1-4881-b8b4-11a114cb5673",
    "2cb32875-2268-4636-a2da-298611a19fd3",
    "7bedcf6d-d229-4553-9ff0-19011e7ac0ff",
] as Array<string>

export const DeleteAuditByParams = {
    "logType": "read",
} as QueryParamType

export const UpdateAuditById = "d9cb7344-2c37-4492-9bf1-d6fa5ccc9634"
export const UpdateAuditByIds = [
    "d9cb7344-2c37-4492-9bf1-d6fa5ccc9634",
    "40afeaf8-abbb-43be-9c44-1642f393f0e9",
    "8d090d92-a916-4683-8619-4aa1484c6544",
] as Array<string>

export const UpdateAuditByParams = {
    "logType": "read",
} as QueryParamType
