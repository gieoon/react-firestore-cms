// convert firebase date format to a display date
export const firebaseDate2DisplayDate = (firebaseDate) => {
    // console.log('converting: ', firebaseDate.seconds * 1000)
    if(!firebaseDate || !firebaseDate.seconds) return "";
    const out = new Date(firebaseDate.seconds * 1000).toLocaleDateString("en-nz");
    // console.log(out);
    return out;
}

export const getCMSStoragePath = (projectName, type, filename) => {
    // return currentEmail + "/" + type + "/" + filename + "-" + Date.now();
    return "custom/" + projectName + "/cms/" + type + "/" + Date.now() + "-" + filename;
}

export const getWebsiteContentsStoragePath = (projectName, type, filename) => {
    // return currentEmail + "/" + type + "/" + filename + "-" + Date.now();
    return "custom/" + projectName + "/content/" + type + "/" + Date.now() + "-" + filename;
}
