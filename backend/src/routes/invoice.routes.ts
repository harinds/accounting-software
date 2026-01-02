import express from 'express';
import { invoiceService } from '../services/invoice.service';
import { authenticate, checkOrganizationAccess } from '../middleware/auth';
import logger from '../utils/logger';

const router = express.Router();

// All routes require authentication and organization access
router.use(authenticate);
router.use(checkOrganizationAccess);

// Get all invoices for an organization
router.get('/', async (req, res, next) => {
  try {
    const organizationId = req.query.organizationId as string;

    if (!organizationId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    const invoices = await invoiceService.getAll(organizationId);
    res.json(invoices);
  } catch (error) {
    logger.error('Error in GET /invoices', { error });
    next(error);
  }
});

// Get overdue invoices
router.get('/overdue', async (req, res, next) => {
  try {
    const organizationId = req.query.organizationId as string;

    if (!organizationId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    const overdueInvoices = await invoiceService.getOverdueInvoices(organizationId);
    res.json(overdueInvoices);
  } catch (error) {
    logger.error('Error in GET /invoices/overdue', { error });
    next(error);
  }
});

// Get a single invoice
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const organizationId = req.query.organizationId as string;

    if (!organizationId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    const invoice = await invoiceService.getById(id, organizationId);

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    logger.error('Error in GET /invoices/:id', { error });
    next(error);
  }
});

// Generate next invoice number
router.get('/generate/number', async (req, res, next) => {
  try {
    const organizationId = req.query.organizationId as string;

    if (!organizationId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    const invoiceNumber = await invoiceService.generateInvoiceNumber(organizationId);
    res.json({ invoice_number: invoiceNumber });
  } catch (error) {
    logger.error('Error in GET /invoices/generate/number', { error });
    next(error);
  }
});

// Create a new invoice
router.post('/', async (req, res, next) => {
  try {
    const invoiceData = req.body;

    // Validate required fields
    if (!invoiceData.organization_id) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    if (!invoiceData.customer_name) {
      return res.status(400).json({ error: 'Customer name is required' });
    }

    if (!invoiceData.line_items || invoiceData.line_items.length === 0) {
      return res.status(400).json({ error: 'At least one line item is required' });
    }

    const invoice = await invoiceService.create(invoiceData);
    res.status(201).json(invoice);
  } catch (error) {
    logger.error('Error in POST /invoices', { error });
    next(error);
  }
});

// Update an invoice
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const invoiceData = req.body;

    const invoice = await invoiceService.update(id, invoiceData);
    res.json(invoice);
  } catch (error) {
    logger.error('Error in PUT /invoices/:id', { error });
    next(error);
  }
});

// Delete an invoice
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    await invoiceService.delete(id);
    res.status(204).send();
  } catch (error) {
    logger.error('Error in DELETE /invoices/:id', { error });
    next(error);
  }
});

// Update invoice status
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const invoice = await invoiceService.updateStatus(id, status);
    res.json(invoice);
  } catch (error) {
    logger.error('Error in PATCH /invoices/:id/status', { error });
    next(error);
  }
});

// Mark invoice as sent
router.post('/:id/send', async (req, res, next) => {
  try {
    const { id } = req.params;

    const invoice = await invoiceService.markAsSent(id);
    res.json(invoice);
  } catch (error) {
    logger.error('Error in POST /invoices/:id/send', { error });
    next(error);
  }
});

// Mark invoice as paid
router.post('/:id/pay', async (req, res, next) => {
  try {
    const { id } = req.params;

    const invoice = await invoiceService.markAsPaid(id);
    res.json(invoice);
  } catch (error) {
    logger.error('Error in POST /invoices/:id/pay', { error });
    next(error);
  }
});

export default router;
