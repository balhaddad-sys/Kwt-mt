/**
 * Firebase Configuration for Admin CMS
 *
 * IMPORTANT: Replace these values with your actual Firebase project credentials
 * You can find these in your Firebase Console > Project Settings > General
 */

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase (will be used by admin pages)
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
}
