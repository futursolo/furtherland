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
    setTimeout(loadTime, 1);
});

$("#publish-time").blur(function (){
    var arr = $(this).val().split(" ");
    var dateReg = /^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29)$/;
    var timeReg = /^([0-2]{1})([0-3]{1}):{1}([0-5]{1})([0-9]{1}):{1}([0-5]{1})([0-9]{1})$/;
    if (!(dateReg.test(arr[0]) && timeReg.test(arr[1]))){
        $("#publish-time").val(unixToDatetime(Math.round($.now() / 1000)).replace(/\//g,"-"));
    }
});

function transferWorking(giveTime){
    $("#real-title").val($("working-title").val());
    $("#real-content")[0].innerHTML = $("#working-content")[0].innerHTML;
    if (!giveTime && $("#when-click-publish").prop("checked")){
        $("#real-time").val("publish");
    }else{
        $("#real-time").val($("#publish-time").val());
    }
    $("#real-status").val($("#real-slug").val());
    $("#real-slug").val($("#slug").val());
}

$("#save-as-draft").click(function (){
    transferWorking(false);
    $("#real-publish").val("false");
    $("working-form").submit();
});

$("#publish-now").click(function (){
    transferWorking(true);
    $("#real-publish").val("true");
    $("working-form").submit();
});
