import * as riot from "riot";
import FlSigninApp from "./app.riot";

const mountApp = riot.component(FlSigninApp);

const app = mountApp(document.querySelector(".body-container"), {});
