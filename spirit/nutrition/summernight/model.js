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

window.loading = false;

var _ = function (selector) {
    return document.querySelector(selector);
};

var _All = function (selector) {
    return document.querySelectorAll(selector);
};

var objects = {
    ".load": _(".load"),
    ".load-back": _(".load-back"),
    "header .title .title-link": _("header .title .title-link"),
    "header > .tabs .index-link": _("header > .tabs .index-link"),
    "header > .tabs .about-link": _("header > .tabs .about-link"),

    ".main > .index": _(".main > .index"),

    ".main > .writing": _(".main > .writing"),
    ".main > .writing .card .title": _(".main > .writing .card .title"),
    ".main > .writing .card .card-info .author-avatar": _(".main > .writing .card .card-info .author-avatar"),
    ".main > .writing .card .card-info .author-name": _(".main > .writing .card .card-info .author-name"),
    ".main > .writing .card .card-info .time": _(".main > .writing .card .card-info .time"),
    ".main > .writing .card > .content": _(".main > .writing .card > .content"),
    ".main > .writing > .replies": _(".main > .writing > .replies"),

    ".main > .page": _(".main > .page"),
    ".main > .page .card .title": _(".main > .page .card .title"),
    ".main > .page .card .card-info .author-avatar": _(".main > .page .card .card-info .author-avatar"),
    ".main > .page .card .card-info .author-name": _(".main > .page .card .card-info .author-name"),
    ".main > .page .card .card-info .time": _(".main > .page .card .card-info .time"),
    ".main > .page .card > .content": _(".main > .page .card > .content"),

    ".main > .not-found": _(".main > .not-found")
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
    if ((time.getHours() + "").length == 1) {
        result += "0";
    }
    result = time.getHours() + ":";
    if ((time.getMinutes() + "").length == 1) {
        result += "0";
    }
    result += time.getMinutes() + ":";
    if ((time.getSeconds() + "").length == 1) {
        result += "0";
    }
    result += time.getSeconds() + " ";
    result += time.getDate() + " ";
    result += monthList[time.getMonth()] + " ";
    result += time.getFullYear();
    return result;
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

function loadLayout(callback) {
    window.loading = true;
    setTimeout(function () {
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

function renderIndex(callback) {
    Array.prototype.forEach.call(_All(".main > .index .card .card-info .time"), function (element) {
        element.innerHTML = formatDate(Math.round(element.innerHTML));
    });
    Array.prototype.forEach.call(_All(".main > .index .card > .content code"), hljs.highlightBlock);
    Array.prototype.forEach.call(_All(".main > .index .card .switch-content"), function (element) {
        element.addEventListener("click", switchContent);
    });
    if (callback) {
        callback();
    }
}

function fetchIndexData(slug, callback) {
    queryString = new FormData();
    queryString.append("_xsrf", getCookie("_xsrf"));
    queryString.append("action", "load_index");
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
        objects[".main > .index"].classList.add("current");
        objects[".main > .index"].innerHTML = "";
        for (var key in json) {
            item = json[key];
            cardElement = document.createElement("div");
            cardElement.classList.add("card");

            titleElement = document.createElement("div");
            titleElement.classList.add("title");

            titleLinkElement = document.createElement("a");
            titleLinkElement.classList.add("switch-content");
            titleLinkElement.setAttribute("href", "/writings/" + item.slug + ".htm");
            titleLinkElement.setAttribute("slug", "writing");
            titleLinkElement.setAttribute("sub_slug", item.slug);
            titleLinkElement.innerHTML = item.title;
            titleElement.appendChild(titleLinkElement);
            cardElement.appendChild(titleElement);

            cardInfoElement = document.createElement("div");
            cardInfoElement.classList.add("card-info");

            authorAvatarElement = document.createElement("div");
            authorAvatarElement.classList.add("author-avatar");
            authorAvatarElement.classList.add("content");
            authorAvatarElement.style.backgroundImage = "url(/avatar/" + item.author.emailmd5 + "?s=200&d=mm)";
            cardInfoElement.appendChild(authorAvatarElement);

            authorNameElement = document.createElement("div");
            authorNameElement.classList.add("author-name");
            authorNameElement.classList.add("content");
            authorNameElement.innerHTML = item.author.username;
            cardInfoElement.appendChild(authorNameElement);

            timeElement = document.createElement("div");
            timeElement.classList.add("time");
            timeElement.classList.add("content");
            timeElement.innerHTML = item.time;
            cardInfoElement.appendChild(timeElement);
            cardElement.appendChild(cardInfoElement);

            contentElement = document.createElement("div");
            contentElement.classList.add("content");
            contentElement.innerHTML = marked(item.content);
            cardElement.appendChild(contentElement);

            moreElement = document.createElement("div");
            moreElement.classList.add("more");

            switchContentElement = document.createElement("a");
            switchContentElement.classList.add("switch-content");
            switchContentElement.setAttribute("href", "/writings/" + item.slug + ".htm");
            switchContentElement.setAttribute("slug", "writing");
            switchContentElement.setAttribute("sub_slug", item.slug);

            moreButtonElement = document.createElement("div");
            moreButtonElement.classList.add("mdl-button");
            moreButtonElement.classList.add("mdl-js-button");
            moreButtonElement.classList.add("mdl-js-ripple-effect");
            moreButtonElement.classList.add("button");
            moreButtonElement.innerHTML = "阅读全文";
            componentHandler.upgradeElement(moreButtonElement, "MaterialButton");
            componentHandler.upgradeElement(moreButtonElement, "MaterialRipple");
            switchContentElement.appendChild(moreButtonElement);
            moreElement.appendChild(switchContentElement);
            cardElement.appendChild(moreElement);

            objects[".main > .index"].appendChild(cardElement);

        }
        currentState = window.history.state;
        pageTitle = "首页 - " + currentState.site_name;
        pageURL = "/";
        document.title = pageTitle;
        window.history.replaceState({"slug": "index", "_id": 0, "sub_slug": 0, "title": pageTitle, "site_name": currentState.site_name}, pageTitle, pageURL);
        renderIndex(callback);
    }).catch(function (error) {
        window.location.reload();
    });
}

function sortReply(callback) {
    var left = 0;
    var right = 0;
    Array.prototype.forEach.call(_All(".main > .writing > .replies > .reply-card"), function (element) {
        element.classList.remove("left");
        element.classList.remove("right");
        if (window.innerWidth >= 700) {
            if (left <= right) {
                element.classList.add("left");
                left += element.offsetHeight + 30;
            } else {
                element.classList.add("right");
                right += element.offsetHeight + 30;
            }
        }
    });
    if (callback) {
        callback();
    }
}

function submitReply() {
    currentState = window.history.state;
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
            avatarElement.style.backgroundImage = "url(/avatar/" + json.emailmd5 + "?s=200&d=mm)";
            element.appendChild(avatarElement);

            replyInfoElement = document.createElement("div");
            replyInfoElement.setAttribute("class", "reply-info");

            nameElement = document.createElement("div");
            nameElement.setAttribute("class", "name");
            if (json.homepage) {
                nameLinkElement = document.createElement("a");
                nameLinkElement.setAttribute("href", json.homepage);
                nameLinkElement.setAttribute("target", "_blank");
                nameLinkElement.innerHTML = json.name;
            } else {
                nameElement.innerHTML = json.name;
            }
            nameElement.appendChild(nameLinkElement);
            if (json.master) {
                masterElement = document.createElement("i");
                masterElement.setAttribute("class", "master material-icons");
                masterElement.setAttribute("title", "域主大人");
                masterElement.innerHTML = "&#xE853;";
                nameElement.appendChild(masterElement);
            }
            replyInfoElement.appendChild(nameElement);

            timeElement = document.createElement("div");
            timeElement.setAttribute("class", "time");
            timeElement.innerHTML = "发表于：" + formatDatetime(json.time);
            replyInfoElement.appendChild(timeElement);

            element.appendChild(replyInfoElement);

            contentElement = document.createElement("div");
            contentElement.setAttribute("class", "content");
            contentElement.innerHTML = marked(json.content);
            Array.prototype.forEach.call(contentElement.querySelectorAll("code"), hljs.highlightBlock);
            element.appendChild(contentElement);

            repliesContainer.insertBefore(element, _(".main > .writing > .replies > .reply-card.new-reply"));
            sortReply();
            document.getElementById("reply-form-content").value = "";
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

function freshTime(element) {
    if (element) {
        element.innerHTML = "發表時間：" + formatDatetime(parseInt((new Date()).getTime() / 1000));
        setTimeout(function () {
            freshTime(element);
        }, 1000);
    }
}

function appendReplyForm(callback) {
    repliesContainer = _(".main > .writing > .replies");
    element = document.createElement("div");
    element.setAttribute("class", "reply-card new-reply");

    titleElement = document.createElement("div");
    titleElement.setAttribute("class", "title");
    titleElement.innerHTML = "發表新評論";
    element.appendChild(titleElement);

    errorElement = document.createElement("div");
    errorElement.setAttribute("class", "error");
    errorElement.innerHTML = "";
    element.appendChild(errorElement);

    nameElement = document.createElement("div");
    emailElement = document.createElement("div");
    homepageElement = document.createElement("div");

    if (!window.master) {
        nameElement.setAttribute("class", "mdl-textfield mdl-js-textfield mdl-textfield--floating-label input-back");
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
    } else {
        nameElement.style.display = "none";
        nameInputElement = document.createElement("input");
        nameInputElement.setAttribute("type", "text");
        nameInputElement.setAttribute("id", "reply-form-name-input");
        nameElement.appendChild(nameInputElement);

        emailElement.style.display = "none";
        emailInputElement = document.createElement("input");
        emailInputElement.setAttribute("type", "text");
        emailInputElement.setAttribute("id", "reply-form-email-input");
        emailElement.appendChild(emailInputElement);

        homepageElement.style.display = "none";
        homepageInputElement = document.createElement("input");
        homepageInputElement.setAttribute("type", "text");
        homepageInputElement.setAttribute("id", "reply-form-homepage-input");
        homepageElement.appendChild(homepageInputElement);

        avatarElement = document.createElement("div");
        avatarElement.setAttribute("class", "avatar");
        avatarElement.style.backgroundImage = "url(/avatar/" + window.master.emailmd5 + "?s=200&d=mm)";
        element.appendChild(avatarElement);

        replyInfoElement = document.createElement("div");
        replyInfoElement.setAttribute("class", "reply-info");

        nameInfoElement = document.createElement("div");
        nameInfoElement.setAttribute("class", "name");
        nameInfoElement.innerHTML = window.master.username;
        masterElement = document.createElement("i");
        masterElement.setAttribute("class", "master material-icons");
        masterElement.setAttribute("title", "域主大人");
        masterElement.innerHTML = "&#xE853;";
        nameInfoElement.appendChild(masterElement);

        replyInfoElement.appendChild(nameInfoElement);

        timeElement = document.createElement("div");
        timeElement.setAttribute("class", "time");
        freshTime(timeElement);
        replyInfoElement.appendChild(timeElement);

        element.appendChild(replyInfoElement);
    }

    element.appendChild(nameElement);
    element.appendChild(emailElement);
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
    submitElement.addEventListener("click", submitReply);
    element.appendChild(submitElement);
    repliesContainer.appendChild(element);
    sortReply(callback);
}

function buildWritingReply(callback) {
    currentState = window.history.state;
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
                nameElement.appendChild(nameLinkElement);
            } else {
                nameElement.innerHTML = item.name;
            }
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
            Array.prototype.forEach.call(contentElement.querySelectorAll("code"), hljs.highlightBlock);
            element.appendChild(contentElement);

            repliesContainer.appendChild(element);
        }
        appendReplyForm(callback);
    }).catch(function (error) {
        console.error(error);
    });
}

