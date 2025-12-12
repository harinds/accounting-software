import { Router } from 'express';
import { authenticate, checkOrganizationAccess, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import reportService from '../services/report.service';

const router = Router();

router.use(authenticate);

/**
 * Get Profit & Loss report
 * GET /api/reports/profit-loss?organizationId=xxx&startDate=xxx&endDate=xxx
 */
router.get('/profit-loss', checkOrganizationAccess, asyncHandler(async (req: AuthRequest, res) => {
  const { startDate, endDate } = req.query;

  const report = await reportService.generateProfitLoss(
    req.organizationId!,
    {
      startDate: startDate as string,
      endDate: endDate as string
    }
  );

  res.json(report);
}));

/**
 * Get Cashflow report
 * GET /api/reports/cashflow?organizationId=xxx&startDate=xxx&endDate=xxx
 */
router.get('/cashflow', checkOrganizationAccess, asyncHandler(async (req: AuthRequest, res) => {
  const { startDate, endDate } = req.query;

  const report = await reportService.generateCashflow(
    req.organizationId!,
    {
      startDate: startDate as string,
      endDate: endDate as string
    }
  );

  res.json(report);
}));

/**
 * Get Balance Sheet
 * GET /api/reports/balance-sheet?organizationId=xxx&date=xxx
 */
router.get('/balance-sheet', checkOrganizationAccess, asyncHandler(async (req: AuthRequest, res) => {
  const { date } = req.query;

  const report = await reportService.generateBalanceSheet(
    req.organizationId!,
    date as string
  );

  res.json(report);
}));

/**
 * Get Tax Summary
 * GET /api/reports/tax-summary?organizationId=xxx&period=xxx
 */
router.get('/tax-summary', checkOrganizationAccess, asyncHandler(async (req: AuthRequest, res) => {
  const { period } = req.query;

  const report = await reportService.generateTaxSummary(
    req.organizationId!,
    period as string
  );

  res.json(report);
}));

/**
 * Export report to CSV
 * GET /api/reports/export/:type?organizationId=xxx&...params
 */
router.get('/export/:type', checkOrganizationAccess, asyncHandler(async (req: AuthRequest, res) => {
  const { type } = req.params;
  const params = req.query;

  const result = await reportService.exportToCSV(
    type,
    req.organizationId!,
    params
  );

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
  res.send(result.csv);
}));

export default router;
