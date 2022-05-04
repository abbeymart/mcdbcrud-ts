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
export const GetTable = "audits_get"
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
    checkAccess  : false,
    auditTable   : "audits",
    userTable    : "users",
    profileTable : "profiles",
    serviceTable : "services",
    accessTable  : "accesses",
    verifyTable  : "verify_users",
    roleTable    : "roles",
    logCrud      : false,
    logCreate    : false,
    logUpdate    : false,
    logDelete    : false,
    logRead      : false,
    logLogin     : false,
    logLogout    : false,
    maxQueryLimit: 100000,
    msgFrom      : "support@mconnect.biz",
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
    "id"           : "b126f4c0-9bad-4242-bec1-4c4ab74ae481",
    "tableName"    : "groups",
    "logAt"        : new Date(),
    "logBy"        : UserId,
    "logRecords"   : LogRecords,
    "newLogRecords": NewLogRecords,
    "logType"      : TaskTypes.DELETE,
} as ActionParamType

export const AuditUpdateRecordByParam = {
    "id"           : "f380f132-422f-4cd4-82c1-07b4caf35da0",
    "tableName"    : "contacts",
    "logAt"        : new Date(),
    "logBy"        : UserId,
    "logRecords"   : LogRecords,
    "newLogRecords": NewLogRecords,
    "logType"      : TaskTypes.UPDATE,
} as ActionParamType

// GetIds: for get-records by ids & params | TODO: update ids after create

export const GetAuditById = "7461ae6c-96e0-4b4f-974b-9a0a7f91e016"
export const GetAuditByIds = ["7461ae6c-96e0-4b4f-974b-9a0a7f91e016",
    "aa9ba999-b138-414b-be66-9f0264e50f4a"] as Array<string>
export const GetAuditByParams = {
    "logType": "create",
} as QueryParamType

export const DeleteAuditById = "99f0f869-3c84-4a5e-83ac-3b9f893dcd60"
export const DeleteAuditByIds = [
    "9e9f7733-7653-4069-9f42-dc157768a960",
    "35304003-567f-4e25-9f1d-6483760db621",
    "d0a1445e-f12f-4d45-98e5-22689dec48e5",
    "39774322-9be5-4b43-9d6e-e2ba514e0f43",
] as Array<string>

export const DeleteAuditByParams = {
    "logType": "read",
} as QueryParamType

export const UpdateAuditById = "98bb024e-2b22-42b4-b379-7099166ad1c9"
export const UpdateAuditByIds = [
    "c158c19f-e396-4625-96ee-d054ef4f40a1",
    "e34b10f9-6320-4573-96cc-2cd8c69c9a89",
    "9b9acf43-9008-4261-9528-39f47f261adf",
] as Array<string>

export const UpdateAuditByParams = {
    "logType": "read",
} as QueryParamType
