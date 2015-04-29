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

$(".main .type-selector span").click(function (){
    window.location.href = $(this).attr("location");
});
$(".main .permit-reply").click(function (){
    $.postJSON("/channel/reply", {
        "action": "permit",
        "reply": $(this).attr("reply"),
        "permit": true
    }, function (data){
        window.location.reload();
    });
});
$(".main .unpermit-reply").click(function (){
    $.postJSON("/channel/reply", {
        "action": "permit",
        "reply": $(this).attr("reply"),
        "permit": false
    }, function (data){
        window.location.reload();
    });
});
$(".main .delete-reply").click(function (){
    $.postJSON("/channel/reply", {
        "action": "earse",
        "reply": $(this).attr("reply")
    }, function (data){
        window.location.reload();
    });
});

function resizeReplyEditor(){
    if ($(window).width() < 900){
        $(".reply-editor").removeClass("big");
    }else{
        $(".reply-editor").addClass("big");
    }
}
$(window).resize(function (){
    resizeReplyEditor();
});
$(document).ready(function (){
    resizeReplyEditor();
});

function fillReplyEditor(selector){
    replyContent = JSON.parse($(selector).attr("json"));
    $("#reply-editor-name").val(replyContent.name);
    $("#reply-editor-email").val(replyContent.email);
    $("#reply-editor-homepage").val(replyContent.homepage);
    $("#reply-editor-content").val(replyContent.content);
    $("#reply-editor-content").change();
}

$(".main .edit-reply").click(function (){
    $(".reply-editor").fadeIn("300");
    fillReplyEditor(this);
});

$(".reply-editor .close-button").click(function (){
    $(".reply-editor").fadeOut("300");
});
