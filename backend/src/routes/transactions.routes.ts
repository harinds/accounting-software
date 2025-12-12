import { Router } from 'express';
import { authenticate, checkOrganizationAccess, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import transactionService from '../services/transaction.service';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * Get all transactions
 * GET /api/transactions?organizationId=xxx&startDate=xxx&endDate=xxx
 */
router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const { organizationId, startDate, endDate, category, status, limit, offset } = req.query;

  const result = await transactionService.getTransactions(
    organizationId as string,
    {
      startDate: startDate as string,
      endDate: endDate as string,
      category: category as string,
      status: status as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined
    }
  );

  res.json(result);
}));

/**
 * Get transaction by ID
 * GET /api/transactions/:id
 */
router.get('/:id', checkOrganizationAccess, asyncHandler(async (req: AuthRequest, res) => {
  const transaction = await transactionService.getTransactionById(
    req.params.id,
    req.organizationId!
  );

  res.json(transaction);
}));

/**
 * Create new transaction
 * POST /api/transactions
 */
router.post('/', checkOrganizationAccess, asyncHandler(async (req: AuthRequest, res) => {
  const transaction = await transactionService.createTransaction(
    req.organizationId!,
    req.body,
    req.user!.id
  );

  res.status(201).json(transaction);
}));

/**
 * Update transaction
 * PUT /api/transactions/:id
 */
router.put('/:id', checkOrganizationAccess, asyncHandler(async (req: AuthRequest, res) => {
  const transaction = await transactionService.updateTransaction(
    req.params.id,
    req.organizationId!,
    req.body,
    req.user!.id
  );

  res.json(transaction);
}));

/**
 * Delete transaction
 * DELETE /api/transactions/:id
 */
router.delete('/:id', checkOrganizationAccess, asyncHandler(async (req: AuthRequest, res) => {
  await transactionService.deleteTransaction(
    req.params.id,
    req.organizationId!,
    req.user!.id
  );

  res.json({ message: 'Transaction deleted successfully' });
}));

/**
 * Bulk import transactions
 * POST /api/transactions/bulk-import
 */
router.post('/bulk-import', checkOrganizationAccess, asyncHandler(async (req: AuthRequest, res) => {
  const result = await transactionService.bulkImport(
    req.organizationId!,
    req.body.transactions,
    req.user!.id
  );

  res.status(201).json(result);
}));

/**
 * Reconcile transaction
 * POST /api/transactions/:id/reconcile
 */
router.post('/:id/reconcile', checkOrganizationAccess, asyncHandler(async (req: AuthRequest, res) => {
  const transaction = await transactionService.reconcileTransaction(
    req.params.id,
    req.organizationId!,
    req.user!.id
  );

  res.json(transaction);
}));

export default router;
