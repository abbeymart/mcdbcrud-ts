/**
 * @Author: abbeymart | Abi Akindele | @Created: 2020-07-23
 * @Company: Copyright 2020 Abi Akindele  | mConnect.biz
 * @License: All Rights Reserved | LICENSE.md
 * @Description: CRUD types
 */

import {AuditLog}        from "../auditlog";
import {ResponseMessage} from "@mconnect/mcresponse";
import {Pool}            from "pg";

export interface ObjectRefType {
    [key: string]: any;
}

export type ObjectType = ObjectRefType | object;

export interface GetRecordStats {
    skip?: number;
    limit?: number;
    recordsCount?: number;
    totalRecordsCount?: number;
    queryParams?: QueryParamType;
    recordIds?: Array<string>;
    expire?: number;
}

export type GetRecords = Array<ObjectType>;

export interface GetResultType {
    records: GetRecords,
    stats: GetRecordStats,
    logRes?: ResponseMessage;
    taskType?: string;
}

export interface DeleteResultType {
    recordsCount: number,
    logRes?: ResponseMessage;
}

export interface LogRecordsType {
    logRecords: any;
    queryParams?: QueryParamType;
    recordIds?: Array<string>;
}

export interface CrudResultType {
    queryParams?: QueryParamType;
    recordIds?: Array<string>;
    recordsCount?: number;
    records?: ActionParamsType;
    taskType?: string;
    logRes?: ResponseMessage;
}

export interface SaveResultType {
    recordsCount: number;
    taskType?: string;
    logRes?: ResponseMessage;
    recordIds?: Array<string>;
    queryParams?: QueryParamType;
}

export enum TaskTypes {
    CREATE = "create",
    INSERT = "insert",
    UPDATE = "update",
    READ = "read",
    DELETE = "delete",
    REMOVE = "remove",
    UNKNOWN = "unknown",
}

export interface EmailAddressType {
    [key: string]: string,
}

export interface UserInfoType {
    userId?: string;
    firstname?: string;
    lastname?: string;
    language?: string;
    loginName?: string;
    token?: string;
    expire?: number;
    group?: string;
    email?: string;
}

export interface BaseModelType {
    _id?: string;
    language?: string;
    desc?: string;
    isActive?: boolean;
    createdBy?: string | null;
    updatedBy?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
    appId?: string | null;  // application-id in a multi-hosted apps environment (e.g. cloud-env)
}

///  UserProfile: writeable by user / account owner
export interface UserProfileType extends BaseModelType {
    userId?: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    fullName?: string;
    recoveryEmail: string;
    phone: string;
    emails?: Array<EmailAddressType>,
    roleId?: string | null;
    dob?: Date;
    twoFactorAuth?: boolean;
    authAgent?: string;
    authPhone?: string;
    postalCode?: string;
    userInfo?: UserInfoType;
    reqUrl?: string;
}

export interface UserType extends BaseModelType {
    username: string,           // must be unique (=> controller)
    password: string;           // must be encrypted before save (=> controller)
    email: string;              // must be unique (=> controller)
    roleIds?: Array<string>;      // default => [] (=> controller)
    profile: UserProfileType;
    acceptTerm: boolean;        // must be true at registration (validate)
    verified?: boolean;         // default to false, changed after user email-verification
    isAdmin?: boolean;          // default to false, changed by admin-user (=> controller
    apiToken?: string;
    canUpload?: boolean;
    appIds?: Array<string>;
    userInfo?: UserInfoType;
    reqUrl?: string;
    taskType?: TaskTypes | string;
}

export interface OkResponse {
    ok: boolean;
}

export enum ServiceCategory {
    Solution = "solution",
    Microservice = "microservice",
    PackageGroup = "package group",
    Package = "package",
    Function = "function",
    UseCase = "use case",
    Table = "table",
    Collection = "collection",
    Documentation = "documentation",
    FastLinks = "fast links",
}

