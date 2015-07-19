
//
//   Copyright 2015 Futur Solo
//
//   Licensed under the Apache License, Version 2.0 (the "License");
//   you may not use this file except in compliance with the License.
//   You may obtain a copy of the License at
//
//       http://www.apache.org/licenses/LICENSE-2.0
//
//   Unless required by applicable law or agreed to in writing, software
//   distributed under the License is distributed on an "AS IS" BASIS,
//   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//   See the License for the specific language governing permissions and
//   limitations under the License.

window.loading = true;

var _ = function (selector) {
    return document.querySelector(selector);
};

var _All = function (selector) {
    return document.querySelectorAll(selector);
};

var objects = {
    ".load": _(".load"),
    ".load .failed": _(".load .failed"),

    ".confirm": _(".confirm"),
    ".confirm .message": _(".confirm .message"),
    ".confirm .cancel": _(".confirm .cancel"),
    ".confirm .continue": _(".confirm .continue"),

    ".public": _(".public"),
    ".public .content-selector .upload-now": _(".public .content-selector .upload-now"),
    ".public .content-selector .uploaded": _(".public .content-selector .uploaded"),

    ".public .content .uploading": _(".public .content .uploading"),
    ".public .content .uploading .progress-bar": _(".public .content .uploading .progress-bar"),

    ".public .content .upload-now": _(".public .content .upload-now"),
    ".public .content .upload-now .select-file": _(".public .content .upload-now .select-file"),
    ".public .content .upload-now .hidden-file-selector": _(".public .content .upload-now .hidden-file-selector"),

    ".public .content .uploaded": _(".public .content .uploaded"),

    ".public .action .insert-as-photo": _(".public .action .insert-as-photo"),
    ".public .action .insert-as-link": _(".public .action .insert-as-link"),
    ".public .action .cancel": _(".public .action .cancel"),

    ".aside": _(".aside"),
    ".aside .show-lobby": _(".aside .show-lobby"),
    ".aside .show-working": _(".aside .show-working"),
    ".aside .show-crda": _(".aside .show-crda"),
    ".aside .show-configuration": _(".aside .show-configuration"),

    "main > .lobby": _("main > .container.lobby"),
    "main > .lobby .writing-num .content": _("main > .container.lobby .tile.writing-num .content"),
    "main > .lobby .page-num .content": _("main > .container.lobby .tile.page-num .content"),
    "main > .lobby .reply-num .content": _("main > .container.lobby .tile.reply-num .content"),

    "main > .lobby .writing-num .manage-writing": _("main > .container.lobby .tile.writing-num .manage-writing"),
    "main > .lobby .page-num .manage-page": _("main > .container.lobby .tile.page-num .manage-page"),
    "main > .lobby .reply-num .manage-reply": _("main > .container.lobby .tile.reply-num .manage-reply"),

    "main > .lobby .float-container .create-new-fab": _("main > .container.lobby .float-container .create-new-fab"),


    "main > .working": _("main > .working"),
    "main > .working .title-input": _("main > .container.working > .title-container .title-input"),
    "main > .working .editor-textarea": _("main > .container.working > .editor-container > .editor-textarea"),
    "main > .working .preview-div": _("main > .container.working > .preview-container > .preview-div"),

    "main > .working .slug-input": _("main > .container.working  > .info-container .slug-container .slug-input"),
    "main > .working .slug-preview": _("main > .container.working  > .info-container .slug-container .slug-preview"),

    "main > .working .type-radio-group paper-radio-button[name=writing]": _("main > .container.working  > .info-container .type-container > .type-radio-group paper-radio-button[name=writing]"),
    "main > .working .type-radio-group paper-radio-button[name=page]": _("main > .container.working  > .info-container .type-container > .type-radio-group paper-radio-button[name=page]"),

    "main > .working .time-checkbox": _("main > .container.working  > .info-container .time-container .time-checkbox"),
    "main > .working .time-input": _("main > .container.working > .info-container .time-container .time-input"),


    "main > .working .info-container": _("main > .container.working > .info-container"),

    "main > .working .info-container .close-button": _("main > .container.working > .info-container .close-button"),

    "main > .working .id-input": _("main > .container.working  > .info-container .hidden-container > .id-input"),
    "main > .working .method-input": _("main > .container.working  > .info-container .hidden-container > .method-input"),
    "main > .working .publish-or-not": _("main > .container.working  > .info-container .hidden-container > .publish-or-not"),

    "main > .working .publish-button": _("main > .container.working  > .info-container .save-container > .publish-button"),
    "main > .working .draft-button": _("main > .container.working  > .info-container .save-container > .draft-button"),

    "main > .working .float-container .publish-fab": _("main > .container.working  > .float-container > .publish-fab"),
    "main > .working .float-container .open-public-fab": _("main > .container.working  > .float-container > .open-public-fab"),

    "main > .working .toast-container .draft-success": _("main > .container.working  > .toast-container > .draft-success"),
    "main > .working .toast-container .publish-success": _("main > .container.working  > .toast-container > .publish-success"),
    "main > .working .toast-container .info-required": _("main > .container.working  > .toast-container > .info-required"),
    "main > .working .toast-container .save-failed": _("main > .container.working  > .toast-container > .save-failed"),

    ".main > .crda": _(".main > .container.crda"),
    ".main > .crda .type-selector": _(".main > .container.crda .type-selector"),
    ".main > .crda .type-selector .writings": _(".main > .container.crda .type-selector  .writings"),
    ".main > .crda .type-selector .pages": _(".main > .container.crda .type-selector  .pages"),
    ".main > .crda .type-selector .replies": _(".main > .container.crda .type-selector  .replies"),

    ".main > .crda .main-container .writings": _(".main > .container.crda .main-container  .writings"),
    ".main > .crda .main-container .pages": _(".main > .container.crda .main-container  .pages"),
    ".main > .crda .main-container .replies": _(".main > .container.crda .main-container  .replies"),

    ".main > .crda .reply-editor": _(".main > .container.crda .reply-editor"),
    ".main > .crda .reply-editor .name": _(".main > .container.crda .reply-editor .name"),
    ".main > .crda .reply-editor .email": _(".main > .container.crda .reply-editor .email"),
    ".main > .crda .reply-editor .homepage": _(".main > .container.crda .reply-editor .homepage"),
    ".main > .crda .reply-editor .content": _(".main > .container.crda .reply-editor .content"),

    ".main > .crda .reply-editor .cancel": _(".main > .container.crda .reply-editor .cancel"),
    ".main > .crda .reply-editor .save": _(".main > .container.crda .reply-editor .save"),

    ".main > .crda .toast-container .save-success": _(".main > .container.crda  > .toast-container > .save-success"),
    ".main > .crda .toast-container .save-failed": _(".main > .container.crda  > .toast-container > .save-failed"),

    ".main > .configuration": _(".main > .container.configuration"),

    ".main > .configuration .reset": _(".main > .container.configuration .reset"),
    ".main > .configuration .save": _(".main > .container.configuration .save"),

    ".main > .configuration .toast-container .save-success": _(".main > .container.configuration  > .toast-container > .save-success"),
    ".main > .configuration .toast-container .save-failed": _(".main > .container.configuration  > .toast-container > .save-failed"),
};

