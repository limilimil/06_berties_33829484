// Create a new router
const express = require('express');
const router = express.Router();

const request = require('request');

router.get('/', function(req, res, next) {
    let apiKey = process.env.API_KEY;
    let city = 'london';
    let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
           
    request(url, function (err, response, body) {
        if(err) {
            next(err);
        } else {
            var weather = JSON.parse(body)
            var wmsg = 'It is '+ weather.main.temp + 
                ' degrees in '+ weather.name +
                '! <br> The humidity now is: ' + 
                weather.main.humidity;
            res.send (wmsg);
        }
    });
});

// Export the router object so index.js can access it
module.exports = router;