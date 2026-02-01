import { useState, useEffect } from 'react';
import {
  Users,
  PlusCircle,
  Edit2,
  Trash2,
  GripVertical,
  X,
  Check,
  AlertCircle,
  Mail,
  Upload,
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
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
  writeBatch,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { TeamMember } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface TeamFormData {
  name: string;
  role: string;
  position: string;
  bio: string;
  email: string;
  photoURL: string;
  linkedin: string;
  twitter: string;
  instagram: string;
  isActive: boolean;
}

const defaultFormData: TeamFormData = {
  name: '',
  role: '',
  position: '',
  bio: '',
  email: '',
  photoURL: '',
  linkedin: '',
  twitter: '',
  instagram: '',
  isActive: true,
};

const positionOptions = [
  'President',
  'Vice President',
  'Secretary',
  'Treasurer',
  'Events Coordinator',
  'Communications Officer',
  'Media Manager',
  'Member Relations',
  'Academic Liaison',
  'Sports Coordinator',
  'Cultural Affairs',
  'Committee Member',
];

export default function TeamManager() {
  const { currentUser } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState<TeamFormData>(defaultFormData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [reordering, setReordering] = useState(false);

  // Fetch team members from Firestore
  useEffect(() => {
    const teamQuery = query(
      collection(db, 'team'),
      orderBy('order', 'asc')
    );

    const unsubscribe = onSnapshot(
      teamQuery,
      (snapshot) => {
        const members: TeamMember[] = [];
        snapshot.forEach((doc) => {
          members.push({
            id: doc.id,
            ...doc.data(),
          } as TeamMember);
        });
        setTeamMembers(members);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching team:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    setUploadingPhoto(true);
    setError(null);

    try {
      const timestamp = Date.now();
      const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const storageRef = ref(storage, `team/${filename}`);

      const uploadTask = await uploadBytesResumable(storageRef, file);
      const downloadURL = await getDownloadURL(uploadTask.ref);

      setFormData((prev) => ({ ...prev, photoURL: downloadURL }));
    } catch (err) {
      console.error('Error uploading photo:', err);
      setError('Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setSaving(true);
    setError(null);

    try {
      const memberData = {
        name: formData.name,
        role: formData.role,
        position: formData.position,
        bio: formData.bio,
        email: formData.email,
        photoURL: formData.photoURL,
        socialLinks: {
          linkedin: formData.linkedin,
          twitter: formData.twitter,
          instagram: formData.instagram,
        },
        isActive: formData.isActive,
        updatedAt: Timestamp.now(),
      };

      if (editingMember) {
        await updateDoc(doc(db, 'team', editingMember.id), memberData);
      } else {
        await addDoc(collection(db, 'team'), {
          ...memberData,
          order: teamMembers.length,
          createdAt: Timestamp.now(),
        });
      }

      setShowForm(false);
      setEditingMember(null);
      setFormData(defaultFormData);
    } catch (err) {
      console.error('Error saving team member:', err);
      setError('Failed to save team member. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      role: member.role,
      position: member.position,
      bio: member.bio,
      email: member.email || '',
      photoURL: member.photoURL || '',
      linkedin: member.socialLinks?.linkedin || '',
      twitter: member.socialLinks?.twitter || '',
      instagram: member.socialLinks?.instagram || '',
      isActive: member.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (memberId: string) => {
    try {
      await deleteDoc(doc(db, 'team', memberId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting team member:', err);
    }
  };

  const handleAddNew = () => {
    setEditingMember(null);
    setFormData(defaultFormData);
    setShowForm(true);
  };

  const handleReorder = async (newOrder: TeamMember[]) => {
    setTeamMembers(newOrder);
  };

  const saveReorder = async () => {
    setReordering(true);
    try {
      const batch = writeBatch(db);
      teamMembers.forEach((member, index) => {
        batch.update(doc(db, 'team', member.id), { order: index });
      });
      await batch.commit();
    } catch (err) {
      console.error('Error saving order:', err);
      setError('Failed to save order');
    } finally {
      setReordering(false);
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
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h2 className="text-lg font-display font-bold text-neutral-900 dark:text-white">
              Team Manager
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Manage leadership team profiles
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={saveReorder}
            disabled={reordering}
          >
            {reordering ? 'Saving...' : 'Save Order'}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleAddNew}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Add Member
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Team Members Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
        </div>
      ) : teamMembers.length === 0 ? (
        <Card padding="lg">
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-neutral-400 mb-4" />
            <p className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
              No team members yet
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              Add your first team member to get started
            </p>
            <Button variant="primary" size="sm" onClick={handleAddNew}>
              Add Team Member
            </Button>
          </div>
        </Card>
      ) : (
        <Card padding="md">
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
            Drag to reorder team members, then click "Save Order"
          </p>
          <Reorder.Group
            axis="y"
            values={teamMembers}
            onReorder={handleReorder}
            className="space-y-3"
          >
            {teamMembers.map((member) => (
              <Reorder.Item
                key={member.id}
                value={member}
                className="flex items-center gap-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg cursor-move"
              >
                <GripVertical className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                {member.photoURL ? (
                  <img
                    src={member.photoURL}
                    alt={member.name}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-500 font-semibold text-lg">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-neutral-900 dark:text-white">
                      {member.name}
                    </h4>
                    {!member.isActive && (
                      <span className="px-2 py-0.5 bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 rounded text-xs">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {member.position}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="p-1.5 text-neutral-500 hover:text-primary-500 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => handleEdit(member)}
                    className="p-1.5 text-neutral-500 hover:text-primary-500 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(member.id)}
                    className="p-1.5 text-neutral-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </Card>
      )}

      {/* Team Member Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-neutral-800 rounded-xl p-6 max-w-lg w-full shadow-xl my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  {editingMember ? 'Edit Team Member' : 'Add Team Member'}
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-1 text-neutral-500 hover:text-neutral-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Photo Upload */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {formData.photoURL ? (
                      <img
                        src={formData.photoURL}
                        alt="Preview"
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                        <Users className="w-8 h-8 text-neutral-400" />
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0 p-1.5 bg-primary-500 text-white rounded-full cursor-pointer hover:bg-primary-600 transition-colors">
                      <Upload className="w-3 h-3" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    <p className="font-medium text-neutral-900 dark:text-white">Profile Photo</p>
                    <p>Click the icon to upload</p>
                    {uploadingPhoto && <p className="text-primary-500">Uploading...</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter full name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Position *
                    </label>
                    <select
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select position</option>
                      {positionOptions.map((pos) => (
                        <option key={pos} value={pos}>
                          {pos}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Role/Title
                    </label>
                    <input
                      type="text"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g., Executive Board"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Bio (max 200 chars)
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    maxLength={200}
                    rows={3}
                    className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    placeholder="Brief bio..."
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    {formData.bio.length}/200 characters
                  </p>
                </div>

                {/* Social Links */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Social Links (optional)
                  </p>
                  <input
                    type="url"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="LinkedIn URL"
                  />
                  <input
                    type="url"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Instagram URL"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">
                    Active team member (visible on website)
                  </span>
                </label>

                <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={saving || uploadingPhoto}
                    leftIcon={saving ? undefined : <Check className="w-4 h-4" />}
                  >
                    {saving ? 'Saving...' : editingMember ? 'Update' : 'Add Member'}
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
                Remove Team Member?
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                This will remove the team member from the website.
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
                  onClick={() => handleDelete(deleteConfirm)}
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
