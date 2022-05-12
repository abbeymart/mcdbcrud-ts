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

// 91b3c435-fce7-4d28-9e05-cc9feafb5b48
// 708713f2-ea16-404a-959c-2cb5762c394a
// 05a85b66-d68a-4f46-834d-b1c4f9c58a6c
// 03a24b50-9cf2-40b4-9375-1ad6b9831310
// 19209e24-d8cc-45a1-a7e9-4d7646b886f6
export const DeleteAuditById = "91b3c435-fce7-4d28-9e05-cc9feafb5b48"
export const DeleteAuditByIds = [
    "708713f2-ea16-404a-959c-2cb5762c394a",
    "05a85b66-d68a-4f46-834d-b1c4f9c58a6c",
    "03a24b50-9cf2-40b4-9375-1ad6b9831310",
    "19209e24-d8cc-45a1-a7e9-4d7646b886f6",
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
