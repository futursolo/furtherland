import * as path from "path";

export function getBaseUrl() {
    return document.querySelector("meta[name=\"fl-base-url\"]").getAttribute("content");
}

export function getAssetUrl(partialPath: string) {
    return getBaseUrl() + path.join("/assets", partialPath);
}
