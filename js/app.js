$(document).ready(function(){

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

        $('.description-cancel').on('click',function(){

            $('#modal-description').code(previousText);
            $('#modal-description').destroy();
            $('.description-savecancel-buttons').hide();
        });

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

        $('.title-cancel').on('click',function(){

            $('#modal-title').html(previousText);
            $('#modal-title').attr('contenteditable','false');
            $('.title-savecancel-buttons').hide();
            $('#modal-title').removeClass('title-editor');

        });

        $('.title-save').on('click',function(){

            $('#modal-title').attr('contenteditable','false');
            $('.title-savecancel-buttons').hide();
            $('#modal-title').removeClass('title-editor');

        });

    });




});



