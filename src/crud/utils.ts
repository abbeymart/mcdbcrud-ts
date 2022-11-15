import { ActionParamsType, ActionParamType, CrudParamsType, TaskTypes, isEmptyObject } from "..";
import { getResMessage, ResponseMessage } from "@mconnect/mcresponse";
import sanitize from "sanitize-html";
import { gunzipSync, gzipSync } from "zlib";

export function checkTaskType(params: CrudParamsType): string {
    let taskType = TaskTypes.UNKNOWN
    if (params.actionParams && params.actionParams.length > 0) {
        const actParam = params.actionParams[0]
        if (!actParam["id"] || actParam["id"] === "") {
            if (params.actionParams.length === 1 && (params.recordIds && params.recordIds?.length > 0) || params.queryParams && !isEmptyObject(params.queryParams)) {
                taskType = TaskTypes.UPDATE
            } else {
                taskType = TaskTypes.CREATE
            }
        } else {
            taskType = TaskTypes.UPDATE
        }
    }
    return taskType
}

export function validateActionParams(actParams: ActionParamsType = []): ResponseMessage {
    // validate req-params: actionParams must be an array or 1 or more item(s)
    if (actParams.length < 1) {
        return getResMessage('validateError', {
            message: "actionParams(record-inputs) must be an array of object values [ActionParamsType].",
        });
    }
    return getResMessage("success")
}

// deprecated??
export function camelToUnderscore1(key: string): string {
    return key.replace(/([A-Z])/g, "_$1").toLowerCase();
}

export const toCamelCase = (text: string, sep = '_'): string => {
    // accepts word/text and separator(' ', '_', '__', '.')
    const textArray = text.split(sep);
    // convert the first word to lowercase
    const firstWord = textArray[0].toLowerCase();
    // convert other words: first letter to upper case and other letters to lowercase
    const otherWords = textArray.slice(1,).map(item => {
        // convert first letter to upper case
        const item0 = item[0].toUpperCase();
        // convert other letters to lowercase
        const item1N = item.slice(1,).toLowerCase();
        return `${item0}${item1N}`;
    });
    return `${firstWord}${otherWords.join('')}`;
}

export const setContentBody = (fieldValue: string): string => {
    const sanitizeValue = sanitize(fieldValue);
    const gzippedBuffer = gzipSync(sanitizeValue);
    return gzippedBuffer.toString('base64');
}

export const getContentBody = (body: string): string => {
    const gzippedBuffer = Buffer.from(body, 'base64');
    const unzippedBuffer = gunzipSync(gzippedBuffer);
    return unzippedBuffer.toString();
}

export const excludeEmptyIdFields = (recs: Array<ActionParamType>): Array<ActionParamType> => {
    let actParams: Array<ActionParamType> = []
    for (const rec of recs) {
        let actParam: ActionParamType = {}
        for (const [key, value] of Object.entries(rec)) {
            if ((key === "id" || key.endsWith("Id")) && (!value || value === "")) {
                continue
            }
            actParam[key] = value
        }
        actParams.push(actParam)
    }
    return actParams
}
