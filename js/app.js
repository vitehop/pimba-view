// Wait a sec... no token? please, go and login!
if(!localStorage.token && !sessionStorage.token){
    window.location.href ="login.html";
}
else{
    var token = (localStorage.token || sessionStorage.token);
}

/*
 FUNCIONAMIENTO BÁSICO DE KNOCKOUT.JS

MODELS: Estructuras que guardan los datos a mostrar.
        Estas estructuras luego se utilizan directamente en el HTML para pintar los datos que contienen.
        Al definir sus elementos como observables, cualquier cambio que hagamos a esta estructura desde JS se
        reflejará automáticamente en todos los elementos del HTML que estén utilizando el model.
        Después de definir el model, el método ko.applyBindings permite "tener disponible" este model para usar
        en un nodo del DOM en concreto.
  */



// JS MODELS

var userModel = {
    username: ko.observable(),
    password: ko.observable(),
    perspectives: ko.observableArray([])
};

ko.applyBindings(userModel,$('#mainnavbar')[0]);







// General config

var apiserver = "http://localhost:8080";


$(document).ready(function(){

    // ***************
    // PERSPECTIVE VIEW JS
    // ***************
    // JS Code for the main app view


    // Loading header items: user info & perspectives
    // ***************

    $.ajax({
        type: 'GET',
        url: apiserver + "/api/users",
        dataType: 'json',
        beforeSend: function(request){ request.setRequestHeader('Authorization', 'Bearer '+token);},
        success: function(response) {

            // Setting user properties into the KO userModel
            userModel.username(response.username);
            userModel.password(response.password);
            userModel.perspectives(response.perspectives);

        },
        error: function(response) {
            window.location.href='login.html';
        }
    });


    // Bind for clicking on the LOGOUT link
    // ***************

    $('#logoutBtn').on('click',function() {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        window.location.href="login.html";


    });











    // ***************
    // EDIT WINDOW JS
    // ***************
    // JS Code for the edit window

    // Initial config

    // Hide savecancel buttons so they don't appear initially
    $('.description-savecancel-buttons').hide();
    $('.title-savecancel-buttons').hide();



    // Bind for clicking on the description area
    // ***************

    $('#modal-description').on('click',function(){


        $('#modal-description').summernote({
            focus:true,

            toolbar: [
                ['style', ['bold', 'italic', 'underline','strikethrough']],
                ['para', ['ul', 'ol', 'paragraph']],
            ]
        });

        var previousText = $('#modal-description').code();

        $('#modal-description').addClass('description-editor');

        $('.description-savecancel-buttons').show();

        // Bind for clicking on cancel button when editing the description
        // ***************

        $('.description-cancel').on('click',function(){

            $('#modal-description').code(previousText);
            $('#modal-description').destroy();
            $('.description-savecancel-buttons').hide();
        });

        // Bind for clicking on save button when editing the description
        // ***************

        $('.description-save').on('click',function(){

            $('#modal-description').destroy();
            $('.description-savecancel-buttons').hide();
        });

    });

    // Bind for clicking on the title area
    // ***************

    $('#modal-title').on('click',function(){

        var previousText = $('#modal-title').code();

        $('#modal-title').attr('contenteditable','true');
        $('#modal-title').addClass('title-editor');

        $('.title-savecancel-buttons').show();

        // Bind for clicking on cancel button when editing the title
        // ***************

        $('.title-cancel').on('click',function(){

            $('#modal-title').html(previousText);
            $('#modal-title').attr('contenteditable','false');
            $('.title-savecancel-buttons').hide();
            $('#modal-title').removeClass('title-editor');

        });

        // Bind for clicking on save button when editing the title
        // ***************

        $('.title-save').on('click',function(){

            $('#modal-title').attr('contenteditable','false');
            $('.title-savecancel-buttons').hide();
            $('#modal-title').removeClass('title-editor');

        });

    });




});



