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

function formatTime(unix) {
    time = new Date(parseInt(unix) * 1000);
    monthList = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    result = time.getDate() + " ";
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

function buildIndex(noFetchData) {
    if (!noFetchData) {
        fetchIndexData();
    }
    Array.prototype.forEach.call(_All(".main > .index .index-card .card-info .time"), function (element) {
        element.innerHTML = formatTime(Math.round(element.innerHTML));
    });
}

function buildWindow(slug, sub_slug) {
    if (slug == "index") {
        buildIndex(true);
        loadLayout(function (callback) {
            setTimeout(function () {
                callback();
            }, 5000);
        });
    }
}
