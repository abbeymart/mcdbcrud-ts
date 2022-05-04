import { DeleteQueryResult, QueryParamType } from "../types";
import { computeWhereQuery } from "./computeWhereQuery";
import { isEmptyObject } from "../utils";

const errMessage = (message: string) => {
    return {
        deleteQueryObject: {
            deleteQuery: "",
            fieldValues: [],
        },
        ok               : false,
        message          : message,
    }
}

// computeDeleteQueryById function computes delete SQL script by id
export function computeDeleteQueryById(tableName: string, recordId: string): DeleteQueryResult {
    try {

        if (tableName === "" || recordId === "") {
            return errMessage("tableName and recordId are required for the delete-by-id operation.")
        }

        const deleteQuery = `DELETE FROM ${tableName} WHERE id=$1`

        return {
            deleteQueryObject: {
                deleteQuery: deleteQuery,
                fieldValues: [recordId],
            },
            ok               : true,
            message          : "success"
        }
    } catch (e) {
        return errMessage(e.message)
    }
}

// computeDeleteQueryByIds function computes delete SQL script by ids
export function computeDeleteQueryByIds(tableName: string, recordIds: Array<string>): DeleteQueryResult {
    try {
        // validate inputs
        if (tableName === "" || recordIds.length < 1) {
            return errMessage("tableName and recordIds are required for the delete-by-ids operation.")
        }

        const idLen = recordIds.length
        let recIds = "("
        for (let i = 0; i < idLen; i++) {
            recIds += "'" + recordIds[i] + "'"
            if (i < idLen - 1) {
                recIds += ", "
            }
        }
        recIds += ")"

        const deleteQuery = `DELETE FROM ${tableName} WHERE id IN ${recIds}`

        return {
            deleteQueryObject: {
                deleteQuery: deleteQuery,
                fieldValues: [],
            },
            ok               : true,
            message          : "success"
        }
    } catch (e) {
        return errMessage(e.message)
    }
}

// computeDeleteQueryByParam function computes delete SQL script by parameter specifications
export function computeDeleteQueryByParam(tableName: string, queryParams: QueryParamType): DeleteQueryResult {
    try {
        // validate inputs
        if (tableName === "" || isEmptyObject(queryParams)) {
            return errMessage("tableName and queryParams (where-conditions) are required for the delete-by-param operation.")
        }

        let deleteQuery = `DELETE FROM ${tableName}`

        const {whereQueryObject, ok, message} = computeWhereQuery(queryParams, 1)
        if (!ok) {
            return errMessage(message)
        }

        deleteQuery += whereQueryObject.whereQuery

        return {
            deleteQueryObject: {
                deleteQuery: deleteQuery,
                fieldValues: whereQueryObject.fieldValues,
            },
            ok               : true,
            message          : "success"
        }
    } catch (e) {
        return errMessage(e.message)
    }
}
