import { Router } from 'express';
import { authenticate, checkOrganizationAccess, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import paymentService from '../services/payment.service';

const router = Router();

router.use(authenticate);

/**
 * Initiate payment receipt from merchant
 * POST /api/payments/receive
 */
router.post('/receive', checkOrganizationAccess, asyncHandler(async (req: AuthRequest, res) => {
  const result = await paymentService.receivePayment(
    req.body,
    req.organizationId!
  );

  res.status(201).json(result);
}));

/**
 * Pay invoice
 * POST /api/payments/payout
 */
router.post('/payout', checkOrganizationAccess, asyncHandler(async (req: AuthRequest, res) => {
  const { invoiceId, ...payoutData } = req.body;

  const result = await paymentService.payInvoice(
    invoiceId,
    payoutData,
    req.organizationId!
  );

  res.status(201).json(result);
}));

/**
 * Get payment status
 * GET /api/payments/:id/status
 */
router.get('/:id/status', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const status = await paymentService.getPaymentStatus(req.params.id);

  res.json(status);
}));

/**
 * Get account balance
 * GET /api/payments/balance?organizationId=xxx
 */
router.get('/balance', checkOrganizationAccess, asyncHandler(async (req: AuthRequest, res) => {
  const balance = await paymentService.getAccountBalance(req.organizationId!);

  res.json(balance);
}));

export default router;
