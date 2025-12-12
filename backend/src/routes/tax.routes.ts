import { Router } from 'express';
import { authenticate, checkOrganizationAccess, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import taxService from '../services/tax.service';

const router = Router();

router.use(authenticate);

/**
 * Calculate BAS
 * POST /api/tax/bas/calculate
 */
router.post('/bas/calculate', checkOrganizationAccess, asyncHandler(async (req: AuthRequest, res) => {
  const { periodStart, periodEnd } = req.body;

  const result = await taxService.calculateBAS(
    req.organizationId!,
    periodStart,
    periodEnd
  );

  res.json(result);
}));

/**
 * Prepare BAS for lodgement
 * POST /api/tax/bas/:id/prepare
 */
router.post('/bas/:id/prepare', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const result = await taxService.prepareBAS(req.params.id);

  res.json(result);
}));

/**
 * Lodge BAS
 * POST /api/tax/bas/:id/lodge
 */
router.post('/bas/:id/lodge', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const result = await taxService.lodgeBAS(req.params.id);

  res.json(result);
}));

/**
 * Get BAS lodgement status
 * GET /api/tax/bas/:id/status
 */
router.get('/bas/:id/status', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const status = await taxService.getLodgementStatus(req.params.id);

  res.json(status);
}));

/**
 * Prepare tax return
 * POST /api/tax/returns/prepare
 */
router.post('/returns/prepare', checkOrganizationAccess, asyncHandler(async (req: AuthRequest, res) => {
  const { financialYear } = req.body;

  const result = await taxService.prepareTaxReturn(
    req.organizationId!,
    financialYear
  );

  res.json(result);
}));

/**
 * Lodge tax return
 * POST /api/tax/returns/:id/lodge
 */
router.post('/returns/:id/lodge', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const result = await taxService.lodgeTaxReturn(req.params.id);

  res.json(result);
}));

export default router;
