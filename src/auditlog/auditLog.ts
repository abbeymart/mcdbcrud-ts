/**
 * @Author: abbeymart | Abi Akindele | @Created: 2020-07-15
 * @Company: Copyright 2020 Abi Akindele  | mConnect.biz
 * @License: All Rights Reserved | LICENSE.md
 * @Description: audit-log (postgres-db) entry point
 */

// Import required module/function
import { getResMessage, ResponseMessage } from "@mconnect/mcresponse";
import { checkDb } from "../dbc";
import { Pool } from "pg";
import { isEmptyObject, LogRecordsType, ObjectRefType } from "../crud";

//types
export interface AuditLogOptionsType {
    tableName?: string;
    logRecords?: LogRecordsType;
    newLogRecords?: LogRecordsType;
    recordParams?: LogRecordsType;
    newRecordParams?: LogRecordsType;
    auditTable?: string;
}

export enum AuditLogTypes {
    CREATE = "create",
    UPDATE = "update",
    DELETE = "delete",
    REMOVE = "remove",
    GET = "get",
    READ = "read",
    LOGIN = "login",
    LOGOUT = "logout",
}

class AuditLog {
    private readonly dbHandle: Pool;
    private readonly auditTable: string;

    constructor(auditDb: Pool, auditTable = "audits") {
        this.dbHandle = auditDb;
        this.auditTable = auditTable;
    }

    getAuditTable(): string {
        return this.auditTable
    }

    async createLog(userId: string, logParams: AuditLogOptionsType): Promise<ResponseMessage> {
        const dbCheck = checkDb(this.dbHandle);
        if (dbCheck.code !== "success") {
            return dbCheck;
        }
        // Check/validate the attributes / parameters
        let errorMessage = "";
        if (!userId || userId === "") {
            errorMessage = errorMessage ? errorMessage + " | userId is required." :
                "userId is required.";
        }
        if (!logParams.tableName || logParams.tableName === "") {
            errorMessage = errorMessage ? errorMessage + " | Table or Collection name is required." :
                "Table or Collection name is required.";
        }
        if (!logParams.logRecords || isEmptyObject(logParams.logRecords as ObjectRefType)) {
            errorMessage = errorMessage ? errorMessage + " | Created record(s) information is required." :
                "Created record(s) information is required.";
        }
        if (errorMessage || errorMessage !== "") {
            console.log("error-message: ", errorMessage);
            return getResMessage("paramsError", {
                message: errorMessage,
            });
        }

        try {
            // insert audit record
            const queryText = `INSERT INTO ${this.auditTable}(table_name, log_records, log_type, log_by, log_at) VALUES($1, $2, $3, $4, $5);`
            const values = [logParams.tableName, logParams.logRecords, AuditLogTypes.CREATE, userId, new Date()]
            const query = {
                text  : queryText,
                values: values,
            }
            const res = await this.dbHandle.query(query)
            if (res.rowCount > 0) {
                return getResMessage("success", {
                    value: res,
                });
            } else {
                return getResMessage("insertError", {
                    value  : res,
                    message: "create-log-records-error",
                });
            }
        } catch (error) {
            console.error("Error saving create-audit record(s): ", error);
            return getResMessage("logError", {
                value  : error,
                message: "Error saving create-audit record(s): " + error.message,
            });
        }
    }

