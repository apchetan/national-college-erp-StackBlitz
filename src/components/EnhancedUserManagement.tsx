import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Users, Plus, Edit2, Trash2, CheckCircle, X, Shield, UserCog, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'super_admin' | 'admin' | 'manager' | 'editor' | 'viewer';
  is_active: boolean;
  created_at: string;
}

interface Permission {
  id?: string;
  user_id: string;
  resource: 'contacts' | 'enquiries' | 'appointments' | 'admissions' | 'payments' | 'support' | 'student_status' | 'all_forms';
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_export: boolean;
  can_import: boolean;
}

export function EnhancedUserManagement() {
  const { isSuperAdmin, profile: currentProfile } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [editingPermissions, setEditingPermissions] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('full_name') as string;
    const role = formData.get('role') as string;

    try {
      // Check if email already exists in profiles
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (existingUser) {
        throw new Error('A user with this email address already exists. Please use a different email.');
      }

      // Get current session for authorization
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Call Edge Function to create user with admin privileges
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-user-management/create`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName,
          role: role,
        }),
      });

      const result = await response.json();
      console.log('Edge Function Response:', result);

      if (!response.ok) {
        console.error('API Error:', result);
        throw new Error(result.error || 'Failed to create user');
      }

      const newUserId = result.user_id;
      console.log('New user ID:', newUserId);

      if (!newUserId) {
        console.error('Invalid response:', result);
        throw new Error('Failed to get new user ID');
      }

      // Wait for trigger to create profile
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create default permissions
      const resources: Array<'contacts' | 'enquiries' | 'appointments' | 'admissions' | 'payments' | 'support' | 'student_status' | 'all_forms'> = [
        'contacts',
        'enquiries',
        'appointments',
        'admissions',
        'payments',
        'support',
        'student_status',
        'all_forms',
      ];

      const defaultPermissions = resources.map((resource) => ({
        user_id: newUserId,
        resource,
        can_view: role === 'viewer' || role === 'editor' || role === 'manager',
        can_create: role === 'editor' || role === 'manager',
        can_edit: role === 'editor' || role === 'manager',
        can_delete: role === 'manager',
        can_export: role === 'manager',
        can_import: role === 'manager',
      }));

      const { error: permError } = await supabase
        .from('user_permissions')
        .insert(defaultPermissions);

      if (permError) {
        console.error('Permission error:', permError);
        throw new Error(`Permission setup failed: ${permError.message}`);
      }

      setSuccess('User created successfully');
      setShowAddUser(false);
      loadUsers();
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      console.error('Full error:', err);
      setError(err.message || 'Unknown error occurred');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleEditUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingUser) return;

    setError('');
    setSuccess('');

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get('full_name') as string;
    const role = formData.get('role') as string;

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          role: role,
        })
        .eq('id', editingUser.id);

      if (updateError) throw updateError;

      setSuccess('User updated successfully');
      setEditingUser(null);
      loadUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentProfile?.id) {
      setError('You cannot delete your own account');
      return;
    }

    setError('');
    setSuccess('');

    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) throw error;

      setSuccess('User deleted successfully');
      setDeletingUser(null);
      loadUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to delete user. Note: User deletion requires service role key.');
      setDeletingUser(null);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    if (userId === currentProfile?.id) {
      setError('You cannot deactivate your own account');
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !currentStatus })
        .eq('id', userId);

      if (error) throw error;
      setSuccess(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      loadUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const canManageUser = (user: Profile) => {
    if (isSuperAdmin) return true;
    if (user.role === 'super_admin' || user.role === 'admin') return false;
    return true;
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800 border border-purple-300';
      case 'admin':
        return 'bg-red-100 text-red-800 border border-red-300';
      case 'manager':
        return 'bg-blue-100 text-blue-800 border border-blue-300';
      case 'editor':
        return 'bg-green-100 text-green-800 border border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  const availableRoles = isSuperAdmin
    ? [
        { value: 'super_admin', label: 'Super Admin (Full System Control)', icon: Shield },
        { value: 'admin', label: 'Admin (User Management)', icon: UserCog },
        { value: 'manager', label: 'Manager (Full Data Access)', icon: Users },
        { value: 'editor', label: 'Editor (Create & Edit)', icon: Edit2 },
        { value: 'viewer', label: 'Viewer (Read-only)', icon: Eye },
      ]
    : [
        { value: 'manager', label: 'Manager (Full Data Access)', icon: Users },
        { value: 'editor', label: 'Editor (Create & Edit)', icon: Edit2 },
        { value: 'viewer', label: 'Viewer (Read-only)', icon: Eye },
      ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">User Management</h3>
          <p className="text-sm text-gray-600">
            {isSuperAdmin
              ? 'Create and manage all users, admins, and permissions'
              : 'Create and manage regular users'}
          </p>
        </div>
        <button
          onClick={() => {
            setShowAddUser(!showAddUser);
            setEditingUser(null);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
        >
          {showAddUser ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddUser ? 'Cancel' : 'Add User'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      {showAddUser && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            Create New User
          </h4>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="full_name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  name="role"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                >
                  {availableRoles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Create User
            </button>
          </form>
        </div>
      )}

      {editingUser && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Edit2 className="w-5 h-5 text-amber-600" />
            Edit User: {editingUser.full_name}
          </h4>
          <form onSubmit={handleEditUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="full_name"
                  defaultValue={editingUser.full_name}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (Read-only)
                </label>
                <input
                  type="email"
                  value={editingUser.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-gray-100 text-gray-600"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  name="role"
                  defaultValue={editingUser.role}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white"
                >
                  {availableRoles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition"
              >
                Update User
              </button>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                          {user.full_name}
                          {user.id === currentProfile?.id && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">You</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {user.role === 'super_admin' && <Shield className="w-3 h-3" />}
                        {user.role === 'admin' && <UserCog className="w-3 h-3" />}
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                          user.is_active
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {canManageUser(user) && (
                          <>
                            <button
                              onClick={() => {
                                setEditingUser(user);
                                setShowAddUser(false);
                              }}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition"
                              title="Edit User"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingPermissions(editingPermissions === user.id ? null : user.id)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                              title="Edit Permissions"
                            >
                              <Shield className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => toggleUserStatus(user.id, user.is_active)}
                              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition"
                              title={user.is_active ? 'Deactivate' : 'Activate'}
                            >
                              {user.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            {isSuperAdmin && (
                              <button
                                onClick={() => setDeletingUser(user.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editingPermissions && (
        <PermissionsEditor
          userId={editingPermissions}
          onClose={() => setEditingPermissions(null)}
        />
      )}

      {deletingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete User</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-6">
              Are you sure you want to permanently delete this user? All their data and permissions will be removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDeleteUser(deletingUser)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
              >
                Delete User
              </button>
              <button
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PermissionsEditor({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPermissions();
  }, [userId]);

  const loadPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      const resources: Array<'contacts' | 'enquiries' | 'appointments' | 'admissions' | 'payments' | 'support' | 'student_status' | 'all_forms'> = [
        'contacts',
        'enquiries',
        'appointments',
        'admissions',
        'payments',
        'support',
        'student_status',
        'all_forms',
      ];

      const permsMap = new Map(data?.map((p) => [p.resource, p]) || []);
      const allPerms = resources.map((resource) => {
        const existing = permsMap.get(resource);
        return (
          existing || {
            user_id: userId,
            resource,
            can_view: false,
            can_create: false,
            can_edit: false,
            can_delete: false,
            can_export: false,
            can_import: false,
          }
        );
      });

      setPermissions(allPerms);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updatePermission = (
    resource: string,
    field: keyof Permission,
    value: boolean
  ) => {
    setPermissions((prev) =>
      prev.map((p) => (p.resource === resource ? { ...p, [field]: value } : p))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const perm of permissions) {
        if (perm.id) {
          await supabase.from('user_permissions').update(perm).eq('id', perm.id);
        } else {
          await supabase.from('user_permissions').insert(perm);
        }
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Manage Permissions</h3>
                <p className="text-sm text-gray-600">Control access to resources and features</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {permissions.map((perm) => (
              <div key={perm.resource} className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 transition">
                <h4 className="font-semibold text-gray-900 mb-3 capitalize flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  {perm.resource.replace('_', ' ')}
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {['view', 'create', 'edit', 'delete', 'export', 'import'].map((action) => (
                    <label key={action} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={perm[`can_${action}` as keyof Permission] as boolean}
                        onChange={(e) =>
                          updatePermission(
                            perm.resource,
                            `can_${action}` as keyof Permission,
                            e.target.checked
                          )
                        }
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 capitalize group-hover:text-blue-600 transition">{action}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Permissions'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
