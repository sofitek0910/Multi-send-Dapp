import { initializeApp } from 'firebase/app';
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAlkF-FiJacgWIjTtGfrWsE45gRwN-yT4w",
  authDomain: "muti-sender.firebaseapp.com",
  databaseURL: "https://muti-sender-default-rtdb.firebaseio.com",
  projectId: "muti-sender",
  storageBucket: "muti-sender.appspot.com",
  messagingSenderId: "723770660495",
  appId: "1:723770660495:web:68ac6547167faa6a8242fa",
  measurementId: "G-GTX871GXVE"
};

const app = initializeApp(firebaseConfig);

// Get a reference to the database service
const db = getDatabase(app);
export default db;