export interface SubItemsType {
    tableName: string;
    hasRelationRecords: boolean;
}

export interface RoleServiceResponseType {
    serviceId: string;
    roleId: string;
    roleIds: Array<string>;
    serviceCategory: string;
    canRead: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    canCrud: boolean;
    tableAccessPermitted?: boolean;
}

export interface CheckAccessType {
    userId: string;
    roleId: string;
    roleIds: Array<string>;
    isActive: boolean;
    isAdmin: boolean;
    profile: UserProfileType;
    roleServices?: Array<RoleServiceResponseType>;
    tableId?: string;
}

export interface TaskAccessType {
    userId: string;
    roleId: string;
    roleIds: Array<string>;
    isActive: boolean;
    isAdmin: boolean;
    roleServices: Array<RoleServiceResponseType>;
    profile?: UserProfileType;
    tableId?: string;
    ownerPermitted?: boolean;
}

export interface RoleServiceType {
    serviceId: string;
    groupId: string;
    serviceCategory: string;
    canRead: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    tableAccessPermitted?: boolean;
}

export interface RoleFuncType {
    (it1: string, it2: RoleServiceResponseType): boolean;
}

export type FieldValueTypes =
    string
    | number
    | boolean
    | object
    | Array<string>
    | Array<number>
    | Array<boolean>
    | Array<object>
    | unknown;

export type PromiseResponseType = Promise<string>
    | Promise<number>
    | Promise<boolean>
    | Promise<Array<string>>
    | Promise<Array<number>>
    | Promise<Array<boolean>>
    | Promise<Array<object>>;

// ModelValue will be validated based on the Model definition
export interface ActionParamType {
    [key: string]: any;         // fieldName: fieldValue, must match fieldType (re: validate) in model definition
}

export type ActionParamsType = Array<ActionParamType>;  // documents for create or update task/operation

export interface QueryParamType {
    [key: string]: any;
}

export interface ExistParamItemType {
    [key: string]: any;
}

export type ExistParamType = Array<ExistParamItemType>;

export interface ProjectParamType {
    [key: string]: number; // 1 for inclusion and 0 for exclusion
}

export interface SortParamType {
    [key: string]: number;          // 1 for "asc", -1 for "desc"
}

export interface ActionParamTaskType {
    createItems: ActionParamsType;
    updateItems: ActionParamsType;
    recordIds: Array<string>;
}

// AppParamsType is the type for validating app-access
export interface AppParamsType {
    appId: string;
    accessKey: string;
    appName: string; // optional app-name
    category: string;
    serviceId: string;
    serviceTag: string;
}

export interface CrudParamType {
    appDb: Pool;
    table: string;
    token?: string;
    userInfo?: UserInfoType;
    userId?: string;
    group?: string;
    groups?: Array<string>;
    role?: string;
    roles?: Array<string>;
    recordIds?: Array<any>;
    actionParams: ActionParamsType;
    queryParams?: QueryParamType;
    existParams?: ExistParamType;
    projectParams?: ProjectParamType;
    sortParams?: SortParamType;
    skip?: number;
    limit?: number;
    parentTables?: Array<string>;
    childTables?: Array<string>;
    recursiveDelete?: boolean;
    checkAccess?: boolean;
    accessDb: Pool;
    auditDb: Pool;
    auditTable?: string;
    serviceTable?: string;
    userTable?: string;
    roleTable?: string;
    accessTable?: string;
    maxQueryLimit?: number;
    logCrud?: boolean;
    logCreate?: boolean;
    logUpdate?: boolean;
    logRead?: boolean;
    logDelete?: boolean;
    transLog: AuditLog;
    hashKey: string;
    isRecExist?: boolean;
    actionAuthorized?: boolean;
    unAuthorizedMessage?: string;
    recExistMessage?: string;
    isAdmin?: boolean;
    createItems?: Array<object>;
    updateItems?: Array<object>;
    currentRecs?: Array<object>;
    roleServices?: Array<RoleServiceResponseType>;
    subItems: Array<boolean>;
    cacheExpire?: number;
    params: CrudParamsType;
}

