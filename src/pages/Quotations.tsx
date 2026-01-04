import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Edit, Trash2, Eye, Filter, Send, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { useQuotationStore } from '../store/quotationStore';
import { QuotationService } from '../services/quotationService';
import { QuotationModal } from '../components/quotations/QuotationModal';
import type { Quotation, QuotationFormData } from '../types/quotation';
import { QUOTATION_STATUSES } from '../types/quotation';

export const Quotations: React.FC = () => {
  const {
    quotations,
    loading,
    error,
    stats,
    setFilters,
    fetchQuotations,
    updateQuotationStatus,
    deleteQuotation,
  } = useQuotationStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Load quotations on component mount
  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  // Apply filters when search term or filters change
  useEffect(() => {
    const newFilters = {
      searchTerm: searchTerm || undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
    };
    setFilters(newFilters);
    fetchQuotations();
  }, [searchTerm, selectedStatus, setFilters, fetchQuotations]);

  const handleCreateQuotation = () => {
    setSelectedQuotation(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleSaveQuotation = async (quotationData: QuotationFormData, userId: string): Promise<boolean> => {
    try {
      if (modalMode === 'create') {
        const result = await QuotationService.createQuotation(quotationData, userId);
        if (result.success) {
          await fetchQuotations();
          return true;
        }
      } else if (modalMode === 'edit' && selectedQuotation) {
        const result = await QuotationService.updateQuotation(selectedQuotation.id, quotationData);
        if (result.success) {
          await fetchQuotations();
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error saving quotation:', error);
      return false;
    }
  };

  const handleEditQuotation = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleViewQuotation = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setModalMode('view');
    setShowModal(true);
  };

  const handleDeleteQuotation = (quotationId: string) => {
    setShowDeleteConfirm(quotationId);
  };

  const confirmDelete = async (quotationId: string) => {
    const success = await deleteQuotation(quotationId);
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

  const getStatusBadge = (status: Quotation['status']) => {
    const statusConfig = QUOTATION_STATUSES.find(s => s.value === status);
    if (!statusConfig) return null;

    const colorClasses = {
      green: 'bg-green-100 text-green-800 border-green-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-200',
    };

    const icons = {
      draft: Clock,
      sent: Send,
      accepted: CheckCircle,
      rejected: XCircle,
      expired: AlertTriangle,
    };

    const Icon = icons[status] || Clock;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${colorClasses[statusConfig.color]}`}>
        <Icon className="h-3 w-3 mr-1" />
        {statusConfig.label}
      </span>
    );
  };

  const handleStatusUpdate = async (quotationId: string, status: Quotation['status']) => {
    await updateQuotationStatus(quotationId, status);
  };

  if (loading && quotations.length === 0) {
    return (
      <div className="animate-pulse space-y-6 p-6 lg:p-8">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
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
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="text-left">
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight lg:text-4xl">
              Quotations
            </h1>
            <p className="mt-2 text-purple-100 text-base lg:text-lg">
              Manage customer quotations and proposals
            </p>
          </div>
          <button
            onClick={handleCreateQuotation}
            className="inline-flex items-center px-6 py-3 bg-white text-purple-700 rounded-lg hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-600 transition-all font-medium shadow-sm"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Quotation
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 lg:p-8 space-y-6 lg:space-y-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="ml-4 text-left">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalQuotations}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Send className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4 text-left">
                  <p className="text-sm font-medium text-gray-600">Sent</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.sentCount}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="ml-4 text-left">
                  <p className="text-sm font-medium text-gray-600">Accepted</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.acceptedCount}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                <div className="ml-4 text-left">
                  <p className="text-sm font-medium text-gray-600">Expired</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.expiredCount}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <FileText className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
                <div className="ml-4 text-left">
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalValue)}</p>
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
                placeholder="Search quotations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-gray-400"
                aria-label="Search quotations"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-gray-400 bg-white"
                aria-label="Filter by status"
              >
                <option value="all">All Status</option>
                {QUOTATION_STATUSES.map((status) => (
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

        {/* Quotations Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading && quotations.length > 0 && (
            <div className="border-l-4 border-purple-400 bg-purple-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-purple-700">Updating quotations...</p>
                </div>
              </div>
            </div>
          )}

          {quotations.length === 0 && !loading ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No quotations found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedStatus !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Get started by creating your first quotation'}
              </p>
              <button
                onClick={handleCreateQuotation}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Quotation
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quotation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valid Until
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
                  {quotations.map((quotation) => (
                    <tr key={quotation.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                              <FileText className="h-5 w-5 text-purple-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {quotation.quotationNumber}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(quotation.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {quotation.customer?.name || 'Unknown Customer'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {quotation.customer?.company}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(quotation.totalAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(quotation.validUntil).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(quotation.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleViewQuotation(quotation)}
                            className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1"
                            aria-label={`View quotation ${quotation.quotationNumber}`}
                            title="View quotation"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {quotation.status === 'draft' && (
                            <button
                              onClick={() => handleEditQuotation(quotation)}
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                              aria-label={`Edit quotation ${quotation.quotationNumber}`}
                              title="Edit quotation"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}
                          {quotation.status === 'draft' && (
                            <button
                              onClick={() => handleStatusUpdate(quotation.id, 'sent')}
                              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                              title="Send quotation"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteQuotation(quotation.id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                            aria-label={`Delete quotation ${quotation.quotationNumber}`}
                            title="Delete quotation"
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

      {/* Quotation Modal */}
      {showModal && (
        <QuotationModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          mode={modalMode}
          quotation={selectedQuotation}
          onSave={handleSaveQuotation}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowDeleteConfirm(null)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="delete-modal-title">
                      Delete Quotation
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this quotation? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse space-y-2 sm:space-y-0 sm:space-x-reverse sm:space-x-3">
                <button
                  type="button"
                  onClick={() => confirmDelete(showDeleteConfirm)}
                  disabled={loading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(null)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:w-auto sm:text-sm transition-all"
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
