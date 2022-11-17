import { QueryParamsType, WhereQueryResult } from "../types";
import { camelToUnderscore } from "../utils";
import { isEmptyObject } from "../validate";

const errMessage = (message: string) => {
    return {
        whereQueryObject: {
            whereQuery : "",
            fieldValues: [],
        },
        ok              : false,
        message         : message,
    }
}

// computeWhereQuery function computes the multi-cases where-conditions for crud-operations.
export function computeWhereQuery(queryParams: QueryParamsType, fieldPosition: number): WhereQueryResult {
    try {
        // validate inputs
        if (isEmptyObject(queryParams) || !fieldPosition) {
            return errMessage("queryParams (where-conditions) and fieldPosition (starting position for the where-condition-placeholder-values) are required.")
        }

        // script-computation-variables
        let whereQuery = " WHERE "
        let fieldValues: Array<any> = []
        let fieldCount = 0
        const whereFieldsLength = Object.keys(queryParams).length

        // compute queryParams script from queryParams
        for (const [fieldName, fieldValue] of Object.entries(queryParams)) {
            // compose where-conditions for fieldValue by types
            switch (typeof fieldValue) {
                case "object":
                    // adjust for array of values (i.e. IN)
                    if (Array.isArray(fieldValue) && fieldValue.length > 0) {
                        const idLen = fieldValue.length
                        let inValues = "("
                        // compose field-values for the fieldName item-values, of type string/date-string
                        if (fieldValue.every(val => typeof val === "string")) {
                            for (let i = 0; i < idLen; i++) {
                                inValues += "'" + fieldValue[i] + "'"
                                if (i < idLen - 1) {
                                    inValues += ", "
                                }
                            }
                        } else if (fieldValue.every(val => typeof val === "number") ||
                            fieldValue.every(val => typeof val === "boolean")) {
                            // compose inValues for types - number, boolean...
                            for (let i = 0; i < idLen; i++) {
                                inValues += fieldValue[i]
                                if (i < idLen - 1) {
                                    inValues += ", "
                                }
                            }
                        } else {
                            return errMessage(`Where-query: Unsupported field-value-type for field-name: ${fieldName} and field-value: ${fieldValue}`)
                        }
                        inValues += ")"
                        whereQuery += `${camelToUnderscore(fieldName)} IN ${inValues}`
                    }
                    break;
                case "string":
                    fieldValues.push(`${fieldValue}`)
                    whereQuery += `${camelToUnderscore(fieldName)}=$${fieldPosition}`
                    // set next fieldPosition, excluding object - Array<any> case
                    fieldPosition += 1
                    break;
                case "boolean":
                    fieldValues.push(fieldValue)
                    whereQuery += `${camelToUnderscore(fieldName)}=$${fieldPosition}`
                    // set next fieldPosition, excluding object - Array<any> case
                    fieldPosition += 1
                    break;
                case "number":
                    fieldValues.push(fieldValue)
                    whereQuery += `${camelToUnderscore(fieldName)}=$${fieldPosition}`
                    // set next fieldPosition, excluding object - Array<any> case
                    fieldPosition += 1
                    break;
                case "bigint":
                    fieldValues.push(fieldValue)
                    whereQuery += `${camelToUnderscore(fieldName)}=$${fieldPosition}`
                    // set next fieldPosition, excluding object - Array<any> case
                    fieldPosition += 1
                    break;
                default:
                    return errMessage(`Where-query: Unsupported field-value-type for field-name: ${fieldName} and field-value: ${fieldValue}`)
            }
            // update fieldCount for all queryParams
            fieldCount += 1
            // adjust where-query based on the fieldsCount and whereFieldsLength
            if (whereFieldsLength > 1 && fieldCount < whereFieldsLength) {
                whereQuery += " AND "
            }
        }

        return {
            whereQueryObject: {
                whereQuery : whereQuery,
                fieldValues: fieldValues,
            },
            ok              : true,
            message         : "success"
        }
    } catch (e) {
        return errMessage(`Where-query: ${e.message}`)
    }
}
