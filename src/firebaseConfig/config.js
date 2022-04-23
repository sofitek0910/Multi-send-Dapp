import { initializeApp } from 'firebase/app';
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyA-oAOMfsktH01V6jFgcelTBZxAQkDBt44",
  authDomain: "multi-send-dapp.firebaseapp.com",
  databaseURL: "https://multi-send-dapp-default-rtdb.firebaseio.com",
  projectId: "multi-send-dapp",
  storageBucket: "multi-send-dapp.appspot.com",
  messagingSenderId: "454419980357",
  appId: "1:454419980357:web:5e5fa5813fae59ce1b432c",
  measurementId: "G-YW6CSX5P4Z"
};

const app = initializeApp(firebaseConfig);

// Get a reference to the database service
const db = getDatabase(app);
export default db;