/**
 * RPC Client
 */

const amqp = require('amqplib/callback_api')
const config = require('../config')

const args = process.argv.slice(2)
if (args.length == 0) {
    console.log("Usage: rpc_client.js num")
    process.exit(1)
}

amqp.connect(config.rabbitmq_server, (err, conn) => {
    conn.createChannel((err, ch) => {
        ch.assertQueue('', { exclusive: true }, (err, q) => {
            const corr = Math.random().toString().substr(2) + Math.random().toString().substr(2) + Math.random().toString().substr(2)
            const num = parseInt(args[0])

            //用1个exclusive队列来接收回调
            ch.consume(q.queue, msg => {
                if (msg.properties.correlationId == corr) { //判断是否是同一次请求
                    console.log(' [.] Got %s', msg.content.toString())
                    setTimeout(() => {
                        conn.close()
                        process.exit(0)
                    }, 500)
                }
            }, { noAck: true })

            ch.sendToQueue('rpc_queue', new Buffer(num.toString()), {
                replyTo: q.queue, //指定callback的queue
                correlationId: corr //每次请求的唯一标识
            })
        })
    })
})