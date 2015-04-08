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
              format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
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

function buildWindow(){
    if ($(window).width() < 750){
        $("#reply-textarea-wrapper").css("width", "100%");
        $("#reply-id-input").css("width", "calc(100% - 150px)");
    }else{
        $("#reply-textarea-wrapper").css("width", "calc(100% - 370px)");
        $("#reply-id-input").css("width", "200px");
    }
}
function getCookie(name) {
    var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
    return r ? r[1] : undefined;
}

$(document).ready(function (){
    jQuery.postJSON = function (url, args, callback){
        args._xsrf = getCookie("_xsrf");
        $.ajax({url: url, data: $.param(args), dataType: "text", type: "POST",
            success: function(response) {
            callback(eval("(" + response + ")"));
            }
        });
    };
    $(".change-time").html(function (){
        if ($(this).html() == "0"){
            return "发表时";
        }else{
            return unixToDatetime(Math.round($(this).html()));
        }
    });
    buildWindow();
});

$(window).resize(function (){
    buildWindow();
});

$(".textarea textarea").keypress(function (){
    $(this).parent(".textarea").children("div").html($(this).val());
});
$(".textarea textarea").keydown(function (){
    $(this).parent(".textarea").children("div").html($(this).val());
});
$(".textarea textarea").keyup(function (){
    $(this).parent(".textarea").children("div").html($(this).val());
});
$(".textarea textarea").change(function (){
    $(this).parent(".textarea").children("div").html($(this).val());
});
$(".textarea textarea").blur(function (){
    $(this).parent(".textarea").children("div").html($(this).val());
});

$("#publish-reply").click(function (){
    $.post(
        "/channel/reply",
        {
            name: "John",
            time: "2pm"
        },
        function(data){
            alert("Data Loaded: " + data);
   });
});
