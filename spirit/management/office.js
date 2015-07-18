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

    "header .toggle-sidebar": _("header .toggle-sidebar"),

    ".main aside": _(".main aside"),
    ".main aside paper-menu": _(".main aside paper-menu"),
    ".main aside .show-lobby": _(".main aside .show-lobby"),
    ".main aside .show-working": _(".main aside .show-working"),
    ".main aside .show-crda": _(".main aside .show-crda"),
    ".main aside .show-configuration": _(".main aside .show-configuration"),

    ".main > .lobby": _(".main > .container.lobby"),
    ".main > .lobby .writing-num .content": _(".main > .container.lobby .tile.writing-num .content"),
    ".main > .lobby .page-num .content": _(".main > .container.lobby .tile.page-num .content"),
    ".main > .lobby .reply-num .content": _(".main > .container.lobby .tile.reply-num .content"),

    ".main > .lobby .writing-num .manage-writing": _(".main > .container.lobby .tile.writing-num .manage-writing"),
    ".main > .lobby .page-num .manage-page": _(".main > .container.lobby .tile.page-num .manage-page"),
    ".main > .lobby .reply-num .manage-reply": _(".main > .container.lobby .tile.reply-num .manage-reply"),

    ".main > .lobby .float-container .create-new-fab": _(".main > .container.lobby .float-container .create-new-fab"),


    ".main > .working": _(".main > .working"),
    ".main > .working .title-input": _(".main > .container.working > .title-container > .title-input"),
    ".main > .working .editor-textarea": _(".main > .container.working > .editor-container > .editor-textarea"),
    ".main > .working .preview-div": _(".main > .container.working > .preview-container > .preview-div"),

    ".main > .working .slug-input": _(".main > .container.working  > .info-container .slug-container > .slug-input"),
    ".main > .working .slug-preview": _(".main > .container.working  > .info-container .slug-container > .slug-preview"),

    ".main > .working .type-radio-group": _(".main > .container.working  > .info-container .type-container > .type-radio-group"),
    ".main > .working .type-radio-group paper-radio-button[name=writing]": _(".main > .container.working  > .info-container .type-container > .type-radio-group paper-radio-button[name=writing]"),
    ".main > .working .type-radio-group paper-radio-button[name=page]": _(".main > .container.working  > .info-container .type-container > .type-radio-group paper-radio-button[name=page]"),

    ".main > .working .time-checkbox": _(".main > .container.working  > .info-container .time-container > .time-checkbox"),
    ".main > .working .time-input": _(".main > .container.working > .info-container .time-container > .time-input"),


    ".main > .working .info-container": _(".main > .container.working > .info-container"),

    ".main > .working .info-container .close-button": _(".main > .container.working > .info-container .close-button"),

    ".main > .working .id-input": _(".main > .container.working  > .info-container .hidden-container > .id-input"),
    ".main > .working .method-input": _(".main > .container.working  > .info-container .hidden-container > .method-input"),
    ".main > .working .publish-or-not": _(".main > .container.working  > .info-container .hidden-container > .publish-or-not"),

    ".main > .working .publish-button": _(".main > .container.working  > .info-container .save-container > .publish-button"),
    ".main > .working .draft-button": _(".main > .container.working  > .info-container .save-container > .draft-button"),

    ".main > .working .float-container .publish-fab": _(".main > .container.working  > .float-container > .publish-fab"),
    ".main > .working .float-container .open-public-fab": _(".main > .container.working  > .float-container > .open-public-fab"),

    ".main > .working .toast-container .draft-success": _(".main > .container.working  > .toast-container > .draft-success"),
    ".main > .working .toast-container .publish-success": _(".main > .container.working  > .toast-container > .publish-success"),
    ".main > .working .toast-container .info-required": _(".main > .container.working  > .toast-container > .info-required"),
    ".main > .working .toast-container .save-failed": _(".main > .container.working  > .toast-container > .save-failed"),

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

function pushState(uri) {
    if (uri) {
        window.history.pushState(null, null, "//" + window.location.host + uri);
    }
}

var getVars = (function () {
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
})();

function loadLayout(callback) {
    window.loading = true;
    setTimeout(function () {
        Array.prototype.forEach.call(_All(".visible"), function (element) {
            element.classList.remove("visible");
        });
        Array.prototype.forEach.call(_All(".current"), function (element) {
            element.classList.remove("current");
        });
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
        setTimeout(callback, 300, hideLoadLayout);
    }, 100);
}

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

function showPublicUploadNow() {
    current = _(".public .content .current");

    if (current && current.classList.contains("upload-now")) {
        return;
    } else if (current) {
        current = _(".public .content .current");
        current.classList.remove("current");
    }

    objects[".public .content .upload-now"].classList.add("current");
    objects[".public .action .insert-as-photo"].style.display = "none";
    objects[".public .action .insert-as-link"].style.display = "none";
}