function renderWriting(callback) {
    Array.prototype.forEach.call(_All(".main > .writing .card .card-info .time"), function (element) {
        element.innerHTML = formatDate(Math.round(element.innerHTML));
    });
    Array.prototype.forEach.call(_All(".main > .writing .card  > .content code"), hljs.highlightBlock);
    buildWritingReply(callback);
}

function fetchWritingData(slug, callback) {
    queryString = new FormData();
    queryString.append("_xsrf", getCookie("_xsrf"));
    queryString.append("action", "load_writing");
    queryString.append("slug", slug);
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
        objects[".main > .writing"].classList.add("current");
        objects[".main > .writing .card .title"].innerHTML = json.title;
        objects[".main > .writing .card .card-info .author-avatar"].style.backgroundImage = "url(/avatar/" + json.author.emailmd5 + "?s=200&d=mm)";
        objects[".main > .writing .card .card-info .author-name"].innerHTML = json.author.username;
        objects[".main > .writing .card .card-info .time"].innerHTML = json.time;
        objects[".main > .writing .card > .content"].innerHTML = marked(json.content);
        objects[".main > .writing > .replies"].innerHTML = "";
        currentState = window.history.state;
        pageTitle = json.title + " - " + currentState.site_name;
        pageURL = "/writings/" + json.slug + ".htm";
        document.title = pageTitle;
        window.history.replaceState({"slug": "writing", "_id": json._id, "sub_slug": json.slug, "title": pageTitle, "site_name": currentState.site_name}, pageTitle, pageURL);
        renderWriting(callback);
    }).catch(function (error) {
        if (error == "notfound") {
            currentState = window.history.state;
            window.history.replaceState({"slug": "writing", "sub_slug": slug, "site_name": currentState.site_name}, document.title, window.location.href);
            renderNotFound(callback);
        } else {
            window.location.reload();
        }
    });
}

