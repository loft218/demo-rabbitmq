/**
 * consumer
 */

const amqp = require('amqplib/callback_api')

const config = require('../config')

amqp.connect(config.rabbitmq_server, (err, conn) => {
    conn.createChannel((err, ch) => {
        const q = 'hello'
        // 队列属性需要和sender申明的一致
        ch.assertQueue(q, { durable: false, autoDelete: true })

        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q)

        /**
         * 处理消息
         * noAck
         *   true: 不期望得到确认
         *   false: 默认  
         */
        ch.consume(q, (msg) => {
            console.log(" [x] Received %s", msg.content.toString());
        }, { noAck: true })
    })
})