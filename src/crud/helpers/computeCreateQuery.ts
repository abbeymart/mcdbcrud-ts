import { ActionParamsType, CreateQueryResult } from "../types";
import { camelToUnderscore } from "../utils";

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
        // compute fieldNames, itemQuery and itemValuePlaceholder from the first-record of the actionParams
        let itemQuery = `INSERT INTO ${tableName}` + "("
        let itemValuePlaceholder = " VALUES("
        const fieldNames = Object.keys(actionParams[0])
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
        // compute createQuery from itemQuery and itemValuePlaceholder
        let createQuery = itemQuery + itemValuePlaceholder
        // add the returning ID option for the createQuery
        createQuery += " RETURNING id"

        // compute create-record-values from actionParams/records, in order of the field-names sequence
        let fieldValues: Array<Array<any>> = []
        for (const rec of actionParams) {
            // compute item-values
            let recFieldValues: Array<any> = []
            for (const fieldName of fieldNames) {
                const fieldValue = rec[fieldName]
                // fieldValue must be defined/valid
                if (typeof fieldValue === "undefined" || fieldName === undefined) {
                    return errMessage(`Record #${JSON.stringify(rec)} is missing the required field - ${fieldName}`)
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
                fieldNames : fieldNames.map(it => camelToUnderscore(it)),   // underscore fieldNames
                fieldValues: fieldValues,
            },
            ok               : true,
            message          : "success."
        }
    } catch (e) {
        return errMessage(`Create-query: ${e.message}`)
    }
}
