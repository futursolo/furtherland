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

function getReplyData(){
    result = {};
    result.writing = $("#reply-writing").val();
    result.name = $("#reply-name").val();
    result.email = $("#reply-email").val();
    result.homepage = $("#reply-homepage").val();
    if ($("#reply-textarea").val().length <= 10){
        throw("一个好的评论的长度应该大于10个字，难道不是么？");
    }
    result.content = $("#reply-textarea").val();
    result.action = "new";
    return result;
}

function buildReplyArea(){
    replyData = {};
    replyData.action = "get";
    replyData.method = "list";
    replyData.writing = window.writing_id;
    $.postJSON("/channel/reply",
        replyData,
        function(data){
            jsonData = JSON.parse(data);
            $.each(jsonData, function (key, item){
                $("#reply-list").prepend(function (){
                    result = "<div class=\"reply-block\">";
                    result += "<div class=\"reply-avatar\" style=\"background-image: url(/channel/avatar/" +
                    item.emailmd5 + "?s=200&d=mm);\"></div><div class=\"reply-name\">" + item.name + "</div><div class=\"reply-time change-time\">" + unixToDatetime(Math.round(item.time)) + "</div><div class=\"reply-body\">" + item.content + "</div>";
                    result += "</div>";
                    return result;
                });
            });
        }
    );
}

function showNewReply(id){
    replyData = {};
    replyData.action = "get";
    replyData.method = "single";
    replyData.reply = id;
    $.postJSON("/channel/reply",
        replyData,
        function(data){
            $("#reply-list").prepend(function (){
                jsonData = JSON.parse(data);
                result = "<div class=\"reply-block\">";
                result += "<div class=\"reply-avatar\" style=\"background-image: url(/channel/avatar/" +
                jsonData.emailmd5 + "?s=200&d=mm);\"></div><div class=\"reply-name\">" + jsonData.name + "</div><div class=\"reply-time change-time\">" + unixToDatetime(Math.round(jsonData.time)) + "</div><div class=\"reply-body\">" + jsonData.content + "</div>";
                result += "</div>";
                return result;
            });
        }
    );
}

function handleError(e){
    $("#reply-alert").html(e);
    $("#reply-alert").show();
}

function clearCurrentReply(){
    $("#reply-textarea").val("");
}

$("#publish-reply").click(function (){
    $("#reply-alert").hide();
    try{
    replyData = getReplyData();
    if (replyData !== false){
        try{
            $.postJSON("/channel/reply",
                replyData,
                function(data){
                    result = JSON.parse(data);
                    if (result.success){
                        showNewReply(result.id);
                        clearCurrentReply();
                    }else{
                        throw("233");
                    }
                }
            );
       }catch(e){
           throw("发生了未知错误，请稍候再试。");
       }
   }}catch(e){
       handleError(e);
   }
});
