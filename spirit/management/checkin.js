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
$("#checkin-button").click(function() {
    $("#real-username").val($("#origin-username").val());
    $("#real-password").val(function() {
        var SHAObj = new jsSHA($("#origin-password").val(), "TEXT");
        var hash = SHAObj.getHash("SHA-256", "HEX");
        return hash;
    });
    $("#real-two").val($("#origin-two").val());
    $("#checkin-form").submit();
});
function adjustTitle() {
    if ($(window).width() < 500){
        $(".checkin-title").css("font-size", "20px");
    }else{
        $(".checkin-title").css("font-size", "25px");
    }
}
$(document).ready(function() {
    adjustTitle();
});
$(window).resize(function() {
    adjustTitle();
});
