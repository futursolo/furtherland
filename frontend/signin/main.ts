import * as riot from "riot";
import FlSigninApp from "./fl-signin-app.riot";

const mountApp = riot.component(FlSigninApp);

const appName = document.querySelector("meta[name=\"fl-app-name\"]").getAttribute("content");

if (appName == "signin" || appName == "signup") {
    const app = mountApp(document.querySelector("#fl-app-root"), { appName: appName });
}
