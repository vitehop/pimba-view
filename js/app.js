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

var cardModel = {
    title: ko.observable(),
    description: ko.observable(),
    parent: ko.observable(),
    user: ko.observable(),
    childs: ko.observableArray([]),
    id: ko.observable(),
    isNewCard: ko.observable()
}

ko.applyBindings(cardModel,$('#editModal')[0]);


var userModel = {
    username: ko.observable(),
    password: ko.observable(),
    perspectives: ko.observableArray([])
};

ko.applyBindings(userModel,$('#mainnavbar')[0]);

var perspectiveModel = {
    currentPerspective: ko.observable(),
    card_id: ko.observable()
}




/* BISOR init */

aOptions = {
    showSelectorCards: false,
    actions: [
        { class: 'editCardButton glyphicon glyphicon-pencil action' },
        { class: 'newCardButton glyphicon glyphicon-plus action' }
    ],
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

        pimbaBisor.setJSONDataWidgets(perspectiveModel.currentPerspective());
        pimbaBisor.go();
    });
}


$(document).ready(function(){

    /* Bootup */


    // Load first perspective into pimba-bisor
    getUser(userModel).done(function(){

        getPerspective(userModel.perspectives()[0]._id).done(function(){

           pimbaBisor.setJSONDataWidgets(perspectiveModel.currentPerspective());
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

    // Click sobre la acción de editar .editCardButton
    $("body").on('click', '.editCardButton', function() {

        var widgetId = $(this).closest('.rze_widget').attr("id");

        $('#editModal').modal(); // show empty modal window

        // busco los detalles de la tarjeta y los planto en mi modelo
        getCard(cardModel,widgetId).done(function(){
            console.log("Card "+cardModel.id()+" load success");
        });

    });


    // Click sobre la acción de nueva tarjeta .newCardButton
    $("body").on('click', '.newCardButton', function() {

        var widgetId = $(this).closest('.rze_widget').attr("id");

        // Preparo el cardModel para la nueva tarjeta
        cardModel.title("Enter title...");
        cardModel.description("Enter description...");
        cardModel.parent(widgetId);
        cardModel.user(userModel.id);
        cardModel.childs([]);
        cardModel.isNewCard(true);

        $('#editModal').modal(); // show modal window

    });






    // ***************
    // EDIT POPUP VIEW BINDINGS
    // ***************
    // JS Code for the edit window

    // Initial config

    // Hide savecancel buttons so they don't appear initially
    $('.description-savecancel-buttons').hide();
    $('.title-savecancel-buttons').hide();




    // Bind for deleting the card
    // ******************

    $('.deletecard').on('click',function(){

        deleteCard(cardModel).done(function(){

            console.log("Card "+cardModel.id()+" deleted correctly");

            // Una vez la card está actualizada, repinto la perspectiva
            getPerspective(perspectiveModel.card_id()).done(function () {

                pimbaBisor.setJSONDataWidgets(perspectiveModel.currentPerspective());
                pimbaBisor.go();

                // Cerramos la ventana modal ya que hemos borrado la tarjeta
                $('#editModal').modal('hide');


            });


        });

    });





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

            cardModel.description($('#modal-description').code());

            // Si es tarjeta nueva, la creamos
            if (cardModel.isNewCard()) {

                createCard(cardModel).done(function(){

                    getPerspective(perspectiveModel.card_id()).done(function(){

                        pimbaBisor.setJSONDataWidgets(perspectiveModel.currentPerspective());
                        pimbaBisor.go();
                    });
                    console.log("New card added");

                });
            }

            // Si no es tarjeta nueva, la editamos
            else {

                updateCard(cardModel).done(function(){

                    // Una vez la card está actualizada, repinto la perspectiva
                    getPerspective(perspectiveModel.card_id()).done(function () {

                        pimbaBisor.setJSONDataWidgets(perspectiveModel.currentPerspective());
                        pimbaBisor.go();
                    });
                    console.log("Description updated with the new desc: " +cardModel.description());
                });

            }




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

            cardModel.title($('#modal-title').code());

            // Si la tarjeta es nueva, la creamos
            if(cardModel.isNewCard()){

                createCard(cardModel).done(function(){

                    // Una vez la card está guardada, repinto la perspectiva
                    getPerspective(perspectiveModel.card_id()).done(function () {

                        pimbaBisor.setJSONDataWidgets(perspectiveModel.currentPerspective());
                        pimbaBisor.go();
                    });
                    console.log("Card saved with the new title: " +cardModel.title());

                });
            }

            // Si no es la tarjeta nueva, la editamos
            else {

                updateCard(cardModel).done(function(){

                    // Una vez la card está actualizada, repinto la perspectiva
                    getPerspective(perspectiveModel.card_id()).done(function () {

                        pimbaBisor.setJSONDataWidgets(perspectiveModel.currentPerspective());
                        pimbaBisor.go();
                    });
                    console.log("Card updated with the new title: " +cardModel.title());
                });

            }




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
            perspectiveModel.currentPerspective(response);
            perspectiveModel.card_id(id_perspective);

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

function getCard(card,cardID){

    return $.ajax({
        type: 'GET',
        url: apiserver + "/api/cards/" + cardID,
        dataType: 'json',
        beforeSend: function(request){ request.setRequestHeader('Authorization', 'Bearer '+token);},
        success: function(response) {

            // Setting user properties into the KO cardModel
            console.log(response);

            card.title(response.title);
            card.description(response.description);
            card.parent(response.parent);
            card.childs(response.childs);
            card.id(response._id);
            card.user(response.user);

        },
        error: function(response) {
            console.log(response);
            window.location.href='../index.html';
        }
    });

}

function updateCard(card){

    return $.ajax({
        type: 'PUT',
        data: {
            title : card.title,
            description : card.description,
            parent : card.parent,
            childs : card.childs,
            user : card.user
        },
        url: apiserver + "/api/cards/" + card.id(),
        dataType: 'json',
        beforeSend: function(request){ request.setRequestHeader('Authorization', 'Bearer '+token);},
        success: function(response) {


            console.log(response);
        },
        error: function(response) {
            console.log(response);
            window.location.href='../index.html';
        }
    });

}


function deleteCard(card){

    return $.ajax({
        type: 'DELETE',
        url: apiserver + "/api/cards/" + card.id(),
        dataType: 'json',
        beforeSend: function(request){ request.setRequestHeader('Authorization', 'Bearer '+token);},
        success: function(response) {

            console.log(response);
        },
        error: function(response) {
            console.log(response);
            window.location.href='../index.html';
        }
    });

}


function createCard(card){

    return $.ajax({
        type: 'POST',
        data: {
            title : card.title,
            description : card.description,
            parent : card.parent
        },
        url: apiserver + "/api/cards/",
        dataType: 'json',
        beforeSend: function(request){ request.setRequestHeader('Authorization', 'Bearer '+token);},
        success: function(response) {

            cardModel.id(response._id);
            cardModel.user(response.user);
            cardModel.childs(response.childs);
            cardModel.parent(response.parent);
            cardModel.isNewCard(false);

        },
        error: function(response) {
            console.log(response);
            window.location.href='../index.html';
        }
    });

}