function getCookie(name) {
    var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
    return r ? r[1] : undefined;
}

function datetimeToUnix(datetime) {
    var tmp_datetime = datetime.replace(/:/g,"-");
    tmp_datetime = tmp_datetime.replace(/ /g,"-");
    var arr = tmp_datetime.split("-");
    var now = new Date(
        Date.UTC(arr[0], arr[1]-1, arr[2], arr[3]-8, arr[4], arr[5])
    );
    return parseInt(now.getTime() / 1000);
}

function unixToDatetime(unix) {
    var now = new Date(parseInt(unix) * 1000);
    var targetFormat = "yyyy-MM-dd hh:mm:ss";
    var date = {
           "M+": now.getMonth() + 1,
           "d+": now.getDate(),
           "h+": now.getHours(),
           "m+": now.getMinutes(),
           "s+": now.getSeconds(),
           "q+": Math.floor((now.getMonth() + 3) / 3),
           "S+": now.getMilliseconds()
    };
    if (/(y+)/i.test(targetFormat)) {
        targetFormat = targetFormat.replace(
            RegExp.$1, (now.getFullYear() + "").substr(4 - RegExp.$1.length)
        );
    }
    for (var k in date) {
           if (new RegExp("(" + k + ")").test(targetFormat)) {
               targetFormat = targetFormat.replace(
                    RegExp.$1, RegExp.$1.length == 1 ? date[k] : (
                        "00" + date[k]
                    ).substr(("" + date[k]).length)
                );
           }
    }
    return targetFormat;
}

function collectionHas(a, b) {
    for(var i = 0, len = a.length; i < len; i ++) {
        if(a[i] == b) return true;
    }
    return false;
}

function findParentBySelector(elm, selector) {
    var all = _All(selector);
    var cur = elm.parentNode;
    while(cur && !collectionHas(all, cur)) {
        cur = cur.parentNode;
    }
    return cur;
}

