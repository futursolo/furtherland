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
    ".load-back": _(".load-back")
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

function formatDate(unix) {
    time = new Date(parseInt(unix) * 1000);
    monthList = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    result = time.getDate() + " ";
    result += monthList[time.getMonth()] + " ";
    result += time.getFullYear();
    return result;
}

function formatDatetime(unix) {
    time = new Date(parseInt(unix) * 1000);
    monthList = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    result = time.getHours() + ":";
    if ((time.getMinutes() + "").length == 1) {
        result += "0";
    }
    result += time.getMinutes() + ":";
    result += time.getSeconds() + " ";
    result += time.getDate() + " ";
    result += monthList[time.getMonth()] + " ";
    result += time.getFullYear();
    return result;
}


function loadLayout(callback) {
    window.loading = true;
    setTimeout(function () {
        Array.prototype.forEach.call(_All(".visible"), function (element) {
            element.classList.remove("visible");
        });
        Array.prototype.forEach.call(_All(".current"), function (element) {
            element.classList.remove("current");
        });
        objects[".load-back"].style.height = "100%";
        objects[".load-back"].style.width = "100%";
        objects[".load-back"].classList.add("visible");
        objects[".load"].style.height = "100%";
        objects[".load"].style.width = "100%";
        objects[".load"].classList.add("visible");

        function hideLoadLayout() {
            objects[".load"].classList.remove("visible");
            setTimeout(function () {
                objects[".load"].style.height = "0";
                objects[".load"].style.width = "0";
            }, 300);
            objects[".load-back"].classList.remove("visible");
            setTimeout(function () {
                objects[".load-back"].style.height = "0";
                objects[".load-back"].style.width = "0";
                window.loading = false;
            }, 300);
        }
        setTimeout(callback, 300, hideLoadLayout);
    }, 100);
}

function fetchIndexData() {

}

function renderIndex() {
    Array.prototype.forEach.call(_All(".main > .index .card .card-info .time"), function (element) {
        element.innerHTML = formatDate(Math.round(element.innerHTML));
    });
    Array.prototype.forEach.call(_All(".main > .index .card > .content"), function (element) {
        element.innerHTML = marked(element.innerHTML);
    });
    Array.prototype.forEach.call(_All(".main > .index .card > .content code"), hljs.highlightBlock);
}

function submitReply() {
    currentState = history.state;
    queryString = new FormData();
    queryString.append("_xsrf", getCookie("_xsrf"));
    queryString.append("action", "new_reply");
    queryString.append("writing", currentState._id);
    queryString.append("name", document.getElementById("reply-form-name-input").value);
    queryString.append("email", document.getElementById("reply-form-email-input").value);
    queryString.append("homepage", document.getElementById("reply-form-homepage-input").value);
    if (document.getElementById("reply-form-content").value.length <= 10) {
        _(".main > .writing > .replies > .reply-card.new-reply .error").innerHTML = "一個好的評論的長度應該大於10個字，難道不是嗎？";
        return;
    }
    queryString.append("content", document.getElementById("reply-form-content").value);
    fetch("/api", {
        "method": "post",
        "credentials": "include",
        "body": queryString
    }).then(function (resp) {
        if (resp.status >= 200 && resp.status < 400) {
            return resp.json();
        }
        throw new Error(resp.statusText);
    }).then(function (json) {
            if (!json.success) {
                throw json.reason;
            }
            element = document.createElement("div");
            element.setAttribute("class", "reply-card");

            avatarElement = document.createElement("div");
            avatarElement.setAttribute("class", "avatar");
            avatarElement.style.backgroundImage = "url(/avatar/" + item.emailmd5 + "?s=200&d=mm)";
            element.appendChild(avatarElement);

            replyInfoElement = document.createElement("div");
            replyInfoElement.setAttribute("class", "reply-info");

            nameElement = document.createElement("div");
            nameElement.setAttribute("class", "name");
            if (item.homepage) {
                nameLinkElement = document.createElement("a");
                nameLinkElement.setAttribute("href", item.homepage);
                nameLinkElement.setAttribute("target", "_blank");
                nameLinkElement.innerHTML = item.name;
            } else {
                nameElement.innerHTML = item.name;
            }
            nameElement.appendChild(nameLinkElement);
            if (item.master) {
                masterElement = document.createElement("i");
                masterElement.setAttribute("class", "master material-icons");
                masterElement.setAttribute("title", "域主大人");
                masterElement.innerHTML = "&#xE853;";
                nameElement.appendChild(masterElement);
            }
            replyInfoElement.appendChild(nameElement);

            timeElement = document.createElement("div");
            timeElement.setAttribute("class", "time");
            timeElement.innerHTML = "发表于：" + formatDatetime(item.time);
            replyInfoElement.appendChild(timeElement);

            element.appendChild(replyInfoElement);

            contentElement = document.createElement("div");
            contentElement.setAttribute("class", "content");
            contentElement.innerHTML = marked(item.content);
            element.appendChild(contentElement);

            repliesContainer.appendChild(element);
            Array.prototype.forEach.call(_All(".main > .writing > .replies > .reply-card > .content code"), hljs.highlightBlock);
    }).catch(function (error) {
        if (error == "incomplation") {
            _(".main > .writing > .replies > .reply-card.new-reply .error").innerHTML = "将信息填写完整后再试。";
        } else if (error == "waitforcheck") {
            document.getElementById("reply-form-content").value = "";
            _(".main > .writing > .replies > .reply-card.new-reply .error").innerHTML = "感谢你的回复，你的回复需要审核，稍后即可看到。";
        } else {
            console.error(error);
            _(".main > .writing > .replies > .reply-card.new-reply .error").innerHTML = "发生了未知错误，请稍候再试。";
        }
    });
}

