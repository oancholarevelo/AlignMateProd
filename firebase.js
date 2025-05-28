// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD8E-haIMUsm5HTXLoEf9ho3yLYq9HJm0A",
  authDomain: "test-alignmate.firebaseapp.com",
  databaseURL: "https://test-alignmate-default-rtdb.firebaseio.com",
  projectId: "test-alignmate",
  storageBucket: "test-alignmate.firebasestorage.app",
  messagingSenderId: "32530267491",
  appId: "1:32530267491:web:97e813ac71ff8bd54c2756",
  measurementId: "G-QQMG1H34WR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getDatabase(app); // Initialize database

export { auth, database };