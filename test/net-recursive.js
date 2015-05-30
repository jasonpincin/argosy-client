var net           = require('net'),
    test          = require('tape'),
    argosyClient  = require('..'),
    argosyService = require('argosy-service'),
    match         = require('argosy-pattern/match')

var service = argosyService()
var client = argosyClient()
client.pipe(service).pipe(client)

service.message({ square: match.number }).process(function (msg, cb) {
    client.invoke({ multiply: [msg.square, msg.square] }, cb)
})
service.message({ multiply: match.array }).process(function (msg, cb) {
    cb(null, msg.multiply.reduce(function (a, b) {
        return a * b
    }))
})

var server = net.createServer(function (c) {
    c.pipe(service).pipe(c)
})

test('start server', function (t) {
    server.listen(0, t.end.bind(t))
})

test('invoke square over net with sub-invocations', function (t) {
    t.plan(1)
    t.timeoutAfter(2000)

    var client = argosyClient()
    var socket = net.createConnection(server.address(), function () {
        client.pipe(socket).pipe(client)

        client.invoke({ square: 4 }).then(function (result) {
            t.equals(result, 16, 'tells us square of 4 is 16')
            setTimeout(socket.end.bind(socket), 200)
        }).catch(t.error.bind(t))
    })
})

test('stop server', function (t) {
    server.close(t.end.bind(t))
})
