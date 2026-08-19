/**
 * Firebase Configuration - JualBeliSewaRumah
 * Login hanya dengan Google & Facebook
 */

const firebaseConfig = {
  apiKey: "AIzaSyDYvXGHnYkNlkd-puzR4f8AyUtU-wrvyFk",
  authDomain: "jualbelisewarumah-3de0b.firebaseapp.com",
  databaseURL: "https://jualbelisewarumah-3de0b-default-rtdb.firebaseio.com",
  projectId: "jualbelisewarumah-3de0b",
  storageBucket: "jualbelisewarumah-3de0b.firebasestorage.app",
  messagingSenderId: "88220462362",
  appId: "1:88220462362:web:d2f824442c16ac9195d0a3",
  measurementId: "G-YTCFEX2VX8"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const database = firebase.database();

// Providers
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

const facebookProvider = new firebase.auth.FacebookAuthProvider();
facebookProvider.setCustomParameters({ display: 'popup' });
