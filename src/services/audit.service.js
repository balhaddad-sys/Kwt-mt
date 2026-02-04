/**
 * Audit Trail Service
 * Logs all clinically significant actions for compliance
 * HIPAA/regulatory requirement
 */
import { auth } from './firebase';

const AUDIT_STORE = 'audit_log';
const MAX_LOCAL_LOGS = 1000;
const SYNC_BATCH_SIZE = 50;

// In-memory store (would use IndexedDB in production)
let localLogs = [];

export const Audit = {
  /**
   * Log an auditable event
   * @param {string} action - The action type
   * @param {string} entityType - Type of entity (patient, task, etc.)
   * @param {string} entityId - ID of the entity
   * @param {object} details - Additional details (no PHI!)
   */
  async log(action, entityType, entityId, details = {}) {
    const entry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      action,
      entityType,
      entityId,
      userId: auth.currentUser?.uid || null,
      userEmail: auth.currentUser?.email || null,
      deviceId: await this._getDeviceId(),
      sessionId: this._getSessionId(),
      details: this._sanitizeDetails(details),
      synced: false
    };

    // Store locally
    await this._storeLocal(entry);

    // Attempt sync (non-blocking)
    this._syncToServer().catch(console.error);

    return entry.id;
  },

  /**
   * Pre-defined action types for consistency
   */
  actions: {
    // Patient actions
    PATIENT_VIEW: 'patient.view',
    PATIENT_CREATE: 'patient.create',
    PATIENT_UPDATE: 'patient.update',
    PATIENT_DISCHARGE: 'patient.discharge',
    PATIENT_DELETE: 'patient.delete',

    // Task actions
    TASK_CREATE: 'task.create',
    TASK_COMPLETE: 'task.complete',
    TASK_DELETE: 'task.delete',

    // Handover actions
    HANDOVER_SEND: 'handover.send',
    HANDOVER_RECEIVE: 'handover.receive',
    HANDOVER_DECLINE: 'handover.decline',

    // AI actions
    AI_QUERY: 'ai.query',
    AI_FEEDBACK: 'ai.feedback',

    // Auth actions
    AUTH_LOGIN: 'auth.login',
    AUTH_LOGOUT: 'auth.logout',
    AUTH_FAILED: 'auth.failed',

    // Data actions
    DATA_EXPORT: 'data.export',
    DATA_IMPORT: 'data.import',

    // Access actions
    RECORD_ACCESS: 'record.access',
    PHI_VIEW: 'phi.view'
  },

  /**
   * Convenience methods for common actions
   */
  patientViewed(patientId) {
    return this.log(this.actions.PATIENT_VIEW, 'patient', patientId);
  },

  patientCreated(patientId, source = 'manual') {
    return this.log(this.actions.PATIENT_CREATE, 'patient', patientId, { source });
  },

  patientUpdated(patientId, fields) {
    return this.log(this.actions.PATIENT_UPDATE, 'patient', patientId, {
      fieldsChanged: fields
    });
  },

  taskCompleted(taskId, patientId) {
    return this.log(this.actions.TASK_COMPLETE, 'task', taskId, { patientId });
  },

  aiQueryMade(queryType, hasContext) {
    return this.log(this.actions.AI_QUERY, 'ai', null, {
      queryType,
      includedPatientContext: hasContext
    });
  },

  /**
   * Get recent audit logs (for debugging/display)
   */
  async getRecent(limit = 50) {
    return localLogs
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  },

  /**
   * Export audit log for compliance
   */
  async exportLogs(startDate, endDate) {
    return localLogs.filter(entry =>
      entry.timestamp >= startDate.getTime() &&
      entry.timestamp <= endDate.getTime()
    );
  },

  // === Private Methods ===

  /**
   * Remove any potential PHI from details
   */
  _sanitizeDetails(details) {
    const sanitized = { ...details };

    // Remove any field that might contain PHI
    const phiFields = ['name', 'mrn', 'dob', 'address', 'phone', 'email', 'ssn'];
    phiFields.forEach(field => delete sanitized[field]);

    // Truncate any string values
    for (const key of Object.keys(sanitized)) {
      if (typeof sanitized[key] === 'string' && sanitized[key].length > 100) {
        sanitized[key] = sanitized[key].slice(0, 100) + '...';
      }
    }

    return sanitized;
  },

  /**
   * Store entry locally
   */
  async _storeLocal(entry) {
    localLogs.push(entry);

    // Also persist to localStorage for durability
    try {
      const stored = JSON.parse(localStorage.getItem(AUDIT_STORE) || '[]');
      stored.push(entry);

      // Prune old synced entries if over limit
      if (stored.length > MAX_LOCAL_LOGS) {
        const synced = stored.filter(e => e.synced);
        const unsynced = stored.filter(e => !e.synced);
        const toKeep = synced.slice(-Math.floor(MAX_LOCAL_LOGS / 2));
        localStorage.setItem(AUDIT_STORE, JSON.stringify([...toKeep, ...unsynced]));
      } else {
        localStorage.setItem(AUDIT_STORE, JSON.stringify(stored));
      }
    } catch (e) {
      console.warn('[Audit] Local storage write failed:', e);
    }
  },

  /**
   * Sync logs to server (disabled until Cloud Functions are deployed)
   */
  async _syncToServer() {
    // Audit logs are stored locally only.
    // To enable server sync, deploy the syncAuditLogs Cloud Function
    // and uncomment the code below.
    return;

    /*
    const unsynced = localLogs
      .filter(e => !e.synced)
      .slice(0, SYNC_BATCH_SIZE);

    if (unsynced.length === 0) return;

    try {
      const { getFunctions, httpsCallable } = await import('firebase/functions');
      const { app } = await import('./firebase');

      const functions = getFunctions(app);
      const syncAuditLogs = httpsCallable(functions, 'syncAuditLogs');
      await syncAuditLogs({ logs: unsynced });

      // Mark as synced
      for (const entry of unsynced) {
        entry.synced = true;
      }

    } catch (error) {
      console.warn('[Audit] Sync failed, will retry:', error);
    }
    */
  },

  /**
   * Get or create device ID
   */
  async _getDeviceId() {
    let deviceId = localStorage.getItem('medward-device-id');
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem('medward-device-id', deviceId);
    }
    return deviceId;
  },

  /**
   * Get session ID (new per browser session)
   */
  _getSessionId() {
    if (!window._auditSessionId) {
      window._auditSessionId = crypto.randomUUID();
    }
    return window._auditSessionId;
  },

  /**
   * Load persisted logs on init
   */
  init() {
    try {
      const stored = JSON.parse(localStorage.getItem(AUDIT_STORE) || '[]');
      localLogs = stored;
    } catch (e) {
      localLogs = [];
    }
  }
};

// Auto-initialize on import
Audit.init();
