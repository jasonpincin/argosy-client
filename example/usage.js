var http    = require('http'),
    query   = require('querystring'),
    service = require('argosy-service')(),
    match   = require('argosy-pattern/match'),
    client  = require('..')()

// connect the client to the service
client.pipe(service).pipe(client)

// create a micro-service that gets weather
service.message({ get: 'weather', location: match.defined }).process(function (msg, cb) {
    var qs = query.stringify({ q: msg.location, units: msg.units || 'imperial' })
    http.get('http://api.openweathermap.org/data/2.5/weather?' + qs, function (res) {
        var body = ''
        res.on('data', function (data) {
            body += data
        }).on('end', function () {
            cb(null, JSON.parse(body).main)
        })
    })
})

// use the service with argosy-client
client.invoke({ get: 'weather', location: 'Boston,MA' }, function (err, weather) {
    console.log(weather.temp + ' degrees (F) in Boston.')
})

// or create a convenience function using invoke.partial
var getWeather = client.invoke.partial({ get: 'weather', units: 'metric' })

getWeather({ location: 'Dublin,IE' }, function (err, weather) {
    console.log(weather.temp + ' degrees (C) in Dublin.')
})

// or use promises
getWeather({ location: 'London,UK' }).then(function (weather) {
    console.log(weather.temp + ' degrees (C) in London.')
})