objects[".public .content-selector .upload-now"].addEventListener("click", showPublicUploadNow);

function bindPublicEvent(event) {
    target = event.target || event.srcElement;
    if (_(".public .content .uploaded .file-item.current")) {
        _(".public .content .uploaded .file-item.current").classList.remove("current");
    }
    if (!target.getAttribute("fileurl")) {
        target = findParentBySelector(target, ".public .content .uploaded .file-item");
    }
    target.classList.add("current");
    objects[".public .action .insert-as-photo"].style.display = "inline-block";
    objects[".public .action .insert-as-photo"].setAttribute("fileurl", target.getAttribute("fileurl"));
    objects[".public .action .insert-as-link"].style.display = "inline-block";
    objects[".public .action .insert-as-link"].setAttribute("fileurl", target.getAttribute("fileurl"));
}

function loadPublicUploadedData() {
    queryString = new FormData();
    queryString.append("_xsrf", getCookie("_xsrf"));
    queryString.append("action", "load_public");

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
        objects[".public .content .uploaded"].innerHTML = "";
        for (var key in json) {
            item = json[key];
            element = document.createElement("div");
            element.setAttribute("class", "file-item");
            element.setAttribute("fileurl", item.fileurl);

            fileNameElement = document.createElement("span");
            fileNameElement.setAttribute("class", "name");
            fileNameElement.innerHTML = item.filename;
            element.appendChild(fileNameElement);

            timeElement = document.createElement("span");
            timeElement.setAttribute("class", "time");
            timeElement.innerHTML = unixToDatetime(item.time);
            element.appendChild(timeElement);

            rippleElement = document.createElement("paper-ripple");
            rippleElement.style.color = "rgba(54, 134, 190, 0.75)";
            element.appendChild(rippleElement);

            element.addEventListener("click", bindPublicEvent);

            objects[".public .content .uploaded"].appendChild(element);
        }
    }).catch(function (error) {
        console.log(error);
        objects[".load .failed"].show();
    });
}

function showPublicUploaded() {
    current = _(".public .content .current");

    if (current && current.classList.contains("uploaded")) {
        return;
    } else if (current) {
        current = _(".public .content .current");
        current.classList.remove("current");
    }

    objects[".public .content .uploaded"].classList.add("current");
    loadPublicUploadedData();
}

objects[".public .content-selector .uploaded"].addEventListener("click", showPublicUploaded);

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

objects[".public .action .cancel"].addEventListener("click", hidePublic);

function insertPublicFileLinkText(str) {
    if (document.selection) {
        var sel = document.selection.createRange();
        sel.text = str;
    } else if (typeof objects[".main > .working .editor-textarea"].selectionStart === 'number' && typeof objects[".main > .working .editor-textarea"].selectionEnd === 'number') {
        var startPos = objects[".main > .working .editor-textarea"].selectionStart,
            endPos = objects[".main > .working .editor-textarea"].selectionEnd,
            cursorPos = startPos,
            tmpStr = objects[".main > .working .editor-textarea"].value;
        objects[".main > .working .editor-textarea"].value = tmpStr.substring(0, startPos) + str + tmpStr.substring(endPos, tmpStr.length);
        cursorPos += str.length;
        objects[".main > .working .editor-textarea"].selectionStart = objects[".main > .working .editor-textarea"].selectionEnd = cursorPos;
    } else {
        objects[".main > .working .editor-textarea"].value += str;
    }
    hidePublic();
}

objects[".public .action .insert-as-photo"].addEventListener("click", function () {
    text = "![](";
    text += objects[".public .action .insert-as-photo"].getAttribute("fileurl");
    text += ")";
    insertPublicFileLinkText(text);
});

objects[".public .action .insert-as-link"].addEventListener("click", function () {
    text = "[](";
    text += objects[".public .action .insert-as-link"].getAttribute("fileurl");
    text += ")";
    insertPublicFileLinkText(text);
});

objects[".public .content .upload-now .select-file"].addEventListener("click", function () {
    setTimeout(function () {
        objects[".public .content .upload-now .hidden-file-selector"].click();
    }, 300);
});

