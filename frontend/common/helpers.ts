import * as path from "path";

export function getBaseUrl() {
    return document.querySelector("meta[name=\"fl-base-url\"]").getAttribute("content");
}

export function getAssetUrl(partialPath: string) {
    return path.join(getBaseUrl(), "assets", partialPath);
}
