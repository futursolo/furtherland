function acquireConfirm(message, callback) {
    if (message == "remove") {
        message = "你确认要移除它吗？这个操作是不可以逆转的。";
    } else if (message == "leave") {
        message = "你确认要离开吗？你所做的所有修改都会丢失。";
    } else if (message == "reset") {
        message = "你确认要复原它吗？你所做的所有修改都会丢失。";
    }
    objects[".confirm .message"].innerHTML = message;
    function finishConfirm() {
        objects[".confirm"].classList.remove("visible");
        setTimeout(function () {
            objects[".confirm"].style.height = "0";
            objects[".confirm"].style.width = "0";
            objects[".confirm"].style.top = "-10000px";
            objects[".confirm"].style.left = "-10000px";
        }, 300);
    }
    objects[".confirm .cancel"] .onclick = function () {
        finishConfirm();
    };
    objects[".confirm .continue"] .onclick = function () {
        finishConfirm();
        callback();
    };
    objects[".confirm"].style.height = "100%";
    objects[".confirm"].style.width = "100%";
    objects[".confirm"].style.top = "0px";
    objects[".confirm"].style.left = "0px";
    objects[".confirm"].classList.add("visible");
}

//Change Default Bahavior of paper-radio-button
window.addEventListener("load", function () {
    Array.prototype.forEach.call(
        _All("paper-radio-button"), function (element) {
            element.addEventListener("click", function () {
                element.checked = true;
            });
        }
    );
});

function loadConfigurationData(callback) {
    queryString = new FormData();
    queryString.append("_xsrf", getCookie("_xsrf"));
    queryString.append("action", "load_configuration");

    fetch("/management/api", {
        "method": "post",
        "credentials": "include",
        "body": queryString
    }).then(function (resp) {
        if (resp.status >= 200 && resp.status < 400) {
            return resp.json();
        }
        throw new Error(resp.statusText);
    }).then(function (json) {
        Array.prototype.forEach.call(
            _All(".main > .configuration .config-value"), function (element) {
                element.value = json[element.getAttribute("config_name")].value;
            }
        );
        if (callback) {
            callback();
        }
    }).catch(function (error) {
        console.log(error);
        objects[".load .save-failed"].show();
    });
}

function showConfiguration() {
    loadLayout(function (callback) {
        objects[".main aside paper-menu"].selected = 3;
        pushState("/management/configuration");

        objects[".main > .configuration"].classList.add("current");

        loadConfigurationData(callback);
    });
}

objects[".main aside .show-configuration"].addEventListener("click", showConfiguration);

objects[".main > .configuration .reset"].addEventListener("click", function () {
    acquireConfirm("reset", showConfiguration);
});

objects[".main > .configuration .save"].addEventListener("click", function () {
    queryString = new FormData();
    queryString.append("_xsrf", getCookie("_xsrf"));
    queryString.append("action", "save_configuration");

    Array.prototype.forEach.call(
        _All(".main > .configuration .config-value"), function (element) {
            queryString.append(element.getAttribute("config_name"), element.value);
        }
    );

    fetch("/management/api", {
        "method": "post",
        "credentials": "include",
        "body": queryString
    }).then(function (resp) {
        if (resp.status >= 200 && resp.status < 400) {
            return resp.json();
        }
        throw new Error(resp.statusText);
    }).then(function (json) {
        if (!json.status) {
            throw new Error("unknown");
        }
        objects[".main > .configuration .toast-container .save-success"].show();
    }).catch(function (error) {
        console.log(error);
        objects[".main > .configuration .toast-container .save-failed"].show();
    });
});
