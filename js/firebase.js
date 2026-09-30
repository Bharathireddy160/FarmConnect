// ==========================================
// FarmConnect - Firebase Configuration
// ==========================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {
    getStorage
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js";


// ==========================================
// FIREBASE CONFIGURATION
// ==========================================

const firebaseConfig = {

    apiKey: "AIzaSyBFjQFPOmxJ3xkuYuVtgr8Mno0ao6NQ8aE",

    authDomain:
        "farmconnect-f63ce.firebaseapp.com",

    projectId:
        "farmconnect-f63ce",

    storageBucket:
        "farmconnect-f63ce.firebasestorage.app",

    messagingSenderId:
        "822199312897",

    appId:
        "1:822199312897:web:71f3af862484066c2cd600",

    measurementId:
        "G-EBQ5D99NDJ"
};


// ==========================================
// INITIALIZE FIREBASE
// ==========================================

const app =
    initializeApp(firebaseConfig);


// ==========================================
// FIREBASE SERVICES
// ==========================================

const auth =
    getAuth(app);

const db =
    getFirestore(app);

const storage =
    getStorage(app);


// ==========================================
// EXPORT
// ==========================================

export {
    app,
    auth,
    db,
    storage
};