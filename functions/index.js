const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

/**
 * Set custom role claims for a user
 * Only callable by super_admin users
 *
 * Usage from frontend:
 * const setAdminRole = firebase.functions().httpsCallable('setAdminRole');
 * const result = await setAdminRole({ uid: 'user-uid', role: 'admin' });
 */
exports.setAdminRole = functions.https.onCall(async (data, context) => {
    // Check if the caller is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'You must be logged in to call this function'
        );
    }

    // Check if the caller has super_admin role
    if (!context.auth.token.role || context.auth.token.role !== 'super_admin') {
        throw new functions.https.HttpsError(
            'permission-denied',
            'Only super_admin users can set roles'
        );
    }

    const { uid, role } = data;

    // Validate inputs
    if (!uid || typeof uid !== 'string') {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'The uid parameter must be a valid string'
        );
    }

    if (!role || !['editor', 'admin', 'super_admin'].includes(role)) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'The role must be one of: editor, admin, super_admin'
        );
    }

    try {
        // Set custom claims
        await admin.auth().setCustomUserClaims(uid, { role });

        // Log the action
        await admin.firestore().collection('audit_logs').add({
            action: 'role_change',
            targetUserId: uid,
            newRole: role,
            performedBy: context.auth.uid,
            performedByEmail: context.auth.token.email,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        return {
            success: true,
            message: `Role ${role} set for user ${uid}`
        };
    } catch (error) {
        console.error('Error setting custom claims:', error);
        throw new functions.https.HttpsError(
            'internal',
            'Failed to set user role: ' + error.message
        );
    }
});

/**
 * Get user role information
 * Only callable by authenticated users
 *
 * Usage from frontend:
 * const getUserRole = firebase.functions().httpsCallable('getUserRole');
 * const result = await getUserRole({ uid: 'user-uid' });
 */
exports.getUserRole = functions.https.onCall(async (data, context) => {
    // Check if the caller is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'You must be logged in to call this function'
        );
    }

    // Only admins can check other users' roles
    const targetUid = data.uid || context.auth.uid;
    if (targetUid !== context.auth.uid && (!context.auth.token.role || !['admin', 'super_admin'].includes(context.auth.token.role))) {
        throw new functions.https.HttpsError(
            'permission-denied',
            'You can only check your own role unless you are an admin'
        );
    }

    try {
        const user = await admin.auth().getUser(targetUid);
        return {
            uid: user.uid,
            email: user.email,
            role: user.customClaims?.role || null,
            emailVerified: user.emailVerified,
            disabled: user.disabled
        };
    } catch (error) {
        console.error('Error getting user:', error);
        throw new functions.https.HttpsError(
            'internal',
            'Failed to get user information: ' + error.message
        );
    }
});

/**
 * List all users with their roles
 * Only callable by admin and super_admin users
 *
 * Usage from frontend:
 * const listUsers = firebase.functions().httpsCallable('listUsers');
 * const result = await listUsers();
 */
exports.listUsers = functions.https.onCall(async (data, context) => {
    // Check if the caller is authenticated and has admin role
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'You must be logged in to call this function'
        );
    }

    if (!context.auth.token.role || !['admin', 'super_admin'].includes(context.auth.token.role)) {
        throw new functions.https.HttpsError(
            'permission-denied',
            'Only admin users can list all users'
        );
    }

    try {
        const listUsersResult = await admin.auth().listUsers(1000);
        const users = listUsersResult.users.map(user => ({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            role: user.customClaims?.role || null,
            emailVerified: user.emailVerified,
            disabled: user.disabled,
            creationTime: user.metadata.creationTime,
            lastSignInTime: user.metadata.lastSignInTime
        }));

        return { users };
    } catch (error) {
        console.error('Error listing users:', error);
        throw new functions.https.HttpsError(
            'internal',
            'Failed to list users: ' + error.message
        );
    }
});

/**
 * Remove user role (set role to null)
 * Only callable by super_admin users
 *
 * Usage from frontend:
 * const removeUserRole = firebase.functions().httpsCallable('removeUserRole');
 * const result = await removeUserRole({ uid: 'user-uid' });
 */