function renderPage(callback) {
    Array.prototype.forEach.call(_All(".main > .page .card .card-info .time"), function (element) {
        element.innerHTML = formatDate(Math.round(element.innerHTML));
    });
    Array.prototype.forEach.call(_All(".main > .page .card  > .content code"), hljs.highlightBlock);
    if (callback) {
        callback();
    }
}

function fetchPageData(slug, callback) {
    queryString = new FormData();
    queryString.append("_xsrf", getCookie("_xsrf"));
    queryString.append("action", "load_page");
    queryString.append("slug", slug);
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
        objects[".main > .page"].classList.add("current");
        objects[".main > .page .card .title"].innerHTML = json.title;
        objects[".main > .page .card .card-info .author-avatar"].style.backgroundImage = "url(/avatar/" + json.author.emailmd5 + "?s=200&d=mm)";
        objects[".main > .page .card .card-info .author-name"].innerHTML = json.author.username;
        objects[".main > .page .card .card-info .time"].innerHTML = json.time;
        objects[".main > .page .card > .content"].innerHTML = marked(json.content);
        currentState = window.history.state;
        pageTitle = json.title + " - " + currentState.site_name;
        pageURL = "/pages/" + json.slug + ".htm";
        document.title = pageTitle;
        window.history.replaceState({"slug": "page", "_id": json._id, "sub_slug": json.slug, "title": pageTitle, "site_name": currentState.site_name}, pageTitle, pageURL);
        renderPage(callback);
    }).catch(function (error) {
        if (error == "notfound") {
            currentState = window.history.state;
            window.history.replaceState({"slug": "page", "sub_slug": slug, "site_name": currentState.site_name}, document.title, window.location.href);
            renderNotFound(callback);
        } else {
            window.location.reload();
        }
    });
}

