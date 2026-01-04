import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Download, 
  Mail, 
  Plus, 
  Trash2, 
  Search,
  Calculator,
  User,
  Building2,
  Phone,
  MapPin,
  X,
  CreditCard,
  DollarSign
} from 'lucide-react';
import { FullScreenModal } from '../ui/Modal';
import { CustomerSelector } from '../ui/CustomerSelector';
import { useProductStore } from '../../store/productStore';
import { useQuotationStore } from '../../store/quotationStore';
import type { Invoice, InvoiceFormData } from '../../types/invoice';
import type { Customer } from '../../types/customer';
import type { Product } from '../../types/product';
import type { Quotation } from '../../types/quotation';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'view';
  invoice?: Invoice | null;
  quotationId?: string | null; // For converting quotation to invoice
  onSave: (invoiceData: InvoiceFormData, userId: string) => Promise<boolean>;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  mode,
  invoice,
  quotationId,
  onSave,
}) => {
  const { products, fetchProducts } = useProductStore();
  const { quotations } = useQuotationStore();
  
  const [formData, setFormData] = useState<InvoiceFormData>({
    customerId: '',
    customer: {
      name: '',
      email: '',
      phone: '',
      company: '',
    },
    items: [],
    taxRate: 15,
    discountAmount: 0,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    notes: '',
    terms: '',
    quotationId: quotationId || undefined,
  });

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [showQuotationSearch, setShowQuotationSearch] = useState(false);
  const [quotationSearch, setQuotationSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Payment tracking
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'bank' | 'other'>('cash');
  const [paymentNotes, setPaymentNotes] = useState<string>('');

  // Load products on component mount
  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen, fetchProducts]);

  // Load quotation if converting from quotation
  useEffect(() => {
    const loadQuotation = async () => {
      if (quotationId) {
        const quotation = quotations.find(q => q.id === quotationId);
        if (quotation) {
          setSelectedQuotation(quotation);
          setFormData({
            customerId: quotation.customerId,
            customer: {
              name: quotation.customer.name,
              email: quotation.customer.email || '',
              phone: quotation.customer.phone,
              company: quotation.customer.company || '',
            },
            items: quotation.items,
            taxRate: quotation.taxRate,
            discountAmount: quotation.discountAmount,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            notes: quotation.notes || '',
            terms: quotation.terms || '',
            quotationId: quotation.id,
          });
          setSelectedCustomer(quotation.customer);
        }
      }
    };

    if (isOpen && quotationId) {
      loadQuotation();
    }
  }, [isOpen, quotationId, quotations]);

  // Initialize form data
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && invoice) {
        setFormData({
          customerId: invoice.customerId,
          items: invoice.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
          })),
          taxRate: invoice.taxRate,
          discountAmount: invoice.discountAmount,
          dueDate: invoice.dueDate,
          notes: invoice.notes || '',
          terms: invoice.terms || '',
          quotationId: invoice.quotationId || undefined,
        });
        setSelectedCustomer(invoice.customer);
        setPaymentAmount(invoice.totalAmount - invoice.balanceAmount);
      } else if (mode === 'create' && !quotationId) {
        // Reset form for create mode
        setFormData({
          customerId: '',
          customer: {
            name: '',
            email: '',
            phone: '',
            company: '',
          },
          items: [],
          taxRate: 15,
          discountAmount: 0,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          notes: '',
          terms: '',
          quotationId: undefined,
        });
        setSelectedCustomer(null);
        setSelectedQuotation(null);
      }
      setErrors({});
    }
  }, [isOpen, mode, invoice, quotationId]);

  // Customer search functionality
  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData(prev => ({
      ...prev,
      customerId: customer.id,
      customer: {
        name: customer.name,
        email: customer.email || '',
        phone: customer.phone,
        company: customer.company || '',
      },
    }));
  };

  // Quotation selection
  const selectQuotation = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setFormData(prev => ({
      ...prev,
      customerId: quotation.customerId,
      customer: {
        name: quotation.customer.name,
        email: quotation.customer.email || '',
        phone: quotation.customer.phone,
        company: quotation.customer.company || '',
      },
      items: quotation.items,
      taxRate: quotation.taxRate,
      discountAmount: quotation.discountAmount,
      quotationId: quotation.id,
      notes: quotation.notes || '',
      terms: quotation.terms || '',
    }));
    setSelectedCustomer(quotation.customer);
    setShowQuotationSearch(false);
  };

  // Product management
  const addProductToInvoice = (product: Product) => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        productId: product.id,
        quantity: 1,
        unitPrice: product.price,
        discount: 0,
      }],
    }));

    setShowProductSearch(false);
    setProductSearch('');
  };

  const updateItem = (index: number, field: string, value: number) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  // Calculations
  const subtotal = formData.items.reduce((sum, item) => 
    sum + ((item.quantity * item.unitPrice) - item.discount), 0
  );
  const taxAmount = subtotal * (formData.taxRate / 100);
  const totalAmount = subtotal + taxAmount - formData.discountAmount;
  const balanceAmount = Math.max(0, totalAmount - paymentAmount);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedCustomer && !formData.customer?.name) {
      newErrors.customer = 'Customer is required';
    }

    if (formData.items.length === 0) {
      newErrors.items = 'At least one item is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission
  const handleSubmit = async () => {
    if (mode === 'view') return;

    if (!validateForm()) return;

    setLoading(true);
    try {
      const success = await onSave(formData, 'current-user-id'); // Replace with actual user ID
      if (success) {
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  // Export functions
  const handleExportPDF = () => {
    // TODO: Implement PDF export
    console.log('Exporting to PDF...');
  };

  const handleSendEmail = () => {
    // TODO: Implement email sending
    console.log('Sending via email...');
  };

  const isReadOnly = mode === 'view';
  const title = {
    create: selectedQuotation ? 'Create Invoice from Quotation' : 'Create New Invoice',
    edit: 'Edit Invoice',
    view: 'View Invoice',
  }[mode];

  const headerActions = (
    <div className="flex space-x-2">
      {mode === 'view' && (
        <>
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <Download className="h-4 w-4 mr-2" />
            PDF
          </button>
          <button
            onClick={handleSendEmail}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <Mail className="h-4 w-4 mr-2" />
            Email
          </button>
        </>
      )}
      {mode !== 'view' && (
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
        >
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save Invoice'}
        </button>
      )}
    </div>
  );

  if (!isOpen) return null;

  return (
    <FullScreenModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      headerActions={headerActions}
    >
      <div className="flex h-full">
        {/* Main Form */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-8">
            {/* Source Selection */}
            {mode === 'create' && !quotationId && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Source</h3>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowQuotationSearch(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    From Quotation
                  </button>
                  <span className="text-gray-500 flex items-center">or create a new invoice</span>
                </div>

                {selectedQuotation && (
                  <div className="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="font-medium text-blue-900">Selected Quotation</h4>
                    <p className="text-sm text-blue-700">{selectedQuotation.quotationNumber}</p>
                    <p className="text-sm text-blue-600">Customer: {selectedQuotation.customer.name}</p>
                    <p className="text-sm text-blue-600">Total: LKR {selectedQuotation.totalAmount.toFixed(2)}</p>
                  </div>
                )}
              </div>
            )}

            {/* Customer Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Customer Information
              </h3>

              {/* Customer Selection */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer <span className="text-red-500">*</span>
                  </label>
                  <CustomerSelector
                    selectedCustomer={selectedCustomer}
                    onCustomerSelect={selectCustomer}
                    onNewCustomerCreate={() => {
                      // Customer is already created and selected by the CustomerSelector
                    }}
                    disabled={isReadOnly || !!selectedQuotation}
                    placeholder="Search existing customer or enter name for new customer"
                    required
                    error={errors.customerId}
                  />
                </div>
                </div>

                {/* Selected Customer Display */}
                {selectedCustomer && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {selectedCustomer.company ? (
                          <Building2 className="h-6 w-6 text-gray-400 mt-1" />
                        ) : (
                          <User className="h-6 w-6 text-gray-400 mt-1" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{selectedCustomer.name}</h4>
                        {selectedCustomer.company && (
                          <p className="text-sm text-gray-600">{selectedCustomer.company}</p>
                        )}
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2" />
                            {selectedCustomer.phone}
                          </div>
                          {selectedCustomer.email && (
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-2" />
                              {selectedCustomer.email}
                            </div>
                          )}
                          {selectedCustomer.address?.city && (
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2" />
                              {selectedCustomer.address.city}, {selectedCustomer.address.state}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Items Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Calculator className="h-5 w-5 mr-2" />
                  Invoice Items
                </h3>
                {!isReadOnly && !selectedQuotation && (
                  <button
                    onClick={() => setShowProductSearch(true)}
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </button>
                )}
              </div>

              {errors.items && (
                <p className="text-sm text-red-600 mb-4">{errors.items}</p>
              )}

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Discount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      {!isReadOnly && !selectedQuotation && (
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.items.map((item, index) => {
                      const product = products.find(p => p.id === item.productId);
                      const total = (item.quantity * item.unitPrice) - item.discount;
                      
                      return (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {product?.name || 'Unknown Product'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {product?.description}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                              disabled={isReadOnly || !!selectedQuotation}
                              className="w-20 px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
                              min="1"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                              disabled={isReadOnly || !!selectedQuotation}
                              className="w-24 px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              value={item.discount}
                              onChange={(e) => updateItem(index, 'discount', Number(e.target.value))}
                              disabled={isReadOnly || !!selectedQuotation}
                              className="w-24 px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            LKR {total.toFixed(2)}
                          </td>
                          {!isReadOnly && !selectedQuotation && (
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => removeItem(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {formData.items.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No items added yet. {!selectedQuotation && 'Click "Add Product" to get started.'}
                </div>
              )}
            </div>

            {/* Payment & Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate.toISOString().split('T')[0]}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      dueDate: new Date(e.target.value)
                    }))}
                    disabled={isReadOnly}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
                  />
                </div>

                {/* Payment Information */}
                {mode !== 'view' && (
                  <div className="bg-green-50 rounded-xl border border-green-200 p-6">
                    <h4 className="text-lg font-medium text-green-900 mb-4 flex items-center">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Payment Information
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-green-700 mb-1">
                          Payment Amount
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="number"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(Number(e.target.value))}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            min="0"
                            max={totalAmount}
                            step="0.01"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      {paymentAmount > 0 && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-green-700 mb-1">
                              Payment Date
                            </label>
                            <input
                              type="date"
                              value={paymentDate.toISOString().split('T')[0]}
                              onChange={(e) => setPaymentDate(new Date(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-green-700 mb-1">
                              Payment Method
                            </label>
                            <select
                              value={paymentMethod}
                              onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'card' | 'bank' | 'other')}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                              <option value="cash">Cash</option>
                              <option value="card">Credit/Debit Card</option>
                              <option value="bank">Bank Transfer</option>
                              <option value="other">Other</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-green-700 mb-1">
                              Payment Notes
                            </label>
                            <input
                              type="text"
                              value={paymentNotes}
                              onChange={(e) => setPaymentNotes(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                              placeholder="Payment reference or notes"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      notes: e.target.value
                    }))}
                    disabled={isReadOnly}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none disabled:bg-gray-50"
                    placeholder="Add any notes or special instructions"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Terms & Conditions
                  </label>
                  <textarea
                    value={formData.terms}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      terms: e.target.value
                    }))}
                    disabled={isReadOnly}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none disabled:bg-gray-50"
                    placeholder="Add terms and conditions"
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Summary</h4>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">LKR {subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Tax Rate</span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={formData.taxRate}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          taxRate: Number(e.target.value)
                        }))}
                        disabled={isReadOnly || !!selectedQuotation}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                      <span className="text-gray-600">%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax Amount</span>
                    <span className="font-medium">LKR {taxAmount.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Discount</span>
                    <input
                      type="number"
                      value={formData.discountAmount}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        discountAmount: Number(e.target.value)
                      }))}
                      disabled={isReadOnly || !!selectedQuotation}
                      className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-purple-600">LKR {totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Payment Summary */}
                  {paymentAmount > 0 && (
                    <div className="border-t border-gray-200 pt-4 space-y-2">
                      <div className="flex justify-between text-green-600">
                        <span>Payment Amount</span>
                        <span className="font-medium">LKR {paymentAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-semibold">
                        <span className={balanceAmount > 0 ? "text-red-600" : "text-green-600"}>
                          Balance Due
                        </span>
                        <span className={balanceAmount > 0 ? "text-red-600" : "text-green-600"}>
                          LKR {balanceAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      
      {/* Product Search Modal */}
      {showProductSearch && (
        <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Select Product</h3>
                <button
                  onClick={() => setShowProductSearch(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-4 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Search products..."
                />
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {products
                .filter((product: Product) => 
                  product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                  product.category.toLowerCase().includes(productSearch.toLowerCase())
                )
                .map((product: Product) => (
                  <button
                    key={product.id}
                    onClick={() => addProductToInvoice(product)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">LKR {product.price.toFixed(2)}</div>
                      <div className="text-sm text-gray-500">{product.stock} in stock</div>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Quotation Search Modal */}
      {showQuotationSearch && (
        <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Select Quotation</h3>
                <button
                  onClick={() => setShowQuotationSearch(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-4 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={quotationSearch}
                  onChange={(e) => setQuotationSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Search quotations..."
                />
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {quotations
                .filter(quotation => 
                  quotation.status === 'sent' &&
                  (quotation.quotationNumber.toLowerCase().includes(quotationSearch.toLowerCase()) ||
                   quotation.customer.name.toLowerCase().includes(quotationSearch.toLowerCase()))
                )
                .map((quotation) => (
                  <button
                    key={quotation.id}
                    onClick={() => selectQuotation(quotation)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-900">{quotation.quotationNumber}</div>
                        <div className="text-sm text-gray-500">Customer: {quotation.customer.name}</div>
                        <div className="text-sm text-gray-500">
                          Valid until: {quotation.validUntil.toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">LKR {quotation.totalAmount.toFixed(2)}</div>
                        <div className="text-sm text-blue-600">{quotation.status}</div>
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </FullScreenModal>
  );
};