function uploadPublic(files) {
    objects[".public .content .uploading"].classList.add("visible");
    objects[".public .content .uploading"].style.height = "100%";
    objects[".public .content .uploading"].style.width = "100%";
    queryString = new FormData();
    queryString.append("_xsrf", getCookie("_xsrf"));
    queryString.append("action", "save_public");

    for (i = 0; i < files.length; i++){
        queryString.append("files[]", files[i]);
    }

    request = new XMLHttpRequest();

    request.upload.addEventListener("progress", function (event){
        if (event.lengthComputable) {
            var percentage = Math.round(event.loaded / event.total * 100);

            objects[".public .content .uploading .progress-bar"].value = percentage;
        }
    });

    request.addEventListener("readystatechange", function () {
        if (request.readyState == 4 && request.status == 200) {
            json = JSON.parse(request.responseText);
            console.log(json);
            objects[".public .content .uploading"].classList.remove("visible");
            setTimeout(function () {
                objects[".public .content .uploading"].style.height = "0";
                objects[".public .content .uploading"].style.width = "0";
            }, 300);
            objects[".public .content-selector .uploaded"].click();
        }
    });

    request.open("POST", "/management/api", true);
    request.send(queryString);

}

objects[".public .content .upload-now .hidden-file-selector"].addEventListener("change", function () {
    files = objects[".public .content .upload-now .hidden-file-selector"].files;
    uploadPublic(files);
});

objects[".public .content .upload-now"].addEventListener("dragenter", function (event) {
    event.dataTransfer.dropEffect = "copy";
    event.preventDefault();
    event.stopPropagation();
});

objects[".public .content .upload-now"].addEventListener("dragover", function (event) {
    event.dataTransfer.dropEffect = "copy";
    event.preventDefault();
    event.stopPropagation();
});

objects[".public .content .upload-now"].addEventListener("drop", function (event) {
    event.stopPropagation();
    event.preventDefault();
    files = event.dataTransfer.files;
    uploadPublic(files);
});

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
        objects[".main > .lobby .writing-num .content"].innerHTML = json.writings;
        objects[".main > .lobby .page-num .content"].innerHTML = json.pages;
        objects[".main > .lobby .reply-num .content"].innerHTML = json.replies;
        if (callback) {
            callback();
        }
    }).catch(function (error) {
        console.log(error);
        objects[".load .failed"].show();
    });
}

function showLobby() {
    loadLayout(function (callback) {
        pushState("/management/lobby");

        objects[".main > .lobby"].classList.add("current");

        objects[".main aside paper-menu"].selected = 0;
        loadLobbyData(callback);
    });
}

objects[".main aside .show-lobby"].addEventListener("click", showLobby);

function validateTimeInputValue() {
    after = unixToDatetime(datetimeToUnix(objects[".main > .working .time-input"].value));
    if (after != objects[".main > .working .time-input"].value) {
        objects[".main > .working .time-input"].value = unixToDatetime(Math.round((new Date()).getTime() / 1000)).replace(/\//g,"-");
    }
}

function loadTime() {
    edit = (typeof edit === "undefined") ? false : edit;
    if (objects[".main > .working .time-checkbox"].checked){
        objects[".main > .working .time-input"].disabled = true;
        objects[".main > .working .time-input"].value = unixToDatetime(Math.round((new Date()).getTime() / 1000));
    }else{
        objects[".main > .working .time-input"].disabled = false;
    }
    setTimeout(loadTime, 1000);
}

window.addEventListener("load", function () {
    validateTimeInputValue();
    loadTime();
});

//To toggle sidebar
objects["header .toggle-sidebar"].addEventListener("click", function (e) {
    objects[".main aside"].classList.toggle("visible");
});

function syncHeight() {
    editor = objects[".main > .working .editor-textarea"];
    preview = objects[".main > .working .preview-div"];
    percentage = editor.scrollTop / (editor.scrollHeight - editor.offsetHeight);
    preview.scrollTop = (preview.scrollHeight - preview.offsetHeight) * percentage;
}

function previewText() {
    objects[".main > .working .preview-div"].innerHTML = marked(objects[".main > .working .editor-textarea"].value);
    syncHeight();
}

objects[".main > .working .editor-textarea"].addEventListener("change", previewText);
objects[".main > .working .editor-textarea"].addEventListener("keypress", previewText);
objects[".main > .working .editor-textarea"].addEventListener("keydown", previewText);
objects[".main > .working .editor-textarea"].addEventListener("keyup", previewText);
objects[".main > .working .editor-textarea"].addEventListener("blur", previewText);
objects[".main > .working .editor-textarea"].addEventListener("scroll", syncHeight);

function previewSlug() {
    preview = objects[".main > .working .slug-preview"];
    if (!objects[".main > .working .slug-input"].querySelector("paper-input-container").invalid &&
        objects[".main > .working .slug-input"].value !== "") {

        preview.innerHTML = window.location.host;

        if (objects[".main > .working .type-radio-group"].selected == "writing") {
            preview.innerHTML += "/writings/";
        } else {
            preview.innerHTML += "/pages/";
        }

        preview.innerHTML += objects[".main > .working .slug-input"].value;
        preview.innerHTML += ".htm";

        return;
    }
     preview.innerHTML = "";
}

function clearPreviousWorking() {
    objects[".main > .working .title-input"].value = "";
    objects[".main > .working .editor-textarea"].value = "";
    objects[".main > .working .preview-div"].innerHTML = "";

    objects[".main > .working .slug-input"].value = "";
    objects[".main > .working .slug-preview"].innerHTML = "";

    objects[".main > .working .type-radio-group"].selected = "writing";

    objects[".main > .working .time-checkbox"].checked = true;

    objects[".main > .working .id-input"].value = "";
    objects[".main > .working .method-input"].value = "new";
    objects[".main > .working .draft-button"].style.display = "block";

    objects[".main > .working .type-radio-group paper-radio-button[name=writing]"].removeAttribute("disabled");
    objects[".main > .working .type-radio-group paper-radio-button[name=page]"].removeAttribute("disabled");

}

function showWorking(edit, type, id) {
    edit = (typeof edit === "undefined") ? false : edit;
    type = (typeof type === "undefined") ? "writing" : type;
    id = (typeof id === "undefined") ? "-1" : id;

    loadLayout(function (callback) {
        objects[".main aside paper-menu"].selected = 1;

        uri = "/management/working/";
        if (edit !== true) {
            uri += "new";
        } else {
            uri += "edit?type=" + type + "&id=" + id;
        }
        pushState(uri);
        clearPreviousWorking();

        objects[".main > .working"].classList.add("current");

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
                objects[".main > .working .id-input"].value = json._id;
                objects[".main > .working .editor-textarea"].value = json.content;
                objects[".main > .working .slug-input"].value = json.slug;
                if (json.time === 0) {
                    objects[".main > .working .time-checkbox"].checked = true;
                } else {
                    objects[".main > .working .time-checkbox"].checked = false;
                    objects[".main > .working .time-input"].value = unixToDatetime(json.time);
                }

                objects[".main > .working .type-radio-group"].selected = type;

                objects[".main > .working .type-radio-group paper-radio-button[name=writing]"].setAttribute("disabled", null);
                objects[".main > .working .type-radio-group paper-radio-button[name=page]"].setAttribute("disabled", null);

                if (json.publish) {
                    objects[".main > .working .draft-button"].style.display = "none";
                }
                objects[".main > .working .title-input"].value = json.title;
                objects[".main > .working .method-input"].value = "edit";
                previewSlug();
                previewText();
                callback();
            }).catch(function (error) {
                console.log(error);
                objects[".load .failed"].show();
            });
        } else {
            callback();
        }
    });
}

