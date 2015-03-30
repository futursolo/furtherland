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
