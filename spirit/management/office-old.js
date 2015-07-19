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
