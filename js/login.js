$(document).ready(function() {
    /* Hiding login error message */
    $('.loginFailed').hide();

    /*
     * Ejemplo básico Ajax para logeo en la API Pimba.
     * Almacena el token en localStorage.token
     * El token no expira nunca de lado cliente, lo hace de lado servidor
     * Si el usuario no selecciona "Remember me" el token se almacena en sessionStorage.token
     * En este caso el token se elimina al cerrar la pestaña del navegador
     **/

    $( "#login-form" ).submit(function( event ) {
        event.preventDefault();

        $.ajax({
            url     : $(this).attr('action'),
            type    : $(this).attr('method'),
            data    : $( "#login-form").serialize(),
            dataType: 'json',
            success: function (response) {
                if ($("#rememberMe").is(':checked')){
                    localStorage.setItem("token", response.token);
                    window.location.href="app.html";
                } else {
                    sessionStorage.setItem("token",response.token);
                    window.location.href="app.html";
                }
            },
            error: function () {
                $('.loginFailed').show();
            }
        });
    });
});
