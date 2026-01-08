import { Router } from 'express';
import { accountController } from '../controllers/account.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all accounts for the organization
router.get('/', accountController.getAll);

// Get a single account by ID
router.get('/:id', accountController.getById);

// Create a new account
router.post('/', accountController.create);

// Update an account
router.put('/:id', accountController.update);

// Delete an account
router.delete('/:id', accountController.delete);

// Initialize/seed chart of accounts for organization
router.post('/seed', accountController.seedChartOfAccounts);

export default router;
