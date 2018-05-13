const http = require('http');

const apiUrl = '8e7c7e09.ngrok.io';

function getTrivia(callback) {
    const options = {
        host: 'ec2-54-226-217-184.compute-1.amazonaws.com',
        port: 3000,
        path: '/api'
    };
    http.get(options, (res) => {
        // Continuously update stream with data
        let body = '';
        res.on('data', function(d) {
            body += d;
        });
        res.on('end', function() {
            // Data reception is done, do whatever with it!
            const parsed = JSON.parse(body);
            const message = JSON.stringify(parsed.message);
            console.log('===== message : ' + message);
            callback(message);
        }).on('error', (e) => {
            console.log('\nError at get request: ' + e);
            callback('Couldn\'t connect to the trivia server. Please try again.')
        });
    });
}

function sendStartTrainingSignal(callback) {
    const options = {
        host: apiUrl,
        port: 80,
        path: '/dwayne_alexa/start'
    };
    console.log('Making the request', options);
    http.get(options, (res) => {
        // Continuously update stream with data
        res.on('data', function(data) {
            console.log(data)
        });
        res.on('end', function() {
            // Data reception is done, do whatever with it
            console.log('Request END!');
            callback();
        }).on('error', (e) => {
            console.log('\nError at get request: ' + e);
            callback('Couldn\'t connect to the trivia server. Please try again.')
        });
    });
}

function getStatistics(callback) {
    const options = {
        host: apiUrl,
        port: 80,
        path: '/dwayne_alexa/stats'
    };
    console.log('Making the request', options);
    http.get(options, (res) => {
        // Continuously update stream with data
        let body = '';
        res.on('data', function(d) {
            body += d;
        });
        res.on('end', function() {
            const parsed = JSON.parse(body);
            console.log(parsed);
            // const message = JSON.stringify(parsed.message);
            // console.log('===== message : ' + message);
            callback(parsed);
        }).on('error', (e) => {
            console.log('\nError at get request: ' + e);
            callback('Couldn\'t connect to the trivia server. Please try again.')
        });
    });
}

module.exports = {
    getTrivia,
    sendStartTrainingSignal,
    getStatistics
};