    async updateLog(userId: string, logParams: AuditLogOptionsType): Promise<ResponseMessage> {
        const dbCheck = checkDb(this.dbHandle);
        if (!dbCheck) {
            return dbCheck;
        }
        // Check/validate the attributes / parameters
        let errorMessage = "";
        if (!userId || userId === "") {
            errorMessage = errorMessage ? errorMessage + " | userId is required." :
                "userId is required.";
        }
        if (!logParams.tableName || logParams.tableName === "") {
            errorMessage = errorMessage ? errorMessage + " | Table or Collection name is required." :
                "Table or Collection name is required.";
        }
        if (!logParams.logRecords || isEmptyObject(logParams.logRecords as ObjectRefType)) {
            errorMessage = errorMessage ? errorMessage + " | Current record(s) information is required." :
                "Current record(s) information is required.";
        }
        if (!logParams.newLogRecords || isEmptyObject(logParams.newLogRecords as ObjectRefType)) {
            errorMessage = errorMessage ? errorMessage + " | Updated record(s) information is required." :
                "Updated record(s) information is required.";
        }
        if (errorMessage || errorMessage !== "") {
            return getResMessage("paramsError", {
                message: errorMessage,
            });
        }

        try {
            // insert audit record
            const queryText = `INSERT INTO ${this.auditTable}(table_name, log_records, new_log_records, log_type, log_by, log_at ) VALUES($1, $2, $3, $4, $5, $6);`
            const values = [logParams.tableName, logParams.logRecords, logParams.newLogRecords, AuditLogTypes.UPDATE,
                userId, new Date()]
            const query = {
                text  : queryText,
                values: values,
            }
            const res = await this.dbHandle.query(query)
            if (res.rowCount > 0) {
                return getResMessage("success", {
                    value: res,
                });
            } else {
                return getResMessage("insertError", {
                    value  : res,
                    message: "create-log-records-error",
                });
            }
        } catch (error) {
            console.error("Error saving update-audit record(s): ", error);
            return getResMessage("insertError", {
                value  : error,
                message: "Error saving update-audit record(s): " + error.message,
            });
        }
    }

    async readLog(logParams: AuditLogOptionsType, userId: string = ""): Promise<ResponseMessage> {
        const dbCheck = checkDb(this.dbHandle);
        if (!dbCheck) {
            return dbCheck;
        }
        // validate params/values
        let errorMessage = "";
        if (!logParams.tableName || logParams.tableName === "") {
            errorMessage = errorMessage ? errorMessage + " | Table or Collection name is required." :
                "Table or Collection name is required.";
        }
        if (!logParams.logRecords || isEmptyObject(logParams.logRecords as ObjectRefType)) {
            errorMessage = errorMessage ?
                errorMessage + " | Search keywords or Read record(s) information is required." :
                "Search keywords or Read record(s) information is required.";
        }
        if (errorMessage || errorMessage !== "") {
            return getResMessage("paramsError", {
                message: errorMessage,
            });
        }

        try {
            // insert audit record
            let queryText: string
            let values: Array<any>
            if (userId || userId !== "") {
                queryText = `INSERT INTO ${this.auditTable}(table_name, log_records, log_type, log_by, log_at ) VALUES($1, $2, $3, $4, $5);`
                values = [logParams.tableName, logParams.logRecords, AuditLogTypes.READ, userId, new Date()]
            } else {
                queryText = `INSERT INTO ${this.auditTable}(table_name, log_records, log_type, log_at ) VALUES($1, $2, $3, $4);`
                values = [logParams.tableName, logParams.logRecords, AuditLogTypes.READ, new Date()]
            }
            const query = {
                text  : queryText,
                values: values,
            }
            const res = await this.dbHandle.query(query)
            if (res.rowCount > 0) {
                return getResMessage("success", {
                    value: res,
                });
            } else {
                return getResMessage("insertError", {
                    value  : res,
                    message: "create-log-records-error",
                });
            }
        } catch (error) {
            console.error("Error inserting read/search-audit record(s): ", error);
            return getResMessage("insertError", {
                value  : error,
                message: "Error inserting read/search-audit record(s):" + error.message,
            });
        }
    }

    async deleteLog(userId: string, logParams: AuditLogOptionsType): Promise<ResponseMessage> {
        const dbCheck = checkDb(this.dbHandle);
        if (!dbCheck) {
            return dbCheck;
        }
        // Check/validate the attributes / parameters
        let errorMessage = "";
        if (!userId || userId === "") {
            errorMessage = errorMessage ? errorMessage + " | userId is required." :
                "userId is required.";
        }
        if (!logParams.tableName || logParams.tableName === "") {
            errorMessage = errorMessage ? errorMessage + " | Table or Collection name is required." :
                "Table or Collection name is required.";
        }
        if (!logParams.logRecords || isEmptyObject(logParams.logRecords as ObjectRefType)) {
            errorMessage = errorMessage ? errorMessage + " | Deleted record(s) information is required." :
                "Deleted record(s) information is required.";
        }
        if (errorMessage || errorMessage !== "") {
            return getResMessage("paramsError", {
                message: errorMessage,
            });
        }

        try {
            // insert audit record
            const queryText = `INSERT INTO ${this.auditTable}(table_name, log_records, log_type, log_by, log_at ) VALUES($1, $2, $3, $4, $5);`
            const values = [logParams.tableName, logParams.logRecords, AuditLogTypes.DELETE, userId, new Date()]
            const query = {
                text  : queryText,
                values: values,
            }
            const res = await this.dbHandle.query(query)
            if (res.rowCount > 0) {
                return getResMessage("success", {
                    value: res,
                });
            } else {
                return getResMessage("insertError", {
                    value  : res,
                    message: "create-log-records-error",
                });
            }
        } catch (error) {
            console.log("Error saving delete-audit record(s): ", error);
            return getResMessage("insertError", {
                value  : error,
                message: "Error inserting delete-audit record(s):" + error.message,
            });
        }
    }

