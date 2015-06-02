# argosy-client

[![NPM version](https://badge.fury.io/js/argosy-client.png)](http://badge.fury.io/js/argosy-client)
[![Build Status](https://travis-ci.org/jasonpincin/argosy-client.svg?branch=master)](https://travis-ci.org/jasonpincin/argosy-client)
[![Coverage Status](https://coveralls.io/repos/jasonpincin/argosy-client/badge.png?branch=master)](https://coveralls.io/r/jasonpincin/argosy-client?branch=master)
[![Davis Dependency Status](https://david-dm.org/jasonpincin/argosy-client.png)](https://david-dm.org/jasonpincin/argosy-client)

Consume micro-services.

## example

```javascript
var http    = require('http'),
    query   = require('querystring'),
    service = require('argosy-service')(),
    match   = require('argosy-pattern/match'),
    client  = require('argosy-client')()

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
```

## api

```javascript
var argosyClient = require('argosy-client')
```

### client = argosyClient()

Create a new client object. The `client` object is a stream intended to be connected (piped) to Argosy services
through any number of intermediary streams.

### client.invoke(msg [, cb])

Invoke a service which implements the `msg` [pattern](https://github.com/jasonpincin/argosy-pattern#argosy-pattern). Upon 
completion, the callback `cb`, if supplied, will be called with the result or error. The `client.invoke` function also 
returns a promise which will resolve or reject appropriately. 

### client.invoke.partial(partialMsg)

Return a function that represents a partial invocation. The function returned has the same signature as `client.invoke`, but 
when called, the `msg` parameter will be merged with the `partialMsg` parameter provided at the time the function was created. 
Otherwise, the generated function behaves identically to `client.invoke`.

## testing

`npm test [--dot | --spec] [--grep=pattern]`

Specifying `--dot` or `--spec` will change the output from the default TAP style. 
Specifying `--grep` will only run the test files that match the given pattern.

## coverage

`npm run coverage [--html]`

This will output a textual coverage report. Including `--html` will also open 
an HTML coverage report in the default browser.
