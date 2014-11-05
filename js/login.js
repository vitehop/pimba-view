
var apiserver = "http://localhost:8080";


$(document).ready(function() {

    /*
     * Ejemplo básico Ajax para logeo en la API Pimba.
     * Almacena el token en localStorage.token
     * El token no expira nunca de lado cliente, lo hace de lado servidor
     **/

    $('#loginBtn').on('click', function () {

        var username = $('#inputEmail').val();
        var password = $('#inputPassword').val();

        $.ajax({
            type: 'POST',
            url: apiserver + "/api/login",
            data: { 'username': username, 'password': password },
            dataType: 'json',
            success: function (response) {
                localStorage.setItem("token", response.token);
                window.location.href="app.html";


            },
            error: function () {
                alert("Login failed :(");
            }
        });

    });





});
