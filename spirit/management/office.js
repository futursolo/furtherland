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

document.querySelector("#menu-button").addEventListener("click", function (e) {
    document.querySelector("aside").classList.toggle("visible");
});
document.querySelector("#reload").addEventListener("click", function (e) {
    if (!window.loading){
        loadLayout(function (callback) {
            setTimeout(callback, 1500);
        });
    }
});


Array.prototype.forEach.call(document.querySelectorAll(".aside-item"), function (element) {
    element.addEventListener("click", function (e) {
        document.querySelector("aside").classList.remove("visible");
    });
});

function loadLayout(callback) {
    window.loading = true;
    document.querySelector(".load-layout").style.height = "100%";
    document.querySelector(".load-layout").style.width = "100%";
    document.querySelector(".load-layout").classList.add("visible");
    function hideLoadLayout() {
        document.querySelector(".load-layout").classList.remove("visible");
        setTimeout(function () {
        document.querySelector(".load-layout").style.height = "0";
        document.querySelector(".load-layout").style.width = "0";
            window.loading = false;
        }, 300);
    }
    setTimeout(callback, 300, hideLoadLayout);
}

function toggle(event) {
    var spinners = event.target.parentElement.querySelectorAll('paper-spinner');
    Array.prototype.forEach.call(spinners, function (spinner) {
        spinner.active = !spinner.active;
    });
}

document.querySelector("#switch-to-lobby").addEventListener("click", function () {
    loadLayout(function (callback) {
        document.querySelector(".main-part.current").classList.remove("current");
        document.querySelector(".main-part.lobby").classList.add("current");
        callback();
    });
});
document.querySelector("#switch-to-working").addEventListener("click", function () {
    loadLayout(function (callback) {
        document.querySelector(".main-part.current").classList.remove("current");
        document.querySelector(".main-part.working").classList.add("current");
        callback();
    });
});
