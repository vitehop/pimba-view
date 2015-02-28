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
    'cb_update_widget': function (draggedWidget,destinationWidget) {
        console.log("Este es el callback cb_update_widget!");
        console.log(draggedWidget);
        console.log(destinationWidget);
    },
    actions: [
        { class: 'editCardButton glyphicon glyphicon-pencil action' },
        { class: 'newCardButton glyphicon glyphicon-plus action' }
    ],
    depthTemplates: {
        0: { file: '../../bisor-templates/big-card.html', id:'bisor-template-big'},
        1: { file: '../../bisor-templates/default-card.html', id:'bisor-template-default'},
        2: { file: '../../bisor-templates/small-card.html', id:'bisor-template-small'}
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

        // Load Gravatar image
        console.log(userModel.username());
        var gravatar = $('<img>').attr({src: 'http://www.gravatar.com/avatar/' + MD5(userModel.username()) + '?s=30'});
        // append this new image to some div, or whatever
        $('#gravatar').append(gravatar);

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
        cardModel.parent(undefined);
        cardModel.isNewCard(true);

        $('#editModal').modal(); // show empty modal window
        //$('#modal-title').trigger("click"); // triggers click on the title so the user can edit directly
    });


    // CLICK ON LOGOUT BUTTON

    $("body").on('click', '#logoutBtn', function () {

        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        window.location.href = "index.html";
    });


    // ********************
    // BISOR EVENTS
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
                title: card.title(),
                description: card.description(),
                parent: card.parent()
            },
            url: apiserver + "/api/cards/",
            dataType: 'json',
            beforeSend: function (request) {
                request.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            success: function (response) {

                card.id(response._id);
                card.user(response.user);
                card.childs(response.childs);
                card.parent(response.parent);
                card.isNewCard(false);
                console.log("[POST /api/cards/] Id: " + card.id() + " Title: " + card.title());

                // Si es nueva perspectiva, la cargo en pantalla directamente y actualizo el listado de perspectivas
                // del usuario
                if (card.parent()==undefined){

                    getUser(userModel).done(function () {

                        getPerspective(card.id()).done(function () {

                            pimbaBisor.setJSONDataWidgets(perspectiveModel.currentPerspective());
                            pimbaBisor.go();


                        }).fail(function () {
                            console.log("Error loading perpective from card: " + card.title());
                        });

                    }).fail(function () {
                        console.log("Error loading user data");
                    });
                }


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




/**
 *
 *  MD5 (Message-Digest Algorithm)
 *  http://www.webtoolkit.info/
 *
 **/

var MD5 = function (string) {

    function RotateLeft(lValue, iShiftBits) {
        return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
    }

    function AddUnsigned(lX,lY) {
        var lX4,lY4,lX8,lY8,lResult;
        lX8 = (lX & 0x80000000);
        lY8 = (lY & 0x80000000);
        lX4 = (lX & 0x40000000);
        lY4 = (lY & 0x40000000);
        lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
        if (lX4 & lY4) {
            return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
        }
        if (lX4 | lY4) {
            if (lResult & 0x40000000) {
                return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
            } else {
                return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
            }
        } else {
            return (lResult ^ lX8 ^ lY8);
        }
    }

    function F(x,y,z) { return (x & y) | ((~x) & z); }
    function G(x,y,z) { return (x & z) | (y & (~z)); }
    function H(x,y,z) { return (x ^ y ^ z); }
    function I(x,y,z) { return (y ^ (x | (~z))); }

    function FF(a,b,c,d,x,s,ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    };

    function GG(a,b,c,d,x,s,ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    };

    function HH(a,b,c,d,x,s,ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    };

    function II(a,b,c,d,x,s,ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    };

    function ConvertToWordArray(string) {
        var lWordCount;
        var lMessageLength = string.length;
        var lNumberOfWords_temp1=lMessageLength + 8;
        var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
        var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
        var lWordArray=Array(lNumberOfWords-1);
        var lBytePosition = 0;
        var lByteCount = 0;
        while ( lByteCount < lMessageLength ) {
            lWordCount = (lByteCount-(lByteCount % 4))/4;
            lBytePosition = (lByteCount % 4)*8;
            lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition));
            lByteCount++;
        }
        lWordCount = (lByteCount-(lByteCount % 4))/4;
        lBytePosition = (lByteCount % 4)*8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
        lWordArray[lNumberOfWords-2] = lMessageLength<<3;
        lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
        return lWordArray;
    };

    function WordToHex(lValue) {
        var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
        for (lCount = 0;lCount<=3;lCount++) {
            lByte = (lValue>>>(lCount*8)) & 255;
            WordToHexValue_temp = "0" + lByte.toString(16);
            WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
        }
        return WordToHexValue;
    };

    function Utf8Encode(string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    };

    var x=Array();
    var k,AA,BB,CC,DD,a,b,c,d;
    var S11=7, S12=12, S13=17, S14=22;
    var S21=5, S22=9 , S23=14, S24=20;
    var S31=4, S32=11, S33=16, S34=23;
    var S41=6, S42=10, S43=15, S44=21;

    string = Utf8Encode(string);

    x = ConvertToWordArray(string);

    a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;

    for (k=0;k<x.length;k+=16) {
        AA=a; BB=b; CC=c; DD=d;
        a=FF(a,b,c,d,x[k+0], S11,0xD76AA478);
        d=FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
        c=FF(c,d,a,b,x[k+2], S13,0x242070DB);
        b=FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
        a=FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
        d=FF(d,a,b,c,x[k+5], S12,0x4787C62A);
        c=FF(c,d,a,b,x[k+6], S13,0xA8304613);
        b=FF(b,c,d,a,x[k+7], S14,0xFD469501);
        a=FF(a,b,c,d,x[k+8], S11,0x698098D8);
        d=FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
        c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
        b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
        a=FF(a,b,c,d,x[k+12],S11,0x6B901122);
        d=FF(d,a,b,c,x[k+13],S12,0xFD987193);
        c=FF(c,d,a,b,x[k+14],S13,0xA679438E);
        b=FF(b,c,d,a,x[k+15],S14,0x49B40821);
        a=GG(a,b,c,d,x[k+1], S21,0xF61E2562);
        d=GG(d,a,b,c,x[k+6], S22,0xC040B340);
        c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);
        b=GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
        a=GG(a,b,c,d,x[k+5], S21,0xD62F105D);
        d=GG(d,a,b,c,x[k+10],S22,0x2441453);
        c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
        b=GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
        a=GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
        d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);
        c=GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
        b=GG(b,c,d,a,x[k+8], S24,0x455A14ED);
        a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
        d=GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
        c=GG(c,d,a,b,x[k+7], S23,0x676F02D9);
        b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
        a=HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
        d=HH(d,a,b,c,x[k+8], S32,0x8771F681);
        c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
        b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
        a=HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
        d=HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
        c=HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
        b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
        a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
        d=HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
        c=HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
        b=HH(b,c,d,a,x[k+6], S34,0x4881D05);
        a=HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
        d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
        c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
        b=HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
        a=II(a,b,c,d,x[k+0], S41,0xF4292244);
        d=II(d,a,b,c,x[k+7], S42,0x432AFF97);
        c=II(c,d,a,b,x[k+14],S43,0xAB9423A7);
        b=II(b,c,d,a,x[k+5], S44,0xFC93A039);
        a=II(a,b,c,d,x[k+12],S41,0x655B59C3);
        d=II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
        c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
        b=II(b,c,d,a,x[k+1], S44,0x85845DD1);
        a=II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
        d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
        c=II(c,d,a,b,x[k+6], S43,0xA3014314);
        b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);
        a=II(a,b,c,d,x[k+4], S41,0xF7537E82);
        d=II(d,a,b,c,x[k+11],S42,0xBD3AF235);
        c=II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
        b=II(b,c,d,a,x[k+9], S44,0xEB86D391);
        a=AddUnsigned(a,AA);
        b=AddUnsigned(b,BB);
        c=AddUnsigned(c,CC);
        d=AddUnsigned(d,DD);
    }

    var temp = WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);

    return temp.toLowerCase();
}

