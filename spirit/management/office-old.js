function switchToWorking(edit, type, id) {
    edit = (typeof edit === "undefined") ? false : edit;
    type = (typeof type === "undefined") ? "writing" : type;
    id = (typeof id === "undefined") ? "-1" : id;
    loadLayout(function (callback) {
        if (document.querySelector(".main-part.current")){
            document.querySelector(".main-part.current").classList.remove("current");
        }
        url = "/management/working/";
        if (edit !== true) {
            url += "new";
        } else {
            url += "edit?type=" + type + "&id=" + id;
        }
        window.history.pushState(null,null,"//" + window.location.host + url);
        if (edit !== true) {
            document.querySelector("#working-type-radio-group").selected = "writing";
            document.querySelector("#working-title-input input").value = "";
            document.querySelector("#editor-textarea").value = "";
            document.querySelector("#working-real-method").value = "new";
            document.querySelector("#working-time-is-when-published").checked = true;
            document.querySelector("#working-info-slug-input").value = "";
            document.querySelector("#working-real-id").value = "";
            previewSlug();
            previewText();
        } else {

        }
        document.querySelector(".main-part.working").classList.add("current");
        callback();
    });
}

document.querySelector("#switch-to-lobby").addEventListener("click", switchToLobby);
document.querySelector("#switch-to-working").addEventListener("click", switchToWorking);
function previewText(event) {
    document.querySelector("#working-preview-area").innerHTML = marked(document.querySelector("#editor-textarea").value);
    syncHeight();
}

function syncHeight() {
    editor = document.querySelector("#editor-textarea");
    preview = document.querySelector("#working-preview-area");
    percentage = editor.scrollTop / (editor.scrollHeight - editor.offsetHeight);
    preview.scrollTop = (preview.scrollHeight - preview.offsetHeight) * percentage;
}

document.querySelector("#editor-textarea").addEventListener("change", previewText);
document.querySelector("#editor-textarea").addEventListener("keypress", previewText);
document.querySelector("#editor-textarea").addEventListener("keydown", previewText);
document.querySelector("#editor-textarea").addEventListener("keyup", previewText);
document.querySelector("#editor-textarea").addEventListener("blur", previewText);
document.querySelector("#editor-textarea").addEventListener("scroll", syncHeight);

document.querySelector("#publish-working-buttton").addEventListener("click", function () {
    document.querySelector(".working .working-info").classList.add("visible");
});
document.querySelector("#working-info-close-button").addEventListener("click", function () {
    document.querySelector(".working .working-info").classList.remove("visible");
});

function previewSlug() {
    if (!document.querySelector("#working-info-slug-input paper-input-container").invalid && document.querySelector("#working-info-slug-input").value !== "") {
        document.querySelector("#working-info-slug-preview").innerHTML = window.location.host;
        if (document.querySelector("#working-type-radio-group").selected == "writing"){
            document.querySelector("#working-info-slug-preview").innerHTML += "/writings/";
        } else {
            document.querySelector("#working-info-slug-preview").innerHTML += "/pages/";
        }
        document.querySelector("#working-info-slug-preview").innerHTML += document.querySelector("#working-info-slug-input").value;
        document.querySelector("#working-info-slug-preview").innerHTML += ".htm";
        return;
    }
     document.querySelector("#working-info-slug-preview").innerHTML = "";
}

document.querySelector("#working-type-radio-group").addEventListener("click", previewSlug);

document.querySelector("#working-info-slug-input").addEventListener("change", previewSlug);
document.querySelector("#working-info-slug-input").addEventListener("keypress", previewSlug);
document.querySelector("#working-info-slug-input").addEventListener("keydown", previewSlug);
document.querySelector("#working-info-slug-input").addEventListener("keyup", previewSlug);
document.querySelector("#working-info-slug-input").addEventListener("blur", previewSlug);

document.querySelector("#working-time-input input").addEventListener("blur", function () {
    after = unixToDatetime(datetimeToUnix(document.querySelector("#working-time-input").value));
    if (after != document.querySelector("#working-time-input").value) {
        document.querySelector("#working-time-input").value = unixToDatetime(Math.round((new Date()).getTime() / 1000)).replace(/\//g,"-");
    }
});

function hidePublicArea() {
    document.querySelector("#public-area").classList.remove("visible");
    setTimeout(function () {
    document.querySelector("#public-area").style.height = "0";
    document.querySelector("#public-area").style.width = "0";
    }, 300);
}

function showPublicArea() {
    document.querySelector("#public-area").style.height = "100%";
    document.querySelector("#public-area").style.width = "100%";
    document.querySelector("#public-area").classList.add("visible");
}
document.querySelector("#open-public-area-button").addEventListener("click", showPublicArea);

function buildWindow(slug, sub_slug) {
    if (document.querySelector("#switch-to-" + slug)) {
        document.querySelector("#switch-to-" + slug).click();
    } else {
        window.location.href = window.location.host + "/404";
    }
}

function sendWorking(publish) {
    queryString = new FormData();
    queryString.append("_xsrf", getCookie("_xsrf"));
    queryString.append("action", "save_working");
    queryString.append("working_type", document.querySelector("#working-type-radio-group").selected);
    queryString.append("working_title", document.querySelector("#working-title-input input").value);
    queryString.append("working_content", document.querySelector("#editor-textarea").value);
    queryString.append("working_method", document.querySelector("#working-real-method").value);
    queryString.append("working_time", datetimeToUnix(document.querySelector("#working-time-input").value));
    if (publish) {
        queryString.append("working_publish", "true");
    } else {
        queryString.append("working_publish", "false");
    }
    queryString.append("working_slug", document.querySelector("#working-info-slug-input").value);
    queryString.append("working_id", document.querySelector("#working-real-id").value);

    fetch("/management/api", {
        "method": "post",
        "credentials": "include",
        "body": queryString
    }).then(function (resp) {
        if (response.status >= 200 && response.status < 400) {
            return response;
        }
        throw response.status + "";
    }).then(function (resp) {
        return resp.json();
    }).then(function (json) {
        return;
    }).catch(function (error) {
        document.querySelector(".load-layout .loading-failed").show();
    });
}
