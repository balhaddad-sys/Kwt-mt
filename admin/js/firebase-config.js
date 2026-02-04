/**
 * Firebase Configuration for Admin CMS
 * KWT-MT (Kuwaiti Student Association in Malta)
 * Project ID: kwt-mt
 */

const firebaseConfig = {
    apiKey: "AIzaSyAMiL3f5uie0io5hsHBiHhHIq2q5Vv-WbA",
    authDomain: "kwt-mt.firebaseapp.com",
    projectId: "kwt-mt",
    storageBucket: "kwt-mt.firebasestorage.app",
    messagingSenderId: "253960446965",
    appId: "1:253960446965:web:66836ed17301968f6436bc"
};

// Initialize Firebase (will be used by admin pages)
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
}
