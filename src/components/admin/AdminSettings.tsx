import { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  UserPlus,
  Trash2,
  Mail,
  Clock,
  Check,
  AlertCircle,
  X,
  Key,
  Activity,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  where,
  limit,
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { AdminUser, AdminRole, AuditLogEntry } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { format } from 'date-fns';

const roleLabels: Record<AdminRole, string> = {
  super_admin: 'Super Admin',
  editor: 'Editor',
  event_manager: 'Event Manager',
  media_manager: 'Media Manager',
};

const roleDescriptions: Record<AdminRole, string> = {
  super_admin: 'Full access to everything including admin management',
  editor: 'Can manage events, content, media, and team (no theme or admin settings)',
  event_manager: 'Can only manage events',
  media_manager: 'Can only manage media uploads',
};

const roleColors: Record<AdminRole, string> = {
  super_admin: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  editor: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  event_manager: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  media_manager: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
};

export default function AdminSettings() {
  const { currentUser } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<AdminRole>('editor');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'admins' | 'activity'>('admins');

  // Fetch admins from Firestore
  useEffect(() => {
    const adminsQuery = query(
      collection(db, 'admin', 'admins', 'users'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      adminsQuery,
      (snapshot) => {
        const adminList: AdminUser[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          adminList.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || new Date(),
            invitedAt: data.invitedAt?.toDate?.() || undefined,
            lastLogin: data.lastLogin?.toDate?.() || undefined,
          } as AdminUser);
        });
        setAdmins(adminList);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching admins:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Fetch audit log
  useEffect(() => {
    if (activeTab !== 'activity') return;

    const logQuery = query(
      collection(db, 'admin', 'auditLog', 'entries'),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      logQuery,
      (snapshot) => {
        const entries: AuditLogEntry[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          entries.push({
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate?.() || new Date(),
          } as AuditLogEntry);
        });
        setAuditLog(entries);
      },
      (error) => {
        console.error('Error fetching audit log:', error);
      }
    );

    return () => unsubscribe();
  }, [activeTab]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Check if email already exists
      const existingAdmin = admins.find((a) => a.email === inviteEmail);
      if (existingAdmin) {
        setError('This email is already registered as an admin');
        setSaving(false);
        return;
      }

      // Create admin invite
      await addDoc(collection(db, 'admin', 'admins', 'users'), {
        email: inviteEmail,
        displayName: inviteEmail.split('@')[0],
        role: inviteRole,
        invitedBy: currentUser.uid,
        invitedAt: Timestamp.now(),
        createdAt: Timestamp.now(),
        isActive: true,
      });

      // Log the action
      await addDoc(collection(db, 'admin', 'auditLog', 'entries'), {
        adminId: currentUser.uid,
        adminEmail: currentUser.email,
        action: 'Invited new admin',
        details: `Invited ${inviteEmail} as ${roleLabels[inviteRole]}`,
        resourceType: 'admin',
        timestamp: Timestamp.now(),
      });

      setSuccess(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      setInviteRole('editor');
      setShowInviteForm(false);
    } catch (err) {
      console.error('Error inviting admin:', err);
      setError('Failed to send invitation. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateRole = async (adminId: string, newRole: AdminRole) => {
    if (!currentUser) return;

    try {
      await updateDoc(doc(db, 'admin', 'admins', 'users', adminId), {
        role: newRole,
        updatedAt: Timestamp.now(),
      });

      const admin = admins.find((a) => a.id === adminId);
      await addDoc(collection(db, 'admin', 'auditLog', 'entries'), {
        adminId: currentUser.uid,
        adminEmail: currentUser.email,
        action: 'Updated admin role',
        details: `Changed ${admin?.email} role to ${roleLabels[newRole]}`,
        resourceType: 'admin',
        resourceId: adminId,
        timestamp: Timestamp.now(),
      });
    } catch (err) {
      console.error('Error updating role:', err);
      setError('Failed to update role');
    }
  };

  const handleRemoveAdmin = async (adminId: string) => {
    if (!currentUser) return;

    try {
      const admin = admins.find((a) => a.id === adminId);
      await deleteDoc(doc(db, 'admin', 'admins', 'users', adminId));

      await addDoc(collection(db, 'admin', 'auditLog', 'entries'), {
        adminId: currentUser.uid,
        adminEmail: currentUser.email,
        action: 'Removed admin',
        details: `Removed ${admin?.email} from admin list`,
        resourceType: 'admin',
        resourceId: adminId,
        timestamp: Timestamp.now(),
      });

      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error removing admin:', err);
      setError('Failed to remove admin');
    }
  };

  const getActivityIcon = (resourceType: string) => {
    switch (resourceType) {
      case 'event':
        return '📅';
      case 'media':
        return '🖼️';
      case 'content':
        return '📝';
      case 'team':
        return '👥';
      case 'theme':
        return '🎨';
      case 'admin':
        return '🔐';
      default:
        return '📌';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h2 className="text-lg font-display font-bold text-neutral-900 dark:text-white">
              Admin Settings
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Manage admin accounts and permissions
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowInviteForm(true)}
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          Invite Admin
        </Button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 text-sm flex items-center gap-2">
          <Check className="w-4 h-4" />
          {success}
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-700">
        <button
          onClick={() => setActiveTab('admins')}
          className={`px-4 py-2 -mb-px font-medium text-sm transition-colors ${
            activeTab === 'admins'
              ? 'border-b-2 border-primary-500 text-primary-500'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Shield className="w-4 h-4 inline mr-2" />
          Admin Users
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-2 -mb-px font-medium text-sm transition-colors ${
            activeTab === 'activity'
              ? 'border-b-2 border-primary-500 text-primary-500'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4 inline mr-2" />
          Activity Log
        </button>
      </div>

      {/* Admin Users Tab */}
      {activeTab === 'admins' && (
        <>
          {/* Role Descriptions */}
          <Card padding="md">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
              Role Permissions
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {(Object.keys(roleLabels) as AdminRole[]).map((role) => (
                <div
                  key={role}
                  className="flex items-start gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
                >
                  <span className={`px-2 py-1 rounded text-xs font-medium ${roleColors[role]}`}>
                    {roleLabels[role]}
                  </span>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    {roleDescriptions[role]}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Admin List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
            </div>
          ) : admins.length === 0 ? (
            <Card padding="lg">
              <div className="text-center py-12">
                <Shield className="w-16 h-16 mx-auto text-neutral-400 mb-4" />
                <p className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                  No admins configured
                </p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  Invite your first admin to get started
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowInviteForm(true)}
                >
                  Invite Admin
                </Button>
              </div>
            </Card>
          ) : (
            <Card padding="none">
              <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {admins.map((admin) => (
                  <div
                    key={admin.id}
                    className="flex items-center gap-4 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                      {admin.photoURL ? (
                        <img
                          src={admin.photoURL}
                          alt={admin.displayName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-primary-500 font-semibold">
                          {admin.displayName?.charAt(0) || admin.email?.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-neutral-900 dark:text-white truncate">
                          {admin.displayName || admin.email}
                        </p>
                        {!admin.isActive && (
                          <span className="px-2 py-0.5 bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 rounded text-xs">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {admin.email}
                      </p>
                      {admin.lastLogin && (
                        <p className="text-xs text-neutral-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Last login: {format(new Date(admin.lastLogin), 'MMM d, yyyy h:mm a')}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <select
                        value={admin.role}
                        onChange={(e) => handleUpdateRole(admin.id, e.target.value as AdminRole)}
                        className="px-3 py-1.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        {(Object.keys(roleLabels) as AdminRole[]).map((role) => (
                          <option key={role} value={role}>
                            {roleLabels[role]}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => setDeleteConfirm(admin.id)}
                        className="p-1.5 text-neutral-500 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      {/* Activity Log Tab */}
      {activeTab === 'activity' && (
        <Card padding="none">
          {auditLog.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-16 h-16 mx-auto text-neutral-400 mb-4" />
              <p className="text-lg font-medium text-neutral-900 dark:text-white">
                No activity yet
              </p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {auditLog.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 p-4">
                  <span className="text-2xl">{getActivityIcon(entry.resourceType)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900 dark:text-white">
                      {entry.action}
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {entry.details}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      by {entry.adminEmail} • {format(new Date(entry.timestamp), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Invite Form Modal */}
      <AnimatePresence>
        {showInviteForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowInviteForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-neutral-800 rounded-xl p-6 max-w-md w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Invite New Admin
                </h3>
                <button
                  onClick={() => setShowInviteForm(false)}
                  className="p-1 text-neutral-500 hover:text-neutral-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="admin@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Role *
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as AdminRole)}
                    className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {(Object.keys(roleLabels) as AdminRole[]).map((role) => (
                      <option key={role} value={role}>
                        {roleLabels[role]}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-neutral-500 mt-1">
                    {roleDescriptions[inviteRole]}
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowInviteForm(false)}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={saving}
                    leftIcon={saving ? undefined : <Mail className="w-4 h-4" />}
                  >
                    {saving ? 'Sending...' : 'Send Invitation'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-neutral-800 rounded-xl p-6 max-w-sm w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                Remove Admin?
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                This admin will lose access to the dashboard immediately.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleRemoveAdmin(deleteConfirm)}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Remove
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
