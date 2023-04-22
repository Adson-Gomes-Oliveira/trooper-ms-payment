const amqplib = require('amqplib');
const PaymentsServices = require('./payments.service');
const sendPaymentToInvoice = require('./sendPaymentToInvoice.producer.service');
require('dotenv').config();

const RABBIT_MQ_CONNECT = process.env.RABBIT_STRING || 'amqp://guest:guest@rabbit-ms-gateway:5672';

const createPaymentByOrder = async (queue, exchange) => {
  const connectionMQ = await amqplib.connect(RABBIT_MQ_CONNECT);
  const consumerChannel = await connectionMQ.createChannel();
  await consumerChannel.assertExchange(exchange, 'fanout', { durable: true });
  await consumerChannel.assertQueue(queue, { durable: true });
  await consumerChannel.bindQueue(queue, exchange, '');

  await consumerChannel.consume(queue, async (msg) => {
    const msgContent = msg.content.toString();
    const actualMessage = JSON.parse(msgContent);

    if (actualMessage) {
      const payment = await PaymentsServices.create(actualMessage.paymentData);
      sendPaymentToInvoice('invoiceCreation', {
        messageContent: {
          paymentId: payment.id,
        },
        invoiceId: actualMessage.invoiceId,
      });
      consumerChannel.ack(msg);
    }
  });
};

module.exports = createPaymentByOrder;
