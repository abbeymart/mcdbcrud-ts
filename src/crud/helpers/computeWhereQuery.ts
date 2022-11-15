import {QueryParamsType, WhereQueryResult} from "../types";
import {camelToUnderscore} from "../utils";
import {isEmptyObject} from "../validate";

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

// computeWhereQuery function computes the multi-cases where-conditions for crud-operations
export function computeWhereQuery(queryParams: QueryParamsType, fieldLength: number): WhereQueryResult {
    try {
        // validate inputs
        if (isEmptyObject(queryParams) || !fieldLength) {
            return errMessage("queryParams (where-conditions) and fieldLength (starting position for the where-condition-placeholder-values) are required.")
        }

        // script-computation-variables
        let whereQuery = " WHERE "
        let fieldValues: Array<any> = []
        let fieldCount = 0
        const whereFieldLength = Object.keys(queryParams).length

        // compute queryParams script from queryParams
        for (const [fieldName, fieldValue] of Object.entries(queryParams)) {
            // compose where-conditions for fieldValue by types
            switch (typeof fieldValue) {
                case "object":
                    // adjust for array of values (i.e. IN)
                    if (Array.isArray(fieldValue) && fieldValue.length > 0) {
                        const idLen = fieldValue.length
                        let recIds = "("
                        // compose field-values for the fieldName item-values, of type string
                        if (fieldValue.every(val => typeof val === "string")) {
                            for (let i = 0; i < idLen; i++) {
                                recIds += "'" + fieldValue[i] + "'"
                                if (i < idLen - 1) {
                                    recIds += ", "
                                }
                            }
                        } else {
                            // return errMessage(`Where-query: Unsupported field-value-type for field-name: ${fieldName}, field-value: ${fieldValue}`)
                            // TODO: optional-step/review??, compose rec-Ids for any other value=types, i.e. type any
                            for (let i = 0; i < idLen; i++) {
                                recIds += fieldValue[i]
                                if (i < idLen - 1) {
                                    recIds += ", "
                                }
                            }
                        }
                        recIds += ")"
                        whereQuery += `${camelToUnderscore(fieldName)} IN ${recIds}`
                    }
                    break;
                case "string":
                    fieldValues.push(`${fieldValue}`)
                    whereQuery += `${camelToUnderscore(fieldName)}=$${fieldLength}`
                    fieldLength += 1
                    break;
                case "boolean":
                    fieldValues.push(fieldValue)
                    whereQuery += `${camelToUnderscore(fieldName)}=$${fieldLength}`
                    fieldLength += 1
                    break;
                case "number":
                    fieldValues.push(fieldValue)
                    whereQuery += `${camelToUnderscore(fieldName)}=$${fieldLength}`
                    fieldLength += 1
                    break;
                case "bigint":
                    fieldValues.push(fieldValue)
                    whereQuery += `${camelToUnderscore(fieldName)}=$${fieldLength}`
                    fieldLength += 1
                    break;
                default:
                    return errMessage(`Where-query: Unsupported field-value-type for field-name: ${fieldName}, field-value: ${fieldValue}`)
            }

            fieldCount += 1
            if (whereFieldLength > 1 && fieldCount < whereFieldLength) {
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
