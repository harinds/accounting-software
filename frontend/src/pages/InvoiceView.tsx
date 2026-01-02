import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { format } from 'date-fns';
import { ArrowLeft, Edit, Send, DollarSign, Printer, Download } from 'lucide-react';
import { api } from '../services/api';

interface Invoice {
  id: string;
  organization_id: string;
  invoice_number: string;
  customer_name: string;
  customer_email?: string;
  customer_address?: {
    street?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  line_items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    amount: number;
  }>;
  notes?: string;
  created_at: string;
}

export default function InvoiceView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { organization } = useAuthStore();
  const organizationId = organization?.id || '';

  // Fetch invoice
  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const response = await api.get(`/api/invoices/${id}`, {
        params: { organizationId }
      });
      return response.data as Invoice;
    },
    enabled: !!organizationId && !!id
  });

  // Update status mutation (for sent status)
  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      await api.patch(`/api/invoices/${id}/status`, { status }, {
        params: { organizationId }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    }
  });

  // Mark as paid mutation (uses special endpoint that creates transaction)
  const markAsPaidMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/api/invoices/${id}/pay`, {}, {
        params: { organizationId }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    }
  });

  const handleMarkAsSent = () => {
    updateStatusMutation.mutate('sent');
  };

  const handleMarkAsPaid = () => {
    markAsPaidMutation.mutate();
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">Loading invoice...</div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">Invoice not found</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header - Hide when printing */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/invoices')}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoice {invoice.invoice_number}</h1>
            <span className={`mt-2 inline-block px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          {invoice.status === 'draft' && (
            <>
              <button
                onClick={() => navigate(`/invoices/${id}/edit`)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                <Edit className="h-4 w-4" />
                Edit
              </button>
              <button
                onClick={handleMarkAsSent}
                disabled={updateStatusMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Send className="h-4 w-4" />
                Mark as Sent
              </button>
            </>
          )}
          {(invoice.status === 'sent' || invoice.status === 'overdue') && (
            <button
              onClick={handleMarkAsPaid}
              disabled={markAsPaidMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <DollarSign className="h-4 w-4" />
              Mark as Paid
            </button>
          )}
          {/* Print button always visible */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="bg-white rounded-lg shadow-lg p-8 print:shadow-none">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">INVOICE</h2>
            <p className="text-gray-600 mt-1">{invoice.invoice_number}</p>
          </div>
          <div className="text-right">
            <h3 className="text-lg font-semibold text-gray-900">{organization?.name}</h3>
            <p className="text-gray-600 text-sm">Your Company Details</p>
          </div>
        </div>

        {/* Bill To & Invoice Details */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Bill To</h3>
            <div className="text-gray-900">
              <p className="font-semibold">{invoice.customer_name}</p>
              {invoice.customer_email && (
                <p className="text-sm text-gray-600">{invoice.customer_email}</p>
              )}
              {invoice.customer_address && (
                <div className="text-sm text-gray-600 mt-2">
                  {invoice.customer_address.street && <p>{invoice.customer_address.street}</p>}
                  {(invoice.customer_address.city || invoice.customer_address.state || invoice.customer_address.postcode) && (
                    <p>
                      {invoice.customer_address.city && `${invoice.customer_address.city}, `}
                      {invoice.customer_address.state && `${invoice.customer_address.state} `}
                      {invoice.customer_address.postcode}
                    </p>
                  )}
                  {invoice.customer_address.country && <p>{invoice.customer_address.country}</p>}
                </div>
              )}
            </div>
          </div>

          <div className="text-right">
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-500">Issue Date:</span>
                <p className="font-semibold">{format(new Date(invoice.issue_date), 'MMMM dd, yyyy')}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Due Date:</span>
                <p className="font-semibold">{format(new Date(invoice.due_date), 'MMMM dd, yyyy')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-3 text-sm font-semibold text-gray-700">Description</th>
                <th className="text-right py-3 text-sm font-semibold text-gray-700">Quantity</th>
                <th className="text-right py-3 text-sm font-semibold text-gray-700">Unit Price</th>
                <th className="text-right py-3 text-sm font-semibold text-gray-700">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.line_items.map((item, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-3 text-gray-900">{item.description}</td>
                  <td className="text-right py-3 text-gray-600">{item.quantity}</td>
                  <td className="text-right py-3 text-gray-600">${item.unit_price.toFixed(2)}</td>
                  <td className="text-right py-3 text-gray-900 font-medium">${item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between py-2 text-gray-600">
              <span>Subtotal:</span>
              <span>${invoice.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 text-gray-600">
              <span>GST (10%):</span>
              <span>${invoice.tax_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-3 border-t-2 border-gray-300 text-xl font-bold">
              <span>Total:</span>
              <span>${invoice.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="border-t pt-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Notes</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
          <p>Thank you for your business!</p>
        </div>
      </div>
    </div>
  );
}
