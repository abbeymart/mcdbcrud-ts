import {
    ActionParamsType, ActionParamType, MultiUpdateQueryResult, QueryParamsType, UpdateQueryObject, UpdateQueryResult
} from "../types";
import {computeWhereQuery} from "./computeWhereQuery";
import {camelToUnderscore} from "../utils";
import {isEmptyObject} from "../validate";

const errMessage = (message: string) => {
    return {
        updateQueryObject: {
            updateQuery: "",
            fieldNames : [],
            fieldValues: [],
            whereQuery : {
                fieldValues: [],
                whereQuery : "",
            },
        },
        ok               : false,
        message          : message,
    }
}

const errMessageUpdates = (message: string) => {
    return {
        updateQueryObjects: [],
        ok                : false,
        message           : message,
    }
}

// computeUpdateQuery function computes update SQL script. It returns updateScript, updateValues any and/or err error.
export function computeUpdateQuery(tableName: string, actionParams: ActionParamsType): MultiUpdateQueryResult {
    try {
        // validate inputs
        if (tableName === "" || actionParams.length < 1) {
            return errMessageUpdates("tableName and actionParam are required.")
        }
        // compute updateQuery scripts from actionParams
        let updateQueryObjects: Array<UpdateQueryObject> = []
        for (const actParam of actionParams) {
            const {id, ...updateParam} = actParam
            // compute update script and associated place-holder values for the actionParam/record
            let updateQuery = `UPDATE ${tableName} SET `
            let fieldValues: Array<any> = []
            const fieldNames = Object.keys(updateParam).map(it => camelToUnderscore(it))
            const fieldsLength = fieldNames.length
            let fieldCount = 0
            for (const [fieldName, fieldValue] of Object.entries(updateParam)) {
                // next placeholder-value-position
                fieldCount += 1
                fieldValues.push(fieldValue)
                updateQuery += `${camelToUnderscore(fieldName)}=$${fieldCount}`
                if (fieldsLength > 1 && fieldCount < fieldsLength) {
                    updateQuery += ", "
                }
            }
            // add where condition by id and the placeholder-value position
            updateQuery += ` WHERE id=$${++fieldCount}`
            updateQuery += " RETURNING id"
            // add id-placeholder-value
            fieldValues.push(id)
            // update result
            updateQueryObjects.push({
                updateQuery: updateQuery,
                fieldNames : fieldNames,
                fieldValues: fieldValues,
            })
        }
        return {
            updateQueryObjects: updateQueryObjects,
            ok                : true,
            message           : "success"
        }
    } catch (e) {
        return errMessageUpdates(`Select-query: ${e.message}`)
    }
}

// computeUpdateQueryById function computes update SQL-script by recordId. It returns updateScript, updateValues any and/or err error.
export function computeUpdateQueryById(tableName: string, actionParam: ActionParamType, recordId: string): UpdateQueryResult {
    try {
        // validate inputs
        if (tableName === "" || isEmptyObject(actionParam) || recordId === "") {
            return errMessage("tableName, record-id and actionParam are required.")
        }
        // compute update script and associated place-holder values for the actionParam/record
        const {id, ...updateParam} = actionParam
        let updateQuery = `UPDATE ${tableName} SET `
        let fieldValues: Array<any> = []
        const fieldNames = Object.keys(updateParam).map(it => camelToUnderscore(it))
        const fieldsLength = fieldNames.length
        let fieldCount = 0
        for (const [fieldName, fieldValue] of Object.entries(updateParam)) {
            // next placeholder-value-position
            fieldCount += 1
            fieldValues.push(fieldValue)
            updateQuery += `${camelToUnderscore(fieldName)}=$${fieldCount}`
            if (fieldsLength > 1 && fieldCount < fieldsLength) {
                updateQuery += ", "
            }
        }
        // add where condition by recordId and the placeholder-value position
        updateQuery += ` WHERE id=$${++fieldCount}`
        updateQuery += " RETURNING id"
        // add id-placeholder-value
        fieldValues.push(recordId)

        return {
            updateQueryObject: {
                updateQuery: updateQuery,
                fieldNames : fieldNames,
                fieldValues: fieldValues,
            },
            ok               : true,
            message          : "success"
        }
    } catch (e) {
        return errMessage(`Select-query: ${e.message}`)
    }
}

