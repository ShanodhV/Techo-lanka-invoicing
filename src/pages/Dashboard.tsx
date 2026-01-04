import React, { useEffect } from 'react';
import {
  Package,
  Receipt,
  DollarSign,
  FileText,
  AlertTriangle,
  TrendingUp,
  Users,
  Clock,
} from 'lucide-react';
import { useDashboardStore } from '../store';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  color: 'primary' | 'green' | 'yellow' | 'red' | 'blue';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, change, color }) => {
  const colorClasses = {
    primary: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white',
    green: 'bg-gradient-to-r from-green-500 to-green-600 text-white',
    yellow: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white',
    red: 'bg-gradient-to-r from-red-500 to-red-600 text-white',
    blue: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
  };

  const bgColorClasses = {
    primary: 'bg-white border-primary-200',
    green: 'bg-white border-green-200',
    yellow: 'bg-white border-yellow-200',
    red: 'bg-white border-red-200',
    blue: 'bg-white border-blue-200',
  };

  return (
    <div className={`relative bg-white rounded-xl shadow-sm border-2 ${bgColorClasses[color]} hover:shadow-md transition-all duration-200 overflow-hidden group`}>
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`p-3 rounded-lg ${colorClasses[color]} group-hover:scale-110 transition-transform duration-200`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1 text-left">
            <dl>
              <dt className="text-sm font-medium text-gray-600 uppercase tracking-wide">{title}</dt>
              <dd className="flex items-baseline mt-1">
                <div className="text-2xl font-bold text-gray-900">{value}</div>
                {change && (
                  <p
                    className={`ml-2 flex items-baseline text-sm font-semibold ${
                      change.type === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    <TrendingUp
                      className={`self-center flex-shrink-0 h-4 w-4 ${
                        change.type === 'decrease' ? 'rotate-180' : ''
                      }`}
                    />
                    <span className="ml-1">{change.value}%</span>
                  </p>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colorClasses[color].replace('text-white', '').trim()}`}></div>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const { stats, recentActivities, loading, setStats, setRecentActivities } = useDashboardStore();

  useEffect(() => {
    // Simulate loading dashboard data
    const loadDashboardData = async () => {
      // Mock data - replace with actual API calls
      setStats({
        totalStockValue: 125000,
        totalInvoices: 247,
        monthlySales: 85000,
        pendingQuotations: 12,
        lowStockProducts: 5,
      });

      setRecentActivities([
        {
          id: '1',
          type: 'invoice_created',
          description: 'Invoice INV-2026-0001 created for John Doe',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        },
        {
          id: '2',
          type: 'quotation_created',
          description: 'Quotation QUO-2026-0001 created for ABC Company',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        },
        {
          id: '3',
          type: 'product_added',
          description: 'New product "IP Camera DS-2CD2143G2-I" added to inventory',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        },
        {
          id: '4',
          type: 'payment_received',
          description: 'Payment of Rs. 45,000 received for Invoice INV-2025-0245',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        },
        {
          id: '5',
          type: 'customer_added',
          description: 'New customer "XYZ Trading" added to database',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        },
      ]);
    };

    loadDashboardData();
  }, [setStats, setRecentActivities]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
    }).format(amount);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60)),
      'hour'
    );
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'invoice_created':
        return Receipt;
      case 'quotation_created':
        return FileText;
      case 'product_added':
        return Package;
      case 'payment_received':
        return DollarSign;
      case 'customer_added':
        return Users;
      default:
        return Clock;
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white overflow-hidden shadow rounded-lg h-24"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Full width at top */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6 lg:p-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0 text-left">
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight lg:text-4xl">
              Dashboard
            </h1>
            <p className="mt-2 text-primary-100 text-base lg:text-lg">
              Welcome to Techo Lanka CCTV Management System
            </p>
          </div>
          <div className="mt-6 md:mt-0 md:ml-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3">
              <span className="text-primary-100 text-sm font-medium">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 lg:p-8 space-y-6 lg:space-y-8">
        {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 -mt-4 lg:gap-6">
        <StatCard
          title="Total Stock Value"
          value={formatCurrency(stats.totalStockValue)}
          icon={Package}
          change={{ value: 12, type: 'increase' }}
          color="primary"
        />
        <StatCard
          title="Total Invoices"
          value={stats.totalInvoices}
          icon={Receipt}
          change={{ value: 8, type: 'increase' }}
          color="green"
        />
        <StatCard
          title="Monthly Sales"
          value={formatCurrency(stats.monthlySales)}
          icon={DollarSign}
          change={{ value: 15, type: 'increase' }}
          color="blue"
        />
        <StatCard
          title="Pending Quotations"
          value={stats.pendingQuotations}
          icon={FileText}
          color="yellow"
        />
      </div>

      {/* Low Stock Alert */}
      {stats.lowStockProducts > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl shadow-sm">
          <div className="p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="ml-4 text-left">
                <h3 className="text-lg font-semibold text-red-900">
                  Low Stock Alert
                </h3>
                <p className="mt-2 text-red-700">
                  {stats.lowStockProducts} products are running low on stock and need immediate attention.
                </p>
                <div className="mt-4">
                  <a 
                    href="/products" 
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                  >
                    View Products
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 xl:gap-8">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 text-left">Recent Activities</h2>
                <a 
                  href="/activities" 
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                  View all →
                </a>
              </div>
            </div>
            <div className="p-6">
              <div className="flow-root">
                <ul className="divide-y divide-gray-100">
                  {recentActivities.slice(0, 5).map((activity) => {
                    const Icon = getActivityIcon(activity.type);
                    return (
                      <li key={activity.id} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center">
                              <Icon className="h-5 w-5 text-gray-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-medium text-gray-900 leading-relaxed">
                              {activity.description}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {formatTime(activity.timestamp)}
                            </p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 text-left">Quick Actions</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 xl:grid-cols-1 gap-4">
                <button className="group bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-lg p-4 transition-all duration-200 shadow-sm hover:shadow-md">
                  <div className="flex flex-col xl:flex-row xl:items-center xl:justify-start xl:text-left items-center text-center">
                    <Receipt className="h-6 w-6 mb-2 xl:mb-0 xl:mr-3 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Create Invoice</span>
                  </div>
                </button>
                <button className="group bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-primary-300 text-gray-700 hover:text-primary-700 rounded-lg p-4 transition-all duration-200">
                  <div className="flex flex-col xl:flex-row xl:items-center xl:justify-start xl:text-left items-center text-center">
                    <FileText className="h-6 w-6 mb-2 xl:mb-0 xl:mr-3 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">New Quotation</span>
                  </div>
                </button>
                <button className="group bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-primary-300 text-gray-700 hover:text-primary-700 rounded-lg p-4 transition-all duration-200">
                  <div className="flex flex-col xl:flex-row xl:items-center xl:justify-start xl:text-left items-center text-center">
                    <Package className="h-6 w-6 mb-2 xl:mb-0 xl:mr-3 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Add Product</span>
                  </div>
                </button>
                <button className="group bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-primary-300 text-gray-700 hover:text-primary-700 rounded-lg p-4 transition-all duration-200">
                  <div className="flex flex-col xl:flex-row xl:items-center xl:justify-start xl:text-left items-center text-center">
                    <Users className="h-6 w-6 mb-2 xl:mb-0 xl:mr-3 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Add Customer</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};
