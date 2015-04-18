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

function datetimeToUnix(datetime){
    var tmp_datetime = datetime.replace(/:/g,"-");
    tmp_datetime = tmp_datetime.replace(/ /g,"-");
    var arr = tmp_datetime.split("-");
    var now = new Date(Date.UTC(arr[0], arr[1]-1, arr[2], arr[3]-8, arr[4], arr[5]));
    return parseInt(now.getTime()/1000);
}

function unixToDatetime(unix){
    Date.prototype.format = function(format) {
       var date = {
              "M+": this.getMonth() + 1,
              "d+": this.getDate(),
              "h+": this.getHours(),
              "m+": this.getMinutes(),
              "s+": this.getSeconds(),
              "q+": Math.floor((this.getMonth() + 3) / 3),
              "S+": this.getMilliseconds()
       };
       if (/(y+)/i.test(format)) {
              format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
       }
       for (var k in date) {
              if (new RegExp("(" + k + ")").test(format)) {
                     format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
              }
       }
       return format;
   };
    var now = new Date(parseInt(unix) * 1000);
    return now.format("yyyy-MM-dd hh:mm:ss");
}
function adjustTextarea(selector) {
    if (typeof $(selector).parent(".textarea").children(".hidden-textarea")[0] !== "undefined"){
        $(selector).parent(".textarea").children(".hidden-textarea").val($(selector).val());
        $(selector).parent(".textarea").height($(selector).parent(".textarea").children(".hidden-textarea")[0].scrollHeight + 39);
    }
}
$(".textarea .visible-textarea").keypress(function(){adjustTextarea(this);});
$(".textarea .visible-textarea").keydown(function(){adjustTextarea(this);});
$(".textarea .visible-textarea").keyup(function(){adjustTextarea(this);});
$(".textarea .visible-textarea").change(function(){adjustTextarea(this);});
$(".textarea .visible-textarea").blur(function(){adjustTextarea(this);});
function getCookie(name) {
    var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
    return r ? r[1] : undefined;
}

jQuery.postJSON = function(url, args, callback) {
    args._xsrf = getCookie("_xsrf");
    $.ajax({url: url, data: $.param(args), dataType: "text", type: "POST",
        success: function(response) {
            callback(response);
    }});
};

$(document).ready(function (){
    adjustTextarea(".textarea .visible-textarea");
    $(".change-time").html(function (){
        if ($(this).html() == "0"){
            return "发表时";
        }else{
            return unixToDatetime(Math.round($(this).html()));
        }
    });
});

$.fn.listen = function(type,fn){
    return this.each(function(){
        $(this)[0].addEventListener(type,function(e){
            if(!fn.call($(this),e)){
                e.stopPropagation();
                e.preventDefault();
            }
        },0);
    });
};

$(".public .content.upload-now").bind("dragenter",function(){
    return false;
}).bind("dragover",function(e){
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    return false;
}).listen("drop",function(e){
    var num = 1;
    var files = e.dataTransfer.files;
    var j = files.length;
    for (var i=0; i<j; i++){
        var reader = new FileReader();
        reader.onload = function (event){
            num ++;
            if(num > j){
                publicUpload(files, function (){
                    $(".public .selector.select-from-public").click();
                });
            }
        };
        reader.readAsDataURL(files[i]);
    }
    return false;
});

function publicUpload(files, cb){
    var formData = new FormData();
    for (var i=0; i <files.length; i++){
        formData.append("files[]", files[i]);
    }
    formData.append("_xsrf", getCookie("_xsrf"));
    formData.append("action", "put");
    $(".public .uploading").fadeIn("150");
    $(".public .uploading").css("display", "table");
    $.ajax({
        url: "/channel/public",  //server script to process data
        type: "POST",
        xhr: function (){
            myXhr = $.ajaxSettings.xhr();
            if (myXhr.upload){
                myXhr.upload.addEventListener("progress",progressHandlingFunction, false);
            }
            return myXhr;
        },
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        success: function (data){
            $(".public .uploading").fadeOut("150");
            setTimeout(function (){
                $(".public .uploading .process-bar .done").css("width", "0%");
            }, 150);
            $(".public .selector.select-from-public").attr("value", "");
            cb(data);
        }
    });
}
function progressHandlingFunction(e){
    if(e.lengthComputable){
        var percentage = Math.round(e.loaded / e.total * 100);
        $(".public .uploading .process-bar .done").css("width", (percentage + "%"));
    }
}