    async loginLog(logParams: AuditLogOptionsType, userId: string = "", tableName = "users"): Promise<ResponseMessage> {
        const dbCheck = checkDb(this.dbHandle);
        if (!dbCheck) {
            return dbCheck;
        }
        // validate params/values
        let errorMessage = "";
        const logTableName = logParams.tableName || tableName;
        if (!logParams.logRecords || isEmptyObject(logParams.logRecords as ObjectRefType)) {
            errorMessage = errorMessage + " | Login information is required."
        }
        if (errorMessage || errorMessage !== "") {
            return getResMessage("paramsError", {
                message: errorMessage,
            });
        }

        try {
            // insert audit record
            let queryText: string
            let values: Array<any>
            if (userId || userId !== "") {
                queryText = `INSERT INTO ${this.auditTable}(table_name, log_records, log_type, log_by, log_at ) VALUES($1, $2, $3, $4, $5);`
                values = [logTableName, logParams.logRecords, AuditLogTypes.LOGIN, userId, new Date()]
            } else {
                queryText = `INSERT INTO ${this.auditTable}(table_name, log_records, log_type, log_at ) VALUES($1, $2, $3, $4);`
                values = [logTableName, logParams.logRecords, AuditLogTypes.LOGIN, new Date()]
            }
            const query = {
                text  : queryText,
                values: values,
            }
            const res = await this.dbHandle.query(query)
            if (res.rowCount > 0) {
                return getResMessage("success", {
                    value: res,
                });
            } else {
                return getResMessage("insertError", {
                    value  : res,
                    message: "create-log-records-error",
                });
            }
        } catch (error) {
            console.log("Error inserting login-audit record(s): ", error);
            return getResMessage("insertError", {
                value  : error,
                message: "Error inserting login-audit record(s):" + error.message,
            });
        }
    }

    async logoutLog(userId: string, logParams: AuditLogOptionsType, tableName = "users"): Promise<ResponseMessage> {
        const dbCheck = checkDb(this.dbHandle);
        if (!dbCheck) {
            return dbCheck;
        }
        // validate params/values
        let errorMessage = "";
        const logTableName = logParams.tableName || tableName;
        if (!userId || userId === "") {
            errorMessage = errorMessage + " | userId is required."
        }
        if (!logParams.logRecords || isEmptyObject(logParams.logRecords as ObjectRefType)) {
            errorMessage = errorMessage + " | Logout information is required."
        }
        if (errorMessage || errorMessage !== "") {
            return getResMessage("paramsError", {
                message: errorMessage,
            });
        }

        try {
            // insert audit record
            const queryText = `INSERT INTO ${this.auditTable}(table_name, log_records, log_type, log_by, log_at ) VALUES($1, $2, $3, $4, $5);`
            const values = [logTableName, logParams.logRecords, AuditLogTypes.LOGOUT, userId, new Date()]
            const query = {
                text  : queryText,
                values: values,
            }
            const res = await this.dbHandle.query(query)
            if (res.rowCount > 0) {
                return getResMessage("success", {
                    value: res,
                });
            } else {
                return getResMessage("insertError", {
                    value  : res,
                    message: "create-log-records-error",
                });
            }
        } catch (error) {
            console.log("Error inserting logout-audit record(s): ", error);
            return getResMessage("insertError", {
                value  : error,
                message: "Error inserting login-audit record(s):" + error.message,
            });
        }
    }