objects[".main aside .show-working"].addEventListener("click", showWorking);

objects[".main > .lobby .float-container .create-new-fab"].addEventListener("click", showWorking);

objects[".main > .working .float-container .publish-fab"].addEventListener("click", function () {
    objects[".main > .working .info-container"].classList.add("visible");
});
objects[".main > .working .info-container .close-button"].addEventListener("click", function () {
    objects[".main > .working .info-container"].classList.remove("visible");
});

objects[".main > .working .type-radio-group"].addEventListener("click", previewSlug);

objects[".main > .working .slug-input"].addEventListener("change", previewSlug);
objects[".main > .working .slug-input"].addEventListener("keypress", previewSlug);
objects[".main > .working .slug-input"].addEventListener("keydown", previewSlug);
objects[".main > .working .slug-input"].addEventListener("keyup", previewSlug);
objects[".main > .working .slug-input"].addEventListener("blur", previewSlug);

objects[".main > .working .time-input"].addEventListener("blur", function () {
    before = objects[".main > .working .time-input"].value;
    after = unixToDatetime(datetimeToUnix(before));
    if (after != objects[".main > .working .time-input"].value) {
        objects[".main > .working .time-input"].value = unixToDatetime(Math.round((new Date()).getTime() / 1000)).replace(/\//g,"-");
    }
});

objects[".main > .working .float-container .open-public-fab"].addEventListener("click", showPublic);

function sendWorking() {
    if (objects[".main > .working .slug-input"].value === "" ||
        objects[".main > .working .title-input"].value === "" ||
        objects[".main > .working .editor-textarea"].value === "") {
            objects[".main > .working .toast-container .info-required"].show();
            return;
        }

    queryString = new FormData();
    queryString.append("_xsrf", getCookie("_xsrf"));
    queryString.append("action", "save_working");

    queryString.append("working_title", objects[".main > .working .title-input"].value);
    queryString.append("working_content", objects[".main > .working .editor-textarea"].value);

    queryString.append("working_type", objects[".main > .working .type-radio-group"].selected);
    queryString.append("working_method", objects[".main > .working .method-input"].value);

    var publishTime = 0;

    if (objects[".main > .working .time-checkbox"].checked && objects[".main > .working .publish-or-not"].value == "false") {
        queryString.append("working_time", "0");
    } else {
        publishTime = objects[".main > .working .time-input"].value;
        queryString.append("working_time", datetimeToUnix(publishTime));
    }

    queryString.append("working_publish", objects[".main > .working .publish-or-not"].value);
    queryString.append("working_slug", objects[".main > .working .slug-input"].value);
    queryString.append("working_id", objects[".main > .working .id-input"].value);

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
        if (objects[".main > .working .publish-or-not"].value == "true") {
            objects[".main > .working .toast-container .publish-success"].querySelector("a").href = "/" +
                objects[".main > .working .type-radio-group"].selected + "s/" +
                objects[".main > .working .slug-input"].value + ".htm";
            objects[".main > .working .toast-container .publish-success"].show();
            objects[".main > .working .draft-button"].style.display = "none";
            objects[".main > .working .time-checkbox"].checked = false;
            objects[".main > .working .time-input"].value = publishTime;
        } else {
            objects[".main > .working .toast-container .draft-success"].show();
        }
        objects[".main > .working .info-container"].classList.remove("visible");
        pushState("/management/working/edit?type=" + objects[".main > .working .type-radio-group"].selected + "&id=" + json.id);
        objects[".main > .working .id-input"].value = json.id;
        objects[".main > .working .method-input"].value = "edit";

        objects[".main > .working .type-radio-group paper-radio-button[name=writing]"].setAttribute("disabled", null);
        objects[".main > .working .type-radio-group paper-radio-button[name=page]"].setAttribute("disabled", null);

    }).catch(function (error) {
        if (error == "slug") {
            objects[".main > .working .toast-container .save-failed"].text =
                "相同的短链接已经存在，请更换！";
        } else {
            objects[".main > .working .toast-container .save-failed"].text =
                "抱歉，发生了未知错误。";
        }
        console.log(error);
        objects[".main > .working .toast-container .save-failed"].show();
    });
}