function getVars() {
    var vars = {};
    var param = location.search.substring(1).split("&");
    for (var i = 0; i < param.length; i++) {
        var keySearch = param[i].search(/=/);
        var key = "";
        if (keySearch != -1) key = param[i].slice(0, keySearch);
        var val = param[i].slice(param[i].indexOf("=", 0) + 1);
        if(key !== "") vars[key] = decodeURI(val);
    }
    return vars;
}

function showToast(element) {
    element.time = Math.round((new Date()).getTime() / 1000);
    element.classList.add("visible");
}

setInterval(function () {
    currentTime = Math.round((new Date()).getTime() / 1000);
    Array.prototype.forEach.call(_All(".toast.visible.auto-hide"), function (element) {
        if ((currentTime - element.time) >= 5) {
            element.classList.remove("visible");
        }
        alert((currentTime - element.time));
    });
}, 10);

function loadLayout(callback) {
    window.loading = true;
    setTimeout(function () {
        objects[".load"].style.height = "100%";
        objects[".load"].style.width = "100%";
        objects[".load"].classList.add("visible");

        function hideLoadLayout() {
            objects[".load"].classList.remove("visible");
            setTimeout(function () {
                objects[".load"].style.height = "0";
                objects[".load"].style.width = "0";
                window.loading = false;
            }, 300);
        }
        setTimeout(function () {
            if (objects[".aside"].classList.contains("is-visible") && _(".mdl-layout__obfuscator")) {
                _(".mdl-layout__obfuscator").click();
            }
            callback(hideLoadLayout);
        }, 300);
    }, 100);
}

function hidePublic() {
    objects[".public"].classList.remove("visible");
    setTimeout(function () {
    objects[".public"].style.height = "0";
    objects[".public"].style.width = "0";
    }, 300);
}

function showPublic() {
    objects[".public"].style.height = "100%";
    objects[".public"].style.width = "100%";
    objects[".public"].classList.add("visible");
    objects[".public .content-selector .upload-now"].click();
}

function loadLobbyData(callback) {
    queryString = new FormData();
    queryString.append("_xsrf", getCookie("_xsrf"));
    queryString.append("action", "count");

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
        objects["main > .lobby .writing-num .content"].innerHTML = json.writings;
        objects["main > .lobby .page-num .content"].innerHTML = json.pages;
        objects["main > .lobby .reply-num .content"].innerHTML = json.replies;
        if (callback) {
            callback();
        }
    }).catch(function (error) {
        console.log(error);
        showToast(objects[".load .failed"]);
    });
}

function showLobby() {
    loadLayout(function (callback) {
        window.history.pushState(null, null, "/management/lobby");
        if (_("main > .container.current")) {
            _("main > .container.current").classList.remove("current");
        }
        objects["main > .lobby"].classList.add("current");

        loadLobbyData(callback);
    });
}

objects[".aside .show-lobby"].addEventListener("click", showLobby);

