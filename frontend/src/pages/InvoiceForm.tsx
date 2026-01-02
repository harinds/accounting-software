import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { format } from 'date-fns';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  tax_rate: number;
}

interface InvoiceFormData {
  customer_name: string;
  customer_email: string;
  customer_address: {
    street: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  issue_date: string;
  due_date: string;
  line_items: LineItem[];
  notes: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
}

export default function InvoiceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { organization } = useAuthStore();
  const organizationId = organization?.id || '';

  const isEditing = !!id;

  const [formData, setFormData] = useState<InvoiceFormData>({
    customer_name: '',
    customer_email: '',
    customer_address: {
      street: '',
      city: '',
      state: '',
      postcode: '',
      country: 'Australia'
    },
    issue_date: format(new Date(), 'yyyy-MM-dd'),
    due_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // 30 days from now
    line_items: [
      { description: '', quantity: 1, unit_price: 0, amount: 0, tax_rate: 0.10 }
    ],
    notes: '',
    status: 'draft'
  });

  // Fetch existing invoice if editing
  const { data: invoice } = useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const response = await api.get(`/api/invoices/${id}`, {
        params: { organizationId }
      });
      return response.data;
    },
    enabled: isEditing && !!organizationId
  });

  // Populate form with existing invoice data
  useEffect(() => {
    if (invoice) {
      setFormData({
        customer_name: invoice.customer_name,
        customer_email: invoice.customer_email || '',
        customer_address: invoice.customer_address || {
          street: '',
          city: '',
          state: '',
          postcode: '',
          country: 'Australia'
        },
        issue_date: invoice.issue_date,
        due_date: invoice.due_date,
        line_items: invoice.line_items.length > 0 ? invoice.line_items : [
          { description: '', quantity: 1, unit_price: 0, amount: 0, tax_rate: 0.10 }
        ],
        notes: invoice.notes || '',
        status: invoice.status
      });
    }
  }, [invoice]);

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEditing) {
        return await api.put(`/api/invoices/${id}`, data, {
          params: { organizationId }
        });
      } else {
        return await api.post('/api/invoices', data, {
          params: { organizationId }
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      navigate('/invoices');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const invoiceData = {
      ...formData,
      organization_id: organizationId,
      line_items: formData.line_items.map(item => ({
        ...item,
        amount: item.quantity * item.unit_price
      }))
    };

    saveMutation.mutate(invoiceData);
  };

  const addLineItem = () => {
    setFormData({
      ...formData,
      line_items: [
        ...formData.line_items,
        { description: '', quantity: 1, unit_price: 0, amount: 0, tax_rate: 0.10 }
      ]
    });
  };

  const removeLineItem = (index: number) => {
    if (formData.line_items.length > 1) {
      setFormData({
        ...formData,
        line_items: formData.line_items.filter((_, i) => i !== index)
      });
    }
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    const newLineItems = [...formData.line_items];
    newLineItems[index] = {
      ...newLineItems[index],
      [field]: value
    };

    // Auto-calculate amount
    if (field === 'quantity' || field === 'unit_price') {
      newLineItems[index].amount = newLineItems[index].quantity * newLineItems[index].unit_price;
    }

    setFormData({
      ...formData,
      line_items: newLineItems
    });
  };

  // Calculate totals
  const subtotal = formData.line_items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const taxAmount = formData.line_items.reduce((sum, item) => {
    const amount = item.quantity * item.unit_price;
    return sum + (amount * item.tax_rate);
  }, 0);
  const total = subtotal + taxAmount;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/invoices')}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Invoice' : 'New Invoice'}
            </h1>
            <p className="text-gray-500 mt-1">
              {isEditing ? 'Update invoice details' : 'Create a new invoice for your customer'}
            </p>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saveMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="h-5 w-5" />
          {saveMutation.isPending ? 'Saving...' : 'Save Invoice'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                required
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.customer_email}
                onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={formData.customer_address.street}
                onChange={(e) => setFormData({
                  ...formData,
                  customer_address: { ...formData.customer_address, street: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                value={formData.customer_address.city}
                onChange={(e) => setFormData({
                  ...formData,
                  customer_address: { ...formData.customer_address, city: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                value={formData.customer_address.state}
                onChange={(e) => setFormData({
                  ...formData,
                  customer_address: { ...formData.customer_address, state: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postcode
              </label>
              <input
                type="text"
                value={formData.customer_address.postcode}
                onChange={(e) => setFormData({
                  ...formData,
                  customer_address: { ...formData.customer_address, postcode: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                value={formData.customer_address.country}
                onChange={(e) => setFormData({
                  ...formData,
                  customer_address: { ...formData.customer_address, country: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Invoice Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issue Date *
              </label>
              <input
                type="date"
                required
                value={formData.issue_date}
                onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date *
              </label>
              <input
                type="date"
                required
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Line Items</h2>
            <button
              type="button"
              onClick={addLineItem}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </button>
          </div>

          <div className="space-y-4">
            {formData.line_items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-start">
                <div className="col-span-12 md:col-span-5">
                  <input
                    type="text"
                    placeholder="Description"
                    required
                    value={item.description}
                    onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-4 md:col-span-2">
                  <input
                    type="number"
                    placeholder="Qty"
                    required
                    min="0"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-4 md:col-span-2">
                  <input
                    type="number"
                    placeholder="Price"
                    required
                    min="0"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-3 md:col-span-2">
                  <input
                    type="text"
                    value={`$${(item.quantity * item.unit_price).toFixed(2)}`}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>
                <div className="col-span-1 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => removeLineItem(index)}
                    disabled={formData.line_items.length === 1}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-6 border-t pt-4">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">GST (10%):</span>
                  <span className="font-medium">${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Notes</h2>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
            placeholder="Add any additional notes or terms..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/invoices')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saveMutation.isPending ? 'Saving...' : isEditing ? 'Update Invoice' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
}
