var assign    = require('object-assign'),
    through2  = require('through2'),
    objectify = require('through2-objectify'),
    filter    = require('through2-filter'),
    pipeline  = require('stream-combiner2'),
    split     = require('split2'),
    uuid      = require('uuid').v4,
    Promise   = require('promise-polyfill')

module.exports = function argosyService () {
    var sequence    = 0,
        outstanding = [],
        input       = split(),
        parse       = objectify(function (chunk, enc, cb) { cb(null, JSON.parse(chunk)) }),
        output      = objectify.deobj(function (msg, enc, cb) { cb(null, JSON.stringify(msg) + '\n') }),
        responses   = filter.obj(function (msg) {
            return (msg.type === 'response' && msg.headers.client.id === client.id)
        })

    var processMessage = through2.obj(function parse(msg, enc, cb) {
        outstanding.filter(function (pending) {
            return pending.seq === msg.headers.client.seq
        }).forEach(function (pending) {
            if (msg.error) pending.reject(assign(new Error(msg.error.message), { remoteStack: msg.error.stack }))
            else pending.resolve(msg.body)
        })
        cb()
    })

    var client = pipeline(input, parse, responses, processMessage, output)
    client.id = uuid()
    client.invoke = function invoke (msgBody, cb) {
        var request = { type: 'request', headers: { client: { id: client.id, seq: sequence++ } }, body: msgBody },
            cb      = cb || function () {}

        var done = new Promise(function (resolve, reject) {
            outstanding.push({ seq: request.headers.client.seq, resolve: resolve, reject: reject })
            output.write(request)
        })
        done.then(function (body) {
            setImmediate(cb.bind(undefined, null, body))
        })
        done.catch(function (err) {
            setImmediate(cb.bind(undefined, err))
        })
        return done
    }
    client.invoke.partial = function invokePartial (partialBody) {
        return function partialInvoke (msgBody, cb) {
            return client.invoke(assign({}, partialBody, msgBody), cb)
        }
    }

    return client
}