objects[".main > .working .publish-button"].addEventListener("click", function () {
    objects[".main > .working .publish-or-not"].value = "true";
    sendWorking();
});

objects[".main > .working .draft-button"].addEventListener("click", function () {
    objects[".main > .working .publish-or-not"].value = "false";
    sendWorking();
});

function hideReplyEditor(reply) {
    function hideAction() {
        objects[".main > .crda .reply-editor"].classList.remove("visible");
        setTimeout(function () {
            objects[".main > .crda .reply-editor"].style.height = "0";
            objects[".main > .crda .reply-editor"].style.width = "0";
            objects[".main > .crda .reply-editor"].style.top = "-10000px";
            objects[".main > .crda .reply-editor"].style.left = "-10000px";
        }, 300);
    }
    if (!reply) {
        hideAction();
        return;
    }
    if (objects[".main > .crda .reply-editor .name"].value == reply.getAttribute("reply_name") &&
       objects[".main > .crda .reply-editor .email"].value == reply.getAttribute("reply_email") &&
       objects[".main > .crda .reply-editor .homepage"].value == reply.getAttribute("reply_homepage") &&
       objects[".main > .crda .reply-editor .content"].value == reply.getAttribute("reply_content")) {
        hideAction();
        return;
    }
    acquireConfirm("leave", hideAction);
}

function saveReplyEditor(reply) {
    function hideAction() {
        objects[".main > .crda .reply-editor"].classList.remove("visible");
        setTimeout(function () {
            objects[".main > .crda .reply-editor"].style.height = "0";
            objects[".main > .crda .reply-editor"].style.width = "0";
            objects[".main > .crda .reply-editor"].style.top = "-10000px";
            objects[".main > .crda .reply-editor"].style.left = "-10000px";
        }, 300);
    }
    if (objects[".main > .crda .reply-editor .name"].value == reply.getAttribute("reply_name") &&
       objects[".main > .crda .reply-editor .email"].value == reply.getAttribute("reply_email") &&
       objects[".main > .crda .reply-editor .homepage"].value == reply.getAttribute("reply_homepage") &&
       objects[".main > .crda .reply-editor .content"].value == reply.getAttribute("reply_content")) {
        hideReplyEditor();
        return;
    }

    queryString = new FormData();
    queryString.append("_xsrf", getCookie("_xsrf"));
    queryString.append("action", "save_reply");
    queryString.append("method", "edit");
    queryString.append("reply", reply.getAttribute("reply_id"));
    queryString.append("name", objects[".main > .crda .reply-editor .name"].value);
    queryString.append("email", objects[".main > .crda .reply-editor .email"].value);
    queryString.append("homepage", objects[".main > .crda .reply-editor .homepage"].value);
    queryString.append("content", objects[".main > .crda .reply-editor .content"].value);

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
            throw new Error("unkonwn");
        }
        objects[".main > .crda .toast-container .save-success"].show();
        hideReplyEditor();
        showCRDA("replies");
    }).catch(function (error) {
        console.log(error);
        objects[".main > .crda .toast-container .save-failed"].show();
    });
}
function showReplyEditor(reply) {

    objects[".main > .crda .reply-editor .name"].value = reply.getAttribute("reply_name");
    objects[".main > .crda .reply-editor .email"].value = reply.getAttribute("reply_email");
    objects[".main > .crda .reply-editor .homepage"].value = reply.getAttribute("reply_homepage");
    objects[".main > .crda .reply-editor .content"].value = reply.getAttribute("reply_content");

    objects[".main > .crda .reply-editor"].style.height = "100%";
    objects[".main > .crda .reply-editor"].style.width = "100%";
    objects[".main > .crda .reply-editor"].style.top = "0px";
    objects[".main > .crda .reply-editor"].style.left = "0px";
    objects[".main > .crda .reply-editor"].classList.add("visible");
    objects[".main > .crda .reply-editor .cancel"].onclick = function () {
        hideReplyEditor(reply);
    };
    objects[".main > .crda .reply-editor .save"].onclick = function () {
        saveReplyEditor(reply);
    };
}