function validateTimeInputValue() {
    after = unixToDatetime(datetimeToUnix(objects["main > .working .time-input"].value));
    if (after != objects["main > .working .time-input"].value) {
        objects["main > .working .time-input"].value = unixToDatetime(Math.round((new Date()).getTime() / 1000)).replace(/\//g,"-");
    }
}

function loadTime() {
    edit = (typeof edit === "undefined") ? false : edit;
    if (objects["main > .working .time-checkbox"].checked){
        objects["main > .working .time-input"].disabled = true;
        objects["main > .working .time-input"].value = unixToDatetime(Math.round((new Date()).getTime() / 1000));
    }else{
        objects["main > .working .time-input"].disabled = false;
    }
    setTimeout(loadTime, 1000);
}

window.addEventListener("load", function () {
    validateTimeInputValue();
    loadTime();
});

function syncHeight() {
    editor = objects["main > .working .editor-textarea"];
    preview = objects["main > .working .preview-div"];
    percentage = editor.scrollTop / (editor.scrollHeight - editor.offsetHeight);
    preview.scrollTop = (preview.scrollHeight - preview.offsetHeight) * percentage;
}

function previewText() {
    objects["main > .working .preview-div"].innerHTML = marked(objects["main > .working .editor-textarea"].value);
    syncHeight();
}

objects["main > .working .editor-textarea"].addEventListener("change", previewText);
objects["main > .working .editor-textarea"].addEventListener("keypress", previewText);
objects["main > .working .editor-textarea"].addEventListener("keydown", previewText);
objects["main > .working .editor-textarea"].addEventListener("keyup", previewText);
objects["main > .working .editor-textarea"].addEventListener("blur", previewText);
objects["main > .working .editor-textarea"].addEventListener("scroll", syncHeight);

function previewSlug() {
    preview = objects["main > .working .slug-preview"];
    if (!objects["main > .working .slug-input"].querySelector("paper-input-container").invalid &&
        objects["main > .working .slug-input"].value !== "") {

        preview.innerHTML = window.location.host;

        if (objects["main > .working .type-radio-group"].selected == "writing") {
            preview.innerHTML += "/writings/";
        } else {
            preview.innerHTML += "/pages/";
        }

        preview.innerHTML += objects["main > .working .slug-input"].value;
        preview.innerHTML += ".htm";

        return;
    }
     preview.innerHTML = "";
}

function clearPreviousWorking() {
    objects["main > .working .title-input"].value = "";
    objects["main > .working .editor-textarea"].value = "";
    objects["main > .working .preview-div"].innerHTML = "";

    objects["main > .working .slug-input"].value = "";
    objects["main > .working .slug-preview"].innerHTML = "";

    document.getElementById("working-type-is-writing").checked = true;

    objects["main > .working .time-checkbox"].checked = true;

    objects["main > .working .id-input"].value = "";
    objects["main > .working .method-input"].value = "new";
    objects["main > .working .draft-button"].style.display = "block";

    Array.prototype.forEach.call(document.getElementsByName("type-radio-group"), function (element) {
        element.removeAttribute("disabled");
    });

}

function showWorking(edit, type, id) {
    edit = (typeof edit === "undefined") ? false : edit;
    type = (typeof type === "undefined") ? "writing" : type;
    id = (typeof id === "undefined") ? "-1" : id;

    loadLayout(function (callback) {

        uri = "/management/working/";
        if (edit !== true) {
            uri += "new";
        } else {
            uri += "edit?type=" + type + "&id=" + id;
        }
        window.history.pushState(null, null, uri);
        clearPreviousWorking();

        if (_("main > .container.current")) {
            _("main > .container.current").classList.remove("current");
        }

        objects["main > .working"].classList.add("current");

        if (edit === true) {
            queryString = new FormData();
            queryString.append("_xsrf", getCookie("_xsrf"));
            queryString.append("action", "load_working");
            queryString.append("type", type);
            queryString.append("id", id);

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
                objects["main > .working .id-input"].value = json._id;
                objects["main > .working .editor-textarea"].value = json.content;
                objects["main > .working .slug-input"].value = json.slug;
                if (json.time === 0) {
                    objects["main > .working .time-checkbox"].checked = true;
                } else {
                    objects["main > .working .time-checkbox"].checked = false;
                    objects["main > .working .time-input"].value = unixToDatetime(json.time);
                }

                objects["main > .working .type-radio-group"].selected = type;

                objects["main > .working .type-radio-group paper-radio-button[name=writing]"].setAttribute("disabled", null);
                objects["main > .working .type-radio-group paper-radio-button[name=page]"].setAttribute("disabled", null);

                if (json.publish) {
                    objects["main > .working .draft-button"].style.display = "none";
                }
                objects["main > .working .title-input"].value = json.title;
                objects["main > .working .method-input"].value = "edit";
                previewSlug();
                previewText();
                callback();
            }).catch(function (error) {
                console.log(error);
                showToast(objects[".load .failed"]);
            });
        } else {
            callback();
        }
    });
}

objects[".aside .show-working"].addEventListener("click", showWorking);

objects["main > .lobby .float-container .create-new-fab"].addEventListener("click", showWorking);

objects["main > .working .float-container .publish-fab"].addEventListener("click", function () {
    objects["main > .working .info-container"].classList.add("visible");
});
objects["main > .working .info-container .close-button"].addEventListener("click", function () {
    objects["main > .working .info-container"].classList.remove("visible");
});


Array.prototype.forEach.call(document.getElementsByName("type-radio-group"), function (element) {
    element.addEventListener("click", previewSlug);
});

objects["main > .working .slug-input"].addEventListener("change", previewSlug);
objects["main > .working .slug-input"].addEventListener("keypress", previewSlug);
objects["main > .working .slug-input"].addEventListener("keydown", previewSlug);
objects["main > .working .slug-input"].addEventListener("keyup", previewSlug);
objects["main > .working .slug-input"].addEventListener("blur", previewSlug);

