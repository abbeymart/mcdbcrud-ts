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

// computeUpdateQuery function computes update SQL script. It returns updateScript, updateValues any and/or err error
export function computeUpdateQuery(tableName: string, actionParams: ActionParamsType): MultiUpdateQueryResult {
    try {
        // validate inputs
        if (tableName === "" || actionParams.length < 1) {
            return errMessageUpdates("tableName and actionParam are required.")
        }
        let updateQueryObjects: Array<UpdateQueryObject> = []

        for (const actParam of actionParams) {
            const {id, ...updateParam} = actParam
            // compute update script and associated place-holder values for the actionParam/record
            let updateQuery = `UPDATE ${tableName} SET `
            let fieldValues: Array<any> = []
            let fieldNames: Array<string> = []
            let fieldsLength = Object.keys(updateParam).length
            let fieldCount = 0
            for (const [fieldName, fieldValue] of Object.entries(updateParam)) {
                // next placeholder-value-position
                fieldCount += 1
                fieldNames.push(camelToUnderscore(fieldName))
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

// computeUpdateQueryById function computes update SQL-script by recordId. It returns updateScript, updateValues any and/or err error
export function computeUpdateQueryById(tableName: string, actionParam: ActionParamType, recordId: string): UpdateQueryResult {
    try {
        // validate inputs
        if (tableName === "" || isEmptyObject(actionParam) || recordId === "") {
            return errMessage("tableName, record-id and actionParam are required.")
        }
        const {id, ...updateParam} = actionParam
        // compute update script and associated place-holder values for the actionParam/record
        let updateQuery = `UPDATE ${tableName} SET `
        let fieldNames: Array<string> = []
        let fieldValues: Array<any> = []
        let fieldsLength = Object.keys(updateParam).length
        let fieldCount = 0
        for (const [fieldName, fieldValue] of Object.entries(updateParam)) {
            // next placeholder-value-position
            fieldCount += 1
            fieldNames.push(camelToUnderscore(fieldName))
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

// computeUpdateQueryByIds function computes update SQL-script by recordIds. It returns updateScript, updateValues any and/or err error
export function computeUpdateQueryByIds(tableName: string, actionParam: ActionParamType, recordIds: Array<string>): UpdateQueryResult {
    try {
        // validate inputs
        if (tableName === "" || isEmptyObject(actionParam) || recordIds.length < 1) {
            return errMessage("tableName, record-ids and actionParam are required.")
        }
        let fieldNames: Array<string> = []
        let fieldValues: Array<any> = []
        const {id, ...updateParam} = actionParam
        // compute update script and associated place-holder values for the actionParam/record
        let updateQuery = `UPDATE ${tableName} SET `
        let fieldsLength = Object.keys(updateParam).length
        let fieldCount = 0
        for (const [fieldName, fieldValue] of Object.entries(updateParam)) {
            // next placeholder-value-position | TODO: refactor for fieldValue-types
            fieldCount += 1
            fieldNames.push(camelToUnderscore(fieldName))
            fieldValues.push(fieldValue)
            updateQuery += `${camelToUnderscore(fieldName)}=$${fieldCount}`
            if (fieldsLength > 1 && fieldCount < fieldsLength) {
                updateQuery += ", "
            }
        }
        // add where condition by id and the placeholder-value position
        const idLen = recordIds.length
        let recIds = "("
        for (let i = 0; i < idLen; i++) {
            recIds += "'" + recordIds[i] + "'"
            if (i < idLen - 1) {
                recIds += ", "
            }
        }
        recIds += ")"
        updateQuery += ` WHERE id IN ${recIds}`

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

// computeUpdateQueryByParam function computes update SQL scripts by queryParams. It returns updateScript, updateValues any and/or err error
export function computeUpdateQueryByParam(tableName: string, actionParam: ActionParamType, queryParams: QueryParamsType): UpdateQueryResult {
    try {
        // validate inputs
        if (tableName === "" || isEmptyObject(actionParam) || !queryParams) {
            return errMessage("tableName, queryParams (where-conditions) and actionParam are required.")
        }
        let fieldNames: Array<string> = []
        let fieldValues: Array<any> = []
        // compute update script and associated place-holder values for the actionParam/record
        const {id, ...updateParam} = actionParam
        let updateQuery = `UPDATE ${tableName} SET `
        let fieldsLength = Object.keys(updateParam).length
        let fieldCount = 0
        for (const [fieldName, fieldValue] of Object.entries(updateParam)) {
            // next placeholder-value-position
            fieldCount += 1
            fieldNames.push(camelToUnderscore(fieldName))
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

        // add where condition by id
        updateQuery += whereQueryObject.whereQuery
        // add id-placeholder-value
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