    async auditLog(logType: string, logParams: AuditLogOptionsType, userId: string = "") {
        const dbCheck = checkDb(this.dbHandle);
        if (!dbCheck) {
            return dbCheck;
        }
        // Check/validate the attributes / parameters by logTypes (create, update, delete, read, login, logout...)
        let errorMessage = "",
            query: { text: string; values: Array<any> } = {text: "", values: []};

        // set share variable-values
        logType = logType.toLowerCase();
        let tableName = logParams && logParams.tableName ? logParams.tableName : "";
        const logRecords = logParams && logParams.logRecords && !isEmptyObject(logParams.logRecords) ?
            logParams.logRecords : {};
        const newLogRecords = logParams && logParams.newLogRecords && !isEmptyObject(logParams.newLogRecords) ?
            logParams.newLogRecords : {}; // object or array

        switch (logType) {
            case "create":
            case AuditLogTypes.CREATE:
                // validate params/values
                if (!tableName || tableName === "") {
                    errorMessage = errorMessage ? errorMessage + " | Table or Collection name is required." :
                        "Table or Collection name is required.";
                }
                if (!userId || userId === "") {
                    errorMessage = errorMessage ? errorMessage + " | userId is required." :
                        "userId is required.";
                }
                if (!logRecords || isEmptyObject(logRecords as ObjectRefType)) {
                    errorMessage = errorMessage ? errorMessage + " | Created record(s) information is required." :
                        "Created record(s) information is required.";
                }
                if (errorMessage || errorMessage !== "") {
                    return getResMessage("paramsError", {
                        message: errorMessage,
                    });
                }

                query = {
                    text  : `INSERT INTO ${this.auditTable}(table_name, log_records, log_type, log_by, log_at ) VALUES($1, $2, $3, $4, $5);`,
                    values: [tableName, logRecords, AuditLogTypes.CREATE, userId, new Date()],
                }
                break;
            case "update":
            case AuditLogTypes.UPDATE:
                // validate params/values
                if (!tableName || tableName === "") {
                    errorMessage = errorMessage ? errorMessage + " | Table or Collection name is required." :
                        "Table or Collection name is required.";
                }
                if (!userId || userId === "") {
                    errorMessage = errorMessage ? errorMessage + " | userId is required." :
                        "userId is required.";
                }
                if (!logRecords || isEmptyObject(logRecords as ObjectRefType)) {
                    errorMessage = errorMessage ? errorMessage + " | Current record(s) information is required." :
                        "Current record(s) information is required.";
                }
                if (!newLogRecords || isEmptyObject(newLogRecords as ObjectRefType)) {
                    errorMessage = errorMessage ? errorMessage + " | Updated record(s) information is required." :
                        "Updated record(s) information is required.";
                }
                if (errorMessage || errorMessage !== "") {
                    return getResMessage("paramsError", {
                        message: errorMessage,
                    });
                }
                query = {
                    text  : `INSERT INTO ${this.auditTable}(table_name, log_records, new_log_records, log_type, log_by, log_at ) VALUES($1, $2, $3, $4, $5, $6);`,
                    values: [tableName, logRecords, newLogRecords, AuditLogTypes.UPDATE, userId, new Date()],
                }
                break;
            case "remove":
            case "delete":
            case AuditLogTypes.DELETE:
            case AuditLogTypes.REMOVE:
                // Check/validate the attributes / parameters
                if (!tableName || tableName === "") {
                    errorMessage = errorMessage ? errorMessage + " | Table or Collection name is required." :
                        "Table or Collection name is required.";
                }
                if (!userId || userId === "") {
                    errorMessage = errorMessage ? errorMessage + " | userId is required." :
                        "userId is required.";
                }
                if (!logRecords || isEmptyObject(logRecords as ObjectRefType)) {
                    errorMessage = errorMessage ? errorMessage + " | Deleted record(s) information is required." :
                        "Deleted record(s) information is required.";
                }
                if (errorMessage || errorMessage !== "") {
                    return getResMessage("paramsError", {
                        message: errorMessage,
                    });
                }
                query = {
                    text  : `INSERT INTO ${this.auditTable}(table_name, log_records, log_type, log_by, log_at ) VALUES($1, $2, $3, $4, $5);`,
                    values: [tableName, logRecords, AuditLogTypes.DELETE, userId, new Date()],
                }
                break;
            case "read":
            case AuditLogTypes.GET:
            case AuditLogTypes.READ:
                // validate params/values
                if (!tableName || tableName === "") {
                    errorMessage = errorMessage ? errorMessage + " | Table or Collection name is required." :
                        "Table or Collection name is required.";
                }
                if (!logRecords || isEmptyObject(logRecords as ObjectRefType)) {
                    errorMessage = errorMessage ?
                        errorMessage + " | Search keywords or Read record(s) information is required." :
                        "Search keywords or Read record(s) information is required.";
                }
                if (errorMessage || errorMessage !== "") {
                    return getResMessage("paramsError", {
                        message: errorMessage,
                    });
                }

                let queryTextRead: string
                let valuesRead: Array<any>
                if (userId || userId !== "") {
                    queryTextRead = `INSERT INTO ${this.auditTable}(table_name, log_records, log_type, log_by, log_at ) VALUES($1, $2, $3, $4, $5);`
                    valuesRead = [tableName, logRecords, AuditLogTypes.READ, userId, new Date()]
                } else {
                    queryTextRead = "INSERT INTO " + this.auditTable + " (table_name, log_records, log_type, log_at ) VALUES($1, $2, $3, $4);"
                    valuesRead = [tableName, logRecords, AuditLogTypes.READ, new Date()]
                }
                query = {
                    text  : queryTextRead,
                    values: valuesRead,
                }
                break;
            case "login":
            case AuditLogTypes.LOGIN:
                // validate params/values
                if (!logRecords || isEmptyObject(logRecords as ObjectRefType)) {
                    errorMessage = errorMessage + " | Login information is required."
                }
                if (errorMessage || errorMessage !== "") {
                    return getResMessage("paramsError", {
                        message: errorMessage,
                    });
                }
                tableName = tableName || "users"
                let queryTextLogin: string
                let valuesLogin: Array<any>
                if (userId || userId !== "") {
                    queryTextLogin = `INSERT INTO ${this.auditTable}(table_name, log_records, log_type, log_by, log_at ) VALUES($1, $2, $3, $4, $5);`
                    valuesLogin = [tableName, logRecords, AuditLogTypes.LOGIN, userId, new Date()]
                } else {
                    queryTextLogin = "INSERT INTO " + this.auditTable + " (table_name, log_records, log_type, log_at ) VALUES($1, $2, $3, $4);"
                    valuesLogin = [tableName, logRecords, AuditLogTypes.LOGIN, new Date()]
                }
                query = {
                    text  : queryTextLogin,
                    values: valuesLogin,
                }
                break;
            case "logout":
            case AuditLogTypes.LOGOUT:
                // validate params/values
                if (!userId || userId === "") {
                    errorMessage = errorMessage + " | userId is required."
                }
                if (!logRecords || isEmptyObject(logRecords as ObjectRefType)) {
                    errorMessage = errorMessage + " | Logout information is required."
                }
                if (errorMessage || errorMessage !== "") {
                    return getResMessage("paramsError", {
                        message: errorMessage,
                    });
                }
                tableName = tableName || "users"
                query = {
                    text  : `INSERT INTO ${this.auditTable}(table_name, log_records, log_type, log_by, log_at ) VALUES($1, $2, $3, $4, $5);`,
                    values: [tableName, logRecords, AuditLogTypes.LOGOUT, userId, new Date()],
                }
                break;
            default:
                return getResMessage("insertError", {
                    message: "Unknown log type and/or incomplete log information",
                });
        }
        // perform insert task - insert audit record
        try {
            const res = await this.dbHandle.query(query)
            if (res.rowCount > 0) {
                return getResMessage("success", {
                    value: res,
                });
            } else {
                return getResMessage("insertError", {
                    value  : res,
                    message: "create-log-records-error",
                });
            }
        } catch (error) {
            console.log("Error saving audit-log record(s): ", error);
            return getResMessage("insertError", {
                value  : error,
                message: "Error inserting audit-log record(s):" + error.message,
            });
        }
    }
}

function newAuditLog(auditDb: Pool, auditTable = "audits") {
    return new AuditLog(auditDb, auditTable);
}

export { AuditLog, newAuditLog };
