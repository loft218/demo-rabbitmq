/**
 * Emit logs
 */

const amqp = require('amqplib/callback_api')

const config = require('../config')

const args = process.argv.slice(2);

amqp.connect(config.rabbitmq_server, (err, conn) => {
    conn.createChannel((err, ch) => {
        if (err) return console.error(err)
        const ex = 'direct_logs'
        /**
         * 声明1个Exchange，类型为 direct
         *   direct: 指定路由
         */
        ch.assertExchange(ex, 'direct', { durable: false })

        const severity = (args.length > 0) ? args[0] : 'info';
        const msg = ex + ': [' + severity + '] ' + Math.random().toString(32).substr(2)
        // 发送到指定的路由 severity
        ch.publish(ex, severity, new Buffer(msg))
        console.log('[x] sent', msg)
    })

    setTimeout(() => {
        conn.close()
        process.exit(0)
    }, 5000)
})