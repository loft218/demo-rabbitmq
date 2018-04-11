/**
 * Receive logs
 */

const amqp = require('amqplib/callback_api')

const config = require('../config')

const args = process.argv.slice(2);

if (args.length == 0) {
    console.log("Usage: receive_logs.js [info] [warning] [error]");
    process.exit(1);
}

amqp.connect(config.rabbitmq_server, (err, conn) => {
    conn.createChannel((err, ch) => {
        const ex = 'direct_logs'
        ch.assertExchange(ex, 'direct', { durable: false })

        /**
         * 声明Queue          
         * exclusive
         *   true: 把该队列作用到当前conn，如果disconnect，则销毁该队列
         *   false(defalut):
         */
        ch.assertQueue('', { exclusive: true }, (err, q) => {

            /**
             * 根据传入的参数，绑定多个路由
             */
            args.forEach(severity => {
                ch.bindQueue(q.queue, ex, severity)
            })

            console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q.queue)

            ch.consume(q.queue, msg => {
                console.log(" [x] %s: '%s'", msg.fields.routingKey, msg.content.toString());
            }, { noAck: true })
        })
    })
})