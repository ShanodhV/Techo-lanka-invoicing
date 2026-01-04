import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Edit, Trash2, Eye, Filter, Building2, Phone, Mail } from 'lucide-react';
import { useCustomerStore } from '../store/customerStore';
import { CustomerModal } from '../components/customers/CustomerModal';
import type { Customer, CustomerFormData } from '../types/customer';

export const Customers: React.FC = () => {
  const {
    customers,
    loading,
    error,
    stats,
    setFilters,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  } = useCustomerStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showCompanyOnly, setShowCompanyOnly] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Load customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Apply filters when search term or filters change
  useEffect(() => {
    const newFilters = {
      searchTerm: searchTerm || undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      company: showCompanyOnly || undefined,
    };
    setFilters(newFilters);
    fetchCustomers();
  }, [searchTerm, selectedStatus, showCompanyOnly, setFilters, fetchCustomers]);

  const handleCreateCustomer = () => {
    setSelectedCustomer(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setModalMode('view');
    setShowModal(true);
  };

  const handleDeleteCustomer = (customerId: string) => {
    setShowDeleteConfirm(customerId);
  };

  const confirmDelete = async (customerId: string) => {
    const success = await deleteCustomer(customerId);
    if (success) {
      setShowDeleteConfirm(null);
    }
  };

  const handleModalSave = async (customerData: CustomerFormData) => {
    if (modalMode === 'create') {
      return await createCustomer(customerData);
    } else {
      return selectedCustomer ? await updateCustomer(selectedCustomer.id, customerData) : false;
    }
  };

  const getStatusBadge = (status: Customer['status']) => {
    const colors = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${colors[status]}`}>
        {status === 'active' ? 'Active' : 'Inactive'}
      </span>
    );
  };

  if (loading && customers.length === 0) {
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
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="text-left">
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight lg:text-4xl">
              Customers
            </h1>
            <p className="mt-2 text-blue-100 text-base lg:text-lg">
              Manage your customer database
            </p>
          </div>
          <button
            onClick={handleCreateCustomer}
            className="inline-flex items-center px-6 py-3 bg-white text-blue-700 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 transition-all font-medium shadow-sm"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Customer
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
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4 text-left">
                  <p className="text-sm font-medium text-gray-600">Total Customers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="ml-4 text-left">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeCustomers}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Building2 className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                <div className="ml-4 text-left">
                  <p className="text-sm font-medium text-gray-600">Companies</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.companiesCount}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <Users className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
                <div className="ml-4 text-left">
                  <p className="text-sm font-medium text-gray-600">Inactive</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.inactiveCustomers}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-400"
                aria-label="Search customers"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-400 bg-white"
                aria-label="Filter by status"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCompanyOnly}
                  onChange={(e) => setShowCompanyOnly(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Companies only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Customers Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading && customers.length > 0 && (
            <div className="border-l-4 border-blue-400 bg-blue-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-blue-700">Updating customers...</p>
                </div>
              </div>
            </div>
          )}

          {customers.length === 0 && !loading ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedStatus !== 'all' || showCompanyOnly
                  ? 'Try adjusting your filters'
                  : 'Get started by adding your first customer'}
              </p>
              <button
                onClick={handleCreateCustomer}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Your First Customer
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
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
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {customer.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {customer.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {customer.address?.city && customer.address?.state && 
                                `${customer.address.city}, ${customer.address.state}`
                              }
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {customer.phone && (
                            <div className="flex items-center text-sm text-gray-900">
                              <Phone className="h-4 w-4 mr-2 text-gray-400" />
                              {customer.phone}
                            </div>
                          )}
                          {customer.email && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Mail className="h-4 w-4 mr-2 text-gray-400" />
                              {customer.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {customer.company ? (
                          <div className="flex items-center">
                            <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="text-sm text-gray-900">{customer.company}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Individual</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(customer.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleViewCustomer(customer)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                            aria-label={`View ${customer.name}`}
                            title="View customer"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditCustomer(customer)}
                            className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-1"
                            aria-label={`Edit ${customer.name}`}
                            title="Edit customer"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCustomer(customer.id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                            aria-label={`Delete ${customer.name}`}
                            title="Delete customer"
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

      {/* Customer Modal */}
      {showModal && (
        <CustomerModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          mode={modalMode}
          customer={selectedCustomer}
          onSave={handleModalSave}
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
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="delete-modal-title">
                      Delete Customer
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this customer? This action cannot be undone and will remove all associated data.
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
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm transition-all"
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
