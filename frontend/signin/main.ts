import * as riot from "riot";
import FlSigninApp from "./fl-signin-app.riot";
import "babel-polyfill";

const mountApp = riot.component(FlSigninApp);

const app = mountApp(document.querySelector("#app-root"), window.flAppOption);
