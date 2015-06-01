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
        showLoadLayout();
        setTimeout(function () {
            hideLoadLayout();
        }, 1500);
    }
});


Array.prototype.forEach.call(document.querySelectorAll(".aside-item"), function (element) {
    element.addEventListener("click", function (e) {
        document.querySelector("aside").classList.remove("visible");
    });
});

function showLoadLayout() {
    window.loading = true;
    document.querySelector(".load-layout").style.display = "block";
    document.querySelector(".load-layout").classList.add("visible");
    document.querySelector(".load-layout paper-spinner").active = true;
}

function hideLoadLayout() {
    document.querySelector(".load-layout").classList.remove("visible");
    setTimeout(function () {
        document.querySelector(".load-layout").style.display = "none";
        window.loading = false;
    }, 300);
}

function toggle(event) {
    var spinners = event.target.parentElement.querySelectorAll('paper-spinner');
    Array.prototype.forEach.call(spinners, function(spinner) {
        spinner.active = !spinner.active;
    });
}