function appendReplyForm() {
    repliesContainer = _(".main > .writing > .replies");
    element = document.createElement("div");
    element.setAttribute("class", "reply-card new-reply");

    nameElement = document.createElement("div");
    nameElement.setAttribute("class", "mdl-textfield mdl-js-textfield mdl-textfield--floating-label input-back");

    titleElement = document.createElement("div");
    titleElement.setAttribute("class", "title");
    titleElement.innerHTML = "發表新評論";
    element.appendChild(titleElement);

    errorElement = document.createElement("div");
    errorElement.setAttribute("class", "error");
    errorElement.innerHTML = "";
    element.appendChild(errorElement);

    nameInputElement = document.createElement("input");
    nameInputElement.setAttribute("class", "mdl-textfield__input");
    nameInputElement.setAttribute("type", "text");
    nameInputElement.setAttribute("id", "reply-form-name-input");
    nameElement.appendChild(nameInputElement);

    nameLabelElement = document.createElement("label");
    nameLabelElement.setAttribute("class", "mdl-textfield__label");
    nameLabelElement.setAttribute("for", "reply-form-name-input");
    nameLabelElement.innerHTML = "暱稱";
    nameElement.appendChild(nameLabelElement);
    componentHandler.upgradeElement(nameElement, "MaterialTextfield");
    element.appendChild(nameElement);

    emailElement = document.createElement("div");
    emailElement.setAttribute("class", "mdl-textfield mdl-js-textfield mdl-textfield--floating-label input-back");

    emailInputElement = document.createElement("input");
    emailInputElement.setAttribute("class", "mdl-textfield__input");
    emailInputElement.setAttribute("type", "text");
    emailInputElement.setAttribute("id", "reply-form-email-input");
    emailElement.appendChild(emailInputElement);

    emailLabelElement = document.createElement("label");
    emailLabelElement.setAttribute("class", "mdl-textfield__label");
    emailLabelElement.setAttribute("for", "reply-form-email-input");
    emailLabelElement.innerHTML = "電郵";
    emailElement.appendChild(emailLabelElement);

    componentHandler.upgradeElement(emailElement, "MaterialTextfield");
    element.appendChild(emailElement);

    homepageElement = document.createElement("div");
    homepageElement.setAttribute("class", "mdl-textfield mdl-js-textfield mdl-textfield--floating-label input-back");

    homepageInputElement = document.createElement("input");
    homepageInputElement.setAttribute("class", "mdl-textfield__input");
    homepageInputElement.setAttribute("type", "text");
    homepageInputElement.setAttribute("id", "reply-form-homepage-input");
    homepageElement.appendChild(homepageInputElement);

    homepageLabelElement = document.createElement("label");
    homepageLabelElement.setAttribute("class", "mdl-textfield__label");
    homepageLabelElement.setAttribute("for", "reply-form-homepage-input");
    homepageLabelElement.innerHTML = "個人主頁(可選)";
    homepageElement.appendChild(homepageLabelElement);
    componentHandler.upgradeElement(homepageElement, "MaterialTextfield");
    element.appendChild(homepageElement);

    contentElement = document.createElement("textarea");
    contentElement.setAttribute("class", "content");
    contentElement.setAttribute("id", "reply-form-content");
    contentElement.setAttribute("placeholder", "支持Markdown，廣告和Spam統統惡靈退散！");
    element.appendChild(contentElement);

    submitElement = document.createElement("button");
    submitElement.setAttribute("class", "mdl-button mdl-js-button mdl-button--raised mdl-button--colored mdl-js-ripple-effect submit");
    submitElement.setAttribute("id", "reply-form-submit");
    submitElement.innerHTML = "提交";
    componentHandler.upgradeElement(submitElement, "MaterialButton");
    componentHandler.upgradeElement(submitElement, "MaterialRipple");
    element.appendChild(submitElement);
    repliesContainer.appendChild(element);
    _(".main > .writing > .replies > .reply-card.new-reply .submit").addEventListener("click", submitReply);
}

