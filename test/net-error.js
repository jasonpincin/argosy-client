var net           = require('net'),
    test          = require('tape'),
    argosyClient  = require('..'),
    argosyService = require('argosy-service'),
    match         = require('argosy-pattern/match')

var service = argosyService()
var client = argosyClient()
client.pipe(service).pipe(client)

service.message({ make: 'error' }).process(function (msg, cb) {
    cb(new Error('It broke'))
})
service.message({ make: 'nestedError' }).process(function (msg, cb) {
    client.invoke({ make: 'error' }, cb)
})

var server = net.createServer(function (c) {
    c.pipe(service).pipe(c)
})

test('start server', function (t) {
    server.listen(0, t.end.bind(t))
})

test('remote socket service generating errors error', function (t) {
    t.plan(2)
    t.timeoutAfter(2000)

    var client = argosyClient()
    var socket = net.createConnection(server.address(), function () {
        client.pipe(socket).pipe(client)

        client.invoke({ make: 'error' }).catch(function (err) {
            t.ok(err.message && err.stack, 'should result in error for invoke')
            t.ok(err.remoteStack, 'should include remoteStack')
            setTimeout(socket.end.bind(socket), 200)
        })
    })
})

test('remote socket service (nested) generating errors error', function (t) {
    t.plan(2)
    t.timeoutAfter(2000)

    var client = argosyClient()
    var socket = net.createConnection(server.address(), function () {
        client.pipe(socket).pipe(client)

        client.invoke({ make: 'nestedError' }).catch(function (err) {
            t.ok(err.message && err.stack, 'should result in error for invoke')
            t.ok(err.remoteStack, 'should include remoteStack')
            setTimeout(socket.end.bind(socket), 200)
        })
    })
})

test('stop server', function (t) {
    server.close(t.end.bind(t))
})
