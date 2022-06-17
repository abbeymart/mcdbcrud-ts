/**
 * @Author: abbeymart | Abi Akindele | @Created: 2020-06-26 | @Updated: 2020-06-26
 * @Company: mConnect.biz | @License: MIT
 * @Description: common validation functions
 */

export const isProvided = (param: any): boolean => {
    // Verify the Required status
    // Validate that the item is not empty / null / undefined
    return !(param === "" || param === null || param === undefined ||
        Array.isArray(param) && param.length < 1 ||
        typeof param === "object" && Object.keys(param).length === 0);
};

export const isEven = (num: number): boolean => {
    return Number.isFinite(num) && (num % 2 === 0);
};

export const isOdd = (num: number): boolean => {
    return Number.isFinite(num) && (num % 2 !== 0);
};

export const isNumberDigit = (num: number | string): boolean => {
    // Validate that param is a number (digit): 100 | 99 | 33 | 44 | 200
    const numberPattern = /^\d+$/;
    return numberPattern.test(num.toString());
};

export const isNumberFloat = (num: number): boolean => {
    // Validate that param is a number (float): 0.90 | 99.9 | 33.3 | 44.40
    const numberPattern = /^(\d)+([.])?(\d)*$/;
    return numberPattern.test(num.toString());
};

export const isObjectType = (param: object): boolean => {
    "use strict";
    // Validate param is an object, {}
    return (typeof param === "object" && !Array.isArray(param));
};

export const isArrayType = (param: Array<any>): boolean => {
    "use strict";
    // Validate param is an object, []
    return Array.isArray(param);
};

export const isStringChar = (param: string): boolean => {
    // Validate that param is a string (characters only) -- use regEx
    const charRegEx = /^[a-zA-Z&$_\-]+$/;
    return charRegEx.test(param);
};

export const isStringAlpha = (param: string): boolean => {
    // Validate that param is a string (alphanumeric, chars/numbers only)
    const alphaNumericPattern = /^[a-zA-Z\d-_-]+$/;
    return alphaNumericPattern.test(param);
};

export const isUsername = (param: string): boolean => {
    "use strict";
    const usernamePattern = /^([\w\d_])+$/; // alphanumeric, underscore, no space
    return usernamePattern.test(param);
};

export const isEmpty = (param: any): boolean => {
    "use strict";
    return (param === '' || param === null || param === undefined ||
        Object.keys(param).length === 0 ||
        (Array.isArray(param) && param.length === 0));
};

export const isNull = (infoItem: any): boolean => {
    "use strict";
    return infoItem === null;
};

export const isEmail = (param: string): boolean => {
    const testPattern = /^[\da-zA-Z]+([\da-zA-Z]*[-._+])*[\da-zA-Z]+@[\da-zA-Z]+([-.][\da-zA-Z]+)*([\da-zA-Z]*[.])[a-zA-Z]{2,6}$/;
    // const testPattern = /^[\da-zA-Z]+([\-._][\da-zA-Z]+)*@[\da-zA-Z]+([\-.][\da-zA-Z]+)*([.])[a-zA-Z]{2,6}$/;
    return testPattern.test(param);
};

export const isPassword = (param: string): boolean => {
    const testPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d.*)(?=.*\W.*)[a-zA-Z\d\S]{6,15}$/;
    return testPattern.test(param);
};

export const isNumberOnRange = (num: number, min: number = 0, max: number = 0) => {
    if ((isNumberDigit(num) || isNumberFloat(num)) && (min < max)) {
        return (num >= min && num <= max)
    }
    return false;
};

export const isPhone = (param: string): boolean => {
    const phonePattern = /^([1-9]{1,3})?[\-. ]?(\(\d{3}\)?[\-. ]?|\d{3}?[\-. ]?)?\d{3}?[\-. ]?\d{4}$/;
    return phonePattern.test(param);
};

