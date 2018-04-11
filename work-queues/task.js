/**
 * Task
 */

const amqp = require('amqplib/callback_api')

const config = require('../config')

amqp.connect(config.rabbitmq_server, (err, conn) => {
    conn.createChannel((err, ch) => {
        const q = 'task_queue'

        // 这里申明队列没有设置durable（持久化），默认为true
        ch.assertQueue(q, { autoDelete: true })

        let i = 0
        setInterval(() => {
            if (i >= 10) i = 0
            ++i
            let msg = process.argv.slice(2).join(' ') || "message"
            msg += '-' + i
            if (i % 2 === 0) msg = "**" + msg + '.'.repeat(i)

            /**
             * persistent=true，标识让rabbit把消息写硬盘
             * 但这并不确保消息一定不会丢失，当数据尚未写入硬盘前仍然有一小段时间
             * 通常persistent已经足够强壮，但是如果需要更强壮的机制，可以使用publisher confirms，参加：
             * https://www.rabbitmq.com/confirms.html
             */
            ch.sendToQueue(q, new Buffer(msg), { persistent: true })
            console.log(" [x] Sent '%s'", msg);
        }, 1000)
    })

    // setTimeout(function () { conn.close(); process.exit(0) }, 500)
})
