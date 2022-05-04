import { QueryParamType, WhereQueryResult } from "../types";
import { camelToUnderscore, isEmptyObject } from "../utils";

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
export function computeWhereQuery(queryParams: QueryParamType, fieldLength: number): WhereQueryResult {
    try {
        // validate inputs
        if (isEmptyObject(queryParams) || !fieldLength) {
            return errMessage("queryParams (where-conditions) and fieldLength (starting position for the where-condition-placeholder-values) are required.")
        }
        // compute queryParams script from queryParams
        let whereQuery = " WHERE "
        let fieldValues: Array<any> = []
        let fieldCount = 0
        const whereFieldLength = Object.keys(queryParams).length
        for (const [fieldName, fieldValue] of Object.entries(queryParams)) {
            // compose where-conditions for fieldValue by types
            switch (typeof fieldValue) {
                case "object":
                    // adjust for array of values (i.e. IN)
                    if (Array.isArray(fieldValue) && fieldValue.length > 0) {
                        const idLen = fieldValue.length
                        let recIds = "("
                        if (fieldValue.every(val => typeof val === "string")) {
                            for (let i = 0; i < idLen; i++) {
                                recIds += "'" + fieldValue[i] + "'"
                                if (i < idLen - 1) {
                                    recIds += ", "
                                }
                            }
                        } else {
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
        return errMessage(e.message)
    }
}
