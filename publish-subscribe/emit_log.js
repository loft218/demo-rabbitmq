/**
 * Emit logs
 */

const amqp = require('amqplib/callback_api')

const config = require('../config')

amqp.connect(config.rabbitmq_server, (err, conn) => {
    conn.createChannel((err, ch) => {
        if (err) return console.error(err)
        const ex = 'logs'
        // 声明1个Exchange，类型为 fanout(分发)
        ch.assertExchange(ex, 'fanout', { durable: false })

        setInterval(() => {
            let msg = ex + ':' + Math.random().toString(32).substr(2)
            // 第二个参数参数为空，表示不发送到指定队列，仅发送到指定exchange
            ch.publish(ex, '', new Buffer(msg))
            console.log('[x] sent', msg)
        }, 500)

    })

    setTimeout(() => {
        conn.close()
        process.exit(0)
    }, 5000)
})