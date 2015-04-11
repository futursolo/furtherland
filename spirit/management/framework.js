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

$(".textarea textarea").keypress(function(){
    $(this).parent(".textarea").children("div").html($(this).val());
});
$(".textarea textarea").keydown(function(){
    $(this).parent(".textarea").children("div").html($(this).val());
});
$(".textarea textarea").keyup(function(){
    $(this).parent(".textarea").children("div").html($(this).val());
});
$(".textarea textarea").change(function(){
    $(this).parent(".textarea").children("div").html($(this).val());
});
$(".textarea textarea").blur(function(){
    $(this).parent(".textarea").children("div").html($(this).val());
});

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

$("#drag-upload-area").bind("dragenter",function(){
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
            if(num>j){
                upload(files);
            }
        };
        reader.readAsDataURL(files[i]);
    }
    return false;
});

function upload(files){
    var formData = new FormData();
    for (var i=0; i <files.length; i++){
        formData.append("files[]",files[i]);
    }
    $.ajax({
        url: "upload.php",  //server script to process data
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
        success: function (){
        }
    });
}
function progressHandlingFunction(e){
    if(e.lengthComputable){
        $("progress").attr({value:e.loaded,max:e.total});
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

$(window).resize(function (){
    buildHeader();
});
$(document).ready(function (){
    buildHeader();
});

function getPreview(content, cb){
    data = {};
    data.content = content;
    $.postJSON("/channel/preview", data, cb);
}