function buildWritingReply() {
    currentState = history.state;
    queryString = new FormData();
    queryString.append("_xsrf", getCookie("_xsrf"));
    queryString.append("action", "load_reply");
    queryString.append("writing", currentState._id);
    queryString.append("method", "list");
    fetch("/api", {
        "method": "post",
        "credentials": "include",
        "body": queryString
    }).then(function (resp) {
        if (resp.status >= 200 && resp.status < 400) {
            return resp.json();
        }
        throw new Error(resp.statusText);
    }).then(function (json) {
        repliesContainer = _(".main > .writing > .replies");
        for (var key in json) {
            item = json[key];
            element = document.createElement("div");
            element.setAttribute("class", "reply-card");

            avatarElement = document.createElement("div");
            avatarElement.setAttribute("class", "avatar");
            avatarElement.style.backgroundImage = "url(/avatar/" + item.emailmd5 + "?s=200&d=mm)";
            element.appendChild(avatarElement);

            replyInfoElement = document.createElement("div");
            replyInfoElement.setAttribute("class", "reply-info");

            nameElement = document.createElement("div");
            nameElement.setAttribute("class", "name");
            if (item.homepage) {
                nameLinkElement = document.createElement("a");
                nameLinkElement.setAttribute("href", item.homepage);
                nameLinkElement.setAttribute("target", "_blank");
                nameLinkElement.innerHTML = item.name;
            } else {
                nameElement.innerHTML = item.name;
            }
            nameElement.appendChild(nameLinkElement);
            if (item.master) {
                masterElement = document.createElement("i");
                masterElement.setAttribute("class", "master material-icons");
                masterElement.setAttribute("title", "域主大人");
                masterElement.innerHTML = "&#xE853;";
                nameElement.appendChild(masterElement);
            }
            replyInfoElement.appendChild(nameElement);

            timeElement = document.createElement("div");
            timeElement.setAttribute("class", "time");
            timeElement.innerHTML = "发表于：" + formatDatetime(item.time);
            replyInfoElement.appendChild(timeElement);

            element.appendChild(replyInfoElement);

            contentElement = document.createElement("div");
            contentElement.setAttribute("class", "content");
            contentElement.innerHTML = marked(item.content);
            element.appendChild(contentElement);

            repliesContainer.appendChild(element);
            Array.prototype.forEach.call(_All(".main > .writing > .replies > .reply-card > .content code"), hljs.highlightBlock);
        }
        appendReplyForm();
    }).catch(function (error) {
        console.error(error);
    });
}

function renderWriting() {
    Array.prototype.forEach.call(_All(".main > .writing .card .card-info .time"), function (element) {
        element.innerHTML = formatDate(Math.round(element.innerHTML));
    });
    Array.prototype.forEach.call(_All(".main > .writing .card  > .content"), function (element) {
        element.innerHTML = marked(element.innerHTML);
    });
    Array.prototype.forEach.call(_All(".main > .writing .card  > .content code"), hljs.highlightBlock);
    buildWritingReply();
}

function buildWindow(slug, sub_slug) {
    if (slug == "index") {
        renderIndex();
    } else if (slug == "writing") {
        renderWriting();
    }
}

function resizeWindow() {
    if (window.innerWidth < 700) {
        _("body").classList.add("small");
    } else {
        _("body").classList.remove("small");
    }
}
document.addEventListener("DOMContentLoaded", function () {
    resizeWindow();
});
window.addEventListener("resize", function () {
    resizeWindow();
});
