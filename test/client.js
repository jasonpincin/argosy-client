var test          = require('tape'),
    argosyClient  = require('..')

test('client', function (t) {
    var client = argosyClient()
    t.ok(client.pipe, 'should be a stream')
    t.equal(typeof client.invoke, 'function', 'should expose an invoke function')
    t.equal(typeof client.invoke.partial, 'function', 'should expose an invoke.partial function')

    t.end()
})
