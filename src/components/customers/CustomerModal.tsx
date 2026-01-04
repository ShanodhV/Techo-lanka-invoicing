import React, { useState, useEffect } from 'react';
import { X, User, Building2, Phone, Mail, MapPin, FileText } from 'lucide-react';
import type { Customer, CustomerFormData } from '../../types/customer';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'view';
  customer?: Customer | null;
  onSave: (customerData: CustomerFormData) => Promise<boolean>;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  mode,
  customer,
  onSave,
}) => {
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    },
    company: '',
    taxNumber: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && customer) {
        setFormData({
          name: customer.name,
          email: customer.email || '',
          phone: customer.phone,
          address: {
            street: customer.address?.street || '',
            city: customer.address?.city || '',
            state: customer.address?.state || '',
            postalCode: customer.address?.postalCode || '',
            country: customer.address?.country || '',
          },
          company: customer.company || '',
          taxNumber: customer.taxNumber || '',
          notes: customer.notes || '',
        });
      } else if (mode === 'create') {
        setFormData({
          name: '',
          email: '',
          phone: '',
          address: {
            street: '',
            city: '',
            state: '',
            postalCode: '',
            country: '',
          },
          company: '',
          taxNumber: '',
          notes: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, customer]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'view') {
      onClose();
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const success = await onSave(formData);
      if (success) {
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CustomerFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address!,
        [field]: value,
      },
    }));
  };

  if (!isOpen) return null;

  const title = {
    create: 'Add New Customer',
    edit: 'Edit Customer',
    view: 'Customer Details',
  }[mode];

  const isReadOnly = mode === 'view';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-500" />
                {title}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white">
            <div className="px-6 py-4 max-h-96 overflow-y-auto">
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Basic Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        disabled={isReadOnly}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                          errors.name ? 'border-red-500' : 'border-gray-300'
                        } ${isReadOnly ? 'bg-gray-50' : 'hover:border-gray-400'}`}
                        placeholder="Enter customer name"
                      />
                      {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="tel"
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          disabled={isReadOnly}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                            errors.phone ? 'border-red-500' : 'border-gray-300'
                          } ${isReadOnly ? 'bg-gray-50' : 'hover:border-gray-400'}`}
                          placeholder="Enter phone number"
                        />
                      </div>
                      {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="email"
                          id="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          disabled={isReadOnly}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                            errors.email ? 'border-red-500' : 'border-gray-300'
                          } ${isReadOnly ? 'bg-gray-50' : 'hover:border-gray-400'}`}
                          placeholder="Enter email address"
                        />
                      </div>
                      {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                    </div>

                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                        Company
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          id="company"
                          value={formData.company}
                          onChange={(e) => handleInputChange('company', e.target.value)}
                          disabled={isReadOnly}
                          className={`w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                            isReadOnly ? 'bg-gray-50' : 'hover:border-gray-400'
                          }`}
                          placeholder="Enter company name"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="taxNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        Tax Number
                      </label>
                      <input
                        type="text"
                        id="taxNumber"
                        value={formData.taxNumber}
                        onChange={(e) => handleInputChange('taxNumber', e.target.value)}
                        disabled={isReadOnly}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                          isReadOnly ? 'bg-gray-50' : 'hover:border-gray-400'
                        }`}
                        placeholder="Enter tax number"
                      />
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Address Information
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        id="street"
                        value={formData.address?.street || ''}
                        onChange={(e) => handleAddressChange('street', e.target.value)}
                        disabled={isReadOnly}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                          isReadOnly ? 'bg-gray-50' : 'hover:border-gray-400'
                        }`}
                        placeholder="Enter street address"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          id="city"
                          value={formData.address?.city || ''}
                          onChange={(e) => handleAddressChange('city', e.target.value)}
                          disabled={isReadOnly}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                            isReadOnly ? 'bg-gray-50' : 'hover:border-gray-400'
                          }`}
                          placeholder="Enter city"
                        />
                      </div>

                      <div>
                        <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                          State/Province
                        </label>
                        <input
                          type="text"
                          id="state"
                          value={formData.address?.state || ''}
                          onChange={(e) => handleAddressChange('state', e.target.value)}
                          disabled={isReadOnly}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                            isReadOnly ? 'bg-gray-50' : 'hover:border-gray-400'
                          }`}
                          placeholder="Enter state"
                        />
                      </div>

                      <div>
                        <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          id="postalCode"
                          value={formData.address?.postalCode || ''}
                          onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                          disabled={isReadOnly}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                            isReadOnly ? 'bg-gray-50' : 'hover:border-gray-400'
                          }`}
                          placeholder="Enter postal code"
                        />
                      </div>

                      <div>
                        <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                          Country
                        </label>
                        <input
                          type="text"
                          id="country"
                          value={formData.address?.country || ''}
                          onChange={(e) => handleAddressChange('country', e.target.value)}
                          disabled={isReadOnly}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                            isReadOnly ? 'bg-gray-50' : 'hover:border-gray-400'
                          }`}
                          placeholder="Enter country"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Additional Information
                  </h4>
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      id="notes"
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      disabled={isReadOnly}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none ${
                        isReadOnly ? 'bg-gray-50' : 'hover:border-gray-400'
                      }`}
                      placeholder="Enter any additional notes"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-3 sm:flex sm:flex-row-reverse space-y-2 sm:space-y-0 sm:space-x-reverse sm:space-x-3">
              {mode !== 'view' && (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : mode === 'create' ? 'Create Customer' : 'Update Customer'}
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm transition-all"
              >
                {mode === 'view' ? 'Close' : 'Cancel'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
