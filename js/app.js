// Wait a sec... no token? please, go and login!
if(!localStorage.token && !sessionStorage.token){
    window.location.href ="../index.html";
}
else{
    var token = (localStorage.token || sessionStorage.token);
}




// General config

var apiserver = "http://localhost:8080";




// ***************
// KNOCKOUT MODELS
// ***************

var userModel = {
    username: ko.observable(),
    password: ko.observable(),
    perspectives: ko.observableArray([])
};

var currentPerspective;

ko.applyBindings(userModel,$('#mainnavbar')[0]);


/* BISOR init */

aOptions = {
    showSelectorCards: false,
    depthTemplates: {
        0: { file: 'pimba-bisor/templates/default-card.html', id:'bisor-template-default'},
        1: { file: 'pimba-bisor/templates/small-card.html',   id:'bisor-template-small'},
        2: { file: 'pimba-bisor/templates/big-card.html',     id:'bisor-template-big'}
    }

};
var pimbaBisor = new PimbaBisor(aOptions);


// *********************
// KNOCKOUT CLICK BINDS
// *********************


function loadPerspective(data){

    getPerspective(data._id).done(function () {

        console.log("Loading perspective:");
        console.log(currentPerspective);
        pimbaBisor.setJSONDataWidgets(currentPerspective);
        pimbaBisor.go();
    });
}


$(document).ready(function(){

    /* Bootup */


    // Load first perspective into pimba-bisor
    getUser(userModel).done(function(){

        getPerspective(userModel.perspectives()[0]._id).done(function(){

           pimbaBisor.setJSONDataWidgets(currentPerspective);
            pimbaBisor.go();


        }).fail(function(){
            console.log("Error loading default user perspective");
        });

    }).fail(function() {
        console.log("Error loading user data");
    });




    // ***************
    // HEADER BINDINGS
    // ***************


        // Bind for clicking on the CREATE NEW PERSPECTIVE link
        // ***************

    $('#newPerspective').on('click',function(){
        $('#editModal').modal(); // show empty modal window
        $('#modal-title').trigger("click"); // triggers click on the title so the user can edit directly
    })

        // Bind for clicking on the LOGOUT link
        // ***************

    $('#logoutBtn').on('click',function() {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        window.location.href="../index.html";
    });


    // ***************
    // CARD BUTTONS
    // ***************

        // Binds for showing/hidding button bar when mouseover/mouseout
        // ***************

    $(".card").hover(

        function() {
            $(this).find(".button-list").show();
        }, function() {
            $(this).find(".button-list").hide();
        }

    );




    // ***************
    // EDIT POPUP VIEW BINDINGS
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
        $('#modal-title').addClass('title-editing');
        $('.title-savecancel-buttons').show();
        $('#modal-title').focus();

        // little code block to automatically select the whole text into the contentEditable element
        var range = document.createRange();
        console.log(range);
        range.selectNodeContents(document.getElementById("modal-title"));
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);



        // Bind for clicking on cancel button when editing the title
        // ***************

        $('.title-cancel').on('click',function(){

            $('#modal-title').html(previousText);
            $('#modal-title').attr('contenteditable','false');
            $('.title-savecancel-buttons').hide();
            $('#modal-title').removeClass('title-editing');

        });



        // Bind for clicking on save button when editing the title
        // ***************

        $('.title-save').on('click',function(){

            $('#modal-title').attr('contenteditable','false');
            $('.title-savecancel-buttons').hide();
            $('#modal-title').removeClass('title-editing');

        });

    });




});





// ****************
// API CALLS
// ****************


function getPerspective(id_perspective){

    return $.ajax({
        type: 'GET',
        url: apiserver + "/api/perspectives/"+id_perspective,
        dataType: 'json',
        beforeSend: function(request){ request.setRequestHeader('Authorization', 'Bearer '+token);},
        success: function(response) {

            // Setting user properties into the KO perspectiveModel
            currentPerspective=response;

        },
        error: function(response) {
            console.log(response);
        }
    });

}

function getUser(user){

    return $.ajax({
        type: 'GET',
        url: apiserver + "/api/users",
        dataType: 'json',
        beforeSend: function(request){ request.setRequestHeader('Authorization', 'Bearer '+token);},
        success: function(response) {

            // Setting user properties into the KO userModel

            user.username(response.username);
            user.password(response.password);
            user.perspectives(response.perspectives);

        },
        error: function(response) {
            console.log(response);
            window.location.href='../index.html';
        }
    });

}


