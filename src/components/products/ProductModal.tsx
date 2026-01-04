import React, { useState, useEffect } from 'react';
import { X, Save, Loader } from 'lucide-react';
import type { Product, ProductFormData } from '../../types/product';
import { PRODUCT_CATEGORIES } from '../../types/product';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: ProductFormData) => Promise<boolean>;
  product?: Product | null;
  mode: 'create' | 'edit' | 'view';
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  product,
  mode
}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    category: '',
    sku: '',
    price: 0,
    cost: 0,
    stock: 0,
    lowStockThreshold: 5,
    warranty: '',
    supplier: '',
    specifications: {},
  });

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes or product changes
  useEffect(() => {
    if (isOpen && product && (mode === 'edit' || mode === 'view')) {
      setFormData({
        name: product.name,
        description: product.description || '',
        category: product.category,
        sku: product.sku || '',
        price: product.price,
        cost: product.cost || 0,
        stock: product.stock,
        lowStockThreshold: product.lowStockThreshold || 5,
        warranty: product.warranty || '',
        supplier: product.supplier || '',
        specifications: product.specifications || {},
      });
    } else if (isOpen && mode === 'create') {
      setFormData({
        name: '',
        description: '',
        category: '',
        sku: '',
        price: 0,
        cost: 0,
        stock: 0,
        lowStockThreshold: 5,
        warranty: '',
        supplier: '',
        specifications: {},
      });
    }
    setErrors({});
  }, [isOpen, product, mode]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (formData.stock < 0) {
      newErrors.stock = 'Stock cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const success = await onSave(formData);
      if (success) {
        onClose();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof ProductFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  const isReadOnly = mode === 'view';
  const title = mode === 'create' ? 'Add New Product' : mode === 'edit' ? 'Edit Product' : 'Product Details';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                } ${isReadOnly ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                placeholder="Enter product name"
                readOnly={isReadOnly}
                aria-label="Product Name"
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all ${
                  errors.category ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                } ${isReadOnly ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                disabled={isReadOnly}
                aria-label="Product Category"
              >
                <option value="">Select Category</option>
                {PRODUCT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && <p className="text-red-600 text-sm mt-1">{errors.category}</p>}
            </div>

            {/* SKU */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                SKU
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => handleInputChange('sku', e.target.value)}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all hover:border-gray-400 ${
                  isReadOnly ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                }`}
                placeholder="Product SKU"
                readOnly={isReadOnly}
                aria-label="Product SKU"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Price (LKR) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all ${
                  errors.price ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                } ${isReadOnly ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                placeholder="0.00"
                readOnly={isReadOnly}
                aria-label="Product Price"
              />
              {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price}</p>}
            </div>

            {/* Cost */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cost (LKR)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.cost}
                onChange={(e) => handleInputChange('cost', parseFloat(e.target.value) || 0)}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all hover:border-gray-400 ${
                  isReadOnly ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                }`}
                placeholder="0.00"
                readOnly={isReadOnly}
                aria-label="Product Cost"
              />
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Stock Quantity *
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all ${
                  errors.stock ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                } ${isReadOnly ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                placeholder="0"
                readOnly={isReadOnly}
                aria-label="Stock Quantity"
              />
              {errors.stock && <p className="text-red-600 text-sm mt-1">{errors.stock}</p>}
            </div>

            {/* Low Stock Threshold */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Low Stock Threshold
              </label>
              <input
                type="number"
                min="0"
                value={formData.lowStockThreshold}
                onChange={(e) => handleInputChange('lowStockThreshold', parseInt(e.target.value) || 5)}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all hover:border-gray-400 ${
                  isReadOnly ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                }`}
                placeholder="5"
                readOnly={isReadOnly}
                aria-label="Low Stock Threshold"
              />
            </div>

            {/* Supplier */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Supplier
              </label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) => handleInputChange('supplier', e.target.value)}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all hover:border-gray-400 ${
                  isReadOnly ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                }`}
                placeholder="Supplier name"
                readOnly={isReadOnly}
                aria-label="Supplier"
              />
            </div>

            {/* Warranty */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Warranty Period
              </label>
              <input
                type="text"
                value={formData.warranty}
                onChange={(e) => handleInputChange('warranty', e.target.value)}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all hover:border-gray-400 ${
                  isReadOnly ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                }`}
                placeholder="e.g., 2 years"
                readOnly={isReadOnly}
                aria-label="Warranty Period"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all hover:border-gray-400 resize-none ${
                  isReadOnly ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                }`}
                rows={4}
                placeholder="Product description..."
                readOnly={isReadOnly}
                aria-label="Product Description"
              />
            </div>
          </div>

          {/* Action Buttons */}
          {!isReadOnly && (
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>{mode === 'create' ? 'Create Product' : 'Update Product'}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* View mode close button */}
          {isReadOnly && (
            <div className="flex items-center justify-end pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all font-medium"
              >
                Close
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
