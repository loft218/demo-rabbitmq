/**
 * Worker
 */

const amqp = require('amqplib/callback_api')

const config = require('../config')

amqp.connect(config.rabbitmq_server, (err, conn) => {
    conn.createChannel((err, ch) => {
        const q = 'task_queue'

        ch.assertQueue(q, { autoDelete: true })
        /**
         * prefetch: 预取消息数
         * 设置为1表示，处理1条取1条
         * 
         * rabbit默认会对所有的consumer平均轮询分配
         * 当有的task比较耗时，有的又比较轻快，会导致不同的consumer有的忙，有的闲
         * 所以可以根据consumer的处理能力，设置prefetch数量
         * 这样可以多个consumer更公平地分摊任务
         */
        ch.prefetch(1)

        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q)
        ch.consume(q, (msg) => {
            const secs = msg.content.toString().split('.').length - 1
            console.log(" [x] Received %s", msg.content.toString())

            setTimeout(() => {
                console.log(" [x] Done", msg.content.toString())
                // 发送确认
                ch.ack(msg)
            }, secs * 1000)
        }, { noAck: false })
    })
})
