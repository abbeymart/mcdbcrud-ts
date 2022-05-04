/**
 * @Author: abbeymart | Abi Akindele | @Created: 2020-07-27
 * @Company: Copyright 2020 Abi Akindele  | mConnect.biz
 * @License: All Rights Reserved | LICENSE.md
 * @Description: crud-validation helper functions
 */

import {isEmptyObject} from "./utils";
import * as utils from "./validate";
import { CrudParamsType, MessageObject } from "./types";
import { mcMessages } from "@mconnect/mcmail";

export function validateSaveParams(crudParams: CrudParamsType) {
    // Initialise error object and patterns matching:
    let errors: MessageObject = {};
    try {
        if (crudParams.table) {
            // Check input formats/patterns
            const testItem = utils.isStringAlpha(crudParams.table);
            if (!testItem) {
                errors.table = mcMessages.isStringAlpha || "format-error, should be a string/alphanumeric";
            }
        } else {
            errors.table = mcMessages.infoRequired || "required-error, info is required";
        }

        if (crudParams.recordIds) {
            // Check input formats/patterns
            const testItem = utils.isArrayType(crudParams.recordIds);
            if (!testItem) {
                errors.recordIds = mcMessages.isArray || "format-error, should be an array[]";
            }
        }

        if (crudParams.actionParams) {
            // Check input formats/patterns:  array
            const testObject = utils.isArrayType(crudParams.actionParams);
            if (!testObject) {
                errors.actionParams = mcMessages.isArray || "format-error, should be an array";
            }
        } else {
            errors.queryParams = mcMessages.infoRequired || "required-error, info required";
        }

        if (crudParams.queryParams) {
            // Check input formats/patterns: object or array
            const testObject = utils.isObjectType(crudParams.queryParams);
            if (!testObject) {
                errors.queryParams = mcMessages.isObject || "format-error, should be an object{}";
            }
        }

        if (crudParams.existParams) {
            // Check input formats/patterns
            const testItem = utils.isArrayType(crudParams.existParams);
            if (!testItem) {
                errors.existParams = mcMessages.isArray || "format-error, should be an array[]";
            }
        } else {
            errors.existParams = mcMessages.infoRequired || "required-error, info is required";
        }

        if (crudParams.token) {
            // Check input formats/patterns
            const testItem = utils.isStringAlpha(crudParams.token);
            if (!testItem) {
                errors.token = mcMessages.isStringAlpha || "format-error, should be a string/alphanumeric";
            }
        }

        if (crudParams.userInfo) {
            // Check input formats/patterns
            const testItem = utils.isObjectType(crudParams.userInfo);
            if (!testItem) {
                errors.userInfo = mcMessages.isObject || "format-error, should be an object{}";
            }
        }

        // if (!crudParams.token && Object.keys(crudParams.userInfo).length < 1) {
        //     errors.userInfoRequired = "token or userInfo is required";
        //     errors.tokenRequired = "token or userInfo is required";
        // }
    } catch (e) {
        console.error("Error validating save-record(s) inputs");
        errors.validationError = "Error validating save-record(s) inputs";
    }

    return errors;
}

export function validateDeleteParams(crudParams: CrudParamsType) {
    // Initialise error object and patterns matching:
    let errors: MessageObject = {};

    try {
        if (crudParams.table) {
            // Check input formats/patterns
            const testItem = utils.isStringAlpha(crudParams.table);
            if (!testItem) {
                errors.table = mcMessages.isStringAlpha || "format-error, should be a string/alphanumeric";
            }
        } else {
            errors.table = mcMessages.infoRequired || "required-error, info is required";
        }

        if (crudParams.queryParams) {
            // Check input formats/patterns
            const testItem = utils.isObjectType(crudParams.queryParams);
            if (!testItem) {
                errors.queryParams = mcMessages.isObject || "format-error, should be an object{}";
            }
        }

        if (crudParams.recordIds) {
            // Check input formats/patterns
            const testItem = utils.isArrayType(crudParams.recordIds);
            if (!testItem) {
                errors.recordIds = mcMessages.isArray || "format-error, should be an array[]";
            }
        }

        if ((!crudParams.recordIds || crudParams.recordIds.length < 1) && (!crudParams.queryParams || isEmptyObject(crudParams.queryParams))) {
            errors.recordIds = errors.recordIds ? errors.recordIds + " | docId or queryParams is required" : "docId or queryParams is required";
            errors.queryParams = errors.queryParams ? errors.queryParams + " | docId or queryParams is required" : "docId or queryParams is required";
        }

        if (crudParams.token) {
            // Check input formats/patterns
            const testItem = utils.isStringAlpha(crudParams.token);
            if (!testItem) {
                errors.token = mcMessages.isStringAlpha || "format-error, should a string/alphanumeric";
            }
        }

        if (crudParams.userInfo) {
            // Check input formats/patterns
            const testItem = utils.isObjectType(crudParams.userInfo);
            if (!testItem) {
                errors.userInfo = mcMessages.isObject || "format-error, should be an object{}";
            }
        }

        // if (!crudParams.token && Object.keys(crudParams.userInfo).length < 1) {
        //     errors.userInfoRequired = "token or userInfo is required";
        //     errors.tokenRequired = "token or userInfo is required";
        // }

    } catch (e) {
        console.error("Error validating delete-record(s) inputs");
        errors.validationError = "Error validating delete-record(s) inputs";
    }

    return errors;

}

