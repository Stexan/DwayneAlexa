'use strict';

//const apiUrl = 'http://8e7c7e09.ngrok.io/';
const apiUrl = 'http://localhost:5000/';

$(function() {
    setInterval(function() {
        getState(function(data) {
            $('#position-image').attr('src', 'assets/images/pos_' + data.position + '.png');

            if (data.state !== true) {
                $('#state').html(data.state);
            }
        });
    }, 300);
});

function getState(callback) {
    $.ajax
     ({
         type   : 'GET',
         url    : apiUrl + 'dwayne_alexa/check',
         success: function(data) {
             console.log('data: ', data);
             console.log(typeof data);
             callback(data);
         },
         error  : function(err) {
             console.log(err)
         }
     });
}
