/**
 * producer
 * 
 * We'll call our message publisher (sender) send.js and our message consumer (receiver) receive.js. 
 * The publisher will connect to RabbitMQ, send a single message, then exit.
 */

// see: http://www.squaremobius.net/amqp.node/channel_api.html
const amqp = require('amqplib/callback_api')

const config = require('../config')

// 连接 rabbitmq server
console.log('connect rabbitmq server...')
amqp.connect(config.rabbitmq_server, (err, conn) => {
    if (err) return console.error(err)

    console.log('create channel...')
    // 创建通道
    conn.createChannel((err, ch) => {
        // 队列名称
        const q = 'hello'
        /**
         * 断言队列是存在的
         * durable: 消息是否持久化，默认true
         * autoDelete: 当最后一个消费者断开连接时自动删除队列，默认false
         * see: http://www.squaremobius.net/amqp.node/channel_api.html#channel_assertQueue
         */
        ch.assertQueue(q, { durable: false, autoDelete: true })

        // 发送消息到指定队列
        ch.sendToQueue(q, new Buffer('Hello RabbitMQ!'))
        console.log('[x] Sent "Hello RabbitMQ!"')
    })

    setTimeout(() => {
        conn.close()
        process.exit(0)
    }, 5000)
})