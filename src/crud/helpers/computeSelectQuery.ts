import {ActionParamType, CrudOptionsType, QueryParamsType, SelectQueryResult} from "../types";
import {camelToUnderscore} from "../utils";
import {computeWhereQuery} from "./computeWhereQuery";
import {isEmptyObject} from "../validate";

const errMessage = (message: string) => {
    return {
        selectQueryObject: {
            selectQuery: "",
            fieldValues: [],
            fieldNames : [],
        },
        ok               : false,
        message          : message,
    }
}

// computeSelectQueryAll compose select SQL script to retrieve all table-records.
// The query may be constraint by skip(offset) and limit options
export function computeSelectQueryAll(modelRef: ActionParamType, tableName: string, options: CrudOptionsType = {}): SelectQueryResult {
    try {
        // validate inputs
        if (tableName === "" || Object.keys(modelRef).length < 1) {
            return errMessage("tableName and modelRef are required.")
        }
        // compute field-names
        let fieldNames: Array<string> = []
        Object.keys(modelRef).forEach(fieldName => fieldNames.push(camelToUnderscore(fieldName)))

        const fieldLen = fieldNames.length
        let fieldText = ""
        for (let i = 0; i < fieldLen; i++) {
            fieldText += `${fieldNames[i]}`
            if (i < fieldLen - 1) {
                fieldText += ", "
            }
        }
        let selectQuery = `SELECT ${fieldText} FROM ${tableName}`

        // adjust selectQuery for skip and limit options
        if (options.limit && options.limit > 0) {
            selectQuery += " LIMIT " + options.limit
        }
        if (options.skip && options.skip > 0) {
            selectQuery += " OFFSET " + options.skip
        }

        return {
            selectQueryObject: {
                selectQuery: selectQuery,
                fieldValues: [],
                fieldNames : fieldNames,
            },
            ok               : true,
            message          : "success"
        }
    } catch (e) {
        return errMessage(`Select-query: ${e.message}`)
    }
}

// computeSelectQueryById compose select SQL-script by id
export function computeSelectQueryById(modelRef: ActionParamType, tableName: string, recordId: string, options: CrudOptionsType = {}): SelectQueryResult {
    try {
        // validate inputs
        if (tableName === "" || Object.keys(modelRef).length < 1 || recordId === "") {
            return errMessage("tableName, record-id and modelRef are required.")
        }
        // compute field-names
        let fieldNames: Array<string> = []
        Object.keys(modelRef).forEach(fieldName => fieldNames.push(camelToUnderscore(fieldName)))

        const fieldLen = fieldNames.length
        let fieldText = ""
        for (let i = 0; i < fieldLen; i++) {
            fieldText += `${fieldNames[i]}`
            if (i < fieldLen - 1) {
                fieldText += ", "
            }
        }
        let selectQuery = `SELECT ${fieldText} FROM ${tableName} WHERE id=$1`

        // adjust selectQuery for skip and limit options
        if (options.limit && options.limit > 0) {
            selectQuery += " LIMIT " + options.limit
        }
        if (options.skip && options.skip > 0) {
            selectQuery += " OFFSET " + options.skip
        }

        return {
            selectQueryObject: {
                selectQuery: selectQuery,
                fieldValues: [recordId],
                fieldNames : fieldNames,
            },
            ok               : true,
            message          : "success"
        }
    } catch (e) {
        return errMessage(`Select-query: ${e.message}`)
    }
}

// computeSelectQueryByIds compose select SQL-script by ids
export function computeSelectQueryByIds(modelRef: ActionParamType, tableName: string, recordIds: Array<string>, options: CrudOptionsType = {}): SelectQueryResult {
    try {
        // validate inputs
        if (tableName === "" || Object.keys(modelRef).length < 1 || recordIds.length < 1) {
            return errMessage("tableName, record-ids and modelRef are required.")
        }
        // compute field-names
        let fieldNames: Array<string> = []
        Object.keys(modelRef).forEach(fieldName => fieldNames.push(camelToUnderscore(fieldName)))

        const fieldLen = fieldNames.length
        let fieldText = ""
        for (let i = 0; i < fieldLen; i++) {
            fieldText += `${fieldNames[i]}`
            if (i < fieldLen - 1) {
                fieldText += ", "
            }
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

        let selectQuery = `SELECT ${fieldText} FROM ${tableName} WHERE id IN ${recIds}`
        // const selectValues = [`(${recordIds.join(", ")})`]

        // adjust selectQuery for skip and limit options
        if (options.limit && options.limit > 0) {
            selectQuery += " LIMIT " + options.limit
        }
        if (options.skip && options.skip > 0) {
            selectQuery += " OFFSET " + options.skip
        }

        return {
            selectQueryObject: {
                selectQuery: selectQuery,
                fieldValues: [],
                fieldNames : fieldNames,
            },
            ok               : true,
            message          : "success"
        }
    } catch (e) {
        return errMessage(`Select-query: ${e.message}`)
    }
}

// computeSelectQueryByParam compose SELECT query from the where-parameters
export function computeSelectQueryByParams(modelRef: ActionParamType, tableName: string, queryParams: QueryParamsType, options: CrudOptionsType = {}): SelectQueryResult {
    try {
        // validate inputs
        if (tableName === "" || Object.keys(modelRef).length < 1 || isEmptyObject(queryParams)) {
            return errMessage("tableName, queryParams (where-conditions) and modelRef are required.")
        }
        // compute field-names
        let fieldNames: Array<string> = []
        Object.keys(modelRef).forEach(fieldName => fieldNames.push(camelToUnderscore(fieldName)))

        const fieldLen = fieldNames.length
        let fieldText = ""
        for (let i = 0; i < fieldLen; i++) {
            fieldText += `${fieldNames[i]}`
            if (i < fieldLen - 1) {
                fieldText += ", "
            }
        }

        let selectQuery = `SELECT ${fieldText} FROM ${tableName}`

        const {whereQueryObject, ok, message} = computeWhereQuery(queryParams, 1)
        if (!ok) {
            return errMessage(message)
        }

        // append where-query-scripts
        selectQuery += whereQueryObject.whereQuery

        // adjust selectQuery for skip and limit options
        if (options.limit && options.limit > 0) {
            selectQuery += " LIMIT " + options.limit
        }
        if (options.skip && options.skip > 0) {
            selectQuery += " OFFSET " + options.skip
        }

        return {
            selectQueryObject: {
                selectQuery: selectQuery,
                fieldValues: whereQueryObject.fieldValues,
                fieldNames : fieldNames,
            },
            ok               : true,
            message          : "success"
        }
    } catch (e) {
        return errMessage(`Select-query: ${e.message}`)
    }
}
