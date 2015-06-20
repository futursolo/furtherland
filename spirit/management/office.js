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

var _ = document.querySelector;

var _All = document.querySelectorAll;

var objects = {
    ".load": _(".load"),
    ".load .failed": _(".load .failed"),

    ".header .toggle-menu": _(".header .toggle-menu"),
    ".header .reload-page": _(".header .reload-page"),

    ".main aside": _(".main aside"),

    ".main > .lobby": _(".main > .container.lobby"),
    ".main > .lobby .writing_num .content": _(".main > .container.lobby .tile.writing_num .content"),
    ".main > .lobby .page_num .content": _(".main > .container.lobby .tile.page_num .content"),
    ".main > .lobby .reply_num .content": _(".main > .container.lobby .tile.reply_num .content"),

    ".working .time-input": _(".working > .info-container .time-container > .time-input"),
    ".working .time-checkbox": _(".working > .info-container .time-container > .time-ckeckbox")
};

function getCookie(name) {
    var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
    return r ? r[1] : undefined;
}

function datetimeToUnix(datetime){
    var tmp_datetime = datetime.replace(/:/g,"-");
    tmp_datetime = tmp_datetime.replace(/ /g,"-");
    var arr = tmp_datetime.split("-");
    var now = new Date(
        Date.UTC(arr[0], arr[1]-1, arr[2], arr[3]-8, arr[4], arr[5])
    );
    return parseInt(now.getTime() / 1000);
}

function unixToDatetime(unix){
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

function hideCurrentMainContainer() {
    current = _(".main > .container.current");
    if (current){
        current.classList.remove("current");
    }
}

function pushState(uri) {
    if (uri) {
        window.history.pushState(null,null,"//" + window.location.host + uri);
    }
}

function loadLayout(callback) {
    window.loading = true;

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
}

//Change Default Bahavior of paper-radio-button
window.addEventListener("load", function () {
    Array.prototype.forEach.call(
        _All("paper-radio-button"), function (element) {
            element.addEventListener("click", function (e) {
                var element = e.srcElement || e.target;
                if (findParentBySelector(element, "paper-radio-button") !== null) {
                    element = findParentBySelector(element, "paper-radio-button");
                }
                element.checked = true;
            });
        }
    );
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
    }).then(function (resp) {
        var data = resp;
        console.log(data);
        objects[".main > .lobby .writing_num .content"].innerHTML = data.writings;
        objects[".main > .lobby .page_num .content"].innerHTML = data.pages;
        objects[".main > .lobby .reply_num .content"].innerHTML = data.replies;
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
        hideCurrentMainContainer();
        pushState("/management/lobby");

        objects[".main > .lobby"].classList.add("current");

        loadLobbyData(callback);
    });
}

function validateTimeInputValue() {
    after = unixToDatetime(datetimeToUnix(objects[".working .time-input"].value));
    if (after != objects[".working .time-input"].value) {
        objects[".working .time-input"].value = unixToDatetime(Math.round((new Date()).getTime() / 1000)).replace(/\//g,"-");
    }
}

function loadTime() {
    edit = (typeof edit === "undefined") ? false : edit;
    if (objects[".working .time-checkbox"].checked){
        objects[".working .time-input"].disabled = true;
        objects[".working .time-input"].value = unixToDatetime(Math.round((new Date()).getTime() / 1000));
    }else{
        objects[".working .time-input"].disabled = false;
    }
    setTimeout(loadTime, 1000);
}

window.addEventListener("load", function () {
    validateTimeInputValue();
    loadTime();
});

//To toggle sidebar
objects[".header .toggle-sidebar"].addEventListener("click", function (e) {
    objects[".main aside"].classList.toggle("visible");
});

objects[".header .reload-page"].addEventListener("click", function (e) {
    if (!window.loading){
        loadLayout(function (callback) {
            setTimeout(callback, 1500);
        });
    }
});

Array.prototype.forEach.call(_All(".main .aside .aside-item"), function (element) {
    element.addEventListener("click", function (e) {
        objects[".main aside"].classList.remove("visible");
    });
});