function bindCRDAEvent() {
    Array.prototype.forEach.call(
        _All(".main > .crda .main-container .workings-list .item"), function (element) {
            element.addEventListener("click", function () {
                showWorking(true, element.getAttribute("working_type"), element.getAttribute("working_id"));
            });
        }
    );
    Array.prototype.forEach.call(
        _All(".main > .crda .main-container .workings-list .item .launch-working"), function (element) {
            element.addEventListener("click", function (event) {
                event.stopPropagation();
            });
            element.addEventListener("mousedown", function (event) {
                event.stopPropagation();
            });
        }
    );
    Array.prototype.forEach.call(
        _All(".main > .crda .main-container .workings-list .item .remove"), function (element) {
            element.addEventListener("click", function (event) {
                event.stopPropagation();
                acquireConfirm("remove", function () {
                    queryString = new FormData();
                    queryString.append("_xsrf", getCookie("_xsrf"));
                    queryString.append("action", "save_working");
                    queryString.append("working_method", "erase");
                    queryString.append("working_type", element.getAttribute("working_type"));
                    queryString.append("working_id", element.getAttribute("working_id"));

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
                        if (!json.succeed) {
                            throw new Error("unknown");
                        }
                        element.parentNode.style.transition = "opacity 0.30s ease-in-out";
                        element.parentNode.style.opacity = "0";
                        setTimeout(function () {
                            parent = element.parentNode.parentNode;
                            element.parentNode.parentNode.removeChild(element.parentNode);
                            if (!_(".main > .crda .main-container .workings-list.current .item")) {
                                _(".main > .crda .main-container .workings-list.current").innerHTML = "<div class=\"no-content\">不要找了，这里什么也没有啦(*'▽')！</div>";
                            }
                        }, 300);
                        objects[".main > .crda .toast-container .save-success"].show();
                    }).catch(function (error) {
                        console.log(error);
                        objects[".main > .crda .toast-container .save-failed"].show();
                    });
                });
            });
            element.addEventListener("mousedown", function (event) {
                event.stopPropagation();
            });
        }
    );
    Array.prototype.forEach.call(
        _All(".main > .crda .main-container .workings-list .reply-item .toggle-permit"), function (element) {
            element.addEventListener("click", function (event) {
                queryString = new FormData();
                queryString.append("_xsrf", getCookie("_xsrf"));
                queryString.append("action", "save_reply");
                queryString.append("method", "permit");
                queryString.append("reply", element.getAttribute("reply_id"));
                queryString.append("permit", element.getAttribute("switch_to"));

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
                    waitingForPermitIcon = findParentBySelector(element, ".reply-item").querySelector(".waiting-for-permit");
                    if (element.getAttribute("switch_to") == "true") {
                        element.icon = "remove";
                        element.setAttribute("switch_to", "false");
                        element.setAttribute("title", "撤销通过");
                        waitingForPermitIcon.classList.remove("visible");
                        waitingForPermitIcon.removeAttribute("title");
                    } else {
                        element.icon = "check";
                        element.setAttribute("switch_to", "true");
                        element.setAttribute("title", "通过之");
                        waitingForPermitIcon.classList.add("visible");
                        waitingForPermitIcon.setAttribute("title", "该评论正在等待审核");
                    }
                    objects[".main > .crda .toast-container .save-success"].show();
                }).catch(function (error) {
                    console.log(error);
                    objects[".main > .crda .toast-container .save-failed"].show();
                });
            });
        }
    );
    Array.prototype.forEach.call(
        _All(".main > .crda .main-container .workings-list .reply-item .edit"), function (element) {
            element.addEventListener("click", function (event) {
                showReplyEditor(findParentBySelector(element, ".reply-item"));
            });
        }
    );
    Array.prototype.forEach.call(
        _All(".main > .crda .main-container .workings-list .reply-item .remove"), function (element) {
            element.addEventListener("click", function (event) {
                acquireConfirm("remove", function () {
                    queryString = new FormData();
                    queryString.append("_xsrf", getCookie("_xsrf"));
                    queryString.append("action", "save_reply");
                    queryString.append("method", "erase");
                    queryString.append("reply", element.getAttribute("reply_id"));

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
                        item = findParentBySelector(element, ".reply-item");
                        item.style.transition = "opacity 0.30s ease-in-out";
                        item.style.opacity = "0";
                        setTimeout(function () {
                            parent = _(".main > .crda .main-container .workings-list.current");
                            parent.removeChild(item);
                            if (!_(".main > .crda .main-container .workings-list.current .reply-item")) {
                                parent.innerHTML = "<div class=\"no-content\">不要找了，这里什么也没有啦(*'▽')！</div>";
                            }
                        }, 300);
                        objects[".main > .crda .toast-container .save-success"].show();
                    }).catch(function (error) {
                        console.log(error);
                        objects[".main > .crda .toast-container .save-failed"].show();
                    });
                });
            });
        }
    );
}