function buildHeader(){
    if ($(window).width() < 600){
        $("header .list-button").show();
        $("header .left").hide();
        $("header .right").hide();
        $("header .list").show();
    }else{
        $("header .list-button").hide();
        $("header .left").show();
        $("header .right").show();
        $("header .list").hide();
        $("header .list").removeClass("active");
        $("header .list-button").removeClass("active");
    }
}

$("header .list-button").click(function (){
    if (!$("header .list").hasClass("active")){
        $("header .list").addClass("active");
        $(this).addClass("active");
    }else{
        $("header .list").removeClass("active");
        $(this).removeClass("active");
    }
});

function resizePublic(){
    if ($(window).width() < 900){
        $(".public").removeClass("big");
    }else{
        $(".public").addClass("big");
    }
}

$(window).resize(function (){
    buildHeader();
    resizePublic();
});
$(document).ready(function (){
    buildHeader();
    resizePublic();
});

function getPreview(content, cb){
    data = {};
    data.content = content;
    $.postJSON("/channel/preview", data, cb);
}

$(".open-public").click(function (){
    $(".public .selector.upload-now").click();
    $("#public-area").fadeIn("300");
});

$(".public .close-button").click(function (){
    $("#public-area").fadeOut("300");
});

$(".public .selector.upload-now").click(function (){
    $(this).addClass("active");
    $(".public .content.upload-now").addClass("active");
    $(".public .selector.select-from-public").removeClass("active");
    $(".public .content.select-from-public").removeClass("active");
});

$(".public .selector.select-from-public").click(function (){
    $(this).addClass("active");
    $(".public .content.select-from-public").addClass("active");
    $(".public .selector.upload-now").removeClass("active");
    $(".public .content.upload-now").removeClass("active");
    data = {};
    data.action = "list";
    $.postJSON("/channel/public", data, buildPublicArea);

});

$("#file-select-button").click(function (){
    $("#public-hidden-file-selector").click();
});

function buildPublicArea(json){
    var data = JSON.parse(json);
    $(".public .content.select-from-public .public-file-list").html("");
    $.each(data, function (key, item){
        $(".public .content.select-from-public .public-file-list").prepend(function (){
            result = "<div class=\"file-item\" fileurl=\"";
            result += item.fileurl;
            result += "\"><span class=\"filename\">";
            result += item.filename;
            result += "</span><span class=\"time\">";
            result += unixToDatetime(item.time);
            result += "</span></div>";
            return result;
        });
    });
}

$("#public-hidden-file-selector").change(function (){
    publicUpload($(this).get(0).files, function (){
        $(".public .selector.select-from-public").click();
    });
});

function insertText(obj, str) {
    if (document.selection) {
        var sel = document.selection.createRange();
        sel.text = str;
    } else if (typeof obj.selectionStart === 'number' && typeof obj.selectionEnd === 'number') {
        var startPos = obj.selectionStart,
            endPos = obj.selectionEnd,
            cursorPos = startPos,
            tmpStr = obj.value;
        obj.value = tmpStr.substring(0, startPos) + str + tmpStr.substring(endPos, tmpStr.length);
        cursorPos += str.length;
        obj.selectionStart = obj.selectionEnd = cursorPos;
    } else {
        obj.value += str;
    }
}

$(document).on("click", ".public .file-item", function(){
    if ($("#public-insert-as-link").prop("checked")){
        var content = "[](";
    }else{
        var content = "![](";
    }
    content += window.siteURL + $(this).attr("fileurl") + ")";
    insertText($("#working-content")[0], content);
    $(".public .close-button").click();
});
