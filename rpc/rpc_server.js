/**
 * RPC Server
 */

const amqp = require('amqplib/callback_api')

const config = require('../config')

amqp.connect(config.rabbitmq_server, (err, conn) => {
    conn.createChannel((err, ch) => {
        const q = 'rpc_queue'

        ch.assertQueue(q, { durable: false, autoDelete: true })
        ch.prefetch(1)

        console.log('[x]Awaiting RPC requests')
        ch.consume(q, msg => {
            const n = parseInt(msg.content.toString())
            console.log(" [.] fib(%d)", n)
            const r = fibonacci(n)

            ch.sendToQueue(msg.properties.replyTo, new Buffer(r.toString()), {
                correlationId: msg.properties.correlationId
            })
            ch.ack(msg)
        })
    })
})

function fibonacci(n) {
    if (n == 0 || n == 1)
        return n
    else
        return fibonacci(n - 1) + fibonacci(n - 2)
}