function loadCRDAData(type, callback) {
    queryString = new FormData();
    queryString.append("_xsrf", getCookie("_xsrf"));
    queryString.append("action", "load_crda");
    queryString.append("type", type);

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
        var contentList = "";
        var currentObject;
        var key;
        if (type == "writings") {
            currentObject = objects[".main > .crda .main-container .writings"];
            for (key in json) {
                content = json[key];
                if (contentList !== "") {
                    contentList += "<div style=\"height: 1px; background-color: rgb(233, 233, 233);\"></div>";
                }
                item = "<div class=\"item\" working_id=\"" + content._id + "\" working_type=\"writing\">";
                if (!content.publish) {
                    item += "<iron-icon icon=\"editor:border-color\" title=\"该作品仍为草稿\"></iron-icon>";
                } else {
                    item += "<a target=\"_blank\" href=\"/writings/" + content.slug + ".htm\">";
                    item += "<iron-icon icon=\"launch\" title=\"打开作品\" class=\"launch-working\"></iron-icon></a>";
                }
                item += "<div class=\"title\">" + content.title + "</div>";
                item += "<paper-icon-button class=\"remove\" working_id=\"" + content._id + "\" working_type=\"writing\" icon=\"remove-circle-outline\" title=\"移除作品\"></paper-icon-button>";
                item += "<paper-ripple style=\"color: rgba(54, 134, 190, 0.75);\"></paper-ripple></div>";
                contentList += item;
            }
            objects[".main > .crda .type-selector"].selected = 0;
        } else if (type == "pages") {
            currentObject = objects[".main > .crda .main-container .pages"];
            for (key in json) {
                content = json[key];
                if (contentList !== "") {
                    contentList += "<div style=\"height: 1px; background-color: rgb(233, 233, 233);\"></div>";
                }
                item = "<div class=\"item\" working_id=\"" + content._id + "\" working_type=\"page\">";
                if (!content.publish) {
                    item += "<iron-icon icon=\"editor:border-color\" title=\"该作品仍为草稿\"></iron-icon>";
                } else {
                    item += "<a target=\"_blank\" href=\"/pages/" + content.slug + ".htm\">";
                    item += "<iron-icon icon=\"launch\" title=\"打开作品\" class=\"launch-working\"></iron-icon></a>";
                }
                item += "<div class=\"title\">" + content.title + "</div>";
                item += "<paper-icon-button class=\"remove\" working_id=\"" + content._id + "\" working_type=\"page\" icon=\"remove-circle-outline\" title=\"移除作品\"></paper-icon-button>";
                item += "<paper-ripple style=\"color: rgba(54, 134, 190, 0.75);\"></paper-ripple></div>";
                contentList += item;
            }
            objects[".main > .crda .type-selector"].selected = 1;
        } else if (type == "replies") {
            currentObject = objects[".main > .crda .main-container .replies"];
            for (key in json) {
                content = json[key];
                if (contentList !== "") {
                    contentList += "<div style=\"height: 1px; background-color: rgb(233, 233, 233);\"></div>";
                }
                item = "<div class=\"reply-item\" reply_id=\"" + content._id + "\" reply_name=\"" + content.name + "\" reply_email=\"" + content.email + "\" reply_homepage=\"" + content.homepage + "\" reply_content='" + content.content + "'>";

                item += "<div class=\"avatar-block\" style=\"background-image: url(/avatar/" + content.emailmd5 + "?s=200&d=mm)\"></div>";

                item += "<div class=\"info-block\">";
                item += "<div><a target=\"_blank\" href=\"" + content.homepage + "\"><span class=\"reply-name\">" + content.name + "</span></a>";
                item += "<paper-button class=\"email\" onclick=\"window.open('mailto:" + content.email + "', '_blank').focus()\" title=\"向 " + content.email + " 发送邮件\"><iron-icon icon=\"mail\"></iron-icon>" + content.email + "</paper-button>";

                item += "<paper-button class=\"ip\" onclick=\"window.open('http://whatismyipaddress.com/ip/" + content.ip + "', '_blank').focus()\"><iron-icon icon=\"device:wifi-tethering\"></iron-icon>" + content.ip + "</paper-button></div>";
                item += "<div><span class=\"time\">于 " + unixToDatetime(content.time) + "</span>";
                item += "<span class=\"writing\"> 发表在 <a target=\"_blank\" href=\"/writings/" + content.writing.slug + ".htm\">" + content.writing.title + "</a></span>";
                if (!content.permit) {
                    item += "<iron-icon class=\"waiting-for-permit visible\" icon=\"chrome-reader-mode\" title=\"该评论正在等待审核\"></iron-icon>";
                } else {
                    item += "<iron-icon class=\"waiting-for-permit\" icon=\"chrome-reader-mode\" title=\"\"></iron-icon>";
                }
                item += "</div></div>";

                item += "<div class=\"body-block\">" + content.content + "</div>";

                item += "<div class=\"action-block\">";
                if (!content.permit) {
                    item += "<paper-icon-button class=\"toggle-permit\" switch_to=\"true\" reply_id=\"" + content._id + "\" icon=\"check\" title=\"通过之\"></paper-icon-button>";
                } else {
                    item += "<paper-icon-button class=\"toggle-permit\" switch_to=\"false\" reply_id=\"" + content._id + "\" icon=\"remove\" title=\"撤销通过\"></paper-icon-button>";
                }
                item += "<paper-icon-button class=\"edit\" reply_id=\"" + content._id + "\" icon=\"editor:mode-edit\" title=\"编辑\"></paper-icon-button>";
                item += "<paper-icon-button class=\"remove\" reply_id=\"" + content._id + "\" icon=\"remove-circle-outline\" title=\"移除\"></paper-icon-button>";
                item += "</div>";

                item += "</div>";
                contentList += item;
            }
            objects[".main > .crda .type-selector"].selected = 2;
        } else {
            throw new Error("unknown");
        }
        if (contentList === "") {
            contentList += "<div class=\"no-content\">不要找了，这里什么也没有啦(*'▽')！</div>";
        }
        currentObject.innerHTML = contentList;
        currentObject.classList.add("current");
        bindCRDAEvent();
        if (callback) {
            callback();
        }
    }).catch(function (error) {
        console.log(error);
        objects[".load .failed"].show();
    });
}