// computeUpdateQueryByIds function computes update SQL-script by recordIds. It returns updateScript, updateValues any and/or err error.
export function computeUpdateQueryByIds(tableName: string, actionParam: ActionParamType, recordIds: Array<string>): UpdateQueryResult {
    try {
        // validate inputs
        if (tableName === "" || isEmptyObject(actionParam) || recordIds.length < 1) {
            return errMessage("tableName, record-ids and actionParam are required.")
        }
        // compute updateQuery script and associated place-holder values for the actionParam/record
        const {id, ...updateParam} = actionParam
        let updateQuery = `UPDATE ${tableName} SET `
        const fieldNames = Object.keys(updateParam).map(it => camelToUnderscore(it))
        const fieldsLength = fieldNames.length
        let fieldValues: Array<any> = []
        let fieldCount = 0
        for (const [fieldName, fieldValue] of Object.entries(updateParam)) {
            // next placeholder-value-position
            fieldCount += 1
            fieldValues.push(fieldValue)
            updateQuery += `${camelToUnderscore(fieldName)}=$${fieldCount}`
            if (fieldsLength > 1 && fieldCount < fieldsLength) {
                updateQuery += ", "
            }
        }
        // add where condition by recordIds and the placeholder-value position
        const idLen = recordIds.length
        let idValues = "("
        for (let i = 0; i < idLen; i++) {
            idValues += "'" + recordIds[i] + "'"
            if (i < idLen - 1) {
                idValues += ", "
            }
        }
        idValues += ")"
        updateQuery += ` WHERE id IN ${idValues}`

        return {
            updateQueryObject: {
                updateQuery: updateQuery,
                fieldNames : fieldNames,
                fieldValues: fieldValues,
            },
            ok               : true,
            message          : "success"
        }
    } catch (e) {
        return errMessage(`Select-query: ${e.message}`)
    }
}

// computeUpdateQueryByParam function computes update SQL scripts by queryParams. It returns updateScript, updateValues any and/or err error.
export function computeUpdateQueryByParam(tableName: string, actionParam: ActionParamType, queryParams: QueryParamsType): UpdateQueryResult {
    try {
        // validate inputs
        if (tableName === "" || isEmptyObject(actionParam) || !queryParams) {
            return errMessage("tableName, queryParams (where-conditions) and actionParam are required.")
        }

        // compute update script and associated place-holder values for the actionParam/record
        const {id, ...updateParam} = actionParam
        let updateQuery = `UPDATE ${tableName} SET `
        const fieldNames = Object.keys(updateParam).map(it => camelToUnderscore(it))
        const fieldsLength = fieldNames.length
        let fieldValues: Array<any> = []
        let fieldCount = 0
        for (const [fieldName, fieldValue] of Object.entries(updateParam)) {
            // next placeholder-value-position
            fieldCount += 1
            fieldValues.push(fieldValue)
            updateQuery += `${camelToUnderscore(fieldName)}=$${fieldCount}`
            if (fieldsLength > 1 && fieldCount < fieldsLength) {
                updateQuery += ", "
            }
        }
        // compute where-conditions, including the placeholder-value starting position (fieldCount++)
        const {whereQueryObject, ok, message} = computeWhereQuery(queryParams, ++fieldCount)
        if (!ok) {
            return errMessage(message)
        }

        // add whereQuery condition by queryParams
        updateQuery += whereQueryObject.whereQuery
        // add whereQuery placeholder values
        fieldValues = fieldValues.concat(whereQueryObject.fieldValues)

        return {
            updateQueryObject: {
                updateQuery: updateQuery,
                fieldNames : fieldNames,
                fieldValues: fieldValues,
            },
            ok               : true,
            message          : "success"
        }
    } catch (e) {
        return errMessage(`Select-query: ${e.message}`)
    }
}
