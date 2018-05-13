'use strict';

// const apiUrl     = 'http://8e7c7e09.ngrok.io/';
const apiUrl     = 'http://localhost:5000/';
let started      = false;
let currentState = true;

$(function() {
    setInterval(function() {
        getState(function(data) {
            if (!data && started) {
                // Exercise finished
                showResults();
                return;
            }

            if (!started && data) {
                started = true;
                $('#rock-card').hide();
                $('#workout-card').show();
                return;
            }
            $('#position-image').attr('src', 'assets/images/pos_' + data.position + '.jpg');

            if (data.state !== currentState) {
                console.log('State different, current state: ', currentState);
                changeState(data.state);
            }
        });
    }, 100);
});

function showResults() {
    // getStats(function(data) {
    //     var performance = getPerformance(data.squats);
    //
    //     $('#correct-squats').html(performance.nrOfGoodSquats);
    //     $('#grade').html(performance.grade);

    $('#exercising-card').hide();
    $('#rock-image').attr('src', 'assets/images/Final.png');
    $('#rock-card').show();
    // });
}

function getPerformance(squatsArray) {
    let performance = {
        grade         : '', // perfect, good, average, bad or shit
        nrOfGoodSquats: 0
    };

    performance.nrOfGoodSquats = squatsArray.filter(item => item === true).length;

    if (performance.nrOfGoodSquats === 13) {
        performance.grade = 'perfect';
    } else if (performance.nrOfGoodSquats > 9) {
        performance.grade = 'good';
    } else if (performance.nrOfGoodSquats > 5) {
        performance.grade = 'average';
    } else if (performance.nrOfGoodSquats > 0) {
        performance.grade = 'bad';
    } else {
        performance.grade = 'shit';
    }

    return performance;
}

function changeState(state) {
    if (!state) {
        $('#state').css("background-image", "url(/assets/images/No.png)");
    } else {
        $('#state').css("background-image", "url(/assets/images/Yeah.png)");
    }
}

function getState(callback) {
    $.ajax
     ({
         type   : 'GET',
         url    : apiUrl + 'dwayne_alexa/check',
         success: function(data) {
             console.log('data: ', data);
             callback(data);
         },
         error  : function(err) {
             console.log(err)
         }
     });
}

function getStats(callback) {
    $.ajax
     ({
         type   : 'GET',
         url    : apiUrl + 'dwayne_alexa/stats',
         success: function(data) {
             console.log('data: ', data);
             callback(data);
         },
         error  : function(err) {
             console.log(err)
         }
     });
}
