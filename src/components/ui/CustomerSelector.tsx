import React, { useState, useEffect, useRef } from 'react';
import { Search, User, Building2, Plus, Phone, Mail, MapPin, Check } from 'lucide-react';
import { CustomerService } from '../../services/customerService';
import type { Customer, CustomerFormData } from '../../types/customer';

interface CustomerSelectorProps {
  selectedCustomer: Customer | null;
  onCustomerSelect: (customer: Customer) => void;
  onNewCustomerCreate: (customerData: CustomerFormData) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
}

interface NewCustomerData {
  name: string;
  email: string;
  phone: string;
  company: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export const CustomerSelector: React.FC<CustomerSelectorProps> = ({
  selectedCustomer,
  onCustomerSelect,
  onNewCustomerCreate,
  disabled = false,
  className = '',
  placeholder = 'Search customers...',
  required = false,
  error
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState<NewCustomerData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
    }
  });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.length > 0) {
        handleSearch(searchTerm);
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setShowNewCustomerForm(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (term: string) => {
    if (term.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsLoading(true);
    try {
      const result = await CustomerService.searchCustomers(term, 8);
      if (result.success && result.data) {
        setSearchResults(result.data);
        setShowDropdown(true);
      }
    } catch (error) {
      console.error('Error searching customers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomerSelect = (customer: Customer) => {
    onCustomerSelect(customer);
    setSearchTerm(customer.name);
    setShowDropdown(false);
    setShowNewCustomerForm(false);
  };

  const handleCreateNewCustomer = () => {
    setNewCustomerData(prev => ({ ...prev, name: searchTerm }));
    setShowNewCustomerForm(true);
    setShowDropdown(false);
  };

  const handleSaveNewCustomer = async () => {
    if (!newCustomerData.name || !newCustomerData.phone) {
      return; // Basic validation
    }

    setIsLoading(true);
    try {
      const customerData: CustomerFormData = {
        name: newCustomerData.name.trim(),
        email: newCustomerData.email.trim() || undefined,
        phone: newCustomerData.phone.trim(),
        company: newCustomerData.company.trim() || undefined,
        address: {
          street: newCustomerData.address.street.trim(),
          city: newCustomerData.address.city.trim(),
          state: newCustomerData.address.state.trim(),
          postalCode: newCustomerData.address.zipCode.trim(),
        }
      };

      const result = await CustomerService.createCustomer(customerData);
      if (result.success && result.data) {
        onNewCustomerCreate(customerData);
        handleCustomerSelect(result.data);
        setNewCustomerData({
          name: '',
          email: '',
          phone: '',
          company: '',
          address: { street: '', city: '', state: '', zipCode: '' }
        });
        setShowNewCustomerForm(false);
      }
    } catch (error) {
      console.error('Error creating customer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    setSearchTerm(value);
    if (selectedCustomer && value !== selectedCustomer.name) {
      // Clear selection if user starts typing something different
      onCustomerSelect({} as Customer);
    }
  };

  const clearSelection = () => {
    setSearchTerm('');
    setShowDropdown(false);
    setShowNewCustomerForm(false);
    onCustomerSelect({} as Customer);
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Main Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (searchResults.length > 0) setShowDropdown(true);
          }}
          disabled={disabled}
          required={required}
          className={`
            w-full pl-10 pr-10 py-3 border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-50 disabled:cursor-not-allowed
            ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
            ${selectedCustomer ? 'bg-green-50 border-green-300' : ''}
          `}
          placeholder={placeholder}
        />
        
        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        )}

        {/* Selected indicator */}
        {selectedCustomer && !isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              onClick={clearSelection}
              className="text-green-600 hover:text-green-800"
              title="Clear selection"
            >
              <Check className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Dropdown */}
      {showDropdown && !disabled && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {searchResults.length > 0 ? (
            <div className="max-h-64 overflow-y-auto">
              {searchResults.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => handleCustomerSelect(customer)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                >
                  <div className="flex-shrink-0">
                    {customer.company ? (
                      <Building2 className="h-5 w-5 text-blue-500" />
                    ) : (
                      <User className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{customer.name}</div>
                    <div className="text-sm text-gray-500 flex items-center space-x-2">
                      {customer.company && (
                        <span>{customer.company}</span>
                      )}
                      {customer.company && customer.phone && <span>•</span>}
                      <span>{customer.phone}</span>
                    </div>
                    {customer.email && (
                      <div className="text-xs text-gray-400">{customer.email}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : searchTerm.length > 2 && !isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <p className="mb-2">No customers found matching "{searchTerm}"</p>
            </div>
          ) : null}
          
          {/* Add new customer option */}
          {searchTerm.length > 0 && !selectedCustomer && (
            <button
              onClick={handleCreateNewCustomer}
              className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center space-x-3 border-t border-gray-200 text-blue-600 font-medium transition-colors duration-150"
            >
              <Plus className="h-5 w-5" />
              <span>Create new customer "{searchTerm}"</span>
            </button>
          )}
        </div>
      )}

      {/* New Customer Form */}
      {showNewCustomerForm && (
        <div className="absolute z-30 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Create New Customer</h3>
            <button
              onClick={() => setShowNewCustomerForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCustomerData.name}
                  onChange={(e) => setNewCustomerData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Customer name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  value={newCustomerData.company}
                  onChange={(e) => setNewCustomerData(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Company name"
                />
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={newCustomerData.phone}
                  onChange={(e) => setNewCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newCustomerData.email}
                  onChange={(e) => setNewCustomerData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email address"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input
                type="text"
                value={newCustomerData.address.street}
                onChange={(e) => setNewCustomerData(prev => ({
                  ...prev,
                  address: { ...prev.address, street: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Street address"
              />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={newCustomerData.address.city}
                  onChange={(e) => setNewCustomerData(prev => ({
                    ...prev,
                    address: { ...prev.address, city: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="City"
                />
                <input
                  type="text"
                  value={newCustomerData.address.state}
                  onChange={(e) => setNewCustomerData(prev => ({
                    ...prev,
                    address: { ...prev.address, state: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="State/Province"
                />
                <input
                  type="text"
                  value={newCustomerData.address.zipCode}
                  onChange={(e) => setNewCustomerData(prev => ({
                    ...prev,
                    address: { ...prev.address, zipCode: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ZIP/Postal Code"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowNewCustomerForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-150"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNewCustomer}
                disabled={!newCustomerData.name || !newCustomerData.phone || isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-150 flex items-center space-x-2"
              >
                {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>}
                <span>Create Customer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Customer Display */}
      {selectedCustomer && !showNewCustomerForm && (
        <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {selectedCustomer.company ? (
                  <Building2 className="h-6 w-6 text-green-600 mt-1" />
                ) : (
                  <User className="h-6 w-6 text-green-600 mt-1" />
                )}
              </div>
              <div>
                <h4 className="font-medium text-green-900">{selectedCustomer.name}</h4>
                {selectedCustomer.company && (
                  <p className="text-sm text-green-700">{selectedCustomer.company}</p>
                )}
                <div className="mt-2 space-y-1 text-sm text-green-700">
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
                      {selectedCustomer.address.city}
                      {selectedCustomer.address.state && `, ${selectedCustomer.address.state}`}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={clearSelection}
              className="text-green-600 hover:text-green-800 p-1"
              title="Clear selection"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