objects["main > .working .time-input"].addEventListener("blur", function () {
    before = objects["main > .working .time-input"].value;
    after = unixToDatetime(datetimeToUnix(before));
    if (after != objects["main > .working .time-input"].value) {
        objects["main > .working .time-input"].value = unixToDatetime(Math.round((new Date()).getTime() / 1000)).replace(/\//g,"-");
    }
});

objects["main > .working .float-container .open-public-fab"].addEventListener("click", showPublic);

function sendWorking() {
    if (objects["main > .working .slug-input"].value === "" ||
        objects["main > .working .title-input"].value === "" ||
        objects["main > .working .editor-textarea"].value === "") {
            showToast(objects["main > .working .toast-container .info-required"]);
            return;
        }

    queryString = new FormData();
    queryString.append("_xsrf", getCookie("_xsrf"));
    queryString.append("action", "save_working");

    queryString.append("working_title", objects["main > .working .title-input"].value);
    queryString.append("working_content", objects["main > .working .editor-textarea"].value);

    queryString.append("working_type", objects["main > .working .type-radio-group"].selected);
    queryString.append("working_method", objects["main > .working .method-input"].value);

    var publishTime = 0;

    if (objects["main > .working .time-checkbox"].checked && objects["main > .working .publish-or-not"].value == "false") {
        queryString.append("working_time", "0");
    } else {
        publishTime = objects["main > .working .time-input"].value;
        queryString.append("working_time", datetimeToUnix(publishTime));
    }

    queryString.append("working_publish", objects["main > .working .publish-or-not"].value);
    queryString.append("working_slug", objects["main > .working .slug-input"].value);
    queryString.append("working_id", objects["main > .working .id-input"].value);

    fetch("/management/api", {
        "method": "post",
        "credentials": "include",
        "body": queryString
    }).then(function (resp) {
        if (resp.status >= 200 && resp.status < 400) {
            return resp.json();
        }
        throw response.status + "";
    }).then(function (json) {
        if (!json.succeed) {
            if (!json.reason) {
                throw "unknown";
            } else {
                throw json.reason;
            }
        }
        if (objects["main > .working .publish-or-not"].value == "true") {
            objects["main > .working .toast-container .publish-success"].querySelector("a").href = "/" +
                objects["main > .working .type-radio-group"].selected + "s/" +
                objects["main > .working .slug-input"].value + ".htm";
            objects["main > .working .toast-container .publish-success"].show();
            objects["main > .working .draft-button"].style.display = "none";
            objects["main > .working .time-checkbox"].checked = false;
            objects["main > .working .time-input"].value = publishTime;
        } else {
            objects["main > .working .toast-container .draft-success"].show();
        }
        objects["main > .working .info-container"].classList.remove("visible");
        window.history.pushState(null, null, "/management/working/edit?type=" + objects["main > .working .type-radio-group"].selected + "&id=" + json.id);
        objects["main > .working .id-input"].value = json.id;
        objects["main > .working .method-input"].value = "edit";

        objects["main > .working .type-radio-group paper-radio-button[name=writing]"].setAttribute("disabled", null);
        objects["main > .working .type-radio-group paper-radio-button[name=page]"].setAttribute("disabled", null);

    }).catch(function (error) {
        if (error == "slug") {
            objects["main > .working .toast-container .save-failed"].text =
                "相同的短链接已经存在，请更换！";
        } else {
            objects["main > .working .toast-container .save-failed"].text =
                "抱歉，发生了未知错误。";
        }
        console.log(error);
        objects["main > .working .toast-container .save-failed"].show();
    });
}

objects["main > .working .publish-button"].addEventListener("click", function () {
    objects["main > .working .publish-or-not"].value = "true";
    sendWorking();
});

objects["main > .working .draft-button"].addEventListener("click", function () {
    objects["main > .working .publish-or-not"].value = "false";
    sendWorking();
});

function buildWindow(slug, sub_slug) {
    if (slug == "lobby") {
        showLobby();
    } else if (slug == "working") {
        if (sub_slug == "edit"){
            sub_slug = true;
        } else {
            sub_slug = false;
        }
        showWorking(sub_slug, getVars().type, getVars().id);
    } else if (slug == "crda") {
        showCRDA(sub_slug);
    } else if (slug == "configuration") {
        showConfiguration();
    } else {
        //need a more graceful way to deal with 404 Error.
        window.location.href = "//" + window.location.host + "/404";
    }
}

function resizeWindow() {
    if (window.innerWidth < 700) {
        _("body").classList.add("small");
    } else {
        _("body").classList.remove("small");
    }
}
window.addEventListener("resize", function () {
    resizeWindow();
});
window.addEventListener("load", function () {
    resizeWindow();
    setTimeout(function () {
        window.addEventListener("popstate", function (event) {
            var state = event.state;
            if (!state) {
                window.location.reload();
            }
        });
    }, 10);
});
