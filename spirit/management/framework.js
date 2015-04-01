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

$(".textarea textarea").keypress(function(){
    $(this).parent(".textarea").children("pre").html($(this).val());
});
$(".textarea textarea").keydown(function(){
    $(this).parent(".textarea").children("pre").html($(this).val());
});
$(".textarea textarea").keyup(function(){
    $(this).parent(".textarea").children("pre").html($(this).val());
});
$(".textarea textarea").change(function(){
    $(this).parent(".textarea").children("pre").html($(this).val());
});
$(".textarea textarea").blur(function(){
    $(this).parent(".textarea").children("pre").html($(this).val());
});
