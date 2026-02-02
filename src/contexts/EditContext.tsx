import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { doc, setDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../services/firebase';
import { useAuth } from './AuthContext';

// Types for pending changes
export interface PendingChange {
  collection: string;
  documentId: string;
  field: string;
  oldValue: string;
  newValue: string;
  type: 'text' | 'image';
  timestamp: Date;
}

export interface PendingImageUpload {
  id: string;
  file: File;
  collection: string;
  documentId: string;
  field: string;
  previewUrl: string;
}

interface EditContextType {
  isEditMode: boolean;
  toggleEditMode: () => void;
  pendingChanges: Map<string, PendingChange>;
  pendingUploads: Map<string, PendingImageUpload>;
  addChange: (key: string, change: PendingChange) => void;
  removeChange: (key: string) => void;
  addImageUpload: (upload: PendingImageUpload) => void;
  removeImageUpload: (id: string) => void;
  hasChanges: boolean;
  changesCount: number;
  publishChanges: () => Promise<void>;
  discardChanges: () => void;
  isPublishing: boolean;
  getChangeKey: (collection: string, documentId: string, field: string) => string;
  hasPendingChange: (key: string) => boolean;
}

const EditContext = createContext<EditContextType | undefined>(undefined);

export function EditProvider({ children }: { children: React.ReactNode }) {
  const { isAdmin, currentUser } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Map<string, PendingChange>>(new Map());
  const [pendingUploads, setPendingUploads] = useState<Map<string, PendingImageUpload>>(new Map());
  const [isPublishing, setIsPublishing] = useState(false);

  // Ref to track mounted state
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const toggleEditMode = useCallback(() => {
    if (!isAdmin) return;
    setIsEditMode(prev => !prev);
  }, [isAdmin]);

  const getChangeKey = useCallback((collection: string, documentId: string, field: string) => {
    return `${collection}:${documentId}:${field}`;
  }, []);

  const addChange = useCallback((key: string, change: PendingChange) => {
    setPendingChanges(prev => {
      const next = new Map(prev);
      next.set(key, change);
      return next;
    });
  }, []);

  const removeChange = useCallback((key: string) => {
    setPendingChanges(prev => {
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const addImageUpload = useCallback((upload: PendingImageUpload) => {
    setPendingUploads(prev => {
      const next = new Map(prev);
      next.set(upload.id, upload);
      return next;
    });
  }, []);

  const removeImageUpload = useCallback((id: string) => {
    setPendingUploads(prev => {
      const next = new Map(prev);
      const upload = next.get(id);
      if (upload) {
        URL.revokeObjectURL(upload.previewUrl);
      }
      next.delete(id);
      return next;
    });
  }, []);

  const hasPendingChange = useCallback((key: string) => {
    return pendingChanges.has(key);
  }, [pendingChanges]);

  const publishChanges = useCallback(async () => {
    if (!currentUser || pendingChanges.size === 0 && pendingUploads.size === 0) return;

    setIsPublishing(true);

    try {
      // First, upload all pending images
      const uploadResults = new Map<string, string>();

      for (const [id, upload] of pendingUploads) {
        // Check if still mounted before each upload
        if (!isMountedRef.current) return;

        const storageRef = ref(storage, `content/${upload.collection}/${upload.documentId}/${upload.field}_${Date.now()}`);
        const snapshot = await uploadBytes(storageRef, upload.file);

        // Check if still mounted after upload
        if (!isMountedRef.current) return;

        const downloadURL = await getDownloadURL(snapshot.ref);
        uploadResults.set(id, downloadURL);
      }

      // Check if still mounted before processing changes
      if (!isMountedRef.current) return;

      // Group changes by document
      const documentChanges = new Map<string, { collection: string; documentId: string; changes: Record<string, unknown> }>();

      // Process text changes
      for (const [key, change] of pendingChanges) {
        const docKey = `${change.collection}:${change.documentId}`;

        if (!documentChanges.has(docKey)) {
          documentChanges.set(docKey, {
            collection: change.collection,
            documentId: change.documentId,
            changes: {}
          });
        }

        documentChanges.get(docKey)!.changes[change.field] = change.newValue;
      }

      // Process image uploads
      for (const [id, upload] of pendingUploads) {
        const docKey = `${upload.collection}:${upload.documentId}`;
        const downloadURL = uploadResults.get(id);

        if (!documentChanges.has(docKey)) {
          documentChanges.set(docKey, {
            collection: upload.collection,
            documentId: upload.documentId,
            changes: {}
          });
        }

        documentChanges.get(docKey)!.changes[upload.field] = downloadURL;
      }

      // Use batch write to save all changes
      const batch = writeBatch(db);

      for (const [, docData] of documentChanges) {
        const docRef = doc(db, docData.collection, docData.documentId);
        batch.set(docRef, {
          ...docData.changes,
          updatedAt: serverTimestamp(),
          updatedBy: currentUser.uid
        }, { merge: true });
      }

      await batch.commit();

      // Check if still mounted before updating state
      if (!isMountedRef.current) return;

      // Clear pending changes and uploads
      setPendingChanges(new Map());

      // Revoke all preview URLs
      for (const [, upload] of pendingUploads) {
        URL.revokeObjectURL(upload.previewUrl);
      }
      setPendingUploads(new Map());

      console.log('Published all changes successfully');
    } catch (error) {
      console.error('Error publishing changes:', error);
      throw error;
    } finally {
      // Check if still mounted before updating state
      if (isMountedRef.current) {
        setIsPublishing(false);
      }
    }
  }, [currentUser, pendingChanges, pendingUploads]);

  const discardChanges = useCallback(() => {
    // Revoke all preview URLs
    for (const [, upload] of pendingUploads) {
      URL.revokeObjectURL(upload.previewUrl);
    }
    setPendingChanges(new Map());
    setPendingUploads(new Map());
  }, [pendingUploads]);

  const hasChanges = pendingChanges.size > 0 || pendingUploads.size > 0;
  const changesCount = pendingChanges.size + pendingUploads.size;

  const value = {
    isEditMode: isAdmin && isEditMode,
    toggleEditMode,
    pendingChanges,
    pendingUploads,
    addChange,
    removeChange,
    addImageUpload,
    removeImageUpload,
    hasChanges,
    changesCount,
    publishChanges,
    discardChanges,
    isPublishing,
    getChangeKey,
    hasPendingChange,
  };

  return (
    <EditContext.Provider value={value}>
      {children}
    </EditContext.Provider>
  );
}

export function useEdit() {
  const context = useContext(EditContext);
  if (context === undefined) {
    throw new Error('useEdit must be used within an EditProvider');
  }
  return context;
}
