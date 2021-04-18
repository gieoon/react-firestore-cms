export const ENVIRONMENT = 
    "DEVELOP"; 
    // "PRODUCTION";

export const SHOW_HUMAN_FEEDBACK = ENVIRONMENT === "DEVELOP";
export const DB_VERSION = ENVIRONMENT === "DEVELOP" 
    ? "DEBUG_" 
    : "LIVE_"; 

export const COLLECTION__CMS = DB_VERSION + "CMS";
export const STORAGE_ROOT = 'https://firebasestorage.googleapis.com';