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

function loadTime(){
    if ($("#when-click-publish").prop("checked")){
        $("#publish-time").prop("disabled", true);
        $("#publish-time").val(unixToDatetime(Math.round($.now() / 1000)));
    }else{
        $("#publish-time").prop("disabled", false);
    }
    setTimeout(loadTime, 1000);
}

$(document).ready(function (){
    var arr = $("#publish-time").val().split(" ");
    var dateReg = /^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29)$/;
    var timeReg = /^2[0-3]|[0-1]?\d:[0-5][0-9]:[0-5][0-9]$/;
    try{
        if (!(dateReg.test(arr[0]) && timeReg.test((arr[1] + "")))){
            $("#publish-time").val(unixToDatetime(Math.round($("#publish-time").val())).replace(/\//g,"-"));
        }
    }catch (e){
        try{
            $("#publish-time").val(unixToDatetime(Math.round($("#publish-time").val())).replace(/\//g,"-"));
        }catch (e2){
            $("#publish-time").val(unixToDatetime(Math.round($.now() / 1000)));
        }
    }
    setTimeout(loadTime, 1);
});

$("#publish-time").blur(function (){
    var arr = $(this).val().split(" ");
    var dateReg = /^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29)$/;
    var timeReg = /^2[0-3]|[0-1]?\d:[0-5][0-9]:[0-5][0-9]$/;
    if (!(dateReg.test(arr[0]) && timeReg.test((arr[1] + "")))){
        $("#publish-time").val(unixToDatetime(Math.round($.now() / 1000)).replace(/\//g,"-"));
    }
});

$("#slug").blur(function (){
    var slugReg = /^([\-a-zA-Z0-9]+)$/;
    if (!slugReg.test($(this).val())){
        $(this).val("");
    }
});

function transferWorking(giveTime){
    $("#real-title").attr("value", $("#working-title").val());
    document.getElementById("real-content").value = document.getElementById("working-content").value;
    if (!giveTime && $("#when-click-publish").prop("checked")){
        $("#real-time").val("0");
    }else{
        $("#real-time").val(datetimeToUnix($("#publish-time").val()));
    }
    $("#real-slug").val($("#slug").val());
    $("input[name=\"show_type\"]").each(function (){
        if ($(this).prop("checked")){
            $("#real-type").val($(this).val());
        }
    });
}

$("#save-as-draft").click(function (){
    $("#publish-alert").hide();
    transferWorking(false);
    $("#real-publish").val("false");
    if ($("#real-slug").val() !== "" && $("#real-title").val() !== "" && document.getElementById("real-content").value !== ""){
        slugVerify(function (json){
            var result = JSON.parse(json);
            if (result.status){
                $("#working-form").submit();
            }else{
                $("#publish-alert").html("相同的短链接已经存在，请更换！");
                $("#publish-alert").show();
            }
        });
    }else{
        $("#publish-alert").html("题目、内容以及短链接都需要填写，请检查！");
        $("#publish-alert").show();
    }
});

$("#publish-now").click(function (){
    $("#publish-alert").hide();
    transferWorking(true);
    $("#real-publish").val("true");
    if ($("#real-slug").val() !== "" && $("#real-title").val() !== "" && document.getElementById("real-content").value !== ""){
        slugVerify(function (json){
            var result = JSON.parse(json);
            if (result.status){
                $("#working-form").submit();
            }else{
                $("#publish-alert").html("这个短链接已经存在，请换一个后再试！");
                $("#publish-alert").show();
            }
        });
    }else{
        $("#publish-alert").html("题目、内容以及短链接都是必填项目，请检查！");
        $("#publish-alert").show();
    }
});

function slugVerify(cb){
    result = {
        "slug": $("#real-slug").val(),
        "working": $("#real-type").val()
    };
    $.postJSON("/channel/slug_verify", result, cb);
}

function buildEditor(){
    if ($(window).width() < 900){
        $(".main .left").css("width", "100%");
        $(".main .right").css("width", "100%");
    }else{
        $(".main .left").css("width", "69.5%");
        $(".main .right").css("width", "29.5%");
    }
}

$("#show-editor").click(function (){
    $(this).addClass("active");
    $("#show-preview").removeClass("active");
    $(".editor.content").show();
    $(".preview.content").hide();
});

function writePreviewContent(data){
    $(".preview.content").html(data);
}

$("#show-preview").click(function (){
    $(this).addClass("active");
    $("#show-editor").removeClass("active");
    getPreview($("#working-content").val(), writePreviewContent);
    $(".preview.content").show();
    $(".editor.content").hide();
});


$(window).resize(function (){
    buildEditor();
});
$(document).ready(function (){
    buildEditor();
});
