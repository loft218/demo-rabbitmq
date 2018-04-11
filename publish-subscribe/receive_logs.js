/**
 * Receive logs
 */

const amqp = require('amqplib/callback_api')

const config = require('../config')

amqp.connect(config.rabbitmq_server, (err, conn) => {
    conn.createChannel((err, ch) => {
        const ex = 'logs'
        ch.assertExchange(ex, 'fanout', { durable: false })

        /**
         * 声明Queue
         * 不指定队列名，由rabbit随机分配
         * exclusive
         *   true: 把该队列作用到当前conn，如果disconnect，则销毁该队列
         *   false(defalut):
         */
        ch.assertQueue('', { exclusive: true }, (err, q) => {
            /**
             * 声明一个routing从Exchange到Queue
             * 即绑定指定Queue和Exchange
             */
            ch.bindQueue(q.queue, ex)

            console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q.queue)

            ch.consume(q.queue, msg => {
                console.log(" [x] %s", msg.content.toString())
            }, { noAck: true })
        })
    })
})

console.log('cosume')