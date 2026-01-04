import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Edit, Trash2, Eye, Filter, DollarSign, AlertTriangle } from 'lucide-react';
import { useInvoiceStore } from '../store/invoiceStore';
import { InvoiceService } from '../services/invoiceService';
import { InvoiceModal } from '../components/invoices/InvoiceModal';
import type { Invoice, InvoiceFormData } from '../types/invoice';
import { INVOICE_STATUSES } from '../types/invoice';

export const Invoices: React.FC = () => {
  const {
    invoices,
    loading,
    error,
    stats,
    setFilters,
    fetchInvoices,
    deleteInvoice,
  } = useInvoiceStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedQuotationId, setSelectedQuotationId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Load invoices on component mount
  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Apply filters when search term or filters change
  useEffect(() => {
    const newFilters = {
      searchTerm: searchTerm || undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
    };
    setFilters(newFilters);
    fetchInvoices();
  }, [searchTerm, selectedStatus, setFilters, fetchInvoices]);

  const handleCreateInvoice = () => {
    setSelectedInvoice(null);
    setSelectedQuotationId(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setSelectedQuotationId(null);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setSelectedQuotationId(null);
    setModalMode('view');
    setShowModal(true);
  };

  const handleSaveInvoice = async (invoiceData: InvoiceFormData, userId: string): Promise<boolean> => {
    try {
      if (modalMode === 'create') {
        const result = await InvoiceService.createInvoice(invoiceData, userId);
        if (result.success) {
          await fetchInvoices();
          return true;
        }
      } else if (modalMode === 'edit' && selectedInvoice) {
        const result = await InvoiceService.updateInvoice(selectedInvoice.id, invoiceData);
        if (result.success) {
          await fetchInvoices();
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error saving invoice:', error);
      return false;
    }
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    setShowDeleteConfirm(invoiceId);
  };

  const confirmDelete = async (invoiceId: string) => {
    const success = await deleteInvoice(invoiceId);
    if (success) {
      setShowDeleteConfirm(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
    }).format(amount);
  };

  const getStatusBadge = (status: Invoice['status']) => {
    const statusConfig = INVOICE_STATUSES.find(s => s.value === status);
    if (!statusConfig) return null;

    const colorClasses = {
      green: 'bg-green-100 text-green-800 border-green-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-200',
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${colorClasses[statusConfig.color]}`}>
        {statusConfig.label}
      </span>
    );
  };

  if (loading && invoices.length === 0) {
    return (
      <div className="animate-pulse space-y-6 p-6 lg:p-8">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-24"></div>
          ))}
        </div>
        <div className="bg-gray-200 rounded-lg h-96"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="text-left">
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight lg:text-4xl">
              Invoices
            </h1>
            <p className="mt-2 text-green-100 text-base lg:text-lg">
              Manage customer invoices and payments
            </p>
          </div>
          <button
            onClick={handleCreateInvoice}
            className="inline-flex items-center px-6 py-3 bg-white text-green-700 rounded-lg hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-green-600 transition-all font-medium shadow-sm"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Invoice
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 lg:p-8 space-y-6 lg:space-y-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="ml-4 text-left">
                  <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalInvoices}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4 text-left">
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalValue)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                <div className="ml-4 text-left">
                  <p className="text-sm font-medium text-gray-600">Total Paid</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalPaid)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div className="ml-4 text-left">
                  <p className="text-sm font-medium text-gray-600">Outstanding</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalOutstanding)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-gray-400"
                aria-label="Search invoices"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-gray-400 bg-white"
                aria-label="Filter by status"
              >
                <option value="all">All Status</option>
                {INVOICE_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Invoices Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {invoices.length === 0 && !loading ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedStatus !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Get started by creating your first invoice'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                              <FileText className="h-5 w-5 text-green-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {invoice.invoiceNumber}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(invoice.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {invoice.customer?.name || 'Unknown Customer'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {invoice.customer?.company}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(invoice.totalAmount)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Balance: {formatCurrency(invoice.balanceAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(invoice.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleViewInvoice(invoice)}
                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                            title="View invoice"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditInvoice(invoice)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                            title="Edit invoice"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteInvoice(invoice.id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                            title="Delete invoice"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Modal */}
      {showModal && (
        <InvoiceModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          mode={modalMode}
          invoice={selectedInvoice}
          quotationId={selectedQuotationId}
          onSave={handleSaveInvoice}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowDeleteConfirm(null)}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete Invoice
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this invoice? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => confirmDelete(showDeleteConfirm)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(null)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
