import { Payment } from './../entity/Payment';
import { getRepository } from 'typeorm';
import { DatabaseError } from '../errors/base.error';
import { PAYMENT_DB_ERROR } from '../constants/database-error-name';
async function getPayments(): Promise<Payment[]> {
  try {
    const paymentRepo = getRepository(Payment);
    return await paymentRepo.find();
  } catch (err) {
    console.log(err);
    throw new DatabaseError(PAYMENT_DB_ERROR);
  }
}

async function getPaymentFromNameAndType(name: string, type: string): Promise<Payment | undefined> {
  try {
    const paymentRepo = getRepository(Payment);
    return await paymentRepo.findOne({ where: { name, type } });
  } catch (err) {
    console.log(err);
    throw new DatabaseError(PAYMENT_DB_ERROR);
  }
}

async function createPayment(name: string, type: string): Promise<Payment> {
  try {
    const paymentRepo = getRepository(Payment);
    return await paymentRepo.save({ name, type });
  } catch (err) {
    console.log(err);
    throw new DatabaseError(PAYMENT_DB_ERROR);
  }
}

export const PaymentRepository = {
  getPayments,
  getPaymentFromNameAndType,
  createPayment,
};
