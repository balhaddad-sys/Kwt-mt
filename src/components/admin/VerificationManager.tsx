import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { User } from '../../types';
import { ShieldCheck, CheckCircle, XCircle, ExternalLink, Clock } from 'lucide-react';

export default function VerificationManager() {
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingUsers();
  }, []);

  const loadPendingUsers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), where('verificationStatus', '==', 'pending'));
      const snapshot = await getDocs(q);
      const users = snapshot.docs.map(d => ({ ...d.data(), id: d.id })) as User[];
      setPendingUsers(users);
    } catch (error) {
      console.error('Error loading pending users:', error);
    }
    setLoading(false);
  };

  const handleApprove = async (userId: string) => {
    if (!confirm('Approve this student?')) return;
    try {
      await updateDoc(doc(db, 'users', userId), { verificationStatus: 'verified' });
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Error approving user:', error);
      alert('Failed to approve user.');
    }
  };

  const handleReject = async (userId: string) => {
    if (!confirm('Reject this student verification?')) return;
    try {
      await updateDoc(doc(db, 'users', userId), { verificationStatus: 'rejected' });
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Error rejecting user:', error);
      alert('Failed to reject user.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6" /> Student Verification
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Review and approve student ID submissions.
          </p>
        </div>
        <button
          onClick={loadPendingUsers}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading pending requests...</div>
      ) : pendingUsers.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="w-12 h-12 mx-auto text-green-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No pending verification requests.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            <Clock className="w-4 h-4 inline mr-1" /> {pendingUsers.length} pending request{pendingUsers.length !== 1 ? 's' : ''}
          </p>
          {pendingUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 flex flex-col md:flex-row md:items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white">{user.displayName}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                {user.university && (
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">{user.university}</p>
                )}
              </div>

              {user.studentIdURL && (
                <a
                  href={user.studentIdURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" /> View Student ID
                </a>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(user.id)}
                  className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <CheckCircle className="w-4 h-4" /> Approve
                </button>
                <button
                  onClick={() => handleReject(user.id)}
                  className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
