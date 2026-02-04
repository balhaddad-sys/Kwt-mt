import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheck, Upload, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function StudentVerification() {
  const { currentUser, userProfile } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [university, setUniversity] = useState(userProfile?.university || '');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  if (!currentUser || !userProfile) return null;

  const status = userProfile.verificationStatus;

  const handleSubmit = async () => {
    if (!file || !university.trim()) {
      setError('Please select your university and upload your Student ID.');
      return;
    }
    setError('');
    setUploading(true);

    try {
      const storageRef = ref(storage, `id_cards/${currentUser.uid}_${Date.now()}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);

      await updateDoc(doc(db, 'users', currentUser.uid), {
        verificationStatus: 'pending',
        studentIdURL: url,
        university: university.trim(),
      });
    } catch (err) {
      console.error('Verification upload error:', err);
      setError('Upload failed. Please try again.');
    }
    setUploading(false);
  };

  // Already verified
  if (status === 'verified') {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-8 h-8 text-green-600" />
          <div>
            <h3 className="font-semibold text-green-800 dark:text-green-200">Verified Student</h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              You have full access to the Senior Archive and all community resources.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Pending review
  if (status === 'pending') {
    return (
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <Clock className="w-8 h-8 text-amber-600" />
          <div>
            <h3 className="font-semibold text-amber-800 dark:text-amber-200">Verification Pending</h3>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Your Student ID is under review. An admin will approve your access shortly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Rejected
  if (status === 'rejected') {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-3">
          <XCircle className="w-8 h-8 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-800 dark:text-red-200">Verification Rejected</h3>
            <p className="text-sm text-red-700 dark:text-red-300">
              Your previous submission was not approved. Please re-upload a clear photo of your Student ID.
            </p>
          </div>
        </div>
        {/* Show re-upload form below */}
        {renderUploadForm()}
      </div>
    );
  }

  // No status yet - show upload form
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <ShieldCheck className="w-8 h-8 text-blue-600" />
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Verify Your Student Status</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Upload your University Student ID to unlock the Senior Archive and community resources.
          </p>
        </div>
      </div>
      {renderUploadForm()}
    </div>
  );

  function renderUploadForm() {
    return (
      <div className="space-y-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            University
          </label>
          <select
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Select your university</option>
            <option value="University of Malta">University of Malta</option>
            <option value="MCAST">MCAST</option>
            <option value="Barts Medical School Malta">Barts Medical School Malta</option>
            <option value="Queen Mary University Malta">Queen Mary University Malta</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Student ID Photo
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Please blur your Civil ID number for privacy. We only need to see your name, photo, and university logo.
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-gray-600 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-300"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={uploading}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <Upload className="w-4 h-4" />
          {uploading ? 'Submitting...' : 'Submit for Verification'}
        </button>
      </div>
    );
  }
}
