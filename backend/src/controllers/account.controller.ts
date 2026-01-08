import { Request, Response } from 'express';
import { accountService } from '../services/account.service';

export const accountController = {
  async getAll(req: Request, res: Response) {
    try {
      const { organizationId } = req.query;

      if (!organizationId) {
        return res.status(400).json({ error: 'Organization ID is required' });
      }

      const accounts = await accountService.getAll(organizationId as string);
      res.json({ accounts });
    } catch (error: any) {
      console.error('Error fetching accounts:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch accounts' });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const account = await accountService.getById(id);

      if (!account) {
        return res.status(404).json({ error: 'Account not found' });
      }

      res.json(account);
    } catch (error: any) {
      console.error('Error fetching account:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch account' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const accountData = req.body;
      const account = await accountService.create(accountData);
      res.status(201).json(account);
    } catch (error: any) {
      console.error('Error creating account:', error);
      res.status(500).json({ error: error.message || 'Failed to create account' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const accountData = req.body;
      const account = await accountService.update(id, accountData);
      res.json(account);
    } catch (error: any) {
      console.error('Error updating account:', error);
      res.status(500).json({ error: error.message || 'Failed to update account' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await accountService.delete(id);
      res.status(204).send();
    } catch (error: any) {
      console.error('Error deleting account:', error);
      res.status(500).json({ error: error.message || 'Failed to delete account' });
    }
  },

  async seedChartOfAccounts(req: Request, res: Response) {
    try {
      const { organizationId } = req.body;

      if (!organizationId) {
        return res.status(400).json({ error: 'Organization ID is required' });
      }

      const result = await accountService.seedChartOfAccounts(organizationId);
      res.json(result);
    } catch (error: any) {
      console.error('Error seeding chart of accounts:', error);
      res.status(500).json({ error: error.message || 'Failed to seed chart of accounts' });
    }
  }
};
