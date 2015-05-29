var test          = require('tape'),
    argosyClient  = require('..'),
    argosyService = require('argosy-service'),
    match         = require('argosy-pattern/match'),
    through2      = require('through2')

var service = argosyService()
service.message({ get: 'random-number', min: match.number, max: match.number }).process(function (msg, cb) {
    cb(null, parseInt(msg.min + (Math.random(msg.max - msg.min) * (msg.max - msg.min + 1) )))
})
service.message({ make: 'error' }).process(function (msg, cb) {
    cb(new Error('It broke'))
})

test('invoke', function (t) {
    t.plan(6)

    var client = argosyClient()
    client.pipe(service).pipe(client)

    client.invoke({ get: 'random-number', min: 1, max: 10 }, function (err, result) {
        t.false(err, 'function when called should not produce error')
        t.ok(result >= 1 && result <= 10, 'function should produce result between 1 and 10: ' + result)
    })

    client.invoke({ make: 'error' }, function (err) {
        t.true(err, 'on error supplies cb error')
        t.ok(err.remoteStack, 'error object has a remote stack')
    })

    client.invoke({ get: 'random-number', min: 1, max: 10 }).then(function (result) {
        t.ok(result >= 1 && result <= 10, 'returns and resolves promises')
    })

    client.invoke({ make: 'error' }).catch(function (err) {
        t.true(err, 'returns and rejects promise on error')
    })
})
