/**
 * @Author: abbeymart | Abi Akindele | @Created: 2020-04-05 | @Updated: 2020-05-16
 * @Company: mConnect.biz | @License: MIT
 * @Description: get stream of records, by recordIds, queryParams, all | cache-in-memory
 */

// Import required module(s)
import { Crud } from "./Crud";
import { CrudOptionsType, CrudParamsType } from "./types";
import {
    computeSelectQueryAll,
    computeSelectQueryByIds,
    computeSelectQueryByParams
} from "./helpers";
import { PoolClient } from "pg";

const Cursor = require("pg-cursor")

export interface CursorResultType {
    cursor?: typeof Cursor;
    client?: PoolClient;
    ok: boolean;
    message: string;
    value?: any;
}

class GetRecordStream extends Crud {
    constructor(params: CrudParamsType, options: CrudOptionsType = {}) {
        super(params, options);
        // Set specific instance properties
    }

    async getRecord(): Promise<CursorResultType> {
        // Check/validate the attributes / parameters
        const dbCheck = this.checkDb(this.appDb);
        if (dbCheck.code !== "success") {
            return {
                ok     : false,
                message: dbCheck.message,
            };
        }
        const auditDbCheck = this.checkDb(this.auditDb);
        if (auditDbCheck.code !== "success") {
            return {
                ok     : false,
                message: auditDbCheck.message,
            };
        }
        const accessDbCheck = this.checkDb(this.accessDb);
        if (accessDbCheck.code !== "success") {
            return {
                ok     : false,
                message: accessDbCheck.message,
            };
        }
        // set maximum limit and default values per query
        if (this.limit < 1) {
            this.limit = 1;
        } else if (this.limit > this.maxQueryLimit) {
            this.limit = this.maxQueryLimit;
        }
        if (this.skip < 0) {
            this.skip = 0;
        }

        // Get the item(s) by docId(s), queryParams or all items
        if (this.recordIds && this.recordIds.length > 0) {
            try {

                // process cursor-query by recordIds
                const {
                    selectQueryObject,
                    ok,
                    message
                } = computeSelectQueryByIds(this.modelRef, this.table, this.recordIds, {
                    skip : this.skip,
                    limit: this.limit
                })
                if (!ok) {
                    return {
                        ok     : ok,
                        message: message,
                        value  : {
                            selectQuery: selectQueryObject.selectQuery,
                            fieldValues: selectQueryObject.fieldValues,
                        }
                    }
                }
                const client = await this.appDb.connect()
                return {
                    cursor : client.query(new Cursor(selectQueryObject.selectQuery, selectQueryObject.fieldValues)),
                    client : client,
                    ok     : true,
                    message: "success",
                }
            } catch (error) {
                return {
                    ok     : true,
                    message: error.message,
                    value  : error,
                }
            }
        }
        if (this.queryParams && Object.keys(this.queryParams).length > 0) {
            try {
                // process cursor-query by queryParams
                const {
                    selectQueryObject,
                    ok,
                    message
                } = computeSelectQueryByParams(this.modelRef, this.table, this.queryParams, {
                    skip : this.skip,
                    limit: this.limit
                })
                if (!ok) {
                    return {
                        ok     : ok,
                        message: message,
                        value  : {
                            selectQuery: selectQueryObject.selectQuery,
                            fieldValues: selectQueryObject.fieldValues,
                        }
                    }
                }
                const client = await this.appDb.connect()
                return {
                    cursor : client.query(new Cursor(selectQueryObject.selectQuery, selectQueryObject.fieldValues)),
                    client : client,
                    ok     : true,
                    message: "success",
                }
            } catch (error) {
                return {
                    ok     : false,
                    message: error.message,
                };
            }
        }
        // get all records, up to the permissible limit
        try {
            // process cursor-query, constrain by skip/limit
            const {selectQueryObject, ok, message} = computeSelectQueryAll(this.modelRef, this.table, {
                skip : this.skip,
                limit: this.limit
            })
            if (!ok) {
                return {
                    ok     : ok,
                    message: message,
                    value  : {
                        selectQuery: selectQueryObject.selectQuery,
                        fieldValues: selectQueryObject.fieldValues,
                    }
                }
            }
            const client = await this.appDb.connect()
            return {
                cursor : client.query(new Cursor(selectQueryObject.selectQuery, selectQueryObject.fieldValues)),
                client : client,
                ok     : true,
                message: "success",
            }
        } catch (error) {
            return {
                value  : error,
                ok     : false,
                message: error.message,
            }
        }
    }
}

// factory function/constructor
function newGetRecordStream(params: CrudParamsType, options: CrudOptionsType = {}) {
    return new GetRecordStream(params, options);
}

export { GetRecordStream, newGetRecordStream };