exports.removeUserRole = functions.https.onCall(async (data, context) => {
    // Check if the caller is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'You must be logged in to call this function'
        );
    }

    // Check if the caller has super_admin role
    if (!context.auth.token.role || context.auth.token.role !== 'super_admin') {
        throw new functions.https.HttpsError(
            'permission-denied',
            'Only super_admin users can remove roles'
        );
    }

    const { uid } = data;

    // Validate inputs
    if (!uid || typeof uid !== 'string') {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'The uid parameter must be a valid string'
        );
    }

    // Prevent removing own role
    if (uid === context.auth.uid) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'You cannot remove your own role'
        );
    }

    try {
        // Remove custom claims by setting them to null
        await admin.auth().setCustomUserClaims(uid, { role: null });

        // Log the action
        await admin.firestore().collection('audit_logs').add({
            action: 'role_remove',
            targetUserId: uid,
            performedBy: context.auth.uid,
            performedByEmail: context.auth.token.email,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        return {
            success: true,
            message: `Role removed for user ${uid}`
        };
    } catch (error) {
        console.error('Error removing custom claims:', error);
        throw new functions.https.HttpsError(
            'internal',
            'Failed to remove user role: ' + error.message
        );
    }
});

/**
 * DANGEROUS: Create first super admin
 * This is an HTTP endpoint (not callable) for initial setup only
 * Should be secured or removed after first use
 *
 * Usage: GET https://your-project.cloudfunctions.net/createFirstAdmin?uid=USER_UID&secret=YOUR_SECRET
 *
 * IMPORTANT: Set FIRST_ADMIN_SECRET in Firebase Functions config:
 * firebase functions:config:set admin.secret="your-secret-here"
 */
exports.createFirstAdmin = functions.https.onRequest(async (req, res) => {
    // SECURITY: Check for a secret key (set in Firebase Functions config)
    const secret = functions.config().admin?.secret || 'CHANGE_THIS_SECRET';
    const providedSecret = req.query.secret;

    if (providedSecret !== secret) {
        res.status(403).send('Forbidden: Invalid secret');
        return;
    }

    const uid = req.query.uid;

    if (!uid) {
        res.status(400).send('Bad Request: Missing uid parameter');
        return;
    }

    try {
        // Set super_admin role
        await admin.auth().setCustomUserClaims(uid, { role: 'super_admin' });

        // Log the action
        await admin.firestore().collection('audit_logs').add({
            action: 'first_admin_created',
            targetUserId: uid,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        res.send(`SUCCESS: Super admin role set for user ${uid}. Please secure or remove this function now.`);
    } catch (error) {
        console.error('Error creating first admin:', error);
        res.status(500).send('Error: ' + error.message);
    }
});

/**
 * Firestore trigger: Log page changes
 * Automatically logs when pages are created, updated, or deleted
 */
exports.logPageChanges = functions.firestore
    .document('pages/{pageId}')
    .onWrite(async (change, context) => {
        const pageId = context.params.pageId;
        const before = change.before.data();
        const after = change.after.data();

        let action = 'unknown';
        if (!before && after) {
            action = 'page_created';
        } else if (before && !after) {
            action = 'page_deleted';
        } else if (before && after) {
            action = 'page_updated';
        }

        try {
            await admin.firestore().collection('audit_logs').add({
                action: action,
                pageSlug: pageId,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                automated: true
            });
        } catch (error) {
            console.error('Error logging page change:', error);
        }
    });

/**
 * HTTP endpoint to refresh user token claims
 * Call this after changing a user's role to force token refresh
 *
 * Usage: POST https://your-project.cloudfunctions.net/refreshUserToken
 * Body: { "uid": "user-uid" }
 * Headers: Authorization: Bearer <admin-token>
 */
exports.refreshUserToken = functions.https.onRequest(async (req, res) => {
    // Enable CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    // Verify the request is from an authenticated admin
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).send('Unauthorized');
        return;
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        if (!decodedToken.role || !['admin', 'super_admin'].includes(decodedToken.role)) {
            res.status(403).send('Forbidden: Admin role required');
            return;
        }

        const uid = req.body.uid;
        if (!uid) {
            res.status(400).send('Bad Request: Missing uid');
            return;
        }

        // Revoke refresh tokens to force re-authentication
        await admin.auth().revokeRefreshTokens(uid);

        res.send({ success: true, message: 'User tokens revoked. User will need to re-authenticate.' });
    } catch (error) {
        console.error('Error refreshing user token:', error);
        res.status(500).send('Error: ' + error.message);
    }
});
