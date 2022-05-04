/**
 * @Author: abbeymart | Abi Akindele | @Created: 2020-07-04 | @Updated: 2020-07-04
 * @Company: mConnect.biz | @License: MIT
 * @Description: common util functions
 */

import * as localforage from "localforage";
import { getResMessage } from "@mconnect/mcresponse";

// types
interface ValueObject {
    [key: string]: ValueType;
}

type ValueType = object | object[] | string | string[] | number | number[] | ValueObject;

interface Options {
    type?: string;
    language?: string;
}

interface Locale {
    [key: string]: ValueType;
}

interface MessageObject {
    [key: string]: string;
}

interface ResponseMessage {
    code: string;
    resCode: number | string;
    message: string;
    value: ValueType;
}

type ItemStateType = string | number | object | string[] | number[] | object[];


export default {
    getLanguage(userLang = "en-US"): string {
        // Define/set default language variable
        let defaultLang = "en-US";
        // Set defaultLang to current userLang, set from the UI
        if (userLang) {
            defaultLang = userLang;
        }
        return defaultLang;
    },
    getLocale(localeFiles: Locale, options: Options = {}) {
        // validate localeFiles as an object
        if (typeof localeFiles !== "object" || Object.keys(localeFiles).length < 1 ||
            Object.values(localeFiles).length < 1) {
            return {
                code   : "paramsError",
                message: "Locale files should be an object and not empty",
            };
        }

        // const localeType = options && options.type ? options.type : "";
        const language = options && options.language ? options.language : "en-US";

        // set the locale file contents
        return localeFiles[language];

    },
    getParamsMessage(msgObject: MessageObject): ResponseMessage {
        let messages = "";
        Object.entries(msgObject).forEach(([key, msg]) => {
            messages = messages ? `${messages} | ${key} : ${msg}` : `${key} : ${msg}`;
        });
        return getResMessage("validateError", {
            message: messages,
        });
    },
    shortString(str: string, maxLength: number): string {
        return str.toString().length > maxLength ? str.toString().substr(0, maxLength) + "..." : str.toString();
    },
    strToBool(val: string | number = "n"): boolean {
        const strVal = val.toString().toLowerCase();
        if (strVal === "true" || strVal === "t" || strVal === "yes" || strVal === "y") {
            return true;
        } else {
            return Number(strVal) > 0;
        }
    },
    async userIpInfo(ipUrl = "https://ipinfo.io", options: object = {}): Promise<object> {
        // Get the current user IP address Information
        // TODO: use other method besides ipinfo.io, due to query limit (i.e. 429 error)
        try {
            // const reqH = options && options.headers? options. headers : {};
            const reqHeaders = {"Content-Type": "application/json"};
            options = Object.assign({}, options, {
                method : "GET",
                mode   : "cors",
                headers: reqHeaders,
            });
            const response = await fetch(ipUrl, options);
            let result = await response.json();
            result = result ? JSON.parse(result) : null;
            if (response.ok) {
                return result;
            }
            throw new Error("Error fetching ip-address information: ");
        } catch (error) {
            console.log("Error fetching ip-address information: ", error);
            throw new Error(error.message);
        }
    },
    userBrowser() {
        // push each browser property, as key/value pair, into userBrowser array variable
        return navigator.userAgent;
    },
    currentUrlInfo(pathLoc: string) {
        // this function returns the parts (array) and lastIndex of a URL/pathLocation
        let parts: string[] = [];
        let lastIndex = -1;
        if (pathLoc) {
            parts = pathLoc.toString().split("://")[1].split("/");
            // get the last index
            lastIndex = parts.lastIndexOf("new") || parts.lastIndexOf("detail") || parts.lastIndexOf("list");
            return {
                parts,
                lastIndex,
            };
        }
        return {
            parts,
            lastIndex,
        };
    },
    getPath(req: Request): string {
        let itemPath = req.url || "/mc";
        itemPath = itemPath.split("/")[1];
        return itemPath ? itemPath : "mc";
    },
    getFullName(firstName: string, lastName: string, middleName = ""): string {
        if (firstName && middleName && lastName) {
            return (firstName + " " + middleName + " " + lastName);
        }
        return (firstName + " " + lastName);
    },
    getNames(fullName: string) {
        const nameParts = fullName.split("");
        let firstName, lastName, middleName;
        if (nameParts.length > 2) {
            firstName = nameParts[0];
            lastName = nameParts[2];
            middleName = nameParts[1];
            return {
                firstName,
                middleName,
                lastName,
            };
        } else {
            firstName = nameParts[0];
            lastName = nameParts[1];
            return {
                firstName,
                lastName,
            };
        }
        // Return firstName, middleName and lastName based on fullName components ([0],[1],[2])
    },
    pluralize(n: number, itemName: string, itemPlural = ""): string {
        // @TODO: retrieve plural for itemName from language dictionary {name: plural}
        let itemNamePlural = "";
        if (!itemPlural) {
            itemNamePlural = "tbd"
            // itemNamePlural = mcPlurals[ itemName ];
        } else {
            itemNamePlural = itemPlural;
        }
        let result = `${n} ${itemName}`;
        if (n > 1) {
            result = `${n} ${itemName}${itemNamePlural}`;
        }
        return result;
    },
    // Validation functions
    isProvided(param: string | number | object): boolean {
        // Verify the Required status
        // Validate that the item is not empty / null / undefined
        return !(param === "" || param === null || param === undefined || Object.keys(param).length === 0);
    },
    isEven(num: number): boolean {
        return Number.isFinite(num) && (num % 2 === 0);
    },
    isOdd(num: number): boolean {
        return Number.isFinite(num) && (num % 2 !== 0);
    },
    isNumberDigit(num: number): boolean {
        // Validate that param is a number (digit): 100 | 99 | 33 | 44 | 200
        const numberPattern = /^[0-9]+$/;
        return numberPattern.test(num.toString());
    },
    isNumberFloat(num: number): boolean {
        // Validate that param is a number (float): 0.90 | 99.9 | 33.3 | 44.40
        const numberPattern = /^([0-9])+([.])?([0-9])*$/;
        return numberPattern.test(num.toString());
    },
    isObjectType(param: object): boolean {
        "use strict";
        // Validate param is an object, {}
        return (typeof param === "object" && !Array.isArray(param));
    },
    isArrayType(param: []): boolean {
        "use strict";
        // Validate param is an object, []
        return Array.isArray(param);
    },
    isStringChar(param: string): boolean {
        // Validate that param is a string (characters only) -- use regEx
        const charRegEx = /^[a-zA-Z&$_-]+$/;
        return charRegEx.test(param);
    },
    isStringAlpha(param: string): boolean {
        // Validate that param is a string (alphanumeric, chars/numbers only)
        const alphaNumericPattern = /^[a-zA-Z0-9-_]+$/;
        return alphaNumericPattern.test(param);
    },
    isUsername(param: string): boolean {
        "use strict";
        const usernamePattern = /^([a-zA-Z0-9_])+$/; // alphanumeric, underscore, no space
        return usernamePattern.test(param);
    },
    isEmpty(param: string | number | object | string[] | number[] | object[]): boolean {
        "use strict";
        return (param === "" || param === null || param === undefined ||
            Object.keys(param).length === 0 ||
            (Array.isArray(param) && param.length === 0));
    },
    isEmptyObject(val: object): boolean {
        return !(Object.keys(val).length > 0 && Object.values(val).length > 0);
    },
    isNull(infoItem: null): boolean {
        "use strict";
        return infoItem === null;
    },
    isEmail(param: string): boolean {
        const testPattern = /^[0-9a-zA-Z]+([0-9a-zA-Z]*[-._+])*[0-9a-zA-Z]+@[0-9a-zA-Z]+([-.][0-9a-zA-Z]+)*([0-9a-zA-Z]*[.])[a-zA-Z]{2,6}$/;
        // const testPattern = /^[0-9a-zA-Z]+([\-._][0-9a-zA-Z]+)*@[0-9a-zA-Z]+([\-.][0-9a-zA-Z]+)*([.])[a-zA-Z]{2,6}$/;
        return testPattern.test(param);
    },
    isPassword(param: string): boolean {
        const testPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d.*)(?=.*\W.*)[a-zA-Z0-9\S]{6,15}$/;
        return testPattern.test(param);
    },
    isNumberOnRange(num: number, min: number, max: number): boolean {
        if ((this.isNumberDigit(num) || this.isNumberFloat(num)) && (min < max)) {
            return (num >= min && num <= max)
        }
        return false;
    },
    isPhone(param: string): boolean {
        const phonePattern = /^([1-9]{1,3})?[-. ]?(\(\d{3}\)?[-. ]?|\d{3}?[-. ]?)?\d{3}?[-. ]?\d{4}$/;
        return phonePattern.test(param);
    },
    isPostalCode(param: string): boolean {
        const postCodePattern = /^[a-zA-Z0-9]+(\s)?[a-zA-Z0-9]*/;
        return postCodePattern.test(param);
    },
    isPostalCodeUS(param: string): boolean {
        const postCodePattern = /^[a-zA-Z0-9]+(\s)?[a-zA-Z0-9]*/;
        return postCodePattern.test(param);
    },
    isPostalCodeCanada(param: string): boolean {
        const postCodePattern = /^[a-zA-Z0-9]+(\s)?[a-zA-Z0-9]*/;
        return postCodePattern.test(param);
    },
    isPostalCodeUK(param: string): boolean {
        const postCodePattern = /^[a-zA-Z0-9]+(\s)?[a-zA-Z0-9]*/;
        return postCodePattern.test(param);
    },
    isName(param: string): boolean {
        const namePattern = /^[a-zA-Z"-]+(\s[a-zA-Z"-])*[a-zA-Z"-]*/;   // Abi Charles Africa America
        return namePattern.test(param);
    },
    isURL(param: string): boolean {
        // Abi Charles Africa America
        const namePattern = /^[a-zA-Z0-9\-\\_.:]+$/;
        return namePattern.test(param);

    },
    isBusinessNumber(param: string): boolean {
        // business number format
        const bnPattern = /^[0-9-]+$/;
        return bnPattern.test(param);
    },
    isStandardCode(param: string): boolean {
        // Product Group | Body & Soul10
        const standardCodePattern = /^[a-zA-Z0-9]+[&\s\-_]*[a-zA-Z0-9$#]*$/;
        return standardCodePattern.test(param);
    },
    isCountryCode(param: string): boolean {
        // langCode must be string of format en-US
        const countryCodePattern = /^[a-z]{2}-[A-Z]{2}$/;
        return countryCodePattern.test(param);
    },
    isLanguageCode(param: string): boolean {
        // langCode must be string of format en-US
        const langCodePattern = /^[a-z]{2}-[A-Z]{2}$/;
        return langCodePattern.test(param);
    },
    isWordSpace(param: string): boolean {
        // words with spaces and hyphens, no numbers
        const wordSpacePattern = /^[a-zA-Z0-9,()"._&]+[\s\-a-zA-Z0-9,()"._&]*[a-zA-Z0-9,()"._?]*$/;
        return wordSpacePattern.test(param);
    },
    isLabelCode(param: string): boolean {
        // firstName_middleName_lastName
        const labelCodePattern = /^[a-zA-Z]+[_\-a-zA-Z]*[_a-z0-9]*$/;
        return labelCodePattern.test(param);
    },
    isErrorCode(param: string): boolean {
        // error code format (AB10-100, AB900)
        const errorCodePattern = /^[a-zA-Z0-9]+[-]*[0-9]*$/;
        return errorCodePattern.test(param);
    },
    isPathName(param: string) {
        // mysite.new_base.nicelook
        const pathNamePattern = /^[a-zA-Z0-9/]+[_a-zA-Z0-9./]*[a-zA-Z0-9/]*$/;
        return pathNamePattern.test(param);
    },
    isNameNoSpace(param: string): boolean {
        // JohnPaul
        const nameNoSpacePattern = /[a-zA-Z]+/;
        return nameNoSpacePattern.test(param);
    },
    isDescription(param: string): boolean {
        "use strict";
        const descPattern = /^[a-zA-Z0-9\s\\.,:/()*_|\-!@#$%&]+$/; // Alphanumeric string with spaces, and
        // (.,:/()*_-|!@)
        return descPattern.test(param);
    },
    isCurrency(param: string): boolean {
        const currencyPattern = /^[a-zA-Z#$]+$/;
        return currencyPattern.test(param);
    },
    // Web store functions:
    setCookie(cname: string, cvalue: string, exdays: number) {
        const d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        const expires = "expires=" + d.toUTCString();
        document.cookie = `${cname}=${cvalue}; ${expires}; path=/`;
    },
    getCookie(cname: string): string {
        const name = `${cname}=`;
        const decodedCookie = decodeURIComponent(document.cookie);
        const ca = decodedCookie.split(";");
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            // trip white/empty spaces
            while (c.charAt(0) === " ") {
                c = c.substring(1);
            }
            // if cookie exist, return the value
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    },
    checkCookie() {
        let username: string | null = this.getCookie("username") || "";
        if (username !== "") {
            //TODO: perform action with set value;
        } else {
            username = prompt("Please enter your name:", "");
            if (username !== "" && username !== null) {
                this.setCookie("username", username, 365);
            }
        }
    },
    mcStore(options = {storageName: ""}) {
        // localforage instance for client/UI only
        const storageName = options && options.storageName ? options.storageName : "mconnectStore";
        return localforage.createInstance({name: storageName,});
    },
    mcStoreTest(options = {storageName: ""}) {
        // NOTE: *****this method is strictly for testing only*****
        // localforage instance for client/UI only
        return (options && options.storageName && typeof options.storageName ?
            options.storageName : "mconnectStore");
    },
    async setItemState(itemKey: string, itemValue: ItemStateType, expire: number) {
        try {
            const mStore = this.mcStore();
            await mStore.setItem(itemKey, itemValue);
            await mStore.setItem(`${itemKey}Expire`, expire);
        } catch (e) {
            console.error("error setting/saving localforage item: ", e.stack);
        }
    },
    async removeItemState(itemKey: string) {
        try {
            const mStore = this.mcStore();
            await mStore.removeItem(itemKey);
            await mStore.removeItem(`${itemKey}Expire`);
        } catch (e) {
            console.error("error removing localforage item: ", e.stack);
        }
    },
    async getItemState(itemKey: string): Promise<ItemStateType> {
        try {
            const mStore = this.mcStore();
            const item: ItemStateType = await mStore.getItem(itemKey) || {},
                expire = await mStore.getItem(`${itemKey}Expire`);
            if (!item || !expire) {
                return "";
            }
            if (Date.now() > Number(expire)) {
                await this.removeItemState(itemKey);
                return "";
            }
            return item;
        } catch (e) {
            console.error("error getting localforage data: ", e.stack);
            return ""
        }
    },
    async setToken(token: string, expire: number) {
        try {
            const mStore = this.mcStore();
            await mStore.setItem("authToken", token);
            await mStore.setItem("authTokenExpire", expire);
        } catch (e) {
            console.error("error setting/saving localStorage item (setToken):", e.message);
        }
    },
    async removeToken() {
        try {
            const mStore = this.mcStore();
            await mStore.removeItem("authToken");
            await mStore.removeItem("authTokenExpire");
        } catch (e) {
            console.error("error removing localStorage item(removeToken): ", e.message);
        }
    },
    async getToken(): Promise<string> {
        try {
            const mStore = this.mcStore();
            const item: string = await mStore.getItem("authToken") || "",
                expire = await mStore.getItem("authTokenExpire");
            if (!item || !expire) {
                return "";
            }
            if (Date.now() > Number(expire)) {
                // await removeItemState(itemKey);
                await this.removeToken();
                await this.removeCurrentUser();
                return "";
            }
            return item;
        } catch (e) {
            console.error("error getting localStorage item (getToken): ", e.message);
            return "";
        }
    },
    async loggedIn(): Promise<boolean> {
        try {
            return !!(await this.getToken());
        } catch (e) {
            console.error("error getting localStorage item (loggedIn): ", e.message);
            return false;
        }
    },
    async setLoginName(name: string, expire: number) {
        try {
            const mStore = this.mcStore();
            await mStore.setItem("loginName", name);
            await mStore.setItem("loginNameExpire", expire);
        } catch (e) {
            console.error("error setting/saving localStorage item (setLoginName):", e.message);
        }
    },
    async removeLoginName() {
        try {
            const mStore = this.mcStore();
            await mStore.removeItem("loginName");
            await mStore.removeItem("loginNameExpire");
        } catch (e) {
            console.error("error removing localStorage item(removeLoginName): ", e.message);
        }
    },
    async getLoginName(): Promise<string> {
        try {
            const mStore = this.mcStore();
            const item: string = await mStore.getItem("loginName") || "",
                expire = await mStore.getItem("loginNameExpire");
            if (!item || !expire) {
                return "";
            }
            if (Date.now() > Number(expire)) {
                await this.removeLoginName();
                return "";
            }
            return item;
        } catch (e) {
            console.error("error retrieving localStorage item(getLoginName): ", e.message);
            return "";
        }
    },
    async setCurrentUser(userInfo: object) {
        try {
            const mStore = this.mcStore();
            await mStore.setItem("currentUser", userInfo);
        } catch (e) {
            console.error("error setting localStorage item(setCurrentUser): ", e.message);
        }
    },
    async removeCurrentUser() {
        try {
            const mStore = this.mcStore();
            await mStore.removeItem("currentUser");
        } catch (e) {
            console.error("error removing localStorage item(removeCurrentUser): ", e.message);
        }
    },
    async getCurrentUser(): Promise<object> {
        try {
            const mStore = this.mcStore();
            const item: object = await mStore.getItem("currentUser") || {};
            return item ? item : {};
        } catch (e) {
            console.error("error retrieving localStorage item(getCurrentUser): ", e.message);
            return {};
        }
    },
    async setApiToken(token: string) {
        try {
            const mStore = this.mcStore();
            await mStore.setItem("apiToken", token);
        } catch (e) {
            console.error("error setting localStorage item(setApiToken): ", e.message);
        }
    },
    async removeApiToken() {
        try {
            const mStore = this.mcStore();
            await mStore.removeItem("apiToken");
        } catch (e) {
            console.error("error removing localStorage item(removeApiToken): ", e.message);
        }
    },
    async getApiToken(): Promise<string> {
        try {
            const mStore = this.mcStore();
            const item: string = await mStore.getItem("apiToken") || "";
            return item ? item : "";
        } catch (e) {
            console.error("error retrieving localStorage item(getApiToken): ", e.message);
            return "";
        }
    },

}
