// Create a new router
const express = require('express');
const router = express.Router();

const request = require('request');


// Returns a description of the wind speed based on the Beaufort scale
function beaufortWindDescription(speed) {
    if (speed === undefined || speed === null) return "Unknown";
    if (speed < 0.3) return "Calm";
    if (speed < 1.6) return "Light air";
    if (speed < 3.4) return "Light breeze";
    if (speed < 5.5) return "Gentle breeze";
    if (speed < 8.0) return "Moderate breeze";
    if (speed < 10.8) return "Fresh breeze";
    if (speed < 13.9) return "Strong breeze";
    if (speed < 17.2) return "Near gale";
    if (speed < 20.8) return "Gale";
    if (speed < 24.5) return "Severe gale";
    if (speed < 28.5) return "Storm";
    if (speed < 32.7) return "Violent storm";
    return "Hurricane";
}

router.get('/', function(req, res, next) {
    let apiKey = process.env.API_KEY;
    let city = req.query.city ? req.query.city : "London";
    let url = `http://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;

    request(url, function (err, response, body) {
        // Network request error
        if (err) {
            console.error("Weather request error:", err);
            // render page with a friendly error
            return res.status(502).render('weather.ejs', { weather: null, error: 'Unable to reach weather service. Please try again later.' });
        }

        // Try to parse JSON safely
        let result;
        try {
            result = JSON.parse(body);
        } catch (parseErr) {
            console.error("Invalid JSON from weather service:", parseErr, "body:", body);
            return res.status(502).render('weather.ejs', { weather: null, error: 'Invalid response from weather service.' });
        }

        // Check API level errors (OpenWeather returns code abd message when something went wrong)
        // Normalise to number as result.cod may be number or string
        const codNum = result && result.cod ? Number(result.cod) : (result && result.name ? 200 : 0);

        if (codNum !== 200 && !result.name) {
            const msg = result && result.message ? result.message : 'No data found';
            console.warn("Weather API returned an error:", result);
            return res.status(404).render('weather.ejs', { weather: null, error: `No data found for "${city}". (${msg})` });
        }

        // Weather object using optional chaining and defaults
        const weather = {
            name: result.name || city,
            country: result.sys?.country || '',
            description: result.weather?.[0]?.description || ' ',
            icon: result.weather?.[0]?.icon ? `https://openweathermap.org/img/wn/${result.weather[0].icon}@2x.png` : null,
            temp: result.main?.temp,
            feelsLike: result.main?.feels_like,
            windSpeed: beaufortWindDescription(result.wind?.speed),
            humidity: result.main?.humidity,
            visibility: result.visibility,
        };

        // Render weather page with api results
        res.render('weather.ejs', { weather, error: null });
    });
});


// Export the router object so index.js can access it
module.exports = router;
