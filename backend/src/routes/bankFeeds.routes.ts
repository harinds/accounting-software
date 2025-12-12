import { Router } from 'express';
import { authenticate, checkOrganizationAccess, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import bankFeedService from '../services/bankFeed.service';

const router = Router();

router.use(authenticate);

/**
 * Connect bank account
 * POST /api/bank-feeds/connect
 */
router.post('/connect', checkOrganizationAccess, asyncHandler(async (req: AuthRequest, res) => {
  const result = await bankFeedService.connectBankAccount(req.organizationId!);

  res.json(result);
}));

/**
 * Get connected bank accounts
 * GET /api/bank-feeds/accounts?organizationId=xxx
 */
router.get('/accounts', checkOrganizationAccess, asyncHandler(async (req: AuthRequest, res) => {
  const accounts = await bankFeedService.fetchBankAccounts(req.organizationId!);

  res.json(accounts);
}));

/**
 * Get transactions from bank feed
 * GET /api/bank-feeds/transactions?accountId=xxx&fromDate=xxx&toDate=xxx
 */
router.get('/transactions', asyncHandler(async (req: AuthRequest, res) => {
  const { accountId, fromDate, toDate } = req.query;

  const transactions = await bankFeedService.fetchTransactions({
    accountId: accountId as string,
    fromDate: fromDate as string,
    toDate: toDate as string
  });

  res.json(transactions);
}));

/**
 * Sync bank transactions
 * POST /api/bank-feeds/sync
 */
router.post('/sync', checkOrganizationAccess, asyncHandler(async (req: AuthRequest, res) => {
  const { accountId } = req.body;

  const result = await bankFeedService.syncTransactions(
    req.organizationId!,
    accountId
  );

  res.json(result);
}));

/**
 * Disconnect bank account
 * DELETE /api/bank-feeds/:id
 */
router.delete('/:id', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const result = await bankFeedService.disconnectBankAccount(req.params.id);

  res.json(result);
}));

export default router;
