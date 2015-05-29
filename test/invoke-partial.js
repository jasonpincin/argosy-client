var test          = require('tape'),
    argosyClient  = require('..'),
    argosyService = require('argosy-service'),
    match         = require('argosy-pattern/match')

var service = argosyService()
service.message({ get: 'random-number', min: match.number, max: match.number }).process(function (msg, cb) {
    console.log('GOT HERE')
    cb(null, parseInt(msg.min + Math.random(msg.max - msg.min)))
})

test('invoke-partial', function (t) {
    t.plan(3)

    var client = argosyClient()
    client.pipe(service).pipe(client)

    var random = client.invoke.partial({ get: 'random-number' })
    t.equal(typeof random, 'function', 'should return a function')

    random({ min: 1, max: 10 }, function (err, result) {
        t.false(err, 'function when called should not produce error')
        t.ok(result >= 1 && result <= 10, 'function should produce result between 1 and 10: ' + result)
    })
})
