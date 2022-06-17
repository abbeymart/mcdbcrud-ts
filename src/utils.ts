/**
 * @Author: abbeymart | Abi Akindele | @Created: 2020-07-04 | @Updated: 2020-07-04
 * @Company: mConnect.biz | @License: MIT
 * @Description: common util functions
 */

import * as localforage from "localforage";
import {getResMessage} from "@mconnect/mcresponse";
import {isEmpty, UserInfoType, ObjectType} from "./crud";

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

// types
interface Options {
    type?: string;
    language?: string;
}

export type ItemStateType = string | number | ObjectType | string[] | number[] | ObjectType[] | null;

export interface GetNamesType {
    firstname?: string;
    middlename?: string;
    lastname?: string;
}

export function getLanguage(userLang = "en-US"): string {
    // Define/set default language variable
    let defaultLang = "en-US";
    // Set defaultLang to current userLang, set from the UI
    if (userLang) {
        defaultLang = userLang;
    }
    return defaultLang;
}

export function getLocale(localeFiles: Locale, options: Options = {}): ValueType {
    // validate localeFiles as an object
    if (typeof localeFiles !== "object" || isEmpty(localeFiles)) {
        throw new Error("Locale files should be an object and not empty")
    }

    // const localeType = options && options.type ? options.type : "";
    const language = options && options.language ? options.language : "en-US";

    // set the locale file contents
    return localeFiles[language];

}

export function getParamsMessage(msgObject: MessageObject): ResponseMessage {
    if (typeof msgObject !== "object") {
        return getResMessage("validateError", {
            message: "Cannot process non-object-value",
        });
    }
    let messages = "";
    Object.entries(msgObject).forEach(([key, msg]) => {
        messages = messages ? `${messages} | ${key} : ${msg}` : `${key} : ${msg}`;
    });
    return getResMessage("validateError", {
        message: messages,
    });
}

export function shortString(str: string, maxLength = 20): string {
    return str.toString().length > maxLength ? str.toString().substr(0, maxLength) + "..." : str.toString();
}

export function strToBool(val: string | number = "n"): boolean {
    const strVal = val.toString().toLowerCase();
    if (strVal === "true" || strVal === "t" || strVal === "yes" || strVal === "y") {
        return true;
    } else {
        return Number(strVal) > 0;
    }
}

export async function userIpInfo(ipUrl = "https://ipinfo.io", options: ObjectType = {}): Promise<ObjectType> {
    // Get the current user IP address Information
    // TODO: use other method besides ipinfo.io, due to query limit/constraint (i.e. 429 error)
    try {
        // const reqH = options && options.headers? options. headers : {};
        const reqHeaders = {"Content-Type": "application/json"};
        options = Object.assign({}, options, {
            method: "GET",
            mode: "cors",
            headers: reqHeaders,
        });
        const response = await fetch(ipUrl as RequestInfo, options as RequestInit);
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
}

export function userBrowser() {
    // push each browser property, as key/value pair, into userBrowser array variable
    return navigator.userAgent;
}

export function currentUrlInfo(pathLoc: string) {
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
}

export function getPath(req: Request): string {
    let itemPath = req.url || "/mc";
    itemPath = itemPath.split("/")[1];
    return itemPath ? itemPath : "mc";
}

export function getFullName(firstName: string, lastName: string, middleName = ""): string {
    if (firstName && middleName && lastName) {
        return (firstName + " " + middleName + " " + lastName);
    }
    return (firstName + " " + lastName);
}

export function getNames(fullName: string): GetNamesType {
    const nameParts = fullName.split("");
    let firstname, lastname, middlename;
    if (nameParts.length > 2) {
        firstname = nameParts[0];
        lastname = nameParts[2];
        middlename = nameParts[1];
        return {
            firstname,
            middlename,
            lastname,
        };
    } else {
        firstname = nameParts[0];
        lastname = nameParts[1];
        return {
            firstname,
            lastname,
        };
    }
    // Return firstName, middleName and lastName based on fullName components ([0],[1],[2])
}

export function pluralize(n: number, itemName: string, itemPlural = ""): string {
    // @TODO: retrieve plural for itemName from language dictionary {name: plural}
    let itemNamePlural: string;
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
}

export function getAge(dateString: string): number {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && birthDate.getDate() > today.getDate())) {
        age--;
    }
    return age;
}

export const localStorageUtils = {
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
            const item: ItemStateType = await mStore.getItem(itemKey) || "",
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
    async setCurrentUser(userInfo: UserInfoType) {
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
    async getCurrentUser(): Promise<UserInfoType> {
        try {
            const mStore = this.mcStore();
            const item: UserInfoType = await mStore.getItem("currentUser") || {};
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
