import {ActionParamsType, CreateQueryResult} from "../types";
import {camelToUnderscore} from "../utils";

const errMessage = (message: string) => {
    return {
        createQueryObject: {
            createQuery: "",
            fieldNames : [],
            fieldValues: [[]]
        },
        ok               : false,
        message          : message,
    }
}

// computeCreateQuery function computes insert SQL scripts. It returns createScripts []string and err error.
export function computeCreateQuery(tableName: string, actionParams: ActionParamsType): CreateQueryResult {
    try {
        // validate inputs
        if (tableName === "" || actionParams.length < 1) {
            return errMessage("tableName and actionParams(records) are required.")
        }
        // declare variable for create/insert query
        let createQuery: string
        // let fieldNames: Array<string> = []
        // let fieldNamesUnderscore: Array<string> = []
        // compute fields, fieldsUnderscore, create-query from the first-record of the actionParams
        let itemQuery = `INSERT INTO ${tableName}` + "("
        let itemValuePlaceholder = " VALUES("
        const fieldNames = Object.keys(actionParams[0])
        const fieldNamesUnderscore = fieldNames.map(it => camelToUnderscore(it))
        const fieldsLength = fieldNames.length
        let fieldCount = 0
        for (const fieldName of fieldNames) {
            fieldCount += 1
            itemQuery += `${camelToUnderscore(fieldName)}`
            itemValuePlaceholder += `$${fieldCount}`
            if (fieldsLength > 1 && fieldCount < fieldsLength) {
                itemQuery += ", "
                itemValuePlaceholder += ", "
            }
        }
        // close item-script/value-placeholder
        itemQuery += ")"
        itemValuePlaceholder += ")"
        // add/append item-script & value-placeholder to the createScript
        createQuery = itemQuery + itemValuePlaceholder
        createQuery += " RETURNING id"

        // compute field-values from actionParams
        let fieldValues: Array<Array<any>> = []
        // compute create-record-values from actionParams/records, in order of the field-names sequence
        // value-computation for each of the actionParams / records must match the base record-fields
        for (const rec of actionParams) {
            // item-values-computation variable
            let recFieldValues: Array<any> = []
            for (const fieldName of fieldNames) {
                const fieldValue = rec[fieldName]
                if (typeof fieldValue === "undefined" || fieldName === undefined) {
                    return errMessage(`Record #${JSON.stringify(rec)} is missing the required field - ${fieldName} `)
                }
                recFieldValues.push(fieldValue)
            }
            // update fieldValues
            fieldValues.push(recFieldValues)
        }
        // returns result
        return {
            createQueryObject: {
                createQuery: createQuery,
                fieldNames : fieldNamesUnderscore,
                fieldValues: fieldValues,
            },
            ok               : true,
            message          : "success."
        }
    } catch (e) {
        return errMessage(`Create-query: ${e.message}`)
    }
}