export function validateGetParams(crudParams: CrudParamsType) {
    // Initialise error object and patterns matching:
    let errors: MessageObject = {};

    try {
        if (crudParams.table) {
            // Check input formats/patterns
            const testItem = utils.isStringAlpha(crudParams.table);
            if (!testItem) {
                errors.table = mcMessages.isStringAlpha || "format-error, collection name should be a string";
            }
        } else {
            errors.table = mcMessages.infoRequired || "required-error, info is required";
        }

        if (crudParams.queryParams) {
            // Check input formats/patterns
            const testItem = utils.isObjectType(crudParams.queryParams);
            if (!testItem) {
                errors.queryParams = mcMessages.isObject || "format-error, queryParams should be an object";
            }
        }

        if (crudParams.projectParams) {
            // Check input formats/patterns
            const testItem = utils.isObjectType(crudParams.projectParams);
            if (!testItem) {
                errors.projectParams = mcMessages.isObject || "format-error, projectParams should be an object";
            }
        }

        if (crudParams.sortParams) {
            // Check input formats/patterns
            const testItem = utils.isObjectType(crudParams.sortParams);
            if (!testItem) {
                errors.sortParams = mcMessages.isObject || "format-error, sortParams should be an object";
            }
        }

        if (crudParams.recordIds) {
            // Check input formats/patterns
            const testItem = utils.isArrayType(crudParams.recordIds);
            if (!testItem) {
                errors.docId = mcMessages.isArray || "format-error, docId(s) should be an array";
            }
        }

        if (crudParams.token) {
            // Check input formats/patterns
            const testItem = utils.isStringAlpha(crudParams.token);
            if (!testItem) {
                errors.token = mcMessages.isStringAlpha || "format-error, token should be a string/alphanumeric";
            }
        }

        if (crudParams.userInfo) {
            // Check input formats/patterns
            const testItem = utils.isObjectType(crudParams.userInfo);
            if (!testItem) {
                errors.userInfo = mcMessages.isObject || "format-error, userInfo should be an object";
            }
        }

        // if (!crudParams.token && Object.keys(crudParams.userInfo).length < 1) {
        //     errors.userInfoRequired = "token or userInfo is required";
        //     errors.tokenRequired = "token or userInfo is required";
        // }

    } catch (e) {
        console.error("Error validating get-record(s) inputs");
        errors.validationError = "Error validating get-record(s) inputs";
    }

    return errors;
}

export function validateLoadParams(crudParams: CrudParamsType) {
    // Initialise error object and patterns matching:
    let errors: MessageObject = {};

    try {
        if (crudParams.table) {
            // Check input formats/patterns
            const testItem = utils.isStringAlpha(crudParams.table);
            if (!testItem) {
                errors.table = mcMessages.isStringAlpha || 'format-error, collection name should be a string/alphanumeric';
            }
        } else {
            errors.table = mcMessages.infoRequired || 'required-error, info is required';
        }

        if (crudParams.actionParams) {
            // Check input formats/patterns
            const testItem = utils.isArrayType(crudParams.actionParams);
            if (!testItem) {
                errors.actionParams = mcMessages.isArray || 'format-error, actionParams should be an array';
            }
        } else {
            errors.actionParams = mcMessages.infoRequired || 'required-error; info is required';
        }
    } catch (e) {
        console.error('Error validating load-record(s) inputs');
        errors.validationError = 'Error validating load-record(s) inputs';
    }

    return errors;
}
