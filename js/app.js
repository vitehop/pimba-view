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
};

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
};




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


$(document).ready(function() {

    /* Bootup */


    // Load first perspective into pimba-bisor
    getUser(userModel).done(function () {

        getPerspective(userModel.perspectives()[0]._id).done(function () {

            pimbaBisor.setJSONDataWidgets(perspectiveModel.currentPerspective());
            pimbaBisor.go();


        }).fail(function () {
            console.log("Error loading default user perspective");
        });

    }).fail(function () {
        console.log("Error loading user data");
    });


    // ***************
    // HEADER EVENTS
    // ***************


    // CLICK ON CREATE NEW PERSPECTIVE

    $("body").on('click', '#newPerspective', function () {

        // Prepare the cardModel for the modal window
        cardModel.title("Enter title...");
        cardModel.description("Enter description...");
        cardModel.user(userModel.id);
        cardModel.isNewCard(true);

        $('#editModal').modal(); // show empty modal window
        //$('#modal-title').trigger("click"); // triggers click on the title so the user can edit directly
    });


    // CLICK ON LOGOUT BUTTON

    $("body").on('click', '#logoutBtn', function () {

        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        window.location.href = "../index.html";
    });


    // ********************
    // BISOR CARD EVENTS
    // ********************


    // CLICK ON EDIT ICON .editCardButton

    $("body").on('click', '.editCardButton', function () {

        var widgetId = $(this).closest('.rze_widget').attr("id");

        $('#editModal').modal(); // show empty modal window

        // busco los detalles de la tarjeta y los planto en mi modelo
        getCard(cardModel, widgetId).done(function () {
            console.log("Card " + cardModel.id() + " load success");
        });

        // Hide savecancel buttons so they don't appear initially
        $('.description-savecancel-buttons').hide();
        $('.title-savecancel-buttons').hide();

    });


    // CLICK ON NEW CARD ICON .newCardButton

    $("body").on('click', '.newCardButton', function () {

        var widgetId = $(this).closest('.rze_widget').attr("id");

        // Preparo el cardModel para la nueva tarjeta
        cardModel.title("Enter title...");
        cardModel.description("Enter description...");
        cardModel.parent(widgetId);
        cardModel.user(userModel.id);
        cardModel.childs([]);
        cardModel.isNewCard(true);

        $('#editModal').modal(); // show modal window

        // Hide savecancel description buttons so they don't appear initially
        $('.description-savecancel-buttons').hide();

    });


    // *************************
    // MODAL EDIT WINDOW EVENTS
    // *************************
    // JS Code for the edit window

    // Initial config


    // CLICK ON DELETE CARD BUTTON

    $("body").on('click', '.deletecard', function () {

        deleteCard(cardModel).done(function () {

            console.log("Card " + cardModel.id() + " deleted correctly");

            // Una vez la card está actualizada, repinto la perspectiva
            getPerspective(perspectiveModel.card_id()).done(function () {

                pimbaBisor.setJSONDataWidgets(perspectiveModel.currentPerspective());
                pimbaBisor.go();

                // Cerramos la ventana modal ya que hemos borrado la tarjeta
                $('#editModal').modal('hide');


            });


        });

    });


    // CLICK ON TITLE AREA

    $("body").on('click', '#modal-title', function () {

        $('#modal-title').on('click', function () {

            var previousText = $('#modal-title').code();

            $('#modal-title').attr('contenteditable', 'true');
            $('#modal-title').addClass('title-editing');
            $('.title-savecancel-buttons').show();
            $('#modal-title').focus();

            // little code block to automatically select the whole text into the contentEditable element
            var range = document.createRange();
            range.selectNodeContents(document.getElementById("modal-title"));
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        });

    });


    // CLICK ON TITLE SAVE BUTTON

    $("body").on('click', '.title-save', function () {

        $('#modal-title').attr('contenteditable', 'false');
        $('.title-savecancel-buttons').hide();
        $('#modal-title').removeClass('title-editing');

        cardModel.title($('#modal-title').code());

        // Si la tarjeta es nueva, la creamos
        if (cardModel.isNewCard()) {

            createCard(cardModel).done(function () {

                // Una vez la card está guardada, repinto la perspectiva

                getPerspective(perspectiveModel.card_id()).done(function () {

                    pimbaBisor.setJSONDataWidgets(perspectiveModel.currentPerspective());
                    pimbaBisor.go();
                });

            });

        }

        // Si no es la tarjeta nueva, la editamos
        else {

            updateCard(cardModel).done(function () {

                // Una vez la card está actualizada, repinto la perspectiva
                getPerspective(perspectiveModel.card_id()).done(function () {

                    pimbaBisor.setJSONDataWidgets(perspectiveModel.currentPerspective());
                    pimbaBisor.go();
                });
            });

        }

    });


    // CLICK ON TITLE CANCEL BUTTON

    $("body").on('click', '.title-cancel', function () {

        $('#modal-title').html(previousText);
        $('#modal-title').attr('contenteditable', 'false');
        $('.title-savecancel-buttons').hide();
        $('#modal-title').removeClass('title-editing');

    });


    // CLICK ON DESCRIPTION AREA

    $("body").on('click', '#modal-description', function () {


        $('#modal-description').summernote({
            focus: true,

            toolbar: [
                ['style', ['bold', 'italic', 'underline', 'strikethrough']],
                ['para', ['ul', 'ol', 'paragraph']],
            ]
        });

        var previousText = $('#modal-description').code();

        $('#modal-description').addClass('description-editor');

        $('.description-savecancel-buttons').show();


    });


    // CLICK ON DESCRIPTION SAVE BUTTON

    $("body").on('click', '.description-save', function () {

        $('#modal-description').destroy();
        $('.description-savecancel-buttons').hide();

        cardModel.description($('#modal-description').code());

        // Si es tarjeta nueva, la creamos
        if (cardModel.isNewCard()) {
            // Es tarjeta nueva

            createCard(cardModel).done(function () {

                getPerspective(perspectiveModel.card_id()).done(function () {

                    pimbaBisor.setJSONDataWidgets(perspectiveModel.currentPerspective());
                    pimbaBisor.go();
                });
                console.log("New card added");

            });
        }

        // Si no es tarjeta nueva, la editamos
        else {

            updateCard(cardModel).done(function () {

                // Una vez la card está actualizada, repinto la perspectiva
                getPerspective(perspectiveModel.card_id()).done(function () {

                    pimbaBisor.setJSONDataWidgets(perspectiveModel.currentPerspective());
                    pimbaBisor.go();
                });
                console.log("Description updated with the new desc: " + cardModel.description());
            });

        }

    });


    // CLICK ON DESCRIPTION CANCEL BUTTON

    $("body").on('click', '.description-cancel', function () {

        $('#modal-description').code(previousText);
        $('#modal-description').destroy();
        $('.description-savecancel-buttons').hide();
    });

});