export interface ModelOptionsType {
    timeStamp: boolean;
    actorStamp: boolean;
    activeStamp: boolean;
}

export interface CrudParamsType {
    modelRef: ActionParamType;
    appDb: Pool;
    table: string;
    userInfo?: UserInfoType;
    nullValues?: ActionParamType;
    defaultValues?: ActionParamType;
    actionParams?: ActionParamsType;
    existParams?: ExistParamType;
    queryParams?: QueryParamType;
    recordIds?: Array<string>;
    projectParams?: ProjectParamType;
    sortParams?: SortParamType;
    token?: string;
    options?: CrudOptionsType;
    taskName?: string;
    taskType?: TaskTypes | string;
    skip?: number;
    limit?: number;
    appParams?: AppParamsType;
}

export enum CrudQueryFieldType {
    Underscore = "underscore",
    Custom = "custom",
}

export interface CrudOptionsType {
    skip?: number;
    limit?: number;
    checkAccess?: boolean
    auditTable?: string;
    serviceTable?: string;
    userTable?: string;
    profileTable?: string;
    roleTable?: string;
    accessTable?: string;
    verifyTable?: string;
    userRoleTable?: string;
    accessDb?: Pool;
    auditDb?: Pool;
    serviceDb?: Pool;
    maxQueryLimit?: number;
    logCrud?: boolean;
    logCreate?: boolean;
    logUpdate?: boolean;
    logRead?: boolean;
    logDelete?: boolean;
    logLogin?: boolean;
    logLogout?: boolean;
    unAuthorizedMessage?: string;
    recExistMessage?: string;
    cacheExpire?: number;
    loginTimeout?: number;
    usernameExistsMessage?: string;
    emailExistsMessage?: string
    msgFrom?: string;
    modelOptions?: ModelOptionsType;
    fieldSeparator?: string;
    queryFieldType?: CrudQueryFieldType;
    getAllRecords?: boolean;
}

export interface CreateQueryObject {
    createQuery: string;
    fieldNames: Array<string>;
    fieldValues: Array<Array<any>>;
}

export interface CreateQueryResult {
    createQueryObject: CreateQueryObject,
    ok: boolean;
    message: string;
}

export interface WhereQueryObject {
    whereQuery: string;
    fieldValues: Array<any>;
}

export interface WhereQueryResult {
    whereQueryObject: WhereQueryObject,
    ok: boolean;
    message: string;
}

export interface UpdateQueryObject {
    updateQuery: string;
    fieldNames: Array<string>;
    fieldValues: Array<any>;
}

export interface UpdateQueryResult {
    updateQueryObject: UpdateQueryObject,
    ok: boolean,
    message: string;
}

export interface MultiUpdateQueryResult {
    updateQueryObjects: Array<UpdateQueryObject>,
    ok: boolean,
    message: string;
}

export interface DeleteQueryObject {
    deleteQuery: string;
    fieldValues: Array<any>;
}

export interface DeleteQueryResult {
    deleteQueryObject: DeleteQueryObject,
    ok: boolean,
    message: string;
}

export interface SelectQueryObject {
    selectQuery: string;
    fieldValues: Array<any>;
    fieldNames: Array<string>;
}

export interface SelectQueryResult {
    selectQueryObject: SelectQueryObject,
    ok: boolean,
    message: string;
}

export interface MessageObject {
    [key: string]: string;
}

export interface ValidateResponseType {
    ok: boolean;
    errors?: MessageObject;
}

export interface OkResponse {
    ok: boolean;
}

export interface RecordCountResultType {
    totalRecords: number;
    ok: boolean;
    message: string;
}

export interface OwnerRecordCountResultType {
    ownerRecords: number;
    ok: boolean;
    message: string;
}