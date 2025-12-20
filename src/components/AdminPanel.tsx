import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Download, Upload, Users, Database, Shield, UserCog, Settings, BarChart3 } from 'lucide-react';
import { DataExport } from './DataExport';
import { DataImport } from './DataImport';
import { EnhancedUserManagement } from './EnhancedUserManagement';

type AdminView = 'export' | 'import' | 'users' | 'roles' | 'settings' | 'analytics';

export function AdminPanel() {
  const { isSuperAdmin } = useAuth();
  const [currentView, setCurrentView] = useState<AdminView>('users');

  const userManagementViews = [
    { id: 'users' as AdminView, name: 'Users', icon: Users, description: 'Manage user accounts' },
    { id: 'roles' as AdminView, name: 'Roles & Permissions', icon: Shield, description: 'Configure roles and access', disabled: true },
  ];

  const dataManagementViews = [
    { id: 'export' as AdminView, name: 'Export Data', icon: Download, description: 'Export system data' },
    { id: 'import' as AdminView, name: 'Import Data', icon: Upload, description: 'Import bulk data' },
  ];

  const systemViews = [
    { id: 'analytics' as AdminView, name: 'Analytics', icon: BarChart3, description: 'View system analytics', disabled: true },
    { id: 'settings' as AdminView, name: 'System Settings', icon: Settings, description: 'Configure system', disabled: true },
  ];

  const renderRibbon = (title: string, views: typeof userManagementViews, bgColor: string) => (
    <div className={`${bgColor} border-b border-gray-200`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{title}</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {views.map((view) => (
            <button
              key={view.id}
              onClick={() => !view.disabled && setCurrentView(view.id)}
              disabled={view.disabled}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition whitespace-nowrap ${
                currentView === view.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : view.disabled
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 shadow-sm'
              }`}
              title={view.description}
            >
              <view.icon className="w-4 h-4" />
              {view.name}
              {view.disabled && <span className="text-xs">(Soon)</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white bg-opacity-20 rounded-xl">
              {isSuperAdmin ? (
                <Shield className="w-8 h-8 text-white" />
              ) : (
                <Database className="w-8 h-8 text-white" />
              )}
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-bold">
                {isSuperAdmin ? 'Super Admin Panel' : 'Admin Panel'}
              </h2>
              <p className="text-sm text-blue-100">
                {isSuperAdmin
                  ? 'Full system control - manage users, admins, and all data'
                  : 'Manage users and system data'}
              </p>
            </div>
          </div>
        </div>

        {isSuperAdmin && renderRibbon('User Management', userManagementViews, 'bg-gradient-to-r from-purple-50 to-pink-50')}

        {renderRibbon('Data Management', dataManagementViews, 'bg-gradient-to-r from-green-50 to-emerald-50')}

        {isSuperAdmin && renderRibbon('System Administration', systemViews, 'bg-gradient-to-r from-amber-50 to-yellow-50')}

        <div className="p-6">
          {currentView === 'export' && <DataExport />}
          {currentView === 'import' && <DataImport />}
          {currentView === 'users' && <EnhancedUserManagement />}
          {currentView === 'roles' && (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Role Management</h3>
              <p className="text-gray-600">Advanced role configuration coming soon</p>
            </div>
          )}
          {currentView === 'analytics' && (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">System Analytics</h3>
              <p className="text-gray-600">Advanced analytics dashboard coming soon</p>
            </div>
          )}
          {currentView === 'settings' && (
            <div className="text-center py-12">
              <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">System Settings</h3>
              <p className="text-gray-600">System configuration panel coming soon</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