// ****************
// API CALLS
// ****************


    function getPerspective(id_perspective) {

        return $.ajax({
            type: 'GET',
            url: apiserver + "/api/perspectives/" + id_perspective,
            dataType: 'json',
            beforeSend: function (request) {
                request.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            success: function (response) {

                // Setting user properties into the KO perspectiveModel
                perspectiveModel.currentPerspective(response);
                perspectiveModel.card_id(id_perspective);

            },
            error: function (response) {
                console.log(response);
            }
        });

    }

    function getUser(user) {

        return $.ajax({
            type: 'GET',
            url: apiserver + "/api/users",
            dataType: 'json',
            beforeSend: function (request) {
                request.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            success: function (response) {

                // Setting user properties into the KO userModel

                user.username(response.username);
                user.password(response.password);
                user.perspectives(response.perspectives);

            },
            error: function (response) {
                console.log(response);
                window.location.href = '../index.html';
            }
        });

    }

    function getCard(card, cardID) {

        return $.ajax({
            type: 'GET',
            url: apiserver + "/api/cards/" + cardID,
            dataType: 'json',
            beforeSend: function (request) {
                request.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            success: function (response) {

                // Setting user properties into the KO cardModel
                console.log(response);

                card.title(response.title);
                card.description(response.description);
                card.parent(response.parent);
                card.childs(response.childs);
                card.id(response._id);
                card.user(response.user);

            },
            error: function (response) {
                console.log(response);
                window.location.href = '../index.html';
            }
        });

    }

    function updateCard(card) {

        return $.ajax({
            type: 'PUT',
            data: {
                title: card.title,
                description: card.description,
                parent: card.parent,
                childs: card.childs,
                user: card.user
            },
            url: apiserver + "/api/cards/" + card.id(),
            dataType: 'json',
            beforeSend: function (request) {
                request.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            success: function (response) {


                console.log("[PUT /api/cards/] Id: " + card.id() + " Title: " + card.title());
            },
            error: function (response) {
                console.log(response);
                console.log(card.childs());
                //noty({text: 'Server crash :('});
            }
        });

    }

    function deleteCard(card) {

        return $.ajax({
            type: 'DELETE',
            url: apiserver + "/api/cards/" + card.id(),
            dataType: 'json',
            beforeSend: function (request) {
                request.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            success: function (response) {

                console.log(response);
            },
            error: function (response) {
                console.log(response);

            }
        });

    }

    function createCard(card) {

        return $.ajax({
            type: 'POST',
            data: {
                title: card.title,
                description: card.description,
                parent: card.parent
            },
            url: apiserver + "/api/cards/",
            dataType: 'json',
            beforeSend: function (request) {
                request.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            success: function (response) {

                // Estos datos sí estan en el response pero parece que no es la ruta adeucada


                card.id(response._id);
                card.user(response.user);
                card.childs(response.childs);
                card.parent(response.parent);
                card.isNewCard(false);
                console.log("[POST /api/cards/] Id: " + card.id() + " Title: " + card.title());

            },
            error: function (response) {
                console.log(response);

            }
        });

    }

    function savePerspective(card) {

        return $.ajax({
            type: 'POST',
            data: { card_id: card.id },
            url: apiserver + "/api/perspectives",
            dataType: 'json',
            beforeSend: function (request) {
                request.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            success: function (response) {

                console.log("[POST /api/perspectives] Id: " + card.id() + " Title: " + card.title());
            },

            error: function (response) {
                console.log(response);

            }

        });
    }




