import { useState, useEffect } from 'react';
import { collection, query, orderBy, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { ArchiveFile } from '../types';
import { BookOpen, Upload, Download, Filter, Lock, ShieldCheck } from 'lucide-react';

const SUBJECTS = ['All', 'Medicine', 'Dentistry', 'Engineering', 'General'] as const;
type Subject = 'Medicine' | 'Dentistry' | 'Engineering' | 'General';

const subjectIcons: Record<string, string> = {
  Medicine: '🩺',
  Dentistry: '🦷',
  Engineering: '📐',
  General: '📄',
};

export default function ArchivePage() {
  const { currentUser, isAdmin, isVerified, userProfile } = useAuth();
  const [files, setFiles] = useState<ArchiveFile[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  // Upload form state
  const [showUpload, setShowUpload] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadSubject, setUploadSubject] = useState<Subject>('General');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isVerified) {
      loadFiles();
    } else {
      setLoading(false);
    }
  }, [isVerified, activeFilter]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      let q = activeFilter === 'All'
        ? query(collection(db, 'senior_archive'), orderBy('uploadedAt', 'desc'))
        : query(collection(db, 'senior_archive'), where('subject', '==', activeFilter), orderBy('uploadedAt', 'desc'));

      const snapshot = await getDocs(q);
      const loaded = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ArchiveFile[];
      setFiles(loaded);
    } catch (error) {
      console.error('Error loading archive:', error);
    }
    setLoading(false);
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadTitle || !currentUser) return;
    setUploading(true);
    try {
      const storageRef = ref(storage, `archive_files/${Date.now()}_${uploadFile.name}`);
      const snapshot = await uploadBytes(storageRef, uploadFile);
      const url = await getDownloadURL(snapshot.ref);

      await addDoc(collection(db, 'senior_archive'), {
        title: uploadTitle,
        subject: uploadSubject,
        url,
        type: uploadFile.type,
        uploadedBy: currentUser.email,
        uploadedAt: serverTimestamp(),
      });

      setUploadTitle('');
      setUploadSubject('General');
      setUploadFile(null);
      setShowUpload(false);
      loadFiles();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Upload failed. Please try again.');
    }
    setUploading(false);
  };

  // Locked state - not logged in
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20">
        <div className="max-w-2xl mx-auto text-center px-4">
          <Lock className="w-16 h-16 mx-auto text-gray-400 mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Senior Archive</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Past papers, summaries, and survival guides for Kuwaiti students.
          </p>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <p className="text-yellow-800 dark:text-yellow-200 font-medium">
              Please log in to access the Senior Archive.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Locked state - not verified
  if (!isVerified) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20">
        <div className="max-w-2xl mx-auto text-center px-4">
          <ShieldCheck className="w-16 h-16 mx-auto text-amber-500 mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Senior Archive</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Past papers, summaries, and survival guides for Kuwaiti students.
          </p>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
            <p className="text-amber-800 dark:text-amber-200 font-medium mb-2">
              Verification Required
            </p>
            <p className="text-amber-700 dark:text-amber-300 text-sm">
              {userProfile?.verificationStatus === 'pending'
                ? 'Your student ID is under review. You will get access once approved by an admin.'
                : 'You must be a verified student to access these files. Go to your profile and upload your Student ID to request verification.'}
            </p>
            {!userProfile?.verificationStatus && (
              <a href="/community" className="inline-block mt-4 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
                Submit Verification
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Verified - show archive
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <BookOpen className="w-12 h-12 mx-auto text-blue-600 dark:text-blue-400 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">The Senior Archive</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Past papers, summaries, and survival guides for Kuwaiti students.
          </p>
        </div>

        {/* Admin Upload Panel */}
        {isAdmin && (
          <div className="mb-8">
            {!showUpload ? (
              <button
                onClick={() => setShowUpload(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload className="w-4 h-4" /> Upload File
              </button>
            ) : (
              <div className="bg-gray-800 text-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5" /> Upload to Archive
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input
                    type="text"
                    placeholder="File title (e.g. Anatomy Notes)"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="md:col-span-2 px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400"
                  />
                  <select
                    value={uploadSubject}
                    onChange={(e) => setUploadSubject(e.target.value as Subject)}
                    className="px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white"
                  >
                    <option value="Medicine">Medicine</option>
                    <option value="Dentistry">Dentistry</option>
                    <option value="Engineering">Engineering</option>
                    <option value="General">General</option>
                  </select>
                  <input
                    type="file"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white text-sm"
                  />
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleUpload}
                    disabled={uploading || !uploadFile || !uploadTitle}
                    className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                  <button
                    onClick={() => setShowUpload(false)}
                    className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Filter className="w-5 h-5 text-gray-400 self-center" />
          {SUBJECTS.map((subject) => (
            <button
              key={subject}
              onClick={() => setActiveFilter(subject)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === subject
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {subject !== 'All' && subjectIcons[subject]} {subject}
            </button>
          ))}
        </div>

        {/* File Grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading archive...</div>
        ) : files.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No files found{activeFilter !== 'All' ? ` in ${activeFilter}` : ''}.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {files.map((file) => (
              <div
                key={file.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-3">{subjectIcons[file.subject] || '📄'}</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{file.title}</h3>
                <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded mb-4">
                  {file.subject}
                </span>
                <div>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4" /> Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-12">
          This archive is a student-led initiative for educational purposes only. All materials are notes and summaries created by students. We do not host copyrighted textbooks.
        </p>
      </div>
    </div>
  );
}