function showCRDA(type) {
    type = (typeof type !== "string") ? "writings" : type;

    current = _(".main > .crda .main-container .workings-list.current");
    if (current) {
        current.innerHTML = "";
    }
    loadLayout(function (callback) {
        objects[".main aside paper-menu"].selected = 2;
        pushState("/management/crda/" + type);

        objects[".main > .crda"].classList.add("current");

        loadCRDAData(type, callback);
    });
}

objects[".main > .crda .type-selector .writings"].addEventListener("click", function () {
    showCRDA("writings");
});
objects[".main > .crda .type-selector .pages"].addEventListener("click", function () {
    showCRDA("pages");
});
objects[".main > .crda .type-selector .replies"].addEventListener("click", function () {
    showCRDA("replies");
});

objects[".main aside .show-crda"].addEventListener("click", showCRDA);

objects[".main > .lobby .writing-num .manage-writing"].addEventListener("click", function () {
    objects[".main > .crda .type-selector .writings"].click();
});
objects[".main > .lobby .page-num .manage-page"].addEventListener("click", function () {
    objects[".main > .crda .type-selector .pages"].click();
});
objects[".main > .lobby .reply-num .manage-reply"].addEventListener("click", function () {
    objects[".main > .crda .type-selector .replies"].click();
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

function buildWindow(slug, sub_slug) {
    if (slug == "lobby") {
        showLobby();
    } else if (slug == "working") {
        if (sub_slug == "edit"){
            sub_slug = true;
        } else {
            sub_slug = false;
        }
        showWorking(sub_slug, getVars.type, getVars.id);
    } else if (slug == "crda") {
        showCRDA(sub_slug);
    } else if (slug == "configuration") {
        showConfiguration();
    } else {
        //need a more graceful way to deal with 404 Error.
        window.location.href = "//" + window.location.host + "/404";
    }
}
window.addEventListener("load", function () {
    setTimeout(function () {
        window.addEventListener("popstate", function (event) {
            var state = event.state;
            if (!state) {
                window.location.reload();
            }
        });
    }, 10);
});
