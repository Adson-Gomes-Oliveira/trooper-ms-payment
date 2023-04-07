const { Invoices } = require('../database/models');
const sendPaymentToInvoice = require('./sendPaymentToInvoice.producer.service');

const createInvoiceDefault = async () => {
  const response = await Invoices.create({
    name: '',
    cpf: '',
    buyerAddress: {},
    productsOrdered: [],
  });

  return response;
};

const updateInvoice = async (id, payload) => {
  const response = await Invoices.update(
    { ...payload.messageContent },
    { where: { id } },
  );

  const invoiceUpdated = await Invoices.findByPk(id);

  if (
    !Object.values(invoiceUpdated.dataValues).includes('')
    && invoiceUpdated.dataValues.productsOrdered.length > 0
    && Object.keys(invoiceUpdated.dataValues.buyerAddress).length > 0
  ) {
    sendPaymentToInvoice('invoiceDelivery', invoiceUpdated.dataValues);
  }

  return response;
};

module.exports = {
  createInvoiceDefault,
  updateInvoice,
};
