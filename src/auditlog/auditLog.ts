/**
 * @Author: abbeymart | Abi Akindele | @Created: 2020-07-15
 * @Company: Copyright 2020 Abi Akindele  | mConnect.biz
 * @License: All Rights Reserved | LICENSE.md
 * @Description: audit-log (postgres-db) entry point
 */

// Import required module/function
import {getResMessage, ResponseMessage} from "@mconnect/mcresponse";
import {checkDb} from "../dbc";
import {Pool} from "pg";

//types
export interface AuditLogOptionsType {
    tableName?: string;
    logRecords?: any;
    newLogRecords?: any;
    recordParams?: any;
    newRecordParams?: any;
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

    async createLog(tableName: string, logRecords: any, userId: string): Promise<ResponseMessage> {
        const dbCheck = checkDb(this.dbHandle);
        if (dbCheck.code !== "success") {
            return dbCheck;
        }

        // Check/validate the attributes / parameters
        let errorMessage = "";
        if (!tableName) {
            errorMessage = errorMessage ? errorMessage + " | Table or Collection name is required." :
                "Table or Collection name is required.";
        }
        if (!userId) {
            errorMessage = errorMessage ? errorMessage + " | userId is required." :
                "userId is required.";
        }
        if (!logRecords) {
            errorMessage = errorMessage ? errorMessage + " | Created record(s) information is required." :
                "Created record(s) information is required.";
        }
        if (errorMessage) {
            console.log("error-message: ", errorMessage);
            return getResMessage("paramsError", {
                message: errorMessage,
            });
        }

        try {
            // insert audit record
            const queryText = `INSERT INTO ${this.auditTable}(table_name, log_records, log_type, log_by, log_at) VALUES($1, $2, $3, $4, $5);`
            const values = [tableName, logRecords, AuditLogTypes.CREATE, userId, new Date()]
            const query = {
                text  : queryText,
                values: values,
            }
            const res = await this.dbHandle.query(query)
            if (res.rowCount > 0) {
                return getResMessage("success", {
                    value: {
                        fields : res.fields,
                        records: res.rows,
                    },
                });
            } else {
                return getResMessage("insertError", {
                    value  : res,
                    message: "no response from the server",
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

    async updateLog(tableName: string, logRecords: any, newLogRecords: any, userId: string): Promise<ResponseMessage> {
        const dbCheck = checkDb(this.dbHandle);
        if (!dbCheck) {
            return dbCheck;
        }

        // Check/validate the attributes / parameters
        let errorMessage = "";
        if (!tableName) {
            errorMessage = errorMessage ? errorMessage + " | Table or Collection name is required." :
                "Table or Collection name is required.";
        }
        if (!userId) {
            errorMessage = errorMessage ? errorMessage + " | userId is required." :
                "userId is required.";
        }
        if (!logRecords) {
            errorMessage = errorMessage ? errorMessage + " | Current record(s) information is required." :
                "Current record(s) information is required.";
        }
        if (!newLogRecords) {
            errorMessage = errorMessage ? errorMessage + " | Updated record(s) information is required." :
                "Updated record(s) information is required.";
        }
        if (errorMessage) {
            return getResMessage("paramsError", {
                message: errorMessage,
            });
        }

        try {
            // insert audit record
            const queryText = `INSERT INTO ${this.auditTable}(table_name, log_records, new_log_records, log_type, log_by, log_at ) VALUES($1, $2, $3, $4, $5, $6);`
            const values = [tableName, logRecords, newLogRecords, AuditLogTypes.UPDATE, userId, new Date()]
            const query = {
                text  : queryText,
                values: values,
            }
            const res = await this.dbHandle.query(query)
            if (res.rowCount > 0) {
                return getResMessage("success", {
                    value: {
                        fields : res.fields,
                        records: res.rows,
                    },
                });
            } else {
                return getResMessage("insertError", {
                    value  : res,
                    message: "no response from the server",
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

    async readLog(tableName: string, logRecords: any, userId: string = ""): Promise<ResponseMessage> {
        const dbCheck = checkDb(this.dbHandle);
        if (!dbCheck) {
            return dbCheck;
        }

        // validate params/values
        let errorMessage = "";
        if (!tableName) {
            errorMessage = errorMessage ? errorMessage + " | Table or Collection name is required." :
                "Table or Collection name is required.";
        }
        if (!logRecords) {
            errorMessage = errorMessage ?
                errorMessage + " | Search keywords or Read record(s) information is required." :
                "Search keywords or Read record(s) information is required.";
        }
        if (errorMessage) {
            return getResMessage("paramsError", {
                message: errorMessage,
            });
        }

        try {
            // insert audit record
            let queryText: string
            let values: Array<any>
            if (userId) {
                queryText = `INSERT INTO ${this.auditTable}(table_name, log_records, log_type, log_by, log_at ) VALUES($1, $2, $3, $4, $5);`
                values = [tableName, logRecords, AuditLogTypes.READ, userId, new Date()]
            } else {
                queryText = "INSERT INTO " + this.auditTable + " (table_name, log_records, log_type, log_at ) VALUES($1, $2, $3, $4);"
                values = [tableName, logRecords, AuditLogTypes.READ, new Date()]
            }
            const query = {
                text  : queryText,
                values: values,
            }
            const res = await this.dbHandle.query(query)
            if (res.rowCount > 0) {
                return getResMessage("success", {
                    value: {
                        fields : res.fields,
                        records: res.rows,
                    },
                });
            } else {
                return getResMessage("insertError", {
                    value  : res,
                    message: "no response from the server",
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

    async deleteLog(tableName: string, logRecords: any, userId: string): Promise<ResponseMessage> {
        const dbCheck = checkDb(this.dbHandle);
        if (!dbCheck) {
            return dbCheck;
        }

        // Check/validate the attributes / parameters
        let errorMessage = "";
        if (!tableName) {
            errorMessage = errorMessage ? errorMessage + " | Table or Collection name is required." :
                "Table or Collection name is required.";
        }
        if (!userId) {
            errorMessage = errorMessage ? errorMessage + " | userId is required." :
                "userId is required.";
        }
        if (!logRecords) {
            errorMessage = errorMessage ? errorMessage + " | Deleted record(s) information is required." :
                "Deleted record(s) information is required.";
        }
        if (errorMessage) {
            return getResMessage("paramsError", {
                message: errorMessage,
            });
        }

        try {
            // insert audit record
            const queryText = `INSERT INTO ${this.auditTable}(table_name, log_records, log_type, log_by, log_at ) VALUES($1, $2, $3, $4, $5);`
            const values = [tableName, logRecords, AuditLogTypes.DELETE, userId, new Date()]
            const query = {
                text  : queryText,
                values: values,
            }
            const res = await this.dbHandle.query(query)
            if (res.rowCount > 0) {
                return getResMessage("success", {
                    value: {
                        fields : res.fields,
                        records: res.rows,
                    },
                });
            } else {
                return getResMessage("insertError", {
                    value  : res,
                    message: "no response from the server",
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

    async loginLog(logRecords: any, userId: string = "", tableName = "users"): Promise<ResponseMessage> {
        const dbCheck = checkDb(this.dbHandle);
        if (!dbCheck) {
            return dbCheck;
        }
        // validate params/values
        let errorMessage = "";
        if (!logRecords) {
            errorMessage = errorMessage + " | Login information is required."
        }
        if (errorMessage) {
            return getResMessage("paramsError", {
                message: errorMessage,
            });
        }

        try {
            // insert audit record
            let queryText: string
            let values: Array<any>
            if (userId) {
                queryText = `INSERT INTO ${this.auditTable}(table_name, log_records, log_type, log_by, log_at ) VALUES($1, $2, $3, $4, $5);`
                values = [tableName, logRecords, AuditLogTypes.LOGIN, userId, new Date()]
            } else {
                queryText = "INSERT INTO " + this.auditTable + " (table_name, log_records, log_type, log_at ) VALUES($1, $2, $3, $4);"
                values = [tableName, logRecords, AuditLogTypes.LOGIN, new Date()]
            }

            const query = {
                text  : queryText,
                values: values,
            }
            const res = await this.dbHandle.query(query)
            if (res.rowCount > 0) {
                return getResMessage("success", {
                    value: {
                        fields : res.fields,
                        records: res.rows,
                    },
                });
            } else {
                return getResMessage("insertError", {
                    value  : res,
                    message: "no response from the server",
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

    async logoutLog(logRecords: any, userId: string, tableName = "users"): Promise<ResponseMessage> {
        const dbCheck = checkDb(this.dbHandle);
        if (!dbCheck) {
            return dbCheck;
        }

        // validate params/values
        let errorMessage = "";
        if (!userId) {
            errorMessage = errorMessage + " | userId is required."
        }
        if (!logRecords || logRecords === "") {
            errorMessage = errorMessage + " | Logout information is required."
        }
        if (errorMessage) {
            return getResMessage("paramsError", {
                message: errorMessage,
            });
        }

        try {
            // insert audit record
            const queryText = `INSERT INTO ${this.auditTable}(table_name, log_records, log_type, log_by, log_at ) VALUES($1, $2, $3, $4, $5);`
            const values = [tableName, logRecords, AuditLogTypes.LOGOUT, userId, new Date()]
            const query = {
                text  : queryText,
                values: values,
            }
            const res = await this.dbHandle.query(query)
            if (res.rowCount > 0) {
                return getResMessage("success", {
                    value: {
                        fields : res.fields,
                        records: res.rows,
                    },
                });
            } else {
                return getResMessage("insertError", {
                    value  : res,
                    message: "no response from the server",
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

    async auditLog(logType: string, userId: string = "", options?: AuditLogOptionsType) {
        const dbCheck = checkDb(this.dbHandle);
        if (!dbCheck) {
            return dbCheck;
        }

        // Check/validate the attributes / parameters
        let tableName = "",
            logRecords = null,
            newLogRecords = null,
            errorMessage = "",
            query: { text: string; values: Array<any> } = {text: "", values: []};

        logType = logType.toLowerCase();

        switch (logType) {
            case "create":
            case AuditLogTypes.CREATE:
                tableName = options && options.tableName ? options.tableName : "";
                logRecords = options && options.logRecords ? options.logRecords : null;
                // validate params/values
                if (!tableName) {
                    errorMessage = errorMessage ? errorMessage + " | Table or Collection name is required." :
                        "Table or Collection name is required.";
                }
                if (!userId) {
                    errorMessage = errorMessage ? errorMessage + " | userId is required." :
                        "userId is required.";
                }
                if (!logRecords) {
                    errorMessage = errorMessage ? errorMessage + " | Created record(s) information is required." :
                        "Created record(s) information is required.";
                }
                if (errorMessage) {
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
                tableName = options && options.tableName ? options.tableName : "";
                logRecords = options && options.logRecords ? options.logRecords : null;
                newLogRecords = options && options.newLogRecords ? options.newLogRecords : null; // object or array

                // validate params/values
                if (!tableName) {
                    errorMessage = errorMessage ? errorMessage + " | Table or Collection name is required." :
                        "Table or Collection name is required.";
                }
                if (!userId) {
                    errorMessage = errorMessage ? errorMessage + " | userId is required." :
                        "userId is required.";
                }
                if (!logRecords) {
                    errorMessage = errorMessage ? errorMessage + " | Current record(s) information is required." :
                        "Current record(s) information is required.";
                }
                if (!newLogRecords) {
                    errorMessage = errorMessage ? errorMessage + " | Updated record(s) information is required." :
                        "Updated record(s) information is required.";
                }
                if (errorMessage) {
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
                tableName = options && options.tableName ? options.tableName : "";
                logRecords = options && options.logRecords ? options.logRecords : null;

                // Check/validate the attributes / parameters
                if (!tableName) {
                    errorMessage = errorMessage ? errorMessage + " | Table or Collection name is required." :
                        "Table or Collection name is required.";
                }
                if (!userId) {
                    errorMessage = errorMessage ? errorMessage + " | userId is required." :
                        "userId is required.";
                }
                if (!logRecords) {
                    errorMessage = errorMessage ? errorMessage + " | Deleted record(s) information is required." :
                        "Deleted record(s) information is required.";
                }
                if (errorMessage) {
                    return getResMessage("paramsError", {
                        message: errorMessage,
                    });
                }

                query = {
                    text  : `INSERT INTO ${this.auditTable}(table_name, log_records, log_type, log_by, log_at ) VALUES($1, $2, $3, $4, $5);`,
                    values: [tableName, logRecords, AuditLogTypes.REMOVE, userId, new Date()],
                }
                break;
            case "read":
            case AuditLogTypes.GET:
            case AuditLogTypes.READ:
                tableName = options && options.tableName ? options.tableName : "";
                logRecords = options && options.logRecords ? options.logRecords : null;

                // validate params/values
                if (!tableName) {
                    errorMessage = errorMessage ? errorMessage + " | Table or Collection name is required." :
                        "Table or Collection name is required.";
                }
                if (!logRecords) {
                    errorMessage = errorMessage ?
                        errorMessage + " | Search keywords or Read record(s) information is required." :
                        "Search keywords or Read record(s) information is required.";
                }
                if (errorMessage) {
                    return getResMessage("paramsError", {
                        message: errorMessage,
                    });
                }

                let queryTextRead: string
                let valuesRead: Array<any>
                if (userId) {
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
                logRecords = options && options.logRecords ? options.logRecords : null;

                // validate params/values
                if (!logRecords) {
                    errorMessage = errorMessage + " | Login information is required."
                }
                if (errorMessage) {
                    return getResMessage("paramsError", {
                        message: errorMessage,
                    });
                }
                tableName = tableName || "users"
                let queryTextLogin: string
                let valuesLogin: Array<any>
                if (userId) {
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
                logRecords = options && options.logRecords ? options.logRecords : null;

                // validate params/values
                if (!userId) {
                    errorMessage = errorMessage + " | userId is required."
                }
                if (!logRecords || logRecords === "") {
                    errorMessage = errorMessage + " | Logout information is required."
                }
                if (errorMessage) {
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

        try {
            // insert audit record
            const res = await this.dbHandle.query(query)
            if (res.rowCount > 0) {
                return getResMessage("success", {
                    value: {
                        fields : res.fields,
                        records: res.rows,
                    },
                });
            } else {
                return getResMessage("insertError", {
                    value  : res,
                    message: "no response from the server",
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

export {AuditLog, newAuditLog};
