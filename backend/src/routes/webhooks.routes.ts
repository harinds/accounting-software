import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import paymentService from '../services/payment.service';
import logger from '../utils/logger';

const router = Router();

/**
 * Monoova webhook handler
 * POST /api/webhooks/monoova
 */
router.post('/monoova', asyncHandler(async (req, res) => {
  const signature = req.headers['x-monoova-signature'] as string;

  logger.info('Received Monoova webhook', { event: req.body.event });

  await paymentService.handleWebhook(req.body, signature);

  res.json({ received: true });
}));

/**
 * Basiq webhook handler
 * POST /api/webhooks/basiq
 */
router.post('/basiq', asyncHandler(async (req, res) => {
  logger.info('Received Basiq webhook', { event: req.body.event });

  // Handle Basiq webhooks (connection status, new transactions, etc.)
  const { event, data } = req.body;

  switch (event) {
    case 'connection.updated':
      logger.info('Bank connection updated', { connectionId: data.id });
      break;
    case 'transactions.added':
      logger.info('New transactions available', { count: data.count });
      break;
    default:
      logger.warn('Unknown Basiq webhook event', { event });
  }

  res.json({ received: true });
}));

/**
 * LodgeIT webhook handler
 * POST /api/webhooks/lodgeit
 */
router.post('/lodgeit', asyncHandler(async (req, res) => {
  logger.info('Received LodgeIT webhook', { event: req.body.event });

  const { event, data } = req.body;

  switch (event) {
    case 'lodgement.accepted':
      logger.info('Lodgement accepted', { lodgementId: data.id });
      break;
    case 'lodgement.rejected':
      logger.error('Lodgement rejected', { lodgementId: data.id, reason: data.reason });
      break;
    default:
      logger.warn('Unknown LodgeIT webhook event', { event });
  }

  res.json({ received: true });
}));

export default router;
