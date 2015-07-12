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
document.getElementById("login").addEventListener("click", function () {
    document.getElementById("real-username").value = document.getElementById("username").value;

    var SHAObj = new jsSHA(document.getElementById("password").value, "TEXT");
    document.getElementById("real-password").value = SHAObj.getHash("SHA-256", "HEX");

    document.getElementById("real-two").value = document.getElementById("two").value;

    if (document.getElementById("remember").checked) {
        document.getElementById("real-remember").value = "true";
    } else {
        document.getElementById("real-remember").value = "false";
    }
    document.getElementsByTagName("form")[0].submit();
});
