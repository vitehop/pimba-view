// No localStorage.token? please, go and login

if(!localStorage.token){
    window.location.href ="login.html";
}


var apiserver = "http://localhost:8080";


$(document).ready(function(){


    // Logout bind
    $('#logoutBtn').on('click',function() {
        localStorage.removeItem("token");
        window.location.href="login.html";
    });


    // ***************
    // EDIT WINDOW JS
    // ***************
    //
    // 0 - Hide savecancel buttons
    // 1 - Show edit controls when clicking on the description field (and "cancel" button control)
    // 2 - Show edit controls when clicking on the title field (and "cancel" button control)



    $('.description-savecancel-buttons').hide();
    $('.title-savecancel-buttons').hide();

    // *****************
    // EDIT WINDOW BINDS
    // *****************

    // Show edit controls when clicking on the description field

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

        // Cancel button control

        $('.description-cancel').on('click',function(){

            $('#modal-description').code(previousText);
            $('#modal-description').destroy();
            $('.description-savecancel-buttons').hide();
        });

        // Save button control

        $('.description-save').on('click',function(){

            $('#modal-description').destroy();
            $('.description-savecancel-buttons').hide();
        });

    });

    // Show edit controls when clicking on the title field

    $('#modal-title').on('click',function(){

        var previousText = $('#modal-title').code();

        $('#modal-title').attr('contenteditable','true');
        $('#modal-title').addClass('title-editor');

        $('.title-savecancel-buttons').show();

        // Cancel button control

        $('.title-cancel').on('click',function(){

            $('#modal-title').html(previousText);
            $('#modal-title').attr('contenteditable','false');
            $('.title-savecancel-buttons').hide();
            $('#modal-title').removeClass('title-editor');

        });

        // Save button control

        $('.title-save').on('click',function(){

            $('#modal-title').attr('contenteditable','false');
            $('.title-savecancel-buttons').hide();
            $('#modal-title').removeClass('title-editor');

        });

    });




});