function renderNotFound(callback) {
    if (!objects[".main > .not-found"].classList.contains("current")) {
        if (_(".main > .current")) {
            _(".main > .current").classList.remove("current");
        }
    }
    currentState = window.history.state;
    document.title = "出错了 - " + currentState.site_name;
    objects[".main > .not-found"].classList.add("current");
    if (callback) {
        callback();
    }
}

function switchContent(event) {
    target = event.target || event.srcElement;
    if (!target.classList.contains("switch-content")) {
        target = findParentBySelector(target, "a.switch-content");
    }
    event.preventDefault();
    loadLayout(function (callback) {
        if (_(".main > .current")){
            _(".main > .current").classList.remove("current");
        }
        if (target.getAttribute("slug") == "index") {
            window.history.pushState(window.history.state, null,  "//" + window.location.host + "/");
            fetchIndexData(null, callback);
        } else if(target.getAttribute("slug") == "writing") {
            window.history.pushState(window.history.state, null,  "//" + window.location.host + "/writings/" + target.getAttribute("sub_slug") + ".htm");
            fetchWritingData(target.getAttribute("sub_slug"), callback);
        } else if (target.getAttribute("slug") == "page") {
            window.history.pushState(window.history.state, null,  "//" + window.location.host + "/pages/" + target.getAttribute("sub_slug") + ".htm");
            fetchPageData(target.getAttribute("sub_slug"), callback);
        }
    });
}

function buildWindow(slug, sub_slug) {
    Array.prototype.forEach.call(_All("header .switch-content"), function (element) {
        element.addEventListener("click", switchContent);
    });
    Array.prototype.forEach.call(_All("footer .switch-content"), function (element) {
        element.addEventListener("click", switchContent);
    });
    if (slug == "index") {
        renderIndex();
    } else if (slug == "writing") {
        renderWriting();
    } else if (slug == "page") {
        renderPage();
    }
}
window.addEventListener("popstate", function (event) {
    state = event.state;
    if (state) {
        loadLayout(function (callback) {
            if (_(".main > .current")){
                _(".main > .current").classList.remove("current");
            }
            if (state.slug == "index") {
                fetchIndexData(null, callback);
            } else if(state.slug == "writing") {
                fetchWritingData(state.sub_slug, callback);
            } else if (state.slug == "page") {
                fetchPageData(state.sub_slug, callback);
            }
        });
    }
});
function resizeWindow() {
    if (window.innerWidth < 700) {
        _("body").classList.add("small");
    } else {
        _("body").classList.remove("small");
    }
    sortReply();
}
document.addEventListener("DOMContentLoaded", function () {
    resizeWindow();
});
window.addEventListener("resize", function () {
    resizeWindow();
});