export const isPostalCode = (param: string): boolean => {
    const postCodePattern = /^[a-zA-Z\d]+(\s)?[a-zA-Z\d]*/;
    return postCodePattern.test(param);
};

export const isPostalCodeUS = (param: string): boolean => {
    const postCodePattern = /^[a-zA-Z\d]+(\s)?[a-zA-Z\d]*/;
    return postCodePattern.test(param);
};

export const isPostalCodeCanada = (param: string): boolean => {
    const postCodePattern = /^[a-zA-Z\d]+(\s)?[a-zA-Z\d]*/;
    return postCodePattern.test(param);
};

export const isPostalCodeUK = (param: string): boolean => {
    const postCodePattern = /^[a-zA-Z\d]+(\s)?[a-zA-Z\d]*/;
    return postCodePattern.test(param);
};

export const isName = (param: string): boolean => {
    const namePattern = /^[a-zA-Z'\-]+(\s[a-zA-Z'\-])*[a-zA-Z'\-]*/;   // Abi Charles Africa America
    return namePattern.test(param);
};

export const isURL = (param: string): boolean => {
    // Abi Charles Africa America
    const namePattern = /^[a-zA-Z\d\-\\_.:]+$/;
    return namePattern.test(param);

};

export const isBusinessNumber = (param: string): boolean => {
    // business number format
    const bnPattern = /^[\d\-]+$/;
    return bnPattern.test(param);
};

export const isStandardCode = (param: string): boolean => {
    // Product Group | Body & Soul10
    const standardCodePattern = /^[a-zA-Z\d]+[&\s\-_]*[a-zA-Z\d$#]*$/;
    return standardCodePattern.test(param);
};

export const isCountryCode = (param: string): boolean => {
    // langCode must be string of format en-US
    const countryCodePattern = /^[a-z]{2}-[A-Z]{2}$/;
    return countryCodePattern.test(param);
};

export const isLanguageCode = (param: string): boolean => {
    // langCode must be string of format en-US
    const langCodePattern = /^[a-z]{2}-[A-Z]{2}$/;
    return langCodePattern.test(param);
};

export const isWordSpace = (param: string): boolean => {
    // words with spaces and hyphens, no numbers
    const wordSpacePattern = /^[a-zA-Z\d,()'._&]+[\s\-a-zA-Z\d,()'._&]*[a-zA-Z\d,()'._?]*$/;
    return wordSpacePattern.test(param);
};

export const isLabelCode = (param: string): boolean => {
    // firstName_middleName_lastName
    const labelCodePattern = /^[a-zA-Z]+[_\-a-zA-Z]*[_a-z\d]*$/;
    return labelCodePattern.test(param);
};

export const isErrorCode = (param: string): boolean => {
    // error code format (AB10-100, AB900)
    const errorCodePattern = /^[a-zA-Z\d]+-*\d*$/;
    return errorCodePattern.test(param);
};

export const isPathName = (param: string) => {
    // mysite.new_base.nicelook
    const pathNamePattern = /^[a-zA-Z\d/]+[_a-zA-Z\d./]*[a-zA-Z\d/]*$/;
    return pathNamePattern.test(param);
};

export const isNameNoSpace = (param: string): boolean => {
    // JohnPaul
    const nameNoSpacePattern = /[a-zA-Z]+/;
    return nameNoSpacePattern.test(param);
};

export const isDescription = (param: string): boolean => {
    "use strict";
    const descPattern = /^[a-zA-Z\d\s\\.,:/()*_|\-!@#$%&]+$/; // Alphanumeric string with spaces, and
    // (.,:/()*_-|!@)
    return descPattern.test(param);
};

export const isCurrency = (param: string): boolean => {
    const currencyPattern = /^[a-zA-Z#$]+$/;
    return currencyPattern.test(param);
};

export const isSafeInteger = (n: number): boolean => {
    return (Math.round(n) === n &&
        Number.MIN_SAFE_INTEGER <= n &&
        n <= Number.MAX_SAFE_INTEGER);
};
